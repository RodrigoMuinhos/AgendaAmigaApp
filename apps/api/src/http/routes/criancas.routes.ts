import type { Request } from "express";
import { Router } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { query } from "../../infra/database";
import { asyncHandler } from "../utils/asyncHandler";

const DEFAULT_TUTOR_ID = process.env.DEFAULT_TUTOR_ID?.trim() || "demo-tutor";

const neurodivergenciaSchema = z.object({
  tipo: z.enum(["TEA", "TDAH"]),
  grau: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => (value && value.length ? value : undefined)),
});

const responsavelSchema = z.object({
  nome: z.string().trim().min(1).max(160),
  parentesco: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => (value && value.length ? value : undefined)),
  telefone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((value) => (value && value.length ? value : undefined)),
});

const criancaSchema = z.object({
  nome: z.string().trim().min(1).max(160),
  nascimentoISO: z
    .string()
    .trim()
    .refine((value) => !Number.isNaN(Date.parse(value)), { message: "Data de nascimento invalida" }),
  sexo: z.enum(["M", "F"]),
  responsavel: responsavelSchema,
  cartaoSUS: z
    .string()
    .trim()
    .max(60)
    .optional()
    .transform((value) => (value && value.length ? value : undefined)),
  cpf: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((value) => (value && value.length ? value : undefined)),
  convenioOperadora: z
    .string()
    .trim()
    .max(160)
    .optional()
    .transform((value) => (value && value.length ? value : undefined)),
  convenioNumero: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((value) => (value && value.length ? value : undefined)),
  tipoSanguineo: z
    .string()
    .trim()
    .max(5)
    .optional()
    .transform((value) => (value && value.length ? value : undefined)),
  alergias: z
    .array(z.string().trim().max(180))
    .optional()
    .default([])
    .transform((values) => values.filter((value) => value.length)),
  doencasCronicas: z
    .array(z.string().trim().max(180))
    .optional()
    .default([])
    .transform((values) => values.filter((value) => value.length)),
  medicacoes: z
    .array(z.string().trim().max(180))
    .optional()
    .default([])
    .transform((values) => values.filter((value) => value.length)),
  neurodivergencias: z.array(neurodivergenciaSchema).optional().default([]),
  pediatra: z
    .string()
    .trim()
    .max(160)
    .optional()
    .transform((value) => (value && value.length ? value : undefined)),
  avatarUrl: z
    .string()
    .trim()
    .max(400)
    .optional()
    .transform((value) => (value && value.length ? value : undefined)),
});

const requestSchema = criancaSchema.extend({
  tutorId: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => (value && value.length ? value : undefined)),
});

type CriancaInput = z.infer<typeof criancaSchema>;

type CriancaRegistro = CriancaInput & {
  id: string;
  criadoEmISO: string;
  atualizadoEmISO: string;
};

type CriancaRow = {
  payload: CriancaRegistro;
};

const criancasRouter = Router();

function resolveTutorId(req: Request, fallback?: string) {
  const header = req.header("x-tutor-id")?.trim();
  const queryId = typeof req.query.tutorId === "string" ? req.query.tutorId.trim() : undefined;
  return header || queryId || fallback || DEFAULT_TUTOR_ID;
}

function buildRegistro(id: string, input: CriancaInput, timestamps?: { criadoEmISO?: string; atualizadoEmISO?: string }): CriancaRegistro {
  const agora = new Date().toISOString();
  return {
    id,
    nome: input.nome.trim(),
    nascimentoISO: input.nascimentoISO,
    sexo: input.sexo,
    responsavel: {
      nome: input.responsavel.nome.trim(),
      parentesco: input.responsavel.parentesco,
      telefone: input.responsavel.telefone,
    },
    cartaoSUS: input.cartaoSUS,
    cpf: input.cpf,
    convenioOperadora: input.convenioOperadora,
    convenioNumero: input.convenioNumero,
    tipoSanguineo: input.tipoSanguineo,
    alergias: input.alergias?.length ? input.alergias : [],
    doencasCronicas: input.doencasCronicas?.length ? input.doencasCronicas : [],
    medicacoes: input.medicacoes?.length ? input.medicacoes : [],
    neurodivergencias: input.neurodivergencias?.length
      ? input.neurodivergencias.map((item) => ({
          tipo: item.tipo,
          ...(item.grau ? { grau: item.grau } : {}),
        }))
      : [],
    pediatra: input.pediatra,
    avatarUrl: input.avatarUrl,
    criadoEmISO: timestamps?.criadoEmISO ?? agora,
    atualizadoEmISO: timestamps?.atualizadoEmISO ?? agora,
  };
}

