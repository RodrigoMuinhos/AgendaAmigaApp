import type { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { resolveJwtSecret } from "../utils/jwtSecret";

const JWT_SECRET = resolveJwtSecret();

if (!JWT_SECRET) {
  console.warn(
    "[auth] JWT_SECRET is not defined and no fallback is available. Authentication routes will reject requests until it is configured."
  );
}

export interface AuthenticatedUser {
  id: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

function extractToken(headerValue: string | undefined) {
  if (!headerValue) return undefined;
  const [prefix, token] = headerValue.split(" ");
  if (!token || prefix.toLowerCase() !== "bearer") {
    return undefined;
  }
  return token.trim();
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!JWT_SECRET) {
    res.status(500).json({ message: "Servico de autenticacao indisponivel." });
    return;
  }

  const token = extractToken(req.header("authorization"));

  if (!token) {
    res.status(401).json({ message: "Credenciais ausentes." });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload & { id?: string };
    const userId = typeof payload.sub === "string" ? payload.sub : (payload.id as string | undefined);

    if (!userId) {
      res.status(401).json({ message: "Token invalido." });
      return;
    }

    req.user = { id: userId };
    next();
  } catch (error) {
    console.error("[auth] Token verification failed", error);
    res.status(401).json({ message: "Sessao expirada ou invalida." });
  }
}
