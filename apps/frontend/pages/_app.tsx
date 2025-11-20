'use client';

import type { AppProps } from 'next/app';
import type { Router } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AppProviders } from '../src/app/providers';
import { createAppRouter } from '../src/app/router';
import { env } from '../src/core/config/env';
import '../src/styles/forms.css';
import '../src/styles/globals.css';

export default function AgendaAmigaApp({ Component: _, pageProps: __ }: AppProps) {
  const [router, setRouter] = useState<Router | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !router) {
      setRouter(createAppRouter());
    }
    if (process.env.NODE_ENV === 'development' && env.apiHttpBase.length === 0) {
      import('../src/mocks/browser').then(({ initMocks }) => initMocks());
    }
  }, [router]);

  return (
    <AppProviders>
      {router ? <RouterProvider router={router} /> : null}
    </AppProviders>
  );
}
