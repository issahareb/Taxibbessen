import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

const defaultOrigins = new Set([
  "https://taxibbessen.de",
  "https://www.taxibbessen.de",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

for (const origin of (process.env.CORS_ORIGINS ?? "").split(",")) {
  const normalized = origin.trim().replace(/\/$/, "");
  if (normalized) defaultOrigins.add(normalized);
}

app.set("trust proxy", 1);
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || defaultOrigins.has(origin.replace(/\/$/, ""))) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin is not allowed"));
    },
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Admin-Key", "X-CSRF-Token"],
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.use("/api", router);

export default app;
