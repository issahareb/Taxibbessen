import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { db, memoriesTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const app: Express = express();

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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// Nexus Brain Dashboard
app.get("/", async (_req: Request, res: Response) => {
  let rows: { id: number; content: string; category: string; importance: number; createdAt: Date }[] = [];
  try {
    rows = await db.select().from(memoriesTable).orderBy(desc(memoriesTable.importance), desc(memoriesTable.createdAt)).limit(100);
  } catch (_e) {
    // DB not ready yet
  }
  const items = rows.map((m) =>
    `<tr><td>${m.id}</td><td style="max-width:420px;word-break:break-word">${escHtml(m.content)}</td><td>${escHtml(m.category)}</td><td>${m.importance.toFixed(2)}</td><td>${m.createdAt.toISOString().slice(0,10)}</td></tr>`
  ).join("");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>Nexus Brain</title>
<style>body{font-family:system-ui,sans-serif;background:#0d0f14;color:#e2e8f0;margin:0;padding:2rem}
h1{color:#ffc107;margin:0 0 .25rem}p{color:#94a3b8;margin:0 0 2rem;font-size:.9rem}
table{width:100%;border-collapse:collapse;font-size:.85rem}
th{background:#1e2330;padding:.6rem 1rem;text-align:left;color:#ffc107;border-bottom:1px solid #2d3448}
td{padding:.5rem 1rem;border-bottom:1px solid #1e2330;vertical-align:top}
tr:hover td{background:#1a1f2e}
.badge{display:inline-block;padding:.15rem .5rem;border-radius:99px;font-size:.75rem;font-weight:600;background:#1e2330;border:1px solid #2d3448}
a{color:#ffc107;text-decoration:none}a:hover{text-decoration:underline}</style></head>
<body>
<h1>🧠 Nexus Brain</h1>
<p>Memory API — <a href="/api/memories/context?q=&limit=10">GET /api/memories/context</a> · <a href="/api/memories">GET /api/memories</a></p>
<table><thead><tr><th>#</th><th>Inhalt</th><th>Kategorie</th><th>Wichtigkeit</th><th>Datum</th></tr></thead>
<tbody>${items || '<tr><td colspan="5" style="color:#64748b;padding:2rem 1rem">Noch keine Memories gespeichert. Starte mit POST /api/memories</td></tr>'}</tbody></table>
</body></html>`);
});

export default app;
