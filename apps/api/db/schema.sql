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

CREATE TABLE IF NOT EXISTS profissionais (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  especialidade TEXT,
  telefone TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS atendimentos (
  id TEXT PRIMARY KEY,
  paciente_id TEXT NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('CONSULTA', 'EXAME', 'TERAPIA')),
  area TEXT,
  profissional_id TEXT REFERENCES profissionais(id),
  local TEXT,
  data_hora TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'AGENDADO' CHECK (status IN ('AGENDADO', 'REALIZADO', 'FALTOU', 'CANCELADO')),
  notas TEXT,
  anexos_url TEXT[] NOT NULL DEFAULT '{}',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_atendimentos_paciente_data
  ON atendimentos (paciente_id, data_hora);

CREATE TABLE IF NOT EXISTS lembretes (
  id TEXT PRIMARY KEY,
  atendimento_id TEXT NOT NULL REFERENCES atendimentos(id) ON DELETE CASCADE,
  minutos_antes INTEGER NOT NULL CHECK (minutos_antes > 0),
  canal TEXT NOT NULL CHECK (canal IN ('PUSH', 'EMAIL', 'WHATSAPP')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS familias (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  cep TEXT,
  endereco TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  cuidador_principal TEXT,
  relacao_cuidador_principal TEXT,
  contato TEXT,
  telefone_cuidador TEXT,
  foco_cuidado TEXT,
  observacoes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS familia_membros (
  id TEXT PRIMARY KEY,
  familia_id TEXT NOT NULL REFERENCES familias(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
  documento TEXT,
  cep TEXT,
  numero_endereco TEXT,
  endereco TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  avatar TEXT,
  historico_medico TEXT,
  limitacoes TEXT,
  alergias TEXT,
  peso TEXT,
  altura TEXT,
  imc TEXT,
  necessidades TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_familia_membros_familia
  ON familia_membros (familia_id);

CREATE TABLE IF NOT EXISTS cuidadores (
  id TEXT PRIMARY KEY,
  familia_id TEXT NOT NULL REFERENCES familias(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  relacao TEXT,
  telefone TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cuidadores_familia
  ON cuidadores (familia_id);

CREATE TABLE IF NOT EXISTS tratamentos (
  id TEXT PRIMARY KEY,
  familia_id TEXT NOT NULL REFERENCES familias(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  dose TEXT NOT NULL,
  horario TEXT NOT NULL,
  instrucoes TEXT,
  proxima_dose TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tratamentos_familia
  ON tratamentos (familia_id);

