export type TratamentoRecorrencia =
  | 'DIARIO_HORARIOS_FIXOS'
  | 'SEMANA'
  | 'INTERVALO';

export type Tratamento = {
  id: string;
  pacienteId: string;
  medicamento: string;
  dosagem: string;
  recorrencia: TratamentoRecorrencia;
  horarios?: string[];
  ativo: boolean;
};

export type TratamentoStatus = 'ATIVO' | 'PAUSADO' | 'ENCERRADO';

export type TratamentoDetalhe = Tratamento & {
  status: TratamentoStatus;
  inicioEm?: string;
  terminoEm?: string | null;
  notas?: string | null;
};

