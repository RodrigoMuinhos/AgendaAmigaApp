export type FamilyMember = {
  id: string;
  name: string;
  birthdate: string;
  document?: string;
  postalCode?: string;
  addressNumber?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  avatar?: string;
  medicalHistory?: string;
  limitations?: string;
  allergies?: string;
  weight?: string;
  height?: string;
  imc?: string;
  needs?: string;
};

export type Caregiver = {
  id: string;
  name: string;
  relation?: string;
  phone?: string;
};

export type Family = {
  id: string;
  name: string;
  postalCode?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  primaryCaregiver?: string;
  primaryCaregiverRelationship?: string;
  contact?: string;
  caregiverPhone?: string;
  careFocus?: string;
  notes?: string;
  members: FamilyMember[];
  caregivers: Caregiver[];
};

export type TreatmentDose = {
  id: string;
  treatmentId: string;
  schedule: string;
  dose: string;
  instructions?: string;
};

export type Treatment = {
  id: string;
  familyId: string;
  name: string;
  dose: string;
  schedule: string;
  instructions?: string;
  doses?: TreatmentDose[];
  nextDose?: string;
};

export type RoutineItem = {
  id: string;
  title: string;
  description?: string;
  scheduledAt: string;
  done: boolean;
  category: 'dose' | 'appointment' | 'note';
};

export type Alert = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  type: 'medication' | 'appointment' | 'document' | 'other';
  status: 'pending' | 'done';
};

export type Professional = {
  id: string;
  name: string;
  specialty?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
};

export type AttendanceReminder = {
  id: string;
  attendanceId: string;
  minutesBefore: number;
  channel: 'PUSH' | 'EMAIL' | 'WHATSAPP';
};

export type AttendanceReminderInput = {
  minutesBefore: number;
  channel: 'PUSH' | 'EMAIL' | 'WHATSAPP';
};

export type AttendanceStatus = 'AGENDADO' | 'REALIZADO' | 'FALTOU' | 'CANCELADO';

export type AttendanceType = 'CONSULTA' | 'EXAME' | 'TERAPIA';

export type AttendanceInput = {
  patientId: string;
  patientName: string;
  type: AttendanceType;
  area?: string;
  professionalId?: string;
  professionalName?: string;
  location?: string;
  datetime: string;
  status: AttendanceStatus;
  notes?: string;
  attachments?: string[];
  reminders?: AttendanceReminderInput[];
};

export type Attendance = {
  id: string;
  createdAt: string;
  updatedAt: string;
} & AttendanceInput & {
  reminders?: AttendanceReminder[];
};

export type OnboardingDraft = {
  familyName?: string;
  caregiverName?: string;
  caregiverRelation?: string;
  caregiverPhone?: string;
  personName?: string;
  birthdate?: string;
  document?: string;
  address?: string;
  conditions?: string;
  allergies?: string;
  medications?: string;
  supports?: string;
  primaryGuardian?: string;
  backupGuardian?: string;
  emergencyPhone?: string;
  whatsAppInvite?: string;
  wakeTime?: string;
  sleepTime?: string;
  meals?: string;
  medicationName?: string;
  medicationDose?: string;
  medicationSchedule?: string;
  documents?: string;
  notes?: string;
};
