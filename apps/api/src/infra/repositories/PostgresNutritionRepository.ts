import { randomUUID } from "crypto";

import { query } from "../database";

export type MealPeriod = "MORNING" | "LUNCH" | "AFTERNOON" | "DINNER";

export type MealPayload = {
  userId: string;
  date: Date;
  period: MealPeriod;
  items: string[];
  note?: string | null;
};

export type HydrationPayload = {
  userId: string;
  dateTime: Date;
  amountMl?: number;
};

export type FruitPayload = {
  userId: string;
  dateTime: Date;
  kind?: string | null;
};

export type PreferencesPayload = {
  userId: string;
  lactoseFree?: boolean;
  glutenFree?: boolean;
  halalKosher?: boolean;
  tipsTone?: string;
};

export type DaySummary = {
  date: string;
  score: number;
  scoreLabel: "low" | "ok" | "great";
  tip: string;
  meals: Array<{
    id: string;
    period: MealPeriod;
    items: string[];
    note: string | null;
  }>;
  hydration: number;
  fruits: Array<{ id: string; kind: string | null; dateTime: string }>;
};

export type WeekSummary = {
  range: { start: string; end: string };
  days: Array<{
    date: string;
    score: number;
    hydrationCount: number;
    fruitCount: number;
    veggiesCount: number;
    status: "green" | "yellow" | "red";
  }>;
  weeklyScore: number;
  plan: Array<{
    id: string;
    title: string;
    description: string;
    target: string;
    progress: number;
    goal: number;
  }>;
};

type PreferencesRow = {
  user_id: string;
  lactose_free: boolean;
  gluten_free: boolean;
  halal_kosher: boolean;
  tips_tone: string;
};

const VEGETABLE_KEYWORDS = ["verdura", "legume", "brocolis", "cenoura", "salada"];
const DEFAULT_PREFERENCES: PreferencesRow = {
  user_id: "",
  lactose_free: false,
  gluten_free: false,
  halal_kosher: false,
  tips_tone: "simple",
};

export class PostgresNutritionRepository {
  async addMeal(payload: MealPayload): Promise<string> {
    const id = randomUUID();
    const sql = [
      "INSERT INTO meal_entries (id, user_id, date, period, items, note, created_at)",
      "VALUES (, , , , ::jsonb, , NOW())",
    ].join("\n");
    await query(sql, [
      id,
      payload.userId,
      payload.date,
      payload.period,
      JSON.stringify(payload.items),
      payload.note ?? null,
    ]);
    return id;
  }

  async addHydration(payload: HydrationPayload): Promise<string> {
    const id = randomUUID();
    const sql = [
      "INSERT INTO hydrations (id, user_id, date_time, amount_ml, created_at)",
      "VALUES (, , , , NOW())",
    ].join("\n");
    await query(sql, [id, payload.userId, payload.dateTime, payload.amountMl ?? 200]);
    return id;
  }

  async addFruit(payload: FruitPayload): Promise<string> {
    const id = randomUUID();
    const sql = [
      "INSERT INTO fruit_intakes (id, user_id, date_time, kind, created_at)",
      "VALUES (, , , , NOW())",
    ].join("\n");
    await query(sql, [id, payload.userId, payload.dateTime, payload.kind ?? null]);
    return id;
  }

  async getPreferences(userId: string): Promise<PreferencesRow> {
    const sql = [
      "SELECT user_id, lactose_free, gluten_free, halal_kosher, tips_tone",
      "FROM nutrition_preferences",
      "WHERE user_id = ",
      "LIMIT 1",
    ].join("\n");
    const result = await query<PreferencesRow>(sql, [userId]);

    if (!result.rowCount) {
      return { ...DEFAULT_PREFERENCES, user_id: userId };
    }

    return result.rows[0];
  }

  async upsertPreferences(payload: PreferencesPayload): Promise<void> {
    const sql = [
      "INSERT INTO nutrition_preferences (user_id, lactose_free, gluten_free, halal_kosher, tips_tone, created_at, updated_at)",
      "VALUES (, , , , , NOW(), NOW())",
      "ON CONFLICT (user_id) DO UPDATE SET",
      "  lactose_free = COALESCE(EXCLUDED.lactose_free, nutrition_preferences.lactose_free),",
      "  gluten_free = COALESCE(EXCLUDED.gluten_free, nutrition_preferences.gluten_free),",
      "  halal_kosher = COALESCE(EXCLUDED.halal_kosher, nutrition_preferences.halal_kosher),",
      "  tips_tone = COALESCE(EXCLUDED.tips_tone, nutrition_preferences.tips_tone),",
      "  updated_at = NOW()",
    ].join("\n");
    await query(sql, [
      payload.userId,
      payload.lactoseFree ?? DEFAULT_PREFERENCES.lactose_free,
      payload.glutenFree ?? DEFAULT_PREFERENCES.gluten_free,
      payload.halalKosher ?? DEFAULT_PREFERENCES.halal_kosher,
      payload.tipsTone ?? DEFAULT_PREFERENCES.tips_tone,
    ]);
  }

