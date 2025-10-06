export type Gravidade = "leve" | "moderada" | "grave";
export type Sexo = "feminino" | "masculino" | "intersexo" | "outro";
export type TipoSanguineo = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export type Contato = {
  nome: string;
  telefone: string;
  relacao?: string;
  email?: string;
};

export type Responsavel = {
  nome: string;
  parentesco: string;
  telefone: string;
  whatsapp?: string;
  cpf?: string;
  rg?: string;
  dataNascimento?: string;
  email?: string;
};

export type Medicacao = {
  nome: string;
  dose: string;
  via: string;
  frequencia: string;
  horarioLivre?: string;
};

export type EventoClinico = {
  evento: string;
  data?: string;
  observacao?: string;
};

export type Vacina = {
  nome: string;
  data: string;
  lote?: string;
  reacao?: string;
};

export type Medida = {
  data: string;
  pesoKg?: number;
  alturaCm?: number;
  perimetroCefalicoCm?: number;
};

export type Convenio = {
  operadora: string;
  numeroCarteirinha: string;
  validade?: string;
  plano?: string;
  frenteUrl?: string;
  versoUrl?: string;
};

export type ChildProfileCreateDTO = {
  avatarUrl?: string;
  nomeCompleto: string;
  apelido?: string;
  dataNascimento: string;
  sexo: Sexo;
  pronome?: string;
  corRaca?: string;
  tipoSanguineo?: TipoSanguineo;
  naturalidade?: { cidade?: string; uf?: string };
  endereco?: {
    logradouro?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    cep?: string;
  };
  contatos?: { principal?: string; extra?: string; email?: string };
  alergias?: { nome: string; gravidade: Gravidade }[];
  condicoes?: string[];
  medicacoesAtuais?: Medicacao[];
  cirurgiasInternacoes?: EventoClinico[];
  vacinas?: Vacina[];
  crescimento?: Medida[];
  pediatra?: {
    nome?: string;
    crm?: string;
    celular?: string;
    email?: string;
    observacoes?: string;
  };
  preferenciasCuidados?: string;
  responsaveis: Responsavel[];
  emergencia: Contato[];
  autorizadosRetirada?: Contato[];
  temConvenio: boolean;
  convenio?: Convenio;
  escola?: { nome?: string; serie?: string; turno?: string; contato?: string };
  rotinaSono?: {
    horaDormir?: string;
    horaAcordar?: string;
    sonecas?: number;
    qualidadeSono?: number;
  };
  rotinaAlimentacao?: {
    restricoes?: string;
    preferencias?: string;
    aguaLitrosDia?: number;
  };
  terapias?: {
    tipo: string;
    profissional?: string;
    local?: string;
    diasDaSemana?: string[];
    observacao?: string;
  }[];
  atividades?: { nome: string; frequencia?: string }[];
  anexos?: { url: string; name: string; size: number }[];
  observacoesGerais?: string;
  consentimentoLGPD: boolean;
};

export type ChildProfile = ChildProfileCreateDTO & { id: string };

export type AvatarUploadResult = {
  url: string;
};

export type AttachmentUploadResult = {
  url: string;
  name: string;
  size: number;
};
