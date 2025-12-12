# 🚀 APLICAR MIGRATIONS VIA SUPABASE DASHBOARD

**Status**: O tipo `workspace_type` já existe (migration parcialmente aplicada antes)

---

## ✅ **SOLUÇÃO SIMPLES - VIA DASHBOARD**

### **Passo 1: Acessar Supabase Dashboard**

1. Acesse: https://supabase.com/dashboard
2. Login (se necessário)
3. Selecione projeto: **Financy Life**
4. Menu lateral → **SQL Editor**

---

### **Passo 2: Aplicar Migration 2 (RLS Policies)**

Como a Migration 1 já foi parcialmente aplicada, vamos aplicar apenas a **Migration 2**:

1. No SQL Editor, clique em **New Query**
2. **Copie TODO o conteúdo** do arquivo:
   - `supabase/migrations/add_workspace_rls_policies.sql`
3. Cole no editor
4. Clique em **Run** (ou pressione `Ctrl+Enter`)
5. Aguarde execução (~10-15 segundos)

---

### **Passo 3: Verificar Sucesso**

Você deve ver a mensagem:

```
✅ Workspace RLS policies applied successfully!
📊 Tables updated: accounts, budgets, goals, recurring_transactions
🔒 Multi-tenant workspace security enabled
🚀 Personal accounts (workspace_id = NULL) still work for backward compatibility
```

---

### **Passo 4: Validar (Opcional)**

Execute este SQL para confirmar:

```sql
-- Verificar colunas workspace_id
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'workspace_id';

-- Deve retornar 4 linhas:
-- accounts, budgets, goals, recurring_transactions
```

---

## 🔄 **SE HOUVER ERRO**

### Erro: "column workspace_id already exists"

Já foi aplicado! Apenas valide no Passo 4.

### Erro: "function is_workspace_member already exists"

Execute antes de aplicar:

```sql
DROP FUNCTION IF EXISTS public.is_workspace_member(UUID);
```

Depois aplique a migration normalmente.

---

## ✅ **APÓS CONCLUSÃO**

1. Testar app: `npm run dev`
2. Criar workspace de teste
3. Commit e push:

```powershell
git add .
git commit -m "feat: apply workspace RLS migrations"
git push
```

---

**Última Atualização**: 12/12/2025  
**Status**: Pronto para aplicar via Dashboard
