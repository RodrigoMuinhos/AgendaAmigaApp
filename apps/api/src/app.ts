import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";

import { openApiDocument } from "./docs/openapi";
import { errorHandler } from "./http/middlewares/errorHandler";
import { notFoundHandler } from "./http/middlewares/notFoundHandler";
import { router } from "./http/routes";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health
  app.get("/health", (_req, res) => res.send("ok"));

  // >>> Swagger PRIMEIRO <<<
  app.get("/docs.json", (_req, res) => res.json(openApiDocument));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

  // Depois suas rotas
  app.use(router);

  // Por último os handlers de erro
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
