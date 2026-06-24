import { Router } from "express";
import { db, memoriesTable, memoryConnectionsTable, memorySessionsTable } from "@workspace/db";
import { eq, ilike, or, desc } from "drizzle-orm";

const router = Router();

// GET /api/memories/context?q=...&limit=10
router.get("/memories/context", async (req, res) => {
  const q = String(req.query["q"] ?? "");
  const rawLimit = Number(req.query["limit"]);
  const limit = Math.min(Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 10, 50);

  const rows = await db
    .select()
    .from(memoriesTable)
    .where(q ? ilike(memoriesTable.content, `%${q}%`) : undefined)
    .orderBy(desc(memoriesTable.importance), desc(memoriesTable.createdAt))
    .limit(limit);

  const now = Date.now();
  const DAY_MS = 86_400_000;

  const nodes = rows.map((m) => {
    const ageDays = (now - m.createdAt.getTime()) / DAY_MS;
    const recency = Math.exp(-ageDays / 30);
    const textMatch = q && m.content.toLowerCase().includes(q.toLowerCase()) ? 1 : 0.5;
    const score = Number((m.importance * recency * textMatch).toFixed(4));
    return { id: m.id, content: m.content, category: m.category, importance: m.importance, score };
  });

  nodes.sort((a, b) => b.score - a.score);

  const lines = nodes.map((n) => `- [${n.category}] ${n.content}`).join("\n");
  const contextBlock = nodes.length
    ? `## Relevant Context\n${lines}`
    : "## Relevant Context\n(no memories found)";

  res.json({ nodes, contextBlock });
});

// GET /api/memories/session/restore?q=...&limit=20
router.get("/memories/session/restore", async (req, res) => {
  const q = String(req.query["q"] ?? "");
  const rawLimit2 = Number(req.query["limit"]);
  const limit = Math.min(Number.isFinite(rawLimit2) && rawLimit2 > 0 ? rawLimit2 : 20, 100);

  const rows = await db
    .select()
    .from(memorySessionsTable)
    .where(q ? ilike(memorySessionsTable.sessionId, `%${q}%`) : undefined)
    .orderBy(desc(memorySessionsTable.createdAt))
    .limit(limit);

  res.json(rows);
});

// GET /api/memories
router.get("/memories", async (_req, res) => {
  const rows = await db
    .select()
    .from(memoriesTable)
    .orderBy(desc(memoriesTable.importance), desc(memoriesTable.createdAt));
  res.json(rows);
});

// POST /api/memories
router.post("/memories", async (req, res) => {
  const { content, category, importance } = req.body as {
    content?: string;
    category?: string;
    importance?: number;
  };

  if (!content || typeof content !== "string" || content.trim() === "") {
    return res.status(400).json({ error: "content is required" });
  }

  const validCategories = ["personal", "goal", "project", "preference", "decision", "mistake", "general"];
  const safeCategory = validCategories.includes(category ?? "") ? category : "general";
  const safeImportance = typeof importance === "number" && importance >= 0 && importance <= 1
    ? importance
    : 0.5;

  const [row] = await db.insert(memoriesTable).values({
    content: content.trim(),
    category: safeCategory as typeof memoriesTable.$inferInsert["category"],
    importance: safeImportance,
  }).returning();

  return res.status(201).json(row);
});

// POST /api/memories/session
router.post("/memories/session", async (req, res) => {
  const { sessionId, eventType, payload } = req.body as {
    sessionId?: string;
    eventType?: string;
    payload?: unknown;
  };

  if (!sessionId || !eventType) {
    return res.status(400).json({ error: "sessionId and eventType are required" });
  }

  const validEvents = ["file_edit", "decision", "task", "error", "user_prompt", "other"];
  const safeEvent = validEvents.includes(eventType) ? eventType : "other";

  const [row] = await db.insert(memorySessionsTable).values({
    sessionId,
    eventType: safeEvent as typeof memorySessionsTable.$inferInsert["eventType"],
    payload: payload ?? null,
  }).returning();

  return res.status(201).json(row);
});

// POST /api/memories/:id/connect
router.post("/memories/:id/connect", async (req, res) => {
  const sourceId = Number(req.params["id"]);
  const { targetId, relation } = req.body as { targetId?: number; relation?: string };

  if (!targetId || isNaN(sourceId)) {
    return res.status(400).json({ error: "targetId is required" });
  }

  const validRelations = ["leads_to", "related_to", "contradicts", "supports"];
  const safeRelation = validRelations.includes(relation ?? "") ? relation : "related_to";

  const [row] = await db.insert(memoryConnectionsTable).values({
    sourceId,
    targetId,
    relation: safeRelation as typeof memoryConnectionsTable.$inferInsert["relation"],
  }).returning();

  return res.status(201).json(row);
});

export default router;
