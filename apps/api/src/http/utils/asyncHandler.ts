import type { NextFunction, Request, Response } from "express";

import { BadRequestError } from "../errors/BadRequestError";
import { HttpError } from "../errors/HttpError";

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;

export function asyncHandler(handler: AsyncRouteHandler): AsyncRouteHandler {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      const normalized = error instanceof HttpError ? error : BadRequestError.from(error);
      next(normalized);
    }
  };
}
