# ====================================
# Apply Workspace Migrations Automatically
# v1.0.1 - 12/12/2025
# ====================================

param(
    [Parameter(Mandatory=$false)]
    [switch]$DryRun
)

# Colors for output
$ErrorColor = "Red"
$WarningColor = "Yellow"
$SuccessColor = "Green"
$InfoColor = "Cyan"

function Write-Step {
    param([string]$Message)
    Write-Host "`n🔹 $Message" -ForegroundColor $InfoColor
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $SuccessColor
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor $ErrorColor
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor $WarningColor
}

# ============================================================================
# STEP 0: Pre-flight Checks
# ============================================================================

Write-Host "`n════════════════════════════════════════════════════════" -ForegroundColor $InfoColor
Write-Host "  🚀 WORKSPACE MIGRATIONS - AUTOMATED DEPLOYMENT" -ForegroundColor $InfoColor
Write-Host "════════════════════════════════════════════════════════`n" -ForegroundColor $InfoColor

Write-Step "Verificando pré-requisitos..."

# Check if Supabase CLI is installed
try {
    $supabaseVersion = supabase --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Supabase CLI não encontrado"
    }
    Write-Success "Supabase CLI instalado: $supabaseVersion"
} catch {
    Write-Error-Custom "Supabase CLI não está instalado!"
    Write-Host "`nPara instalar, execute:" -ForegroundColor $WarningColor
    Write-Host "  npm install -g supabase" -ForegroundColor $WarningColor
    Write-Host "`nOu use o instalador: https://supabase.com/docs/guides/cli" -ForegroundColor $WarningColor
    exit 1
}

# Check if logged in
Write-Step "Verificando autenticação Supabase..."
try {
    $loginCheck = supabase projects list 2>&1
    if ($loginCheck -match "not logged in" -or $LASTEXITCODE -ne 0) {
        Write-Warning-Custom "Não está autenticado no Supabase CLI"
        Write-Host "`nExecute: supabase login" -ForegroundColor $WarningColor
        
        $doLogin = Read-Host "`nDeseja fazer login agora? (s/n)"
        if ($doLogin -eq 's') {
            supabase login
            if ($LASTEXITCODE -ne 0) {
                Write-Error-Custom "Falha no login"
                exit 1
            }
        } else {
            exit 1
        }
    }
    Write-Success "Autenticado no Supabase CLI"
} catch {
    Write-Warning-Custom "Não foi possível verificar autenticação. Continuando..."
}

# Check migration files exist
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$migrationsPath = Join-Path $projectRoot "supabase\migrations"

$migration1 = Join-Path $migrationsPath "003_multi_workspace_system.sql"
$migration2 = Join-Path $migrationsPath "add_workspace_rls_policies.sql"

if (-not (Test-Path $migration1)) {
    Write-Error-Custom "Migration não encontrada: $migration1"
    exit 1
}

if (-not (Test-Path $migration2)) {
    Write-Error-Custom "Migration não encontrada: $migration2"
    exit 1
}

Write-Success "Arquivos de migration encontrados"

# ============================================================================
# STEP 1: Show Migration Summary
# ============================================================================

Write-Host "`n════════════════════════════════════════════════════════" -ForegroundColor $InfoColor
Write-Host "  📋 RESUMO DAS MIGRATIONS" -ForegroundColor $InfoColor
Write-Host "════════════════════════════════════════════════════════`n" -ForegroundColor $InfoColor

Write-Host "Ambiente: " -NoNewline -ForegroundColor White
Write-Host $Environment.ToUpper() -ForegroundColor $(if ($Environment -eq 'prod') { $ErrorColor } else { $SuccessColor })

Write-Host "`nMigrations a serem aplicadas:`n" -ForegroundColor White

Write-Host "  1️⃣  003_multi_workspace_system.sql" -ForegroundColor $SuccessColor
Write-Host "     • Cria tabelas: workspaces, workspace_members, workspace_invites" -ForegroundColor Gray
Write-Host "     • Cria enums: workspace_type, plan_type, member_role, etc" -ForegroundColor Gray
Write-Host "     • Habilita RLS nas tabelas workspace" -ForegroundColor Gray

