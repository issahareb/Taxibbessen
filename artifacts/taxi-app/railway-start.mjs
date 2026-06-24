import express from "express";
import compression from "compression";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readdirSync, existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const distDir = join(__dirname, "dist/public");

console.log(`Starting server on port ${PORT}`);
console.log(`Serving from: ${distDir}`);

// Build set of known routes from pre-rendered HTML files in dist
function getKnownRoutes() {
  const routes = new Set(["/"]);
  if (!existsSync(distDir)) return routes;
  for (const entry of readdirSync(distDir, { withFileTypes: true })) {
    if (entry.isDirectory() && existsSync(join(distDir, entry.name, "index.html"))) {
      routes.add("/" + entry.name);
    }
  }
  return routes;
}
const knownRoutes = getKnownRoutes();
console.log(`Known routes: ${knownRoutes.size}`);

const app = express();

app.use(compression({ level: 6 }));

// Security headers
app.use((_req, res, next) => {
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  next();
});

app.use(express.static(distDir, {
  index: "index.html",
  etag: true,
  lastModified: true,
  setHeaders(res, path) {
    if (path.endsWith(".html")) {
      res.setHeader("Cache-Control", "no-cache");
    } else {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
  },
}));

// Catch-all: return 404 status for unknown routes, 200 for known SPA routes
app.use((req, res) => {
  const pathname = req.path === "/" ? "/" : req.path.replace(/\/$/, "");
  const isKnown = knownRoutes.has(pathname);
  res.status(isKnown ? 200 : 404).sendFile(join(distDir, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server ready on port ${PORT} (compression + HSTS + smart 404)`);
});
