import { Router } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { query } from "../../infra/database";
import { BadRequestError } from "../errors/BadRequestError";
import { asyncHandler } from "../utils/asyncHandler";

type TreatmentRow = {
  id: string;
  familia_id: string;
  nome: string;
  dose: string;
  horario: string;
  instrucoes: string | null;
};

type TreatmentResponse = {
  id: string;
  familyId: string;
  name: string;
  dose: string;
  schedule: string;
  instructions?: string | null;
  doses?: Array<{
    id: string;
    treatmentId: string;
    schedule: string;
    dose: string;
    instructions?: string | null;
  }>;
  nextDose?: string;
};

const treatmentsRouter = Router();

const treatmentBodySchema = z.object({
  familyId: z.string().trim().min(1),
  name: z.string().trim().min(1).max(160),
  dose: z.string().trim().min(1).max(120),
  schedule: z.string().trim().min(1).max(200),
  instructions: z.string().trim().max(500).optional(),
});

function parseSchedule(schedule: string): string[] {
  return schedule
    .split(/[,;\n]/u)
    .flatMap((value) => value.split(/\s+/u))
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function normalizeTimeCandidates(schedule: string): string[] {
  return parseSchedule(schedule)
    .map((value) => value.replace(/[hH]/u, ":"))
    .map((value) => value.replace(/\s+/gu, ""))
    .filter((value) => /^[0-2][0-9]:[0-5][0-9]$/u.test(value));
}

function computeNextDose(schedule: string, reference: Date): string | undefined {
  const times = normalizeTimeCandidates(schedule);
  if (!times.length) {
    return undefined;
  }

  const referenceUtc = new Date(reference.toISOString());
  const year = referenceUtc.getUTCFullYear();
  const month = referenceUtc.getUTCMonth();
  const day = referenceUtc.getUTCDate();

  const upcomingToday = times
    .map((time) => {
      const [hours, minutes] = time.split(":").map((part) => Number.parseInt(part, 10));
      const candidate = new Date(Date.UTC(year, month, day, hours, minutes, 0, 0));
      return { iso: candidate.toISOString(), date: candidate };
    })
    .find((candidate) => candidate.date.getTime() > referenceUtc.getTime());

  if (upcomingToday) {
    return upcomingToday.iso;
  }

  const [firstHours, firstMinutes] = times[0].split(":").map((part) => Number.parseInt(part, 10));
  const tomorrow = new Date(Date.UTC(year, month, day + 1, firstHours, firstMinutes, 0, 0));
  return tomorrow.toISOString();
}

function mapTreatment(row: TreatmentRow, referenceDate: Date): TreatmentResponse {
  const normalizedTimes = normalizeTimeCandidates(row.horario);

  const doses = normalizedTimes.length
    ? normalizedTimes.map((time, index) => ({
        id: `${row.id}-dose-${index}`,
        treatmentId: row.id,
        schedule: time,
        dose: row.dose,
        instructions: row.instrucoes,
      }))
    : undefined;

  const nextDose = computeNextDose(row.horario, referenceDate);

  return {
    id: row.id,
    familyId: row.familia_id,
    name: row.nome,
    dose: row.dose,
    schedule: row.horario,
    instructions: row.instrucoes,
    doses,
    nextDose,
  };
}

treatmentsRouter.get(
  "/tratamentos",
  asyncHandler(async (_req, res) => {
    const treatmentsResult = await query<TreatmentRow>(
      `
        SELECT
          id,
          familia_id,
          nome,
          dose,
          horario,
          instrucoes
        FROM tratamentos
        ORDER BY nome
      `
    );

    const now = new Date();
    const response = treatmentsResult.rows.map((row) => mapTreatment(row, now));
    res.json(response);
  })
);

treatmentsRouter.post(
  "/tratamentos",
  asyncHandler(async (req, res) => {
    const body = treatmentBodySchema.parse(req.body);

    const familyExists = await query<{ exists: boolean }>(
      `
        SELECT EXISTS (
          SELECT 1 FROM familias WHERE id = $1
        ) AS exists
      `,
      [body.familyId.trim()]
    );

    if (!familyExists.rows[0]?.exists) {
      throw new BadRequestError("Familia nao encontrada");
    }

    const treatmentId = randomUUID();

    await query(
      `
        INSERT INTO tratamentos (
          id,
          familia_id,
          nome,
          dose,
          horario,
          instrucoes,
          atualizado_em
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `,
      [
        treatmentId,
        body.familyId.trim(),
        body.name.trim(),
        body.dose.trim(),
        body.schedule.trim(),
        body.instructions ? body.instructions.trim() : null,
      ]
    );

    const treatment = await query<TreatmentRow>(
      `
        SELECT
          id,
          familia_id,
          nome,
          dose,
          horario,
          instrucoes
        FROM tratamentos
        WHERE id = $1
      `,
      [treatmentId]
    );

    if (!treatment.rowCount) {
      throw new BadRequestError("Nao foi possivel criar o tratamento");
    }

    const response = mapTreatment(treatment.rows[0], new Date());
    res.status(201).json(response);
  })
);

export { treatmentsRouter };
