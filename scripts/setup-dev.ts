#!/usr/bin/env tsx
/**
 * Setup Development Environment
 * Configura hooks, instala dependências, valida ambiente
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🚀 Setting up development environment...\n');

// ============================================================================
// 1. Verificar Node.js version
// ============================================================================

console.log('📦 Checking Node.js version...');
const nodeVersion = process.version;
const major = parseInt(nodeVersion.split('.')[0].substring(1));

if (major < 18) {
  console.error('❌ Node.js 18+ required');
  process.exit(1);
}
console.log(`✅ Node.js ${nodeVersion}\n`);

// ============================================================================
// 2. Instalar Husky (Git Hooks)
// ============================================================================

console.log('🪝 Setting up Git hooks...');
try {
  // Criar diretório .husky se não existir
  const huskyDir = path.join(rootDir, '.husky');
  if (!fs.existsSync(huskyDir)) {
    fs.mkdirSync(huskyDir, { recursive: true });
  }

  // Tornar pre-commit executável (Linux/Mac)
  const preCommitPath = path.join(huskyDir, 'pre-commit');
  if (fs.existsSync(preCommitPath) && process.platform !== 'win32') {
    fs.chmodSync(preCommitPath, 0o755);
  }

  console.log('✅ Git hooks configured\n');
} catch (error) {
  console.warn('⚠️  Could not setup hooks:', error);
}

// ============================================================================
// 3. Criar arquivo .env se não existir
// ============================================================================

console.log('⚙️  Checking environment configuration...');
const envPath = path.join(rootDir, '.env');
const envExamplePath = path.join(rootDir, '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env from .env.example');
    console.log('⚠️  Remember to configure your credentials!\n');
  } else {
    console.warn('⚠️  No .env.example found\n');
  }
} else {
  console.log('✅ .env already exists\n');
}

// ============================================================================
// 4. Verificar dependências
// ============================================================================

console.log('📚 Checking dependencies...');
try {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8')
  );
  
  const nodeModules = path.join(rootDir, 'node_modules');
  if (!fs.existsSync(nodeModules)) {
    console.log('📥 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
  } else {
    console.log('✅ Dependencies already installed\n');
  }
} catch (error) {
  console.error('❌ Error checking dependencies:', error);
  process.exit(1);
}

// ============================================================================
// 5. Executar análise inicial de warnings
// ============================================================================

console.log('🔍 Running initial code analysis...');
try {
  execSync('npm run analyze:warnings', { stdio: 'inherit' });
} catch (error) {
  console.warn('⚠️  Could not run analysis (non-critical)');
}

// ============================================================================
// 6. Resumo
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log('✅ DEVELOPMENT ENVIRONMENT READY!');
console.log('='.repeat(60));
console.log('\n📝 Next steps:\n');
console.log('1. Configure .env with your credentials');
console.log('2. Run: npm run dev');
console.log('3. Open: http://localhost:3000\n');
console.log('🛠️  Available commands:\n');
console.log('  npm run dev              - Start development server');
console.log('  npm run build            - Build for production');
console.log('  npm run lint             - Check code quality');
console.log('  npm run analyze:warnings - Analyze warnings');
console.log('  npm run fix:all          - Auto-fix common issues');
console.log('  npm run test             - Run tests');
console.log('\n' + '='.repeat(60));
