import type { TratamentoDetalhe } from "../types/tratamento.types";

type TratamentosQueryResult = {
  data: TratamentoDetalhe[];
  isLoading: boolean;
};

type MutationResult<TArgs extends unknown[]> = {
  isPending: boolean;
  mutateAsync: (...args: TArgs) => Promise<void>;
};

type SalvarTratamentoPayload = {
  id?: string;
  pacienteId: string;
  medicamento: string;
  dosagem: string;
  recorrencia: TratamentoDetalhe["recorrencia"];
  horarios: string[];
  notas?: string;
  status: TratamentoDetalhe["status"];
};

type AlterarStatusPayload = {
  id: string;
  status: TratamentoDetalhe["status"];
};

export function useTratamentos(): TratamentosQueryResult {
  return {
    data: [],
    isLoading: false,
  };
}

export function useSalvarTratamento(): MutationResult<[SalvarTratamentoPayload]> {
  return {
    isPending: false,
    async mutateAsync() {
      return Promise.resolve();
    },
  };
}

export function useAlterarStatusTratamento(): MutationResult<[AlterarStatusPayload]> {
  return {
    isPending: false,
    async mutateAsync() {
      return Promise.resolve();
    },
  };
}

export function useDeletarTratamento(): MutationResult<[string]> {
  return {
    isPending: false,
    async mutateAsync() {
      return Promise.resolve();
    },
  };
}
