# 🧪 Guia de Testes - Sistema de Workspaces

**Versão:** v3.16.1  
**Data:** 12 de dezembro de 2025  
**Status:** ✅ Implementado e Pronto para Testes

---

## 📋 O QUE JÁ ESTÁ IMPLEMENTADO

### ✅ Backend (Supabase)
- **Tabelas:**
  - `workspaces` - Armazena workspaces
  - `workspace_members` - Membros e permissões
  - `workspace_invites` - Convites pendentes
  - `workspace_id` adicionado em: accounts, budgets, goals, recurring_transactions

- **RLS Policies:**
  - 16 políticas de segurança implementadas
  - RBAC (Role-Based Access Control): OWNER, ADMIN, CONTRIBUTOR, VIEWER

### ✅ Frontend
- **WorkspaceContext:** Context completo com CRUD
- **WorkspaceSwitcher:** Dropdown na sidebar (já renderizado)
- **WorkspaceSettings:** Página de gerenciamento
- **CreateWorkspaceModal:** Modal de criação
- **WorkspaceService:** Camada de serviço com Supabase

---

## 🧪 ROTEIRO DE TESTES

### **Teste 1: Verificar WorkspaceSwitcher na Sidebar**

1. **Abrir aplicação:**
   ```
   http://localhost:3001/
   ```

2. **Fazer login** (se não estiver autenticado)

3. **Verificar sidebar:**
   - Deve aparecer **logo após o header**
   - Ícone de workspace + nome + seta dropdown
   - Clicar deve abrir lista de workspaces

4. **Esperado:**
   - Se usuário novo: Apenas 1 workspace "Meu Workspace" (PERSONAL)
   - Se já tem workspaces: Lista completa

---

### **Teste 2: Criar Novo Workspace**

1. **No WorkspaceSwitcher, clicar em:**
   ```
   + Criar novo workspace
   ```

2. **Preencher modal:**
   - **Nome:** "Finanças do Casal"
   - **Tipo:** COUPLE
   - **Plano:** COUPLE (ou FREE para teste)

3. **Clicar em "Criar"**

4. **Verificar:**
   - ✅ Modal fecha
   - ✅ Novo workspace aparece no dropdown
   - ✅ Workspace criado fica ativo automaticamente
   - ✅ Toast de sucesso aparece

---

### **Teste 3: Trocar de Workspace**

1. **Abrir WorkspaceSwitcher**

2. **Clicar em outro workspace da lista**

3. **Verificar:**
   - ✅ Workspace ativo muda (visual no dropdown)
   - ✅ Dados da página recarregam (transações, contas, etc filtradas por workspace)
   - ✅ Indicador visual de workspace ativo (checkmark ou highlight)

---

### **Teste 4: Convites e Membros**

1. **Acessar Configurações → Workspace Settings**
   ```
   Sidebar → Configurações → Aba "Workspace"
   ```

2. **Convidar membro:**
   - Clicar "Convidar Membro"
   - Email: teste@email.com
   - Role: CONTRIBUTOR
   - Enviar

3. **Verificar lista de convites pendentes**

4. **Gerenciar membros:**
   - Ver lista de membros atuais
   - Alterar role de um membro
   - Remover membro (se for OWNER)

---

### **Teste 5: RBAC (Permissões)**

#### **Como OWNER:**
- ✅ Pode editar workspace
- ✅ Pode convidar membros
- ✅ Pode alterar roles
- ✅ Pode remover membros
- ✅ Pode deletar workspace

#### **Como ADMIN:**
- ✅ Pode editar workspace
- ✅ Pode convidar membros
- ✅ Pode alterar roles (exceto OWNER)
- ❌ Não pode deletar workspace

#### **Como CONTRIBUTOR:**
- ✅ Pode criar/editar suas próprias transações
- ❌ Não pode gerenciar membros
- ❌ Não pode editar configurações

#### **Como VIEWER:**
- ✅ Apenas visualização
- ❌ Não pode criar/editar nada

---

## 🐛 POSSÍVEIS PROBLEMAS E SOLUÇÕES

### **Problema 1: WorkspaceSwitcher não aparece**
**Causa:** Usuário não autenticado  
**Solução:** Fazer login primeiro

