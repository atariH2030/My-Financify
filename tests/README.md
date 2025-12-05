# 🧪 Testes E2E - Sistema Antifalhas

## 📁 Estrutura

```
tests/
└── e2e/
    ├── health-check.spec.ts          # Testes principais (8 testes críticos)
    ├── example-custom-test.spec.ts   # Exemplos de testes customizados
    └── utils/
        └── health-check-reporter.ts  # Reporter com logs + HTML + JSON
```

## 🎯 Filosofia

**Sistema Antifalhas** = Detectar problemas **antes** que impactem usuários.

### Princípios
- ✅ **Logs Estruturados**: Cada checkpoint registra progresso
- ✅ **Context Capture**: Screenshots + HTML + dados em falhas
- ✅ **Visual Reports**: HTML interativo para análise
- ✅ **CI/CD Ready**: JSON output para pipelines
- ✅ **Performance Metrics**: Tempos de carregamento monitorados

## 🚀 Comandos

```bash
# Executar health check (headless)
npm run test:health

# Executar com interface (ver browser)
npm run test:health:headed

# Modo debug (pausa em cada passo)
npx playwright test --debug

# Ver relatório HTML
npm run test:report
```

## 📊 Testes Implementados

### health-check.spec.ts

| Prioridade | Teste | Valida |
|------------|-------|--------|
| CRITICAL | App Load | Título, console errors, DOM |
| CRITICAL | Authentication | Login, redirect, dashboard |
| HIGH | Transactions CRUD | Create, Read, Update, Delete |
| HIGH | Dashboard Widgets | 4+ widgets visíveis |
| MEDIUM | PDF Export | Download, validação de arquivo |
| MEDIUM | Advanced Filters | Aplicação e resultados |
| LOW | Performance | Tempos < 5s |
| LOW | Accessibility | Tab navigation, shortcuts |

## 🛠️ Criar Testes Customizados

```typescript
import { test } from '@playwright/test';
import { HealthCheckReporter } from './utils/health-check-reporter';

const reporter = new HealthCheckReporter();

test('Meu teste', async ({ page }) => {
  const checkpoint = reporter.createCheckpoint('Validação');
  
  try {
    checkpoint.log('Fazendo algo...');
    // ... código do teste
    checkpoint.pass('Sucesso!');
  } catch (error) {
    checkpoint.fail('Erro', { error: String(error) });
    throw error;
  }
});
```

Ver `example-custom-test.spec.ts` para mais exemplos.

## 📈 Relatórios Gerados

### 1. Console (Terminal)
```
✅ [CRITICAL] App deve carregar sem erros
   Checkpoint: App Load
      ✓ Título correto
      ✓ Nenhum erro no console
```

### 2. HTML (`test-results/health-check/report.html`)
- Dashboard visual
- Status coloridos
- Screenshots inline
- Métricas de performance

### 3. JSON (`test-results/health-check/report.json`)
- Estruturado para CI/CD
- Parsing fácil
- Histórico de execuções

## 🔍 Troubleshooting

### Teste falhou - Como debugar?

1. **Ver screenshot**: `test-results/health-check/*.png`
2. **Abrir HTML report**: `npm run test:report`
3. **Rodar com debug**: `npx playwright test -g "nome do teste" --debug`
4. **Verificar logs do checkpoint**: Terminal mostra passo-a-passo

### App não inicia

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Testes
npm run test:health
```

### Elemento não encontrado

Use `npx playwright codegen` para gerar seletor correto:
```bash
npx playwright codegen http://localhost:5173
```

## 📚 Recursos

- [Playwright Docs](https://playwright.dev/)
- [Sistema Antifalhas - Docs](../../docs/SISTEMA_ANTIFALHAS.md)
- [Quick Start](../../docs/QUICK_START_ANTIFALHAS.md)

## 🎯 Roadmap

- [ ] Testes de regressão visual
- [ ] Integração com CI/CD (GitHub Actions)
- [ ] Testes cross-browser (Firefox, Safari)
- [ ] Testes mobile (Android, iOS)
- [ ] Relatórios para Slack/Discord

---

**🏥 Sistema sempre vigilante!**
