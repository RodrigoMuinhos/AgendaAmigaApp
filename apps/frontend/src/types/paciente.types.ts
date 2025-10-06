export type DiagnosticoTEA = {
  nivel: string;
  suporte?: string;
  observacoes?: string;
  interesses?: string[];
  sensibilidades?: string[];
};

export type DadosVitais = {
  pesoKg?: number;
  alturaCm?: number;
  imc?: number;
  atualizadoEm?: string;
};

export type ConsultaMedica = {
  data: string;
  profissional?: string;
  especialidade?: string;
  local?: string;
  resumo?: string;
};

export type RegistroHumor = {
  id: string;
  data: string;
  periodo: string;
  humor: string;
  intensidade?: string;
  gatilho?: string;
  estrategia?: string;
  observacoes?: string;
};

export type AtividadeDiaria = {
  id: string;
  data: string;
  periodo: string;
  titulo: string;
  status: string;
  categoria?: string;
  apoioNecessario?: string;
  observacoes?: string;
};

export type Paciente = {
  id: string;
  nome: string;
  idade?: number;
  dataNascimento?: string;
  condicoes: string[];
  alergias: string[];
  diagnosticoTea?: DiagnosticoTEA;
  dadosVitais?: DadosVitais;
  ultimaConsulta?: ConsultaMedica;
  avaliacoesRecentes?: ConsultaMedica[];
  humorDiario?: RegistroHumor[];
  atividades?: AtividadeDiaria[];
  interesses?: string[];
  sensibilidades?: string[];
  observacoes?: string;
  plano?: {
    nome: string;
    carteirinha?: string;
    validade?: string;
  } | null;
};

export type PacienteResumo = Paciente & {
  avatarUrl?: string;
};
