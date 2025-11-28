# 🧪 GUIA DE TESTE - Sistema de Autenticação

## ✅ Status: PRONTO PARA TESTAR!

O sistema está configurado em **Modo Teste**. O app principal foi temporariamente desativado para você testar a autenticação isoladamente.

---

## 🚀 Como Testar AGORA:

### 1. **Acesse o app:**
```
http://localhost:3000
```

Você verá uma tela de boas-vindas com:
- ✨ Lista de recursos implementados
- 🔐 Botão "Fazer Login"
- ✨ Botão "Criar Conta Nova"
- 📋 Credenciais de teste sugeridas

---

## 📝 Cenários de Teste:

### **Cenário 1: Criar Nova Conta**

1. Clique em **"Criar Conta Nova"**
2. Preencha o formulário:
   - **Nome Completo:** Seu Nome
   - **Email:** teste@exemplo.com
   - **Telefone:** (opcional)
   - **Senha:** Teste123
   - **Confirmar Senha:** Teste123

3. Clique em **"Criar Conta"**

**Resultado esperado:**
- ✅ Mensagem de sucesso
- ✅ Email de confirmação (verifique se foi enviado)
- ✅ Redireciona para tela de login

---

### **Cenário 2: Fazer Login**

1. Clique em **"Fazer Login"**
2. Preencha:
   - **Email:** teste@exemplo.com
   - **Senha:** Teste123

3. Clique em **"Entrar"**

**Resultado esperado:**
- ✅ Login bem-sucedido
- ✅ Tela mostrando "🎉 Autenticação Funcionando!"
- ✅ Dados do usuário exibidos (email, ID, data de criação)
- ✅ Botão de logout disponível

---

### **Cenário 3: Testar Logout**

1. Após fazer login, clique em **"🚪 Fazer Logout"**

**Resultado esperado:**
- ✅ Volta para tela inicial
- ✅ Sessão encerrada
- ✅ Pode fazer login novamente

---

### **Cenário 4: Magic Link (Login sem senha)**

1. Na tela de login, clique em **"✨ Login sem senha (Magic Link)"**
2. Digite seu email
3. Clique em **"Enviar Magic Link"**

**Resultado esperado:**
- ✅ Mensagem: "📧 Email Enviado!"
- ✅ Link de login enviado para o email
- ✅ Ao clicar no link, login automático

---

### **Cenário 5: OAuth (Google/GitHub)** ⚠️ *Requer configuração*

1. Clique em **"Continuar com Google"** ou **"Continuar com GitHub"**

**Se NÃO configurado:**
- ⚠️ Erro: "Provider not enabled"
- 💡 Veja: `OAUTH_SETUP_GUIDE.md` para configurar

**Se configurado:**
- ✅ Redireciona para autenticação
- ✅ Login automático após autorização

---

## 🧪 Testes Avançados:

### **Teste de Erro: Credenciais Inválidas**

1. Tente fazer login com senha errada
2. **Email:** teste@exemplo.com
3. **Senha:** senhaerrada

**Resultado esperado:**
- ⚠️ Mensagem: "Email ou senha incorretos"
- ✅ App NÃO quebra
- ✅ Pode tentar novamente

---

### **Teste de Validação: Senha Fraca**

1. Tente criar conta com senha fraca
2. **Senha:** 123

**Resultado esperado:**
- ⚠️ Indicadores de requisitos não cumpridos ficam vermelhos
- ⚠️ Mensagem: "A senha deve ter no mínimo 6 caracteres"
- ✅ Botão desabilitado até senha ser válida

---

### **Teste de Modo Offline** 🛡️

1. Desabilite o Wi-Fi temporariamente
2. Tente fazer login

**Resultado esperado:**
- ⚠️ Timeout após 10 segundos
- ✅ Mensagem clara de erro
- ✅ App continua funcionando
- ✅ Se já estava logado, usa sessão local

---

### **Teste de Error Boundary**

Para forçar um erro e ver o Error Boundary:

1. Abra DevTools (F12)
2. Console → Digite: `throw new Error('Test')`

**Resultado esperado:**
- ✅ Tela de erro amigável
- ✅ Botão "Tentar Novamente"
- ✅ Botão "Resetar Sistema"
- ✅ App NÃO fica em tela branca

---

## 📊 O que Verificar:

### **No Console do Navegador (F12 → Console):**

✅ Deve aparecer:
```
✅ Supabase client initialized
[INFO] SAFE_AUTH: Sessão carregada
```

❌ Se aparecer:
```
⚠️ Supabase not configured
```
→ Verifique o arquivo `.env`

---

### **No Supabase Dashboard:**

1. Acesse: https://supabase.com/dashboard/project/cuwzoffjhefozocqtzju/auth/users

2. Verifique se os usuários criados aparecem na lista

3. Clique em um usuário para ver detalhes

---

## 🔄 Voltar ao App Normal:

Quando terminar de testar, para voltar ao app principal:

1. Abra `src/main.tsx`

2. Comente a linha:
```typescript
import AuthDemo from './components/auth/AuthDemo';
```

3. Descomente as linhas do app normal (procure por `/* ... */`)

4. Substitua:
```typescript
root.render(<AuthDemo />);
```

Por:
```typescript
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <ToastEnhancedProvider>
          <App />
        </ToastEnhancedProvider>
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
```

5. Salve o arquivo

---

## ✅ Checklist de Testes:

- [ ] ✅ Criar conta nova
- [ ] ✅ Fazer login com email/senha
- [ ] ✅ Logout
- [ ] ✅ Credenciais inválidas mostram erro
- [ ] ✅ Validação de senha funciona
- [ ] ✅ Magic Link enviado
- [ ] ⚠️ OAuth configurado (opcional)
- [ ] ✅ Modo offline não quebra o app
- [ ] ✅ Error Boundary captura erros
- [ ] ✅ Sessão persiste após reload

---

## 🎯 Próximos Passos (Após Teste):

1. ✅ **Integrar com Dashboard** - Adicionar auth ao app principal
2. ✅ **Proteger Rotas** - Só usuários logados acessam
3. ✅ **Migrar Transações** - Salvar no Supabase com ResilientStorage
4. ✅ **Indicador Online/Offline** - Mostrar status na UI
5. ✅ **Perfil do Usuário** - Editar nome, avatar, etc.

---

**🎉 AGORA É SÓ TESTAR! Qualquer problema, o sistema está preparado para não quebrar!**
