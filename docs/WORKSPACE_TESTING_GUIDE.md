# 🧪 Guia de Testes - Sistema Workspace Multi-Tenant

**Versão**: v3.15.0  
**Data**: 10/12/2025  
**Autor**: DEV - Rickson

---

## 📋 CHECKLIST DE TESTES

### ✅ PRIORIDADES ALTAS (COMPLETAS)
- [x] WorkspaceContext expandido (558 linhas, 15 métodos CRUD)
- [x] WorkspaceService integrado (5 novos métodos)
- [x] loadMembers implementado em WorkspaceSettings
- [x] Todos erros TypeScript corrigidos (0 erros)

### ✅ PRIORIDADES MÉDIAS (COMPLETAS)
- [x] WorkspaceSettings integrado no routing (main.tsx)
- [x] RLS policies criadas (accounts, budgets, goals, recurring)

### 🧪 TESTES PENDENTES
- [ ] Fluxo de criação de workspace end-to-end
- [ ] Fluxo de invite (enviar/aceitar/recusar)

---

## 🚀 FLUXO 1: CRIAÇÃO DE WORKSPACE

### Objetivo
Testar criação completa de um workspace compartilhado.

### Pré-requisitos
1. Usuário autenticado no sistema
2. Acesso à página WorkspaceSettings

### Passos de Teste

#### 1. Navegar para Workspace Settings
```
1. Login no sistema
2. Clicar em "Workspace" na sidebar
3. Verificar se WorkspaceSettings carrega corretamente
```

**Resultado Esperado**:
- ✅ Página carrega sem erros
- ✅ WorkspaceSwitcher exibido no topo
- ✅ Lista de membros aparece (vazia inicialmente)

---

#### 2. Criar Novo Workspace
```
1. Clicar em botão "+ Novo Workspace" no WorkspaceSwitcher
2. Preencher formulário:
   - Nome: "Finanças da Família"
   - Descrição: "Controle financeiro compartilhado"
   - Tipo: "family"
3. Clicar em "Criar"
```

**Resultado Esperado**:
- ✅ Modal de criação abre
- ✅ Formulário valida campos obrigatórios
- ✅ Workspace criado com sucesso
- ✅ Mensagem de sucesso exibida
- ✅ Workspace aparece no WorkspaceSwitcher
- ✅ Workspace automaticamente selecionado como ativo

**Verificações Backend**:
```sql
-- Verificar no Supabase SQL Editor
SELECT * FROM workspaces WHERE name = 'Finanças da Família';

-- Deve retornar:
-- - id (UUID)
-- - owner_id (UUID do usuário)
-- - name = 'Finanças da Família'
-- - description = 'Controle financeiro compartilhado'
-- - workspace_type = 'family'
-- - plan_type = 'free'
-- - member_count = 1
-- - created_at (timestamp)
```

**Verificações Frontend**:
```javascript
// Abrir DevTools Console
console.log(localStorage.getItem('activeWorkspaceId'));
// Deve retornar: UUID do workspace criado

console.log(localStorage.getItem('workspaces'));
// Deve retornar: Array JSON com o workspace
```

---

#### 3. Editar Informações do Workspace
```
1. Na página WorkspaceSettings
2. Alterar nome para "Finanças Família Silva"
3. Alterar descrição para "Gestão financeira compartilhada - 2025"
4. Clicar em "Salvar Alterações"
```

**Resultado Esperado**:
- ✅ Campos editáveis corretamente
- ✅ Botão "Salvar" ativo após mudanças
- ✅ Salvamento bem-sucedido
- ✅ Mensagem de confirmação exibida
- ✅ Nome atualizado no WorkspaceSwitcher

---

#### 4. Deletar Workspace
```
1. Rolar até seção "Zona de Perigo"
2. Clicar em "Deletar Workspace"
3. Confirmar no modal de confirmação
4. Digitar nome do workspace para confirmar
5. Clicar em "Deletar Permanentemente"
```

**Resultado Esperado**:
- ✅ Modal de confirmação aparece
- ✅ Input de confirmação exigido (digitar nome exato)
- ✅ Workspace soft-deleted (deleted_at definido)
- ✅ Redirecionamento para workspace pessoal padrão
- ✅ Workspace removido do WorkspaceSwitcher

**Verificações Backend**:
```sql
-- Verificar soft delete
SELECT * FROM workspaces 
WHERE name = 'Finanças Família Silva' 
AND deleted_at IS NOT NULL;

-- Deve retornar:
-- - deleted_at (timestamp atual)
```

---

## 👥 FLUXO 2: SISTEMA DE CONVITES

### Objetivo
Testar fluxo completo de convite de membros.

