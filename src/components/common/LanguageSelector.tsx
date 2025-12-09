/**
 * Language Selector Component
 * v3.14.0 - Seletor de idioma com bandeiras
 */

import React from 'react';
import {useLanguage} from '../../contexts/LanguageContext';
import './LanguageSelector.css';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; flag: string; name: string }[] = [
    { code: 'pt-BR', flag: '🇧🇷', name: 'Português' },
    { code: 'en-US', flag: '🇺🇸', name: 'English' },
    { code: 'es-ES', flag: '🇪🇸', name: 'Español' },
  ];

  const currentLanguage = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="language-selector">
      <button
        className="language-button"
        aria-label="Selecionar idioma"
        title={`Idioma: ${currentLanguage.name}`}
      >
        <span className="language-flag">{currentLanguage.flag}</span>
      </button>
      <div className="language-dropdown">
        {languages.map((lang) => (
          <button
            key={lang.code}
            className={`language-option ${language === lang.code ? 'active' : ''}`}
            onClick={() => setLanguage(lang.code)}
            aria-label={`Mudar idioma para ${lang.name}`}
          >
            <span className="language-flag">{lang.flag}</span>
            <span className="language-name">{lang.name}</span>
            {language === lang.code && <span className="language-check">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
