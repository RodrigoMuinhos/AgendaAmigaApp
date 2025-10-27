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

const rawTutorId = (import.meta.env.VITE_TUTOR_ID as string | undefined)?.trim();
const DEFAULT_TUTOR_ID = rawTutorId && rawTutorId.length > 0 ? rawTutorId : 'demo-tutor';

type TutorParamValue = string | number | boolean | undefined;

function withTutorParams(
  params: Record<string, TutorParamValue> = {},
): Record<string, string | number | boolean> {
  const merged: Record<string, TutorParamValue> = {
    tutorId: DEFAULT_TUTOR_ID,
    ...params,
  };

  return Object.fromEntries(
    Object.entries(merged).filter(([, value]) => value !== undefined && value !== null),
  ) as Record<string, string | number | boolean>;
}

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
    const response = await api.get<Family[]>(endpoints.families, {
      params: withTutorParams(),
    });
    return asArray<Family>(response.data);
  }, []);
}

export async function createFamily(payload: Omit<Family, 'id'>) {
  const response = await api.post<Family>(endpoints.families, payload);
  return response.data;
}

type TreatmentsQuery = {
  familyId?: string;
  childId?: string;
};

export async function fetchTreatments(params: TreatmentsQuery = {}) {
  return safeRequest(async () => {
    const response = await api.get<Treatment[]>(endpoints.treatments, {
      params: withTutorParams({
        familyId: params.familyId,
        childId: params.childId,
      }),
    });
    return asArray<Treatment>(response.data);
  }, []);
}

export async function createTreatment(payload: Omit<Treatment, 'id' | 'nextDose' | 'doses'>) {
  const response = await api.post<Treatment>(endpoints.treatments, payload);
  return response.data;
}

export async function fetchTodayRoutine(
  date: string,
  options: { childId?: string } = {},
) {
  return safeRequest(async () => {
    const response = await api.get<RoutineItem[]>(endpoints.doses, {
      params: withTutorParams({
        date,
        childId: options.childId,
      }),
    });
    return asArray<RoutineItem>(response.data);
  }, []);
}

export async function fetchAlerts() {
  const response = await api.get<Alert[]>(endpoints.alerts, {
    params: withTutorParams(),
  });
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
  return safeRequest(async () => {
    const response = await api.get<Attendance[]>(endpoints.attendances, {
      params: withTutorParams({
        pacienteId: params.patientId,
        tipo: params.type,
        status: params.status,
        from: params.from,
        to: params.to,
      }),
    });
    return asArray<Attendance>(response.data);
  }, []);
}

export async function fetchAttendanceById(id: string) {
  const response = await api.get<Attendance>(endpoints.attendanceById(id), {
    params: withTutorParams(),
  });
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
  const response = await api.get<Professional[]>(endpoints.professionals, {
    params: withTutorParams(),
  });
  return response.data;
}

export async function saveOnboardingDraft(_payload: OnboardingDraft) {
  return Promise.resolve(true);
}
