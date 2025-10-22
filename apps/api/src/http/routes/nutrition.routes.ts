import { Router } from "express";
import { z } from "zod";

import { container } from "../../container";
import { asyncHandler } from "../utils/asyncHandler";

const nutritionRouter = Router();

nutritionRouter.use((req, res, next) => {
  if (process.env.NUTRITION_MODULE_ENABLED !== "true") {
    res.status(404).json({ message: "Modulo de nutricao desativado" });
    return;
  }
  next();
});

const dateSchema = z
  .string()
  .regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/u, "Data deve estar no formato YYYY-MM-DD");

const mealBodySchema = z.object({
  childId: z.string().trim().min(1, "Informe a crianca"),
  date: dateSchema,
  period: z.enum(["MORNING", "LUNCH", "AFTERNOON", "DINNER"]),
  items: z.array(z.string().trim().min(1).max(40)).min(1).max(10),
  note: z
    .string()
    .trim()
    .max(120)
    .optional(),
});

const waterBodySchema = z.object({
  childId: z.string().trim().min(1, "Informe a crianca"),
  amountMl: z.number().int().positive().max(1000).optional(),
});

const fruitBodySchema = z.object({
  childId: z.string().trim().min(1, "Informe a crianca"),
  kind: z
    .string()
    .trim()
    .max(60)
    .optional(),
});

const weekQuerySchema = z.object({
  childId: z.string().trim().min(1, "Informe a crianca"),
  start: dateSchema,
});

const preferencesBodySchema = z.object({
  childId: z.string().trim().min(1, "Informe a crianca"),
  lactoseFree: z.boolean().optional(),
  glutenFree: z.boolean().optional(),
  halalKosher: z.boolean().optional(),
  tipsTone: z.enum(["simple", "playful"]).optional(),
});

const preferencesQuerySchema = z.object({
  childId: z.string().trim().min(1, "Informe a crianca"),
});

function toDate(value: string): Date {
  return new Date(value + "T00:00:00Z");
}

nutritionRouter.post(
  "/meal",
  asyncHandler(async (req, res) => {
    const body = mealBodySchema.parse(req.body);
    const mealId = await container.repositories.nutrition.addMeal({
      userId: body.childId,
      date: toDate(body.date),
      period: body.period,
      items: body.items,
      note: body.note ?? null,
    });

    res.status(201).json({ id: mealId });
  })
);

nutritionRouter.post(
  "/water",
  asyncHandler(async (req, res) => {
    const body = waterBodySchema.parse(req.body);
    const hydrationId = await container.repositories.nutrition.addHydration({
      userId: body.childId,
      dateTime: new Date(),
      amountMl: body.amountMl ?? 200,
    });

    res.status(201).json({ id: hydrationId });
  })
);

nutritionRouter.post(
  "/fruit",
  asyncHandler(async (req, res) => {
    const body = fruitBodySchema.parse(req.body);
    const fruitId = await container.repositories.nutrition.addFruit({
      userId: body.childId,
      dateTime: new Date(),
      kind: body.kind ?? null,
    });

    res.status(201).json({ id: fruitId });
  })
);

nutritionRouter.get(
  "/day/:date",
  asyncHandler(async (req, res) => {
    const { date } = z.object({ date: dateSchema }).parse(req.params);
    const { childId } = preferencesQuerySchema.parse(req.query);

    const summary = await container.repositories.nutrition.getDaySummary(childId, toDate(date));

    res.json(summary);
  })
);

nutritionRouter.get(
  "/week",
  asyncHandler(async (req, res) => {
    const query = weekQuerySchema.parse(req.query);
    const summary = await container.repositories.nutrition.getWeekSummary(query.childId, toDate(query.start));

    res.json(summary);
  })
);

nutritionRouter.get(
  "/preferences",
  asyncHandler(async (req, res) => {
    const { childId } = preferencesQuerySchema.parse(req.query);
    const prefs = await container.repositories.nutrition.getPreferences(childId);

    res.json({
      childId: prefs.user_id,
      lactoseFree: prefs.lactose_free,
      glutenFree: prefs.gluten_free,
      halalKosher: prefs.halal_kosher,
      tipsTone: prefs.tips_tone,
    });
  })
);

nutritionRouter.post(
  "/preferences",
  asyncHandler(async (req, res) => {
    const body = preferencesBodySchema.parse(req.body);
    await container.repositories.nutrition.upsertPreferences({
      userId: body.childId,
      lactoseFree: body.lactoseFree,
      glutenFree: body.glutenFree,
      halalKosher: body.halalKosher,
      tipsTone: body.tipsTone,
    });

    res.status(204).send();
  })
);

export { nutritionRouter };
