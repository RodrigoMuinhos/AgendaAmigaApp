import { Router } from "express";
import { Periodo } from "@agenda-amiga/shared";

import { container } from "../../container";
import { NotFoundError } from "../errors/NotFoundError";
import { asyncHandler } from "../utils/asyncHandler";

const medicamentosRouter = Router();

medicamentosRouter.get(
  "/pacientes/:pacienteId/medicamentos",
  asyncHandler(async (req, res) => {
    const medicamentos = await container.repositories.medicamento.listarPorPaciente(req.params.pacienteId);
    res.json({ medicamentos: medicamentos.map((medicamento) => medicamento.snapshot) });
  })
);

medicamentosRouter.get(
  "/medicamentos/:medicamentoId",
  asyncHandler(async (req, res) => {
    const medicamento = await container.repositories.medicamento.obterPorId(req.params.medicamentoId);

    if (!medicamento) {
      throw new NotFoundError("Medicamento não encontrado");
    }

    res.json({ medicamento: medicamento.snapshot });
  })
);

medicamentosRouter.get(
  "/medicamentos/:medicamentoId/dose-logs",
  asyncHandler(async (req, res) => {
    const medicamento = await container.repositories.medicamento.obterPorId(req.params.medicamentoId);

    if (!medicamento) {
      throw new NotFoundError("Medicamento não encontrado");
    }

    const inicio = req.query.inicio ? new Date(String(req.query.inicio)) : undefined;
    const fim = req.query.fim ? new Date(String(req.query.fim)) : undefined;
    const periodo = Periodo.create({ inicio, fim });

    const doseLogs = await container.repositories.doseLog.listarPorMedicamentoEPeriodo(
      medicamento.snapshot.id,
      periodo
    );

    res.json({
      medicamento: medicamento.snapshot,
      doseLogs: doseLogs.map((log) => log.snapshot),
    });
  })
);

medicamentosRouter.post(
  "/medicamentos/:medicamentoId/esquema",
  asyncHandler(async (req, res) => {
    const output = await container.usecases.alterarEsquemaDose.execute({
      medicamentoId: req.params.medicamentoId,
      esquema: req.body,
    });

    res.json(output);
  })
);

export { medicamentosRouter };
