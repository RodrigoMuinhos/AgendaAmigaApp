import { zodResolver } from '@hookform/resolvers/zod';
import type { ChangeEvent } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../../components/ui/button';
import { Campo } from './Campo';
import { AvatarUploader } from './AvatarUploader';
import type {
  Crianca,
  CriancaCreateInput,
  Neurodivergencia,
  ParentescoResponsavel,
  Sexo,
  TipoSanguineo,
} from '../types';
import { formatWithMask, stripMask } from '../../../components/ui/masked-input';
import type { LucideIcon } from 'lucide-react';
import { Mars, Venus } from 'lucide-react';

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

const telefoneRegex =
  /^(?:\+?[1-9]\d{9,14}|(?:\(\d{2}\)\s?)?\d{4,5}-\d{4}|(?:\d{2}\s?)?\d{4,5}-\d{4})$/;

const schema = z
  .object({
    nome: z
      .string({ required_error: 'Informe o nome completo.' })
      .trim()
      .min(2, 'O nome deve ter pelo menos 2 caracteres.'),
    nascimentoISO: z
    .string({ required_error: 'Informe a data de nascimento.' })
    .refine((value) => {
      if (!value) return false;
      const date = new Date(value);
      const today = new Date();
      if (Number.isNaN(date.getTime())) return false;
      return date <= today;
    }, 'Informe uma data valida no passado.'),
  sexo: z.enum(['M', 'F'], { required_error: 'Selecione o sexo.' }),
  responsavelNome: z
    .string({ required_error: 'Informe o nome do responsavel.' })
    .trim()
    .min(2, 'O nome do responsavel deve ter pelo menos 2 caracteres.'),
  responsavelParentesco: z.enum(['Mae', 'Pai', 'Tutor(a)', 'Avo/Avo', 'Outro'], {
    required_error: 'Selecione o parentesco.',
  }),
  responsavelTelefone: z
    .string({ required_error: 'Informe o telefone de contato.' })
    .trim()
    .min(8, 'Informe um telefone valido.')
    .refine((value) => telefoneRegex.test(value), 'Formato de telefone invalido.'),
  cartaoSUS: z.string().trim().optional(),
  cpf: z
    .string()
    .trim()
    .optional()
    .refine((valor) => {
      const digitos = limparDocumento(valor);
      return !digitos || digitos.length === 9 || digitos.length === 11;
    }, 'Documento invalido.'),
  planoSaudeTipo: z.enum(['SUS', 'Convenio']),
  convenioOperadora: z.string().trim().optional(),
  convenioNumero: z.string().trim().optional(),
  tipoSanguineo: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional()
    .or(z.literal('')),
  alergias: z.string().trim().optional(),
  doencasCronicas: z.string().trim().optional(),
  medicacoes: z.string().trim().optional(),
  neurodivergenciaTEA: z.boolean().optional(),
  neurodivergenciaTEAGrau: z.string().trim().optional(),
  neurodivergenciaTDAH: z.boolean().optional(),
  neurodivergenciaTDAHGrau: z.string().trim().optional(),
  pediatra: z.string().trim().optional(),
  avatarUrl: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.planoSaudeTipo === 'SUS') {
      if (!values.cartaoSUS?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Informe o numero do cartao SUS.',
          path: ['cartaoSUS'],
        });
      }
    } else {
      if (!values.convenioOperadora?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Informe a operadora do convenio.',
          path: ['convenioOperadora'],
        });
      }
      if (!values.convenioNumero?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Informe o numero da carteirinha.',
          path: ['convenioNumero'],
        });
      }
    }
    if (values.neurodivergenciaTEA && !values.neurodivergenciaTEAGrau?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Informe o grau do TEA.',
        path: ['neurodivergenciaTEAGrau'],
      });
    }
    if (values.neurodivergenciaTDAH && !values.neurodivergenciaTDAHGrau?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Informe o grau do TDAH.',
        path: ['neurodivergenciaTDAHGrau'],
      });
    }
  });

type FormValues = z.infer<typeof schema>;

