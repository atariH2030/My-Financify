# 🎯 Trilha de Implementação Estratégica - My-Financify

**Autor**: DEV - Rickson  
**Data**: 9 de dezembro de 2025  
**Objetivo**: Roadmap do mais **necessário** ao menos **preocupante**

---

## 🏆 FILOSOFIA DA TRILHA

### Ordem de Prioridade (Impacto vs Esforço)
```
P0 (CRÍTICO)    → Bloqueia lançamento ou monetização
P1 (ESSENCIAL)  → Alto impacto, deve estar na v1.0
P2 (IMPORTANTE) → Melhora experiência significativamente
P3 (DESEJÁVEL)  → Nice-to-have, pode esperar v2.0
P4 (FUTURO)     → Long-term vision
```

---

## 🚀 FASE 1: FUNDAÇÃO (Semana 1-2)

### P0 - Sistema de Autenticação Robusto
**Status**: ✅ Implementado (Supabase)  
**Necessário para**: Workspaces compartilhados

**Checklist**:
- [x] Login/Registro funcional
- [x] Recuperação de senha
- [x] Session management
- [ ] **OAuth (Google/Facebook)** ⚠️ PENDENTE
- [ ] **2FA (Two-Factor Auth)** ⚠️ CRÍTICO para Family

---

### P0 - Database Schema Multi-Workspace
**Status**: 🔴 NÃO INICIADO  
**Bloqueador**: Impede workspaces compartilhados

**Ações**:
1. Criar tabela `workspaces`
2. Criar tabela `workspace_members` (roles/permissions)
3. Migrar `transactions`, `budgets`, `goals` para incluir `workspace_id`
4. Criar RLS (Row Level Security) no Supabase

**Tempo Estimado**: 1 dia (crítico)

---

### P0 - Sistema de Planos e Billing
**Status**: 🔴 NÃO INICIADO  
**Bloqueador**: Necessário para monetização

**Planos Propostos**:
```typescript
enum PlanType {
  FREE = 'free',           // 1 usuário
  PRO = 'pro',             // 1 usuário + features avançadas
  COUPLE = 'couple',       // 2 usuários (casal)
  FAMILY_3 = 'family_3',   // Até 3 membros
  FAMILY_5 = 'family_5',   // Até 5 membros
  FAMILY_PLUS = 'family_plus' // Ilimitado
}
```

**Integração**: Stripe ou Pagar.me (Brasil)  
**Tempo Estimado**: 2 dias

---

## 🏗️ FASE 2: WORKSPACES COMPARTILHADOS (Semana 2-3)

### P1 - Arquitetura de Workspaces
**Status**: 🔴 NÃO INICIADO  
**Impacto**: MUITO ALTO

**Conceito**:
```
User (Rickson)
  ├── Workspace: "Finanças Pessoais" (owner)
  ├── Workspace: "Família Silva" (owner)
  │   ├── Member: Esposa (admin)
  │   ├── Member: Filho 1 (viewer)
  │   └── Member: Filho 2 (contributor)
  └── Workspace: "Projeto X" (member - convidado)
```

**Implementação**:
```typescript
interface Workspace {
  id: string;
  name: string;
  type: 'personal' | 'couple' | 'family' | 'business';
  ownerId: string;
  createdAt: Date;
  planType: PlanType;
  settings: WorkspaceSettings;
}

interface WorkspaceMember {
  workspaceId: string;
  userId: string;
  role: MemberRole;
  permissions: Permission[];
  invitedBy: string;
  joinedAt: Date;
}
```

**Tempo Estimado**: 3 dias

---

### P1 - Sistema de Permissões (RBAC)
**Status**: 🔴 NÃO INICIADO  
**Impacto**: CRÍTICO para segurança

**Roles Propostos**:
```typescript
enum MemberRole {
  OWNER = 'owner',           // Criador (full access)
  ADMIN = 'admin',           // Administrador (quase full)
  CONTRIBUTOR = 'contributor', // Pode criar/editar
  VIEWER = 'viewer'          // Apenas visualizar
}

enum Permission {
  // Transações
  'transactions:create',
  'transactions:read',
  'transactions:update',
  'transactions:delete',
  
  // Orçamentos
  'budgets:create',
  'budgets:read',
  'budgets:update',
  'budgets:delete',
  
  // Metas
  'goals:create',
  'goals:read',
  'goals:update',
  'goals:delete',
  
  // Contas
  'accounts:create',
  'accounts:read',
  'accounts:update',
  'accounts:delete',
  
  // Membros (apenas OWNER/ADMIN)
  'members:invite',
  'members:remove',
  'members:update-role',
  
  // Configurações (apenas OWNER)
  'settings:update',
  'workspace:delete',
  'billing:manage'
}
```

