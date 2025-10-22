import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import dayjs from 'dayjs';

import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { createAttendance, fetchFamilies } from '../../../core/api/resources';
import type { AttendanceInput, AttendanceType } from '../../../core/types/api';

const attendanceStatuses = ['AGENDADO', 'REALIZADO', 'FALTOU', 'CANCELADO'] as const;
const typeLabels = {
  CONSULTA: 'consulta',
  EXAME: 'exame',
  TERAPIA: 'terapia',
} as const;

const quickAttendanceSchema = z.object({
  patientId: z.string().min(1, 'Selecione a crianca'),
  datetime: z.string().min(1, 'Informe data e hora'),
  status: z.enum(attendanceStatuses),
  area: z
    .string()
    .trim()
    .max(120)
    .optional(),
  location: z
    .string()
    .trim()
    .max(160)
    .optional(),
  professionalName: z
    .string()
    .trim()
    .max(160)
    .optional(),
  notes: z
    .string()
    .trim()
    .max(500)
    .optional(),
});

export type QuickAttendanceValues = z.infer<typeof quickAttendanceSchema>;

type QuickAttendanceModalProps = {
  open: boolean;
  type: AttendanceType;
  onClose: () => void;
  onCreated?: () => void;
};

export function QuickAttendanceModal({ open, onClose, type, onCreated }: QuickAttendanceModalProps) {
  const queryClient = useQueryClient();
  const typeLabel = typeLabels[type];

  const familiesQuery = useQuery({
    queryKey: ['families'],
    queryFn: fetchFamilies,
    staleTime: 5 * 60 * 1000,
  });

  const patients = useMemo(() => {
    if (!familiesQuery.data) return [];
    return familiesQuery.data.flatMap((family) =>
      family.members.map((member) => ({
        id: member.id,
        name: member.name,
        family: family.name,
      })),
    );
  }, [familiesQuery.data]);

  const form = useForm<QuickAttendanceValues>({
    resolver: zodResolver(quickAttendanceSchema),
    defaultValues: {
      patientId: '',
      datetime: dayjs().add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
      status: 'AGENDADO',
      area: '',
      location: '',
      professionalName: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        patientId: '',
        datetime: dayjs().add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
        status: 'AGENDADO',
        area: '',
        location: '',
        professionalName: '',
        notes: '',
      });
    }
  }, [open, form]);

  const createMutation = useMutation({
    mutationFn: async (values: QuickAttendanceValues) => {
      const patient = patients.find((item) => item.id === values.patientId);
      if (!patient) {
        throw new Error('Crianca nao encontrada');
      }
      const payload: AttendanceInput = {
        patientId: patient.id,
        patientName: patient.name,
        type,
        area: values.area?.trim() || undefined,
        professionalName: values.professionalName?.trim() || undefined,
        location: values.location?.trim() || undefined,
        datetime: dayjs(values.datetime).toISOString(),
        status: values.status,
        notes: values.notes?.trim() || undefined,
      };
      return createAttendance(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] }).catch(() => undefined);
      onCreated?.();
      onClose();
    },
  });

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!createMutation.isPending) {
          onClose();
        }
      }}
      title={`Nova ${typeLabel}`}
      description="Registre rapidamente o atendimento para que ele apareca na agenda."
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => {
          createMutation.mutate(values);
        })}
      >
        <label className="flex flex-col gap-2 text-sm text-[rgb(var(--color-text))]">
          <span className="font-medium">Crianca</span>
          <select
            {...form.register('patientId')}
            data-modal-initial-focus
            className="rounded-xl border border-[rgba(var(--color-border),0.6)] bg-white px-3 py-2 text-sm shadow-sm focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--color-primary),0.2)]"
          >
            <option value="">Selecione</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name} • {patient.family}
              </option>
            ))}
          </select>
          {form.formState.errors.patientId ? (
            <span className="text-xs text-[rgb(var(--color-danger))]">
              {form.formState.errors.patientId.message}
            </span>
          ) : null}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-[rgb(var(--color-text))]">
            <span className="font-medium">Data e hora</span>
            <Input type="datetime-local" {...form.register('datetime')} />
            {form.formState.errors.datetime ? (
              <span className="text-xs text-[rgb(var(--color-danger))]">
                {form.formState.errors.datetime.message}
              </span>
            ) : null}
          </label>

          <label className="flex flex-col gap-2 text-sm text-[rgb(var(--color-text))]">
            <span className="font-medium">Status</span>
            <Select {...form.register('status')}>
              {attendanceStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-[rgb(var(--color-text))]">
            <span className="font-medium">Area / Especialidade</span>
            <Input {...form.register('area')} placeholder="Pediatria, fono, fisio..." />
          </label>

          <label className="flex flex-col gap-2 text-sm text-[rgb(var(--color-text))]">
            <span className="font-medium">Profissional</span>
            <Input {...form.register('professionalName')} placeholder="Nome do profissional" />
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm text-[rgb(var(--color-text))]">
          <span className="font-medium">Local</span>
          <Input {...form.register('location')} placeholder="Cl�nica, hospital, teleconsulta..." />
        </label>

        <label className="flex flex-col gap-2 text-sm text-[rgb(var(--color-text))]">
          <span className="font-medium">Notas</span>
          <Textarea rows={3} {...form.register('notes')} placeholder="Observacoes importantes" />
        </label>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>

        {createMutation.isError ? (
          <p className="text-sm text-[rgb(var(--color-danger))]">N�o foi poss�vel salvar. Tente novamente.</p>
        ) : null}
      </form>
    </Modal>
  );
}
