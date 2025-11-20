import { useMemo } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { MaskedInput, stripMask } from '../../../components/ui/masked-input';
import type {
  AcompanhamentoRegistro,
  AlimentacaoAtual,
  AleitamentoNaAlta,
  Crianca,
  CriancaCreateInput,
  ResultadoTriagemAuditiva,
  ResultadoTriagemNeonatal,
  Sexo,
  SimNao,
  SimNaoDesconhecido,
  TipoParto,
  TipoSanguineo,
} from '../types';

type FormCriancaProps = {
  onSubmit: (data: CriancaCreateInput) => Promise<void> | void;
  onCancel: () => void;
  defaultValues?: Partial<Crianca>;
  isSubmitting?: boolean;
  submitLabel?: string;
  onDelete?: () => void;
  deleteLabel?: string;
  status?: 'idle' | 'success' | 'error';
  statusMessage?: string;
  section?: StepKey;
};

export type StepKey =
  | 'dadosBasicos'
  | 'nascimento'
  | 'triagens'
  | 'vacinas'
  | 'alta'
  | 'neurodivergencias'
  | 'acompanhamentos';

export type StepDefinition = {
  key: StepKey;
  title: string;
  description: string;
};

const inputClass =
  'w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-3 text-base focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]';
const selectClass = inputClass;
const textareaClass =
  'min-h-[80px] w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-3 text-base focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]';

const sexoOptions: { value: Sexo; label: string }[] = [
  { value: 'F', label: 'Feminino' },
  { value: 'M', label: 'Masculino' },
  { value: 'O', label: 'Outro' },
];

const tipoSanguineoOptions: { value: NonNullable<TipoSanguineo>; label: string }[] = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

const simNaoOptions: { value: SimNao; label: string }[] = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Nao' },
];

const simNaoDesconhecidoOptions: { value: SimNaoDesconhecido; label: string }[] = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Nao' },
  { value: 'desconhecido', label: 'Desconhecido' },
];

const tipoPartoOptions: { value: TipoParto; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'cesarea', label: 'Cesarea' },
  { value: 'forceps', label: 'Forceps' },
];

const resultadoTriagemOptions: { value: ResultadoTriagemNeonatal; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'alterado', label: 'Alterado' },
  { value: 'pendente', label: 'Pendente' },
];

const resultadoOrelhinhaOptions: { value: ResultadoTriagemAuditiva; label: string }[] = [
  { value: 'passou', label: 'Passou' },
  { value: 'falhou', label: 'Falhou' },
  { value: 'pendente', label: 'Pendente' },
];

const aleitamentoOptions: { value: AleitamentoNaAlta; label: string }[] = [
  { value: 'exclusivo', label: 'Exclusivo' },
  { value: 'predominante', label: 'Predominante' },
  { value: 'complementado', label: 'Complementado' },
  { value: 'formula', label: 'Formula' },
  { value: 'outro', label: 'Outro' },
];

const alimentacaoAtualOptions: { value: AlimentacaoAtual; label: string }[] = [
  { value: 'aleitamentoExclusivo', label: 'Aleitamento exclusivo' },
  { value: 'misto', label: 'Aleitamento + complemento' },
  { value: 'solidosIniciados', label: 'Solidos iniciados' },
  { value: 'dietaRegular', label: 'Dieta regular' },
  { value: 'outro', label: 'Outro' },
];

const neurodivergenciaOptions = [
  { value: 'TEA', label: 'Transtorno do espectro autista (TEA)' },
  { value: 'TDAH', label: 'Transtorno do deficit de atencao/hiperatividade (TDAH)' },
];

const sanitizeNumber = (value: unknown) => {
  if (value === '' || value === null || value === undefined) return undefined;
  const parsed = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  return Number.isNaN(parsed) ? undefined : parsed;
};

const DATE_MASK = '99/99/9999';

