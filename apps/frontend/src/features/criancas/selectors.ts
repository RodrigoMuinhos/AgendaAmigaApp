import type { VacinaCatalogoItem, VacinaRegistro } from './types';

export type ResumoVacinacao = {
  aplicadas: number;
  pendentes: number;
  proximas: number;
  totalDoses: number;
};

export function calcularTotalDoses(catalogo: VacinaCatalogoItem[]): number {
  return catalogo.reduce((acc, vacina) => acc + vacina.doses.length, 0);
}

export function calcularResumoVacinacao(
  historico: VacinaRegistro[],
  pendentes: number,
  proximas: number,
  catalogo: VacinaCatalogoItem[],
): ResumoVacinacao {
  const aplicadas = historico.length;
  const totalDoses = calcularTotalDoses(catalogo);
  return {
    aplicadas,
    pendentes,
    proximas,
    totalDoses,
  };
}
