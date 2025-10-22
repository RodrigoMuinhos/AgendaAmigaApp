-- This migration introduces the nutrition module storage.
-- It only creates new enums and tables and therefore is safe for rolling deploys:
-- no existing tables or columns are dropped or altered, and foreign keys point to existing tables.

CREATE TYPE "NutritionMealType" AS ENUM ('CAFE', 'LANCHE', 'ALMOCO', 'JANTAR', 'EXTRA');
CREATE TYPE "NutritionFoodGroup" AS ENUM ('CEREAIS_TUBERCULOS', 'PROTEINA', 'VEGETAL', 'FRUTA', 'GORDURA_BOA', 'OUTRO');
CREATE TYPE "NutritionTexture" AS ENUM ('LIQUIDO', 'AMASSADO', 'PICADO', 'SOLIDO');

CREATE TABLE "nutrition_food_items" (
    "id" TEXT PRIMARY KEY,
    "nome" TEXT NOT NULL UNIQUE,
    "grupo" "NutritionFoodGroup" NOT NULL,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "atualizado_em" TIMESTAMPTZ(6) NOT NULL
);

CREATE TABLE "nutrition_meal_entries" (
    "id" TEXT PRIMARY KEY,
    "paciente_id" TEXT NOT NULL,
    "dia" DATE NOT NULL,
    "tipo" "NutritionMealType" NOT NULL,
    "aceitacao_media" SMALLINT,
    "observacoes" TEXT,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "atualizado_em" TIMESTAMPTZ(6) NOT NULL
);

CREATE UNIQUE INDEX "nutrition_meal_entry_unique" ON "nutrition_meal_entries" ("paciente_id", "dia", "tipo");

ALTER TABLE "nutrition_meal_entries"
    ADD CONSTRAINT "nutrition_meal_entry_child_fk"
    FOREIGN KEY ("paciente_id") REFERENCES "pacientes" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "nutrition_meal_items" (
    "id" TEXT PRIMARY KEY,
    "refeicao_id" TEXT NOT NULL,
    "alimento_id" TEXT,
    "nome_personalizado" TEXT,
    "grupo_alimentar" "NutritionFoodGroup" NOT NULL,
    "quantidade" TEXT,
    "textura" "NutritionTexture" NOT NULL,
    "aceitacao" SMALLINT NOT NULL,
    "observacoes" TEXT,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    CONSTRAINT "nutrition_meal_items_aceitacao_check" CHECK ("aceitacao" BETWEEN 0 AND 5)
);

ALTER TABLE "nutrition_meal_items"
    ADD CONSTRAINT "nutrition_meal_item_meal_fk"
    FOREIGN KEY ("refeicao_id") REFERENCES "nutrition_meal_entries" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "nutrition_meal_items"
    ADD CONSTRAINT "nutrition_meal_item_food_fk"
    FOREIGN KEY ("alimento_id") REFERENCES "nutrition_food_items" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "nutrition_daily_checklists" (
    "id" TEXT PRIMARY KEY,
    "paciente_id" TEXT NOT NULL,
    "dia" DATE NOT NULL,
    "ofereceu_legume" BOOLEAN NOT NULL DEFAULT FALSE,
    "introduziu_novo" BOOLEAN NOT NULL DEFAULT FALSE,
    "ofereceu_agua" BOOLEAN NOT NULL DEFAULT FALSE,
    "observacoes" TEXT,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "atualizado_em" TIMESTAMPTZ(6) NOT NULL
);

CREATE UNIQUE INDEX "nutrition_checklist_unique" ON "nutrition_daily_checklists" ("paciente_id", "dia");

ALTER TABLE "nutrition_daily_checklists"
    ADD CONSTRAINT "nutrition_checklist_child_fk"
    FOREIGN KEY ("paciente_id") REFERENCES "pacientes" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "nutrition_feed_settings" (
    "id" TEXT PRIMARY KEY,
    "paciente_id" TEXT NOT NULL UNIQUE,
    "alerta_mel_habilitado" BOOLEAN NOT NULL DEFAULT TRUE,
    "alerta_acucar_habilitado" BOOLEAN NOT NULL DEFAULT TRUE,
    "observacoes" TEXT,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "atualizado_em" TIMESTAMPTZ(6) NOT NULL
);

ALTER TABLE "nutrition_feed_settings"
    ADD CONSTRAINT "nutrition_settings_child_fk"
    FOREIGN KEY ("paciente_id") REFERENCES "pacientes" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "nutrition_reactions" (
    "id" TEXT PRIMARY KEY,
    "paciente_id" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "descricao" TEXT NOT NULL,
    "severidade" SMALLINT NOT NULL,
    "alimento_id" TEXT,
    "alimento_manual" TEXT,
    "observacoes" TEXT,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "atualizado_em" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "nutrition_reactions_severity_check" CHECK ("severidade" BETWEEN 1 AND 5)
);

CREATE INDEX "idx_nutrition_reactions_child_date" ON "nutrition_reactions" ("paciente_id", "data");

ALTER TABLE "nutrition_reactions"
    ADD CONSTRAINT "nutrition_reaction_child_fk"
    FOREIGN KEY ("paciente_id") REFERENCES "pacientes" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "nutrition_reactions"
    ADD CONSTRAINT "nutrition_reaction_food_fk"
    FOREIGN KEY ("alimento_id") REFERENCES "nutrition_food_items" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

