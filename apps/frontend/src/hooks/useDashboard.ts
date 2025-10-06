import type { ResumoHome, LinkCompartilhamento } from "../types/app";

type DashboardQuery<T> = {
  data: T;
  isLoading: boolean;
};

type CreateLinkPayload = {
  pacienteId?: string | null;
  tratamentoId?: string | null;
  escopo: string;
};

type CreateLinkResult = {
  isPending: boolean;
  mutateAsync: (payload: CreateLinkPayload) => Promise<LinkCompartilhamento>;
};

export function useHomeResumo(): DashboardQuery<ResumoHome | undefined> {
  return {
    data: undefined,
    isLoading: false,
  };
}

export function useLinksCompartilhamento(): DashboardQuery<LinkCompartilhamento[]> {
  return {
    data: [],
    isLoading: false,
  };
}

export function useCriarLinkCompartilhamento(): CreateLinkResult {
  return {
    isPending: false,
    async mutateAsync({ pacienteId = null, tratamentoId = null, escopo }: CreateLinkPayload) {
      const id =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `link-${Math.random().toString(36).slice(2, 10)}`;
      const token = Math.random().toString(36).slice(2, 12);
      const expiraEm = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      return { id, token, escopo, expiraEm, pacienteId, tratamentoId };
    },
  };
}