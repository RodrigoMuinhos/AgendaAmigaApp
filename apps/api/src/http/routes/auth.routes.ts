// apps/api/src/http/routes/auth.routes.ts
import { randomUUID } from "node:crypto";
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { z } from "zod";

import { query } from "../../infra/database";
import { asyncHandler } from "../utils/asyncHandler";
import { ensureJwtSecret } from "../utils/jwtSecret";
import { ensureUsuariosCpfColumn } from "../utils/schemaGuards";
import { authenticate, type AuthenticatedRequest } from "../middlewares/authenticate";

const authRouter = Router();

const FALLBACK_EMAIL_DOMAIN = process.env.AUTH_FALLBACK_EMAIL_DOMAIN ?? "cpf.agendaamiga.local";

/** --- Rotas placeholder de SSO --- */
authRouter.get("/auth/google", (_req, res) => {
  res.status(501).json({ message: "Login com Google ainda nao foi implementado." });
});

authRouter.get("/auth/govbr", (_req, res) => {
  res.status(501).json({ message: "Login com gov.br ainda nao foi implementado." });
});

/** --- Schemas --- */
const registerSchema = z
  .object({
    nome: z.string().trim().min(1).max(160),
    cpf: z
      .string()
      .trim()
      .min(11)
      .max(14)
      .transform((value) => value.replace(/\D/g, "")),
    senha: z.string().min(6).max(128),
    email: z
      .string()
      .trim()
      .max(160)
      .optional()
      .transform((value) => (value && value.length ? value : undefined)),
  })
  .superRefine((data, ctx) => {
    if (data.cpf.length !== 11) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CPF invalido",
        path: ["cpf"],
      });
    }
  });

const loginSchema = z
  .object({
    cpf: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value ? value.replace(/\D/g, "") : undefined)),
    email: z
      .string()
      .trim()
      .max(160)
      .optional()
      .transform((value) => (value && value.length ? value : undefined)),
    senha: z.string().min(1),
  })
  .superRefine((data, ctx) => {
    if (!data.cpf && !data.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe CPF ou email",
        path: ["cpf"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe CPF ou email",
        path: ["email"],
      });
      return;
    }

    if (data.cpf && data.cpf.length !== 11) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CPF invalido",
        path: ["cpf"],
      });
    }
  });

/** --- Tipos alinhados ao SELECT (snake_case vindos do DB) --- */
type UserRow = {
  id: string;
  nome: string;
  email: string;
  senha_hash: string;
  responsavel_nome: string;
  responsavel_parentesco: string | null;
  responsavel_telefone: string | null;
  responsavel_cpf: string | null;
  criado_em: Date;
  atualizado_em: Date;
};

function mapUser(row: UserRow) {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    responsavel: {
      nome: row.responsavel_nome,
      parentesco: row.responsavel_parentesco ?? undefined,
      telefone: row.responsavel_telefone ?? undefined,
      cpf: row.responsavel_cpf ?? undefined,
    },
    criadoEmISO: row.criado_em.toISOString(),
    atualizadoEmISO: row.atualizado_em.toISOString(),
  };
}

/** --- JWT utils --- */
const TOKEN_TTL_RAW = process.env.JWT_EXPIRES_IN ?? "7d";

// Tipagem exata aceita por jsonwebtoken (string tipo "7d" ou número em segundos)
const TOKEN_TTL: SignOptions["expiresIn"] =
  /^\d+$/.test(TOKEN_TTL_RAW) ? Number(TOKEN_TTL_RAW) : (TOKEN_TTL_RAW as SignOptions["expiresIn"]);

function createToken(userId: string): string {
  const secret = ensureJwtSecret();
  const payload = { sub: userId };
  const options: SignOptions = { expiresIn: TOKEN_TTL };
  return jwt.sign(payload, secret, options);
}

