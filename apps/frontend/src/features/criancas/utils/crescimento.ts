import dayjs from 'dayjs';
import dayjs from 'dayjs';
import type { Crianca, CrescimentoRegistro } from '../types';
import { calcularIdadeEmMeses } from './idade';
import {
  obterReferenciaCrescimento,
  classificarDiferenca,
  classificarIMC,
} from './growthReferences';

export type MedidaCrescimentoAnalise = {
  registro: CrescimentoRegistro;
  idadeMeses: number;
  referencia: {
    pesoMedioKg: number;
    estaturaMediaCm: number;
    perimetroCefalicoCm: number;
  };
  peso: ReturnType<typeof classificarDiferenca> & { referencia: number };
  estatura: ReturnType<typeof classificarDiferenca> & { referencia: number };
  perimetro: ReturnType<typeof classificarDiferenca> & { referencia: number };
  imc?: number;
  statusImc: ReturnType<typeof classificarIMC>;
  score: number;
};

export function analisarMedidasCrescimento(
  crianca: Crianca | undefined,
  registros: CrescimentoRegistro[],
): MedidaCrescimentoAnalise[] {
  if (!crianca) return [];

  const analisadas = registros.map((registro) => {
    const idadeMeses = calcularIdadeEmMeses(crianca.nascimentoISO, registro.dataISO);
    const referencia = obterReferenciaCrescimento(idadeMeses);
    const pesoInfo = classificarDiferenca(registro.pesoKg, referencia.pesoMedioKg);
    const estaturaInfo = classificarDiferenca(registro.estaturaCm, referencia.estaturaMediaCm);
    const perimetroInfo = classificarDiferenca(
      registro.perimetroCefalicoCm,
      referencia.perimetroCefalicoCm,
    );

    const imc =
      registro.pesoKg !== undefined && registro.estaturaCm
        ? calculoIMC(registro.pesoKg, registro.estaturaCm)
        : undefined;
    const statusImc = classificarIMC(imc);
    const score = calcularScoreGlobal(pesoInfo.status, estaturaInfo.status, perimetroInfo.status, statusImc);

    return {
      registro,
      idadeMeses,
      referencia,
      peso: { ...pesoInfo, referencia: referencia.pesoMedioKg },
      estatura: { ...estaturaInfo, referencia: referencia.estaturaMediaCm },
      perimetro: { ...perimetroInfo, referencia: referencia.perimetroCefalicoCm },
      imc,
      statusImc,
      score,
    };
  });

  return analisadas.sort((a, b) => dayjs(b.registro.dataISO).diff(dayjs(a.registro.dataISO)));
}

function calculoIMC(pesoKg: number, estaturaCm: number) {
  if (!pesoKg || !estaturaCm) return undefined;
  const alturaM = estaturaCm / 100;
  if (!alturaM) return undefined;
  return pesoKg / (alturaM * alturaM);
}

function calcularScoreGlobal(
  pesoStatus: string,
  estaturaStatus: string,
  perimetroStatus: string,
  imcStatus: string,
) {
  const valores = [pesoStatus, estaturaStatus, perimetroStatus, imcStatus]
    .map(statusParaScore)
    .filter((valor): valor is number => valor !== undefined);
  if (!valores.length) return 0;
  const media = valores.reduce((acc, item) => acc + item, 0) / valores.length;
  return Math.round(media);
}

function statusParaScore(status: string | undefined) {
  if (!status || status === 'indefinido') return undefined;
  switch (status) {
    case 'dentro':
      return 100;
    case 'acima':
    case 'abaixo':
      return 60;
    default:
      return 40;
  }
}
