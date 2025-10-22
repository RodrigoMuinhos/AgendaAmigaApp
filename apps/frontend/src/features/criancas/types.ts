export type Sexo = 'M' | 'F' | 'Outro';

export type ParentescoResponsavel = 'Mae' | 'Pai' | 'Tutor(a)' | 'Avo/Avo' | 'Outro';

export type TipoSanguineo = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | undefined;

export type Responsavel = {
  nome: string;
  parentesco?: ParentescoResponsavel;
  telefone?: string;
};

export type Crianca = {
  id: string;
  nome: string;
  nascimentoISO: string;
  sexo: Sexo;
  responsavel: Responsavel;
  cartaoSUS?: string;
  cpf?: string;
  tipoSanguineo?: TipoSanguineo;
  alergias?: string[];
  doencasCronicas?: string[];
  medicacoes?: string[];
  pediatra?: string;
  avatarUrl?: string;
  criadoEmISO: string;
  atualizadoEmISO: string;
};

export type CriancaCreateInput = Omit<Crianca, 'id' | 'criadoEmISO' | 'atualizadoEmISO'>;

export type VacinaDose = {
  codigo: string;
  rotulo: string;
  idadeAlvoMeses?: number;
};

export type VacinaCatalogoItem = {
  id: string;
  nome: string;
  doses: VacinaDose[];
};

export type VacinaRegistro = {
  criancaId: string;
  vacinaId: string;
  doseCodigo: string;
  dataISO: string;
  lote?: string;
  local?: string;
  profissional?: string;
  observacoes?: string;
};

export type CrescimentoRegistro = {
  criancaId: string;
  dataISO: string;
  pesoKg?: number;
  estaturaCm?: number;
  perimetroCefalicoCm?: number;
  observacoes?: string;
};

export type Caderneta = {
  criancaId: string;
  vacinacao: {
    historico: VacinaRegistro[];
  };
  crescimento: {
    registros: CrescimentoRegistro[];
  };
};
