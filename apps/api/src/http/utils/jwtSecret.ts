import { HttpError } from "../errors/HttpError";

const FALLBACK_SECRET = "agenda-amiga-dev-secret";
const NODE_ENV = process.env.NODE_ENV ?? "development";
const IS_PRODUCTION = NODE_ENV === "production";

let warnedAboutFallback = false;

export function resolveJwtSecret(): string | undefined {
  const configured = process.env.JWT_SECRET?.trim();
  if (configured && configured.length > 0) {
    return configured;
  }

  if (!IS_PRODUCTION) {
    if (!warnedAboutFallback) {
      console.warn(
        "[auth] JWT_SECRET is not defined. Using a fallback development secret; configure JWT_SECRET for production."
      );
      warnedAboutFallback = true;
    }
    return FALLBACK_SECRET;
  }

  return undefined;
}

export function ensureJwtSecret(): string {
  const secret = resolveJwtSecret();
  if (!secret) {
    throw new HttpError("JWT_SECRET is not configured", 500);
  }
  return secret;
}

