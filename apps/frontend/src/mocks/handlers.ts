import { http, HttpResponse } from "msw";
import type { Alert, Attendance, AttendanceInput, Family, Professional, RoutineItem, Treatment } from "../core/types/api";

const families: Family[] = [];
const treatments: Treatment[] = [];
const alerts: Alert[] = [];
const professionals: Professional[] = [];
const attendances: Attendance[] = [];
const routineByDate = new Map<string, RoutineItem[]>();

const generateId = (prefix: string) => {
  const unique = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36);
  return prefix + "-" + unique;
};

export const handlers = [
  http.get("*/familias", () => HttpResponse.json(families)),
  http.post("*/familias", async ({ request }) => {
    const body = (await request.json()) as Omit<Family, "id">;
    const newFamily: Family = {
      id: generateId("fam"),
      ...body,
    };
    families.push(newFamily);
    return HttpResponse.json(newFamily, { status: 201 });
  }),

  http.get("*/tratamentos", () => HttpResponse.json(treatments)),
  http.post("*/tratamentos", async ({ request }) => {
    const body = (await request.json()) as Omit<Treatment, "id">;
    const newTreatment: Treatment = {
      id: generateId("treat"),
      ...body,
    };
    treatments.push(newTreatment);
    return HttpResponse.json(newTreatment, { status: 201 });
  }),

  http.get("*/doses", ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
    const routine = routineByDate.get(date) ?? [];
    return HttpResponse.json(routine);
  }),

  http.get("*/alertas", () => HttpResponse.json(alerts)),

  http.get("*/profissionais", () => HttpResponse.json(professionals)),
  http.post("*/profissionais", async ({ request }) => {
    const body = (await request.json()) as Omit<Professional, "id" | "createdAt" | "updatedAt">;
    const newProfessional: Professional = {
      id: generateId("prof"),
      name: body.name,
      specialty: body.specialty,
      phone: body.phone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    professionals.push(newProfessional);
    return HttpResponse.json(newProfessional, { status: 201 });
  }),

  http.get("*/atendimentos", ({ request }) => {
    const url = new URL(request.url);
    const params = url.searchParams;
    const filtered = attendances.filter((attendance) => {
      if (params.has("pacienteId") && attendance.patientId !== params.get("pacienteId")) {
        return false;
      }
      if (params.has("tipo") && attendance.type !== params.get("tipo")) {
        return false;
      }
      if (params.has("status") && attendance.status !== params.get("status")) {
        return false;
      }
      const from = params.get("from");
      if (from && attendance.datetime < from) {
        return false;
      }
      const to = params.get("to");
      if (to && attendance.datetime > to) {
        return false;
      }
      return true;
    });
    return HttpResponse.json(filtered);
  }),

  http.post("*/atendimentos", async ({ request }) => {
    const body = (await request.json()) as AttendanceInput;
    const attendanceId = generateId("attendance");
    const newAttendance: Attendance = {
      ...body,
      id: attendanceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reminders: (body.reminders ?? []).map((reminder, index) => ({
        id: generateId("reminder" + index),
        attendanceId,
        minutesBefore: reminder.minutesBefore,
        channel: reminder.channel,
      })),
    };
    attendances.push(newAttendance);
    return HttpResponse.json(newAttendance, { status: 201 });
  }),

  http.get("*/atendimentos/:id", ({ params }) => {
    const attendance = attendances.find((item) => item.id === params.id);
    if (!attendance) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(attendance);
  }),

  http.put("*/atendimentos/:id", async ({ params, request }) => {
    const index = attendances.findIndex((item) => item.id === params.id);
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    const body = (await request.json()) as Partial<AttendanceInput>;
    const existing = attendances[index];
    const updated: Attendance = {
      ...existing,
      ...body,
      datetime: body.datetime ?? existing.datetime,
      reminders: body.reminders
        ? body.reminders.map((reminder, index) => ({
            id: generateId("reminder" + index),
            attendanceId: existing.id,
            minutesBefore: reminder.minutesBefore,
            channel: reminder.channel,
          }))
        : existing.reminders,
      updatedAt: new Date().toISOString(),
    };
    attendances[index] = updated;
    return HttpResponse.json(updated);
  }),

  http.delete("*/atendimentos/:id", ({ params }) => {
    const index = attendances.findIndex((item) => item.id === params.id);
    if (index >= 0) {
      attendances.splice(index, 1);
    }
    return new HttpResponse(null, { status: 204 });
  }),
];
