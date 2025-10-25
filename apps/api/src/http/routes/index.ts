import { Router } from "express";

import { attendancesRouter } from "./attendances.routes";
import { authRouter } from "./auth.routes";
import { dosesRouter } from "./doses.routes";
import { doseLogsRouter } from "./doseLogs.routes";
import { familiesRouter } from "./familias.routes";
import { healthRouter } from "./health.routes";
import { medicamentosRouter } from "./medicamentos.routes";
import { pacientesRouter } from "./pacientes.routes";
import { shareLinksRouter } from "./shareLinks.routes";
import { treatmentsRouter } from "./tratamentos.routes";
import { nutritionRouter } from "./nutrition.routes";
import { criancasRouter } from "./criancas.routes";

const router = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(criancasRouter);
router.use(pacientesRouter);
router.use(familiesRouter);
router.use(medicamentosRouter);
router.use(doseLogsRouter);
router.use(shareLinksRouter);
router.use(attendancesRouter);
router.use(treatmentsRouter);
router.use(dosesRouter);
router.use("/api/nutrition", nutritionRouter);

export { router };
