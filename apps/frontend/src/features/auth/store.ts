import { create } from 'zustand';
import { loginUser, registerUser, fetchCurrentUser, type AuthUser, type LoginPayload, type RegisterPayload } from '../../services/auth';
import { setAuthToken } from '../../services/api';
import { useCriancasStore } from '../criancas/store';
import { env } from '../../core/config/env';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  user?: AuthUser;
  token?: string;
  error?: string;
  authenticating: boolean;
  initialize: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  authenticateWithToken: (token: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
};

const AUTH_STORAGE_KEY = 'agenda-amiga:auth';
const ADMIN_TEST_CPF = '04411750317';
const ADMIN_PASSWORD_CANONICAL = 'rodrigo123';
const OFFLINE_TOKEN = 'demo-offline-token';
const ADMIN_TEST_TOKEN = 'admin-test-token';

const OFFLINE_USER: AuthUser = {
  id: 'demo-user',
  nome: 'Agenda Amiga Demo',
  email: 'demo@agendaamiga.gov.br',
  responsavel: {
    nome: 'Responsavel Demo',
    cpf: '00000000000',
  },
  criadoEmISO: '2024-01-01T00:00:00.000Z',
  atualizadoEmISO: '2024-01-01T00:00:00.000Z',
};

const ADMIN_TEST_USER: AuthUser = {
  ...OFFLINE_USER,
  id: 'admin-demo',
  nome: 'Administrador da Agenda Amiga',
  email: 'admin@agendaamiga.gov.br',
  responsavel: {
    nome: 'Administrador Agenda Amiga',
    cpf: ADMIN_TEST_CPF,
  },
};

function normalizeCpf(value?: string) {
  return (value ?? '').replace(/\D/g, '');
}

function normalizePassword(value?: string) {
  return (value ?? '').replace(/\s+/g, '').toLowerCase();
}

function matchesAdminCredential(payload: LoginPayload) {
  return (
    normalizeCpf(payload.cpf) === ADMIN_TEST_CPF &&
    normalizePassword(payload.senha) === ADMIN_PASSWORD_CANONICAL
  );
}

function isLocalToken(token: string) {
  return token === ADMIN_TEST_TOKEN || token === OFFLINE_TOKEN;
}

function persistSession(token: string, user: AuthUser) {
  if (typeof window === 'undefined') return;
  const payload = { token, user };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
}

function readSession():
  | {
      token: string;
      user: AuthUser;
    }
  | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { token?: string; user?: AuthUser };
    if (parsed && parsed.token && parsed.user) {
      return { token: parsed.token, user: parsed.user };
    }
  } catch {
    // ignore parse errors
  }
  return undefined;
}

