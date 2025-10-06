import { Router } from "express";

import { container } from "../../container";
import { asyncHandler } from "../utils/asyncHandler";

const doseLogsRouter = Router();

doseLogsRouter.post(
  "/dose-logs/:doseLogId/confirmar",
  asyncHandler(async (req, res) => {
    const instante = req.body?.instante ? new Date(String(req.body.instante)) : undefined;
    const output = await container.usecases.confirmarTomadaDose.execute({
      doseLogId: req.params.doseLogId,
      instante,
    });

    res.json(output);
  })
);

export { doseLogsRouter };
