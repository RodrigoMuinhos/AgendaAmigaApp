import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../../components/ui/button';
import { Campo } from './Campo';
import { AvatarUploader } from './AvatarUploader';
import type { Crianca, CriancaCreateInput, ParentescoResponsavel, Sexo, TipoSanguineo } from '../types';

type FormCriancaProps = {
  onSubmit: (data: CriancaCreateInput) => Promise<void> | void;
  onCancel: () => void;
  defaultValues?: Partial<Crianca>;
  isSubmitting?: boolean;
  submitLabel?: string;
  onDelete?: () => void;
  deleteLabel?: string;
};

const telefoneRegex =
  /^(?:\+?[1-9]\d{9,14}|(?:\(\d{2}\)\s?)?\d{4,5}-\d{4}|(?:\d{2}\s?)?\d{4,5}-\d{4})$/;

const schema = z.object({
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
  sexo: z.enum(['M', 'F', 'Outro'], { required_error: 'Selecione o sexo.' }),
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
  cpf: z.string().trim().optional(),
  tipoSanguineo: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional()
    .or(z.literal('')),
  alergias: z.string().trim().optional(),
  doencasCronicas: z.string().trim().optional(),
  medicacoes: z.string().trim().optional(),
  pediatra: z.string().trim().optional(),
  avatarUrl: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const sexoOptions: { value: Sexo; label: string }[] = [
  { value: 'M', label: 'M' },
  { value: 'F', label: 'F' },
  { value: 'Outro', label: 'Outro' },
];

const parentescoOptions: { value: ParentescoResponsavel; label: string }[] = [
  { value: 'Mae', label: 'Mae' },
  { value: 'Pai', label: 'Pai' },
  { value: 'Tutor(a)', label: 'Tutor(a)' },
  { value: 'Avo/Avo', label: 'Avo ou Avo' },
  { value: 'Outro', label: 'Outro' },
];

const tiposSanguineos: TipoSanguineo[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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

function criarValoresIniciais(defaultValues?: Partial<Crianca>): FormValues {
  return {
    nome: defaultValues?.nome ?? '',
    nascimentoISO: defaultValues?.nascimentoISO ?? '',
    sexo: defaultValues?.sexo ?? 'Outro',
    responsavelNome: defaultValues?.responsavel?.nome ?? '',
    responsavelParentesco: defaultValues?.responsavel?.parentesco ?? 'Mae',
    responsavelTelefone: defaultValues?.responsavel?.telefone ?? '',
    cartaoSUS: defaultValues?.cartaoSUS ?? '',
    cpf: defaultValues?.cpf ?? '',
    tipoSanguineo: defaultValues?.tipoSanguineo ?? '',
    alergias: transformarListaParaTexto(defaultValues?.alergias),
    doencasCronicas: transformarListaParaTexto(defaultValues?.doencasCronicas),
    medicacoes: transformarListaParaTexto(defaultValues?.medicacoes),
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
}: FormCriancaProps) {
  const {
    register,
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

  const handleFormSubmit = handleSubmit((values) => {
    const payload: CriancaCreateInput = {
      nome: values.nome.trim(),
      nascimentoISO: values.nascimentoISO,
      sexo: values.sexo,
      responsavel: {
        nome: values.responsavelNome.trim(),
        parentesco: values.responsavelParentesco,
        telefone: values.responsavelTelefone.trim() || undefined,
      },
      cartaoSUS: values.cartaoSUS?.trim() || undefined,
      cpf: values.cpf?.trim() || undefined,
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
            <select
              id="sexo"
              {...register('sexo')}
              aria-invalid={Boolean(errors.sexo)}
              aria-describedby={errors.sexo ? 'sexo-error' : undefined}
              className="w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-3 text-base shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
            >
              {sexoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
          <Campo
            id="responsavelTelefone"
            label="Telefone"
            hint="Formato aceito: +5511999999999 ou (11) 99999-9999"
            required
            error={errors.responsavelTelefone?.message}
          >
            <input
              id="responsavelTelefone"
              type="tel"
              {...register('responsavelTelefone')}
              aria-invalid={Boolean(errors.responsavelTelefone)}
              aria-describedby={
                errors.responsavelTelefone ? 'responsavelTelefone-error' : 'responsavelTelefone-hint'
              }
              className="w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-3 text-base shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
              placeholder="(11) 99999-9999"
            />
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
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="cpf" label="CPF">
            <input
              id="cpf"
              type="text"
              {...register('cpf')}
              className="w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-3 text-base shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
              placeholder="000.000.000-00"
            />
          </Campo>
          <Campo id="cartaoSUS" label="Cartao SUS">
            <input
              id="cartaoSUS"
              type="text"
              {...register('cartaoSUS')}
              className="w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-transparent px-4 py-3 text-base shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
              placeholder="Numero do cartao SUS"
            />
          </Campo>
        </div>
      </section>

      <footer className="form-actions">
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
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel ?? 'Salvar crianca'}
        </Button>
      </footer>
    </form>
  );
}
