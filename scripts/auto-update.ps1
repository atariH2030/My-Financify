# ====================================
# Auto Update & Health Check Script
# Atualiza dependências e verifica saúde
# ====================================

param(
    [switch]$SkipTests,
    [switch]$Force
)

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  🔄 AUTO UPDATE & HEALTH CHECK" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# STEP 1: Git Status
Write-Host "[1/7] Verificando Git..." -ForegroundColor Yellow
git fetch origin
$behind = git rev-list HEAD..origin/main --count 2>$null

if ($behind -gt 0) {
    Write-Host "  ⚠️  Você está $behind commits atrás do remoto" -ForegroundColor Yellow
    
    if (-not $Force) {
        $pull = Read-Host "Deseja fazer pull? (s/n)"
        if ($pull -eq 's') {
            git pull origin main
        }
    } else {
        git pull origin main
    }
} else {
    Write-Host "  ✅ Git atualizado" -ForegroundColor Green
}

# STEP 2: NPM Outdated
Write-Host "`n[2/7] Verificando pacotes desatualizados..." -ForegroundColor Yellow
$outdated = npm outdated --json 2>$null | ConvertFrom-Json

if ($outdated) {
    Write-Host "  📦 Pacotes desatualizados encontrados:" -ForegroundColor Yellow
    npm outdated
    
    if (-not $Force) {
        $update = Read-Host "`nDeseja atualizar? (s/n)"
        if ($update -eq 's') {
            npm update
        }
    } else {
        npm update
    }
} else {
    Write-Host "  ✅ Todos os pacotes atualizados" -ForegroundColor Green
}

# STEP 3: Security Audit
Write-Host "`n[3/7] Verificando vulnerabilidades..." -ForegroundColor Yellow
npm audit --audit-level=moderate

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ⚠️  Vulnerabilidades encontradas" -ForegroundColor Yellow
    $fix = Read-Host "Tentar corrigir automaticamente? (s/n)"
    if ($fix -eq 's') {
        npm audit fix
    }
} else {
    Write-Host "  ✅ Nenhuma vulnerabilidade crítica" -ForegroundColor Green
}

# STEP 4: Build
Write-Host "`n[4/7] Testando build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Build falhou!" -ForegroundColor Red
    exit 1
} else {
    Write-Host "  ✅ Build sucesso" -ForegroundColor Green
}

# STEP 5: Tests (opcional)
if (-not $SkipTests) {
    Write-Host "`n[5/7] Executando testes..." -ForegroundColor Yellow
    npm run test:run
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ⚠️  Alguns testes falharam" -ForegroundColor Yellow
    } else {
        Write-Host "  ✅ Todos os testes passaram" -ForegroundColor Green
    }
} else {
    Write-Host "`n[5/7] Testes pulados" -ForegroundColor Gray
}

# STEP 6: Supabase Health
Write-Host "`n[6/7] Verificando Supabase..." -ForegroundColor Yellow
$supabaseProjects = supabase projects list 2>&1

if ($supabaseProjects -match "Financy Life") {
    Write-Host "  ✅ Supabase conectado - Projeto 'Financy Life'" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Supabase não conectado ou projeto não encontrado" -ForegroundColor Yellow
}

# STEP 7: Summary
Write-Host "`n[7/7] Resumo" -ForegroundColor Yellow
Write-Host "  📊 Versão Node: $(node --version)" -ForegroundColor Gray
Write-Host "  📊 Versão NPM: $(npm --version)" -ForegroundColor Gray
Write-Host "  📊 Pacotes instalados: $((npm list --depth=0 2>$null | Measure-Object -Line).Lines - 1)" -ForegroundColor Gray

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "  ✅ UPDATE COMPLETO!" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Green

Write-Host "📝 Próximos passos:" -ForegroundColor Cyan
Write-Host "  1. Revisar mudanças: git status" -ForegroundColor Gray
Write-Host "  2. Testar app: npm run dev" -ForegroundColor Gray
Write-Host "  3. Commit mudanças: git add . && git commit -m 'chore: update dependencies'" -ForegroundColor Gray
Write-Host "`n"
