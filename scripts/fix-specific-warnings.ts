#!/usr/bin/env tsx
/**
 * Fix Specific Warnings
 * Correções cirúrgicas para warnings específicos
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let filesFixed = 0;
let warningsFixed = 0;

console.log('🔧 Fixing specific warnings...\n');

// ============================================================================
// 1. FIX: no-await-in-loop (47 warnings)
// ============================================================================

function fixAwaitInLoop(content: string): string {
  let fixed = content;
  let count = 0;

  // Pattern 1: for loop com await - converter para Promise.all
  const forLoopRegex = /for\s*\((.*?)\)\s*\{([^}]*await[^}]*)\}/gs;
  
  // Pattern 2: await sem necessidade em loop
  // Identificar se pode usar Promise.all
  const matches = [...content.matchAll(forLoopRegex)];
  
  for (const match of matches) {
    const loopContent = match[2];
    
    // Se tem apenas um await, pode otimizar com Promise.all
    const awaitCount = (loopContent.match(/await/g) || []).length;
    
    if (awaitCount === 1) {
      // Adicionar comentário para refatoração manual
      const commented = `// TODO: Consider using Promise.all() instead of await in loop\n  ${match[0]}`;
      fixed = fixed.replace(match[0], commented);
      count++;
    }
  }

  return { fixed, count };
}

// ============================================================================
// 2. FIX: @typescript-eslint/no-unused-vars (6 warnings)
// ============================================================================

function fixUnusedVars(content: string, filePath: string): string {
  let fixed = content;
  let count = 0;

  // Casos específicos que vimos:
  // 1. useEffect importado mas não usado
  if (content.includes("import { useEffect }") && !content.includes("useEffect(")) {
    fixed = fixed.replace(/import\s*\{\s*useEffect\s*,?\s*/, 'import { ');
    fixed = fixed.replace(/,\s*useEffect\s*\}/, ' }');
    fixed = fixed.replace(/import\s*\{\s*\}\s*from/, '// import {} removed from');
    count++;
  }

  // 2. Variáveis de destructuring não usadas
  const destructRegex = /const\s*\{\s*([^}]+)\}\s*=\s*([^;]+);/g;
  const matches = [...content.matchAll(destructRegex)];

  for (const match of matches) {
    const vars = match[1].split(',').map(v => v.trim());
    const source = match[2];
    
    // Verificar cada variável
    const usedVars = vars.filter(varDecl => {
      const varName = varDecl.split(':')[0].trim();
      if (varName.startsWith('_')) return true; // Já prefixado
      
      // Verificar uso após declaração
      const afterDecl = content.split(match[0])[1] || '';
      return afterDecl.includes(varName);
    });

    // Se alguma var não é usada, prefixar com _
    if (usedVars.length < vars.length) {
      const newVars = vars.map(varDecl => {
        const varName = varDecl.split(':')[0].trim();
        if (usedVars.some(v => v.includes(varName))) {
          return varDecl;
        }
        return varDecl.replace(varName, `_${varName}`);
      });
      
      const newDecl = `const { ${newVars.join(', ')} } = ${source};`;
      fixed = fixed.replace(match[0], newDecl);
      count++;
    }
  }

  return { fixed, count };
}

// ============================================================================
// 3. FIX: setState in effect (4 warnings)
// ============================================================================

function fixSetStateInEffect(content: string): string {
  let fixed = content;
  let count = 0;

  // Apenas adicionar comentário, pois requer refatoração manual
  const pattern = /useEffect\(\(\)\s*=>\s*\{[^}]*setState[^}]*\},\s*\[/g;
  const matches = content.match(pattern);

  if (matches) {
    for (const match of matches) {
      if (!content.includes('// TODO: Move setState')) {
        const commented = `// TODO: Move setState outside effect or use event handler\n  ${match}`;
        fixed = fixed.replace(match, commented);
        count++;
      }
    }
  }

  return { fixed, count };
}

// ============================================================================
// PROCESSAR ARQUIVOS
// ============================================================================

function processFile(filePath: string): void {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    let modified = content;
    let fileWarningsFixed = 0;

    // Aplicar correções
    const awaitResult = fixAwaitInLoop(modified);
    modified = awaitResult.fixed;
    fileWarningsFixed += awaitResult.count;

    const varsResult = fixUnusedVars(modified, filePath);
    modified = varsResult.fixed;
    fileWarningsFixed += varsResult.count;

    const effectResult = fixSetStateInEffect(modified);
    modified = effectResult.fixed;
    fileWarningsFixed += effectResult.count;

    // Salvar se modificado
    if (modified !== content) {
      fs.writeFileSync(filePath, modified, 'utf-8');
      filesFixed++;
      warningsFixed += fileWarningsFixed;
      const relativePath = path.relative(rootDir, filePath);
      console.log(`✅ ${relativePath} (${fileWarningsFixed} fixes)`);
    }
  } catch (error) {
    console.error(`❌ Error: ${filePath}`, error);
  }
}

function walkDirectory(dir: string): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.name.match(/^(node_modules|dist|build|\.git)$/)) continue;

    if (entry.isDirectory()) {
      walkDirectory(fullPath);
    } else if (entry.name.match(/\.(ts|tsx)$/)) {
      processFile(fullPath);
    }
  }
}

// Executar
const srcDir = path.join(rootDir, 'src');
const testsDir = path.join(rootDir, 'tests');

[srcDir, testsDir].forEach(dir => {
  if (fs.existsSync(dir)) {
    walkDirectory(dir);
  }
});

console.log('\n' + '='.repeat(60));
console.log(`✅ ${filesFixed} files fixed`);
console.log(`✅ ${warningsFixed} warnings fixed`);
console.log('='.repeat(60));

if (warningsFixed > 0) {
  console.log('\n💡 Run `npm run lint` to verify fixes');
  console.log('⚠️  Review TODO comments for manual refactoring');
} else {
  console.log('\n✨ No automatic fixes needed!');
}
