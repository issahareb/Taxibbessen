import path from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "@workspace/db";
import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const migrationsFolder = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../lib/db/migrations",
);

const MIGRATION_MAX_ATTEMPTS = 60;
const MIGRATION_RETRY_DELAY_MS = 3000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Run migrations in the background so the HTTP server can start immediately and
// pass the platform healthcheck. The database (e.g. Railway private networking)
// may not be reachable in the first moments after startup, so we retry with a
// delay. Failure here is logged but never crashes the process.
async function runMigrations() {
  for (let attempt = 1; attempt <= MIGRATION_MAX_ATTEMPTS; attempt++) {
    try {
      await migrate(db, { migrationsFolder });
      logger.info({ attempt }, "Database migrations applied");
      return;
    } catch (err) {
      logger.warn(
        { err, attempt, maxAttempts: MIGRATION_MAX_ATTEMPTS },
        "Database migration attempt failed (DB not reachable yet), retrying…",
      );
      await sleep(MIGRATION_RETRY_DELAY_MS);
    }
  }
  logger.error(
    "Database migrations did not complete: the database is unreachable. " +
      "Check that DATABASE_URL points to a reachable database.",
  );
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  void runMigrations();
});
