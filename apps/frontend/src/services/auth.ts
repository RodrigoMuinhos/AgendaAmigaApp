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
  email: string;
};

export type LoginPayload = {
  cpf?: string;
  email?: string;
  senha: string;
};

export type RecoverPasswordPayload = {
  cpf?: string;
  email?: string;
};

export type RecoverPasswordResponse = {
  message: string;
  expiresInMinutes?: number;
  recoveryToken?: string;
};

export type ConfirmPasswordResetPayload = {
  token: string;
  senha: string;
};

export type TemporaryPasswordResponse = {
  message: string;
  temporaryPassword?: string;
};

export type TemporaryPasswordRequest = {
  email: string;
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

export async function requestPasswordReset(
  payload: RecoverPasswordPayload,
): Promise<RecoverPasswordResponse> {
  const { data } = await api.post<RecoverPasswordResponse>(endpoints.authRecover, payload);
  return data;
}

export async function confirmPasswordReset(payload: ConfirmPasswordResetPayload): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(endpoints.authRecoverConfirm, payload);
  return data;
}

export async function requestTemporaryPassword(payload: TemporaryPasswordRequest): Promise<TemporaryPasswordResponse> {
  const { data } = await api.post<TemporaryPasswordResponse>(endpoints.temporaryPassword, payload);
  return data;
}
