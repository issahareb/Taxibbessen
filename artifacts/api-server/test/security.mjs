import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const port = 22000 + Math.floor(Math.random() * 10000);
const baseUrl = `http://127.0.0.1:${port}`;
let childOutput = "";

const child = spawn(process.execPath, ["--enable-source-maps", "./dist/index.mjs"], {
  cwd: new URL("..", import.meta.url),
  env: {
    ...process.env,
    PORT: String(port),
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://invalid:invalid@127.0.0.1:1/invalid",
    RESEND_API_KEY: "re_test_key",
    ADMIN_API_KEY: "",
    SKIP_DB_MIGRATIONS: "true",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

child.stdout.on("data", (chunk) => { childOutput += chunk.toString(); });
child.stderr.on("data", (chunk) => { childOutput += chunk.toString(); });

async function waitForServer() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`API server exited early (${child.exitCode})\n${childOutput}`);
    }
    try {
      const response = await fetch(`${baseUrl}/api/healthz`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`API server did not become ready\n${childOutput}`);
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
  await expectBlocked("/api/bookings?adminKey=legacy-url-key");
  await expectBlocked("/api/bookings/1");
  await expectBlocked("/api/stats");
  await expectBlocked("/api/bookings/1/status", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "accepted" }),
  });

  for (const path of ["/api/memories", "/api/memories/session/restore", "/api/memory-sessions"]) {
    const response = await fetch(`${baseUrl}${path}`);
    assert.equal(response.status, 404, `${path} must not exist`);
  }

  const source = await readFile(new URL("../src/routes/bookings.ts", import.meta.url), "utf8");
  assert.ok(!source.includes("res.status(201).json(booking)"));
  assert.ok(source.includes("requestId: booking.id"));
  console.log("Security regression checks passed.");
} finally {
  child.kill("SIGTERM");
}
