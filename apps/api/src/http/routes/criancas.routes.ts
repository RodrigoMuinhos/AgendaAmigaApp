import type { Request } from "express";
import { Router } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { query } from "../../infra/database";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate, type AuthenticatedRequest } from "../middlewares/authenticate";

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

const responsavelSchema = z
  .object({
    nome: z.string().trim().max(160).optional(),
    parentesco: z.string().trim().max(120).optional(),
    telefone: z.string().trim().max(40).optional(),
  })
  .optional();

const genericObjectSchema = z
  .record(z.string(), z.any())
  .optional()
  .transform((value) => {
    if (!value) return undefined;
    return hasRelevantValue(value) ? value : undefined;
  });

const acompanhamentosSchema = z
  .array(z.record(z.string(), z.any()))
  .optional()
  .transform((items) => {
    if (!items) return undefined;
    const validItems = items.filter((item) => hasRelevantValue(item));
    return validItems.length ? validItems : undefined;
  });

const criancaSchema = z.object({
  nome: z.string().trim().min(1).max(160),
  nascimentoISO: z
    .string()
    .trim()
    .refine((value) => !Number.isNaN(Date.parse(value)), { message: "Data de nascimento invalida" }),
  sexo: z.enum(["M", "F", "O"]),
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
  nascimento: genericObjectSchema,
  triagensNeonatais: genericObjectSchema,
  vacinasNascimento: genericObjectSchema,
  altaAleitamento: genericObjectSchema,
  acompanhamentosPeriodicos: acompanhamentosSchema,
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

type ResponsavelRegistro = {
  nome?: string;
  parentesco?: string;
  telefone?: string;
};

type CriancaRegistro = Omit<CriancaInput, "responsavel"> & {
  id: string;
  criadoEmISO: string;
  atualizadoEmISO: string;
  responsavel?: ResponsavelRegistro;
  nascimento?: Record<string, unknown>;
  triagensNeonatais?: Record<string, unknown>;
  vacinasNascimento?: Record<string, unknown>;
  altaAleitamento?: Record<string, unknown>;
  acompanhamentosPeriodicos?: Record<string, unknown>[];
};

type CriancaRow = {
  id: string;
  tutor_id: string;
  nome: string;
  nascimento_iso: string;
  criado_em: Date;
  atualizado_em: Date;
  payload: Partial<CriancaRegistro> | null;
};

const criancasRouter = Router();
criancasRouter.use(authenticate);

function resolveTutorId(req: Request, fallback?: string) {
  const authReq = req as AuthenticatedRequest;
  const authenticatedId = authReq.user?.id;
  if (authenticatedId) {
    return authenticatedId;
  }
  return fallback || DEFAULT_TUTOR_ID;
}

function buildRegistro(id: string, input: CriancaInput, timestamps?: { criadoEmISO?: string; atualizadoEmISO?: string }): CriancaRegistro {
  const agora = new Date().toISOString();
  const responsavel = normalizeResponsavel(input.responsavel);
  const nascimento = normalizeObject(input.nascimento as Record<string, unknown> | undefined);
  const triagensNeonatais = normalizeObject(
    input.triagensNeonatais as Record<string, unknown> | undefined
  );
  const vacinasNascimento = normalizeObject(
    input.vacinasNascimento as Record<string, unknown> | undefined
  );
  const altaAleitamento = normalizeObject(input.altaAleitamento as Record<string, unknown> | undefined);
  const acompanhamentosPeriodicos = normalizeArrayOfObjects(
    input.acompanhamentosPeriodicos as Array<Record<string, unknown>> | undefined
  );

  return {
    id,
    nome: input.nome.trim(),
    nascimentoISO: input.nascimentoISO,
    sexo: input.sexo === "M" || input.sexo === "F" || input.sexo === "O" ? input.sexo : "O",
    ...(responsavel ? { responsavel } : {}),
    cartaoSUS: input.cartaoSUS,
    cpf: input.cpf,
    convenioOperadora: input.convenioOperadora,
    convenioNumero: input.convenioNumero,
    tipoSanguineo: input.tipoSanguineo,
    alergias: input.alergias?.length ? input.alergias : [],
    doencasCronicas: input.doencasCronicas?.length ? input.doencasCronicas : [],
    medicacoes: input.medicacoes?.length ? input.medicacoes : [],
    neurodivergencias: sanitizeNeurodivergenciasInput(input.neurodivergencias),
    pediatra: input.pediatra,
    avatarUrl: input.avatarUrl,
    ...(nascimento ? { nascimento } : {}),
    ...(triagensNeonatais ? { triagensNeonatais } : {}),
    ...(vacinasNascimento ? { vacinasNascimento } : {}),
    ...(altaAleitamento ? { altaAleitamento } : {}),
    ...(acompanhamentosPeriodicos ? { acompanhamentosPeriodicos } : {}),
    criadoEmISO: timestamps?.criadoEmISO ?? agora,
    atualizadoEmISO: timestamps?.atualizadoEmISO ?? agora,
  };
}

function asOptionalString(value: unknown) {
  return typeof value === "string" && value.trim().length ? value : undefined;
}

function normalizeResponsavel(
  value: { nome?: unknown; parentesco?: unknown; telefone?: unknown } | undefined
): ResponsavelRegistro | undefined {
  if (!value) return undefined;
  const nome = asOptionalString(value.nome);
  const parentesco = asOptionalString(value.parentesco);
  const telefone = asOptionalString(value.telefone);

  if (!nome && !parentesco && !telefone) {
    return undefined;
  }

  return {
    ...(nome ? { nome } : {}),
    ...(parentesco ? { parentesco } : {}),
    ...(telefone ? { telefone } : {}),
  };
}

function sanitizeNeurodivergenciasInput(
  items: CriancaInput["neurodivergencias"]
): CriancaRegistro["neurodivergencias"] {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      if (!item || typeof item !== "object") return undefined;
      const tipo = typeof item.tipo === "string" ? item.tipo : undefined;
      if (!tipo) return undefined;
      const grau = asOptionalString(item.grau);
      return {
        tipo,
        ...(grau ? { grau } : {}),
      };
    })
    .filter((item): item is CriancaRegistro["neurodivergencias"][number] => Boolean(item));
}

