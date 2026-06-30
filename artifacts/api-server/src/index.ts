import path from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "@workspace/db";
import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
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

async function runMigrations(): Promise<void> {
  for (let attempt = 1; attempt <= MIGRATION_MAX_ATTEMPTS; attempt += 1) {
    try {
      await migrate(db, { migrationsFolder });
      logger.info({ attempt }, "Database migrations applied");
      return;
    } catch (error) {
      logger.warn(
        { err: error, attempt, maxAttempts: MIGRATION_MAX_ATTEMPTS },
        "Database migration attempt failed, retrying",
      );
      await sleep(MIGRATION_RETRY_DELAY_MS);
    }
  }

  logger.error("Database migrations did not complete. Check DATABASE_URL.");
}

app.listen(port, (error) => {
  if (error) {
    logger.error({ err: error }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  if (process.env.SKIP_DB_MIGRATIONS !== "true") {
    void runMigrations();
  }
});
