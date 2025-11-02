-- CreateEnum
CREATE TYPE "EsquemaTipo" AS ENUM ('DIARIO_HORARIOS_FIXOS', 'SEMANAL_DIAS_FIXOS');

-- CreateEnum
CREATE TYPE "DoseStatus" AS ENUM ('PENDENTE', 'TOMADO', 'ATRASADO');

-- CreateEnum
CREATE TYPE "TipoAtendimento" AS ENUM ('CONSULTA', 'EXAME', 'TERAPIA');

-- CreateEnum
CREATE TYPE "StatusAtendimento" AS ENUM ('AGENDADO', 'REALIZADO', 'FALTOU', 'CANCELADO');

-- CreateEnum
CREATE TYPE "CanalLembrete" AS ENUM ('PUSH', 'EMAIL', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "NutritionMealType" AS ENUM ('CAFE', 'LANCHE', 'ALMOCO', 'JANTAR', 'EXTRA');

-- CreateEnum
CREATE TYPE "NutritionFoodGroup" AS ENUM ('CEREAIS_TUBERCULOS', 'PROTEINA', 'VEGETAL', 'FRUTA', 'GORDURA_BOA', 'OUTRO');

-- CreateEnum
CREATE TYPE "NutritionTexture" AS ENUM ('LIQUIDO', 'AMASSADO', 'PICADO', 'SOLIDO');

-- CreateEnum
CREATE TYPE "MealPeriod" AS ENUM ('MORNING', 'LUNCH', 'AFTERNOON', 'DINNER');

-- CreateTable
CREATE TABLE "pacientes" (
    "id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "nome_completo" TEXT NOT NULL,
    "condicoes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "alergias" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "plano_saude_operadora" TEXT,
    "plano_saude_numero" TEXT,
    "plano_saude_validade" TIMESTAMPTZ(6),
    "plano_saude_arquivado" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "criancas" (
    "id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "nascimento_iso" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "criancas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profissionais" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "especialidade" TEXT,
    "telefone" TEXT,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "profissionais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicamentos" (
    "id" TEXT NOT NULL,
    "paciente_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "dosagem" DECIMAL(10,3) NOT NULL,
    "unidade_dosagem" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "esquema_tipo" "EsquemaTipo",
    "esquema_timezone" TEXT,
    "esquema_periodo_inicio" TIMESTAMPTZ(6),
    "esquema_periodo_fim" TIMESTAMPTZ(6),
    "esquema_horarios" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "esquema_dias_semana" SMALLINT[] DEFAULT ARRAY[]::SMALLINT[],
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "medicamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dose_logs" (
    "id" TEXT NOT NULL,
    "medicamento_id" TEXT NOT NULL,
    "horario_previsto" TIMESTAMPTZ(6) NOT NULL,
    "status" "DoseStatus" NOT NULL,
    "horario_real" TIMESTAMPTZ(6),
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "dose_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atendimentos" (
    "id" TEXT NOT NULL,
    "paciente_id" TEXT NOT NULL,
    "tipo" "TipoAtendimento" NOT NULL,
    "area" TEXT,
    "profissional_id" TEXT,
    "local" TEXT,
    "data_hora" TIMESTAMPTZ(6) NOT NULL,
    "status" "StatusAtendimento" NOT NULL DEFAULT 'AGENDADO',
    "notas" TEXT,
    "anexos_url" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "atendimentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lembretes" (
    "id" TEXT NOT NULL,
    "atendimento_id" TEXT NOT NULL,
    "minutos_antes" INTEGER NOT NULL,
    "canal" "CanalLembrete" NOT NULL,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "lembretes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "share_links" (
    "id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "escopo" JSONB NOT NULL,
    "expiracao" TIMESTAMPTZ(6) NOT NULL,
    "revogado" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(6) NOT NULL,
    "ultimo_acesso" TIMESTAMPTZ(6),

    CONSTRAINT "share_links_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "nutrition_meal_entries" (
    "id" TEXT NOT NULL,
    "paciente_id" TEXT NOT NULL,
    "dia" DATE NOT NULL,
    "tipo" "NutritionMealType" NOT NULL,
    "aceitacao_media" SMALLINT,
    "observacoes" TEXT,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "nutrition_meal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_meal_items" (
    "id" TEXT NOT NULL,
    "refeicao_id" TEXT NOT NULL,
    "alimento_id" TEXT,
    "nome_personalizado" TEXT,
    "grupo_alimentar" "NutritionFoodGroup" NOT NULL,
    "quantidade" TEXT,
    "textura" "NutritionTexture" NOT NULL,
    "aceitacao" SMALLINT NOT NULL,
    "observacoes" TEXT,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nutrition_meal_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_food_items" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "grupo" "NutritionFoodGroup" NOT NULL,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "nutrition_food_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_reactions" (
    "id" TEXT NOT NULL,
    "paciente_id" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "descricao" TEXT NOT NULL,
    "severidade" SMALLINT NOT NULL,
    "alimento_id" TEXT,
    "alimento_manual" TEXT,
    "observacoes" TEXT,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "nutrition_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_daily_checklists" (
    "id" TEXT NOT NULL,
    "paciente_id" TEXT NOT NULL,
    "dia" DATE NOT NULL,
    "ofereceu_legume" BOOLEAN NOT NULL DEFAULT false,
    "introduziu_novo" BOOLEAN NOT NULL DEFAULT false,
    "ofereceu_agua" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "nutrition_daily_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_feed_settings" (
    "id" TEXT NOT NULL,
    "paciente_id" TEXT NOT NULL,
    "alerta_mel_habilitado" BOOLEAN NOT NULL DEFAULT true,
    "alerta_acucar_habilitado" BOOLEAN NOT NULL DEFAULT true,
    "observacoes" TEXT,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "nutrition_feed_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_entries" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "period" "MealPeriod" NOT NULL,
    "items" JSONB NOT NULL,
    "note" VARCHAR(160),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "meal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hydrations" (
    "id" TEXT NOT NULL,
    "amountMl" INTEGER NOT NULL DEFAULT 200,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "hydrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fruit_intakes" (
    "id" TEXT NOT NULL,
    "kind" VARCHAR(60),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "fruit_intakes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_preferences" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "glutenFree" BOOLEAN NOT NULL DEFAULT false,
    "halalKosher" BOOLEAN NOT NULL DEFAULT false,
    "lactoseFree" BOOLEAN NOT NULL DEFAULT false,
    "tipsTone" TEXT NOT NULL DEFAULT 'simple',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "nutrition_preferences_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE INDEX "idx_criancas_tutor" ON "criancas"("tutor_id", "criado_em");

-- CreateIndex
CREATE INDEX "medicamentos_paciente_id_idx" ON "medicamentos"("paciente_id");

-- CreateIndex
CREATE INDEX "idx_dose_logs_medicamento_horario" ON "dose_logs"("medicamento_id", "horario_previsto");

-- CreateIndex
CREATE INDEX "idx_atendimentos_paciente_data" ON "atendimentos"("paciente_id", "data_hora");

-- CreateIndex
CREATE INDEX "lembretes_atendimento_id_idx" ON "lembretes"("atendimento_id");

-- CreateIndex
CREATE UNIQUE INDEX "share_links_token_key" ON "share_links"("token");

-- CreateIndex
CREATE INDEX "idx_familia_membros_familia" ON "familia_membros"("familia_id");

-- CreateIndex
CREATE INDEX "idx_cuidadores_familia" ON "cuidadores"("familia_id");

-- CreateIndex
CREATE INDEX "idx_tratamentos_familia" ON "tratamentos"("familia_id");

-- CreateIndex
CREATE UNIQUE INDEX "nutrition_meal_entry_unique" ON "nutrition_meal_entries"("paciente_id", "dia", "tipo");

-- CreateIndex
CREATE INDEX "nutrition_meal_items_refeicao_id_idx" ON "nutrition_meal_items"("refeicao_id");

-- CreateIndex
CREATE UNIQUE INDEX "nutrition_food_items_nome_key" ON "nutrition_food_items"("nome");

-- CreateIndex
CREATE INDEX "idx_nutrition_reactions_child_date" ON "nutrition_reactions"("paciente_id", "data");

-- CreateIndex
CREATE UNIQUE INDEX "nutrition_checklist_unique" ON "nutrition_daily_checklists"("paciente_id", "dia");

-- CreateIndex
CREATE UNIQUE INDEX "nutrition_feed_settings_paciente_id_key" ON "nutrition_feed_settings"("paciente_id");

-- CreateIndex
CREATE INDEX "meal_entries_userId_date_idx" ON "meal_entries"("userId", "date");

-- CreateIndex
CREATE INDEX "hydrations_userId_dateTime_idx" ON "hydrations"("userId", "dateTime");

-- CreateIndex
CREATE INDEX "fruit_intakes_userId_dateTime_idx" ON "fruit_intakes"("userId", "dateTime");

-- AddForeignKey
ALTER TABLE "medicamentos" ADD CONSTRAINT "medicamentos_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dose_logs" ADD CONSTRAINT "dose_logs_medicamento_id_fkey" FOREIGN KEY ("medicamento_id") REFERENCES "medicamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimentos" ADD CONSTRAINT "atendimentos_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimentos" ADD CONSTRAINT "atendimentos_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "profissionais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lembretes" ADD CONSTRAINT "lembretes_atendimento_id_fkey" FOREIGN KEY ("atendimento_id") REFERENCES "atendimentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "familia_membros" ADD CONSTRAINT "familia_membros_familia_id_fkey" FOREIGN KEY ("familia_id") REFERENCES "familias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuidadores" ADD CONSTRAINT "cuidadores_familia_id_fkey" FOREIGN KEY ("familia_id") REFERENCES "familias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tratamentos" ADD CONSTRAINT "tratamentos_familia_id_fkey" FOREIGN KEY ("familia_id") REFERENCES "familias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_meal_entries" ADD CONSTRAINT "nutrition_meal_entry_child_fk" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_meal_items" ADD CONSTRAINT "nutrition_meal_item_food_fk" FOREIGN KEY ("alimento_id") REFERENCES "nutrition_food_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_meal_items" ADD CONSTRAINT "nutrition_meal_item_meal_fk" FOREIGN KEY ("refeicao_id") REFERENCES "nutrition_meal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_reactions" ADD CONSTRAINT "nutrition_reaction_child_fk" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_reactions" ADD CONSTRAINT "nutrition_reaction_food_fk" FOREIGN KEY ("alimento_id") REFERENCES "nutrition_food_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_daily_checklists" ADD CONSTRAINT "nutrition_checklist_child_fk" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_feed_settings" ADD CONSTRAINT "nutrition_settings_child_fk" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
