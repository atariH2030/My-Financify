# 🚀 Script de Aplicação Automática de Migrations

**Arquivo**: `apply-workspace-migrations.ps1`  
**Versão**: 1.0.0  
**Autor**: DEV - Rickson

---

## 📋 O QUE ESTE SCRIPT FAZ

Aplica **automaticamente** as migrations de workspace no Supabase, evitando erros manuais:

1. ✅ Verifica pré-requisitos (Supabase CLI, autenticação)
2. ✅ Valida existência dos arquivos de migration
3. ✅ Mostra resumo do que será aplicado
4. ✅ Solicita confirmação (segurança)
5. ✅ Aplica migrations via Supabase CLI
6. ✅ Valida sucesso automaticamente
7. ✅ Mostra próximos passos

---

## ⚡ QUICK START

### Passo 1: Instalar Supabase CLI (se não tiver)

```powershell
npm install -g supabase
```

### Passo 2: Fazer Login no Supabase

```powershell
supabase login
```

### Passo 3: Executar Script

```powershell
# Aplicar em DEV (padrão)
.\scripts\migrations\apply-workspace-migrations.ps1

# Ou especificar ambiente
.\scripts\migrations\apply-workspace-migrations.ps1 -Environment dev
```

### Passo 4: Confirmar

Quando solicitado, digite: **CONFIRMO**

---

## 🎛️ PARÂMETROS

### `-Environment`
Ambiente onde aplicar migrations.

**Valores**: `dev`, `staging`, `prod`  
**Padrão**: `dev`

```powershell
# Development (padrão)
.\scripts\migrations\apply-workspace-migrations.ps1 -Environment dev

# Staging (pré-produção)
.\scripts\migrations\apply-workspace-migrations.ps1 -Environment staging

# Production (CUIDADO!)
.\scripts\migrations\apply-workspace-migrations.ps1 -Environment prod
```

---

### `-DryRun`
Executa validação sem aplicar mudanças.

```powershell
# Apenas testar (sem modificar banco)
.\scripts\migrations\apply-workspace-migrations.ps1 -DryRun
```

**Útil para**:
- Verificar se arquivos existem
- Testar conectividade Supabase CLI
- Simular aplicação sem riscos

---

### `-SkipValidation`
Pula validação pós-migration (mais rápido).

```powershell
# Aplicar sem validar depois
.\scripts\migrations\apply-workspace-migrations.ps1 -SkipValidation
```

**Não recomendado** exceto se você já validou manualmente.

---

## 📝 EXEMPLOS DE USO

### Exemplo 1: Primeira Vez (Desenvolvimento)

```powershell
# 1. Testar sem aplicar
.\scripts\migrations\apply-workspace-migrations.ps1 -DryRun

# 2. Se passou, aplicar de verdade
.\scripts\migrations\apply-workspace-migrations.ps1

# 3. Confirmar quando solicitado
# Digite: CONFIRMO
```

---

### Exemplo 2: Aplicar em Staging

```powershell
# Sempre testar antes
.\scripts\migrations\apply-workspace-migrations.ps1 -Environment staging -DryRun

# Se OK, aplicar
.\scripts\migrations\apply-workspace-migrations.ps1 -Environment staging
```

---

### Exemplo 3: Production (Máxima Cautela)

```powershell
# 1. Fazer backup manual do banco ANTES!

# 2. Dry-run
.\scripts\migrations\apply-workspace-migrations.ps1 -Environment prod -DryRun

# 3. Aplicar em horário de baixo tráfego
.\scripts\migrations\apply-workspace-migrations.ps1 -Environment prod

# 4. Confirmar com "CONFIRMO"
```

---

## 🔍 OUTPUT ESPERADO

### Execução Bem-Sucedida

