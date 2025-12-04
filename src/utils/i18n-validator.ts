/**
 * i18n Validator
 * Valida automaticamente se todas as keys existem em todos os idiomas
 * Executa ao iniciar dev server - detecta erros ANTES de aparecerem no console
 */

import ptBR from '../locales/pt-BR.json';
import enUS from '../locales/en-US.json';
import esES from '../locales/es-ES.json';

type TranslationObject = { [key: string]: string | TranslationObject | string[] };

/**
 * Extrai todas as keys de um objeto aninhado (ex: "shortcuts.dashboard")
 */
function extractKeys(obj: TranslationObject, prefix = ''): string[] {
  const keys: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'string') {
      keys.push(fullKey);
    } else if (Array.isArray(value)) {
      // Skip arrays (like suggestions)
      continue;
    } else if (typeof value === 'object' && value !== null) {
      keys.push(...extractKeys(value as TranslationObject, fullKey));
    }
  }
  
  return keys;
}

/**
 * Valida se uma key existe em um objeto de tradução
 */
function hasKey(obj: TranslationObject, key: string): boolean {
  const parts = key.split('.');
  let current: any = obj;
  
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return false;
    }
  }
  
  return typeof current !== 'undefined';
}

/**
 * Valida todas as traduções e retorna erros encontrados
 */
export function validateTranslations() {
  const languages = {
    'pt-BR': ptBR,
    'en-US': enUS,
    'es-ES': esES,
  };

  // Extrair todas as keys de cada idioma
  const allKeys = {
    'pt-BR': extractKeys(ptBR),
    'en-US': extractKeys(enUS),
    'es-ES': extractKeys(esES),
  };

  // Encontrar keys únicas (presentes em pelo menos um idioma)
  const uniqueKeys = new Set<string>();
  Object.values(allKeys).forEach(keys => keys.forEach(k => uniqueKeys.add(k)));

  const errors: { key: string; missingIn: string[] }[] = [];

  // Verificar cada key em todos os idiomas
  uniqueKeys.forEach(key => {
    const missingIn: string[] = [];
    
    Object.entries(languages).forEach(([lang, translations]) => {
      if (!hasKey(translations, key)) {
        missingIn.push(lang);
      }
    });

    if (missingIn.length > 0) {
      errors.push({ key, missingIn });
    }
  });

  return { errors, totalKeys: uniqueKeys.size };
}

/**
 * Executa validação e exibe resultado no console (apenas se houver erros)
 */
export function runValidation() {
  const { errors, totalKeys } = validateTranslations();

  if (errors.length === 0) {
    console.log('✅ i18n Validation: All translations are complete!');
    console.log(`📊 Total keys validated: ${totalKeys}`);
    return true;
  }

  console.error('❌ i18n Validation FAILED!');
  console.error(`Found ${errors.length} missing translation keys:\n`);

  errors.forEach(({ key, missingIn }) => {
    console.error(`  🔴 "${key}" is missing in: ${missingIn.join(', ')}`);
  });

  console.error('\n💡 Fix: Add missing keys to the respective locale files.');
  
  return false;
}

// Auto-executar em development mode
if (import.meta.env.DEV) {
  runValidation();
}
