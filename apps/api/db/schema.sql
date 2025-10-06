-- Database schema for Agenda Amiga backend

CREATE TABLE IF NOT EXISTS pacientes (
  id TEXT PRIMARY KEY,
  tutor_id TEXT NOT NULL,
  nome_completo TEXT NOT NULL,
  condicoes TEXT[] NOT NULL DEFAULT '{}',
  alergias TEXT[] NOT NULL DEFAULT '{}',
  plano_saude_operadora TEXT,
  plano_saude_numero TEXT,
  plano_saude_validade TIMESTAMPTZ,
  plano_saude_arquivado BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medicamentos (
  id TEXT PRIMARY KEY,
  paciente_id TEXT NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  dosagem NUMERIC NOT NULL CHECK (dosagem > 0),
  unidade_dosagem TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  esquema_tipo TEXT,
  esquema_timezone TEXT,
  esquema_periodo_inicio TIMESTAMPTZ,
  esquema_periodo_fim TIMESTAMPTZ,
  esquema_horarios TEXT[],
  esquema_dias_semana SMALLINT[],
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT medicamentos_esquema_tipo CHECK (
    esquema_tipo IS NULL OR esquema_tipo IN ('DIARIO_HORARIOS_FIXOS', 'SEMANAL_DIAS_FIXOS')
  )
);

CREATE TABLE IF NOT EXISTS dose_logs (
  id TEXT PRIMARY KEY,
  medicamento_id TEXT NOT NULL REFERENCES medicamentos(id) ON DELETE CASCADE,
  horario_previsto TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDENTE', 'TOMADO', 'ATRASADO')),
  horario_real TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dose_logs_medicamento_horario
  ON dose_logs (medicamento_id, horario_previsto);

CREATE TABLE IF NOT EXISTS share_links (
  id TEXT PRIMARY KEY,
  tutor_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  escopo JSONB NOT NULL,
  expiracao TIMESTAMPTZ NOT NULL,
  revogado BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ultimo_acesso TIMESTAMPTZ
);

