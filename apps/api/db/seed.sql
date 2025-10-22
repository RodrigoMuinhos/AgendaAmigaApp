-- Seed data for Agenda Amiga backend

INSERT INTO pacientes (id, tutor_id, nome_completo, condicoes, alergias, plano_saude_operadora, plano_saude_numero, plano_saude_validade, plano_saude_arquivado)
VALUES
  (
    'paciente-ana',
    'tutor-1',
    'Ana Souza',
    ARRAY['Asma controlada'],
    ARRAY['Penicilina'],
    'SaudeTotal',
    '123456789-00',
    NOW() + INTERVAL '365 days',
    FALSE
  ),
  (
    'paciente-bruno',
    'tutor-1',
    'Bruno Lima',
    ARRAY['Diabetes tipo 2'],
    ARRAY[]::TEXT[],
    NULL,
    NULL,
    NULL,
    FALSE
  ),
  (
    'paciente-clara',
    'tutor-2',
    'Clara Dias',
    ARRAY['Hipertensao'],
    ARRAY['Lactose'],
    NULL,
    NULL,
    NULL,
    FALSE
  )
ON CONFLICT (id) DO UPDATE SET
  tutor_id = EXCLUDED.tutor_id,
  nome_completo = EXCLUDED.nome_completo,
  condicoes = EXCLUDED.condicoes,
  alergias = EXCLUDED.alergias,
  plano_saude_operadora = EXCLUDED.plano_saude_operadora,
  plano_saude_numero = EXCLUDED.plano_saude_numero,
  plano_saude_validade = EXCLUDED.plano_saude_validade,
  plano_saude_arquivado = EXCLUDED.plano_saude_arquivado,
  atualizado_em = NOW();

INSERT INTO medicamentos (
  id,
  paciente_id,
  nome,
  dosagem,
  unidade_dosagem,
  ativo,
  esquema_tipo,
  esquema_timezone,
  esquema_periodo_inicio,
  esquema_periodo_fim,
  esquema_horarios,
  esquema_dias_semana
)
VALUES
  (
    'med-metformina',
    'paciente-ana',
    'Metformina',
    500,
    'mg',
    TRUE,
    'DIARIO_HORARIOS_FIXOS',
    'America/Fortaleza',
    NULL,
    NULL,
    ARRAY['08:00', '20:00'],
    NULL
  ),
  (
    'med-losartana',
    'paciente-bruno',
    'Losartana',
    50,
    'mg',
    TRUE,
    'SEMANAL_DIAS_FIXOS',
    'America/Fortaleza',
    NULL,
    NULL,
    ARRAY['09:00'],
    ARRAY[1, 3, 5]
  )
ON CONFLICT (id) DO UPDATE SET
  paciente_id = EXCLUDED.paciente_id,
  nome = EXCLUDED.nome,
  dosagem = EXCLUDED.dosagem,
  unidade_dosagem = EXCLUDED.unidade_dosagem,
  ativo = EXCLUDED.ativo,
  esquema_tipo = EXCLUDED.esquema_tipo,
  esquema_timezone = EXCLUDED.esquema_timezone,
  esquema_periodo_inicio = EXCLUDED.esquema_periodo_inicio,
  esquema_periodo_fim = EXCLUDED.esquema_periodo_fim,
  esquema_horarios = EXCLUDED.esquema_horarios,
  esquema_dias_semana = EXCLUDED.esquema_dias_semana,
  atualizado_em = NOW();

-- Remove existing sample dose logs so we can reseed
DELETE FROM dose_logs WHERE id LIKE 'dose-met-%';

INSERT INTO dose_logs (id, medicamento_id, horario_previsto, status, horario_real)
VALUES
  (
    'dose-met-1',
    'med-metformina',
    NOW() + INTERVAL '2 hours',
    'PENDENTE',
    NULL
  ),
  (
    'dose-met-2',
    'med-metformina',
    NOW() + INTERVAL '10 hours',
    'PENDENTE',
    NULL
  ),
  (
    'dose-met-3',
    'med-metformina',
    NOW() + INTERVAL '18 hours',
    'PENDENTE',
    NULL
  )
