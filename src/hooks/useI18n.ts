/**
 * @file useI18n.ts
 * @description React Hook para internacionalização - Sprint 5.2
 * @version 3.12.0
 * @author DEV - Rickson (TQM)
 */

import { useState, useEffect } from 'react';
import { I18nService, SupportedLanguage } from '../services/i18n.service';

interface UseI18nReturn {
  t: (key: string) => string;
  tInterpolate: (key: string, params: Record<string, string | number>) => string;
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  formatCurrency: (value: number, currency?: string) => string;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
}

/**
 * Hook customizado para i18n
 * 
 * Uso:
 * ```tsx
 * const { t, currentLanguage, setLanguage } = useI18n();
 * 
 * return (
 *   <div>
 *     <h1>{t('dashboard.title')}</h1>
 *     <button onClick={() => setLanguage('en-US')}>English</button>
 *   </div>
 * );
 * ```
 */
export const useI18n = (): UseI18nReturn => {
  const i18n = I18nService.getInstance();
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(
    i18n.getCurrentLanguage()
  );

  useEffect(() => {
    // Listener para mudanças de idioma
    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ language: SupportedLanguage }>;
      setCurrentLanguage(customEvent.detail.language);
    };

    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  const setLanguage = (language: SupportedLanguage) => {
    i18n.setLanguage(language);
  };

  return {
    t: (key: string) => i18n.t(key as never),
    tInterpolate: (key: string, params: Record<string, string | number>) =>
      i18n.tInterpolate(key as never, params),
    currentLanguage,
    setLanguage,
    formatCurrency: (value: number, currency?: string) =>
      i18n.formatCurrency(value, currency),
    formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) =>
      i18n.formatDate(date, options),
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
      i18n.formatNumber(value, options),
  };
};

export default useI18n;
