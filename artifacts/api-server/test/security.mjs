import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const port = 22000 + Math.floor(Math.random() * 10000);
const baseUrl = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ["--enable-source-maps", "./dist/index.mjs"], {
  cwd: new URL("..", import.meta.url),
  env: {
    ...process.env,
    PORT: String(port),
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://invalid:invalid@127.0.0.1:1/invalid",
    ADMIN_API_KEY: "",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/healthz`);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("API server did not become ready");
}

async function expectBlocked(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  assert.ok(
    response.status === 401 || response.status === 503,
    `${init?.method ?? "GET"} ${path} returned ${response.status}`,
  );
}

try {
  await waitForServer();

  await expectBlocked("/api/bookings");
  await expectBlocked("/api/bookings/1");
  await expectBlocked("/api/stats");
  await expectBlocked("/api/bookings/1/status", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "accepted" }),
  });

  for (const path of ["/api/memories", "/api/memories/session/restore"]) {
    const response = await fetch(`${baseUrl}${path}`);
    assert.equal(response.status, 404, `${path} must not exist`);
  }

  const bookingSource = await readFile(new URL("../src/routes/bookings.ts", import.meta.url), "utf8");
  assert.ok(!bookingSource.includes("json(booking)"), "Public booking endpoint must not return the database row");
  assert.ok(bookingSource.includes("requestId: booking.id"), "Public response must contain only a receipt ID");

  console.log("Security regression checks passed.");
} finally {
  child.kill("SIGTERM");
}
