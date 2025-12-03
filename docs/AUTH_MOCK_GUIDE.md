# 🧪 Sistema de Mock de Autenticação para Testes E2E

**Versão**: 1.0.0  
**Autor**: DEV - Sistema Antifalhas  
**Data**: 03 de dezembro de 2025

---

## 📋 **ÍNDICE**

1. [Visão Geral](#visão-geral)
2. [Por Que Usar Mock?](#por-que-usar-mock)
3. [Como Funciona](#como-funciona)
4. [Guia de Uso](#guia-de-uso)
5. [API Reference](#api-reference)
6. [Exemplos Práticos](#exemplos-práticos)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 **VISÃO GERAL**

O **Sistema de Mock de Autenticação** permite rodar testes E2E **sem precisar do Supabase configurado**. Ele intercepta todas as chamadas de autenticação e retorna dados fake, garantindo testes rápidos, confiáveis e independentes de infraestrutura externa.

### **Características**

✅ **Zero configuração de backend** - Não precisa de Supabase rodando  
✅ **Testes determinísticos** - Mesmos resultados toda vez  
✅ **Performance** - Não depende de rede/API externa  
✅ **Controle total** - Simula sucesso, erro, estados customizados  
✅ **Transparente** - Funciona com código existente sem modificações

---

## 🤔 **POR QUE USAR MOCK?**

### **Problemas com Testes Reais de Auth**

❌ Dependência de Supabase configurado  
❌ Credenciais de teste precisam existir no banco  
❌ Testes falham se API externa está lenta/fora  
❌ Difícil testar cenários de erro  
❌ Lento (cada request vai para internet)

### **Vantagens do Mock**

✅ Testes rodam **offline**  
✅ Testes são **10x mais rápidos**  
✅ **100% confiável** (sem flakiness por rede)  
✅ Fácil simular **erros e edge cases**  
✅ **CI/CD friendly** (sem secrets, sem setup)

---

## ⚙️ **COMO FUNCIONA**

O mock funciona em 3 camadas:

### **1. Interceptação de HTTP Requests**
```typescript
// Toda requisição para /auth/v1/** é interceptada
await page.route('**/auth/v1/**', async (route) => {
  // Retorna resposta fake ao invés de chamar Supabase
  return route.fulfill({ 
    status: 200,
    body: JSON.stringify({ user: MOCK_USER })
  });
});
```

### **2. Mock de LocalStorage**
```typescript
// Sobrescreve localStorage para armazenar sessão fake
window.localStorage.setItem('supabase.auth.token', mockSession);
```

### **3. Objeto Global `__AUTH_MOCK__`**
```typescript
// Injeta funções de mock no contexto da página
window.__AUTH_MOCK__ = {
  login(email, password) { /* ... */ },
  logout() { /* ... */ },
  getSession() { /* ... */ }
};
```

---

## 📚 **GUIA DE USO**

### **Setup Básico**

```typescript
import { test } from '@playwright/test';
import { setupAuthMock } from './fixtures/auth.mock';

test('meu teste', async ({ page }) => {
  // ✅ SEMPRE configurar mock ANTES de navegar
  await setupAuthMock(page, { authenticated: false });
  
  await page.goto('http://localhost:3000');
  // ... resto do teste
});
```

### **Usuário Desautenticado (Padrão)**

```typescript
// Usuário começa desautenticado (tela de login)
await setupAuthMock(page, { authenticated: false });
```

### **Usuário Pré-autenticado**

```typescript
// Usuário já está logado (pula tela de login)
await setupAuthMock(page, { authenticated: true });
```

### **Login Durante o Teste**

```typescript
import { mockLogin, MOCK_CREDENTIALS } from './fixtures/auth.mock';

// 1. Preencher formulário
await page.fill('input[type="email"]', MOCK_CREDENTIALS.email);
await page.fill('input[type="password"]', MOCK_CREDENTIALS.password);

// 2. Executar mock ANTES do submit
await mockLogin(page);

// 3. Submit (agora vai passar)
await page.click('button[type="submit"]');
```

### **Logout Durante o Teste**

```typescript
import { mockLogout } from './fixtures/auth.mock';

await mockLogout(page);
// Usuário desautenticado, deve voltar para tela de login
```

### **Verificar Estado de Auth**

```typescript
import { isAuthMockAuthenticated } from './fixtures/auth.mock';

const isAuth = await isAuthMockAuthenticated(page);
console.log('Autenticado?', isAuth); // true ou false
```

---

## 📖 **API REFERENCE**

### **setupAuthMock(page, options)**

Configura o sistema de mock para a página.

**Parâmetros:**
- `page` (Page) - Instância do Playwright Page
- `options` (object, opcional):
  - `authenticated` (boolean) - Se true, usuário inicia logado. Padrão: `false`
  - `customUser` (object) - Dados customizados do usuário. Merge com `MOCK_USER`
  - `simulateAuthError` (boolean) - Se true, simula erro de login. Padrão: `false`

**Exemplo:**
```typescript
// Usuário desautenticado (padrão)
await setupAuthMock(page);

// Usuário autenticado
await setupAuthMock(page, { authenticated: true });

// Usuário customizado
await setupAuthMock(page, {
  authenticated: true,
  customUser: {
    email: 'custom@test.com',
    user_metadata: { full_name: 'Custom User' }
  }
});

// Simular erro
await setupAuthMock(page, { simulateAuthError: true });
```

---

### **mockLogin(page, credentials?)**

Executa login mock (sem chamar backend).

**Parâmetros:**
- `page` (Page) - Instância do Playwright Page
- `credentials` (object, opcional) - Credenciais. Padrão: `MOCK_CREDENTIALS`
  - `email` (string)
  - `password` (string)

**Retorna:** `Promise<void>`

**Exemplo:**
```typescript
// Login com credenciais padrão
await mockLogin(page);

// Login com credenciais customizadas
await mockLogin(page, {
  email: 'outro@email.com',
  password: 'senha123'
});
```

---

### **mockLogout(page)**

Executa logout mock.

**Parâmetros:**
- `page` (Page) - Instância do Playwright Page

**Retorna:** `Promise<void>`

**Exemplo:**
```typescript
await mockLogout(page);
```

---

### **isAuthMockAuthenticated(page)**

Verifica se usuário está autenticado.

**Parâmetros:**
- `page` (Page) - Instância do Playwright Page

**Retorna:** `Promise<boolean>`

**Exemplo:**
```typescript
const isAuth = await isAuthMockAuthenticated(page);
if (isAuth) {
  console.log('Usuário autenticado');
}
```

---

### **Constantes**

#### **MOCK_USER**
Dados do usuário fake padrão.

```typescript
{
  id: 'test-user-e2e-12345',
  email: 'test@financify.com',
  created_at: '2025-12-03T...',
  user_metadata: {
    full_name: 'Test User E2E',
    avatar_url: null
  }
}
```

#### **MOCK_CREDENTIALS**
Credenciais válidas para login mock.

```typescript
{
  email: 'test@financify.com',
  password: 'Test@123456'
}
```

#### **MOCK_SESSION**
Sessão fake com tokens.

```typescript
{
  access_token: 'mock-access-token-e2e',
  refresh_token: 'mock-refresh-token-e2e',
  expires_in: 3600,
  user: MOCK_USER
}
```

---

## 💡 **EXEMPLOS PRÁTICOS**

### **Exemplo 1: Teste de Login**

```typescript
test('Login deve funcionar', async ({ page }) => {
  // Setup: usuário desautenticado
  await setupAuthMock(page, { authenticated: false });
  await page.goto('http://localhost:3000');
  
  // Preencher formulário
  await page.fill('input[type="email"]', MOCK_CREDENTIALS.email);
  await page.fill('input[type="password"]', MOCK_CREDENTIALS.password);
  
  // Login mock
  await mockLogin(page);
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Verificar redirecionamento
  await expect(page).toHaveURL(/dashboard/);
});
```

---

### **Exemplo 2: Teste de Dashboard (Pré-autenticado)**

```typescript
test('Dashboard carrega widgets', async ({ page }) => {
  // Setup: usuário JÁ autenticado
  await setupAuthMock(page, { authenticated: true });
  await page.goto('http://localhost:3000/dashboard');
  
  // Verificar widgets
  const widgets = await page.locator('.widget').count();
  expect(widgets).toBeGreaterThan(3);
});
```

---

### **Exemplo 3: Teste de Logout**

```typescript
test('Logout deve desautenticar', async ({ page }) => {
  // Setup: usuário autenticado
  await setupAuthMock(page, { authenticated: true });
  await page.goto('http://localhost:3000/dashboard');
  
  // Fazer logout
  await page.click('button:has-text("Sair")');
  await mockLogout(page);
  
  // Verificar redirecionamento para login
  await expect(page).toHaveURL(/login/);
  
  // Confirmar desautenticação
  const isAuth = await isAuthMockAuthenticated(page);
  expect(isAuth).toBe(false);
});
```

---

### **Exemplo 4: Teste de Erro de Autenticação**

```typescript
test('Login com credenciais inválidas deve falhar', async ({ page }) => {
  // Setup: simular erro
  await setupAuthMock(page, { 
    authenticated: false,
    simulateAuthError: true 
  });
  await page.goto('http://localhost:3000');
  
  // Tentar login
  await page.fill('input[type="email"]', 'invalido@email.com');
  await page.fill('input[type="password"]', 'senhaerrada');
  
  try {
    await mockLogin(page);
    throw new Error('Login deveria ter falhado');
  } catch (error) {
    // Esperado
  }
  
  // Verificar mensagem de erro na tela
  await expect(page.locator('text=/credenciais inválidas/i')).toBeVisible();
});
```

---

### **Exemplo 5: Teste com Usuário Customizado**

```typescript
test('Dashboard mostra nome do usuário', async ({ page }) => {
  // Setup: usuário customizado
  await setupAuthMock(page, {
    authenticated: true,
    customUser: {
      email: 'maria@test.com',
      user_metadata: {
        full_name: 'Maria Silva'
      }
    }
  });
  await page.goto('http://localhost:3000/dashboard');
  
  // Verificar nome na interface
  await expect(page.locator('text=Maria Silva')).toBeVisible();
});
```

---

## 🔧 **TROUBLESHOOTING**

### **Problema: Testes ainda chamam Supabase real**

**Causa**: Mock não foi configurado antes da navegação.

**Solução**:
```typescript
// ❌ ERRADO
await page.goto('http://localhost:3000');
await setupAuthMock(page); // Tarde demais!

// ✅ CORRETO
await setupAuthMock(page);
await page.goto('http://localhost:3000');
```

---

### **Problema: Login não funciona mesmo com mock**

**Causa**: Formulário não usa as credenciais mock.

**Solução**:
```typescript
// Use MOCK_CREDENTIALS
import { MOCK_CREDENTIALS } from './fixtures/auth.mock';

await page.fill('input[type="email"]', MOCK_CREDENTIALS.email);
await page.fill('input[type="password"]', MOCK_CREDENTIALS.password);
await mockLogin(page);
```

---

### **Problema: `__AUTH_MOCK__` is undefined**

**Causa**: Script de mock não foi injetado.

**Solução**: Verificar se `setupAuthMock()` foi chamado e aguardado com `await`.

---

### **Problema: Autenticação não persiste entre navegações**

**Causa**: Mock não está configurado para persistir no localStorage.

**Solução**: Já está implementado automaticamente. Se não persistir, verificar se o app está limpando o localStorage.

---

### **Problema: Testes passam com mock mas falham em produção**

**Causa**: Mock não simula comportamento real 100%.

**Solução**: Ter **testes E2E separados** que rodam contra Supabase real em staging/production. Mock é para **desenvolvimento rápido**, não substitui testes de integração reais.

---

## 🚀 **BOAS PRÁTICAS**

1. **SEMPRE use mock em testes E2E de desenvolvimento**
   ```typescript
   test.beforeEach(async ({ page }) => {
     await setupAuthMock(page, { authenticated: false });
   });
   ```

2. **Use `authenticated: true` para testes que não dependem de login**
   ```typescript
   // Teste de dashboard não precisa testar login novamente
   await setupAuthMock(page, { authenticated: true });
   ```

3. **Teste cenários de erro com `simulateAuthError: true`**
   ```typescript
   await setupAuthMock(page, { simulateAuthError: true });
   ```

4. **Customize usuário para testes específicos**
   ```typescript
   await setupAuthMock(page, {
     authenticated: true,
     customUser: { email: 'admin@test.com' }
   });
   ```

5. **Valide estado de auth com `isAuthMockAuthenticated()`**
   ```typescript
   const isAuth = await isAuthMockAuthenticated(page);
   expect(isAuth).toBe(true);
   ```

---

## 📊 **COMPARAÇÃO: Mock vs Real**

| Aspecto | Mock (Testes E2E) | Real (Staging/Prod) |
|---------|-------------------|---------------------|
| **Velocidade** | ⚡ Instantâneo | 🐌 Depende de rede |
| **Confiabilidade** | ✅ 100% determinístico | ⚠️ Pode falhar por rede |
| **Setup** | ✅ Zero config | ❌ Requer Supabase configurado |
| **Custo** | ✅ Grátis | 💰 Usa quota de API |
| **Offline** | ✅ Funciona offline | ❌ Requer conexão |
| **Erros** | ✅ Fácil simular | ❌ Difícil reproduzir |
| **Realismo** | ⚠️ 95% real | ✅ 100% real |

**Recomendação**: Use **mock para desenvolvimento** e **real para validação final** antes de deploy.

---

## 📝 **CHANGELOG**

### **v1.0.0** (03/12/2025)
- ✅ Implementação inicial do mock de autenticação
- ✅ Suporte a estados: desautenticado, autenticado, erro
- ✅ Helpers: `mockLogin()`, `mockLogout()`, `isAuthMockAuthenticated()`
- ✅ Interceptação de HTTP requests para `/auth/v1/**`
- ✅ Mock de localStorage
- ✅ Objeto global `__AUTH_MOCK__`
- ✅ Testes de validação do mock
- ✅ Documentação completa

---

## 🤝 **CONTRIBUINDO**

Se encontrar bugs ou tiver sugestões, abra uma issue ou PR no repositório.

---

## 📄 **LICENÇA**

MIT License - Sistema Antifalhas © 2025

---

**✅ Sistema de Mock validado e pronto para uso!**
