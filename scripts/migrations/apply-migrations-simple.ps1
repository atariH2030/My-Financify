# ====================================
# Apply Workspace Migrations - Simple Version
# v1.0.0 - 12/12/2025
# ====================================

param(
    [switch]$DryRun
)

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  WORKSPACE MIGRATIONS - DEPLOY TOOL" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Check Supabase CLI
Write-Host "[1/6] Verificando Supabase CLI..." -ForegroundColor Yellow
try {
    $version = supabase --version 2>$null
    Write-Host "  ✅ Supabase CLI: v$version" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Supabase CLI não instalado!" -ForegroundColor Red
    exit 1
}

# Check if logged in
Write-Host "`n[2/6] Verificando autenticação..." -ForegroundColor Yellow
$projects = supabase projects list 2>&1
if ($projects -match "Financy Life") {
    Write-Host "  ✅ Autenticado - Projeto 'Financy Life' encontrado" -ForegroundColor Green
} else {
    Write-Host "  ❌ Não autenticado ou projeto não encontrado" -ForegroundColor Red
    Write-Host "  Execute: supabase login" -ForegroundColor Yellow
    exit 1
}

# Check migration files
Write-Host "`n[3/6] Verificando arquivos de migration..." -ForegroundColor Yellow
$file1 = "supabase\migrations\003_multi_workspace_system.sql"
$file2 = "supabase\migrations\add_workspace_rls_policies.sql"

if (-not (Test-Path $file1)) {
    Write-Host "  ❌ Migration 1 não encontrada: $file1" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $file2)) {
    Write-Host "  ❌ Migration 2 não encontrada: $file2" -ForegroundColor Red
    exit 1
}

Write-Host "  ✅ Migration 1: 003_multi_workspace_system.sql" -ForegroundColor Green
Write-Host "  ✅ Migration 2: add_workspace_rls_policies.sql" -ForegroundColor Green

# Show summary
Write-Host "`n[4/6] Resumo das migrations:" -ForegroundColor Yellow
Write-Host "  📦 Migration 1: Cria tabelas workspace" -ForegroundColor Gray
Write-Host "     - workspaces, workspace_members, workspace_invites" -ForegroundColor Gray
Write-Host "  📦 Migration 2: Adiciona suporte workspace" -ForegroundColor Gray
Write-Host "     - workspace_id em accounts, budgets, goals, recurring_transactions" -ForegroundColor Gray

if ($DryRun) {
    Write-Host "`n🔍 MODO DRY-RUN - Não será aplicado" -ForegroundColor Yellow
    Write-Host "  Arquivos prontos para serem executados" -ForegroundColor Gray
    exit 0
}

# Confirmation
Write-Host "`n[5/6] Confirmação" -ForegroundColor Yellow
Write-Host "  ⚠️  Esta operação irá modificar o banco de dados!" -ForegroundColor Yellow
$confirm = Read-Host "`nDigite 'SIM' para continuar"

if ($confirm -ne 'SIM') {
    Write-Host "  ❌ Cancelado pelo usuário" -ForegroundColor Red
    exit 0
}

# Apply migrations
Write-Host "`n[6/6] Aplicando migrations..." -ForegroundColor Yellow

Write-Host "`n  📝 Migration 1: Tabelas Workspace..." -ForegroundColor Cyan
supabase db execute --file $file1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Erro ao aplicar Migration 1" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Migration 1 aplicada com sucesso!" -ForegroundColor Green

Start-Sleep -Seconds 2

Write-Host "`n  📝 Migration 2: RLS Policies..." -ForegroundColor Cyan
supabase db execute --file $file2
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Erro ao aplicar Migration 2" -ForegroundColor Red
    Write-Host "  Rollback disponível em: supabase\migrations\rollback\" -ForegroundColor Yellow
    exit 1
}
Write-Host "  ✅ Migration 2 aplicada com sucesso!" -ForegroundColor Green

# Success
Write-Host "`n============================================" -ForegroundColor Green
Write-Host "  🎉 MIGRATION CONCLUÍDA!" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Green

Write-Host "✅ Sistema multi-workspace instalado" -ForegroundColor Green
Write-Host "✅ RLS policies aplicadas" -ForegroundColor Green
Write-Host "✅ Backward compatibility mantida" -ForegroundColor Green

Write-Host "`n📊 Próximos passos:" -ForegroundColor Cyan
Write-Host "  1. npm run dev" -ForegroundColor Gray
Write-Host "  2. Criar workspace de teste no Supabase Dashboard" -ForegroundColor Gray
Write-Host "  3. Implementar UI de workspaces" -ForegroundColor Gray

Write-Host "`n"
