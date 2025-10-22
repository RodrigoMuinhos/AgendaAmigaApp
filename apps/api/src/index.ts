import "dotenv/config";
import http from "http";
import { createServer } from "./app";

const port = Number(process.env.PORT ?? 3333);
const host = process.env.HOST ?? "0.0.0.0";

const app = createServer();
const server = http.createServer(app);

server.listen(port, host, () => {
  console.log(`[API] Listening on ${host}:${port}`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(`[API] Port ${port} already in use. Update PORT in apps/api/.env and restart.`);
  } else {
    console.error("[API] Error starting server", error);
  }
  process.exit(1);
});

function handleShutdown(signal: NodeJS.Signals) {
  console.log(`[API] Received ${signal}. Shutting down...`);

  server.close((shutdownError) => {
    if (shutdownError) {
      console.error("[API] Failed to close server gracefully", shutdownError);
      process.exit(1);
    }

    console.log("[API] Server closed successfully");
    process.exit(0);
  });
}

process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);
