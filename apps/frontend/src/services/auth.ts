import { endpoints } from '../core/api/endpoints';
import { api } from './api';

export type AuthUser = {
  id: string;
  nome: string;
  email: string;
  responsavel: {
    nome: string;
    parentesco?: string;
    telefone?: string;
    cpf?: string;
  };
  criadoEmISO: string;
  atualizadoEmISO: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type RegisterPayload = {
  nome: string;
  cpf: string;
  senha: string;
  email?: string;
};

export type LoginPayload = {
  cpf?: string;
  email?: string;
  senha: string;
};

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(endpoints.authRegister, payload);
  return data;
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(endpoints.authLogin, payload);
  return data;
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const { data } = await api.get<{ user: AuthUser }>(endpoints.authMe);
  return data.user;
}
