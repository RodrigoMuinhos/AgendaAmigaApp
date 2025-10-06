import { Router } from "express";

import { container } from "../../container";
import { asyncHandler } from "../utils/asyncHandler";

const pacientesRouter = Router();

pacientesRouter.get(
  "/tutores/:tutorId/pacientes",
  asyncHandler(async (req, res) => {
    const { tutorId } = req.params;
    const output = await container.usecases.listarPacientesPorTutor.execute({ tutorId });
    res.json(output);
  })
);

export { pacientesRouter };
