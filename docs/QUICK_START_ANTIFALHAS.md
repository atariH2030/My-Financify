# 🚀 Guia Rápido - Sistema Antifalhas

## ⚡ Comandos Essenciais

### 1️⃣ Executar Health Check (Headless)
```bash
npm run test:health
```
**Quando usar**: CI/CD, testes automatizados

---

### 2️⃣ Executar com Interface Gráfica
```bash
npm run test:health:headed
```
**Quando usar**: Desenvolvimento, ver o que está acontecendo

---

### 3️⃣ Ver Relatório HTML
```bash
npm run test:report
```
**Quando usar**: Após execução, para análise detalhada

---

### 4️⃣ Debug de Teste Específico
```bash
npx playwright test health-check.spec.ts --debug
```
**Quando usar**: Investigar falha específica

---

## 📊 Interpretando Resultados

### ✅ Sucesso
```
8 passed (45.6s)

📊 RESUMO GERAL
   Total: 8 testes
   ✅ Passou: 8
   ❌ Falhou: 0

📄 Relatório HTML: test-results/health-check/report.html
```

### ❌ Falha
```
7 passed, 1 failed (50.2s)

❌ [HIGH] Transações - CRUD completo
   Checkpoint: Transactions CRUD
      ✓ Navegação bem-sucedida
      ✓ Transação criada
      ✗ Transação não encontrada na lista
         Dados: {
           "error": "Timeout waiting for element",
           "screenshot": "test-results/health-check/transactions_1733270400000.png"
         }
```

**Ação**: Abrir screenshot + verificar logs do checkpoint

---

## 🔍 Troubleshooting Rápido

### App não inicia
```bash
# Verificar se dev server está rodando
npm run dev

# Em outro terminal, rodar testes
npm run test:health
```

### Teste específico falhou
```bash
# Rodar apenas esse teste
npx playwright test -g "Transações"

# Ou com debug
npx playwright test -g "Transações" --debug
```

### Ver todos os logs
```bash
# Modo verbose
npx playwright test health-check.spec.ts --reporter=list
```

---

## 📁 Onde Encontrar Resultados

```
test-results/
├── health-check/
│   ├── report.html          ← ABRIR ESTE!
│   ├── report.json          ← Para CI/CD
│   └── *.png                ← Screenshots de falhas
└── playwright-report/
    └── index.html           ← Relatório do Playwright
```

---

## 🎯 Checklist Antes de Commit

```bash
# 1. Rodar testes unitários
npm run test:run

# 2. Rodar health check
npm run test:health

# 3. Verificar build
npm run build

# 4. Se tudo OK: commit!
git add .
git commit -m "feat: nova funcionalidade"
git push
```

---

## 💡 Dicas

### Acelerar Testes
- Use `--headed` apenas quando necessário (é mais lento)
- Comente testes não críticos durante desenvolvimento
- Use `test.only()` para focar em um teste

### Capturar Logs do Console
```typescript
page.on('console', msg => console.log('BROWSER:', msg.text()));
```

### Debugar Seletores
```bash
# Gerador de seletores
npx playwright codegen http://localhost:5173
```

---

**🏥 Sistema Antifalhas - Sempre vigilante!**