  async getDaySummary(userId: string, date: Date): Promise<DaySummary> {
    const iso = formatDate(date);

    const mealsSql = [
      "SELECT id, period::text AS period, items, note",
      "FROM meal_entries",
      "WHERE user_id =  AND date = ",
      "ORDER BY period",
    ].join("\n");
    const hydrationSql = [
      "SELECT COUNT(*)::int AS count",
      "FROM hydrations",
      "WHERE user_id =  AND DATE(date_time) = ",
    ].join("\n");
    const fruitSql = [
      "SELECT id, kind, date_time",
      "FROM fruit_intakes",
      "WHERE user_id =  AND DATE(date_time) = ",
      "ORDER BY date_time",
    ].join("\n");

    const [mealsResult, hydrationResult, fruitResult, preferences] = await Promise.all([
      query<{ id: string; period: MealPeriod; items: any; note: string | null }>(mealsSql, [userId, iso]),
      query<{ count: number }>(hydrationSql, [userId, iso]),
      query<{ id: string; kind: string | null; date_time: Date }>(fruitSql, [userId, iso]),
      this.getPreferences(userId),
    ]);

    const hydrationCount = hydrationResult.rows[0]?.count ?? 0;
    const fruits = fruitResult.rows.map((row) => ({
      id: row.id,
      kind: row.kind,
      dateTime: row.date_time.toISOString(),
    }));

    const meals = mealsResult.rows.map((row) => ({
      id: row.id,
      period: row.period,
      items: Array.isArray(row.items) ? (row.items as string[]) : [],
      note: row.note,
    }));

    const veggieMeals = meals.filter((meal) => containsVeggies(meal.items)).length;
    const fruitCount = fruits.length;
    const score = hydrationCount + fruitCount + veggieMeals;
    const scoreLabel: DaySummary["scoreLabel"] = score >= 7 ? "great" : score >= 4 ? "ok" : "low";

    const tip = await this.computeDailyTip({
      userId,
      referenceDate: iso,
      hydrationCount,
      fruitCount,
      veggieMeals,
      preferences,
    });

    return {
      date: iso,
      score,
      scoreLabel,
      tip,
      meals,
      hydration: hydrationCount,
      fruits,
    };
  }

  async getWeekSummary(userId: string, start: Date): Promise<WeekSummary> {
    const startIso = formatDate(start);
    const daysInWeek = Array.from({ length: 7 }, (_, index) => addDays(start, index));
    const endIso = formatDate(daysInWeek[6]);

    const hydrationSql = [
      "SELECT DATE(date_time) AS date, COUNT(*)::int AS count",
      "FROM hydrations",
      "WHERE user_id =  AND DATE(date_time) BETWEEN  AND ",
      "GROUP BY DATE(date_time)",
    ].join("\n");
    const fruitSql = [
      "SELECT DATE(date_time) AS date, COUNT(*)::int AS count",
      "FROM fruit_intakes",
      "WHERE user_id =  AND DATE(date_time) BETWEEN  AND ",
      "GROUP BY DATE(date_time)",
    ].join("\n");
    const mealSql = [
      "SELECT date, items",
      "FROM meal_entries",
      "WHERE user_id =  AND date BETWEEN  AND ",
    ].join("\n");

    const [hydrations, fruits, meals] = await Promise.all([
      query<{ date: string; count: number }>(hydrationSql, [userId, startIso, endIso]),
      query<{ date: string; count: number }>(fruitSql, [userId, startIso, endIso]),
      query<{ date: string; items: any }>(mealSql, [userId, startIso, endIso]),
    ]);

    const hydrationMap = new Map(hydrations.rows.map((row) => [row.date, Number(row.count)]));
    const fruitMap = new Map(fruits.rows.map((row) => [row.date, Number(row.count)]));
    const veggieMap = new Map<string, number>();

    meals.rows.forEach((row) => {
      const items = Array.isArray(row.items) ? (row.items as string[]) : [];
      if (containsVeggies(items)) {
        veggieMap.set(row.date, (veggieMap.get(row.date) ?? 0) + 1);
      }
    });

    const daySummaries = daysInWeek.map((dateObj) => {
      const iso = formatDate(dateObj);
      const hydrationCount = hydrationMap.get(iso) ?? 0;
      const fruitCount = fruitMap.get(iso) ?? 0;
      const veggieCount = veggieMap.get(iso) ?? 0;
      const score = hydrationCount + fruitCount + veggieCount;
      const status: "green" | "yellow" | "red" = score >= 7 ? "green" : score >= 4 ? "yellow" : "red";
      return {
        date: iso,
        score,
        hydrationCount,
        fruitCount,
        veggiesCount: veggieCount,
        status,
      };
    });

    const weeklyScore = daySummaries.reduce((total, day) => total + day.score, 0);
    const plan = buildSimplePlan(daySummaries);

    return {
      range: { start: startIso, end: endIso },
      days: daySummaries,
      weeklyScore,
      plan,
    };
  }

