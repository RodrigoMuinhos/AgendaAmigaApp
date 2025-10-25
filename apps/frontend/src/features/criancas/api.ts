import axios from 'axios';

import { endpoints } from '../../core/api/endpoints';
import { api } from '../../services/api';
import type { Crianca, CriancaCreateInput } from './types';

const DEFAULT_TUTOR_ID = 'demo-tutor';

function tutorParams(tutorId = DEFAULT_TUTOR_ID) {
  return { tutorId };
}

export async function listarCriancas(): Promise<Crianca[]> {
  const response = await api.get<Crianca[]>(endpoints.children, {
    params: tutorParams(),
  });
  return response.data;
}

export async function buscarCriancaPorId(id: string): Promise<Crianca | undefined> {
  try {
    const response = await api.get<Crianca>(`${endpoints.children}/${id}`, {
      params: tutorParams(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return undefined;
    }
    throw error;
  }
}

export async function criarCrianca(payload: CriancaCreateInput): Promise<Crianca> {
  const response = await api.post<Crianca>(endpoints.children, {
    ...payload,
    tutorId: DEFAULT_TUTOR_ID,
  });
  return response.data;
}

export async function atualizarCrianca(id: string, payload: CriancaCreateInput): Promise<Crianca> {
  const response = await api.put<Crianca>(`${endpoints.children}/${id}`, {
    ...payload,
    tutorId: DEFAULT_TUTOR_ID,
  });
  return response.data;
}

export async function removerCrianca(id: string): Promise<void> {
  await api.delete(`${endpoints.children}/${id}`, {
    params: tutorParams(),
  });
}
