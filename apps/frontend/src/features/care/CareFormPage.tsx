import { useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import {
  createAttendance,
  fetchAttendanceById,
  fetchFamilies,
  fetchProfessionals,
  updateAttendance,
} from '../../core/api/resources';
import type { AttendanceInput, AttendanceStatus, AttendanceType } from '../../core/types/api';
import { attendanceFormSchema, type AttendanceFormValues } from './schemas';

type CareFormPageProps = {
  defaultType: AttendanceType;
};

export function CareFormPage({ defaultType }: CareFormPageProps) {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      patientId: '',
      type: defaultType,
      area: '',
      professionalId: '',
      location: '',
      datetime: new Date(),
      status: 'AGENDADO',
      notes: '',
      attachments: [],
      reminders: [{ minutesBefore: 60, channel: 'PUSH' }],
    },
  });

  const familiesQuery = useQuery({
    queryKey: ['families'],
    queryFn: fetchFamilies,
  });

  const professionalsQuery = useQuery({
    queryKey: ['professionals'],
    queryFn: fetchProfessionals,
  });

  const attendanceQuery = useQuery({
    queryKey: ['attendance', id],
    queryFn: () => fetchAttendanceById(id ?? ''),
    enabled: isEditing,
  });

  useEffect(() => {
    if (attendanceQuery.data) {
      const attendance = attendanceQuery.data;
      form.reset({
        patientId: attendance.patientId,
        type: attendance.type,
        area: attendance.area ?? '',
        professionalId: attendance.professionalId ?? '',
        location: attendance.location ?? '',
        datetime: dayjs(attendance.datetime).toDate(),
        status: attendance.status,
        notes: attendance.notes ?? '',
        attachments: attendance.attachments ?? [],
        reminders: attendance.reminders?.map((reminder) => ({
          minutesBefore: reminder.minutesBefore,
          channel: reminder.channel,
        })) ?? [],
      });
    }
  }, [attendanceQuery.data, form]);

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

  const reminderArray = useFieldArray<AttendanceFormValues, 'reminders'>({
    control: form.control,
    name: 'reminders',
  });

  const createMutation = useMutation({
    mutationFn: createAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] }).catch(() => undefined);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ attendanceId, payload }: { attendanceId: string; payload: Partial<AttendanceInput> }) =>
      updateAttendance(attendanceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] }).catch(() => undefined);
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['attendance', id] }).catch(() => undefined);
      }
    },
  });

  const onSubmit = (values: AttendanceFormValues) => {
    const patientOption = patients.find((patient) => patient.id === values.patientId);
    const payload: AttendanceInput = {
      patientId: values.patientId,
      patientName: patientOption?.name ?? '',
      type: values.type,
      area: values.area?.trim() || undefined,
      professionalId: values.professionalId || undefined,
      professionalName:
        professionalsQuery.data?.find((prof) => prof.id === values.professionalId)?.name ?? undefined,
      location: values.location?.trim() || undefined,
      datetime: values.datetime.toISOString(),
      status: values.status,
      notes: values.notes?.trim() || undefined,
      attachments: values.attachments?.filter((url) => url?.length) ?? [],
      reminders:
        values.reminders
          ?.filter((reminder) => reminder.minutesBefore && reminder.channel)
          .map((reminder) => ({
            minutesBefore: Number(reminder.minutesBefore),
            channel: reminder.channel,
          })) ?? [],
    };

    if (isEditing && id) {
      updateMutation
        .mutateAsync({ attendanceId: id, payload })
        .then(() => navigate('/care'))
        .catch(() => undefined);
    } else {
      createMutation
        .mutateAsync(payload)
        .then(() => navigate('/care'))
        .catch(() => undefined);
    }
  };

  const statusOptions: AttendanceStatus[] = ['AGENDADO', 'REALIZADO', 'FALTOU', 'CANCELADO'];

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2 rounded-3xl bg-[rgb(var(--color-surface))] p-6 shadow-soft lg:p-8">
        <h1 className="text-3xl font-semibold text-[rgb(var(--color-text))]">
          {isEditing ? t('care.form.titleEdit') : t('care.form.titleNew')}
        </h1>
        <Link to="/care" className="text-sm font-semibold text-[rgb(var(--color-primary))] hover:underline">
          {t('common.previous')}
        </Link>
      </header>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('care.form.titleNew')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-1">
              <label className="flex flex-col gap-2 text-base text-[rgb(var(--color-text))]">
                <span className="font-semibold leading-tight">{t('care.form.patient')}</span>
                <Select {...form.register('patientId')} aria-invalid={!!form.formState.errors.patientId}>
                  <option value="">{t('common.select')}</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} • {patient.family}
                    </option>
                  ))}
                </Select>
                <span className="min-h-[1.25rem] text-sm text-[rgb(var(--color-danger))]">
                  {form.formState.errors.patientId ? t('validation.required') : ''}
                </span>
              </label>
            </div>

            <div>
              <label className="flex flex-col gap-2 text-base text-[rgb(var(--color-text))]">
                <span className="font-semibold leading-tight">{t('care.form.type')}</span>
                <Select value={form.watch('type')} disabled>
                  <option value="CONSULTA">{t('care.filters.types.CONSULTA')}</option>
                  <option value="EXAME">{t('care.filters.types.EXAME')}</option>
                  <option value="TERAPIA">{t('care.filters.types.TERAPIA')}</option>
                </Select>
              </label>
            </div>

            <div>
              <label className="flex flex-col gap-2 text-base text-[rgb(var(--color-text))]">
                <span className="font-semibold leading-tight">{t('care.form.area')}</span>
                <Input {...form.register('area')} placeholder="Ex.: Pediatria, TO, Neuro" />
              </label>
            </div>

            <div>
              <label className="flex flex-col gap-2 text-base text-[rgb(var(--color-text))]">
                <span className="font-semibold leading-tight">{t('care.form.professional')}</span>
                <Select {...form.register('professionalId')}>
                  <option value="">{t('care.form.professionalPlaceholder')}</option>
                  {professionalsQuery.data?.map((professional) => (
                    <option key={professional.id} value={professional.id}>
                      {professional.name}
                      {professional.specialty ? ` • ${professional.specialty}` : ''}
                    </option>
                  ))}
                </Select>
              </label>
            </div>

            <div>
              <label className="flex flex-col gap-2 text-base text-[rgb(var(--color-text))]">
                <span className="font-semibold leading-tight">{t('care.form.location')}</span>
                <Input {...form.register('location')} placeholder="Hospital, clínica, online..." />
              </label>
            </div>

            <div>
              <Controller
                control={form.control}
                name="datetime"
                render={({ field }) => (
                  <label className="flex flex-col gap-2 text-base text-[rgb(var(--color-text))]">
                    <span className="font-semibold leading-tight">{t('care.form.datetime')}</span>
                    <Input
                      type="datetime-local"
                      value={dayjs(field.value).format('YYYY-MM-DDTHH:mm')}
                      onChange={(event) => {
                        const value = event.target.value;
                        field.onChange(value ? dayjs(value).toDate() : new Date());
                      }}
                    />
                  </label>
                )}
              />
            </div>

            <div>
              <label className="flex flex-col gap-2 text-base text-[rgb(var(--color-text))]">
                <span className="font-semibold leading-tight">{t('care.form.status')}</span>
                <Select {...form.register('status')}>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {t(`care.filters.status.${status}`)}
                    </option>
                  ))}
                </Select>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="flex flex-col gap-2 text-base text-[rgb(var(--color-text))]">
                <span className="font-semibold leading-tight">{t('care.form.notes')}</span>
                <Textarea rows={3} {...form.register('notes')} />
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('care.form.attachments')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted">{t('care.form.attachmentsHint')}</p>
            <Controller
              control={form.control}
              name="attachments"
              render={({ field }) => (
                <Textarea
                  rows={3}
                  value={(field.value ?? []).join('\n')}
                  onChange={(event) => {
                    const lines = event.target.value
                      .split('\n')
                      .map((line) => line.trim())
                      .filter((line) => line.length > 0);
                    field.onChange(lines);
                  }}
                />
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('care.form.reminders')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reminderArray.fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 md:grid-cols-[1fr,200px,auto] md:items-center">
                <label className="flex flex-col gap-2 text-base text-[rgb(var(--color-text))]">
                  <span className="font-semibold leading-tight">{t('care.form.reminderMinutes')}</span>
                  <Input
                    type="number"
                    min={5}
                    step={5}
                    {...form.register(`reminders.${index}.minutesBefore` as const, { valueAsNumber: true })}
                  />
                </label>
                <label className="flex flex-col gap-2 text-base text-[rgb(var(--color-text))]">
                  <span className="font-semibold leading-tight">{t('care.form.reminderChannel')}</span>
                  <Select {...form.register(`reminders.${index}.channel` as const)}>
                    <option value="PUSH">Push</option>
                    <option value="EMAIL">E-mail</option>
                    <option value="WHATSAPP">WhatsApp</option>
                  </Select>
                </label>
                <Button type="button" variant="ghost" size="sm" onClick={() => reminderArray.remove(index)}>
                  {t('common.delete')}
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => reminderArray.append({ minutesBefore: 60, channel: 'PUSH' })}
            >
              {t('care.form.reminderAdd')}
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate('/care')}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {isEditing ? t('care.form.submitUpdate') : t('care.form.submitCreate')}
          </Button>
        </div>
      </form>
    </section>
  );
}

