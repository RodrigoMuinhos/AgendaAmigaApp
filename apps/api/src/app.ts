import cors from "cors";
import express from "express";
import { SHARED_READY } from "@agenda-amiga/shared";

import { router } from "./http/routes";
import { notFoundHandler } from "./http/middlewares/notFoundHandler";
import { errorHandler } from "./http/middlewares/errorHandler";

function resolveCorsOrigin() {
  const raw = process.env.FRONTEND_ORIGIN;
  if (!raw || raw.trim() === "*") {
    return raw ? raw.trim() : "http://localhost:5173";
  }

  const origins = raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    return "http://localhost:5173";
  }

  return origins.length === 1 ? origins[0] : origins;
}

export function makeApp() {
  const app = express();

  app.set("trust proxy", true);

  app.use(
    cors({
      origin: resolveCorsOrigin(),
      credentials: true,
    }),
  );

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use(router);

  app.get("/api/ping", (_req, res) => {
    res.json({ pong: true });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
