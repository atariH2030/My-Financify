# 🚀 Guia Rápido: Configuração do Supabase

## Passo 1: Criar Projeto no Supabase (5 min)

1. **Acesse**: https://supabase.com/
2. **Faça login** ou crie uma conta (gratuita)
3. **Clique em** "New Project"
4. **Preencha**:
   - Name: `my-financify`
   - Database Password: (escolha uma senha forte e salve)
   - Region: `South America (São Paulo)` (melhor para Brasil)
5. **Aguarde** ~2 minutos para o projeto ser criado

## Passo 2: Executar o Schema SQL (2 min)

1. No projeto, vá em **SQL Editor** (menu lateral)
2. Clique em **"New query"**
3. **Copie TODO o conteúdo** do arquivo `supabase/schema.sql`
4. **Cole** no editor
5. Clique em **"Run"** (ou F5)
6. Deve aparecer: ✅ Success - 8 tables created

## Passo 3: Obter Credenciais (1 min)

1. Vá em **Settings** > **API** (menu lateral)
2. **Copie** as seguintes informações:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGci...` (chave longa)

## Passo 4: Configurar .env (1 min)

1. Abra o arquivo `.env` na raiz do projeto
2. **Substitua** os valores:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_AQUI
VITE_ENV=development
```

3. **Salve** o arquivo

## Passo 5: Verificar Instalação (1 min)

```bash
# Reiniciar servidor (se estiver rodando)
npm run dev
```

Abra o console do navegador (F12), deve aparecer:
```
✅ Supabase client initialized
```

## ✅ Pronto!

Seu banco de dados está configurado e pronto para uso!

## 🔍 Verificar Tabelas

No Supabase Dashboard:
1. Vá em **Table Editor**
2. Você deve ver 8 tabelas:
   - users
   - accounts  
   - transactions
   - categories
   - budgets
   - goals
   - recurring_transactions
   - dashboard_settings

## ⚠️ Problemas Comuns

### Erro: "Supabase credentials not found"
- Verifique se o arquivo `.env` existe
- Verifique se as variáveis começam com `VITE_`
- Reinicie o servidor dev

### Erro ao executar SQL
- Verifique se copiou TODO o arquivo `schema.sql`
- Execute novamente (é seguro executar múltiplas vezes)

### Não aparece "✅ Supabase client initialized"
- Limpe o cache do navegador (Ctrl+Shift+R)
- Verifique se as credenciais estão corretas no `.env`

## 📞 Próximo Passo

Agora vamos implementar a autenticação e começar a usar o banco!
