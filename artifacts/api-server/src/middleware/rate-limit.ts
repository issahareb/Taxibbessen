import type { Request, RequestHandler } from "express";

type RateLimitOptions = {
  name: string;
  windowMs: number;
  max: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, CLEANUP_INTERVAL_MS);
cleanupTimer.unref();

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizedEndpoint(req: Request): string {
  const path = req.originalUrl.split("?", 1)[0] ?? req.path;
  return path.replace(/\/\d+(?=\/|$)/g, "/:id");
}

function clientIdentifier(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

export function createRateLimiter(options: RateLimitOptions): RequestHandler {
  return (req, res, next): void => {
    const now = Date.now();
    const endpoint = normalizedEndpoint(req);
    const key = `${options.name}:${clientIdentifier(req)}:${req.method}:${endpoint}`;
    const current = buckets.get(key);
    const bucket = !current || current.resetAt <= now
      ? { count: 0, resetAt: now + options.windowMs }
      : current;

    bucket.count += 1;
    buckets.set(key, bucket);

    const remaining = Math.max(0, options.max - bucket.count);
    const resetSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

    res.setHeader("RateLimit-Limit", String(options.max));
    res.setHeader("RateLimit-Remaining", String(remaining));
    res.setHeader("RateLimit-Reset", String(resetSeconds));

    if (bucket.count > options.max) {
      res.setHeader("Retry-After", String(resetSeconds));
      res.status(429).json({
        error: "Too many requests",
        retryAfterSeconds: resetSeconds,
      });
      return;
    }

    next();
  };
}

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export const apiRateLimiter = createRateLimiter({
  name: "api",
  windowMs: positiveInteger(process.env.API_RATE_LIMIT_WINDOW_MS, FIFTEEN_MINUTES),
  max: positiveInteger(process.env.API_RATE_LIMIT_MAX, 300),
});

export const bookingSubmissionRateLimiter = createRateLimiter({
  name: "booking",
  windowMs: positiveInteger(process.env.BOOKING_RATE_LIMIT_WINDOW_MS, FIFTEEN_MINUTES),
  max: positiveInteger(process.env.BOOKING_RATE_LIMIT_MAX, 8),
});

export const contactSubmissionRateLimiter = createRateLimiter({
  name: "contact",
  windowMs: positiveInteger(process.env.CONTACT_RATE_LIMIT_WINDOW_MS, FIFTEEN_MINUTES),
  max: positiveInteger(process.env.CONTACT_RATE_LIMIT_MAX, 5),
});
