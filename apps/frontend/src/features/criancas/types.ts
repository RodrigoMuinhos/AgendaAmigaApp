export type Sexo = 'M' | 'F' | 'O';

export type ParentescoResponsavel = 'Mae' | 'Pai' | 'Tutor(a)' | 'Avo/Avo' | 'Outro';

export type TipoSanguineo = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | undefined;

export type NeurodivergenciaTipo = 'TEA' | 'TDAH';

export type Neurodivergencia = {
  tipo: NeurodivergenciaTipo;
  grau?: string;
};

export type Responsavel = {
  nome?: string;
  parentesco?: ParentescoResponsavel;
  telefone?: string;
};

export type SimNao = 'sim' | 'nao';
export type SimNaoDesconhecido = SimNao | 'desconhecido';

export type TipoParto = 'normal' | 'cesarea' | 'forceps';

export type NascimentoInfo = {
  pesoAoNascerGramas?: number;
  comprimentoAoNascerCm?: number;
  perimetroCefalicoAoNascerCm?: number;
  tipoParto?: TipoParto;
  idadeGestacionalSemanas?: number;
  apgar1min?: number;
  apgar5min?: number;
  intercorrenciasParto?: string;
  necessitouUtiNeonatal?: SimNao;
  diasUtiNeonatal?: number;
  ictericiaNeonatal?: SimNao;
  grupoSanguineoCrianca?: string;
  grupoSanguineoMae?: string;
};

export type ResultadoTriagemNeonatal = 'normal' | 'alterado' | 'pendente';
export type ResultadoTriagemAuditiva = 'passou' | 'falhou' | 'pendente';

export type TestePezinho = {
  dataColeta?: string;
  resultado?: ResultadoTriagemNeonatal;
  observacao?: string;
};

export type TesteNeonatalComum = {
  data?: string;
  resultado?: ResultadoTriagemNeonatal;
  observacao?: string;
};

export type TesteOrelhinha = {
  data?: string;
  resultado?: ResultadoTriagemAuditiva;
  observacao?: string;
};

export type TriagensNeonatais = {
  testePezinho?: TestePezinho;
  testeOrelhinha?: TesteOrelhinha;
  testeOlhinho?: TesteNeonatalComum;
  testeCoracaozinho?: TesteNeonatalComum;
  testeLinguinha?: TesteNeonatalComum;
};

export type VacinaAplicacao = {
  dataAplicacao?: string;
  lote?: string;
};

export type VacinasNascimento = {
  vitaminaKAplicada?: SimNaoDesconhecido;
  profilaxiaOftalmia?: SimNaoDesconhecido;
  bcgDoseUnica?: VacinaAplicacao;
  hepatiteBDose0?: VacinaAplicacao;
};

export type AleitamentoNaAlta =
  | 'exclusivo'
  | 'predominante'
  | 'complementado'
  | 'formula'
  | 'outro';

export type AltaAleitamento = {
  aleitamentoNaAlta?: AleitamentoNaAlta;
  orientacoesNaAlta?: string;
  servicoReferencia?: string;
  profissionalReferencia?: string;
  profissionalReferenciaCRM?: string;
};

export type AlimentacaoAtual =
  | 'aleitamentoExclusivo'
  | 'misto'
  | 'solidosIniciados'
  | 'dietaRegular'
  | 'outro';

export type AcompanhamentoRegistro = {
  dataConsulta?: string;
  idadeCorrigidaMeses?: number;
  pesoKg?: number;
  comprimentoCm?: number;
  perimetroCefalicoCm?: number;
  imc?: number;
  zPesoIdade?: number;
  zAlturaIdade?: number;
  zIMCIdade?: number;
  pressaoArterial?: string;
  alimentacaoAtual?: AlimentacaoAtual;
  suplementos?: string;
  intercorrenciasDesdeUltimaConsulta?: string;
  medicacoesUsoContinuo?: string;
  avaliacaoDesenvolvimento?: string;
  encaminhamentos?: string;
  observacoesProfissional?: string;
  profissionalResponsavel?: string;
};

export type Crianca = {
  id: string;
  nome: string;
  nascimentoISO: string;
  sexo: Sexo;
  responsavel?: Responsavel;
  tutorId?: string;
  cartaoSUS?: string;
  cpf?: string;
  convenioOperadora?: string;
  convenioNumero?: string;
  tipoSanguineo?: TipoSanguineo;
  alergias?: string[];
  doencasCronicas?: string[];
  medicacoes?: string[];
  neurodivergencias?: Neurodivergencia[];
  pediatra?: string;
  avatarUrl?: string;
  nascimento?: NascimentoInfo;
  triagensNeonatais?: TriagensNeonatais;
  vacinasNascimento?: VacinasNascimento;
  altaAleitamento?: AltaAleitamento;
  acompanhamentosPeriodicos?: AcompanhamentoRegistro[];
  criadoEmISO?: string;
  atualizadoEmISO?: string;
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
