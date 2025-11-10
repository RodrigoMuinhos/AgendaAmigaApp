export const endpoints = {
  authLogin: '/auth/login',
  authRegister: '/auth/register',
  authMe: '/auth/me',
  families: '/familias',
  patients: '/pacientes',
  children: '/criancas',
  treatments: '/tratamentos',
  doses: '/doses',
  dosesByDate: (date: string) => `/doses?date=${encodeURIComponent(date)}`,
  alerts: '/alertas',
  routineToday: '/rotina/hoje',
  attendances: '/atendimentos',
  professionals: '/profissionais',
  attendanceById: (id: string) => `/atendimentos/${id}`,
  reminders: (attendanceId: string) => `/atendimentos/${attendanceId}/lembretes`,
};

export type EndpointKey = keyof typeof endpoints;
