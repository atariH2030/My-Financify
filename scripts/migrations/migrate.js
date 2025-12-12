#!/usr/bin/env node

/**
 * Migration CLI Tool
 * Ferramenta de linha de comando para gerenciar migrations
 * 
 * Uso:
 *   npm run migrate:create -- --name="add_workspace_rls"
 *   npm run migrate:up
 *   npm run migrate:down -- --version="20251210_001"
 *   npm run migrate:status
 * 
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const MIGRATIONS_DIR = path.join(__dirname, '../../supabase/migrations');
const ROLLBACK_DIR = path.join(MIGRATIONS_DIR, 'rollback');
const SEED_DIR = path.join(MIGRATIONS_DIR, 'seed');

// ============================================================================
// HELPERS
// ============================================================================

function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}_${hour}${minute}${second}`;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function ensureDirectories() {
  [MIGRATIONS_DIR, ROLLBACK_DIR, SEED_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
}

function getMigrationTemplate(name, description) {
  const version = getTimestamp();
  const slug = slugify(name);
  
  return `-- ====================================
-- Migration: ${name}
-- Version: ${version}
-- Description: ${description}
-- Author: DEV - Rickson
-- Created: ${new Date().toISOString()}
-- ====================================

-- ============================================================================
-- MIGRATION UP
-- ============================================================================

-- Escreva aqui o SQL para APLICAR a migration
-- Exemplo:
-- CREATE TABLE IF NOT EXISTS public.example (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   name TEXT NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- TODO: Implementar migration

-- ============================================================================
-- VERIFICAÇÃO DE SUCESSO
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration ${version} applied successfully!';
END $$;
`;
}

function getRollbackTemplate(name, version) {
  return `-- ====================================
-- Rollback: ${name}
-- Version: ${version}
-- Author: DEV - Rickson
-- Created: ${new Date().toISOString()}
-- ====================================

-- ============================================================================
-- MIGRATION ROLLBACK
-- ============================================================================

-- Escreva aqui o SQL para REVERTER a migration
-- Exemplo:
-- DROP TABLE IF EXISTS public.example;

-- TODO: Implementar rollback

-- ============================================================================
-- VERIFICAÇÃO DE SUCESSO
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration ${version} rolled back successfully!';
END $$;
`;
}

// ============================================================================
// COMANDOS
// ============================================================================

async function createMigration(name, description = '') {
  if (!name) {
    console.error('❌ Error: Migration name is required');
    console.log('Usage: npm run migrate:create -- --name="migration_name" --description="Optional description"');
    process.exit(1);
  }

  ensureDirectories();

  const version = getTimestamp();
  const slug = slugify(name);
  const filename = `${version}_${slug}.sql`;
  const rollbackFilename = `${version}_${slug}_rollback.sql`;

  const migrationPath = path.join(MIGRATIONS_DIR, filename);
  const rollbackPath = path.join(ROLLBACK_DIR, rollbackFilename);

  // Criar migration
  fs.writeFileSync(migrationPath, getMigrationTemplate(name, description));
  console.log(`✅ Created migration: ${filename}`);

  // Criar rollback
  fs.writeFileSync(rollbackPath, getRollbackTemplate(name, version));
  console.log(`✅ Created rollback: ${rollbackFilename}`);

  console.log('\n📝 Next steps:');
  console.log(`1. Edit migration: ${migrationPath}`);
  console.log(`2. Edit rollback: ${rollbackPath}`);
  console.log(`3. Run: npm run migrate:up`);
}

function listMigrations() {
  ensureDirectories();

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql') && !f.includes('rollback'))
    .sort();

  if (files.length === 0) {
    console.log('📂 No migrations found');
    return;
  }

  console.log('\n📊 Available Migrations:\n');
  files.forEach((file, index) => {
    const version = file.split('_')[0];
    const name = file.replace('.sql', '').split('_').slice(1).join('_');
    console.log(`${index + 1}. [${version}] ${name}`);
  });
  console.log('');
}

function showStatus() {
  ensureDirectories();

  const migrations = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql') && !f.includes('rollback'))
    .sort();

  const rollbacks = fs.readdirSync(ROLLBACK_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log('\n📊 Migration Status:\n');
  console.log(`Total Migrations: ${migrations.length}`);
  console.log(`Total Rollbacks:  ${rollbacks.length}`);
  console.log('\n📁 Directories:');
  console.log(`  Migrations: ${MIGRATIONS_DIR}`);
  console.log(`  Rollbacks:  ${ROLLBACK_DIR}`);
  console.log(`  Seeds:      ${SEED_DIR}`);
  console.log('');
}

// ============================================================================
// CLI PARSER
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};

  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      parsed[key] = value || true;
    } else {
      parsed.command = arg;
    }
  });

  return parsed;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = parseArgs();
  const command = args.command || args._;

  console.log('🚀 My-Financify Migration Tool v1.0.0\n');

  switch (command) {
    case 'create':
      await createMigration(args.name, args.description);
      break;

    case 'list':
      listMigrations();
      break;

    case 'status':
      showStatus();
      break;

    default:
      console.log('Usage:');
      console.log('  npm run migrate:create -- --name="migration_name" [--description="..."]');
      console.log('  npm run migrate:list');
      console.log('  npm run migrate:status');
      console.log('');
      console.log('Examples:');
      console.log('  npm run migrate:create -- --name="add_user_preferences"');
      console.log('  npm run migrate:create -- --name="add_analytics" --description="Add analytics tables"');
      process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