const sexoOptions: Array<{ value: Sexo; label: string; icon: LucideIcon }> = [
  { value: 'M', label: 'Masc.', icon: Mars },
  { value: 'F', label: 'Fem.', icon: Venus },
];

const parentescoOptions: { value: ParentescoResponsavel; label: string }[] = [
  { value: 'Mae', label: 'Mae' },
  { value: 'Pai', label: 'Pai' },
  { value: 'Tutor(a)', label: 'Tutor(a)' },
  { value: 'Avo/Avo', label: 'Avo ou Avo' },
  { value: 'Outro', label: 'Outro' },
];

const tiposSanguineos: TipoSanguineo[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const planoSaudeOptions: { value: 'SUS' | 'Convenio'; label: string }[] = [
  { value: 'SUS', label: 'Cartao SUS' },
  { value: 'Convenio', label: 'Convenio' },
];

function transformarListaParaTexto(lista?: string[]) {
  return lista?.join(', ') ?? '';
}

function transformarTextoParaLista(valor?: string) {
  if (!valor) return undefined;
  const itens = valor
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return itens.length ? itens : undefined;
}

function limparDocumento(valor?: string) {
  return valor ? stripMask(valor) : '';
}

function formatarDocumento(valor?: string) {
  const digitos = limparDocumento(valor);
  if (!digitos) return '';
  if (digitos.length > 9) {
    const partes = [digitos.slice(0, 3), digitos.slice(3, 6), digitos.slice(6, 9)].filter(Boolean);
    const sufixo = digitos.slice(9, 11);
    return [partes.join('.'), sufixo].filter(Boolean).join('-');
  }
  const partes = [digitos.slice(0, 2), digitos.slice(2, 5), digitos.slice(5, 8)].filter(Boolean);
  const verificador = digitos.slice(8, 9);
  return [partes.join('.'), verificador].filter(Boolean).join('-');
}

function aplicarMascaraDocumento(valor: string) {
  const digitos = stripMask(valor);
  if (!digitos) return '';
  const mask = digitos.length > 9 ? '999.999.999-99' : '99.999.999-9';
  return formatWithMask(digitos, mask);
}

function criarValoresIniciais(defaultValues?: Partial<Crianca>): FormValues {
  const planoSaudeTipo: 'SUS' | 'Convenio' =
    defaultValues?.cartaoSUS && defaultValues.cartaoSUS.trim().length > 0
      ? 'SUS'
      : defaultValues?.convenioNumero || defaultValues?.convenioOperadora
        ? 'Convenio'
        : 'SUS';
  const neurodivergenciaTEA = defaultValues?.neurodivergencias?.find((item) => item.tipo === 'TEA');
  const neurodivergenciaTDAH = defaultValues?.neurodivergencias?.find((item) => item.tipo === 'TDAH');

  return {
    nome: defaultValues?.nome ?? '',
    nascimentoISO: defaultValues?.nascimentoISO ?? '',
    sexo: defaultValues?.sexo === 'F' ? 'F' : 'M',
    responsavelNome: defaultValues?.responsavel?.nome ?? '',
    responsavelParentesco: defaultValues?.responsavel?.parentesco ?? 'Mae',
    responsavelTelefone: defaultValues?.responsavel?.telefone ?? '',
    cartaoSUS: defaultValues?.cartaoSUS ?? '',
    cpf: formatarDocumento(defaultValues?.cpf),
    planoSaudeTipo,
    convenioOperadora: defaultValues?.convenioOperadora ?? '',
    convenioNumero: defaultValues?.convenioNumero ?? '',
    tipoSanguineo: defaultValues?.tipoSanguineo ?? '',
    alergias: transformarListaParaTexto(defaultValues?.alergias),
    doencasCronicas: transformarListaParaTexto(defaultValues?.doencasCronicas),
    medicacoes: transformarListaParaTexto(defaultValues?.medicacoes),
    neurodivergenciaTEA: Boolean(neurodivergenciaTEA),
    neurodivergenciaTEAGrau: neurodivergenciaTEA?.grau ?? '',
    neurodivergenciaTDAH: Boolean(neurodivergenciaTDAH),
    neurodivergenciaTDAHGrau: neurodivergenciaTDAH?.grau ?? '',
    pediatra: defaultValues?.pediatra ?? '',
    avatarUrl: defaultValues?.avatarUrl ?? '',
  };
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
}: FormCriancaProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: criarValoresIniciais(defaultValues),
    mode: 'onTouched',
  });

  const avatar = watch('avatarUrl');
  const planoSaudeTipo = watch('planoSaudeTipo');
  const sexoSelecionado = watch('sexo');
  const neurodivergenciaTEASelecionada = watch('neurodivergenciaTEA');
  const neurodivergenciaTDAHSelecionada = watch('neurodivergenciaTDAH');

  const handleFormSubmit = handleSubmit((values) => {
    const neurodivergencias: Neurodivergencia[] = [];

    if (values.neurodivergenciaTEA) {
      const grauTEA = values.neurodivergenciaTEAGrau?.trim();
      neurodivergencias.push({
        tipo: 'TEA',
        grau: grauTEA || undefined,
      });
    }

    if (values.neurodivergenciaTDAH) {
      const grauTDAH = values.neurodivergenciaTDAHGrau?.trim();
      neurodivergencias.push({
        tipo: 'TDAH',
        grau: grauTDAH || undefined,
      });
    }

    const payload: CriancaCreateInput = {
      nome: values.nome.trim(),
      nascimentoISO: values.nascimentoISO,
      sexo: values.sexo,
      responsavel: {
        nome: values.responsavelNome.trim(),
        parentesco: values.responsavelParentesco,
        telefone: values.responsavelTelefone.trim() || undefined,
      },
      cartaoSUS:
        values.planoSaudeTipo === 'SUS' ? values.cartaoSUS?.trim() || undefined : undefined,
      cpf: limparDocumento(values.cpf) || undefined,
      convenioOperadora:
        values.planoSaudeTipo === 'Convenio'
          ? values.convenioOperadora?.trim() || undefined
          : undefined,
      convenioNumero:
        values.planoSaudeTipo === 'Convenio'
          ? values.convenioNumero?.trim() || undefined
          : undefined,
      neurodivergencias: neurodivergencias.length ? neurodivergencias : undefined,
      tipoSanguineo: values.tipoSanguineo ? (values.tipoSanguineo as TipoSanguineo) : undefined,
      alergias: transformarTextoParaLista(values.alergias),
      doencasCronicas: transformarTextoParaLista(values.doencasCronicas),
      medicacoes: transformarTextoParaLista(values.medicacoes),
      pediatra: values.pediatra?.trim() || undefined,
      avatarUrl: values.avatarUrl || undefined,
    };

    return onSubmit(payload);
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-8">
      <section className="form-section">
        <div className="form-section__header">
          <h2 className="form-section__title">Identificacao</h2>
          <p className="form-section__description">
            Dados essenciais da crianca conforme a Caderneta da Crianca.
          </p>
        </div>
        <Campo id="nome" label="Nome completo" required error={errors.nome?.message}>
          <input
            id="nome"
            type="text"
            {...register('nome')}
            aria-invalid={Boolean(errors.nome)}
            aria-describedby={errors.nome ? 'nome-error' : undefined}
            className="w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-3 text-base shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
            placeholder="Nome completo da crianca"
          />
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="nascimentoISO" label="Data de nascimento" required error={errors.nascimentoISO?.message}>
            <input
              id="nascimentoISO"
              type="date"
              {...register('nascimentoISO')}
              aria-invalid={Boolean(errors.nascimentoISO)}
              aria-describedby={errors.nascimentoISO ? 'nascimentoISO-error' : undefined}
              className="w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-3 text-base shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
            />
          </Campo>
          <Campo id="sexo" label="Sexo" required error={errors.sexo?.message}>
            <div className="flex gap-2" role="radiogroup" aria-label="Sexo">
              {sexoOptions.map((option) => {
                const selected = sexoSelecionado === option.value;
                const Icon = option.icon;

                return (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-semibold transition focus-within:border-[rgb(var(--color-primary))] focus-within:ring-2 focus-within:ring-[rgba(30,136,229,0.25)] ${
                      selected
                        ? 'border-[rgb(var(--color-primary))] bg-[rgba(var(--color-primary),0.08)] text-[rgb(var(--color-primary))]'
                        : 'border-[rgba(var(--color-border),0.5)] text-[rgb(var(--color-text))] hover:border-[rgb(var(--color-primary))]'
                    }`}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      {...register('sexo')}
                      checked={selected}
                      className="sr-only"
                      aria-invalid={Boolean(errors.sexo)}
                    />
                    <span
                      aria-hidden
                      className={`rounded-full border ${selected ? 'border-[rgb(var(--color-primary))] bg-[rgba(var(--color-primary),0.1)] text-[rgb(var(--color-primary))]' : 'border-transparent text-[rgba(var(--color-text),0.6)]'} p-1`}
                    >
                      <Icon className="h-3 w-3" aria-hidden="true" />
                    </span>
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
          </Campo>


        </div>
        <Campo id="avatarUrl" label="Avatar">
          <AvatarUploader
            value={avatar}
            onChange={(novo) => setValue('avatarUrl', novo ?? '', { shouldDirty: true })}
          />
        </Campo>
      </section>

      <section className="form-section">
        <div className="form-section__header">
          <h2 className="form-section__title">Responsavel</h2>
          <p className="form-section__description">
            Quem cuida diretamente da crianca e deve ser acionado em situacoes de emergencia.
          </p>
        </div>
        <Campo id="responsavelNome" label="Nome do responsavel" required error={errors.responsavelNome?.message}>
          <input
            id="responsavelNome"
            type="text"
            {...register('responsavelNome')}
            aria-invalid={Boolean(errors.responsavelNome)}
            aria-describedby={errors.responsavelNome ? 'responsavelNome-error' : undefined}
            className="w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-3 text-base shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
            placeholder="Nome completo do responsavel"
          />
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            id="responsavelParentesco"
            label="Parentesco"
            required
            error={errors.responsavelParentesco?.message}
          >
            <select
              id="responsavelParentesco"
              {...register('responsavelParentesco')}
              aria-invalid={Boolean(errors.responsavelParentesco)}
              aria-describedby={errors.responsavelParentesco ? 'responsavelParentesco-error' : undefined}
              className="w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-3 text-base shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
            >
              {parentescoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Campo>


        </div>
      </section>

      <section className="form-section">
        <div className="form-section__header">
          <h2 className="form-section__title">Saude</h2>
          <p className="form-section__description">
            Campos opcionais da Caderneta da Crianca para acompanhar historico clinico.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="tipoSanguineo" label="Tipo sanguineo">
            <select
              id="tipoSanguineo"
              {...register('tipoSanguineo')}
              aria-invalid={Boolean(errors.tipoSanguineo)}
              aria-describedby={errors.tipoSanguineo ? 'tipoSanguineo-error' : undefined}
              className="w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-3 text-base shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
            >
              <option value="">Selecione</option>
              {tiposSanguineos.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </Campo>
          <Campo id="pediatra" label="Pediatra">
            <input
              id="pediatra"
              type="text"
              {...register('pediatra')}
              className="w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-3 text-base shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
              placeholder="Nome do pediatra"
            />
          </Campo>
        </div>
        <Campo id="alergias" label="Alergias">
          <textarea
            id="alergias"
            {...register('alergias')}
            className="min-h-[90px] w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-3 text-base shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
            placeholder="Digite as alergias separadas por virgula"
          />
        </Campo>
        <Campo id="doencasCronicas" label="Doencas cronicas">
          <textarea
            id="doencasCronicas"
            {...register('doencasCronicas')}
            className="min-h-[90px] w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-3 text-base shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
            placeholder="Doencas cronicas separadas por virgula"
          />
        </Campo>
        <Campo id="medicacoes" label="Medicacoes em uso">
          <textarea
            id="medicacoes"
            {...register('medicacoes')}
            className="min-h-[90px] w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-3 text-base shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
            placeholder="Medicacoes separadas por virgula"
          />
        </Campo>
        <div className="space-y-3 rounded-2xl border border-[rgba(var(--color-border),0.35)] bg-[rgba(var(--color-surface),0.25)] p-4">
          <div className="space-y-3">
            <div className="space-y-3 rounded-2xl border border-[rgba(var(--color-border),0.35)] p-3 shadow-inner">
              <Controller
                control={control}
                name="neurodivergenciaTEA"
                render={({ field: { value, onChange, onBlur, ref, name } }) => (
                  <label
                    htmlFor="neurodivergenciaTEA"
                    className="flex items-center justify-between gap-3 text-sm font-semibold text-[rgb(var(--color-text))]"
                  >
                    <span>TEA</span>
                    <input
                      id="neurodivergenciaTEA"
                      type="checkbox"
                      name={name}
                      ref={ref}
                      checked={Boolean(value)}
                      onChange={(event) => onChange(event.target.checked)}
                      onBlur={onBlur}
                      className="h-4 w-4 rounded border-[rgba(var(--color-border),0.6)] text-[rgb(var(--color-primary))] focus:ring-[rgba(30,136,229,0.25)]"
                    />
                  </label>
                )}
              />
              {neurodivergenciaTEASelecionada ? (
                <Campo
                  id="neurodivergenciaTEAGrau"
                  label="Grau do TEA"
                  required
                  error={errors.neurodivergenciaTEAGrau?.message}
                >
                  <input
                    id="neurodivergenciaTEAGrau"
                    type="text"
                    {...register('neurodivergenciaTEAGrau')}
                    aria-invalid={Boolean(errors.neurodivergenciaTEAGrau)}
                    aria-describedby={errors.neurodivergenciaTEAGrau ? 'neurodivergenciaTEAGrau-error' : undefined}
                    className="w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-3 text-base shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
                    placeholder="Informe o grau (ex.: leve, moderado)"
                  />
                </Campo>
              ) : null}
            </div>
            <div className="space-y-3 rounded-2xl border border-[rgba(var(--color-border),0.35)] p-3 shadow-inner">
              <Controller
                control={control}
                name="neurodivergenciaTDAH"
                render={({ field: { value, onChange, onBlur, ref, name } }) => (
                  <label
                    htmlFor="neurodivergenciaTDAH"
                    className="flex items-center justify-between gap-3 text-sm font-semibold text-[rgb(var(--color-text))]"
                  >
                    <span>TDAH</span>
                    <input
                      id="neurodivergenciaTDAH"
                      type="checkbox"
                      name={name}
                      ref={ref}
                      checked={Boolean(value)}
                      onChange={(event) => onChange(event.target.checked)}
                      onBlur={onBlur}
                      className="h-4 w-4 rounded border-[rgba(var(--color-border),0.6)] text-[rgb(var(--color-primary))] focus:ring-[rgba(30,136,229,0.25)]"
                    />
                  </label>
                )}
              />
              {neurodivergenciaTDAHSelecionada ? (
                <Campo
                  id="neurodivergenciaTDAHGrau"
                  label="Grau do TDAH"
                  required
                  error={errors.neurodivergenciaTDAHGrau?.message}
                >
                  <input
                    id="neurodivergenciaTDAHGrau"
                    type="text"
                    {...register('neurodivergenciaTDAHGrau')}
                    aria-invalid={Boolean(errors.neurodivergenciaTDAHGrau)}
                    aria-describedby={errors.neurodivergenciaTDAHGrau ? 'neurodivergenciaTDAHGrau-error' : undefined}
                    className="w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-3 text-base shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
                    placeholder="Informe o grau (ex.: leve, moderado)"
                  />
                </Campo>
              ) : null}
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="cpf" label="CPF ou RG">
            <Controller
              control={control}
              name="cpf"
              render={({ field }) => {
                const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
                  const mascarado = aplicarMascaraDocumento(event.target.value);
                  field.onChange(mascarado);
                };

                return (
                  <input
                    id="cpf"
                    type="text"
                    inputMode="numeric"
                    value={field.value ?? ''}
                    onChange={handleChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    aria-invalid={Boolean(errors.cpf)}
                    aria-describedby={errors.cpf ? 'cpf-error' : undefined}
                    className="w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-3 text-base shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
                    placeholder="000.000.000-00 ou 00.000.000-0"
                  />
                );
              }}
            />
          </Campo>
          <Campo
            id="planoSaudeTipo-sus"
            label="Cobertura de saude"
            required
            error={errors.planoSaudeTipo?.message}
          >
            <div className="flex flex-wrap gap-2 sm:flex-nowrap">
              {planoSaudeOptions.map((option) => {
                const optionId = `planoSaudeTipo-${option.value.toLowerCase()}`;
                const selecionado = planoSaudeTipo === option.value;

                return (
                  <label
                    key={option.value}
                    htmlFor={optionId}
                    className={`cursor-pointer rounded-2xl border px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm focus-within:border-[rgb(var(--color-primary))] focus-within:ring-2 focus-within:ring-[rgba(30,136,229,0.25)] ${
                      selecionado
                        ? 'border-[rgb(var(--color-primary))] bg-[rgba(var(--color-primary),0.1)] text-[rgb(var(--color-primary))]'
                        : 'border-[rgba(var(--color-border),0.5)] text-[rgb(var(--color-text))] hover:border-[rgb(var(--color-primary))]'
                    }`}
                  >
                    <input
                      id={optionId}
                      type="radio"
                      value={option.value}
                      {...register('planoSaudeTipo')}
                      className="sr-only"
                      aria-invalid={Boolean(errors.planoSaudeTipo)}
                      aria-describedby={errors.planoSaudeTipo ? 'planoSaudeTipo-sus-error' : undefined}
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </Campo>
        </div>
        {planoSaudeTipo === 'SUS' ? (
          <Campo
            id="cartaoSUS"
            label="Cartao SUS"
            required
            error={errors.cartaoSUS?.message}
          >
            <input
              id="cartaoSUS"
              type="text"
              {...register('cartaoSUS')}
              aria-invalid={Boolean(errors.cartaoSUS)}
              aria-describedby={errors.cartaoSUS ? 'cartaoSUS-error' : undefined}
              className="w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-3 text-base shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
              placeholder="Numero do cartao SUS"
            />
          </Campo>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              id="convenioOperadora"
              label="Operadora do convenio"
              required
              error={errors.convenioOperadora?.message}
            >
              <input
                id="convenioOperadora"
                type="text"
                {...register('convenioOperadora')}
                aria-invalid={Boolean(errors.convenioOperadora)}
                aria-describedby={errors.convenioOperadora ? 'convenioOperadora-error' : undefined}
                className="w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-3 text-base shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
                placeholder="Informe a operadora"
              />
            </Campo>
            <Campo
              id="convenioNumero"
              label="Numero da carteirinha"
              required
              error={errors.convenioNumero?.message}
            >
              <input
                id="convenioNumero"
                type="text"
                {...register('convenioNumero')}
                aria-invalid={Boolean(errors.convenioNumero)}
                aria-describedby={errors.convenioNumero ? 'convenioNumero-error' : undefined}
                className="w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-3 text-base shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
                placeholder="Numero da carteirinha"
              />
            </Campo>
          </div>
        )}
      </section>

      <footer className="form-actions flex flex-wrap items-center gap-3">
        {onDelete ? (
          <Button
            type="button"
            variant="ghost"
            className="border border-[rgba(var(--color-danger),0.4)] text-[rgb(var(--color-danger))] hover:border-[rgb(var(--color-danger))] hover:text-[rgb(var(--color-danger))] sm:mr-auto"
            onClick={onDelete}
            disabled={isSubmitting}
          >
            {deleteLabel ?? 'Excluir dados'}
          </Button>
        ) : null}
        {statusMessage ? (
          <span
            className={`flex items-center gap-1 text-sm font-semibold ${
              status === 'success' ? 'text-emerald-600' : 'text-[rgb(var(--color-danger))]'
            }`}
            role="status"
            aria-live="polite"
          >
            <span aria-hidden>{status === 'success' ? '[ok]' : '[erro]'}</span>
            {statusMessage}
          </span>
        ) : null}
        <div className="ml-auto flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {submitLabel ?? 'Salvar crianca'}
          </Button>
        </div>
      </footer>
    </form>
  );
}











