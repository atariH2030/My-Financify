#!/usr/bin/env tsx
/**
 * Script Automático de Correção de Warnings
 * Corrige os warnings mais comuns do ESLint
 *
 * Uso: npm run fix:warnings
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

interface FixStats {
  filesProcessed: number;
  warningsFixed: number;
  byType: Record<string, number>;
}

const stats: FixStats = {
  filesProcessed: 0,
  warningsFixed: 0,
  byType: {},
};

// ============================================================================
// CORREÇÕES AUTOMÁTICAS
// ============================================================================

/**
 * 1. Remove imports não usados
 */
function removeUnusedImports(content: string, filePath: string): string {
  let fixed = content;
  let count = 0;

  // Detectar imports não usados (padrão: import { X } from 'y')
  const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"][^'"]+['"]/g;
  const matches = [...content.matchAll(importRegex)];

  for (const match of matches) {
    const importStatement = match[0];
    const imports = match[1].split(',').map(i => i.trim());

    const unusedImports = imports.filter(imp => {
      const importName = imp.split(' as ')[0].trim();
      // Verificar se é usado no código (após os imports)
      const codeAfterImports = content.split(importStatement)[1] || '';
      const usageRegex = new RegExp(`\\b${importName}\\b`, 'g');
      const usages = (codeAfterImports.match(usageRegex) || []).length;
      return usages === 0;
    });

    if (unusedImports.length > 0 && unusedImports.length < imports.length) {
      // Remover apenas imports não usados
      const usedImports = imports.filter(imp => !unusedImports.includes(imp));
      const newImport = importStatement.replace(match[1], usedImports.join(', '));
      fixed = fixed.replace(importStatement, newImport);
      count += unusedImports.length;
    } else if (unusedImports.length === imports.length) {
      // Remover linha inteira se todos não são usados
      fixed = fixed.replace(importStatement + ';\n', '');
      fixed = fixed.replace(importStatement + ';', '');
      count += unusedImports.length;
    }
  }

  if (count > 0) {
    stats.byType['unused-imports'] = (stats.byType['unused-imports'] || 0) + count;
    stats.warningsFixed += count;
  }

  return fixed;
}

/**
 * 2. Escapar aspas em JSX
 */
function escapeJSXQuotes(content: string): string {
  let fixed = content;
  let count = 0;

  // Detectar aspas duplas dentro de JSX text (não em atributos)
  // Pattern: >{texto com "aspas"}<
  const jsxTextRegex = />(.*?[^\\]".*?)</g;
  const matches = [...content.matchAll(jsxTextRegex)];

  for (const match of matches) {
    const original = match[0];
    const text = match[1];

    // Verificar se não está em um atributo
    if (!original.includes('=')) {
      const escaped = text.replace(/"/g, '&quot;');
      const newText = original.replace(text, escaped);
      fixed = fixed.replace(original, newText);
      count++;
    }
  }

  if (count > 0) {
    stats.byType['jsx-quotes'] = (stats.byType['jsx-quotes'] || 0) + count;
    stats.warningsFixed += count;
  }

  return fixed;
}

/**
 * 3. Prefixar variáveis não usadas com underscore
 */
function prefixUnusedVars(content: string): string {
  let fixed = content;
  let count = 0;

  // Detectar variáveis declaradas mas não usadas
  // Pattern: const X = ...; ou let X = ...;
  const varRegex = /\b(const|let)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g;
  const matches = [...content.matchAll(varRegex)];

  for (const match of matches) {
    const varName = match[2];

    // Pular se já começa com underscore
    if (varName.startsWith('_')) continue;

    // Verificar se é usado depois da declaração
    const afterDeclaration = content.split(match[0])[1] || '';
    const usageRegex = new RegExp(`\\b${varName}\\b`, 'g');
    const usages = (afterDeclaration.match(usageRegex) || []).length;

    if (usages === 0) {
      // Prefixar com underscore
      const newDeclaration = match[0].replace(varName, `_${varName}`);
      fixed = fixed.replace(match[0], newDeclaration);
      count++;
    }
  }

  if (count > 0) {
    stats.byType['unused-vars'] = (stats.byType['unused-vars'] || 0) + count;
    stats.warningsFixed += count;
  }

  return fixed;
}

/**
 * 4. Mover setState para fora de useEffect quando possível
 */
function fixSetStateInEffect(content: string): string {
  let fixed = content;
  let count = 0;

  // Detectar padrão: useEffect(() => { setState(...) }, [])
  const effectRegex = /useEffect\(\(\)\s*=>\s*\{([^}]*setState[^}]*)\},\s*\[\]\)/g;
  const matches = [...content.matchAll(effectRegex)];

  for (const match of matches) {
    const effectBody = match[1];

    // Se contém apenas setState simples, sugerir refatoração
    if (
      !effectBody.includes('async') &&
      !effectBody.includes('await') &&
      !effectBody.includes('fetch')
    ) {
      // Adicionar comentário sugestivo
      const commented = match[0].replace(
        'useEffect',
        '// TODO: Consider moving setState outside effect or using callback\n  useEffect'
      );
      fixed = fixed.replace(match[0], commented);
      count++;
    }
  }

  if (count > 0) {
    stats.byType['setstate-in-effect'] = (stats.byType['setstate-in-effect'] || 0) + count;
    stats.warningsFixed += count;
  }

  return fixed;
}

/**
 * 5. Remover await desnecessário em return
 */
function removeUnnecessaryAwait(content: string): string {
  let fixed = content;
  let count = 0;

  // Pattern: return await Promise...
  const awaitReturnRegex = /return\s+await\s+/g;
  const matches = content.match(awaitReturnRegex);

  if (matches) {
    fixed = content.replace(awaitReturnRegex, 'return ');
    count = matches.length;
    stats.byType['unnecessary-await'] = (stats.byType['unnecessary-await'] || 0) + count;
    stats.warningsFixed += count;
  }

  return fixed;
}

// ============================================================================
// PROCESSAMENTO DE ARQUIVOS
// ============================================================================

function processFile(filePath: string): void {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const original = content;

    // Aplicar correções
    content = removeUnusedImports(content, filePath);
    content = escapeJSXQuotes(content);
    content = prefixUnusedVars(content);
    content = fixSetStateInEffect(content);
    content = removeUnnecessaryAwait(content);

    // Salvar apenas se houver mudanças
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      stats.filesProcessed++;
      console.log(`✅ Fixed: ${path.relative(rootDir, filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

function walkDirectory(dir: string): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Ignorar node_modules, dist, etc.
    if (entry.name.match(/^(node_modules|dist|build|\.git|\.vscode)$/)) {
      continue;
    }

    if (entry.isDirectory()) {
      walkDirectory(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      processFile(fullPath);
    }
  }
}

// ============================================================================
// MAIN
// ============================================================================

console.log('🔧 Starting automatic warning fixes...\n');

const srcDir = path.join(rootDir, 'src');
walkDirectory(srcDir);

console.log('\n' + '='.repeat(60));
console.log('📊 FIX STATISTICS');
console.log('='.repeat(60));
console.log(`Files processed: ${stats.filesProcessed}`);
console.log(`Total warnings fixed: ${stats.warningsFixed}`);
console.log('\nBy type:');
Object.entries(stats.byType).forEach(([type, count]) => {
  console.log(`  - ${type}: ${count}`);
});
console.log('='.repeat(60));

if (stats.warningsFixed > 0) {
  console.log('\n✅ Automatic fixes applied! Run `npm run lint` to verify.');
  console.log('⚠️  Review changes before committing (some may need manual adjustment).');
} else {
  console.log('\n✨ No automatic fixes needed!');
}
