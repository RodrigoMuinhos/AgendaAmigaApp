import type { DoseLog } from "../types/agenda.types";
import type { ProximaDoseLog } from "../types/app";

type QueryResult<T> = {
  data: T;
  isLoading: boolean;
};

type MutationResult<TArgs extends unknown[]> = {
  isPending: boolean;
  mutateAsync: (...args: TArgs) => Promise<void>;
};

export function useDoseLogs(_pacienteId?: string): QueryResult<DoseLog[]> {
  return {
    data: [],
    isLoading: false,
  };
}

export function useDosesProximas(_tutorId: string): QueryResult<ProximaDoseLog[]> {
  return {
    data: [],
    isLoading: false,
  };
}

export function useConfirmarDose(): MutationResult<[string]> {
  return {
    isPending: false,
    async mutateAsync() {
      return Promise.resolve();
    },
  };
}