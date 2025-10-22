export function formatarIdade(nascimentoISO: string) {
  const nascimento = new Date(nascimentoISO);
  if (Number.isNaN(nascimento.getTime())) {
    return 'Data invalida';
  }

  const agora = new Date();
  let anos = agora.getFullYear() - nascimento.getFullYear();
  let meses = agora.getMonth() - nascimento.getMonth();

  if (meses < 0 || (meses === 0 && agora.getDate() < nascimento.getDate())) {
    anos -= 1;
    meses += 12;
  }

  if (agora.getDate() < nascimento.getDate()) {
    meses = (meses + 11) % 12;
  }

  if (anos <= 0) {
    return meses <= 1 ? `${meses} mes` : `${meses} meses`;
  }

  const partes: string[] = [];
  partes.push(anos === 1 ? '1 ano' : `${anos} anos`);
  if (meses > 0) {
    partes.push(meses === 1 ? '1 mes' : `${meses} meses`);
  }
  return partes.join(' e ');
}

export function calcularIdadeEmMeses(nascimentoISO: string, referenciaISO?: string) {
  const nascimento = new Date(nascimentoISO);
  if (Number.isNaN(nascimento.getTime())) return 0;
  const referencia = referenciaISO ? new Date(referenciaISO) : new Date();
  if (Number.isNaN(referencia.getTime())) return 0;

  let anos = referencia.getFullYear() - nascimento.getFullYear();
  let meses = referencia.getMonth() - nascimento.getMonth();
  if (meses < 0 || (meses === 0 && referencia.getDate() < nascimento.getDate())) {
    anos -= 1;
    meses += 12;
  }
  if (referencia.getDate() < nascimento.getDate()) {
    meses = (meses + 11) % 12;
  }
  return anos * 12 + meses;
}
