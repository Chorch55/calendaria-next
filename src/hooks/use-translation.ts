// src/hooks/use-translation.ts

'use client';

/**
 * @fileOverview A hook to provide translation functionality based on the current language setting.
 */

import { useSettings } from '@/context/settings-context';
import { translations, TranslationKey } from '@/config/locales';
import { useCallback } from 'react';

/**
 * A custom hook that provides a translation function `t`.
 * It gets the current language from `useSettings` and returns the corresponding
 * string for a given key. It falls back to English if a translation is missing.
 * @returns {{t: (key: TranslationKey) => string, language: string}} An object containing the translation function and the current language code.
 */
export const useTranslation = (): { t: (key: TranslationKey) => string; language: string } => {
  const { appSettings } = useSettings();
  const { language } = appSettings;

  const t = useCallback((key: TranslationKey): string => {
    const langTranslations = translations[language] || translations.en;
    return langTranslations[key] || translations.en[key];
  }, [language]);

  return { t, language };
};
