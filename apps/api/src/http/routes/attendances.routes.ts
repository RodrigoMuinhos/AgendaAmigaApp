import { Router } from "express";

type AttendanceStatus = "AGENDADO" | "REALIZADO" | "FALTOU" | "CANCELADO";
type AttendanceType = "CONSULTA" | "EXAME" | "TERAPIA";

type Attendance = {
  id: string;
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
  reminders?: Array<{
    id: string;
    attendanceId: string;
    minutesBefore: number;
    channel: "PUSH" | "EMAIL" | "WHATSAPP";
  }>;
  createdAt: string;
  updatedAt: string;
};

const attendances: Attendance[] = [];

export const attendancesRouter = Router();

attendancesRouter.get("/atendimentos", (_req, res) => {
  res.json(attendances);
});
