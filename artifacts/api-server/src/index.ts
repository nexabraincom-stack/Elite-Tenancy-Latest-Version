import { createServer } from "http";
import app from "./app";
import { logger } from "./lib/logger";
import { runMigrations } from "@workspace/db/migrate";
import { setupWebSocket } from "./ws/server";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

runMigrations()
  .then(() => {
    // Create HTTP server so we can attach the WebSocket server to it
    const server = createServer(app);
    setupWebSocket(server);

    server.listen(port, (err?: Error) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }
      logger.info({ port }, "HTTP + WebSocket server listening");
    });
  })
  .catch((err) => {
    logger.error({ err }, "Migration failed — server not started");
    process.exit(1);
  });
