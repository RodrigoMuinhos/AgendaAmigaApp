import axios from 'axios';

import { endpoints } from '../../core/api/endpoints';
import { api } from '../../services/api';
import { asArray } from '../../core/utils/arrays';
import type { CriancaCreateInput } from './types';

const DEFAULT_TUTOR_ID = 'demo-tutor';

function tutorParams(tutorId = DEFAULT_TUTOR_ID) {
  return { tutorId };
}

type RawCrianca = Record<string, unknown>;

const snakeToCamelMap: Record<string, string> = {
  tutor_id: 'tutorId',
  nascimento_iso: 'nascimentoISO',
  cartao_sus: 'cartaoSUS',
  convenio_operadora: 'convenioOperadora',
  convenio_numero: 'convenioNumero',
  tipo_sanguineo: 'tipoSanguineo',
  criado_em: 'criadoEmISO',
  atualizado_em: 'atualizadoEmISO',
};

function normalizeKeys(source: Record<string, unknown> | undefined | null): Record<string, unknown> {
  if (!source || typeof source !== 'object') {
    return {};
  }
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(source)) {
    if (value === undefined) continue;
    if (key === 'payload') continue;
    const camelKey = snakeToCamelMap[key] ?? key;
    result[camelKey] = value;
  }
  return result;
}

function adaptCriancaResponse(raw: unknown): RawCrianca {
  const dto = normalizeKeys(raw as Record<string, unknown>);
  const payload = normalizeKeys((raw as Record<string, unknown>)?.payload as Record<string, unknown>);
  const merged: RawCrianca = { ...payload, ...dto };

  if (merged.id !== undefined) {
    merged.id = String(merged.id);
  }

  if (typeof merged.nascimentoISO === 'string') {
    merged.nascimentoISO = merged.nascimentoISO;
  } else if (merged.nascimentoISO != null) {
    merged.nascimentoISO = String(merged.nascimentoISO);
  }

  return merged;
}

export async function listarCriancas(): Promise<RawCrianca[]> {
  const response = await api.get<unknown[]>(endpoints.children, {
    params: tutorParams(),
  });
  return asArray(response.data).map((item) => adaptCriancaResponse(item));
}

export async function buscarCriancaPorId(id: string): Promise<RawCrianca | undefined> {
  try {
    const response = await api.get<unknown>(`${endpoints.children}/${id}`, {
      params: tutorParams(),
    });
    return adaptCriancaResponse(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return undefined;
    }
    throw error;
  }
}

export async function criarCrianca(payload: CriancaCreateInput): Promise<RawCrianca> {
  const tutor = payload.tutorId ?? DEFAULT_TUTOR_ID;
  const requestBody = {
    ...payload,
    tutor_id: tutor,
  } as Record<string, unknown>;
  delete requestBody.tutorId;

  const response = await api.post<unknown>(endpoints.children, requestBody);
  return adaptCriancaResponse(response.data);
}

export async function atualizarCrianca(id: string, payload: CriancaCreateInput): Promise<RawCrianca> {
  const tutor = payload.tutorId ?? DEFAULT_TUTOR_ID;
  const requestBody = {
    ...payload,
    tutor_id: tutor,
  } as Record<string, unknown>;
  delete requestBody.tutorId;

  const response = await api.put<unknown>(`${endpoints.children}/${id}`, requestBody);
  return adaptCriancaResponse(response.data);
}

export async function removerCrianca(id: string): Promise<void> {
  await api.delete(`${endpoints.children}/${id}`, {
    params: tutorParams(),
  });
}

export type { RawCrianca };