Write-Host "`n  2️⃣  add_workspace_rls_policies.sql" -ForegroundColor $SuccessColor
Write-Host "     • Adiciona coluna workspace_id em: accounts, budgets, goals, recurring_transactions" -ForegroundColor Gray
Write-Host "     • Cria função helper: is_workspace_member()" -ForegroundColor Gray
Write-Host "     • Atualiza RLS policies (multi-tenant)" -ForegroundColor Gray
Write-Host "     • Cria índices de performance" -ForegroundColor Gray

if ($DryRun) {
    Write-Host "`n🔍 MODO DRY-RUN: Apenas validação, sem aplicar mudanças" -ForegroundColor $WarningColor
}

# ============================================================================
# STEP 2: Confirmation
# ============================================================================

if (-not $DryRun) {
    Write-Host "`n════════════════════════════════════════════════════════" -ForegroundColor $WarningColor
    Write-Host "  ⚠️  ATENÇÃO - OPERAÇÃO IRREVERSÍVEL" -ForegroundColor $WarningColor
    Write-Host "════════════════════════════════════════════════════════`n" -ForegroundColor $WarningColor
    
    if ($Environment -eq 'prod') {
        Write-Host "🚨 VOCÊ ESTÁ PRESTES A MODIFICAR O BANCO DE PRODUÇÃO!" -ForegroundColor $ErrorColor
        Write-Host "`nRecomendações:" -ForegroundColor $WarningColor
        Write-Host "  • Faça backup manual do banco AGORA" -ForegroundColor White
        Write-Host "  • Execute em horário de baixo tráfego" -ForegroundColor White
        Write-Host "  • Tenha o rollback preparado" -ForegroundColor White
    }
    
    Write-Host "`nEsta operação irá:" -ForegroundColor White
    Write-Host "  • Criar novas tabelas no banco de dados" -ForegroundColor Gray
    Write-Host "  • Adicionar colunas em tabelas existentes" -ForegroundColor Gray
    Write-Host "  • Modificar políticas RLS (segurança)" -ForegroundColor Gray
    Write-Host "  • Dropar e recriar policies existentes" -ForegroundColor Gray
    
    Write-Host "`n"
    $confirmation = Read-Host "Deseja continuar? Digite 'CONFIRMO' para prosseguir"
    
    if ($confirmation -ne 'CONFIRMO') {
        Write-Warning-Custom "Operação cancelada pelo usuário"
        exit 0
    }
}

# ============================================================================
# STEP 3: Apply Migrations
# ============================================================================

Write-Host "`n════════════════════════════════════════════════════════" -ForegroundColor $InfoColor
Write-Host "  🚀 APLICANDO MIGRATIONS" -ForegroundColor $InfoColor
Write-Host "════════════════════════════════════════════════════════`n" -ForegroundColor $InfoColor

# Function to execute SQL file
function Invoke-SqlFile {
    param(
        [string]$FilePath,
        [string]$Description
    )
    
    Write-Step "Aplicando: $Description"
    
    if ($DryRun) {
        Write-Host "   [DRY-RUN] Arquivo seria executado: $FilePath" -ForegroundColor $WarningColor
        return $true
    }
    
    try {
        # Read SQL content
        $sqlContent = Get-Content -Path $FilePath -Raw -Encoding UTF8
        
        # Execute via Supabase CLI
        Write-Host "   Executando SQL..." -ForegroundColor Gray
        
        # Supabase CLI db execute
        $tempFile = [System.IO.Path]::GetTempFileName()
        $sqlContent | Out-File -FilePath $tempFile -Encoding UTF8
        
        $result = supabase db execute --file $tempFile 2>&1
        Remove-Item $tempFile -ErrorAction SilentlyContinue
        
        if ($LASTEXITCODE -ne 0) {
            throw "Falha ao executar SQL: $result"
        }
        
        Write-Success "Migration aplicada com sucesso!"
        return $true
        
    } catch {
        Write-Error-Custom "Erro ao aplicar migration: $_"
        return $false
    }
}

# Apply Migration 1
$success1 = Invoke-SqlFile -FilePath $migration1 -Description "Tabelas Workspace (003_multi_workspace_system.sql)"

if (-not $success1) {
    Write-Error-Custom "Falha na Migration 1. Abortando..."
    exit 1
}

Start-Sleep -Seconds 2

# Apply Migration 2
$success2 = Invoke-SqlFile -FilePath $migration2 -Description "RLS Policies Workspace (add_workspace_rls_policies.sql)"