**Matriz de Permissões**:
```
                  OWNER  ADMIN  CONTRIBUTOR  VIEWER
transactions:*     ✅     ✅        ✅         ❌
budgets:*          ✅     ✅        ✅         ❌
goals:*            ✅     ✅        ✅         ❌
accounts:*         ✅     ✅        ❌         ❌
members:*          ✅     ✅        ❌         ❌
settings:*         ✅     ❌        ❌         ❌
billing:*          ✅     ❌        ❌         ❌

* (read para VIEWER)   ❌     ❌        ❌         ✅
```

**Caso de Uso - Família**:
- **Pai (OWNER)**: Controle total, gerencia membros, billing
- **Mãe (ADMIN)**: Pode adicionar transações, criar orçamentos, ver tudo
- **Filho 18+ (CONTRIBUTOR)**: Adiciona suas próprias transações, vê orçamento familiar
- **Filho <18 (VIEWER)**: Apenas visualiza (educação financeira)

**Tempo Estimado**: 2 dias

---

### P1 - UI de Seleção de Workspace
**Status**: 🔴 NÃO INICIADO  

**Componentes Necessários**:
1. `WorkspaceSwitcher` - Dropdown para trocar workspace
2. `WorkspaceSettings` - Gerenciar membros, roles, settings
3. `InviteMemberModal` - Convidar por email
4. `MembersList` - Listar membros e editar roles

**Localização UI**:
- Sidebar: Adicionar switcher no topo (abaixo do logo)
- Settings: Nova aba "Workspace & Membros"

**Tempo Estimado**: 2 dias

---

## 💰 FASE 3: MONETIZAÇÃO (Semana 3-4)

### P1 - Planos Family & Pricing
**Status**: 🔴 NÃO INICIADO  

**Estrutura de Planos**:
```typescript
const PRICING_PLANS = {
  FREE: {
    name: 'FREE',
    price: 0,
    members: 1,
    features: [
      'Até 50 transações/mês',
      '1 workspace',
      '3 contas bancárias',
      'Dashboard básico'
    ]
  },
  PRO: {
    name: 'PRO',
    price: 19.90,
    members: 1,
    features: [
      'Transações ilimitadas',
      '1 workspace',
      'Contas ilimitadas',
      'Dashboard avançado',
      'Relatórios PDF',
      'Suporte prioritário'
    ]
  },
  COUPLE: {
    name: 'CASAL',
    price: 29.90, // ~50% desconto vs 2x PRO
    members: 2,
    features: [
      'Tudo do PRO +',
      '2 usuários (casal)',
      'Dashboard compartilhado',
      'Orçamento conjunto',
      'Metas familiares'
    ],
    badge: '❤️ Mais Escolhido'
  },
  FAMILY_3: {
    name: 'FAMÍLIA 3',
    price: 39.90,
    members: 3,
    features: [
      'Tudo do CASAL +',
      'Até 3 membros',
      'Controle parental',
      'Permissões customizáveis',
      'Educação financeira infantil'
    ]
  },
  FAMILY_5: {
    name: 'FAMÍLIA 5',
    price: 49.90,
    members: 5,
    features: [
      'Tudo do FAMÍLIA 3 +',
      'Até 5 membros',
      'Mesada digital',
      'Relatórios por membro'
    ]
  },
  FAMILY_PLUS: {
    name: 'FAMÍLIA+',
    price: 69.90,
    members: Infinity,
    features: [
      'Tudo do FAMÍLIA 5 +',
      'Membros ilimitados',
      'Multi-workspaces',
      'API de terceiros',
      'Suporte 24/7',
      'Consultoria mensal'
    ],
    badge: '👑 Premium'
  }
};
```

**Diferencial Competitivo**:
- **Organizee**: Não tem planos família (só individual)
- **GuiaBolso**: Descontinuado
- **Mobills**: Plano família existe mas é caro (R$ 89/mês)

**Nosso Posicionamento**: Planos família acessíveis e flexíveis

**Tempo Estimado**: 1 dia (estrutura) + integração Stripe

---

### P1 - Gateway de Pagamento
**Status**: 🔴 NÃO INICIADO  

**Opções para Brasil**:
1. **Stripe** (internacional, aceita PIX via plugin)
2. **Pagar.me** (brasileiro, PIX nativo)
3. **Mercado Pago** (alternativa popular)

**Recomendação**: **Stripe** (mais robusto) + Plugin PIX

**Implementação**:
```typescript
// services/billing.service.ts
class BillingService {
  async createSubscription(userId: string, plan: PlanType): Promise<Subscription>
  async cancelSubscription(subscriptionId: string): Promise<void>
  async updatePaymentMethod(userId: string, paymentMethod: PaymentMethod): Promise<void>
  async getInvoices(userId: string): Promise<Invoice[]>
}
```

**Tempo Estimado**: 3 dias

---

## 🎨 FASE 4: UX AVANÇADO (Semana 4-5)

### P2 - Dashboard Unificado Multi-Workspace
**Status**: 🔴 NÃO INICIADO  

