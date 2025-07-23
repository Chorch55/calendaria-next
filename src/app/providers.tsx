
"use client";

import React, { useEffect } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
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
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <SettingsProvider>
        <SettingsApplier>{children}</SettingsApplier>
      </SettingsProvider>
    </NextThemesProvider>
  );
}
