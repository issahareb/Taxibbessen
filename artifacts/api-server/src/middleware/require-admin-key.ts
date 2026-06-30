import type { NextFunction, Request, Response } from "express";
import {
  ADMIN_COOKIE_NAME,
  getAdminSession,
  isValidAdminApiKey,
  isValidCsrfToken,
  type AdminSession,
} from "../lib/admin-auth";

function readHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function readBearerToken(req: Request): string | undefined {
  const authorization = readHeader(req.headers.authorization);
  return authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  const providedApiKey = readHeader(req.headers["x-admin-key"]) ?? readBearerToken(req);

  if (providedApiKey) {
    if (!process.env.ADMIN_API_KEY) {
      return res.status(503).json({ error: "Admin access is unavailable" });
    }
    if (!isValidAdminApiKey(providedApiKey)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.locals.adminAuthType = "api-key";
    return next();
  }

  try {
    const session = await getAdminSession(req.cookies?.[ADMIN_COOKIE_NAME]);
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    res.locals.adminAuthType = "session";
    res.locals.adminSession = session;
    return next();
  } catch {
    return res.status(503).json({ error: "Admin access is temporarily unavailable" });
  }
}

export function requireAdminCsrf(
  req: Request,
  res: Response,
  next: NextFunction,
): Response | void {
  if (res.locals.adminAuthType === "api-key") return next();

  const session = res.locals.adminSession as AdminSession | undefined;
  const csrfToken = readHeader(req.headers["x-csrf-token"]);
  if (!session || !isValidCsrfToken(session, csrfToken)) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }

  return next();
}

// Backward-compatible export for existing imports.
export const requireAdminKey = requireAdmin;
