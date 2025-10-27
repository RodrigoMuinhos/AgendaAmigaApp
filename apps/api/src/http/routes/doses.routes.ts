import { Router } from "express";
import { z } from "zod";

import { query } from "../../infra/database";
import { asyncHandler } from "../utils/asyncHandler";

type TreatmentRow = {
  id: string;
  nome: string;
  dose: string;
  horario: string;
  instrucoes: string | null;
};

type RoutineItem = {
  id: string;
  title: string;
  description?: string | null;
  scheduledAt: string;
  done: boolean;
  category: "dose";
};

const dosesRouter = Router();

const querySchema = z.object({
  date: z
    .string()
    .trim()
    .regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/u, "Data deve estar no formato YYYY-MM-DD")
    .optional(),
});

function parseTimes(schedule: string): string[] {
  return schedule
    .split(/[,;\n]/u)
    .flatMap((value) => value.split(/\s+/u))
    .map((value) => value.trim().replace(/[hH]/u, ":"))
    .map((value) => value.replace(/\s+/gu, ""))
    .filter((value) => /^[0-2][0-9]:[0-5][0-9]$/u.test(value));
}

function toIso(date: string, time: string): string {
  const [hours, minutes] = time.split(":").map((part) => Number.parseInt(part, 10));
  const target = new Date(Date.UTC(Number.parseInt(date.slice(0, 4), 10), Number.parseInt(date.slice(5, 7), 10) - 1, Number.parseInt(date.slice(8, 10), 10), hours, minutes, 0, 0));
  return target.toISOString();
}

dosesRouter.get(
  "/doses",
  asyncHandler(async (req, res) => {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      res.json([]);
      return;
    }

    const { date } = parsed.data;
    const targetDate = date ?? new Date().toISOString().slice(0, 10);

    const treatmentsResult = await query<TreatmentRow>(
      `
        SELECT
          id,
          nome,
          dose,
          horario,
          instrucoes
        FROM tratamentos
      `
    );

    const items: RoutineItem[] = [];

    for (const row of treatmentsResult.rows) {
      const times = parseTimes(row.horario);

      for (const time of times) {
        const identifier = `${row.id}-${time.replace(":", "")}`;
        items.push({
          id: identifier,
          title: row.nome,
          description: row.instrucoes ?? `Dose: ${row.dose}`,
          scheduledAt: toIso(targetDate, time),
          done: false,
          category: "dose",
        });
      }
    }

    res.json(items);
  })
);

export { dosesRouter };