function normalizeRegistro(raw: CriancaRegistro): CriancaRegistro {
  return {
    ...raw,
    alergias: raw.alergias?.length ? raw.alergias : [],
    doencasCronicas: raw.doencasCronicas?.length ? raw.doencasCronicas : [],
    medicacoes: raw.medicacoes?.length ? raw.medicacoes : [],
    neurodivergencias: raw.neurodivergencias?.length ? raw.neurodivergencias : [],
  };
}

criancasRouter.get(
  "/criancas",
  asyncHandler(async (req, res) => {
    const tutorId = resolveTutorId(req);
    const result = await query<CriancaRow>(
      `
        SELECT payload
        FROM criancas
        WHERE tutor_id = $1
        ORDER BY criado_em DESC
      `,
      [tutorId]
    );

    const criancas = result.rows.map((row) => normalizeRegistro(row.payload));
    res.json(criancas);
  })
);

criancasRouter.get(
  "/criancas/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const tutorId = resolveTutorId(req);
    const result = await query<CriancaRow>(
      `
        SELECT payload
        FROM criancas
        WHERE id = $1 AND tutor_id = $2
        LIMIT 1
      `,
      [id, tutorId]
    );

    if (!result.rowCount) {
      res.status(404).json({ message: "Crianca nao encontrada" });
      return;
    }

    res.json(normalizeRegistro(result.rows[0].payload));
  })
);

criancasRouter.post(
  "/criancas",
  asyncHandler(async (req, res) => {
    const { tutorId: payloadTutorId, ...dados } = requestSchema.parse(req.body);
    const tutorId = resolveTutorId(req, payloadTutorId);
    const id = randomUUID();

    const registro = buildRegistro(id, dados);

    await query(
      `
        INSERT INTO criancas (
          id,
          tutor_id,
          nome,
          nascimento_iso,
          payload,
          criado_em,
          atualizado_em
        )
        VALUES ($1, $2, $3, $4, $5::jsonb, NOW(), NOW())
      `,
      [id, tutorId, registro.nome, registro.nascimentoISO, JSON.stringify(registro)]
    );

    res.status(201).json(registro);
  })
);

criancasRouter.put(
  "/criancas/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { tutorId: payloadTutorId, ...dados } = requestSchema.parse(req.body);
    const tutorId = resolveTutorId(req, payloadTutorId);

    const existente = await query<CriancaRow>(
      `
        SELECT payload
        FROM criancas
        WHERE id = $1 AND tutor_id = $2
        LIMIT 1
      `,
      [id, tutorId]
    );

    if (!existente.rowCount) {
      res.status(404).json({ message: "Crianca nao encontrada" });
      return;
    }

    const atual = normalizeRegistro(existente.rows[0].payload);
    const registro = buildRegistro(id, dados, {
      criadoEmISO: atual.criadoEmISO,
      atualizadoEmISO: new Date().toISOString(),
    });

    await query(
      `
        UPDATE criancas
        SET
          nome = $2,
          nascimento_iso = $3,
          payload = $4::jsonb,
          atualizado_em = NOW()
        WHERE id = $1 AND tutor_id = $5
      `,
      [id, registro.nome, registro.nascimentoISO, JSON.stringify(registro), tutorId]
    );

    res.json(registro);
  })
);

criancasRouter.delete(
  "/criancas/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const tutorId = resolveTutorId(req);

    const result = await query(
      `
        DELETE FROM criancas
        WHERE id = $1 AND tutor_id = $2
      `,
      [id, tutorId]
    );

    if (!result.rowCount) {
      res.status(404).json({ message: "Crianca nao encontrada" });
      return;
    }

    res.status(204).end();
  })
);

export { criancasRouter };
