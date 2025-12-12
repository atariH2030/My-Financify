# 🚀 Quick Start - Database Migrations System

## ⚡ TL;DR

```bash
# 1. Criar nova migration
npm run migrate:create -- --name="add_feature"

# 2. Editar SQL gerado em:
#    supabase/migrations/TIMESTAMP_add_feature.sql

# 3. Commit e push
git add . && git commit -m "feat: add feature" && git push

# 4. GitHub Actions faz o resto! ✨
```

---

## 📦 Setup Inicial (Uma Vez)

### 1. Configurar Ambientes no Supabase

Criar 3 projetos no [Supabase Dashboard](https://app.supabase.com):
- `my-financify-dev` (Development)
- `my-financify-staging` (Staging)  
- `my-financify-prod` (Production)

### 2. Configurar GitHub Secrets

GitHub → Settings → Secrets → Actions → New repository secret

Adicionar:
```
SUPABASE_ACCESS_TOKEN
SUPABASE_DEV_PROJECT_ID
SUPABASE_DEV_DB_PASSWORD
SUPABASE_STAGING_PROJECT_ID
SUPABASE_STAGING_DB_PASSWORD
SUPABASE_PROD_PROJECT_ID
SUPABASE_PROD_DB_PASSWORD
```

### 3. Criar .env.local

```bash
cp .env.example .env.local
# Preencher com suas credenciais
```

---

## 🎯 Uso Diário

### Criar Migration

```bash
npm run migrate:create -- --name="add_analytics_table"
```

### Editar Migration

Abrir arquivo gerado em `supabase/migrations/TIMESTAMP_add_analytics_table.sql`:

```sql
CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Editar Rollback

Abrir `supabase/migrations/rollback/TIMESTAMP_add_analytics_table_rollback.sql`:

```sql
DROP TABLE IF EXISTS public.analytics;
```

### Commit

```bash
git add supabase/migrations/
git commit -m "feat: add analytics table"
git push origin develop
```

### GitHub Actions Auto-Deploy

- ✅ **develop** → Development (automático)
- ⏸️ **staging** → Staging (aprovação manual)
- ⏸️ **main** → Production (aprovação manual + backup)

---

## 🔄 Workflow

```
┌─────────────┐
│   Develop   │ → commit → GitHub Actions
└─────────────┘              │
                             ├── Validate SQL
                             ├── Test (dry-run)
                             └── Deploy to DEV ✅
                             
┌─────────────┐
│   Staging   │ → merge → GitHub Actions
└─────────────┘             │
                            ├── Backup DB 💾
                            ├── Deploy to STAGING
                            └── Wait approval ⏸️
                            
┌─────────────┐
│     Main    │ → merge → GitHub Actions
└─────────────┘             │
                            ├── Backup DB 💾 (30 dias)
                            ├── Deploy to PROD
                            ├── Wait approval ⏸️
                            └── Auto-rollback if fails ⏮️
```

---

## 📚 Documentação Completa

- **[DATABASE_MIGRATIONS_GUIDE.md](./DATABASE_MIGRATIONS_GUIDE.md)** - Guia completo
- **[WORKSPACE_TESTING_GUIDE.md](./WORKSPACE_TESTING_GUIDE.md)** - Testes do workspace system

---

## 🛡️ Segurança

### ✅ O Sistema BLOQUEIA Automaticamente:

- ❌ `DROP DATABASE`
- ❌ `DROP SCHEMA`  
- ❌ `TRUNCATE` sem WHERE
- ❌ `DELETE` sem WHERE
- ❌ Migrations sem `IF EXISTS`/`IF NOT EXISTS`

### ⚠️ Require Manual Review:

- Mudanças em tabelas críticas
- Alterações de RLS em produção
- Migrations que afetam dados existentes

---

## 🚨 Emergency Rollback

Se algo der errado em **PRODUCTION**:

1. **Automático**: GitHub Actions reverte automaticamente se falhar
2. **Manual**:
   ```sql
   -- Abrir Supabase SQL Editor
   -- Copiar SQL de: supabase/migrations/rollback/VERSION_rollback.sql
   -- Executar
   ```

---

## ✨ Features

- ✅ Versionamento SHA-256
- ✅ Histórico completo de migrations
- ✅ Validação SQL automática
- ✅ Dry-run antes de aplicar
- ✅ Backup automático (prod)
- ✅ Rollback automático (se falhar)
- ✅ Logs detalhados
- ✅ Multi-ambiente

---

## 📞 Ajuda

**Problemas?**
1. Ver logs: GitHub Actions → Workflow runs
2. Consultar: `docs/DATABASE_MIGRATIONS_GUIDE.md`
3. Abrir issue no repo

---

**Criado por**: DEV - Rickson  
**Versão**: 1.0.0  
**Data**: 10/12/2025
