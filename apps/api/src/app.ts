import express from "express";
import cors from "cors";
import helmet from "helmet";
import { SHARED_READY } from "@agenda-amiga/shared"; // mantém caso use no projeto

import { router as mainRouter } from "./http/routes";
import criancasRoutes from "./routes/criancas";

const API_PREFIX = "/api";

function resolveCorsOrigin() {
  const raw = process.env.FRONTEND_ORIGIN;


  if (!raw || raw.trim() === "*") {
    return "*";
  }

  const origins = raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    return "*";
  }

  return origins.length === 1 ? origins[0] : origins;
}


export function makeApp() {
  const app = express();

  app.set("trust proxy", true);
  app.use(helmet());

  const origin = resolveCorsOrigin();
  app.use(
    cors({
      origin,
      credentials: true,
    })
  );


  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.send("ok");
  });


  app.get(`${API_PREFIX}/ping`, (_req, res) => {
    res.json({ pong: true });
  });

  app.use(API_PREFIX, criancasRoutes);
  app.use(API_PREFIX, mainRouter);

  app.get("/", (_req, res) => {
    res.json({ message: "API online" });
  });


  console.log("[API] CORS origins:", origin);
  console.log("[API] Shared layer ready:", SHARED_READY);

  return app;
}
