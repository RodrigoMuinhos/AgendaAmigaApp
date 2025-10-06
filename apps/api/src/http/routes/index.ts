import { Router } from "express";

import { doseLogsRouter } from "./doseLogs.routes";
import { healthRouter } from "./health.routes";
import { medicamentosRouter } from "./medicamentos.routes";
import { pacientesRouter } from "./pacientes.routes";
import { shareLinksRouter } from "./shareLinks.routes";

const router = Router();

router.use(healthRouter);
router.use(pacientesRouter);
router.use(medicamentosRouter);
router.use(doseLogsRouter);
router.use(shareLinksRouter);

export { router };
