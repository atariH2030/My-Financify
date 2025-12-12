# ====================================
# COMANDOS PARA APLICAR MIGRATIONS
# Copie e cole no PowerShell
# ====================================

# ============================================
# PASSO 1: MIGRATION 1 - Tabelas Workspace
# ============================================

Write-Host "`n[1/2] Aplicando Migration 1: Tabelas Workspace..." -ForegroundColor Cyan
supabase db execute --file supabase\migrations\003_multi_workspace_system.sql

# Se der erro, pare aqui e avise

# ============================================
# PASSO 2: MIGRATION 2 - RLS Policies
# ============================================

Write-Host "`n[2/2] Aplicando Migration 2: RLS Policies..." -ForegroundColor Cyan
supabase db execute --file supabase\migrations\add_workspace_rls_policies.sql

# ============================================
# FIM - Verificar Sucesso
# ============================================

Write-Host "`n✅ MIGRATIONS APLICADAS!" -ForegroundColor Green
Write-Host "Próximo passo: npm run dev" -ForegroundColor Yellow
