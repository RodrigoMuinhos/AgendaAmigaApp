import { Router } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { query, withTransaction } from "../../infra/database";
import { BadRequestError } from "../errors/BadRequestError";
import { asyncHandler } from "../utils/asyncHandler";

type FamilyRow = {
  id: string;
  nome: string;
  cep: string | null;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cuidador_principal: string | null;
  relacao_cuidador_principal: string | null;
  contato: string | null;
  telefone_cuidador: string | null;
  foco_cuidado: string | null;
  observacoes: string | null;
};

type MemberRow = {
  id: string;
  familia_id: string;
  nome: string;
  data_nascimento: Date;
  documento: string | null;
  cep: string | null;
  numero_endereco: string | null;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  avatar: string | null;
  historico_medico: string | null;
  limitacoes: string | null;
  alergias: string | null;
  peso: string | null;
  altura: string | null;
  imc: string | null;
  necessidades: string | null;
};

type CaregiverRow = {
  id: string;
  familia_id: string;
  nome: string;
  relacao: string | null;
  telefone: string | null;
};

type FamilyResponse = {
  id: string;
  name: string;
  postalCode?: string | null;
  address?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  primaryCaregiver?: string | null;
  primaryCaregiverRelationship?: string | null;
  contact?: string | null;
  caregiverPhone?: string | null;
  careFocus?: string | null;
  notes?: string | null;
  members: Array<{
    id: string;
    name: string;
    birthdate: string;
    document?: string | null;
    postalCode?: string | null;
    addressNumber?: string | null;
    address?: string | null;
    neighborhood?: string | null;
    city?: string | null;
    state?: string | null;
    avatar?: string | null;
    medicalHistory?: string | null;
    limitations?: string | null;
    allergies?: string | null;
    weight?: string | null;
    height?: string | null;
    imc?: string | null;
    needs?: string | null;
  }>;
  caregivers: Array<{
    id: string;
    name: string;
    relation?: string | null;
    phone?: string | null;
  }>;
};

const familiesRouter = Router();

const digits = /\D+/g;

const familyMemberSchema = z.object({
  id: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).max(120),
  birthdate: z
    .string()
    .trim()
    .regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/u, "Data deve estar no formato YYYY-MM-DD"),
  document: z.string().trim().max(40).optional(),
  postalCode: z.string().trim().max(20).optional(),
  addressNumber: z.string().trim().max(20).optional(),
  address: z.string().trim().max(180).optional(),
  neighborhood: z.string().trim().max(120).optional(),
  city: z.string().trim().max(120).optional(),
  state: z.string().trim().max(10).optional(),
  avatar: z.string().trim().max(300).optional(),
  medicalHistory: z.string().trim().max(500).optional(),
  limitations: z.string().trim().max(500).optional(),
  allergies: z.string().trim().max(500).optional(),
  weight: z.string().trim().max(40).optional(),
  height: z.string().trim().max(40).optional(),
  imc: z.string().trim().max(40).optional(),
  needs: z.string().trim().max(500).optional(),
});

const caregiverSchema = z.object({
  id: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).max(120),
  relation: z.string().trim().max(80).optional(),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((value) => (value ? value.replace(digits, "") : value)),
});

const familyBodySchema = z.object({
  name: z.string().trim().min(1).max(160),
  postalCode: z
    .string()
    .trim()
    .max(20)
    .optional()
    .transform((value) => (value ? value.replace(digits, "") : value)),
  address: z.string().trim().max(200).optional(),
  neighborhood: z.string().trim().max(160).optional(),
  city: z.string().trim().max(160).optional(),
  state: z.string().trim().max(10).optional(),
  primaryCaregiver: z.string().trim().max(160).optional(),
  primaryCaregiverRelationship: z.string().trim().max(120).optional(),
  contact: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((value) => (value ? value.replace(digits, "") : value)),
  caregiverPhone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((value) => (value ? value.replace(digits, "") : value)),
  careFocus: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(500).optional(),
  members: z.array(familyMemberSchema).min(1),
  caregivers: z.array(caregiverSchema).optional().default([]),
});

