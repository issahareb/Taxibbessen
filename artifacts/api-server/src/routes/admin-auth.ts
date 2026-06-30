import { Router, type Request, type Response } from "express";
import {
  ADMIN_COOKIE_NAME,
  configureAdminPassword,
  createAdminSession,
  destroyAdminSession,
  getAdminCookieOptions,
  getAdminCredential,
  getAdminSession,
  hasAdminSetupKey,
  isValidCsrfToken,
  verifyAdminPassword,
} from "../lib/admin-auth";

const router = Router();
const MAX_FAILURES = 5;
const FAILURE_WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 30 * 60 * 1000;

type LoginAttempt = {
  failures: number;
  windowStartedAt: number;
  lockedUntil: number;
};

const loginAttempts = new Map<string, LoginAttempt>();

function clientKey(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function currentAttempt(key: string): LoginAttempt {
  const now = Date.now();
  const existing = loginAttempts.get(key);
  if (!existing || now - existing.windowStartedAt > FAILURE_WINDOW_MS) {
    const fresh = { failures: 0, windowStartedAt: now, lockedUntil: 0 };
    loginAttempts.set(key, fresh);
    return fresh;
  }
  return existing;
}

function retryAfterSeconds(key: string): number {
  const attempt = currentAttempt(key);
  return Math.max(0, Math.ceil((attempt.lockedUntil - Date.now()) / 1000));
}

function recordFailure(key: string): void {
  const attempt = currentAttempt(key);
  attempt.failures += 1;
  if (attempt.failures >= MAX_FAILURES) {
    attempt.lockedUntil = Date.now() + LOCKOUT_MS;
  }
  loginAttempts.set(key, attempt);
}

function clearFailures(key: string): void {
  loginAttempts.delete(key);
}

function setSessionCookie(res: Response, token: string): void {
  res.cookie(ADMIN_COOKIE_NAME, token, getAdminCookieOptions());
}

router.get("/admin/session", async (req, res) => {
  try {
    const credential = await getAdminCredential();
    if (!credential) {
      return res.status(503).json({ authenticated: false, setupRequired: true });
    }

    const session = await getAdminSession(req.cookies?.[ADMIN_COOKIE_NAME]);
    if (!session) {
      return res.status(401).json({ authenticated: false });
    }

    return res.json({ authenticated: true, csrfToken: session.csrfToken });
  } catch {
    return res.status(503).json({ authenticated: false, error: "Admin access is temporarily unavailable" });
  }
});

router.post("/admin/setup", async (req, res) => {
  const key = clientKey(req);
  const retryAfter = retryAfterSeconds(key);
  if (retryAfter > 0) {
    res.setHeader("Retry-After", String(retryAfter));
    return res.status(429).json({ error: "Too many failed attempts" });
  }

  const setupKey = typeof req.body?.setupKey === "string" ? req.body.setupKey : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!hasAdminSetupKey()) {
    return res.status(503).json({ error: "ADMIN_API_KEY is required for first-time setup" });
  }
  if (password.length < 12) {
    return res.status(400).json({ error: "Das Passwort muss mindestens 12 Zeichen lang sein." });
  }

  try {
    await configureAdminPassword(setupKey, password);
    const { token, session } = await createAdminSession();
    clearFailures(key);
    setSessionCookie(res, token);
    return res.status(201).json({ ok: true, csrfToken: session.csrfToken });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "ALREADY_CONFIGURED") {
      return res.status(409).json({ error: "Admin access is already configured" });
    }
    if (message === "INVALID_SETUP_KEY") {
      recordFailure(key);
      return res.status(401).json({ error: "Invalid setup key" });
    }
    return res.status(503).json({ error: "Admin setup failed" });
  }
});

router.post("/admin/login", async (req, res) => {
  const key = clientKey(req);
  const retryAfter = retryAfterSeconds(key);
  if (retryAfter > 0) {
    res.setHeader("Retry-After", String(retryAfter));
    return res.status(429).json({ error: "Too many failed attempts" });
  }

  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  try {
    const credential = await getAdminCredential();
    if (!credential) {
      return res.status(503).json({ error: "Admin setup required", setupRequired: true });
    }

    if (!(await verifyAdminPassword(password, credential.passwordHash))) {
      recordFailure(key);
      const lockedFor = retryAfterSeconds(key);
      if (lockedFor > 0) {
        res.setHeader("Retry-After", String(lockedFor));
        return res.status(429).json({ error: "Too many failed attempts" });
      }
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const { token, session } = await createAdminSession();
    clearFailures(key);
    setSessionCookie(res, token);
    return res.json({ ok: true, csrfToken: session.csrfToken });
  } catch {
    return res.status(503).json({ error: "Admin login is temporarily unavailable" });
  }
});

router.post("/admin/logout", async (req, res) => {
  const token = req.cookies?.[ADMIN_COOKIE_NAME] as string | undefined;
  const { maxAge: _maxAge, ...clearOptions } = getAdminCookieOptions();

  try {
    const session = await getAdminSession(token);
    const csrfToken = Array.isArray(req.headers["x-csrf-token"])
      ? req.headers["x-csrf-token"][0]
      : req.headers["x-csrf-token"];

    if (session && !isValidCsrfToken(session, csrfToken)) {
      return res.status(403).json({ error: "Invalid CSRF token" });
    }

    await destroyAdminSession(token);
    res.clearCookie(ADMIN_COOKIE_NAME, clearOptions);
    return res.json({ ok: true });
  } catch {
    res.clearCookie(ADMIN_COOKIE_NAME, clearOptions);
    return res.status(503).json({ error: "Logout failed safely" });
  }
});

export default router;