function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export const useAuthStore = create<AuthState>((set, get) => {
  const syncTutor = (userId: string | undefined) => {
    const criancasStore = useCriancasStore.getState();
    criancasStore.setTutor(userId);
  };

  const resetCriancasData = () => {
    const criancasStore = useCriancasStore.getState();
    criancasStore.setTutor(undefined);
    criancasStore.reset();
  };

  const applyLocalSession = (user: AuthUser, token: string) => {
    persistSession(token, user);
    setAuthToken(token);
    syncTutor(user.id);
    set({
      status: 'authenticated',
      user,
      token,
      authenticating: false,
      error: undefined,
    });
  };

  const bootstrapOfflineUser = () => {
    applyLocalSession(OFFLINE_USER, OFFLINE_TOKEN);
  };

  const handleAdminLogin = () => {
    applyLocalSession(ADMIN_TEST_USER, ADMIN_TEST_TOKEN);
  };

  return {
    status: 'idle',
    authenticating: false,
    async initialize() {
      if (get().status !== 'idle') {
        if (env.authDisabled && get().status !== 'authenticated') {
          bootstrapOfflineUser();
        }
        return;
      }
      set({ status: 'loading', error: undefined });

      if (env.authDisabled) {
        bootstrapOfflineUser();
        return;
      }

      const existing = readSession();

      if (!existing) {
        resetCriancasData();
        setAuthToken(null);
        set({ status: 'unauthenticated', user: undefined, token: undefined });
        return;
      }

      if (isLocalToken(existing.token)) {
        applyLocalSession(existing.user, existing.token);
        return;
      }

      setAuthToken(existing.token);

      try {
        const user = await fetchCurrentUser();
        persistSession(existing.token, user);
        syncTutor(user.id);
        set({
          status: 'authenticated',
          user,
          token: existing.token,
          authenticating: false,
          error: undefined,
        });
      } catch (error) {
        console.error('[auth] bootstrap failed', error);
        clearSession();
        setAuthToken(null);
        resetCriancasData();
        set({
          status: 'unauthenticated',
          user: undefined,
          token: undefined,
          authenticating: false,
          error: undefined,
        });
      }
    },
    async login(payload) {
      set({ authenticating: true, error: undefined });
      if (matchesAdminCredential(payload)) {
        handleAdminLogin();
        return true;
      }

      if (env.authDisabled) {
        bootstrapOfflineUser();
        return true;
      }
      try {
        const response = await loginUser(payload);
        setAuthToken(response.token);
        persistSession(response.token, response.user);
        syncTutor(response.user.id);
        set({
          status: 'authenticated',
          user: response.user,
          token: response.token,
          authenticating: false,
          error: undefined,
        });
        return true;
      } catch (error) {
        console.error('[auth] login failed', error);
        set({
          authenticating: false,
          error: 'Nao foi possivel entrar. Verifique suas credenciais.',
          status: 'unauthenticated',
        });
        setAuthToken(null);
        return false;
      }
    },
    async register(payload) {
      set({ authenticating: true, error: undefined });
      if (env.authDisabled) {
        bootstrapOfflineUser();
        return true;
      }
      try {
        const response = await registerUser(payload);
        setAuthToken(response.token);
        persistSession(response.token, response.user);
        syncTutor(response.user.id);
        set({
          status: 'authenticated',
          user: response.user,
          token: response.token,
          authenticating: false,
          error: undefined,
        });
        return true;
      } catch (error) {
        console.error('[auth] register failed', error);
        set({
          authenticating: false,
          error: 'Nao foi possivel concluir o cadastro. Tente novamente.',
          status: 'unauthenticated',
        });
        setAuthToken(null);
        return false;
      }
    },
    async authenticateWithToken(token) {
      set({ authenticating: true, error: undefined });
      if (env.authDisabled || token === OFFLINE_TOKEN) {
        bootstrapOfflineUser();
        return true;
      }
      if (token === ADMIN_TEST_TOKEN) {
        handleAdminLogin();
        return true;
      }
      try {
        setAuthToken(token);
        const user = await fetchCurrentUser();
        persistSession(token, user);
        syncTutor(user.id);
        set({
          status: 'authenticated',
          user,
          token,
          authenticating: false,
          error: undefined,
        });
        return true;
      } catch (error) {
        console.error('[auth] social login failed', error);
        clearSession();
        setAuthToken(null);
        resetCriancasData();
        set({
          status: 'unauthenticated',
          user: undefined,
          token: undefined,
          authenticating: false,
          error: 'Nao foi possivel validar o login social. Tente novamente.',
        });
        return false;
      }
    },
    logout() {
      if (env.authDisabled) {
        bootstrapOfflineUser();
        return;
      }
      clearSession();
      setAuthToken(null);
      resetCriancasData();
      set({
        status: 'unauthenticated',
        user: undefined,
        token: undefined,
        authenticating: false,
        error: undefined,
      });
    },
    clearError() {
      if (get().error) {
        set({ error: undefined });
      }
    },
  };
});

export function useAuthInitialized() {
  const status = useAuthStore((state) => state.status);
  const initialize = useAuthStore((state) => state.initialize);

  if (status === 'idle') {
    void initialize();
  }

  return status !== 'idle';
}