### Pré-requisitos
1. Workspace criado (usar Fluxo 1)
2. Email de outro usuário para convidar
3. Dois navegadores/abas (ou modo anônimo) para simular dois usuários

---

### PARTE A: Enviar Convite

#### 1. Abrir Modal de Convite
```
1. Na página WorkspaceSettings
2. Seção "Membros da Equipe"
3. Clicar em "+ Convidar Membro"
```

**Resultado Esperado**:
- ✅ Modal "Convidar Novo Membro" abre
- ✅ Campos de email e role disponíveis

---

#### 2. Preencher e Enviar Convite
```
1. Digitar email: "teste@exemplo.com"
2. Selecionar role: "editor"
3. Clicar em "Enviar Convite"
```

**Resultado Esperado**:
- ✅ Validação de email (formato correto)
- ✅ Convite criado com sucesso
- ✅ Token único gerado
- ✅ Mensagem de sucesso: "Convite enviado para teste@exemplo.com"
- ✅ Modal fecha automaticamente
- ✅ Convite aparece na lista de "Convites Pendentes"

**Verificações Backend**:
```sql
-- Verificar convite criado
SELECT * FROM workspace_invites 
WHERE email = 'teste@exemplo.com' 
AND status = 'pending';

-- Deve retornar:
-- - id (UUID)
-- - workspace_id (UUID do workspace)
-- - email = 'teste@exemplo.com'
-- - role = 'editor'
-- - status = 'pending'
-- - token (string única)
-- - expires_at (timestamp futuro - 7 dias)
-- - created_at (timestamp)
```

**Verificações Frontend**:
```javascript
// DevTools Console
// Após enviar convite, verificar state
// (usar React DevTools para inspecionar WorkspaceContext)

// invites array deve conter:
{
  id: "uuid",
  email: "teste@exemplo.com",
  role: "editor",
  status: "pending",
  token: "unique_token_here",
  expiresAt: "2025-12-17T..."
}
```

---

### PARTE B: Aceitar Convite

#### 3. Copiar Token do Convite
```
1. Na lista de convites pendentes
2. Localizar convite para "teste@exemplo.com"
3. Copiar token único (exibido na UI ou banco)
```

**Nota**: Em produção, o token seria enviado por email com link direto.

---

#### 4. Abrir Link de Convite (Novo Usuário)
```
1. Abrir nova aba/navegador (modo anônimo)
2. Acessar: https://app.financify.com/accept-invite?token=TOKEN_AQUI
3. Se não autenticado, fazer login/cadastro
```

**Resultado Esperado**:
- ✅ Página de aceite de convite carrega
- ✅ Informações do workspace exibidas:
  - Nome do workspace
  - Quem convidou (owner)
  - Role oferecida
- ✅ Botões "Aceitar" e "Recusar" disponíveis

---

#### 5. Aceitar Convite
```
1. Revisar informações do convite
2. Clicar em "Aceitar Convite"
```

**Resultado Esperado**:
- ✅ Convite aceito com sucesso
- ✅ Usuário adicionado como membro do workspace
- ✅ Status do convite alterado para 'accepted'
- ✅ Redirecionamento para dashboard do workspace
- ✅ Workspace aparece no WorkspaceSwitcher do novo membro
- ✅ Mensagem de boas-vindas exibida

**Verificações Backend**:
```sql
-- Verificar convite aceito
SELECT * FROM workspace_invites 
WHERE email = 'teste@exemplo.com' 
AND status = 'accepted';

-- Verificar membro adicionado
SELECT * FROM workspace_members 
WHERE workspace_id = 'UUID_WORKSPACE' 
AND user_id = 'UUID_NOVO_USUARIO';

-- Deve retornar:
-- - role = 'editor'
-- - joined_at (timestamp atual)
-- - removed_at = NULL

-- Verificar member_count incrementado
SELECT member_count FROM workspaces 
WHERE id = 'UUID_WORKSPACE';

-- Deve retornar: 2 (owner + novo membro)
```

---

### PARTE C: Recusar Convite

#### 6. Enviar Novo Convite (para teste de recusa)
```
1. Repetir Parte A para outro email: "outro@exemplo.com"
2. Copiar token do novo convite
```

---

#### 7. Recusar Convite
```
1. Abrir link com token
2. Clicar em "Recusar Convite"
3. Confirmar ação
```

**Resultado Esperado**:
- ✅ Confirmação solicitada
- ✅ Convite marcado como 'declined'
- ✅ Mensagem: "Convite recusado"
- ✅ Redirecionamento para página inicial ou login
- ✅ Workspace NÃO aparece no WorkspaceSwitcher

