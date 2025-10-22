import cors from "cors";
import express from "express";
import { SHARED_READY } from "@agenda-amiga/shared";

import { router } from "./http/routes";
import { notFoundHandler } from "./http/middlewares/notFoundHandler";
import { errorHandler } from "./http/middlewares/errorHandler";

function resolveCorsOrigin() {
  const configuredOrigin = process.env.CORS_ORIGIN?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!configuredOrigin || configuredOrigin.length === 0 || configuredOrigin.includes("*")) {
    return "*";
  }

  return configuredOrigin;
}

export function createServer() {
  const app = express();

  app.set("trust proxy", true);

  app.use(
    cors({
      origin: resolveCorsOrigin(),
      credentials: false,
    }),
  );

  app.use(express.json());

  app.use(router);

  app.get("/api/ping", (_req, res) => {
    res.json({ pong: true });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
