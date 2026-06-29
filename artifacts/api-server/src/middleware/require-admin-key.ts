import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

function readHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function matchesSecret(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

/**
 * Protects all endpoints that expose or modify booking data.
 *
 * Authentication is deliberately fail-closed: if ADMIN_API_KEY is missing,
 * protected routes stay unavailable instead of becoming public. Credentials
 * are accepted only through request headers, never through URL parameters.
 */
export function requireAdminKey(
  req: Request,
  res: Response,
  next: NextFunction,
): Response | void {
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey) {
    return res.status(503).json({ error: "Admin access is unavailable" });
  }

  const directKey = readHeader(req.headers["x-admin-key"]);
  const authorization = readHeader(req.headers.authorization);
  const bearerMatch = authorization?.match(/^Bearer\s+(.+)$/i);
  const provided = directKey ?? bearerMatch?.[1]?.trim();

  if (!provided || !matchesSecret(provided, adminKey)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return next();
}