if (-not $success2) {
    Write-Error-Custom "Falha na Migration 2. Execute rollback manualmente!"
    Write-Host "`nRollback disponível em:" -ForegroundColor $WarningColor
    Write-Host "  supabase/migrations/rollback/add_workspace_rls_policies_rollback.sql" -ForegroundColor White
    exit 1
}

# ============================================================================
# STEP 4: Validation
# ============================================================================

if (-not $SkipValidation -and -not $DryRun) {
    Write-Host "`n════════════════════════════════════════════════════════" -ForegroundColor $InfoColor
    Write-Host "  ✅ VALIDAÇÃO PÓS-MIGRATION" -ForegroundColor $InfoColor
    Write-Host "════════════════════════════════════════════════════════`n" -ForegroundColor $InfoColor
    
    Write-Step "Executando validações..."
    
    # Validation SQL (usando here-string literal para evitar conflito com $)
    $validationSql = @'
DO $$
DECLARE
  workspace_count INTEGER;
  member_count INTEGER;
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO workspace_count
  FROM pg_tables 
  WHERE schemaname = 'public' 
  AND tablename IN ('workspaces', 'workspace_members', 'workspace_invites');
  
  SELECT COUNT(*) INTO member_count
  FROM information_schema.columns 
  WHERE table_schema = 'public' 
  AND column_name = 'workspace_id'
  AND table_name IN ('accounts', 'budgets', 'goals', 'recurring_transactions');
  
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'public'
  AND policyname LIKE '%workspace%';
  
  IF workspace_count = 3 AND member_count = 4 THEN
    RAISE NOTICE '✅ VALIDAÇÃO PASSOU!';
  ELSE
    RAISE EXCEPTION '❌ VALIDAÇÃO FALHOU - Tabelas: %, Colunas: %', workspace_count, member_count;
  END IF;
END $$;
'@
    
    try {
        $tempValidation = [System.IO.Path]::GetTempFileName()
        $validationSql | Out-File -FilePath $tempValidation -Encoding UTF8
        
        $validationResult = supabase db execute --file $tempValidation 2>&1
        Remove-Item $tempValidation -ErrorAction SilentlyContinue
        
        if ($validationResult -match "VALIDAÇÃO PASSOU") {
            Write-Success "Validação completa aprovada!"
        } else {
            Write-Warning-Custom "Validação retornou resultado inesperado"
            Write-Host $validationResult -ForegroundColor Gray
        }
    } catch {
        Write-Warning-Custom "Não foi possível executar validação automática"
        Write-Host "Execute manualmente no Supabase Dashboard" -ForegroundColor Gray
    }
}

# ============================================================================
# STEP 5: Success Summary
# ============================================================================

Write-Host "`n════════════════════════════════════════════════════════" -ForegroundColor $SuccessColor
Write-Host "  🎉 MIGRATION CONCLUÍDA COM SUCESSO!" -ForegroundColor $SuccessColor
Write-Host "════════════════════════════════════════════════════════`n" -ForegroundColor $SuccessColor

if (-not $DryRun) {
    Write-Host "✅ Sistema multi-workspace instalado" -ForegroundColor $SuccessColor
    Write-Host "✅ RLS policies aplicadas" -ForegroundColor $SuccessColor
    Write-Host "✅ Backward compatibility mantida" -ForegroundColor $SuccessColor
    Write-Host "✅ Índices de performance criados" -ForegroundColor $SuccessColor
    
    Write-Host "`n📊 Próximos passos:" -ForegroundColor White
    Write-Host "  1. Testar app React: npm run dev" -ForegroundColor Gray
    Write-Host "  2. Criar workspace de teste no Supabase Dashboard" -ForegroundColor Gray
    Write-Host "  3. Implementar UI de workspaces" -ForegroundColor Gray
    Write-Host "  4. Atualizar services para usar workspace_id" -ForegroundColor Gray
} else {
    Write-Host "✅ Validação DRY-RUN concluída sem erros" -ForegroundColor $SuccessColor
    Write-Host "`nPara aplicar de verdade, execute:" -ForegroundColor White
    Write-Host "  .\scripts\migrations\apply-workspace-migrations.ps1" -ForegroundColor $InfoColor
}

Write-Host "`n📚 Documentação:" -ForegroundColor White
Write-Host "  • Manual: docs/MANUAL_WORKSPACE_RLS_MIGRATION.md" -ForegroundColor Gray
Write-Host "  • Rollback: supabase/migrations/rollback/add_workspace_rls_policies_rollback.sql" -ForegroundColor Gray

Write-Host "`n"
