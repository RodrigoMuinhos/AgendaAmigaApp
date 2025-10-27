import { api } from '../../services/api';
import { asArray } from '../utils/arrays';
import { endpoints } from './endpoints';
import type {
  Alert,
  Attendance,
  AttendanceInput,
  Family,
  OnboardingDraft,
  Professional,
  RoutineItem,
  Treatment,
} from '../types/api';

async function safeRequest<T>(request: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn('[api] fallback triggered for request', error);
    }
    return fallback;
  }
}

export async function fetchFamilies() {
  return safeRequest(async () => {
    const response = await api.get<Family[]>(endpoints.families);
    return asArray<Family>(response.data);
  }, []);
}

export async function createFamily(payload: Omit<Family, 'id'>) {
  const response = await api.post<Family>(endpoints.families, payload);
  return response.data;
}

export async function fetchTreatments() {
  return safeRequest(async () => {
    const response = await api.get<Treatment[]>(endpoints.treatments);
    return asArray<Treatment>(response.data);
  }, []);
}

export async function createTreatment(payload: Omit<Treatment, 'id' | 'nextDose' | 'doses'>) {
  const response = await api.post<Treatment>(endpoints.treatments, payload);
  return response.data;
}

export async function fetchTodayRoutine(date: string) {
  return safeRequest(async () => {
    const response = await api.get<RoutineItem[]>(endpoints.dosesByDate(date));
    return asArray<RoutineItem>(response.data);
  }, []);
}

export async function fetchAlerts() {
  const response = await api.get<Alert[]>(endpoints.alerts);
  return asArray<Alert>(response.data);
}

type AttendancesQuery = {
  patientId?: string;
  type?: string;
  status?: string;
  from?: string;
  to?: string;
};

export async function fetchAttendances(params: AttendancesQuery = {}) {
  const search = new URLSearchParams();
  if (params.patientId) search.set('pacienteId', params.patientId);
  if (params.type) search.set('tipo', params.type);
  if (params.status) search.set('status', params.status);
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  const query = search.toString();
  const response = await api.get<Attendance[]>(
    query ? `${endpoints.attendances}?${query}` : endpoints.attendances,
  );
  return asArray<Attendance>(response.data);
}

export async function fetchAttendanceById(id: string) {
  const response = await api.get<Attendance>(endpoints.attendanceById(id));
  return response.data;
}

export async function createAttendance(payload: AttendanceInput) {
  const response = await api.post<Attendance>(endpoints.attendances, payload);
  return response.data;
}

export async function updateAttendance(
  id: string,
  payload: Partial<AttendanceInput>,
) {
  const response = await api.put<Attendance>(endpoints.attendanceById(id), payload);
  return response.data;
}

export async function deleteAttendance(id: string) {
  await api.delete(endpoints.attendanceById(id));
}

export async function fetchProfessionals() {
  const response = await api.get<Professional[]>(endpoints.professionals);
  return response.data;
}

export async function saveOnboardingDraft(_payload: OnboardingDraft) {
  return Promise.resolve(true);
}
