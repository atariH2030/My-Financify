import React, { useState, useEffect } from 'react';
import { I18nService, SupportedLanguage } from '../../services/i18n.service';
import './LanguageSelector.css';

/**
 * LanguageSelector - Sprint 5.2
 * 
 * Componente para alternar entre idiomas suportados
 * - Dropdown com bandeiras e nomes de idiomas
 * - Sincronização automática com localStorage
 * - Disparo de eventos para atualizar UI
 */

const LanguageSelector: React.FC = () => {
  const i18n = I18nService.getInstance();
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(i18n.getCurrentLanguage());
  const [isOpen, setIsOpen] = useState(false);
  const languages = i18n.getSupportedLanguages();

  useEffect(() => {
    // Listener para mudanças de idioma
    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ language: SupportedLanguage }>;
      setCurrentLang(customEvent.detail.language);
    };

    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  const handleLanguageChange = (code: SupportedLanguage) => {
    i18n.setLanguage(code);
    setCurrentLang(code);
    setIsOpen(false);
  };

  const currentLanguage = languages.find((lang) => lang.code === currentLang);

  return (
    <div className="language-selector">
      <button
        className="language-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Selecionar idioma"
        aria-expanded={isOpen}
      >
        <span className="flag">{currentLanguage?.flag}</span>
        <span className="lang-code">{currentLanguage?.code}</span>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
      </button>

      {isOpen && (
        <>
          <div className="language-backdrop" onClick={() => setIsOpen(false)}></div>
          <ul className="language-dropdown">
            {languages.map((lang) => (
              <li key={lang.code}>
                <button
                  className={`language-item ${currentLang === lang.code ? 'active' : ''}`}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  <span className="flag">{lang.flag}</span>
                  <span className="lang-name">{lang.name}</span>
                  {currentLang === lang.code && (
                    <i className="fas fa-check"></i>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;
