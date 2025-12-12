# 🚀 Sistema Profissional de Database Migrations

**Versão**: 1.0.0  
**Data**: 10/12/2025  
**Autor**: DEV - Rickson

---

## 📋 VISÃO GERAL

Sistema enterprise-grade de gerenciamento de migrations de banco de dados com:

- ✅ **Versionamento automático**
- ✅ **Validação SQL antes de aplicar**
- ✅ **Rollback seguro**
- ✅ **Múltiplos ambientes** (dev/staging/prod)
- ✅ **CI/CD integrado** (GitHub Actions)
- ✅ **Backup automático** antes de deployments
- ✅ **Logs detalhados** de execução

---

## 🏗️ ARQUITETURA

### Estrutura de Pastas

```
My-Financify/
├── .github/
│   └── workflows/
│       └── database-migrations.yml    # CI/CD automático
│
├── supabase/
│   ├── schema.sql                     # Schema base
│   └── migrations/
│       ├── 20251210_120000_add_workspace_rls.sql
│       ├── 20251211_140000_add_analytics.sql
│       ├── rollback/
│       │   ├── 20251210_120000_add_workspace_rls_rollback.sql
│       │   └── 20251211_140000_add_analytics_rollback.sql
│       └── seed/
│           └── dev_seed_data.sql
│
├── scripts/
│   └── migrations/
│       └── migrate.js                 # CLI tool
│
└── src/
    └── services/
        └── migration-manager.service.ts  # Manager principal
```

---

## 🎯 AMBIENTES

### 1. **DEVELOPMENT** (localhost)
- **URL**: http://localhost:5173
- **Supabase**: Projeto DEV
- **Comportamento**: Auto-apply migrations
- **Validação**: Básica
- **Rollback**: Disponível

### 2. **STAGING** (preview)
- **URL**: https://staging.financify.com
- **Supabase**: Projeto STAGING
- **Comportamento**: Manual review + approval
- **Validação**: Completa + dry-run
- **Backup**: Obrigatório antes de aplicar
- **Rollback**: Disponível

### 3. **PRODUCTION** (live)
- **URL**: https://app.financify.com
- **Supabase**: Projeto PRODUCTION
- **Comportamento**: Manual approval + 2FA
- **Validação**: Máxima + dry-run + testes
- **Backup**: Automático (retido por 30 dias)
- **Rollback**: Automático se falhar

---

## 🛠️ COMANDOS DISPONÍVEIS

### 1. Criar Nova Migration

```bash
npm run migrate:create -- --name="add_user_preferences"
```

**Com descrição**:
```bash
npm run migrate:create -- --name="add_analytics_tables" --description="Adiciona tabelas para analytics"
```

**Resultado**:
- Cria arquivo: `supabase/migrations/YYYYMMDD_HHMMSS_add_user_preferences.sql`
- Cria rollback: `supabase/migrations/rollback/YYYYMMDD_HHMMSS_add_user_preferences_rollback.sql`

---

### 2. Listar Migrations

```bash
npm run migrate:list
```

**Output**:
```
📊 Available Migrations:

1. [20251210_120000] add_workspace_rls
2. [20251211_140000] add_analytics_tables
3. [20251212_090000] add_user_preferences
```

---

### 3. Ver Status

```bash
npm run migrate:status
```

**Output**:
```
📊 Migration Status:

Total Migrations: 3
Total Rollbacks:  3

📁 Directories:
  Migrations: C:\...\supabase\migrations
  Rollbacks:  C:\...\supabase\migrations\rollback
  Seeds:      C:\...\supabase\migrations\seed
```

---

## 📝 WORKFLOW COMPLETO

### FASE 1: DESENVOLVIMENTO LOCAL

#### Passo 1: Criar Migration
```bash
npm run migrate:create -- --name="add_workspace_rls"
```

#### Passo 2: Editar SQL
Abrir arquivo gerado e implementar:

**Migration (UP)**:
```sql
-- supabase/migrations/20251210_120000_add_workspace_rls.sql

CREATE TABLE IF NOT EXISTS public.workspace_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.workspace_settings ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Users can view workspace settings"
ON public.workspace_settings FOR SELECT
USING (is_workspace_member(workspace_id));
```

**Rollback (DOWN)**:
```sql
-- supabase/migrations/rollback/20251210_120000_add_workspace_rls_rollback.sql

DROP POLICY IF EXISTS "Users can view workspace settings" ON public.workspace_settings;
DROP TABLE IF EXISTS public.workspace_settings;
```

#### Passo 3: Testar Localmente
```bash
# Aplicar migration no Supabase local/dev
# (Abrir SQL Editor no Supabase Dashboard)
# Copiar SQL e executar
```

#### Passo 4: Validar
```bash
npm run build  # Verificar se não quebrou nada
npm run test   # Rodar testes
```

---

### FASE 2: COMMIT E PUSH

```bash
git add supabase/migrations/
git commit -m "feat: add workspace RLS policies"
git push origin develop
```

**GitHub Actions irá**:
1. ✅ Validar SQL (linter)
2. ✅ Verificar operações perigosas
3. ✅ Validar naming
4. ✅ Rodar dry-run em DB de teste
5. ✅ Auto-deploy para DEVELOPMENT

---

### FASE 3: STAGING (PRÉ-PRODUÇÃO)

#### Criar Pull Request
```bash
# Criar PR: develop → staging
```

**GitHub Actions irá**:
1. ✅ Rodar todos os testes
2. ✅ Dry-run em DB PostgreSQL temporária
3. ✅ Verificar integridade
4. ⏸️ **AGUARDAR APROVAÇÃO MANUAL**