/** --- Register --- */
authRouter.post(
  "/auth/register",
  asyncHandler(async (req, res) => {
    const payload = registerSchema.parse(req.body);

    await ensureUsuariosCpfColumn();

    const nome = payload.nome.trim();
    const cpf = payload.cpf;
    const emailProvided = payload.email?.toLowerCase();
    const emailToPersist = (emailProvided ?? `${cpf}@${FALLBACK_EMAIL_DOMAIN}`).toLowerCase();

    const existingByCpf = await query<UserRow>(
      `
      SELECT id, nome, email, senha_hash, responsavel_nome, responsavel_parentesco, responsavel_telefone, responsavel_cpf, criado_em, atualizado_em
      FROM usuarios
      WHERE responsavel_cpf = $1
      LIMIT 1
      `,
      [cpf]
    );

    if (existingByCpf.rowCount) {
      res.status(409).json({ message: "CPF ja cadastrado." });
      return;
    }

    if (emailProvided) {
      const existingByEmail = await query<UserRow>(
        `
        SELECT id, nome, email, senha_hash, responsavel_nome, responsavel_parentesco, responsavel_telefone, responsavel_cpf, criado_em, atualizado_em
        FROM usuarios
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
        `,
        [emailProvided]
      );

      if (existingByEmail.rowCount) {
        res.status(409).json({ message: "Email ja cadastrado." });
        return;
      }
    }

    const id = randomUUID();
    const senhaHash = await bcrypt.hash(payload.senha, 10);

    const result = await query<UserRow>(
      `
      INSERT INTO usuarios (
        id,
        nome,
        email,
        senha_hash,
        responsavel_nome,
        responsavel_parentesco,
        responsavel_telefone,
        responsavel_cpf,
        criado_em,
        atualizado_em
      )
      VALUES ($1, $2, LOWER($3), $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING id, nome, email, senha_hash, responsavel_nome, responsavel_parentesco, responsavel_telefone, responsavel_cpf, criado_em, atualizado_em
      `,
      [
        id,
        nome,
        emailToPersist,
        senhaHash,
        nome,
        null,
        null,
        cpf,
      ]
    );

    const user = mapUser(result.rows[0]);
    const token = createToken(user.id);
    res.status(201).json({ token, user });
  })
);

/** --- Login --- */
authRouter.post(
  "/auth/login",
  asyncHandler(async (req, res) => {
    const payload = loginSchema.parse(req.body);

    await ensureUsuariosCpfColumn();

    const cpfParam = payload.cpf ?? null;
    const emailParam = payload.email ? payload.email.toLowerCase() : null;

    const result = await query<UserRow>(
      `
      SELECT id, nome, email, senha_hash, responsavel_nome, responsavel_parentesco, responsavel_telefone, responsavel_cpf, criado_em, atualizado_em
      FROM usuarios
      WHERE ($1::text IS NOT NULL AND responsavel_cpf = $1)
         OR ($2::text IS NOT NULL AND LOWER(email) = LOWER($2))
      LIMIT 1
      `,
      [cpfParam, emailParam]
    );

    if (!result.rowCount) {
      res.status(401).json({ message: "Credenciais invalidas." });
      return;
    }

    const row = result.rows[0];
    const senhaConfere = await bcrypt.compare(payload.senha, row.senha_hash);
    if (!senhaConfere) {
      res.status(401).json({ message: "Credenciais invalidas." });
      return;
    }

    const user = mapUser(row);
    const token = createToken(user.id);
    res.json({ token, user });
  })
);

/** --- Me --- */
authRouter.get(
  "/auth/me",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    await ensureUsuariosCpfColumn();

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Nao autenticado." });
      return;
    }

    const result = await query<UserRow>(
      `
      SELECT id, nome, email, senha_hash, responsavel_nome, responsavel_parentesco, responsavel_telefone, responsavel_cpf, criado_em, atualizado_em
      FROM usuarios
      WHERE id = $1
      LIMIT 1
      `,
      [userId]
    );

    if (!result.rowCount) {
      res.status(404).json({ message: "Usuario nao encontrado." });
      return;
    }

    res.json({ user: mapUser(result.rows[0]) });
  })
);

export { authRouter };