function normalizeNeurodivergenciasPayload(
  value: unknown
): CriancaRegistro["neurodivergencias"] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return undefined;
      const registro = item as { tipo?: unknown; grau?: unknown };
      const tipo = typeof registro.tipo === "string" ? registro.tipo : undefined;
      if (!tipo) return undefined;
      const grau = asOptionalString(registro.grau);
      return {
        tipo,
        ...(grau ? { grau } : {}),
      };
    })
    .filter((item): item is CriancaRegistro["neurodivergencias"][number] => Boolean(item));
}

function hasRelevantValue(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.some((item) => hasRelevantValue(item));
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some((item) => hasRelevantValue(item));
  }
  return true;
}

function normalizeObject(value: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!value) return undefined;
  const normalized: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (raw === undefined || raw === null) continue;
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (trimmed.length) {
        normalized[key] = trimmed;
      }
      continue;
    }
    if (Array.isArray(raw)) {
      const filtered = raw.filter((item) => hasRelevantValue(item));
      if (filtered.length) {
        normalized[key] = filtered;
      }
      continue;
    }
    if (typeof raw === "object") {
      const nested = normalizeObject(raw as Record<string, unknown>);
      if (nested && Object.keys(nested).length) {
        normalized[key] = nested;
      }
      continue;
    }
    normalized[key] = raw;
  }
  return Object.keys(normalized).length ? normalized : undefined;
}

function normalizeArrayOfObjects(items: Array<Record<string, unknown>> | undefined) {
  if (!Array.isArray(items)) return undefined;
  const normalized = items
    .map((item) => normalizeObject(item))
    .filter(
      (item): item is Record<string, unknown> =>
        item !== undefined && item !== null && typeof item === "object" && Object.keys(item).length > 0
    );
  return normalized.length ? normalized : undefined;
}