#### Aprovar Deploy
1. Revisar PR
2. Aprovar workflow manualmente
3. GitHub Actions:
   - 💾 Faz backup do STAGING
   - 🚀 Aplica migrations
   - ✅ Valida sucesso

---

### FASE 4: PRODUCTION (LIVE)

#### Merge para Main
```bash
# Após validar no staging:
git checkout main
git merge staging
git push origin main
```

**GitHub Actions irá**:
1. ⏸️ **REQUER APROVAÇÃO MANUAL** (environment protection)
2. 💾 Backup automático do PRODUCTION (retido 30 dias)
3. 🚀 Aplica migrations
4. ✅ Valida sucesso
5. ⏮️ **Se falhar**: Rollback automático

---

## 🔐 REGRAS DE VALIDAÇÃO

### Automáticas (Bloqueantes)

O sistema **rejeita automaticamente**:

❌ `DROP DATABASE`  
❌ `DROP SCHEMA`  
❌ `TRUNCATE` sem `WHERE`  
❌ `DELETE FROM table` sem `WHERE`  
❌ `CREATE TABLE` sem `IF NOT EXISTS`  
❌ `DROP TABLE` sem `IF EXISTS`  
❌ Filenames inválidos (devem ser `YYYYMMDD_HHMMSS_name.sql`)

### Manuais (Require Review)

⚠️ Modificações em tabelas críticas  
⚠️ Alterações em RLS policies de produção  
⚠️ Mudanças de schema que afetam dados existentes

---

## 🔄 ROLLBACK

### Automático
Se deployment em **PRODUCTION** falhar, rollback é **automático**.

### Manual
```bash
# 1. Identificar versão
npm run migrate:list

# 2. Aplicar rollback no Supabase SQL Editor
# Copiar conteúdo de: supabase/migrations/rollback/VERSION_rollback.sql
# Executar no ambiente desejado
```

---

## 📊 MONITORAMENTO

### Verificar Histórico de Migrations

**SQL Query no Supabase**:
```sql
SELECT 
  version,
  name,
  environment,
  status,
  applied_at,
  execution_time
FROM public.migration_history
ORDER BY applied_at DESC
LIMIT 20;
```

### Verificar Última Migration Aplicada

```sql
SELECT * FROM public.migration_history
WHERE status = 'applied'
ORDER BY applied_at DESC
LIMIT 1;
```

---

## 🚨 TROUBLESHOOTING

### Migration Falhou no CI/CD

**Sintomas**: GitHub Actions falha na validação

**Solução**:
1. Verificar logs do workflow
2. Corrigir SQL localmente
3. Re-commit e push

### Migration Aplicada mas App Quebrou

**Solução**:
1. Identificar versão problemática
2. Aplicar rollback:
   ```sql
   -- Executar rollback SQL no Supabase
   ```
3. Corrigir migration
4. Re-deploy

### Conflito de Versões

**Sintomas**: Duas migrations com mesmo timestamp

**Solução**:
1. Renomear arquivo manualmente:
   ```bash
   mv 20251210_120000_name.sql 20251210_120001_name.sql
   ```
2. Atualizar rollback correspondente

---

## 🎯 BOAS PRÁTICAS

### ✅ FAÇA

- ✅ Use `IF EXISTS` / `IF NOT EXISTS`
- ✅ Teste localmente antes de commit
- ✅ Escreva rollback junto com migration
- ✅ Use nomes descritivos (`add_user_analytics`, não `migration1`)
- ✅ Documente mudanças complexas com comentários SQL
- ✅ Valide impacto em dados existentes
- ✅ Faça backup manual antes de mudanças críticas

### ❌ NÃO FAÇA

- ❌ Modificar migrations já aplicadas em prod
- ❌ Deletar dados sem confirmação
- ❌ Usar `TRUNCATE` ou `DELETE` sem `WHERE`
- ❌ Deploy direto para prod sem testar em staging
- ❌ Ignorar erros de validação
- ❌ Esquecer de criar rollback

---

## 📦 SECRETS NECESSÁRIOS (GitHub)

Configure no GitHub Repository Settings → Secrets:

### Development
- `SUPABASE_DEV_PROJECT_ID`
- `SUPABASE_DEV_DB_PASSWORD`

### Staging
- `SUPABASE_STAGING_PROJECT_ID`
- `SUPABASE_STAGING_DB_PASSWORD`

### Production
- `SUPABASE_PROD_PROJECT_ID`
- `SUPABASE_PROD_DB_PASSWORD`

### Global
- `SUPABASE_ACCESS_TOKEN` (Supabase CLI token)

---

## 🔧 CONFIGURAÇÃO INICIAL

### 1. Instalar Supabase CLI

```bash
npm install -g supabase
```

### 2. Login no Supabase

```bash
supabase login
```

### 3. Inicializar Migration History Table

Execute uma vez em cada ambiente:

```sql
-- Copiar e executar no Supabase SQL Editor
-- (Migration Manager criará automaticamente na primeira execução)
```

### 4. Configurar GitHub Secrets

1. Ir para: GitHub → Settings → Secrets and variables → Actions
2. Adicionar todos os secrets listados acima

---

## 📈 ROADMAP FUTURO

- [ ] Suporte a branches de feature com DBs isoladas
- [ ] Dashboard web para visualizar migrations
- [ ] Integração com Slack/Discord para notificações
- [ ] Testes automatizados de schema integrity
- [ ] Migrations reverter automático após X tempo
- [ ] Suporte a blue-green deployments

---

## 📞 SUPORTE

**Problemas com migrations?**
1. Verificar logs no GitHub Actions
2. Consultar este guia
3. Abrir issue no repositório

---

**Última Atualização**: 10/12/2025  
**Autor**: DEV - Rickson  
**Versão**: 1.0.0