**Verificações Backend**:
```sql
-- Verificar convite recusado
SELECT * FROM workspace_invites 
WHERE email = 'outro@exemplo.com' 
AND status = 'declined';

-- Verificar que NÃO foi criado membro
SELECT * FROM workspace_members 
WHERE workspace_id = 'UUID_WORKSPACE' 
AND user_id = 'UUID_USUARIO_QUE_RECUSOU';

-- Deve retornar: 0 linhas (membro não adicionado)
```

---

### PARTE D: Cancelar Convite (Owner)

#### 8. Cancelar Convite Pendente
```
1. Voltar para aba do owner
2. Na lista de "Convites Pendentes"
3. Localizar convite para "outro@exemplo.com" (declined)
4. Clicar em "Cancelar Convite"
5. Confirmar ação
```

**Resultado Esperado**:
- ✅ Convite removido da lista
- ✅ Mensagem de confirmação
- ✅ Convite deletado do banco (hard delete)

**Verificações Backend**:
```sql
-- Verificar convite deletado
SELECT * FROM workspace_invites 
WHERE email = 'outro@exemplo.com';

-- Deve retornar: 0 linhas (convite deletado)
```

---

## 🔐 TESTE DE PERMISSÕES (RLS)

### Objetivo
Verificar se RLS policies estão funcionando corretamente.

### Teste 1: Membro Viewer Não Pode Editar

```
1. Login como membro com role 'viewer'
2. Acessar WorkspaceSettings
3. Tentar editar nome do workspace
```

**Resultado Esperado**:
- ✅ Campos aparecem como read-only
- ✅ Botão "Salvar" desabilitado
- ✅ Mensagem: "Apenas owners e admins podem editar"

---

### Teste 2: Isolamento de Dados Entre Workspaces

```sql
-- Executar no Supabase SQL Editor como usuário A
INSERT INTO accounts (
  user_id, 
  workspace_id, 
  name, 
  type, 
  balance
) VALUES (
  'UUID_USER_A',
  'UUID_WORKSPACE_A',
  'Conta Workspace A',
  'checking',
  1000.00
);

-- Fazer login como usuário B (membro de WORKSPACE_B)
-- Tentar buscar contas:
SELECT * FROM accounts WHERE workspace_id = 'UUID_WORKSPACE_A';

-- Deve retornar: 0 linhas (RLS bloqueia acesso)

-- Buscar contas do próprio workspace:
SELECT * FROM accounts WHERE workspace_id = 'UUID_WORKSPACE_B';

-- Deve retornar: Apenas contas do WORKSPACE_B
```

---

## 📊 MÉTRICAS DE SUCESSO

### Build & Performance
- ✅ Build time: ~16s (aceitável)
- ✅ Bundle size: 740.36 KB → 212.13 KB (gzipped)
- ✅ PWA entries: 46 (2383.48 KiB)
- ✅ 0 erros TypeScript
- ✅ 0 warnings críticos

### Funcionalidades
- ✅ WorkspaceContext: 15 métodos CRUD funcionais
- ✅ WorkspaceService: Integração Supabase completa
- ✅ RLS Policies: Multi-tenant com backward compatibility
- ✅ Routing: WorkspaceSettings acessível via sidebar

---

## 🐛 BUGS CONHECIDOS

### ⚠️ Warning (Não Bloqueante)
**Arquivo**: `WorkspaceContext.tsx:551`  
**Tipo**: Fast Refresh warning  
**Mensagem**: "Fast refresh only works when a file only exports components"  
**Impacto**: ZERO - Apenas aviso cosmético  
**Solução**: Ignorar ou mover hook `useWorkspace` para arquivo separado (baixa prioridade)

---

## 📝 PRÓXIMOS PASSOS

### Após Testes Manuais
1. [ ] Documentar resultados dos testes
2. [ ] Criar testes automatizados (Vitest)
3. [ ] Adicionar E2E tests (Playwright/Cypress)
4. [ ] Implementar limite de membros por plano (FREE: 3, PRO: 10, PREMIUM: ilimitado)
5. [ ] Criar notificações de convite via email (integração SendGrid/Resend)

### Features Futuras
- [ ] Auditoria de ações (quem criou/editou/deletou)
- [ ] Exportar workspace data (backup)
- [ ] Templates de workspace (pré-configurados)
- [ ] Estatísticas de uso do workspace

---

## 🎯 COMANDOS ÚTEIS

### Build
```bash
npm run build
```

### Testes
```bash
npm run test:run    # Todos os testes
npm run test        # Watch mode
```

### Lint
```bash
npm run lint
npm run format
```

### Banco de Dados
```bash
# Aplicar migration RLS
# (Executar manualmente no Supabase SQL Editor)
# Arquivo: supabase/migrations/add_workspace_rls_policies.sql
```

---

**Versão do Guia**: v1.0  
**Última Atualização**: 10/12/2025  
**Autor**: DEV - Rickson