function isoToBrDate(value?: string | null) {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed.length) return '';
  const [datePart] = trimmed.split('T');
  const [year, month, day] = (datePart ?? '').split('-');
  if (year && month && day) {
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year.padStart(4, '0')}`;
  }
  return trimmed;
}

function brToIsoDate(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    return undefined;
  }
  const [, day, month, year] = match;
  const iso = `${year}-${month}-${day}`;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return iso;
}

function onlyDigits(value?: string | null) {
  return (value ?? '').replace(/\D/g, '');
}

function isValidCpf(value?: string | null) {
  const digits = onlyDigits(value);
  if (digits.length !== 11) {
    return false;
  }
  if (/^(\d)\1+$/.test(digits)) {
    return false;
  }

  const verifyDigit = (length: number) => {
    let sum = 0;
    for (let i = 0; i < length; i += 1) {
      const coefficient = length + 1 - i;
      sum += Number(digits[i]) * coefficient;
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  const firstVerifier = verifyDigit(9);
  if (firstVerifier !== Number(digits[9])) {
    return false;
  }
  const secondVerifier = verifyDigit(10);
  return secondVerifier === Number(digits[10]);
}

function convertTriagensToForm(triagens?: CriancaCreateInput['triagensNeonatais']) {
  if (!triagens) return {};

  return {
    ...(triagens.testePezinho
      ? {
          testePezinho: {
            ...triagens.testePezinho,
            dataColeta: isoToBrDate(triagens.testePezinho.dataColeta),
          },
        }
      : {}),
    ...(triagens.testeOrelhinha
      ? {
          testeOrelhinha: {
            ...triagens.testeOrelhinha,
            data: isoToBrDate(triagens.testeOrelhinha.data),
          },
        }
      : {}),
    ...(triagens.testeOlhinho
      ? {
          testeOlhinho: {
            ...triagens.testeOlhinho,
            data: isoToBrDate(triagens.testeOlhinho.data),
          },
        }
      : {}),
    ...(triagens.testeCoracaozinho
      ? {
          testeCoracaozinho: {
            ...triagens.testeCoracaozinho,
            data: isoToBrDate(triagens.testeCoracaozinho.data),
          },
        }
      : {}),
    ...(triagens.testeLinguinha
      ? {
          testeLinguinha: {
            ...triagens.testeLinguinha,
            data: isoToBrDate(triagens.testeLinguinha.data),
          },
        }
      : {}),
  };
}

function hasEntries(object: Record<string, unknown>) {
  return Object.values(object).some((value) => value !== undefined && value !== '');
}

function convertTriagensToPayload(triagens?: CriancaCreateInput['triagensNeonatais']) {
  if (!triagens) return undefined;
  const result: NonNullable<CriancaCreateInput['triagensNeonatais']> = {};

  if (triagens.testePezinho) {
    const { dataColeta, ...rest } = triagens.testePezinho;
    const iso = brToIsoDate(dataColeta);
    const payload = { ...rest, ...(iso ? { dataColeta: iso } : {}) };
    if (hasEntries(payload)) {
      result.testePezinho = payload;
    }
  }

  if (triagens.testeOrelhinha) {
    const { data, ...rest } = triagens.testeOrelhinha;
    const iso = brToIsoDate(data);
    const payload = { ...rest, ...(iso ? { data: iso } : {}) };
    if (hasEntries(payload)) {
      result.testeOrelhinha = payload;
    }
  }

  if (triagens.testeOlhinho) {
    const { data, ...rest } = triagens.testeOlhinho;
    const iso = brToIsoDate(data);
    const payload = { ...rest, ...(iso ? { data: iso } : {}) };
    if (hasEntries(payload)) {
      result.testeOlhinho = payload;
    }
  }

  if (triagens.testeCoracaozinho) {
    const { data, ...rest } = triagens.testeCoracaozinho;
    const iso = brToIsoDate(data);
    const payload = { ...rest, ...(iso ? { data: iso } : {}) };
    if (hasEntries(payload)) {
      result.testeCoracaozinho = payload;
    }
  }

  if (triagens.testeLinguinha) {
    const { data, ...rest } = triagens.testeLinguinha;
    const iso = brToIsoDate(data);
    const payload = { ...rest, ...(iso ? { data: iso } : {}) };
    if (hasEntries(payload)) {
      result.testeLinguinha = payload;
    }
  }

  return Object.keys(result).length ? result : undefined;
}

function convertVacinasToForm(vacinas?: CriancaCreateInput['vacinasNascimento']) {
  if (!vacinas) return {};
  return {
    ...vacinas,
    bcgDoseUnica: vacinas.bcgDoseUnica
      ? {
          ...vacinas.bcgDoseUnica,
          dataAplicacao: isoToBrDate(vacinas.bcgDoseUnica.dataAplicacao),
        }
      : undefined,
    hepatiteBDose0: vacinas.hepatiteBDose0
      ? {
          ...vacinas.hepatiteBDose0,
          dataAplicacao: isoToBrDate(vacinas.hepatiteBDose0.dataAplicacao),
        }
      : undefined,
  };
}

function convertVacinasToPayload(vacinas?: CriancaCreateInput['vacinasNascimento']) {
  if (!vacinas) return undefined;
  const result: NonNullable<CriancaCreateInput['vacinasNascimento']> = {};

  if (vacinas.vitaminaKAplicada) {
    result.vitaminaKAplicada = vacinas.vitaminaKAplicada;
  }

  if (vacinas.profilaxiaOftalmia) {
    result.profilaxiaOftalmia = vacinas.profilaxiaOftalmia;
  }

  if (vacinas.bcgDoseUnica) {
    const { dataAplicacao, ...rest } = vacinas.bcgDoseUnica;
    const iso = brToIsoDate(dataAplicacao);
    const payload = { ...rest, ...(iso ? { dataAplicacao: iso } : {}) };
    if (hasEntries(payload)) {
      result.bcgDoseUnica = payload;
    }
  }

  if (vacinas.hepatiteBDose0) {
    const { dataAplicacao, ...rest } = vacinas.hepatiteBDose0;
    const iso = brToIsoDate(dataAplicacao);
    const payload = { ...rest, ...(iso ? { dataAplicacao: iso } : {}) };
    if (hasEntries(payload)) {
      result.hepatiteBDose0 = payload;
    }
  }

  return Object.keys(result).length ? result : undefined;
}

function convertAcompanhamentosToForm(registros?: AcompanhamentoRegistro[]) {
  if (!registros) return [];
  return registros.map((registro) => ({
    ...registro,
    dataConsulta: isoToBrDate(registro.dataConsulta),
  }));
}

function convertAcompanhamentosToPayload(registros?: AcompanhamentoRegistro[]) {
  if (!registros) return [];
  return registros.map((registro) => {
    const iso = brToIsoDate(registro.dataConsulta);
    return {
      ...registro,
      dataConsulta: iso,
    };
  });
}

const STEP_DEFINITIONS: StepDefinition[] = [
  {
    key: 'dadosBasicos',
    title: 'Dados basicos',
    description: 'Identifique a crianca com informacoes essenciais.',
  },
  {
    key: 'nascimento',
    title: 'Nascimento',
    description: 'Registre os dados do parto e primeiros dias.',
  },
  {
    key: 'triagens',
    title: 'Triagens neonatais',
    description: 'Informe os resultados dos testes de triagem.',
  },
  {
    key: 'vacinas',
    title: 'Vacinas de nascimento',
    description: 'Cheque as profilaxias aplicadas nas primeiras horas.',
  },
  {
    key: 'alta',
    title: 'Alta e aleitamento',
    description: 'Organize orientacoes e referencias na alta.',
  },
  {
    key: 'neurodivergencias',
    title: 'Neurodivergencias',
    description: 'Registre diagnosticos ou suspeitas relevantes.',
  },
  {
    key: 'acompanhamentos',
    title: 'Acompanhamentos periodicos',
    description: 'Registre consultas e evolucao clinica.',
  },
];

export const FORM_CRIANCA_SECTIONS: StepKey[] = STEP_DEFINITIONS.map((item) => item.key);

export function getFormCriancaSection(stepKey: StepKey): StepDefinition {
  return STEP_DEFINITIONS.find((item) => item.key === stepKey) ?? STEP_DEFINITIONS[0];
}
export function FormCrianca({
  onSubmit,
  onCancel,
  defaultValues,
  isSubmitting,
  submitLabel,
  onDelete,
  deleteLabel,
  status = 'idle',
  statusMessage,
  section = 'dadosBasicos',
}: FormCriancaProps) {
  const initialValues = useMemo<CriancaCreateInput>(
    () => ({
      nome: defaultValues?.nome ?? '',
      nascimentoISO: isoToBrDate(defaultValues?.nascimentoISO),
      sexo: (defaultValues?.sexo ?? 'O') as Sexo,
      cpf: defaultValues?.cpf ?? '',
      cartaoSUS: defaultValues?.cartaoSUS ?? '',
      tutorId: defaultValues?.tutorId,
      convenioOperadora: defaultValues?.convenioOperadora,
      convenioNumero: defaultValues?.convenioNumero,
      tipoSanguineo: defaultValues?.tipoSanguineo,
      alergias: defaultValues?.alergias,
      doencasCronicas: defaultValues?.doencasCronicas,
      medicacoes: defaultValues?.medicacoes,
      neurodivergencias: (defaultValues?.neurodivergencias ?? []).map((item) => ({
        tipo: item.tipo,
        grau: item.grau ?? '',
      })),
      pediatra: defaultValues?.pediatra,
      avatarUrl: defaultValues?.avatarUrl,
      nascimento: defaultValues?.nascimento ?? {},
      triagensNeonatais: convertTriagensToForm(defaultValues?.triagensNeonatais),
      vacinasNascimento: convertVacinasToForm(defaultValues?.vacinasNascimento),
      altaAleitamento: defaultValues?.altaAleitamento ?? {},
      acompanhamentosPeriodicos: convertAcompanhamentosToForm(defaultValues?.acompanhamentosPeriodicos),
    }),
    [defaultValues],
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CriancaCreateInput>({
    mode: 'onSubmit',
    defaultValues: initialValues,
  });

  const {
    fields: neurodivergenciaFields,
    append: appendNeurodivergencia,
    remove: removeNeurodivergencia,
  } = useFieldArray({
    control,
    name: 'neurodivergencias',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'acompanhamentosPeriodicos',
  });

  const step = getFormCriancaSection(section);
  const headerBadge = section === 'dadosBasicos' ? 'Cadastro inicial' : 'Atualizacao de dados';
  const resolvedSubmitLabel = submitLabel ?? (section === 'dadosBasicos' ? 'Salvar cadastro' : 'Salvar');

  const necessidadeUti = watch('nascimento.necessitouUtiNeonatal');

  const appendConsulta = () => {
    const novaConsulta: AcompanhamentoRegistro = {
      dataConsulta: '',
      alimentacaoAtual: 'aleitamentoExclusivo',
    };
    append(novaConsulta);
  };

  const submit = handleSubmit(async (data) => {
    const preserved = {
      ...(defaultValues ?? {}),
    } as Partial<CriancaCreateInput> & {
      id?: string;
      criadoEmISO?: string;
      atualizadoEmISO?: string;
    };

    delete preserved.id;
    delete preserved.criadoEmISO;
    delete preserved.atualizadoEmISO;

    const payloadBase: Record<string, unknown> = { ...preserved };
    (Object.entries(data) as [keyof CriancaCreateInput, unknown][]).forEach(([key, value]) => {
      if (value !== undefined) {
        payloadBase[key as string] = value;
      }
    });

    const triagensPayload =
      convertTriagensToPayload(data.triagensNeonatais ?? initialValues.triagensNeonatais) ??
      preserved.triagensNeonatais;

    const vacinasPayload =
      convertVacinasToPayload(data.vacinasNascimento ?? initialValues.vacinasNascimento) ??
      preserved.vacinasNascimento;

    const acompanhamentosPayload =
      convertAcompanhamentosToPayload(
        data.acompanhamentosPeriodicos ?? initialValues.acompanhamentosPeriodicos,
      ) ?? preserved.acompanhamentosPeriodicos;

    const nascimentoISO =
      brToIsoDate(data.nascimentoISO) ??
      brToIsoDate(initialValues.nascimentoISO) ??
      preserved.nascimentoISO ??
      '';

    payloadBase.nascimentoISO = nascimentoISO;
    payloadBase.triagensNeonatais = triagensPayload;
    payloadBase.vacinasNascimento = vacinasPayload;
    payloadBase.acompanhamentosPeriodicos = acompanhamentosPayload;

    const payload = payloadBase as CriancaCreateInput;

    if (payload.neurodivergencias) {
      const normalizadas = payload.neurodivergencias
        .map((item) => {
          const tipo = item?.tipo;
          const grau = typeof item?.grau === 'string' ? item.grau.trim() : undefined;
          if (!tipo) return undefined;
          return {
            tipo,
            ...(grau ? { grau } : {}),
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item));

      if (normalizadas.length) {
        payload.neurodivergencias = normalizadas;
      } else {
        delete (payload as Partial<CriancaCreateInput>).neurodivergencias;
      }
    }

    if (payload.altaAleitamento) {
      const nomeProf = payload.altaAleitamento.profissionalReferencia?.trim() ?? '';
      const crmRaw = payload.altaAleitamento.profissionalReferenciaCRM?.trim() ?? '';
      const crm = crmRaw.replace(/\s+/g, '').toUpperCase();

      if (nomeProf.length) {
        payload.altaAleitamento.profissionalReferencia = nomeProf;
      } else {
        delete payload.altaAleitamento.profissionalReferencia;
      }

      if (crm.length) {
        payload.altaAleitamento.profissionalReferenciaCRM = crm;
      } else {
        delete payload.altaAleitamento.profissionalReferenciaCRM;
      }
    }

    console.log('SUBMIT FormCrianca ->', payload);
    await onSubmit(payload);
  });

  let stepContent: JSX.Element;
  switch (step.key) {
    case 'dadosBasicos':
      stepContent = (
        <section className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[rgb(var(--color-text))]">Nome</label>
              <input
                {...register('nome', { required: 'Informe o nome' })}
                className={inputClass}
                placeholder="Nome completo"
              />
              {errors.nome && <small className="text-sm text-red-600">{errors.nome.message}</small>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text))]">
                Nascimento (DD/MM/AAAA)
              </label>
              <Controller
                control={control}
                name="nascimentoISO"
                rules={{
                  required: 'Informe a data',
                  validate: (value) => {
                    const iso = brToIsoDate(value);
                    if (!iso) {
                      return 'Informe uma data valida';
                    }
                    if (new Date(iso).getTime() > Date.now()) {
                      return 'Informe uma data igual ou anterior a hoje';
                    }
                    return true;
                  },
                }}
                render={({ field }) => (
                  <MaskedInput
                    mask={DATE_MASK}
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value)}
                    onBlur={field.onBlur}
                  >
                    {({ value, onChange, onBlur }) => (
                      <input
                        name={field.name}
                        ref={field.ref}
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        className={inputClass}
                        placeholder="10/05/2020"
                      />
                    )}
                  </MaskedInput>
                )}
              />
              {errors.nascimentoISO && (
                <small className="text-sm text-red-600">{errors.nascimentoISO.message}</small>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text))]">Sexo</label>
              <select
                {...register('sexo', { required: 'Selecione o sexo' })}
                className={selectClass}
              >
                {sexoOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.sexo && <small className="text-sm text-red-600">{errors.sexo.message}</small>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text))]">CPF</label>
              <Controller
                control={control}
                name="cpf"
                rules={{
                  required: 'Informe o CPF',
                  validate: (value) => (isValidCpf(value) ? true : 'Informe um CPF valido'),
                }}
                render={({ field }) => (
                  <MaskedInput
                    mask="999.999.999-99"
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(stripMask(event.target.value))}
                    onBlur={field.onBlur}
                  >
                    {({ value, onChange, onBlur }) => (
                      <input
                        name={field.name}
                        ref={field.ref}
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        className={inputClass}
                        placeholder="000.000.000-00"
                      />
                    )}
                  </MaskedInput>
                )}
              />
              {errors.cpf && (
                <small className="text-sm text-red-600">{errors.cpf.message as string}</small>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text))]">
                Cartao SUS
              </label>
              <Controller
                control={control}
                name="cartaoSUS"
                render={({ field }) => (
                  <MaskedInput
                    mask="999999999999999"
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(stripMask(event.target.value))}
                    onBlur={field.onBlur}
                  >
                    {({ value, onChange, onBlur }) => (
                      <input
                        name={field.name}
                        ref={field.ref}
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        className={inputClass}
                        placeholder="000000000000000"
                      />
                    )}
                  </MaskedInput>
                )}
              />
            </div>
          </div>

        </section>
      );
      break;

    case 'nascimento':
      stepContent = (
        <section className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Peso ao nascer (g)</label>
              <input
                type="number"
                {...register('nascimento.pesoAoNascerGramas', { setValueAs: sanitizeNumber })}
                className={inputClass}
                placeholder="3200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Comprimento ao nascer (cm)</label>
              <input
                type="number"
                {...register('nascimento.comprimentoAoNascerCm', { setValueAs: sanitizeNumber })}
                className={inputClass}
                placeholder="49"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Perimetro cefalico ao nascer (cm)</label>
              <input
                type="number"
                {...register('nascimento.perimetroCefalicoAoNascerCm', {
                  setValueAs: sanitizeNumber,
                })}
                className={inputClass}
                placeholder="34"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Tipo de parto</label>
              <select {...register('nascimento.tipoParto')} className={selectClass}>
                <option value="">Selecione</option>
                {tipoPartoOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Idade gestacional (semanas)</label>
              <input
                type="number"
                {...register('nascimento.idadeGestacionalSemanas', { setValueAs: sanitizeNumber })}
                className={inputClass}
                placeholder="39"
              />
            </div>
            <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium">Apgar 1 minuto</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  {...register('nascimento.apgar1min', { setValueAs: sanitizeNumber })}
                  className={inputClass}
                  placeholder="9"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Apgar 5 minutos</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  {...register('nascimento.apgar5min', { setValueAs: sanitizeNumber })}
                  className={inputClass}
                  placeholder="10"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium">Intercorrencias no parto</label>
              <textarea
                {...register('nascimento.intercorrenciasParto')}
                className={textareaClass}
                placeholder="Descreva intercorrencias relevantes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Necessitou UTI neonatal?</label>
              <select {...register('nascimento.necessitouUtiNeonatal')} className={selectClass}>
                <option value="">Selecione</option>
                {simNaoOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {necessidadeUti === 'sim' ? (
              <div>
                <label className="block text-sm font-medium">Dias em UTI</label>
                <input
                  type="number"
                  min={0}
                  {...register('nascimento.diasUtiNeonatal', { setValueAs: sanitizeNumber })}
                  className={inputClass}
                  placeholder="5"
                />
              </div>
            ) : null}
            <div>
              <label className="block text-sm font-medium">Ictericia neonatal?</label>
              <select {...register('nascimento.ictericiaNeonatal')} className={selectClass}>
                <option value="">Selecione</option>
                {simNaoOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Grupo sanguineo da crianca</label>
              <select
                {...register('nascimento.grupoSanguineoCrianca', {
                  setValueAs: (value) => (typeof value === 'string' ? value.toUpperCase() : value),
                })}
                className={selectClass}
              >
                <option value="">Selecione</option>
                {tipoSanguineoOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Grupo sanguineo da mae</label>
              <select
                {...register('nascimento.grupoSanguineoMae', {
                  setValueAs: (value) => (typeof value === 'string' ? value.toUpperCase() : value),
                })}
                className={selectClass}
              >
                <option value="">Selecione</option>
                {tipoSanguineoOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
      );
      break;
    case 'triagens':
      stepContent = (
        <section className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-[1fr_minmax(0,1fr)] sm:items-end">
            <div>
              <h3 className="text-sm font-semibold text-[rgb(var(--color-text))]">Teste do pezinho</h3>
              <label className="block text-xs font-medium uppercase tracking-wide text-[rgba(var(--color-text),0.6)]">
                Data da coleta
              </label>
              <Controller
                control={control}
                name="triagensNeonatais.testePezinho.dataColeta"
                render={({ field }) => (
                  <MaskedInput
                    mask={DATE_MASK}
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value)}
                    onBlur={field.onBlur}
                  >
                    {({ value, onChange, onBlur }) => (
                      <input
                        name={field.name}
                        ref={field.ref}
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        className={inputClass}
                        placeholder="05/01/2024"
                      />
                    )}
                  </MaskedInput>
                )}
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-[rgba(var(--color-text),0.6)]">
                Resultado
              </label>
              <select
                {...register('triagensNeonatais.testePezinho.resultado')}
                className={selectClass}
              >
                <option value="">Selecione</option>
                {resultadoTriagemOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium uppercase tracking-wide text-[rgba(var(--color-text),0.6)]">
                Observacao
              </label>
              <textarea
                {...register('triagensNeonatais.testePezinho.observacao')}
                className="min-h-[60px] w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-2 text-sm focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_minmax(0,1fr)] sm:items-end">
            <div>
              <h3 className="text-sm font-semibold text-[rgb(var(--color-text))]">Teste da orelhinha</h3>
              <label className="block text-xs font-medium uppercase tracking-wide text-[rgba(var(--color-text),0.6)]">
                Data
              </label>
              <Controller
                control={control}
                name="triagensNeonatais.testeOrelhinha.data"
                render={({ field }) => (
                  <MaskedInput
                    mask={DATE_MASK}
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value)}
                    onBlur={field.onBlur}
                  >
                    {({ value, onChange, onBlur }) => (
                      <input
                        name={field.name}
                        ref={field.ref}
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        className={inputClass}
                        placeholder="05/01/2024"
                      />
                    )}
                  </MaskedInput>
                )}
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-[rgba(var(--color-text),0.6)]">
                Resultado
              </label>
              <select
                {...register('triagensNeonatais.testeOrelhinha.resultado')}
                className={selectClass}
              >
                <option value="">Selecione</option>
                {resultadoOrelhinhaOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium uppercase tracking-wide text-[rgba(var(--color-text),0.6)]">
                Observacao
              </label>
              <textarea
                {...register('triagensNeonatais.testeOrelhinha.observacao')}
                className="min-h-[60px] w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-2 text-sm focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
              />
            </div>
          </div>

          {[
            { key: 'testeOlhinho', label: 'Teste do olhinho' },
            { key: 'testeCoracaozinho', label: 'Teste do coracaozinho' },
            { key: 'testeLinguinha', label: 'Teste da linguinha' },
          ].map(({ key, label }) => (
            <div key={key} className="grid gap-3 sm:grid-cols-[1fr_minmax(0,1fr)] sm:items-end">
              <div>
                <h3 className="text-sm font-semibold text-[rgb(var(--color-text))]">{label}</h3>
                <label className="block text-xs font-medium uppercase tracking-wide text-[rgba(var(--color-text),0.6)]">
                  Data
                </label>
                <Controller
                  control={control}
                  name={`triagensNeonatais.${key}.data` as const}
                  render={({ field }) => (
                    <MaskedInput
                      mask={DATE_MASK}
                      value={field.value ?? ''}
                      onChange={(event) => field.onChange(event.target.value)}
                      onBlur={field.onBlur}
                    >
                      {({ value, onChange, onBlur }) => (
                        <input
                          name={field.name}
                          ref={field.ref}
                          value={value}
                          onChange={onChange}
                          onBlur={onBlur}
                          className={inputClass}
                          placeholder="05/01/2024"
                        />
                      )}
                    </MaskedInput>
                  )}
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-[rgba(var(--color-text),0.6)]">
                  Resultado
                </label>
                <select
                  {...register(`triagensNeonatais.${key}.resultado` as const)}
                  className={selectClass}
                >
                  <option value="">Selecione</option>
                  {resultadoTriagemOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium uppercase tracking-wide text-[rgba(var(--color-text),0.6)]">
                  Observacao
                </label>
                <textarea
                  {...register(`triagensNeonatais.${key}.observacao` as const)}
                  className="min-h-[60px] w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-2 text-sm focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
                />
              </div>
            </div>
          ))}
        </section>
      );
      break;
    case 'vacinas':
      stepContent = (
        <section className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Vitamina K aplicada?</label>
              <select
                {...register('vacinasNascimento.vitaminaKAplicada')}
                className={selectClass}
              >
                <option value="">Selecione</option>
                {simNaoDesconhecidoOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Profilaxia oftalmia?</label>
              <select
                {...register('vacinasNascimento.profilaxiaOftalmia')}
                className={selectClass}
              >
                <option value="">Selecione</option>
                {simNaoDesconhecidoOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-[rgb(var(--color-text))]">BCG dose unica</h3>
                <label className="block text-xs font-medium uppercase tracking-wide text-[rgba(var(--color-text),0.6)]">
                  Data
                </label>
                <Controller
                  control={control}
                  name="vacinasNascimento.bcgDoseUnica.dataAplicacao"
                  render={({ field }) => (
                    <MaskedInput
                      mask={DATE_MASK}
                      value={field.value ?? ''}
                      onChange={(event) => field.onChange(event.target.value)}
                      onBlur={field.onBlur}
                    >
                      {({ value, onChange, onBlur }) => (
                        <input
                          name={field.name}
                          ref={field.ref}
                          value={value}
                          onChange={onChange}
                          onBlur={onBlur}
                          className={inputClass}
                          placeholder="05/01/2024"
                        />
                      )}
                    </MaskedInput>
                  )}
                />
                <label className="mt-2 block text-xs font-medium uppercase tracking-wide text-[rgba(var(--color-text),0.6)]">
                  Lote
                </label>
                <input
                  {...register('vacinasNascimento.bcgDoseUnica.lote')}
                  className={inputClass}
                  placeholder="12345"
                />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[rgb(var(--color-text))]">
                  Hepatite B (dose 0)
                </h3>
                <label className="block text-xs font-medium uppercase tracking-wide text-[rgba(var(--color-text),0.6)]">
                  Data
                </label>
                <Controller
                  control={control}
                  name="vacinasNascimento.hepatiteBDose0.dataAplicacao"
                  render={({ field }) => (
                    <MaskedInput
                      mask={DATE_MASK}
                      value={field.value ?? ''}
                      onChange={(event) => field.onChange(event.target.value)}
                      onBlur={field.onBlur}
                    >
                      {({ value, onChange, onBlur }) => (
                        <input
                          name={field.name}
                          ref={field.ref}
                          value={value}
                          onChange={onChange}
                          onBlur={onBlur}
                          className={inputClass}
                          placeholder="05/01/2024"
                        />
                      )}
                    </MaskedInput>
                  )}
                />
                <label className="mt-2 block text-xs font-medium uppercase tracking-wide text-[rgba(var(--color-text),0.6)]">
                  Lote
                </label>
                <input
                  {...register('vacinasNascimento.hepatiteBDose0.lote')}
                  className={inputClass}
                  placeholder="67890"
                />
              </div>
            </div>
          </div>
        </section>
      );
      break;

    case 'alta':
      stepContent = (
        <section className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Aleitamento na alta</label>
              <select
                {...register('altaAleitamento.aleitamentoNaAlta')}
                className={selectClass}
              >
                <option value="">Selecione</option>
                {aleitamentoOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Servico de referencia</label>
              <input
                {...register('altaAleitamento.servicoReferencia')}
                className={inputClass}
                placeholder="UBS exemplo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Profissional referencia</label>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(140px,1fr)]">
                <input
                  {...register('altaAleitamento.profissionalReferencia', {
                    setValueAs: (value) => (typeof value === 'string' ? value.trimStart() : value),
                  })}
                  className={inputClass}
                  placeholder="Nome completo"
                />
                <input
                  {...register('altaAleitamento.profissionalReferenciaCRM', {
                    setValueAs: (value) =>
                      typeof value === 'string' ? value.replace(/\s+/g, '').toUpperCase() : value,
                  })}
                  className={inputClass}
                  placeholder="CRM 123456"
                  aria-label="CRM do profissional de referencia"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium">Orientacoes na alta</label>
              <textarea
                {...register('altaAleitamento.orientacoesNaAlta')}
                className={textareaClass}
                placeholder="Resuma as orientacoes fornecidas a familia."
              />
            </div>
          </div>
        </section>
      );
      break;
    case 'neurodivergencias':
      stepContent = (
        <section className="space-y-6">
          <p className="text-sm text-[rgba(var(--color-text),0.7)]">
            Registre diagnosticos ou observacoes formais informadas por profissionais de saude.
          </p>
          <div className="space-y-4">
            {neurodivergenciaFields.length ? (
              neurodivergenciaFields.map((fieldItem, index) => (
                <div
                  key={fieldItem.id}
                  className="rounded-3xl border border-[rgba(var(--color-border),0.4)] bg-[rgba(var(--color-surface),0.7)] p-4 shadow-inner"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium">Tipo</label>
                      <select
                        {...register(`neurodivergencias.${index}.tipo` as const, {
                          required: 'Informe o tipo',
                        })}
                        className={selectClass}
                      >
                        <option value="">Selecione</option>
                        {neurodivergenciaOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.neurodivergencias?.[index]?.tipo ? (
                        <small className="text-sm text-red-600">
                          {errors.neurodivergencias[index]?.tipo?.message}
                        </small>
                      ) : null}
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Grau ou observacoes</label>
                      <input
                        {...register(`neurodivergencias.${index}.grau` as const)}
                        className={inputClass}
                        placeholder="Ex.: leve, moderado, acompanhamento multiprofissional..."
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNeurodivergencia(index)}
                      disabled={isSubmitting}
                    >
                      Remover registro
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-[rgba(var(--color-border),0.5)] bg-[rgba(var(--color-surface),0.6)] px-4 py-6 text-center text-sm text-[rgba(var(--color-text),0.6)]">
                Nenhuma neurodivergencia adicionada. Utilize o botao abaixo para registrar um novo item.
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => appendNeurodivergencia({ tipo: 'TEA', grau: '' })}
            disabled={isSubmitting}
          >
            Adicionar neurodivergencia
          </Button>
        </section>
      );
      break;
    case 'acompanhamentos':
      stepContent = (
        <section className="space-y-6">
          {fields.length === 0 ? (
            <p className="text-sm text-[rgba(var(--color-text),0.6)]">
              Nenhuma consulta registrada. Utilize o botao abaixo para adicionar o primeiro registro.
            </p>
          ) : null}
          {fields.map((fieldItem, index) => (
            <div
              key={fieldItem.id}
              className="rounded-3xl border border-[rgba(var(--color-border),0.4)] bg-[rgba(var(--color-surface),0.7)] p-4 shadow-inner"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-[rgb(var(--color-text))]">
                  Consulta {index + 1}
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={isSubmitting}
                >
                  Remover
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium">Data da consulta</label>
                  <Controller
                    control={control}
                    name={`acompanhamentosPeriodicos.${index}.dataConsulta` as const}
                    render={({ field }) => (
                      <MaskedInput
                        mask={DATE_MASK}
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value)}
                        onBlur={field.onBlur}
                      >
                        {({ value, onChange, onBlur }) => (
                          <input
                            name={field.name}
                            ref={field.ref}
                            value={value}
                            onChange={onChange}
                            onBlur={onBlur}
                            className={inputClass}
                            placeholder="10/04/2024"
                          />
                        )}
                      </MaskedInput>
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Idade corrigida (meses)</label>
                  <input
                    type="number"
                    {...register(`acompanhamentosPeriodicos.${index}.idadeCorrigidaMeses` as const, {
                      setValueAs: sanitizeNumber,
                    })}
                    className={inputClass}
                    placeholder="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`acompanhamentosPeriodicos.${index}.pesoKg` as const, {
                      setValueAs: sanitizeNumber,
                    })}
                    className={inputClass}
                    placeholder="4.2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Comprimento (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    {...register(`acompanhamentosPeriodicos.${index}.comprimentoCm` as const, {
                      setValueAs: sanitizeNumber,
                    })}
                    className={inputClass}
                    placeholder="55.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Perimetro cefalico (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    {...register(`acompanhamentosPeriodicos.${index}.perimetroCefalicoCm` as const, {
                      setValueAs: sanitizeNumber,
                    })}
                    className={inputClass}
                    placeholder="38.2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">IMC</label>
                  <input
                    type="number"
                    step="0.1"
                    {...register(`acompanhamentosPeriodicos.${index}.imc` as const, {
                      setValueAs: sanitizeNumber,
                    })}
                    className={inputClass}
                    placeholder="15.8"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">z peso/idade</label>
                  <input
                    type="number"
                    step="0.1"
                    {...register(`acompanhamentosPeriodicos.${index}.zPesoIdade` as const, {
                      setValueAs: sanitizeNumber,
                    })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">z altura/idade</label>
                  <input
                    type="number"
                    step="0.1"
                    {...register(`acompanhamentosPeriodicos.${index}.zAlturaIdade` as const, {
                      setValueAs: sanitizeNumber,
                    })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">z IMC/idade</label>
                  <input
                    type="number"
                    step="0.1"
                    {...register(`acompanhamentosPeriodicos.${index}.zIMCIdade` as const, {
                      setValueAs: sanitizeNumber,
                    })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Pressao arterial</label>
                  <input
                    {...register(`acompanhamentosPeriodicos.${index}.pressaoArterial` as const)}
                    className={inputClass}
                    placeholder="100x60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Alimentacao atual</label>
                  <select
                    {...register(`acompanhamentosPeriodicos.${index}.alimentacaoAtual` as const)}
                    className={selectClass}
                  >
                    <option value="">Selecione</option>
                    {alimentacaoAtualOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium">Suplementos</label>
                  <textarea
                    {...register(`acompanhamentosPeriodicos.${index}.suplementos` as const)}
                    className="min-h-[60px] w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-3 text-base focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
                    placeholder="Ferro 10mg/dia; Vitamina D 400 UI"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium">
                    Intercorrencias desde a ultima consulta
                  </label>
                  <textarea
                    {...register(
                      `acompanhamentosPeriodicos.${index}.intercorrenciasDesdeUltimaConsulta` as const,
                    )}
                    className="min-h-[60px] w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-3 text-base focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium">Medicacoes de uso continuo</label>
                  <textarea
                    {...register(`acompanhamentosPeriodicos.${index}.medicacoesUsoContinuo` as const)}
                    className="min-h-[60px] w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-3 text-base focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium">Avaliacao do desenvolvimento</label>
                  <textarea
                    {...register(`acompanhamentosPeriodicos.${index}.avaliacaoDesenvolvimento` as const)}
                    className="min-h-[60px] w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-3 text-base focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
                    placeholder="Senta sem apoio; Rola; Vocaliza sons"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium">Encaminhamentos</label>
                  <textarea
                    {...register(`acompanhamentosPeriodicos.${index}.encaminhamentos` as const)}
                    className="min-h-[60px] w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-3 text-base focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
                    placeholder="Fonoaudiologia; Oftalmologia"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium">Observacoes do profissional</label>
                  <textarea
                    {...register(`acompanhamentosPeriodicos.${index}.observacoesProfissional` as const)}
                    className="min-h-[60px] w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-3 text-base focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Profissional responsavel</label>
                  <input
                    {...register(`acompanhamentosPeriodicos.${index}.profissionalResponsavel` as const)}
                    className={inputClass}
                    placeholder="Nome / CRM"
                  />
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={appendConsulta} disabled={isSubmitting}>
            Adicionar consulta
          </Button>
        </section>
      );
      break;

    default:
      stepContent = <div />;
      break;
  }
  return (
    <form onSubmit={submit} className="space-y-8">
      <div className="rounded-2xl bg-[rgba(var(--color-primary),0.06)] px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[rgba(var(--color-text),0.55)]">
          {headerBadge}
        </p>
        <p className="text-sm font-semibold text-[rgb(var(--color-primary))]">{step.title}</p>
        <p className="text-sm text-[rgba(var(--color-text),0.65)]">{step.description}</p>
      </div>

      {stepContent}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        {onDelete ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onDelete}
            disabled={isSubmitting}
            className="border border-[rgba(var(--color-danger),0.4)] text-[rgb(var(--color-danger))] hover:border-[rgb(var(--color-danger))] hover:text-[rgb(var(--color-danger))]"
          >
            {deleteLabel ?? 'Excluir dados'}
          </Button>
        ) : null}

        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : resolvedSubmitLabel}
        </Button>
      </div>

      {status !== 'idle' && statusMessage ? (
        <p
          className={
            status === 'success'
              ? 'text-sm font-semibold text-green-700'
              : 'text-sm font-semibold text-red-600'
          }
        >
          {statusMessage}
        </p>
      ) : null}
    </form>
  );
}
