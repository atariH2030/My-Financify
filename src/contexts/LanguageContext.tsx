/**
 * Language Context - Sistema de i18n nativo
 * v3.14.0 - Suporte a PT-BR, EN-US, ES-ES
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import ptBR from '../locales/pt-BR.json';
import enUS from '../locales/en-US.json';
import esES from '../locales/es-ES.json';

export type Language = 'pt-BR' | 'en-US' | 'es-ES';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translations: typeof ptBR;
}

const translations = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es-ES': esES,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Carregar idioma salvo ou usar pt-BR como padrão
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language;
    return saved && ['pt-BR', 'en-US', 'es-ES'].includes(saved) ? saved : 'pt-BR';
  });

  // Salvar idioma quando mudar
  useEffect(() => {
    localStorage.setItem('language', language);
    // Atualizar atributo lang no HTML para acessibilidade
    document.documentElement.lang = language;
  }, [language]);

  // Função de tradução com suporte a nested keys
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback para pt-BR se não encontrar
        console.warn(`Translation key not found: ${key} for language ${language}`);
        let fallback: any = ptBR;
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object' && fk in fallback) {
            fallback = fallback[fk];
          } else {
            return key; // Retorna a key se não encontrar nem em pt-BR
          }
        }
        return fallback;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  const setLanguage = (lang: Language) => {
    if (['pt-BR', 'en-US', 'es-ES'].includes(lang)) {
      setLanguageState(lang);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translations: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

// Hook simplificado para usar apenas a função t
export const useTranslation = () => {
  const { t } = useLanguage();
  return { t };
};
