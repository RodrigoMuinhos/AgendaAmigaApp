import type { Paciente } from "../types/paciente.types";

type PacientesResult = {
  data: Paciente[];
  isLoading: boolean;
};

type PacienteResult = {
  data: Paciente | undefined;
  isLoading: boolean;
  error?: undefined;
};

export function usePacientes(): PacientesResult {
  return {
    data: [],
    isLoading: false,
  };
}

export function usePaciente(_id?: string): PacienteResult {
  return {
    data: undefined,
    isLoading: false,
  };
}