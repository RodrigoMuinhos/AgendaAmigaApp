import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type EasyModeState = {
  enabled: boolean;
  toggle: () => void;
  setEnabled: (next: boolean) => void;
};

const STORAGE_KEY = 'agenda-amiga:easy-mode';

const EasyModeContext = createContext<EasyModeState | undefined>(undefined);

type EasyModeProviderProps = {
  children: ReactNode;
};

export function EasyModeProvider({ children }: EasyModeProviderProps) {
  const [enabled, setEnabledState] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? stored === 'true' : false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
  }, [enabled]);

  const toggle = useCallback(() => {
    setEnabledState((prev) => !prev);
  }, []);

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
  }, []);

  const value = useMemo(
    () => ({
      enabled,
      toggle,
      setEnabled,
    }),
    [enabled, toggle, setEnabled],
  );

  return <EasyModeContext.Provider value={value}>{children}</EasyModeContext.Provider>;
}

export function useEasyMode() {
  const context = useContext(EasyModeContext);
  if (!context) {
    throw new Error('useEasyMode must be used inside EasyModeProvider');
  }
  return context;
}
