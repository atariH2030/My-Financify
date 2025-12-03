# 🧪 Testes - My-Financify

**Sistema Antifalhas v2.0** - Testes E2E com Mock de Autenticação

---

## 📂 **ESTRUTURA**

```
tests/
├── e2e/                              # Testes End-to-End (Playwright)
│   ├── fixtures/                     # Fixtures e mocks reutilizáveis
│   │   └── auth.mock.ts             # ✨ Mock de autenticação (zero dependência Supabase)
│   ├── utils/                        # Utilitários de testes
│   │   └── health-check-reporter.ts # Reporter customizado com checkpoints
│   ├── health-check.spec.ts         # ✅ Suite principal de health checks
│   ├── auth-mock.spec.ts            # 🧪 Validação do sistema de mock
│   └── example-custom-test.spec.ts  # 📝 Exemplos de testes customizados
├── setup.ts                          # Setup global de testes unitários
└── README.md                         # 📖 Esta documentação
```

---

## 🚀 **COMANDOS RÁPIDOS**

### **Testes E2E**

```bash
# Health Check completo (8 testes críticos)
npm run test:health

# Health Check com browser visível
npm run test:health:headed

# Validar Mock de Autenticação (6 testes de validação)
npm run test:mock

# Todos os testes E2E
npm run test:e2e

# UI interativa (visualizar testes)
npm run test:e2e:ui

# Debug mode (step-by-step)
npm run test:e2e:debug

# Ver relatório HTML
npm run test:report
```

### **Testes Unitários**

```bash
# Rodar testes unitários
npm run test

# Testes com UI
npm run test:ui

# Testes com coverage
npm run test:coverage

# Rodar uma vez (CI/CD)
npm run test:run
```

---

## ✨ **NOVIDADE: Mock de Autenticação**

### **O Que É?**

Sistema que **simula autenticação sem precisar do Supabase**. Permite rodar testes E2E de forma:
- ⚡ **Rápida** - Não depende de API externa
- 🎯 **Confiável** - Sempre funciona, offline ou online
- 🔧 **Fácil** - Zero configuração de backend
- 🧪 **Testável** - Simula erros e edge cases

### **Como Usar**

```typescript
import { setupAuthMock, mockLogin, MOCK_CREDENTIALS } from './fixtures/auth.mock';

test('meu teste', async ({ page }) => {
  // ✅ Setup mock ANTES de navegar
  await setupAuthMock(page, { authenticated: false });
  
  await page.goto('http://localhost:3000');
  
  // Fazer login mock
  await page.fill('input[type="email"]', MOCK_CREDENTIALS.email);
  await page.fill('input[type="password"]', MOCK_CREDENTIALS.password);
  await mockLogin(page);
  
  // Agora usuário está autenticado! 🎉
});
```

📖 **[Documentação Completa do Mock](../docs/AUTH_MOCK_GUIDE.md)**

---

## 📊 **HEALTH CHECK SUITE**

Suite de 8 testes críticos que valida **todo o sistema**:

| Prioridade | Teste | O Que Valida |
|------------|-------|--------------|
| 🔴 **CRITICAL** | App Load | Aplicação carrega sem erros |
| 🔴 **CRITICAL** | Autenticação | Login funciona com mock |
| 🟠 **HIGH** | Transações CRUD | Criar/editar/deletar transações |
| 🟠 **HIGH** | Dashboard Widgets | Widgets carregam (4+) |
| 🟡 **MEDIUM** | Exportação PDF | Gerar relatórios PDF |
| 🟡 **MEDIUM** | Filtros Avançados | Filtrar transações |
| 🟢 **LOW** | Performance | Tempos < 5s |
| 🟢 **LOW** | Acessibilidade | Navegação por teclado |

---

**✅ Sistema de Testes v2.0 - Pronto para uso!**

Mock de autenticação implementado ✨  
Zero dependência de Supabase 🚀  
Testes rápidos e confiáveis 🎯
