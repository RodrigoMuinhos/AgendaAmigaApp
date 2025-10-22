-- Adds simplified nutrition diary tables; only CREATE statements to keep rollout safe (no drops or modifications).

CREATE TYPE "MealPeriod" AS ENUM ('MORNING', 'LUNCH', 'AFTERNOON', 'DINNER');

CREATE TABLE "meal_entries" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "period" "MealPeriod" NOT NULL,
    "items" JSONB NOT NULL,
    "note" VARCHAR(160),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_meal_entries_user_date" ON "meal_entries" ("user_id", "date");

CREATE TABLE "hydrations" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "date_time" TIMESTAMPTZ(6) NOT NULL,
    "amount_ml" INTEGER NOT NULL DEFAULT 200,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_hydrations_user_datetime" ON "hydrations" ("user_id", "date_time");

CREATE TABLE "fruit_intakes" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "date_time" TIMESTAMPTZ(6) NOT NULL,
    "kind" VARCHAR(60),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_fruit_intakes_user_datetime" ON "fruit_intakes" ("user_id", "date_time");

CREATE TABLE "nutrition_preferences" (
    "user_id" TEXT PRIMARY KEY,
    "lactose_free" BOOLEAN NOT NULL DEFAULT FALSE,
    "gluten_free" BOOLEAN NOT NULL DEFAULT FALSE,
    "halal_kosher" BOOLEAN NOT NULL DEFAULT FALSE,
    "tips_tone" TEXT NOT NULL DEFAULT 'simple',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);