ON CONFLICT (id) DO UPDATE SET
  medicamento_id = EXCLUDED.medicamento_id,
  horario_previsto = EXCLUDED.horario_previsto,
  status = EXCLUDED.status,
  horario_real = EXCLUDED.horario_real,
  atualizado_em = NOW();

INSERT INTO share_links (id, tutor_id, token, escopo, expiracao, revogado)
VALUES
  (
    'link-exemplo-1',
    'tutor-1',
    'exampletokenagendaamiga123456',
    '{"medicamento": ["med-metformina"], "historico": "*"}',
    NOW() + INTERVAL '7 days',
    FALSE
  )
ON CONFLICT (id) DO UPDATE SET
  tutor_id = EXCLUDED.tutor_id,
  token = EXCLUDED.token,
  escopo = EXCLUDED.escopo,
  expiracao = EXCLUDED.expiracao,
  revogado = EXCLUDED.revogado,
  atualizado_em = NOW();

INSERT INTO familias (
  id,
  nome,
  cep,
  endereco,
  bairro,
  cidade,
  estado,
  cuidador_principal,
  relacao_cuidador_principal,
  contato,
  telefone_cuidador,
  foco_cuidado,
  observacoes
)
VALUES (
  'familia-tutor-1',
  'Familia Souza',
  '60150110',
  'Rua das Flores, 120',
  'Centro',
  'Fortaleza',
  'CE',
  'Maria Souza',
  'Mae',
  '85999999999',
  '85999999999',
  'Gestao de medicamentos',
  'Acompanhamento semanal com equipe multiprofissional'
)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  cep = EXCLUDED.cep,
  endereco = EXCLUDED.endereco,
  bairro = EXCLUDED.bairro,
  cidade = EXCLUDED.cidade,
  estado = EXCLUDED.estado,
  cuidador_principal = EXCLUDED.cuidador_principal,
  relacao_cuidador_principal = EXCLUDED.relacao_cuidador_principal,
  contato = EXCLUDED.contato,
  telefone_cuidador = EXCLUDED.telefone_cuidador,
  foco_cuidado = EXCLUDED.foco_cuidado,
  observacoes = EXCLUDED.observacoes,
  atualizado_em = NOW();

INSERT INTO familia_membros (
  id,
  familia_id,
  nome,
  data_nascimento,
  documento,
  bairro,
  cidade,
  estado
)
VALUES
  (
    'familia-tutor-1-membro-1',
    'familia-tutor-1',
    'Ana Souza',
    '2012-03-15',
    '12345678900',
    'Centro',
    'Fortaleza',
    'CE'
  ),
  (
    'familia-tutor-1-membro-2',
    'familia-tutor-1',
    'Bruno Lima',
    '2014-09-22',
    NULL,
    'Centro',
    'Fortaleza',
    'CE'
  )
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  data_nascimento = EXCLUDED.data_nascimento,
  documento = EXCLUDED.documento,
  bairro = EXCLUDED.bairro,
  cidade = EXCLUDED.cidade,
  estado = EXCLUDED.estado,
  atualizado_em = NOW();

INSERT INTO cuidadores (id, familia_id, nome, relacao, telefone)
VALUES
  (
    'familia-tutor-1-cuidador-1',
    'familia-tutor-1',
    'Carlos Souza',
    'Pai',
    '85988887777'
  ),
  (
    'familia-tutor-1-cuidador-2',
    'familia-tutor-1',
    'Fernanda Lima',
    'Tia',
    NULL
  )
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  relacao = EXCLUDED.relacao,
  telefone = EXCLUDED.telefone,
  atualizado_em = NOW();

INSERT INTO tratamentos (id, familia_id, nome, dose, horario, instrucoes)
VALUES
  (
    'tratamento-metformina',
    'familia-tutor-1',
    'Metformina',
    '500 mg',
    '08:00, 20:00',
    'Administrar apos as refeicoes'
  )
ON CONFLICT (id) DO UPDATE SET
  familia_id = EXCLUDED.familia_id,
  nome = EXCLUDED.nome,
  dose = EXCLUDED.dose,
  horario = EXCLUDED.horario,
  instrucoes = EXCLUDED.instrucoes,
  atualizado_em = NOW();

