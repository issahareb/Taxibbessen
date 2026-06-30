import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { CookieOptions } from "express";
import { adminCredentialsTable, adminSessionsTable, db } from "@workspace/db";
import { desc, eq, lt } from "drizzle-orm";

const scryptAsync = promisify(scryptCallback);
const PASSWORD_FORMAT = "scrypt-v1";
const PASSWORD_KEY_LENGTH = 64;
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export const ADMIN_COOKIE_NAME = "taxibb_admin_session";

export type AdminSession = {
  tokenHash: string;
  csrfToken: string;
  expiresAt: Date;
};

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function isValidAdminApiKey(provided: string | undefined): boolean {
  const expected = process.env.ADMIN_API_KEY;
  return Boolean(expected && provided && safeEqual(provided, expected));
}

export function hasAdminSetupKey(): boolean {
  return Boolean(process.env.ADMIN_API_KEY);
}

export async function hashAdminPassword(password: string): Promise<string> {
  if (password.length < 12) {
    throw new Error("Das Passwort muss mindestens 12 Zeichen lang sein.");
  }

  const salt = randomBytes(16);
  const derived = (await scryptAsync(password, salt, PASSWORD_KEY_LENGTH)) as Buffer;
  return [PASSWORD_FORMAT, salt.toString("base64url"), derived.toString("base64url")].join("$");
}

export async function verifyAdminPassword(password: string, encodedHash: string): Promise<boolean> {
  const [format, saltValue, expectedValue] = encodedHash.split("$");
  if (format !== PASSWORD_FORMAT || !saltValue || !expectedValue) return false;

  try {
    const salt = Buffer.from(saltValue, "base64url");
    const expected = Buffer.from(expectedValue, "base64url");
    const derived = (await scryptAsync(password, salt, expected.length)) as Buffer;
    return derived.length === expected.length && timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

export async function getAdminCredential(): Promise<{ id: number; passwordHash: string } | null> {
  const [credential] = await db
    .select({ id: adminCredentialsTable.id, passwordHash: adminCredentialsTable.passwordHash })
    .from(adminCredentialsTable)
    .orderBy(desc(adminCredentialsTable.id))
    .limit(1);

  return credential ?? null;
}

export async function configureAdminPassword(setupKey: string, password: string): Promise<void> {
  if (!isValidAdminApiKey(setupKey)) {
    throw new Error("INVALID_SETUP_KEY");
  }

  const existing = await getAdminCredential();
  if (existing) {
    throw new Error("ALREADY_CONFIGURED");
  }

  const passwordHash = await hashAdminPassword(password);
  await db.insert(adminCredentialsTable).values({ passwordHash });
}

export async function createAdminSession(): Promise<{ token: string; session: AdminSession }> {
  await deleteExpiredAdminSessions();

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const csrfToken = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(adminSessionsTable).values({
    tokenHash,
    csrfToken,
    expiresAt,
  });

  return { token, session: { tokenHash, csrfToken, expiresAt } };
}

export async function getAdminSession(token: string | undefined): Promise<AdminSession | null> {
  if (!token) return null;

  const tokenHash = hashToken(token);
  const [session] = await db
    .select({
      tokenHash: adminSessionsTable.tokenHash,
      csrfToken: adminSessionsTable.csrfToken,
      expiresAt: adminSessionsTable.expiresAt,
    })
    .from(adminSessionsTable)
    .where(eq(adminSessionsTable.tokenHash, tokenHash))
    .limit(1);

  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    await db.delete(adminSessionsTable).where(eq(adminSessionsTable.tokenHash, tokenHash));
    return null;
  }

  await db
    .update(adminSessionsTable)
    .set({ lastUsedAt: new Date() })
    .where(eq(adminSessionsTable.tokenHash, tokenHash));

  return session;
}

export async function destroyAdminSession(token: string | undefined): Promise<void> {
  if (!token) return;
  await db.delete(adminSessionsTable).where(eq(adminSessionsTable.tokenHash, hashToken(token)));
}

export async function deleteExpiredAdminSessions(): Promise<void> {
  await db.delete(adminSessionsTable).where(lt(adminSessionsTable.expiresAt, new Date()));
}

export function isValidCsrfToken(session: AdminSession, provided: string | undefined): boolean {
  return Boolean(provided && safeEqual(provided, session.csrfToken));
}

export function getAdminCookieOptions(): CookieOptions {
  const configuredSameSite = process.env.ADMIN_COOKIE_SAME_SITE?.toLowerCase();
  const sameSite: CookieOptions["sameSite"] =
    configuredSameSite === "strict" || configuredSameSite === "lax" || configuredSameSite === "none"
      ? configuredSameSite
      : process.env.NODE_ENV === "production"
        ? "none"
        : "lax";

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" || sameSite === "none",
    sameSite,
    maxAge: SESSION_TTL_MS,
    path: "/",
    ...(process.env.ADMIN_COOKIE_DOMAIN ? { domain: process.env.ADMIN_COOKIE_DOMAIN } : {}),
  };
}
