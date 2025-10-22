type GrowthReference = {
  ageMonths: number;
  pesoMedioKg: number;
  estaturaMediaCm: number;
  perimetroCefalicoCm: number;
};

const references: GrowthReference[] = [
  { ageMonths: 0, pesoMedioKg: 3.3, estaturaMediaCm: 50, perimetroCefalicoCm: 34 },
  { ageMonths: 1, pesoMedioKg: 4.5, estaturaMediaCm: 54, perimetroCefalicoCm: 36 },
  { ageMonths: 2, pesoMedioKg: 5.6, estaturaMediaCm: 58, perimetroCefalicoCm: 38 },
  { ageMonths: 3, pesoMedioKg: 6.4, estaturaMediaCm: 61, perimetroCefalicoCm: 39.5 },
  { ageMonths: 4, pesoMedioKg: 7, estaturaMediaCm: 63, perimetroCefalicoCm: 40.5 },
  { ageMonths: 5, pesoMedioKg: 7.5, estaturaMediaCm: 65, perimetroCefalicoCm: 41.5 },
  { ageMonths: 6, pesoMedioKg: 7.9, estaturaMediaCm: 67, perimetroCefalicoCm: 42.5 },
  { ageMonths: 9, pesoMedioKg: 9, estaturaMediaCm: 71, perimetroCefalicoCm: 44 },
  { ageMonths: 12, pesoMedioKg: 10, estaturaMediaCm: 74, perimetroCefalicoCm: 45.5 },
  { ageMonths: 15, pesoMedioKg: 10.9, estaturaMediaCm: 77, perimetroCefalicoCm: 46.5 },
  { ageMonths: 18, pesoMedioKg: 11.8, estaturaMediaCm: 80, perimetroCefalicoCm: 47.5 },
  { ageMonths: 24, pesoMedioKg: 13, estaturaMediaCm: 85, perimetroCefalicoCm: 48.5 },
  { ageMonths: 30, pesoMedioKg: 14.3, estaturaMediaCm: 89, perimetroCefalicoCm: 49 },
  { ageMonths: 36, pesoMedioKg: 15.3, estaturaMediaCm: 95, perimetroCefalicoCm: 49.5 },
  { ageMonths: 48, pesoMedioKg: 17.2, estaturaMediaCm: 102, perimetroCefalicoCm: 50.5 },
  { ageMonths: 60, pesoMedioKg: 18.4, estaturaMediaCm: 109, perimetroCefalicoCm: 51.5 },
];

export type GrowthReferenceResult = GrowthReference & {
  source: GrowthReference;
};

export function obterReferenciaCrescimento(idadeMeses: number): GrowthReference {
  if (references.length === 0) {
    return { ageMonths: idadeMeses, pesoMedioKg: 0, estaturaMediaCm: 0, perimetroCefalicoCm: 0 };
  }

  if (idadeMeses <= references[0].ageMonths) {
    return references[0];
  }

  if (idadeMeses >= references[references.length - 1].ageMonths) {
    return references[references.length - 1];
  }

  for (let i = 0; i < references.length - 1; i += 1) {
    const atual = references[i];
    const proximo = references[i + 1];
    if (idadeMeses >= atual.ageMonths && idadeMeses <= proximo.ageMonths) {
      const proporcao =
        (idadeMeses - atual.ageMonths) / (proximo.ageMonths - atual.ageMonths || 1);
      return {
        ageMonths: idadeMeses,
        pesoMedioKg: interpolar(atual.pesoMedioKg, proximo.pesoMedioKg, proporcao),
        estaturaMediaCm: interpolar(atual.estaturaMediaCm, proximo.estaturaMediaCm, proporcao),
        perimetroCefalicoCm: interpolar(atual.perimetroCefalicoCm, proximo.perimetroCefalicoCm, proporcao),
      };
    }
  }

  return references[references.length - 1];
}

function interpolar(a: number, b: number, proporcao: number) {
  return a + (b - a) * proporcao;
}

export function classificarDiferenca(valor?: number, referencia?: number) {
  if (valor === undefined || referencia === undefined || Number.isNaN(valor) || Number.isNaN(referencia)) {
    return { status: 'indefinido' as const, diferenca: undefined, percentual: undefined };
  }
  const diferenca = valor - referencia;
  const percentual = diferenca / referencia;
  const tolerancia = 0.1; // 10%
  const status =
    percentual > tolerancia ? 'acima' : percentual < -tolerancia ? 'abaixo' : 'dentro';
  return { status, diferenca, percentual };
}

export function classificarIMC(imc?: number) {
  if (imc === undefined || Number.isNaN(imc)) {
    return 'indefinido';
  }
  if (imc < 14) return 'abaixo';
  if (imc > 18.5) return 'acima';
  return 'dentro';
}
