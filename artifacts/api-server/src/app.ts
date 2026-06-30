import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import {
  AdminLoginRequestSchema,
  AdminSetupRequestSchema,
  BookingIdParamsSchema,
  BookingRequestSchema,
  BookingStatusRequestSchema,
  ContactRequestSchema,
} from "@workspace/api-zod";
import { serveAdminConsole } from "./admin-console";
import router from "./routes";
import { logger } from "./lib/logger";
import {
  apiRateLimiter,
  bookingSubmissionRateLimiter,
  contactSubmissionRateLimiter,
} from "./middleware/rate-limit";
import { validateBody, validateParams } from "./middleware/validate-request";

const app: Express = express();

const trustedOrigins = new Set([
  "https://taxibbessen.de",
  "https://www.taxibbessen.de",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

for (const value of (process.env.CORS_ORIGINS ?? "").split(",")) {
  const origin = value.trim().replace(/\/$/, "");
  if (origin) trustedOrigins.add(origin);
}

app.set("trust proxy", 1);
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use((req, res, next): void => {
  const origin = req.get("origin")?.replace(/\/$/, "");
  const ownOrigin = `${req.protocol}://${req.get("host")}`.replace(/\/$/, "");
  const allowed = !origin || origin === ownOrigin || trustedOrigins.has(origin);

  if (!allowed) {
    res.status(403).json({ error: "Origin is not allowed" });
    return;
  }

  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Admin-Key,X-CSRF-Token");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.use("/api", apiRateLimiter);
app.post("/api/bookings", bookingSubmissionRateLimiter, validateBody(BookingRequestSchema));
app.post("/api/contact", contactSubmissionRateLimiter, validateBody(ContactRequestSchema));
app.post("/api/admin/setup", validateBody(AdminSetupRequestSchema));
app.post("/api/admin/login", validateBody(AdminLoginRequestSchema));
app.get("/api/bookings/:id", validateParams(BookingIdParamsSchema));
app.patch(
  "/api/bookings/:id/status",
  validateParams(BookingIdParamsSchema),
  validateBody(BookingStatusRequestSchema),
);

app.get("/admin-console", serveAdminConsole);
app.use("/api", router);

export default app;
