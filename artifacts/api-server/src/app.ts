import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { serveAdminConsole } from "./admin-console";
import router from "./routes";
import { logger } from "./lib/logger";

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
app.use(pinoHttp({ logger }));
app.use((req, res, next) => {
  const origin = req.get("origin")?.replace(/\/$/, "");
  const ownOrigin = `${req.protocol}://${req.get("host")}`.replace(/\/$/, "");
  const allowed = !origin || origin === ownOrigin || trustedOrigins.has(origin);
  if (!allowed) {
    res.sendStatus(403);
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
app.get("/admin-console", serveAdminConsole);
app.use("/api", router);

export default app;
