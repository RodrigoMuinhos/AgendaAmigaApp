import { create } from 'zustand';
import { loginUser, registerUser, fetchCurrentUser, type AuthUser, type LoginPayload, type RegisterPayload } from '../../services/auth';
import { setAuthToken } from '../../services/api';
import { useCriancasStore } from '../criancas/store';

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

export const useAuthStore = create<AuthState>((set, get) => ({
    status: 'idle',
    authenticating: false,
    async initialize() {
      if (get().status !== 'idle') return;
      set({ status: 'loading', error: undefined });
      const existing = readSession();

      const criancasStore = useCriancasStore.getState();

      if (!existing) {
        criancasStore.setTutor(undefined);
        criancasStore.reset();
        setAuthToken(null);
        set({ status: 'unauthenticated', user: undefined, token: undefined });
        return;
      }

      setAuthToken(existing.token);

      try {
        const user = await fetchCurrentUser();
        persistSession(existing.token, user);
        criancasStore.setTutor(user.id);
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
        criancasStore.setTutor(undefined);
        criancasStore.reset();
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
      try {
        const response = await loginUser(payload);
        setAuthToken(response.token);
        persistSession(response.token, response.user);
        useCriancasStore.getState().setTutor(response.user.id);
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
      try {
        const response = await registerUser(payload);
        setAuthToken(response.token);
        persistSession(response.token, response.user);
        useCriancasStore.getState().setTutor(response.user.id);
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
      try {
        setAuthToken(token);
        const user = await fetchCurrentUser();
        persistSession(token, user);
        useCriancasStore.getState().setTutor(user.id);
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
        const criancasStore = useCriancasStore.getState();
        criancasStore.setTutor(undefined);
        criancasStore.reset();
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
      clearSession();
      setAuthToken(null);
      const criancasStore = useCriancasStore.getState();
      criancasStore.setTutor(undefined);
      criancasStore.reset();
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
  }));

export function useAuthInitialized() {
  const status = useAuthStore((state) => state.status);
  const initialize = useAuthStore((state) => state.initialize);

  if (status === 'idle') {
    void initialize();
  }

  return status !== 'idle';
}
