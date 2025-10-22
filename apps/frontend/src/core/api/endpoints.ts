export const endpoints = {
  families: '/familias',
  patients: '/pacientes',
  treatments: '/tratamentos',
  dosesByDate: (date: string) => `/doses?date=${encodeURIComponent(date)}`,
  alerts: '/alertas',
  routineToday: '/rotina/hoje',
  attendances: '/atendimentos',
  professionals: '/profissionais',
  attendanceById: (id: string) => `/atendimentos/${id}`,
  reminders: (attendanceId: string) => `/atendimentos/${attendanceId}/lembretes`,
};

export type EndpointKey = keyof typeof endpoints;