function sanitize(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function mapFamily(rows: FamilyRow[], members: MemberRow[], caregivers: CaregiverRow[]): FamilyResponse[] {
  const membersByFamily = new Map<string, MemberRow[]>();
  for (const member of members) {
    const collection = membersByFamily.get(member.familia_id);
    if (collection) {
      collection.push(member);
    } else {
      membersByFamily.set(member.familia_id, [member]);
    }
  }

  const caregiversByFamily = new Map<string, CaregiverRow[]>();
  for (const caregiver of caregivers) {
    const collection = caregiversByFamily.get(caregiver.familia_id);
    if (collection) {
      collection.push(caregiver);
    } else {
      caregiversByFamily.set(caregiver.familia_id, [caregiver]);
    }
  }

  return rows.map((family) => ({
    id: family.id,
    name: family.nome,
    postalCode: family.cep,
    address: family.endereco,
    neighborhood: family.bairro,
    city: family.cidade,
    state: family.estado,
    primaryCaregiver: family.cuidador_principal,
    primaryCaregiverRelationship: family.relacao_cuidador_principal,
    contact: family.contato,
    caregiverPhone: family.telefone_cuidador,
    careFocus: family.foco_cuidado,
    notes: family.observacoes,
    members: (membersByFamily.get(family.id) ?? [])
      .sort((a, b) => a.nome.localeCompare(b.nome))
      .map((member) => ({
        id: member.id,
        name: member.nome,
        birthdate: member.data_nascimento.toISOString().slice(0, 10),
        document: member.documento,
        postalCode: member.cep,
        addressNumber: member.numero_endereco,
        address: member.endereco,
        neighborhood: member.bairro,
        city: member.cidade,
        state: member.estado,
        avatar: member.avatar,
        medicalHistory: member.historico_medico,
        limitations: member.limitacoes,
        allergies: member.alergias,
        weight: member.peso,
        height: member.altura,
        imc: member.imc,
        needs: member.necessidades,
      })),
    caregivers: (caregiversByFamily.get(family.id) ?? [])
      .sort((a, b) => a.nome.localeCompare(b.nome))
      .map((caregiver) => ({
        id: caregiver.id,
        name: caregiver.nome,
        relation: caregiver.relacao,
        phone: caregiver.telefone,
      })),
  }));
}

async function loadFamilies(ids?: string[]): Promise<FamilyResponse[]> {
  const familiesResult = ids && ids.length
    ? await query<FamilyRow>(
        `
          SELECT
            id,
            nome,
            cep,
            endereco,
            bairro,
            cidade,
            estado,
            cuidador_principal,
            relacao_cuidador_principal,
            contato,
            telefone_cuidador,
            foco_cuidado,
            observacoes
          FROM familias
          WHERE id = ANY($1::text[])
          ORDER BY nome
        `,
        [ids]
      )
    : await query<FamilyRow>(
        `
          SELECT
            id,
            nome,
            cep,
            endereco,
            bairro,
            cidade,
            estado,
            cuidador_principal,
            relacao_cuidador_principal,
            contato,
            telefone_cuidador,
            foco_cuidado,
            observacoes
          FROM familias
          ORDER BY nome
        `
      );

  if (!familiesResult.rowCount) {
    return [];
  }

  const familyIds = familiesResult.rows.map((row) => row.id);

  const membersResult = await query<MemberRow>(
    `
      SELECT
        id,
        familia_id,
        nome,
        data_nascimento,
        documento,
        cep,
        numero_endereco,
        endereco,
        bairro,
        cidade,
        estado,
        avatar,
        historico_medico,
        limitacoes,
        alergias,
        peso,
        altura,
        imc,
        necessidades
      FROM familia_membros
      WHERE familia_id = ANY($1::text[])
    `,
    [familyIds]
  );

  const caregiversResult = await query<CaregiverRow>(
    `
      SELECT
        id,
        familia_id,
        nome,
        relacao,
        telefone
      FROM cuidadores
      WHERE familia_id = ANY($1::text[])
    `,
    [familyIds]
  );

  return mapFamily(familiesResult.rows, membersResult.rows, caregiversResult.rows);
}

familiesRouter.get(
  "/familias",
  asyncHandler(async (_req, res) => {
    const families = await loadFamilies();
    res.json(families);
  })
);

familiesRouter.post(
  "/familias",
  asyncHandler(async (req, res) => {
    const body = familyBodySchema.parse(req.body);

    const familyId = randomUUID();
    const members = body.members.map((member) => ({
      ...member,
      id: member.id ?? randomUUID(),
    }));

    const caregivers = (body.caregivers ?? []).map((caregiver) => ({
      ...caregiver,
      id: caregiver.id ?? randomUUID(),
    }));

    await withTransaction(async (client) => {
      await client.query(
        `
          INSERT INTO familias (
            id,
            nome,
            cep,
            endereco,
            bairro,
            cidade,
            estado,
            cuidador_principal,
            relacao_cuidador_principal,
            contato,
            telefone_cuidador,
            foco_cuidado,
            observacoes,
            atualizado_em
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
        `,
        [
          familyId,
          body.name.trim(),
          sanitize(body.postalCode),
          sanitize(body.address),
          sanitize(body.neighborhood),
          sanitize(body.city),
          sanitize(body.state),
          sanitize(body.primaryCaregiver),
          sanitize(body.primaryCaregiverRelationship),
          sanitize(body.contact),
          sanitize(body.caregiverPhone),
          sanitize(body.careFocus),
          sanitize(body.notes),
        ]
      );

      for (const member of members) {
        await client.query(
          `
            INSERT INTO familia_membros (
              id,
              familia_id,
              nome,
              data_nascimento,
              documento,
              cep,
              numero_endereco,
              endereco,
              bairro,
              cidade,
              estado,
              avatar,
              historico_medico,
              limitacoes,
              alergias,
              peso,
              altura,
              imc,
              necessidades,
              atualizado_em
            )
            VALUES (
              $1,
              $2,
              $3,
              $4,
              $5,
              $6,
              $7,
              $8,
              $9,
              $10,
              $11,
              $12,
              $13,
              $14,
              $15,
              $16,
              $17,
              $18,
              $19,
              NOW()
            )
          `,
          [
            member.id,
            familyId,
            member.name.trim(),
            member.birthdate,
            sanitize(member.document),
            sanitize(member.postalCode),
            sanitize(member.addressNumber),
            sanitize(member.address),
            sanitize(member.neighborhood),
            sanitize(member.city),
            sanitize(member.state),
            sanitize(member.avatar),
            sanitize(member.medicalHistory),
            sanitize(member.limitations),
            sanitize(member.allergies),
            sanitize(member.weight),
            sanitize(member.height),
            sanitize(member.imc),
            sanitize(member.needs),
          ]
        );
      }

      for (const caregiver of caregivers) {
        await client.query(
          `
            INSERT INTO cuidadores (
              id,
              familia_id,
              nome,
              relacao,
              telefone,
              atualizado_em
            )
            VALUES ($1, $2, $3, $4, $5, NOW())
          `,
          [
            caregiver.id,
            familyId,
            caregiver.name.trim(),
            sanitize(caregiver.relation),
            sanitize(caregiver.phone),
          ]
        );
      }
    });

    const [family] = await loadFamilies([familyId]);
    if (!family) {
      throw new BadRequestError("Nao foi possivel criar a familia");
    }

    res.status(201).json(family);
  })
);

export { familiesRouter };
