import { createHash, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { requireAdmin } from "./require-admin-key";

// Scoped to the aggregate GET route only; never grants booking/admin access.
export function requireAnalyticsRead(req: Request, res: Response, next: NextFunction) {
  res.setHeader("Cache-Control", "no-store");
  const provided = req.headers["x-analytics-token"];
  if (provided !== undefined) {
    const expected = process.env.TAXIBB_ANALYTICS_READ_TOKEN;
    if (!expected || expected.length < 32 || typeof provided !== "string" || provided.length > 256) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const hash = (s: string) => createHash("sha256").update(s).digest();
    if (!timingSafeEqual(hash(provided), hash(expected))) return res.status(401).json({ error: "Unauthorized" });
    return next();
  }
  return requireAdmin(req, res, next);
}
