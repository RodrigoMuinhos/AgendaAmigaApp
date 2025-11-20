import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { EasyModeProvider } from '../core/hooks/useEasyMode';
import { ThemeProvider } from '../core/hooks/useTheme';
import i18n from './i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60_000,
    },
    mutations: {
      retry: 1,
    },
  },
});

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <EasyModeProvider>
            {children}
          </EasyModeProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'development' ? <ReactQueryDevtools initialIsOpen={false} /> : null}
      </QueryClientProvider>
    </I18nextProvider>
  );
}