### **Problema 2: Erro ao criar workspace**
**Causa:** Supabase não configurado  
**Solução:** 
```bash
# Verificar .env
VITE_SUPABASE_URL=https://cuwzoffjhefozocqtzju.supabase.co
VITE_SUPABASE_ANON_KEY=<sua_key>
```

### **Problema 3: Dados não filtram por workspace**
**Causa:** Serviços ainda não adaptados  
**Solução:** Próximo passo - integrar workspace_id nos services

### **Problema 4: RLS bloqueia operações**
**Causa:** Políticas muito restritivas  
**Solução:** Verificar logs no Supabase Dashboard

---

## 🔍 CHECKLIST DE VALIDAÇÃO

### **Visual/UX:**
- [ ] WorkspaceSwitcher aparece na sidebar
- [ ] Dropdown abre/fecha suavemente
- [ ] Ícones corretos por tipo (user/heart/users/briefcase)
- [ ] Badges de plano coloridos
- [ ] Workspace ativo tem indicador visual
- [ ] Modais abrem/fecham corretamente

### **Funcionalidade:**
- [ ] Criar workspace funciona
- [ ] Trocar workspace funciona
- [ ] Listar workspaces do usuário funciona
- [ ] Convidar membro funciona
- [ ] Aceitar/recusar convite funciona
- [ ] Alterar role funciona
- [ ] Remover membro funciona
- [ ] Deletar workspace funciona

### **Segurança (RLS):**
- [ ] Apenas membros veem dados do workspace
- [ ] VIEWER não consegue editar
- [ ] CONTRIBUTOR consegue criar dados próprios
- [ ] ADMIN consegue gerenciar membros
- [ ] OWNER consegue deletar workspace
- [ ] Usuários sem acesso são bloqueados

### **Performance:**
- [ ] Troca de workspace é instantânea
- [ ] Lista de workspaces carrega rápido (<500ms)
- [ ] Sem travamentos na UI
- [ ] Cache funciona (não recarrega toda hora)

---

## 📊 DADOS DE TESTE

### **Workspaces de Exemplo:**
```typescript
{
  name: "Meu Workspace",
  type: WorkspaceType.PERSONAL,
  plan: PlanType.FREE
}

{
  name: "Finanças do Casal",
  type: WorkspaceType.COUPLE,
  plan: PlanType.COUPLE
}

{
  name: "Família Silva",
  type: WorkspaceType.FAMILY,
  plan: PlanType.FAMILY_3
}
```

### **Membros de Exemplo:**
```typescript
{
  email: "admin@test.com",
  role: MemberRole.ADMIN
}

{
  email: "colaborador@test.com",
  role: MemberRole.CONTRIBUTOR
}

{
  email: "viewer@test.com",
  role: MemberRole.VIEWER
}
```

---

## 🚀 PRÓXIMOS PASSOS (Após Testes)

1. **Integrar workspace_id em todos os services:**
   - TransactionService
   - AccountService
   - BudgetService
   - GoalService
   - RecurringTransactionService

2. **Adicionar filtros por workspace:**
   - Dashboard mostra apenas dados do workspace ativo
   - Relatórios filtrados
   - Gráficos atualizados

3. **Notificações de convites:**
   - Email quando convite enviado
   - Badge no sino quando tem convite pendente

4. **Limites de plano:**
   - FREE: 1 workspace
   - COUPLE: 1 workspace compartilhado
   - FAMILY_3: até 3 membros
   - Verificar limites ao criar/convidar

---

## 📝 RELATÓRIO DE BUGS

Use este formato para reportar problemas:

```markdown
### Bug: [Título curto]
**Severidade:** [Critical/High/Medium/Low]
**Passos para reproduzir:**
1. ...
2. ...
3. ...

**Resultado esperado:**
...

**Resultado obtido:**
...

**Screenshots/Logs:**
...
```

---

**Dúvidas?** Consulte:
- `docs/DATABASE_MIGRATIONS_GUIDE.md` - Detalhes das migrations
- `src/types/workspace.types.ts` - Tipos e interfaces
- `src/services/workspace.service.ts` - Lógica de negócios