function completarRegistro(row: CriancaRow): CriancaRegistro {
  const payload = row.payload ?? {};
  const alergias = Array.isArray(payload.alergias) ? payload.alergias.filter((item) => typeof item === "string" && item.trim().length) : [];
  const doencasCronicas = Array.isArray(payload.doencasCronicas)
    ? payload.doencasCronicas.filter((item) => typeof item === "string" && item.trim().length)
    : [];
  const medicacoes = Array.isArray(payload.medicacoes)
    ? payload.medicacoes.filter((item) => typeof item === "string" && item.trim().length)
    : [];
  const neurodivergencias = normalizeNeurodivergenciasPayload(payload.neurodivergencias);

  const responsavelRaw =
    payload.responsavel && typeof payload.responsavel === "object"
      ? (payload.responsavel as { nome?: unknown; parentesco?: unknown; telefone?: unknown })
      : undefined;
  const responsavel = normalizeResponsavel(responsavelRaw);

  const nascimento =
    payload.nascimento && typeof payload.nascimento === "object"
      ? normalizeObject(payload.nascimento as Record<string, unknown>)
      : undefined;
  const triagensNeonatais =
    payload.triagensNeonatais && typeof payload.triagensNeonatais === "object"
      ? normalizeObject(payload.triagensNeonatais as Record<string, unknown>)
      : undefined;
  const vacinasNascimento =
    payload.vacinasNascimento && typeof payload.vacinasNascimento === "object"
      ? normalizeObject(payload.vacinasNascimento as Record<string, unknown>)
      : undefined;
  const altaAleitamento =
    payload.altaAleitamento && typeof payload.altaAleitamento === "object"
      ? normalizeObject(payload.altaAleitamento as Record<string, unknown>)
      : undefined;
  const acompanhamentosPeriodicos = normalizeArrayOfObjects(
    payload.acompanhamentosPeriodicos as Array<Record<string, unknown>> | undefined
  );

  const criadoEmISO =
    typeof payload.criadoEmISO === "string" && payload.criadoEmISO.trim().length
      ? payload.criadoEmISO
      : row.criado_em.toISOString();
  const atualizadoEmISO =
    typeof payload.atualizadoEmISO === "string" && payload.atualizadoEmISO.trim().length
      ? payload.atualizadoEmISO
      : row.atualizado_em.toISOString();

  return {
    id: asOptionalString(payload.id) ?? row.id,
    nome: asOptionalString(payload.nome) ?? row.nome,
    nascimentoISO: asOptionalString(payload.nascimentoISO) ?? row.nascimento_iso,
    sexo:
      payload.sexo === "M" || payload.sexo === "F" || payload.sexo === "O"
        ? payload.sexo
        : "O",
    ...(responsavel ? { responsavel } : {}),
    cartaoSUS: asOptionalString(payload.cartaoSUS),
    cpf: asOptionalString(payload.cpf),
    convenioOperadora: asOptionalString(payload.convenioOperadora),
    convenioNumero: asOptionalString(payload.convenioNumero),
    tipoSanguineo: asOptionalString(payload.tipoSanguineo) as CriancaRegistro["tipoSanguineo"],
    alergias,
    doencasCronicas,
    medicacoes,
    neurodivergencias,
    pediatra: asOptionalString(payload.pediatra),
    avatarUrl: asOptionalString(payload.avatarUrl),
    nascimento,
    triagensNeonatais,
    vacinasNascimento,
    altaAleitamento,
    acompanhamentosPeriodicos,
    criadoEmISO,
    atualizadoEmISO,
  };
}

criancasRouter.get(
  "/criancas",
  asyncHandler(async (req, res) => {
    const tutorId = resolveTutorId(req);
    const result = await query<CriancaRow>(
      `
        SELECT id, tutor_id, nome, nascimento_iso, criado_em, atualizado_em, payload
        FROM criancas
        WHERE tutor_id = $1
        ORDER BY criado_em DESC
      `,
      [tutorId]
    );

    const criancas = result.rows.map((row) => completarRegistro(row));
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
        SELECT id, tutor_id, nome, nascimento_iso, criado_em, atualizado_em, payload
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

    res.json(completarRegistro(result.rows[0]));
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
        SELECT id, tutor_id, nome, nascimento_iso, criado_em, atualizado_em, payload
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

    const atual = completarRegistro(existente.rows[0]);
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
