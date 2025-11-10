import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import crypto from "node:crypto";

import { authenticate, type AuthenticatedRequest } from "../http/middlewares/authenticate";

const prisma = new PrismaClient();
const router = Router();

router.use("/criancas", authenticate);

router.post("/criancas", async (req, res) => {
  try {
    const {
      nome,
      nascimentoISO,
      sexo,
      responsavel,
      cartaoSUS,
      cpf,
      convenioOperadora,
      convenioNumero,
      tipoSanguineo,
    } = req.body ?? {};

    const authReq = req as AuthenticatedRequest;
    const tutor = authReq.user?.id;

    if (!tutor) {
      return res.status(401).json({ message: "Nao autenticado" });
    }
    const trimmedNome = typeof nome === "string" ? nome.trim() : "";
    const nascimento = typeof nascimentoISO === "string" ? nascimentoISO.trim() : "";

    if (!trimmedNome.length || !tutor || !nascimento.length) {
      return res
        .status(400)
        .json({ message: "nome, tutor_id e nascimentoISO são obrigatórios" });
    }

    const id = crypto.randomUUID();
    const agora = new Date().toISOString();
    const sexoNormalizado = sexo === "M" || sexo === "F" || sexo === "O" ? sexo : "O";
    const responsavelNormalizado =
      responsavel && typeof responsavel === "object"
        ? {
            nome:
              typeof responsavel.nome === "string" && responsavel.nome.trim().length
                ? responsavel.nome.trim()
                : undefined,
            parentesco:
              typeof responsavel.parentesco === "string" && responsavel.parentesco.trim().length
                ? responsavel.parentesco.trim()
                : undefined,
            telefone:
              typeof responsavel.telefone === "string" && responsavel.telefone.trim().length
                ? responsavel.telefone.trim()
                : undefined,
          }
        : undefined;

    const registro = {
      id,
      nome: trimmedNome,
      nascimentoISO: nascimento,
      sexo: sexoNormalizado,
      responsavel: responsavelNormalizado,
      cartaoSUS:
        typeof cartaoSUS === "string" && cartaoSUS.trim().length ? cartaoSUS.trim() : undefined,
      cpf: typeof cpf === "string" && cpf.trim().length ? cpf.trim() : undefined,
      convenioOperadora:
        typeof convenioOperadora === "string" && convenioOperadora.trim().length
          ? convenioOperadora.trim()
          : undefined,
      convenioNumero:
        typeof convenioNumero === "string" && convenioNumero.trim().length
          ? convenioNumero.trim()
          : undefined,
      tipoSanguineo:
        typeof tipoSanguineo === "string" && tipoSanguineo.trim().length
          ? tipoSanguineo.trim()
          : undefined,
      criadoEmISO: agora,
      atualizadoEmISO: agora,
    };

    await prisma.criancas.create({
      data: {
        id,
        nome: trimmedNome,
        tutor_id: String(tutor),
        nascimento_iso: nascimento,
        payload: registro,
      },
    });

    return res.status(201).json({
      ...registro,
      tutorId: String(tutor),
    });
  } catch (error) {
    console.error("Erro ao criar crianca", error);
    const e = error as { message?: string; code?: string; meta?: unknown };
    return res.status(500).json({
      message: e?.message ?? "Erro ao criar crianca",
      code: e?.code,
      meta: e?.meta,
    });
  }
});

export default router;
