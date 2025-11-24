# 🔐 Configurar OAuth Providers no Supabase

## 📋 Resumo
Para usar login com Google, GitHub ou Microsoft, você precisa configurar os providers no Supabase.

---

## 1️⃣ Google OAuth

### Passo 1: Acessar Google Cloud Console
1. Vá para https://console.cloud.google.com
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services** > **Credentials**

### Passo 2: Criar OAuth 2.0 Client ID
1. Clique em **Create Credentials** > **OAuth client ID**
2. Tipo de aplicação: **Web application**
3. Nome: `My-Financify`
4. **Authorized JavaScript origins:**
   ```
   https://cuwzoffjhefozocqtzju.supabase.co
   http://localhost:3000
   ```
5. **Authorized redirect URIs:**
   ```
   https://cuwzoffjhefozocqtzju.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```
6. Clique em **Create**

### Passo 3: Copiar Credenciais
- Copie o **Client ID** e **Client Secret**

### Passo 4: Configurar no Supabase
1. Acesse: https://supabase.com/dashboard/project/cuwzoffjhefozocqtzju/auth/providers
2. Encontre **Google** na lista de providers
3. **Enable Google provider** → Toggle ON
4. Cole o **Client ID** e **Client Secret**
5. Clique em **Save**

---

## 2️⃣ GitHub OAuth

### Passo 1: Criar OAuth App no GitHub
1. Vá para https://github.com/settings/developers
2. Clique em **New OAuth App**
3. Preencha:
   - **Application name:** My-Financify
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `https://cuwzoffjhefozocqtzju.supabase.co/auth/v1/callback`
4. Clique em **Register application**

### Passo 2: Gerar Client Secret
1. Na página do OAuth App, clique em **Generate a new client secret**
2. Copie o **Client ID** e **Client Secret**

### Passo 3: Configurar no Supabase
1. Acesse: https://supabase.com/dashboard/project/cuwzoffjhefozocqtzju/auth/providers
2. Encontre **GitHub** na lista
3. **Enable GitHub provider** → Toggle ON
4. Cole o **Client ID** e **Client Secret**
5. Clique em **Save**

---

## 3️⃣ Microsoft OAuth (Azure AD)

### Passo 1: Registrar App no Azure
1. Vá para https://portal.azure.com
2. Vá em **Azure Active Directory** > **App registrations**
3. Clique em **New registration**
4. Preencha:
   - **Name:** My-Financify
   - **Supported account types:** Multitenant
   - **Redirect URI:** Web → `https://cuwzoffjhefozocqtzju.supabase.co/auth/v1/callback`
5. Clique em **Register**

### Passo 2: Criar Client Secret
1. Vá em **Certificates & secrets**
2. Clique em **New client secret**
3. Copie o **Value** (Client Secret)
4. Copie também o **Application (client) ID** na página Overview

### Passo 3: Configurar no Supabase
1. Acesse: https://supabase.com/dashboard/project/cuwzoffjhefozocqtzju/auth/providers
2. Encontre **Azure (Microsoft)** na lista
3. **Enable Azure provider** → Toggle ON
4. Cole o **Client ID** e **Client Secret**
5. Clique em **Save**

---

## ✅ Testar OAuth

Depois de configurar, teste o login:

1. Abra http://localhost:3000
2. Clique em **Continuar com Google/GitHub/Microsoft**
3. Faça login com sua conta
4. Deve redirecionar de volta para a aplicação

---

## 🆘 Problemas Comuns

### "redirect_uri_mismatch"
- Verifique se a URL de callback está correta
- No Supabase, a URL é sempre: `https://SEU_PROJETO.supabase.co/auth/v1/callback`

### "unauthorized_client"
- Verifique se o Client ID e Secret estão corretos
- Verifique se o provider está **habilitado** no Supabase

### "access_denied"
- Usuário negou permissão
- Tente novamente ou use outro provider

---

## 📝 Nota Importante

**Para desenvolvimento local (localhost):**
- Google: Funciona normalmente
- GitHub: Funciona normalmente  
- Microsoft: Pode precisar de domínio público

**Para produção:**
- Configure as URLs de produção em todos os providers
- Atualize as Authorized origins e Redirect URIs

---

## 🚀 Próximos Passos

Depois de configurar OAuth, você pode:

1. ✅ Testar login com providers sociais
2. ✅ Criar usuário teste com email/senha
3. ✅ Implementar recuperação de senha
4. ✅ Adicionar 2FA (autenticação de dois fatores)