  private async computeDailyTip({
    userId,
    referenceDate,
    hydrationCount,
    fruitCount,
    veggieMeals,
    preferences,
  }: {
    userId: string;
    referenceDate: string;
    hydrationCount: number;
    fruitCount: number;
    veggieMeals: number;
    preferences: PreferencesRow;
  }): Promise<string> {
    const current = new Date(referenceDate);
    const previousDay = formatDate(addDays(current, -1));
    const twoDaysAgo = formatDate(addDays(current, -2));

    const hydrationSql = [
      "SELECT COUNT(*)::int AS count",
      "FROM hydrations",
      "WHERE user_id =  AND DATE(date_time) = ",
    ].join("\n");
    const fruitsSql = [
      "SELECT DATE(date_time) AS date, COUNT(*)::int AS count",
      "FROM fruit_intakes",
      "WHERE user_id =  AND DATE(date_time) BETWEEN  AND ",
      "GROUP BY DATE(date_time)",
    ].join("\n");
    const veggiesSql = [
      "SELECT COUNT(*)::int AS count",
      "FROM meal_entries",
      "WHERE user_id = ",
      "  AND date BETWEEN ::date - INTERVAL '6 days' AND ::date",
      "  AND (items::text ILIKE '%verdura%' OR items::text ILIKE '%legume%' OR items::text ILIKE '%brocolis%' OR items::text ILIKE '%salada%')",
    ].join("\n");

    const [previousHydration, fruitsHistory, veggiesWeek] = await Promise.all([
      query<{ count: number }>(hydrationSql, [userId, previousDay]),
      query<{ date: string; count: number }>(fruitsSql, [userId, twoDaysAgo, previousDay]),
      query<{ count: number }>(veggiesSql, [userId, referenceDate]),
    ]);

    const prevHydrationCount = previousHydration.rows[0]?.count ?? hydrationCount;
    const fruitsTwoDays = fruitsHistory.rows.reduce((acc, row) => {
      acc[row.date] = row.count;
      return acc;
    }, {} as Record<string, number>);
    const veggiesWeekCount = veggiesWeek.rows[0]?.count ?? veggieMeals;

    if (prevHydrationCount < 2) {
      return "Leve sua garrafinha. Dois goles a cada hora ajudam muito.";
    }

    const zeroFruitPreviousTwoDays =
      (fruitsTwoDays[previousDay] ?? 0) === 0 && (fruitsTwoDays[twoDaysAgo] ?? 0) === 0;

    if (zeroFruitPreviousTwoDays) {
      return "Coloque uma banana ou maca na mochila hoje.";
    }

    if (veggiesWeekCount < 3) {
      return "Tente meio prato de cores no almoco amanha.";
    }

    if (preferences.tips_tone === "playful") {
      return "Voce esta arrasando! Continue com agua por perto o dia todo.";
    }

    return "Otimo ritmo! Mantenha agua e frutas por perto durante o dia.";
  }
}

function containsVeggies(items: string[]): boolean {
  const normalized = items.map((item) => item.toLowerCase());
  return VEGETABLE_KEYWORDS.some((keyword) => normalized.some((item) => item.includes(keyword)));
}

function formatDate(date: Date): string {
  const clone = new Date(date);
  clone.setUTCHours(0, 0, 0, 0);
  return clone.toISOString().substring(0, 10);
}

function addDays(date: Date, amount: number): Date {
  const clone = new Date(date);
  clone.setDate(clone.getDate() + amount);
  return clone;
}

function buildSimplePlan(days: WeekSummary["days"]): WeekSummary["plan"] {
  const hydrationDays = days.filter((day) => day.hydrationCount >= 6).length;
  const fruitDays = days.filter((day) => day.fruitCount >= 1).length;
  const veggieDays = days.filter((day) => day.veggiesCount >= 1).length;

  return [
    {
      id: "water",
      title: "Meta de agua",
      description: "Beber 6 copos em 4 dias da semana.",
      target: "6 copos por dia",
      progress: hydrationDays,
      goal: 4,
    },
    {
      id: "fruit",
      title: "Meta de frutas",
      description: "Comer ao menos uma fruta em 5 dias.",
      target: "1 fruta por dia",
      progress: fruitDays,
      goal: 5,
    },
    {
      id: "veggies",
      title: "Meta de cores",
      description: "Meio prato colorido em 3 almocos.",
      target: "Prato colorido",
      progress: veggieDays,
      goal: 3,
    },
  ];
}
