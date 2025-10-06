export type ResumoHome = {
  pacientes: number;
  tratamentosHoje: number;
  linksAtivos: number;
};

export type Paciente = {
  id: string;
  nome: string;
};

export type Tratamento = {
  id: string;
  pacienteId: string;
  medicamento: string;
};

export type ProximaDoseLog = {
  id: string;
  tratamentoId: string;
  dataHoraISO: string;
  status: "PENDENTE" | "ATRASADA" | "CONFIRMADA" | string;
};

export type LinkCompartilhamento = {
  id: string;
  token: string;
  escopo: string;
  expiraEm: string;
  pacienteId?: string | null;
  tratamentoId?: string | null;
};