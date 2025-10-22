import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { HttpError } from "../errors/HttpError";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const message = err.issues[0]?.message ?? "Dados inv�lidos";
    res.status(400).json({ message });
    return;
  }

  const status = err instanceof HttpError ? err.statusCode : 500;
  const message = err instanceof Error && err.message.trim().length > 0 ? err.message : "Erro inesperado";

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({ message });
}
