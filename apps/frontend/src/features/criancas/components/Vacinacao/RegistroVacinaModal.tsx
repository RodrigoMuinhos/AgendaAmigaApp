import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/button';
import { Campo } from '../Campo';
import type { VacinaCatalogoItem, VacinaDose, VacinaRegistro } from '../../types';

type FormValues = {
  dataISO: string;
  vacinaId: string;
  doseCodigo: string;
  lote?: string;
  local?: string;
  profissional?: string;
  observacoes?: string;
};

type RegistroVacinaModalProps = {
  open: boolean;
  onClose: () => void;
  criancaId: string;
  catalogo: VacinaCatalogoItem[];
  onConfirm: (registro: VacinaRegistro) => void;
};

export function RegistroVacinaModal({
  open,
  onClose,
  criancaId,
  catalogo,
  onConfirm,
}: RegistroVacinaModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      dataISO: dayjs().format('YYYY-MM-DD'),
      vacinaId: '',
      doseCodigo: '',
      lote: '',
      local: '',
      profissional: '',
      observacoes: '',
    },
  });

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const vacinaSelecionada = catalogo.find((item) => item.id === watch('vacinaId'));
  const dosesDisponiveis: VacinaDose[] = vacinaSelecionada?.doses ?? [];

  useEffect(() => {
    if (!vacinaSelecionada) {
      setValue('doseCodigo', '');
    } else {
      const atual = watch('doseCodigo');
      const existe = dosesDisponiveis.some((dose) => dose.codigo === atual);
      if (!existe) {
        setValue('doseCodigo', '');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vacinaSelecionada?.id]);

  const onSubmit = handleSubmit((values) => {
    if (!values.vacinaId || !values.doseCodigo) {
      return;
    }
    const registro: VacinaRegistro = {
      criancaId,
      vacinaId: values.vacinaId,
      doseCodigo: values.doseCodigo,
      dataISO: values.dataISO,
      lote: values.lote?.trim() || undefined,
      local: values.local?.trim() || undefined,
      profissional: values.profissional?.trim() || undefined,
      observacoes: values.observacoes?.trim() || undefined,
    };
    onConfirm(registro);
    onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar vacina"
      description="Informe os dados principais da aplicacao para manter o historico atualizado."
      closeLabel="Cancelar"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="dataISO" label="Data" required error={errors.dataISO?.message}>
            <input
              id="dataISO"
              type="date"
              {...register('dataISO', {
                required: 'Informe a data da aplicacao.',
                validate: (value) => (dayjs(value).isValid() ? true : 'Data invalida.'),
              })}
              className="w-full rounded-2xl border border-[rgba(var(--color-border),0.4)] bg-transparent px-4 py-3 text-sm shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
            />
          </Campo>
          <Campo id="vacinaId" label="Vacina" required error={errors.vacinaId?.message}>
            <select
              id="vacinaId"
              {...register('vacinaId', { required: 'Selecione a vacina.' })}
              className="w-full rounded-2xl border border-[rgba(var(--color-border),0.4)] bg-transparent px-4 py-3 text-sm shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
            >
              <option value="">Selecione</option>
              {catalogo.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>
          </Campo>
        </div>

        <Campo id="doseCodigo" label="Dose" required error={errors.doseCodigo?.message}>
          <select
            id="doseCodigo"
            {...register('doseCodigo', { required: 'Selecione a dose.' })}
            disabled={!dosesDisponiveis.length}
            className="w-full rounded-2xl border border-[rgba(var(--color-border),0.4)] bg-transparent px-4 py-3 text-sm shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)] disabled:opacity-60"
          >
            <option value="">{dosesDisponiveis.length ? 'Selecione' : 'Escolha uma vacina'}</option>
            {dosesDisponiveis.map((dose) => (
              <option key={dose.codigo} value={dose.codigo}>
                {dose.rotulo}
              </option>
            ))}
          </select>
        </Campo>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="lote" label="Lote">
            <input
              id="lote"
              type="text"
              {...register('lote')}
              placeholder="Identificacao do lote"
              className="w-full rounded-2xl border border-[rgba(var(--color-border),0.4)] bg-transparent px-4 py-3 text-sm shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
            />
          </Campo>
          <Campo id="local" label="Local">
            <input
              id="local"
              type="text"
              {...register('local')}
              placeholder="Unidade de saude"
              className="w-full rounded-2xl border border-[rgba(var(--color-border),0.4)] bg-transparent px-4 py-3 text-sm shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
            />
          </Campo>
        </div>

        <Campo id="profissional" label="Profissional">
          <input
            id="profissional"
            type="text"
            {...register('profissional')}
            placeholder="Nome do aplicador"
            className="w-full rounded-2xl border border-[rgba(var(--color-border),0.4)] bg-transparent px-4 py-3 text-sm shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
          />
        </Campo>

        <Campo id="observacoes" label="Observacoes">
          <textarea
            id="observacoes"
            {...register('observacoes')}
            className="min-h-[100px] w-full rounded-2xl border border-[rgba(var(--color-border),0.4)] bg-transparent px-4 py-3 text-sm shadow-inner focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(30,136,229,0.25)]"
            placeholder="Anote informacoes importantes sobre a aplicacao."
          />
        </Campo>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Salvar registro
          </Button>
        </div>
      </form>
    </Modal>
  );
}
