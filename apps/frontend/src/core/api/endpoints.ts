const API_PREFIX = '/api';

const withPrefix = (path: string) => `${API_PREFIX}${path}`;

export const endpoints = {
  authLogin: withPrefix('/auth/login'),
  authRegister: withPrefix('/auth/register'),
  authMe: withPrefix('/auth/me'),
  authRecover: withPrefix('/auth/recover'),
  authRecoverConfirm: withPrefix('/auth/recover/confirm'),
  temporaryPassword: withPrefix('/auth/send-temporary-password'),
  families: withPrefix('/familias'),
  patients: withPrefix('/pacientes'),
  children: withPrefix('/criancas'),
  treatments: withPrefix('/tratamentos'),
  doses: withPrefix('/doses'),
  dosesByDate: (date: string) => withPrefix(`/doses?date=${encodeURIComponent(date)}`),
  alerts: withPrefix('/alertas'),
  routineToday: withPrefix('/rotina/hoje'),
  attendances: withPrefix('/atendimentos'),
  professionals: withPrefix('/profissionais'),
  attendanceById: (id: string) => withPrefix(`/atendimentos/${id}`),
  reminders: (attendanceId: string) => withPrefix(`/atendimentos/${attendanceId}/lembretes`),
};

export type EndpointKey = keyof typeof endpoints;