```
════════════════════════════════════════════════════════
  🚀 WORKSPACE MIGRATIONS - AUTOMATED DEPLOYMENT
════════════════════════════════════════════════════════

🔹 Verificando pré-requisitos...
✅ Supabase CLI instalado: 1.x.x
✅ Autenticado no Supabase CLI
✅ Arquivos de migration encontrados

════════════════════════════════════════════════════════
  📋 RESUMO DAS MIGRATIONS
════════════════════════════════════════════════════════

Ambiente: DEV

Migrations a serem aplicadas:

  1️⃣  003_multi_workspace_system.sql
     • Cria tabelas: workspaces, workspace_members, workspace_invites
     • Cria enums: workspace_type, plan_type, member_role, etc
     • Habilita RLS nas tabelas workspace

  2️⃣  add_workspace_rls_policies.sql
     • Adiciona coluna workspace_id em: accounts, budgets, goals, recurring_transactions
     • Cria função helper: is_workspace_member()
     • Atualiza RLS policies (multi-tenant)
     • Cria índices de performance

════════════════════════════════════════════════════════
  ⚠️  ATENÇÃO - OPERAÇÃO IRREVERSÍVEL
════════════════════════════════════════════════════════

Deseja continuar? Digite 'CONFIRMO' para prosseguir: CONFIRMO

════════════════════════════════════════════════════════
  🚀 APLICANDO MIGRATIONS
════════════════════════════════════════════════════════

🔹 Aplicando: Tabelas Workspace (003_multi_workspace_system.sql)
   Executando SQL...
✅ Migration aplicada com sucesso!

🔹 Aplicando: RLS Policies Workspace (add_workspace_rls_policies.sql)
   Executando SQL...
✅ Migration aplicada com sucesso!

════════════════════════════════════════════════════════
  ✅ VALIDAÇÃO PÓS-MIGRATION
════════════════════════════════════════════════════════

🔹 Executando validações...
✅ Validação completa aprovada!

════════════════════════════════════════════════════════
  🎉 MIGRATION CONCLUÍDA COM SUCESSO!
════════════════════════════════════════════════════════

✅ Sistema multi-workspace instalado
✅ RLS policies aplicadas
✅ Backward compatibility mantida
✅ Índices de performance criados

📊 Próximos passos:
  1. Testar app React: npm run dev
  2. Criar workspace de teste no Supabase Dashboard
  3. Implementar UI de workspaces
  4. Atualizar services para usar workspace_id

📚 Documentação:
  • Manual: docs/MANUAL_WORKSPACE_RLS_MIGRATION.md
  • Rollback: supabase/migrations/rollback/add_workspace_rls_policies_rollback.sql
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Supabase CLI não está instalado"

**Solução**:
```powershell
npm install -g supabase
```

---

### Erro: "not logged in"

**Solução**:
```powershell
supabase login
# Abrirá navegador para autenticar
```

---

### Erro: "Migration não encontrada"

**Causa**: Executando de pasta errada

**Solução**: Execute da raiz do projeto:
```powershell
cd C:\Users\healt_iwewx2y\Downloads\My-Financify
.\scripts\migrations\apply-workspace-migrations.ps1
```

---

### Erro: "Falha ao executar SQL"

**Causa**: Problema no banco (tabela já existe, etc)

**Solução**:
1. Verificar logs do Supabase Dashboard
2. Executar migration manualmente (ver guia manual)
3. Ou aplicar rollback primeiro

---

### Validação Falhou

**Causa**: Migration aplicada parcialmente

**Solução**:
```powershell
# Aplicar rollback
supabase db execute --file supabase/migrations/rollback/add_workspace_rls_policies_rollback.sql

# Tentar novamente
.\scripts\migrations\apply-workspace-migrations.ps1
```

---

## 🔄 ROLLBACK

Se algo der errado após aplicar, execute rollback:

```powershell
# Via Supabase CLI
supabase db execute --file supabase/migrations/rollback/add_workspace_rls_policies_rollback.sql
```

**Ou manualmente** no Supabase Dashboard:
1. SQL Editor → New Query
2. Copiar conteúdo de `rollback/add_workspace_rls_policies_rollback.sql`
3. Run

---

## 📊 LOGS E DEBUGGING

### Habilitar Logs Detalhados

```powershell
# PowerShell verbose mode
$VerbosePreference = "Continue"
.\scripts\migrations\apply-workspace-migrations.ps1
```

### Ver Logs Supabase CLI

```powershell
# Listar projetos (testa conectividade)
supabase projects list

# Ver status do banco
supabase db status
```

---

## ✅ CHECKLIST PÓS-MIGRATION

Após executar script com sucesso:

- [ ] Script retornou "MIGRATION CONCLUÍDA COM SUCESSO"
- [ ] Validação passou
- [ ] Testar app: `npm run dev` (sem erros)
- [ ] Criar workspace de teste no Supabase Dashboard
- [ ] Verificar que contas antigas ainda funcionam (backward compatibility)
- [ ] Commit e push das mudanças

---

## 🎯 PRÓXIMOS PASSOS

1. **Testar App**:
   ```powershell
   npm run dev
   ```

2. **Criar Workspace de Teste** (Supabase Dashboard):
   ```sql
   INSERT INTO workspaces (name, slug, owner_id, type, plan_type)
   VALUES ('Meu Workspace', 'meu-workspace-001', auth.uid(), 'PERSONAL', 'FREE')
   RETURNING *;
   ```

3. **Implementar UI**:
   - `WorkspaceSwitcher.tsx`
   - `WorkspaceSettings.tsx`
   - Atualizar `WorkspaceContext` (métodos CRUD)

4. **Atualizar Services**:
   - Adicionar `workspace_id` em chamadas de API
   - Exemplo: `accountService.create({ ...data, workspace_id })`

---

## 📚 DOCUMENTAÇÃO RELACIONADA

- **Manual Completo**: `docs/MANUAL_WORKSPACE_RLS_MIGRATION.md`
- **Migrations Guide**: `docs/DATABASE_MIGRATIONS_GUIDE.md`
- **Workspace Testing**: `docs/WORKSPACE_TESTING_GUIDE.md`
- **Changelog**: `docs/CHANGELOG_v3.15.0.md`

---

## ⚙️ CONFIGURAÇÃO AVANÇADA

### Usar Projeto Supabase Específico

```powershell
# Listar projetos
supabase projects list

# Linkar projeto
supabase link --project-ref YOUR_PROJECT_REF

# Aplicar migration
.\scripts\migrations\apply-workspace-migrations.ps1
```

### Executar com Timeout Customizado

Se migrations grandes demorarem muito:

```powershell
# Aumentar timeout no código (linha ~150)
# Ou executar manualmente via Dashboard
```

---

**Última Atualização**: 12/12/2025  
**Versão**: 1.0.0  
**Autor**: DEV - Rickson
