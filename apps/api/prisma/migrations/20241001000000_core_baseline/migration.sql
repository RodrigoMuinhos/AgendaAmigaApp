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

-- CreateIndex
CREATE INDEX "idx_dose_logs_medicamento_horario" ON "dose_logs"("medicamento_id", "horario_previsto");

-- CreateIndex
CREATE UNIQUE INDEX "share_links_token_key" ON "share_links"("token");

-- CreateIndex
CREATE INDEX "idx_atendimentos_paciente_data" ON "atendimentos"("paciente_id", "data_hora");

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

