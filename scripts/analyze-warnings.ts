#!/usr/bin/env tsx
/**
 * Script Simplificado: Análise de Warnings
 * Mapeia warnings do ESLint e sugere correções
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface Warning {
  file: string;
  line: number;
  type: string;
  message: string;
  rule: string;
}

console.log('🔍 Analyzing ESLint warnings...\n');

// Executar lint e capturar output
let lintOutput: string;
try {
  execSync('npm run lint', { encoding: 'utf-8', stdio: 'pipe' });
  lintOutput = '';
} catch (error: any) {
  lintOutput = error.stdout || error.stderr || '';
}

// Parsear warnings
const warnings: Warning[] = [];
const lines = lintOutput.split('\n');

let currentFile = '';
for (const line of lines) {
  // Detectar arquivo
  if (line.match(/^[A-Z]:\\/)) {
    currentFile = line.trim();
  }
  
  // Detectar warning
  const warningMatch = line.match(/^\s+(\d+):(\d+)\s+warning\s+(.+?)\s+(@[\w-]+\/[\w-]+|[\w-]+)$/);
  if (warningMatch && currentFile) {
    warnings.push({
      file: currentFile,
      line: parseInt(warningMatch[1]),
      type: 'warning',
      message: warningMatch[3],
      rule: warningMatch[4]
    });
  }
}

// Agrupar por tipo de warning
const byRule: Record<string, Warning[]> = {};
warnings.forEach(w => {
  if (!byRule[w.rule]) byRule[w.rule] = [];
  byRule[w.rule].push(w);
});

// Agrupar por arquivo
const byFile: Record<string, Warning[]> = {};
warnings.forEach(w => {
  if (!byFile[w.file]) byFile[w.file] = [];
  byFile[w.file].push(w);
});

console.log('=' .repeat(70));
console.log('📊 WARNING ANALYSIS');
console.log('='.repeat(70));
console.log(`Total warnings: ${warnings.length}\n`);

// Top 10 tipos de warnings
console.log('🔝 Top 10 Warning Types:');
console.log('-'.repeat(70));
Object.entries(byRule)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 10)
  .forEach(([rule, warns], idx) => {
    const sample = warns[0].message.substring(0, 50);
    console.log(`${idx + 1}. ${rule} (${warns.length}x)`);
    console.log(`   Example: ${sample}...`);
  });

console.log('\n📁 Top 10 Files with Most Warnings:');
console.log('-'.repeat(70));
Object.entries(byFile)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 10)
  .forEach(([file, warns], idx) => {
    const fileName = path.basename(file);
    console.log(`${idx + 1}. ${fileName} (${warns.length} warnings)`);
  });

// Sugestões de correção automática
console.log('\n💡 RECOMMENDED ACTIONS:');
console.log('='.repeat(70));

const actions: string[] = [];

// 1. Unused vars
const unusedVars = byRule['@typescript-eslint/no-unused-vars'] || [];
if (unusedVars.length > 0) {
  actions.push(`✓ ${unusedVars.length}x unused variables - Prefix with underscore (_var) or remove`);
}

// 2. JSX quotes
const jsxQuotes = byRule['react/no-unescaped-entities'] || [];
if (jsxQuotes.length > 0) {
  actions.push(`✓ ${jsxQuotes.length}x unescaped quotes in JSX - Use &quot; or {'\"'}`);
}

// 3. setState in effect
const setStateEffect = byRule['react-hooks/set-state-in-effect'] || [];
if (setStateEffect.length > 0) {
  actions.push(`✓ ${setStateEffect.length}x setState in useEffect - Move to event handler or use callback`);
}

// 4. Await in return
const awaitReturn = warnings.filter(w => w.message.includes('Unexpected `await`'));
if (awaitReturn.length > 0) {
  actions.push(`✓ ${awaitReturn.length}x unnecessary await in return - Remove await`);
}

// 5. Fast refresh
const fastRefresh = byRule['react-refresh/only-export-components'] || [];
if (fastRefresh.length > 0) {
  actions.push(`✓ ${fastRefresh.length}x Fast Refresh issues - Export only components from component files`);
}

if (actions.length === 0) {
  console.log('✨ No common fixable warnings found!');
} else {
  actions.forEach((action, idx) => console.log(`${idx + 1}. ${action}`));
}

// Gerar script de correção específico
console.log('\n🔧 QUICK FIX COMMANDS:');
console.log('='.repeat(70));

if (unusedVars.length > 0) {
  console.log('# Fix unused variables:');
  console.log('# Option 1: Add underscore prefix to unused vars');
  console.log('# Option 2: Remove if truly unused\n');
}

if (jsxQuotes.length > 0) {
  console.log('# Fix JSX quotes:');
  console.log('Find:    "text"');
  console.log('Replace: &quot;text&quot;');
  console.log('Or use:  {\'"\'}text{\'"\'}');
  console.log('');
}

console.log('\n📝 MANUAL REVIEW NEEDED:');
console.log('='.repeat(70));
console.log('Some warnings require manual inspection:');
console.log('- setState in useEffect (may need refactoring)');
console.log('- Hook dependency arrays (may cause bugs if auto-fixed)');
console.log('- Component export patterns (architectural decisions)');

console.log('\n' + '='.repeat(70));
console.log('💾 Detailed report saved to: docs/warnings-analysis.json');

// Salvar relatório detalhado
const report = {
  timestamp: new Date().toISOString(),
  total: warnings.length,
  byRule: Object.fromEntries(
    Object.entries(byRule).map(([rule, warns]) => [rule, warns.length])
  ),
  byFile: Object.fromEntries(
    Object.entries(byFile).map(([file, warns]) => [
      path.basename(file),
      warns.length
    ])
  ),
  topFiles: Object.entries(byFile)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 20)
    .map(([file, warns]) => ({
      file: path.relative(process.cwd(), file),
      warnings: warns.length,
      rules: [...new Set(warns.map(w => w.rule))]
    }))
};

fs.writeFileSync(
  'docs/warnings-analysis.json',
  JSON.stringify(report, null, 2)
);

console.log('✅ Analysis complete!');
