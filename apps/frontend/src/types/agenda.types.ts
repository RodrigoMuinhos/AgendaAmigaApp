export type DoseLogStatus = 'PENDENTE' | 'CONFIRMADA' | 'ATRASADA';

export type DoseLog = {
  id: string;
  tratamentoId: string;
  dataHoraISO: string;
  status: DoseLogStatus;
  confirmadoEm?: string | null;
};

export type ShareLink = {
  id: string;
  token: string;
  expiraEm: string;
  escopo: string;
  pacienteId?: string | null;
  tratamentoId?: string | null;
  criadoEm?: string;
};

export type AgendaDia = {
  dataISO: string;
  logs: DoseLog[];
};

