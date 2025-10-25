/*
  Warnings:

  - You are about to drop the column `created_at` on the `fruit_intakes` table. All the data in the column will be lost.
  - You are about to drop the column `date_time` on the `fruit_intakes` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `fruit_intakes` table. All the data in the column will be lost.
  - You are about to drop the column `amount_ml` on the `hydrations` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `hydrations` table. All the data in the column will be lost.
  - You are about to drop the column `date_time` on the `hydrations` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `hydrations` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `meal_entries` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `meal_entries` table. All the data in the column will be lost.
  - The primary key for the `nutrition_preferences` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `nutrition_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `gluten_free` on the `nutrition_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `halal_kosher` on the `nutrition_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `lactose_free` on the `nutrition_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `tips_tone` on the `nutrition_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `nutrition_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `nutrition_preferences` table. All the data in the column will be lost.
  - Added the required column `dateTime` to the `fruit_intakes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `fruit_intakes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateTime` to the `hydrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `hydrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `meal_entries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `nutrition_preferences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `nutrition_preferences` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."idx_fruit_intakes_user_datetime";

-- DropIndex
DROP INDEX "public"."idx_hydrations_user_datetime";

-- DropIndex
DROP INDEX "public"."idx_meal_entries_user_date";

-- AlterTable
ALTER TABLE "fruit_intakes" DROP COLUMN "created_at",
DROP COLUMN "date_time",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dateTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "hydrations" DROP COLUMN "amount_ml",
DROP COLUMN "created_at",
DROP COLUMN "date_time",
DROP COLUMN "user_id",
ADD COLUMN     "amountMl" INTEGER NOT NULL DEFAULT 200,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dateTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "meal_entries" DROP COLUMN "created_at",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "nutrition_preferences" DROP CONSTRAINT "nutrition_preferences_pkey",
DROP COLUMN "created_at",
DROP COLUMN "gluten_free",
DROP COLUMN "halal_kosher",
DROP COLUMN "lactose_free",
DROP COLUMN "tips_tone",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "glutenFree" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "halalKosher" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lactoseFree" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tipsTone" TEXT NOT NULL DEFAULT 'simple',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ADD CONSTRAINT "nutrition_preferences_pkey" PRIMARY KEY ("userId");

-- CreateTable
CREATE TABLE "familias" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cep" TEXT,
    "endereco" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "cuidador_principal" TEXT,
    "relacao_cuidador_principal" TEXT,
    "contato" TEXT,
    "telefone_cuidador" TEXT,
    "foco_cuidado" TEXT,
    "observacoes" TEXT,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "familias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "familia_membros" (
    "id" TEXT NOT NULL,
    "familia_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "data_nascimento" DATE NOT NULL,
    "documento" TEXT,
    "cep" TEXT,
    "numero_endereco" TEXT,
    "endereco" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "avatar" TEXT,
    "historico_medico" TEXT,
    "limitacoes" TEXT,
    "alergias" TEXT,
    "peso" TEXT,
    "altura" TEXT,
    "imc" TEXT,
    "necessidades" TEXT,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "familia_membros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuidadores" (
    "id" TEXT NOT NULL,
    "familia_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "relacao" TEXT,
    "telefone" TEXT,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cuidadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tratamentos" (
    "id" TEXT NOT NULL,
    "familia_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "dose" TEXT NOT NULL,
    "horario" TEXT NOT NULL,
    "instrucoes" TEXT,
    "proxima_dose" TIMESTAMPTZ(6),
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tratamentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_familia_membros_familia" ON "familia_membros"("familia_id");

-- CreateIndex
CREATE INDEX "idx_cuidadores_familia" ON "cuidadores"("familia_id");

-- CreateIndex
CREATE INDEX "idx_tratamentos_familia" ON "tratamentos"("familia_id");

-- CreateIndex
CREATE INDEX "fruit_intakes_userId_dateTime_idx" ON "fruit_intakes"("userId", "dateTime");

-- CreateIndex
CREATE INDEX "hydrations_userId_dateTime_idx" ON "hydrations"("userId", "dateTime");

-- CreateIndex
CREATE INDEX "lembretes_atendimento_id_idx" ON "lembretes"("atendimento_id");

-- CreateIndex
CREATE INDEX "meal_entries_userId_date_idx" ON "meal_entries"("userId", "date");

-- CreateIndex
CREATE INDEX "medicamentos_paciente_id_idx" ON "medicamentos"("paciente_id");

-- CreateIndex
CREATE INDEX "nutrition_meal_items_refeicao_id_idx" ON "nutrition_meal_items"("refeicao_id");

-- AddForeignKey
ALTER TABLE "familia_membros" ADD CONSTRAINT "familia_membros_familia_id_fkey" FOREIGN KEY ("familia_id") REFERENCES "familias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuidadores" ADD CONSTRAINT "cuidadores_familia_id_fkey" FOREIGN KEY ("familia_id") REFERENCES "familias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tratamentos" ADD CONSTRAINT "tratamentos_familia_id_fkey" FOREIGN KEY ("familia_id") REFERENCES "familias"("id") ON DELETE CASCADE ON UPDATE CASCADE;
