// src/index.ts
import "./env";
import http from "http";
import { AddressInfo } from "net";
import { makeApp } from "./app";

function getPort(): number {
  const raw = process.env.PORT ?? "3333";
  const port = Number(raw);
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${raw}"`);
  }
  return port;
}

const HOST = process.env.HOST ?? "0.0.0.0";
const PORT = getPort();

const app = makeApp();
const server = http.createServer(app);

// Opcional: tunar keep-alive para produção
server.keepAliveTimeout = 75_000; // 75s
server.headersTimeout = 76_000;

server.listen(PORT, HOST, () => {
  const addr = server.address() as AddressInfo | null;
  const shownHost = HOST === "0.0.0.0" ? "0.0.0.0" : HOST;
  const shownPort = addr?.port ?? PORT;
  // eslint-disable-next-line no-console
  console.log(`[API] Listening on ${shownHost}:${shownPort}`);
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    // eslint-disable-next-line no-console
    console.error(
      `[API] Port ${PORT} is already in use. Update PORT or stop the other process.`,
    );
    process.exit(1);
  }
  // eslint-disable-next-line no-console
  console.error("[API] Server error:", err);
  process.exit(1);
});

/**
 * Encerramento gracioso
 */
function shutdown(signal: NodeJS.Signals | string, code = 0) {
  // eslint-disable-next-line no-console
  console.log(`[API] Received ${signal}. Shutting down gracefully...`);
  // Dê tempo para conexões keep-alive finalizarem
  server.close((closeErr) => {
    if (closeErr) {
      // eslint-disable-next-line no-console
      console.error("[API] Failed to close server gracefully:", closeErr);
      process.exit(1);
    }
    // eslint-disable-next-line no-console
    console.log("[API] Server closed. Bye.");
    process.exit(code);
  });

  // Se em 10s não fechou, força
  setTimeout(() => {
    // eslint-disable-next-line no-console
    console.warn("[API] Forcing shutdown after timeout.");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

/**
 * Guard rails para erros fora do Express
 */
process.on("unhandledRejection", (reason) => {
  // eslint-disable-next-line no-console
  console.error("[API] UnhandledRejection:", reason);
  shutdown("unhandledRejection", 1);
});

process.on("uncaughtException", (err) => {
  // eslint-disable-next-line no-console
  console.error("[API] UncaughtException:", err);
  shutdown("uncaughtException", 1);
});
