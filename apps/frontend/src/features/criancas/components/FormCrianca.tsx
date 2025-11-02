import { useMemo, useState } from 'react';
import { Controller, FieldPath, useFieldArray, useForm } from 'react-hook-form';
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
};

type StepKey = 'dadosBasicos' | 'nascimento' | 'triagens' | 'vacinas' | 'alta' | 'acompanhamentos';

type StepDefinition = {
  key: StepKey;
  title: string;
  description: string;
  fields: FieldPath<CriancaCreateInput>[];
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
    fields: ['nome', 'nascimentoISO', 'sexo', 'responsavel.nome'],
  },
  {
    key: 'nascimento',
    title: 'Nascimento',
    description: 'Registre os dados do parto e primeiros dias.',
    fields: [],
  },
  {
    key: 'triagens',
    title: 'Triagens neonatais',
    description: 'Informe os resultados dos testes de triagem.',
    fields: [],
  },
  {
    key: 'vacinas',
    title: 'Vacinas de nascimento',
    description: 'Cheque as profilaxias aplicadas nas primeiras horas.',
    fields: [],
  },
  {
    key: 'alta',
    title: 'Alta e aleitamento',
    description: 'Organize orientacoes e referencias na alta.',
    fields: [],
  },
  {
    key: 'acompanhamentos',
    title: 'Acompanhamentos periodicos',
    description: 'Registre consultas e evolucao clinica.',
    fields: [],
  },
];
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
}: FormCriancaProps) {
  const initialValues = useMemo<CriancaCreateInput>(
    () => ({
      nome: defaultValues?.nome ?? '',
      nascimentoISO: isoToBrDate(defaultValues?.nascimentoISO),
      sexo: (defaultValues?.sexo ?? 'O') as Sexo,
      cpf: defaultValues?.cpf ?? '',
      cartaoSUS: defaultValues?.cartaoSUS ?? '',
      responsavel: defaultValues?.responsavel ?? { nome: '', parentesco: '', telefone: '' },
      tutorId: defaultValues?.tutorId,
      convenioOperadora: defaultValues?.convenioOperadora,
      convenioNumero: defaultValues?.convenioNumero,
      tipoSanguineo: defaultValues?.tipoSanguineo,
      alergias: defaultValues?.alergias,
      doencasCronicas: defaultValues?.doencasCronicas,
      medicacoes: defaultValues?.medicacoes,
      neurodivergencias: defaultValues?.neurodivergencias,
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
    trigger,
    formState: { errors },
  } = useForm<CriancaCreateInput>({
    mode: 'onSubmit',
    defaultValues: initialValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'acompanhamentosPeriodicos',
  });

  const [stepIndex, setStepIndex] = useState(0);
  const step = STEP_DEFINITIONS[stepIndex];
  const totalSteps = STEP_DEFINITIONS.length;
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === totalSteps - 1;

  const necessidadeUti = watch('nascimento.necessitouUtiNeonatal');

  const appendConsulta = () => {
    const novaConsulta: AcompanhamentoRegistro = {
      dataConsulta: '',
      alimentacaoAtual: 'aleitamentoExclusivo',
    };
    append(novaConsulta);
  };

  const nextStep = async () => {
    if (isLastStep) return;
    const currentFields = step.fields;
    let valid = true;
    if (currentFields.length) {
      valid = await trigger(currentFields, { shouldFocus: true });
    }
    if (!valid) {
      return;
    }
    setStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const previousStep = () => {
    if (isFirstStep) return;
    setStepIndex((prev) => Math.max(prev - 1, 0));
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const submit = handleSubmit(async (data) => {
    const payload: CriancaCreateInput = {
      ...data,
      nascimentoISO: brToIsoDate(data.nascimentoISO) ?? '',
      triagensNeonatais: convertTriagensToPayload(data.triagensNeonatais),
      vacinasNascimento: convertVacinasToPayload(data.vacinasNascimento),
      acompanhamentosPeriodicos: convertAcompanhamentosToPayload(data.acompanhamentosPeriodicos),
    };

    if (payload.responsavel) {
      const nome = payload.responsavel.nome?.trim() ?? '';
      const parentesco = payload.responsavel.parentesco?.trim();
      const telefoneDigits = payload.responsavel.telefone
        ? stripMask(payload.responsavel.telefone)
        : '';

      if (!nome.length) {
        delete payload.responsavel;
      } else {
        payload.responsavel = {
          nome,
          ...(parentesco ? { parentesco } : {}),
          ...(telefoneDigits.length ? { telefone: telefoneDigits } : {}),
        };
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
                  validate: (value) => Boolean(brToIsoDate(value)) || 'Informe uma data valida',
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

          <div className="rounded-3xl border border-[rgba(var(--color-border),0.35)] bg-[rgba(var(--color-surface),0.4)] p-5 sm:p-6">
            <h3 className="text-base font-semibold text-[rgb(var(--color-text))]">Responsavel principal</h3>
            <p className="mt-1 text-sm text-[rgba(var(--color-text),0.65)]">
              Informe quem responde pela crianca. Pelo menos o nome e obrigatorio.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[rgb(var(--color-text))]">
                  Nome do responsavel
                </label>
                <input
                  {...register('responsavel.nome', {
                    required: 'Informe o nome do responsavel',
                    setValueAs: (value) => (typeof value === 'string' ? value.trimStart() : value),
                  })}
                  className={inputClass}
                  placeholder="Maria Silva"
                />
                {errors.responsavel?.nome && (
                  <small className="text-sm text-red-600">{errors.responsavel.nome.message}</small>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text))]">
                  Parentesco
                </label>
                <input
                  {...register('responsavel.parentesco')}
                  className={inputClass}
                  placeholder="Mae, pai, tia..."
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[rgb(var(--color-text))]">
                  Telefone
                </label>
                <Controller
                  control={control}
                  name="responsavel.telefone"
                  render={({ field }) => (
                    <MaskedInput
                      mask="(99) 99999-9999"
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
                          placeholder="(85) 99999-9999"
                        />
                      )}
                    </MaskedInput>
                  )}
                />
              </div>
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
          Progresso do cadastro
        </p>
        <p className="text-sm font-semibold text-[rgb(var(--color-primary))]">
          Etapa {stepIndex + 1} de {totalSteps}: {step.title}
        </p>
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

        {!isFirstStep ? (
          <Button type="button" variant="outline" onClick={previousStep} disabled={isSubmitting}>
            Voltar etapa
          </Button>
        ) : null}

        {isLastStep ? (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : submitLabel ?? 'Finalizar cadastro'}
          </Button>
        ) : (
          <Button type="button" onClick={nextStep} disabled={isSubmitting}>
            Salvar e avancar
          </Button>
        )}
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
