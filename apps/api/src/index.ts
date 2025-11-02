// src/index.ts
import "./env";
import http from "http";
import { AddressInfo } from "net";
import { PrismaClient } from "@prisma/client";
import { makeApp } from "./app";
import { notFoundHandler } from "./http/middlewares/notFoundHandler";
import { errorHandler } from "./http/middlewares/errorHandler";

/**
 * Resolve e valida a porta do servidor.
 * Padrão: 3000 (compatível com docker-compose)
 */
function getPort(): number {
  const raw = process.env.PORT ?? "3000";
  const port = Number(raw);
  if (!Number.isFinite(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid PORT value: "${raw}"`);
  }
  return port;
}

const HOST = process.env.HOST ?? "0.0.0.0";
const PORT = getPort();

const app = makeApp();
const prisma = new PrismaClient();

app.get("/api/__debug/db", async (_req, res) => {
  const [sp] = await prisma.$queryRawUnsafe<any[]>("SHOW search_path");
  const [db] = await prisma.$queryRawUnsafe<any[]>(
    "SELECT current_database() AS db, current_schema() AS schema"
  );
  const [host] = await prisma.$queryRawUnsafe<any[]>(
    "SELECT inet_server_addr()::text AS addr, inet_server_port() AS port"
  );
  res.json({
    database: db,
    search_path: sp,
    server: host,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: (process.env.DATABASE_URL || "").replace(/:[^:@/]+@/, "://*****@"),
      DIRECT_URL: (process.env.DIRECT_URL || "").replace(/:[^:@/]+@/, "://*****@"),
    },
  });
});

app.get("/api/__debug/prisma", async (_req, res) => {
  try {
    const [r1] = await prisma.$queryRawUnsafe<any[]>(
      "SELECT to_regclass('app.criancas')::text AS t"
    );

    const total = await prisma.criancas.count();

    res.json({
      regclass: r1?.t,
      prismaModelCount: total,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      error: err.message,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
  }
});

/**
 * Healthcheck básico (200 OK) – seguro para usar no Docker healthcheck.
 * Mantém fora de middlewares de auth/rate-limit para não flapar readiness.
 */
app.get("/health", (_req, res) => {
  res.status(200).send("ok");
});

// Opcional: uma raiz amigável (não usada no healthcheck)
app.get("/", (_req, res) => {
  res.status(200).json({ name: "Agenda Amiga API", status: "ok" });
});

app.use(notFoundHandler);
app.use(errorHandler);

const server = http.createServer(app);

// Tunables de keep-alive (evita 408/499 em proxies e melhora tráfego ocioso)
server.keepAliveTimeout = 75_000; // 75s
server.headersTimeout = 76_000;

server.listen(PORT, HOST, () => {
  const addr = server.address() as AddressInfo | null;
  const shownHost = HOST === "0.0.0.0" ? "0.0.0.0" : HOST;
  const shownPort = addr?.port ?? PORT;
  // eslint-disable-next-line no-console
  console.log(`[API] Listening on http://${shownHost}:${shownPort}`);
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    // eslint-disable-next-line no-console
    console.error(`[API] Port ${PORT} is already in use. Stop the other process or change PORT.`);
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

  // Força saída se algo pendurar
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
