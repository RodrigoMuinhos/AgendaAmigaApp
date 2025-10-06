import { HttpError } from "./HttpError";

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(message, 400);
  }

  static from(error: unknown, fallbackMessage = "Requisição inválida"): HttpError {
    if (error instanceof HttpError) {
      return error;
    }

    if (error instanceof Error && error.message.trim().length > 0) {
      return new BadRequestError(error.message);
    }

    return new BadRequestError(fallbackMessage);
  }
}
