import { z } from 'zod';

export const attendanceReminderSchema = z.object({
  minutesBefore: z.coerce.number().int().positive(),
  channel: z.enum(['PUSH', 'EMAIL', 'WHATSAPP']),
});

export const attendanceFormSchema = z.object({
  patientId: z.string().min(1),
  type: z.enum(['CONSULTA', 'EXAME', 'TERAPIA']),
  area: z.string().optional(),
  professionalId: z.string().optional(),
  location: z.string().optional(),
  datetime: z.coerce.date(),
  status: z.enum(['AGENDADO', 'REALIZADO', 'FALTOU', 'CANCELADO']).default('AGENDADO'),
  notes: z.string().max(2000).optional(),
  attachments: z.array(z.string().url()).optional(),
  reminders: z.array(attendanceReminderSchema).optional(),
});

export type AttendanceFormValues = z.infer<typeof attendanceFormSchema>;
