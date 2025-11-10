import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, X } from 'lucide-react';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/button';
import { Campo } from '../Campo';
import type { CrescimentoRegistro } from '../../types';

const schema = z
  .object({
    dataISO: z
      .string()
      .refine((value) => dayjs(value).isValid(), 'Informe uma data valida.'),
    pesoKg: z
      .string()
      .optional()
      .transform((value) => (value ? Number(value.replace(',', '.')) : undefined))
      .refine((value) => (value === undefined ? true : value >= 0), 'O peso deve ser positivo.'),
    estaturaCm: z
      .string()
      .optional()
      .transform((value) => (value ? Number(value.replace(',', '.')) : undefined))
      .refine((value) => (value === undefined ? true : value >= 0), 'A estatura deve ser positiva.'),
    perimetroCefalicoCm: z
      .string()
      .optional()
      .transform((value) => (value ? Number(value.replace(',', '.')) : undefined))
      .refine((value) => (value === undefined ? true : value >= 0), 'Informe um valor positivo.'),
    observacoes: z.string().optional(),
  })
  .refine(
    (data) => data.pesoKg !== undefined || data.estaturaCm !== undefined || data.perimetroCefalicoCm !== undefined,
    {
      message: 'Informe ao menos uma medida (peso, estatura ou perimetro).',
      path: ['pesoKg'],
    },
  );

type FormValues = z.infer<typeof schema>;

type RegistroCrescimentoModalProps = {
  open: boolean;
  onClose: () => void;
  criancaId: string;
  modo?: 'criar' | 'editar';
  originalDataISO?: string;
  registroInicial?: CrescimentoRegistro;
  onSubmit: (registro: CrescimentoRegistro, metadata: { modo: 'criar' | 'editar'; originalDataISO?: string }) => void;
};

export function RegistroCrescimentoModal({
  open,
  onClose,
  criancaId,
  modo = 'criar',
  originalDataISO,
  registroInicial,
  onSubmit,
}: RegistroCrescimentoModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      dataISO: registroInicial?.dataISO ?? dayjs().format('YYYY-MM-DD'),
      pesoKg: registroInicial?.pesoKg?.toString() ?? '',
      estaturaCm: registroInicial?.estaturaCm?.toString() ?? '',
      perimetroCefalicoCm: registroInicial?.perimetroCefalicoCm?.toString() ?? '',
      observacoes: registroInicial?.observacoes ?? '',
    },
  });

  useEffect(() => {
    reset({
      dataISO: registroInicial?.dataISO ?? dayjs().format('YYYY-MM-DD'),
      pesoKg: registroInicial?.pesoKg?.toString() ?? '',
      estaturaCm: registroInicial?.estaturaCm?.toString() ?? '',
      perimetroCefalicoCm: registroInicial?.perimetroCefalicoCm?.toString() ?? '',
      observacoes: registroInicial?.observacoes ?? '',
    });
  }, [registroInicial, reset, open]);

  const titulo = modo === 'criar' ? 'Registrar medida' : 'Editar medida';
  const descricao =
    modo === 'criar'
      ? 'Acompanhe o crescimento registrando peso, estatura e perimetro cefalico.'
      : 'Atualize os valores da medida registrada.';
  const labelBotao = modo === 'criar' ? 'Salvar medida' : 'Salvar alteracoes';

  const onSubmitInterno = handleSubmit((values) => {
    const payload: CrescimentoRegistro = {
      criancaId,
      dataISO: values.dataISO,
      pesoKg: values.pesoKg,
      estaturaCm: values.estaturaCm,
      perimetroCefalicoCm: values.perimetroCefalicoCm,
      observacoes: values.observacoes?.trim() || undefined,
    };

    onSubmit(payload, { modo, originalDataISO: modo === 'editar' ? originalDataISO ?? registroInicial?.dataISO : undefined });
    onClose();
  });

  return (
    <Modal open={open} onClose={onClose} title={titulo} description={descricao} showCloseButton={false}>
      <form onSubmit={onSubmitInterno} className='space-y-4'>
        <div className='grid gap-4 sm:grid-cols-2'>
          <Campo id='dataISO' label='Data' required error={errors.dataISO?.message}>
            <input
              id='dataISO'
              type='date'
              {...register('dataISO')}
              data-modal-initial-focus
              className='w-full rounded-2xl border border-[rgba(var(--color-border),0.4)] bg-transparent px-4 py-3 text-sm shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]'
            />
          </Campo>
          <Campo id='pesoKg' label='Peso (kg)' hint='Use ponto ou virgula' error={errors.pesoKg?.message}>
            <input
              id='pesoKg'
              type='number'
              step='0.01'
              min='0'
              {...register('pesoKg')}
              className='w-full rounded-2xl border border-[rgba(var(--color-border),0.4)] bg-transparent px-4 py-3 text-sm shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]'
            />
          </Campo>
        </div>
        <div className='grid gap-4 sm:grid-cols-2'>
          <Campo id='estaturaCm' label='Estatura (cm)' error={errors.estaturaCm?.message}>
            <input
              id='estaturaCm'
              type='number'
              step='0.1'
              min='0'
              {...register('estaturaCm')}
              className='w-full rounded-2xl border border-[rgba(var(--color-border),0.4)] bg-transparent px-4 py-3 text-sm shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]'
            />
          </Campo>
          <Campo id='perimetroCefalicoCm' label='Perimetro cefalico (cm)' error={errors.perimetroCefalicoCm?.message}>
            <input
              id='perimetroCefalicoCm'
              type='number'
              step='0.1'
              min='0'
              {...register('perimetroCefalicoCm')}
              className='w-full rounded-2xl border border-[rgba(var(--color-border),0.4)] bg-transparent px-4 py-3 text-sm shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]'
            />
          </Campo>
        </div>
        <Campo id='observacoes' label='Observacoes'>
          <textarea
            id='observacoes'
            {...register('observacoes')}
            className='min-h-[90px] w-full rounded-2xl border border-[rgba(var(--color-border),0.4)] bg-transparent px-4 py-3 text-sm shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]'
            placeholder='Registre detalhes relevantes, como alimentacao ou orientacoes medicas.'
          />
        </Campo>
        {errors.pesoKg?.message ? (
          <p className='text-sm font-semibold text-red-500'>{errors.pesoKg.message}</p>
        ) : null}
        <div className='flex justify-end gap-3 pt-2'>
          <Button
            type='button'
            variant='ghost'
            onClick={onClose}
            className='h-11 w-11 px-0 py-0'
            aria-label='Cancelar'
            title='Cancelar'
          >
            <X className='h-5 w-5' aria-hidden />
          </Button>
          <Button
            type='submit'
            isLoading={isSubmitting}
            className='h-11 w-11 px-0 py-0'
            aria-label={labelBotao}
            title={labelBotao}
          >
            <Check className='h-5 w-5' aria-hidden />
          </Button>
        </div>
      </form>
    </Modal>
  );
}
