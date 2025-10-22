import { Router } from "express";
import { Paciente } from "@agenda-amiga/shared";

import { container } from "../../container";
import { asyncHandler } from "../utils/asyncHandler";

const pacientesRouter = Router();

pacientesRouter.get(
  "/tutores/:tutorId/pacientes",
  asyncHandler(async (req, res) => {
    const { tutorId } = req.params;
    const pacientes = (await container.usecases.listarPacientesPorTutor.execute(tutorId)) as Paciente[];
    res.json({ pacientes: pacientes.map((paciente) => paciente.snapshot) });
  })
);

export { pacientesRouter };
