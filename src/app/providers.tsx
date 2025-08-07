
"use client";

import React, { useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SettingsProvider, useSettings } from '@/context/settings-context'; 

function SettingsApplier({ children }: { children: React.ReactNode }) {
  const { appSettings } = useSettings();

  useEffect(() => {
    if (appSettings.fontSize) {
      document.documentElement.style.fontSize = `${appSettings.fontSize}%`;
    }
  }, [appSettings.fontSize]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
          <SettingsProvider>
            <SettingsApplier>{children}</SettingsApplier>
          </SettingsProvider>
        </NextThemesProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
