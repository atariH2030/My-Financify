# 🎯 Guia Visual: Configurar Supabase (PASSO A PASSO)

Você está aqui: ✅ Projeto criado | ⏳ Executar SQL | ⏳ Copiar credenciais

---

## PASSO 1: Executar o SQL (VOCÊ ESTÁ AQUI!) ✋

Vejo que você já está no **SQL Editor** com o código aberto!

### O que fazer AGORA:

1. **Verifique** se todo o código SQL está no editor (deve ter ~275 linhas)
2. **Clique** no botão verde **"Correr"** ou **"Run"** no canto inferior direito
3. **Aguarde** ~30 segundos

### Resultado esperado:
```
✅ Success
✅ My-Financify database schema created successfully!
📊 Tables: users, accounts, categories...
```

### Se der erro:
- Me envie uma captura de tela do erro
- Ou copie a mensagem de erro completa

---

## PASSO 2: Verificar as Tabelas Criadas

Depois de executar o SQL com sucesso:

1. **Clique** em **"Editor de tabelas"** ou **"Table Editor"** no menu lateral esquerdo
2. Você deve ver **8 tabelas**:
   - ✅ users
   - ✅ accounts  
   - ✅ transactions
   - ✅ categories
   - ✅ budgets
   - ✅ goals
   - ✅ recurring_transactions
   - ✅ dashboard_settings

### Se NÃO aparecer as tabelas:
- Volte ao SQL Editor
- Execute o SQL novamente (pode executar múltiplas vezes, é seguro)

---

## PASSO 3: Copiar as Credenciais 🔑

Agora vamos pegar as "chaves" do seu banco:

### 3.1. Ir para configurações:
1. **Clique** em **⚙️ Settings** (Configurações) no menu lateral esquerdo
2. **Clique** em **API** 

### 3.2. Copiar as informações:

Você verá uma página com duas informações importantes:

```
┌─────────────────────────────────────────┐
│ Project URL                              │
│ https://xxxxxxxxxxxxx.supabase.co       │  👈 COPIE ISSO (URL)
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ API Keys                                 │
│                                          │
│ anon public                              │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6...        │  👈 COPIE ISSO (KEY)
│ [Esta é uma chave LONGA, ~200 caracteres]
└─────────────────────────────────────────┘
```

### 3.3. Como copiar:
- **Project URL**: Clique no ícone de copiar 📋 ao lado
- **anon public key**: Clique no ícone de copiar 📋 ao lado

**IMPORTANTE:** 
- É a chave **"anon public"**, NÃO a "service_role"
- A chave começa com `eyJ...`

---

## PASSO 4: Colar no Arquivo .env

Agora vamos configurar o projeto:

### 4.1. Abrir o arquivo:
1. No VS Code, abra o arquivo **`.env`** (está na raiz do projeto)

### 4.2. Substituir os valores:

**ANTES:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ENV=development
```

**DEPOIS** (com suas credenciais):
```env
VITE_SUPABASE_URL=https://cuwzqrfhpfozcqqtfzjy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc...
VITE_ENV=development
```

### 4.3. Salvar o arquivo:
- **Ctrl + S** para salvar

---

## PASSO 5: Reiniciar o Servidor ⚡

No terminal do VS Code:

```bash
# Se o servidor estiver rodando, pare com Ctrl+C
# Depois inicie novamente:
npm run dev
```

---

## ✅ VERIFICAR SE FUNCIONOU

Abra o navegador e pressione **F12** (abrir DevTools).

Na aba **Console**, você deve ver:
```
✅ Supabase client initialized
```

Se aparecer:
```
⚠️ Supabase not configured - using local storage mode
```

Significa que as credenciais não foram configuradas corretamente.

---

## 🆘 PROBLEMAS COMUNS

### "Supabase not configured"
- ✅ Verifique se o arquivo `.env` foi salvo
- ✅ Verifique se as variáveis começam com `VITE_`
- ✅ Reinicie o servidor dev (Ctrl+C e npm run dev)
- ✅ Limpe o cache do navegador (Ctrl+Shift+R)

### "Failed to fetch"
- ✅ Verifique se a URL está correta
- ✅ Verifique se a chave está completa (sem quebras de linha)

### SQL não executou
- ✅ Copie TODO o conteúdo de `supabase/schema.sql`
- ✅ Cole no SQL Editor
- ✅ Execute novamente

---

## 📞 PRÓXIMO PASSO

Depois de configurar, me avise:

✅ "Executei o SQL com sucesso!"
✅ "Copiei as credenciais para o .env!"
✅ "Reiniciei o servidor!"

Ou me envie uma captura de tela se tiver algum problema! 🚀