**Visão Consolidada**:
- Ver saldo de TODOS os workspaces
- Filtrar por workspace
- Gráficos comparativos (Pessoal vs Família)

**Tempo Estimado**: 2 dias

---

### P2 - Notificações Familiares
**Status**: 🔴 NÃO INICIADO  

**Casos de Uso**:
- "Filho João adicionou gasto de R$ 150 (Lazer)"
- "Orçamento 'Alimentação' atingiu 80% (Família Silva)"
- "Meta 'Viagem Disney' completou 50%! 🎉"

**Tempo Estimado**: 1 dia

---

### P2 - Mesada Digital (Feature Premium)
**Status**: 🔴 NÃO INICIADO  

**Conceito**:
- Pais definem mesada mensal para filhos
- Sistema cria "carteira virtual" do filho
- Filho pode categorizar gastos da mesada
- Pais recebem relatório de como foi gasto

**Implementação**:
```typescript
interface Allowance {
  childUserId: string;
  amount: number;
  frequency: 'weekly' | 'monthly';
  startDate: Date;
  autoApproveLimit?: number; // Auto-aprovar gastos até X
}
```

**Tempo Estimado**: 3 dias

---

## 🔧 FASE 5: REFINAMENTO (Semana 5-6)

### P3 - Auditoria de Ações (Activity Log)
**Status**: 🔴 NÃO INICIADO  

**Para Segurança**:
- "João adicionou transação R$ 500 às 14:32"
- "Maria editou orçamento 'Moradia' às 09:15"
- "Pai removeu permissão de João às 18:00"

**Tempo Estimado**: 2 dias

---

### P3 - Relatórios por Membro
**Status**: 🔴 NÃO INICIADO  

**Caso de Uso**:
- "Quanto cada filho gastou este mês?"
- "Quem mais contribuiu para economizar?"
- "Ranking de economia familiar (gamificação)"

**Tempo Estimado**: 2 dias

---

### P4 - Chat Interno Família (Futuro)
**Status**: 🔵 LONG-TERM  

**Conceito**:
- Chat interno por workspace
- Discussões sobre gastos
- Votação em decisões financeiras

**Tempo Estimado**: 1 semana (baixa prioridade)

---

## 📊 RESUMO - TRILHA DE IMPLEMENTAÇÃO

### **CRÍTICO (Fazer AGORA - Semana 1-2)**
1. ✅ Autenticação (já feito)
2. 🔴 Database Schema Multi-Workspace (1 dia)
3. 🔴 Sistema de Planos (2 dias)
4. 🔴 Arquitetura Workspaces (3 dias)

### **ESSENCIAL (Semana 2-3)**
5. 🔴 Sistema de Permissões RBAC (2 dias)
6. 🔴 UI Workspace Switcher (2 dias)
7. 🔴 Planos Family & Pricing (1 dia)
8. 🔴 Gateway Pagamento (3 dias)

### **IMPORTANTE (Semana 3-4)**
9. 🔴 Dashboard Multi-Workspace (2 dias)
10. 🔴 Notificações Familiares (1 dia)
11. 🔴 Mesada Digital (3 dias)

### **DESEJÁVEL (Semana 4-5)**
12. 🔴 Activity Log (2 dias)
13. 🔴 Relatórios por Membro (2 dias)

### **FUTURO (Semana 6+)**
14. 🔵 Chat Interno
15. 🔵 Gamificação Familiar
16. 🔵 Integração Open Banking

---

## 🎯 PRÓXIMO PASSO RECOMENDADO

### **START HERE** 👇

**1. Database Schema Multi-Workspace** (1 dia)
- Criar migrations Supabase
- Implementar RLS (Row Level Security)
- Migrar dados existentes

**Por quê começar aqui?**
- ✅ Bloqueia todas as outras features de workspace
- ✅ Mudança estrutural (melhor fazer cedo)
- ✅ Define arquitetura para todo o resto

**Depois deste, seguir ordem da trilha!**

---

## 📝 NOTAS IMPORTANTES

### Decisões Arquiteturais Críticas

1. **Single Workspace vs Multi-Workspace**:
   - FREE/PRO: 1 workspace apenas
   - FAMILY+: Múltiplos workspaces (ex: "Família" + "Trabalho")

2. **Soft Delete vs Hard Delete**:
   - Workspaces: Soft delete (podem restaurar)
   - Members: Soft delete (histórico de quem era membro)

3. **RLS vs Application Level**:
   - Usar RLS do Supabase (mais seguro)
   - Validar permissões também no frontend (UX)

4. **Billing**:
   - OWNER paga sempre
   - Não pode remover OWNER sem transferir ownership
   - Downgrade = remove membros excedentes (aviso antes)

---

**Pronto para começar?** 🚀  
**Sugestão**: Iniciar por Database Schema Multi-Workspace

---

**Versão**: 1.0  
**Status**: 📋 Roadmap Completo  
**Próxima Revisão**: Após cada fase concluída
