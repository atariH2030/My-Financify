# Sistema de Notificações v3.4.0

## 📋 Visão Geral

Sistema completo de notificações para alertas em tempo real sobre orçamentos, metas e transações.

## 🎯 Funcionalidades

### **Centro de Notificações**
- **Ícone de Sino**: Localizado no header, entre toggle sidebar e tema
- **Badge Vermelho**: Contador de notificações não lidas
- **Animação Ring**: Sino balança quando há notificações não lidas
- **Dropdown**: Lista completa de notificações com 400px de largura

### **6 Tipos de Notificações**
1. **info** (ℹ️) - Informações gerais
2. **success** (✅) - Confirmações de ações
3. **warning** (⚠️) - Avisos importantes
4. **error** (❌) - Erros críticos
5. **budget-alert** (💰) - Alertas de orçamento
6. **goal-reminder** (🎯) - Lembretes de metas
7. **transaction** (💳) - Confirmações de transações

### **4 Níveis de Prioridade**
- **low**: Notificações informativas
- **medium**: Alertas padrão (orçamento em 80-90%)
- **high**: Alertas importantes (orçamento em 90-100%)
- **urgent**: Alertas críticos (orçamento ultrapassado)

## 🔧 Arquitetura Técnica

### **NotificationService.ts** (310 linhas)
**Backend completo com:**
- `create()` - Criar notificação manual
- `getAll()` - Listar todas
- `getUnread()` - Apenas não lidas
- `getUnreadCount()` - Contador
- `markAsRead(id)` - Marcar como lida
- `markAllAsRead()` - Marcar todas
- `remove(id)` - Remover individual
- `clearAll()` - Limpar todas
- `subscribe(listener)` - Observer pattern

**Métodos Helper:**
```typescript
// Alerta quando orçamento atinge threshold
notifyBudgetAlert(category, currentSpent, limitAmount, percentage)

// Lembrete de meta próxima ao prazo
notifyGoalReminder(title, daysRemaining, current, target)

// Confirmação de transação (criar/editar/excluir)
notifyTransaction(action, description, amount)
```

**Regras de Prioridade:**
- ≥100% gasto → urgent (borda vermelha 5px)
- ≥90% gasto → high (borda laranja 3px)
- ≥threshold → medium (borda azul 2px)
- Transações → low (sem borda especial)

**Armazenamento:**
- LocalStorage com max 50 notificações
- FIFO quando exceder limite
- Persistência entre sessões

### **NotificationCenter.css** (340 linhas)
**Estilos completos:**
- `.notification-bell` - Ícone com animação ring
- `.notification-badge` - Badge gradiente vermelho
- `.notification-dropdown` - Card flutuante z-index 1000
- `.notification-item` - Card individual com indicadores
- `.unread` - Borda azul esquerda + ponto azul 8px
- `.priority-urgent/high/medium` - Bordas coloridas
- Cores por tipo: info (azul), success (verde), warning (amarelo), error/budget (vermelho), goal (roxo)

**Responsividade:**
- Desktop: 400px largura, ícones 40px
- Tablet: 350px largura
- Mobile: Full-width (calc(100vw - 32px)), ícones 32px

### **NotificationCenter.tsx** (230 linhas)
**Componente React com:**
- `useState`: notifications[], isOpen, filterType
- `useEffect`: Subscribe ao service, close on outside click
- **Filtros**: all, budget-alert, goal-reminder, transaction
- **Ações**: marcar como lida, marcar todas, limpar todas, remover individual
- **Tempo relativo**: "Agora mesmo", "5m atrás", "2h atrás", "Ontem", "3d atrás"
- **Empty state**: Ícone + texto quando sem notificações

## 🔗 Integrações

### **Budgets.tsx**
```typescript
// Após recalcular orçamentos
checkBudgetAlerts(updatedBudgets);

// Notifica se percentage ≥ alertThreshold
if (percentage >= alertThreshold) {
  NotificationService.notifyBudgetAlert(
    budget.category,
    budget.currentSpent,
    budget.limitAmount,
    percentage
  );
}
```

**Quando notifica:**
- Recálculo manual (botão "Recalcular")
- Load inicial de dados
- Após criar/editar transação (se afetar orçamento)

### **Transactions.tsx**
```typescript
// Ao criar transação
NotificationService.notifyTransaction('created', description, amount);

// Ao editar transação
NotificationService.notifyTransaction('updated', description, amount);

// Ao excluir transação
NotificationService.notifyTransaction('deleted', description, amount);
```

**Mensagens:**
- Criada: "💳 Nova transação: Mercado (R$ 150,00)"
- Editada: "💳 Transação atualizada: Aluguel (R$ 1.200,00)"
- Excluída: "💳 Transação removida: Netflix (R$ 39,90)"

### **main.tsx**
```tsx
import NotificationCenter from './components/notifications/NotificationCenter';

<div className="sidebar-header-bottom">
  <button className="sidebar-toggle">...</button>
  <NotificationCenter />  {/* Novo componente */}
  <button className="theme-toggle">...</button>
</div>
```

## 📊 Fluxo de Dados

```
[Budget recalculated] → checkBudgetAlerts()
  ↓
NotificationService.notifyBudgetAlert(...)
  ↓
Storage: notifications array (max 50)
  ↓
Emit event to subscribers
  ↓
NotificationCenter updates state
  ↓
Badge counter + dropdown list updated
```

## 🎨 Design Tokens

**Cores das Notificações:**
- Info: `#3b82f6` (azul)
- Success: `#10b981` (verde)
- Warning: `#f59e0b` (amarelo)
- Error/Budget: `#ef4444` (vermelho)
- Goal: `#8b5cf6` (roxo)

**Animações:**
```css
@keyframes ring {
  0%, 100% { transform: rotate(0deg); }
  10%, 30% { transform: rotate(-10deg); }
  20%, 40% { transform: rotate(10deg); }
}
```

**Z-index Hierarchy:**
- Dropdown: 1000
- Badge: 1 (relative ao bell)
- Overlay: 999

## 🧪 Como Testar

### **Teste 1: Alerta de Orçamento**
1. Criar orçamento "Alimentação" com limite R$ 500,00, threshold 80%
2. Adicionar transação de despesa "Mercado" R$ 400,00 categoria "Alimentação"
3. Clicar "Recalcular" na página de orçamentos
4. ✅ Sino deve balançar + badge vermelho "1"
5. Abrir dropdown → notificação "💰 Orçamento próximo do limite: Alimentação"

### **Teste 2: Notificação de Transação**
1. Criar nova transação "Netflix" R$ 39,90
2. ✅ Sino balança + badge incrementa
3. Abrir dropdown → notificação "💳 Nova transação: Netflix (R$ 39,90)"
4. Clicar notificação → marca como lida (remove borda azul + ponto)

### **Teste 3: Filtros**
1. Acumular notificações de orçamentos, transações e metas
2. Clicar "💰 Orçamentos" → mostra apenas budget-alert
3. Clicar "💳 Transações" → mostra apenas transaction
4. Clicar "Todas" → mostra todas novamente

### **Teste 4: Ações em Massa**
1. Ter 5+ notificações não lidas
2. Clicar "✓ Ler Todas" → todas ficam sem indicador unread
3. Clicar "🗑️ Limpar" → confirmar → dropdown vazio

### **Teste 5: Responsividade**
1. Abrir em desktop (1920px) → dropdown 400px centralizado
2. Reduzir para tablet (768px) → dropdown 350px
3. Reduzir para mobile (375px) → dropdown full-width, ícones menores

## 🚀 Melhorias Futuras

### **Fase 1 (Prioridade Alta):**
- [ ] Integração com Goals: notifyGoalReminder() quando faltam 7 dias
- [ ] Persistir flag de "já notificado" para evitar alertas duplicados
- [ ] Adicionar som opcional ao receber notificação

### **Fase 2 (Prioridade Média):**
- [ ] Notificações agendadas (lembretes de contas a pagar)
- [ ] Configurações: habilitar/desabilitar tipos de notificação
- [ ] Marcar como lida automaticamente após X segundos aberto

### **Fase 3 (Prioridade Baixa):**
- [ ] Push notifications (PWA)
- [ ] Email/SMS notifications (requer backend)
- [ ] Histórico de notificações antigas (arquivadas)
- [ ] Estatísticas: total de alertas por tipo/período

## 📝 Notas Técnicas

**Observer Pattern:**
- Service mantém array de listeners
- subscribe() adiciona listener, retorna unsubscribe function
- Cada notificação criada emite evento para todos listeners
- NotificationCenter se inscreve no mount, cancela no unmount

**Performance:**
- Máximo 50 notificações (FIFO remove antigas)
- Filtros computados on-the-fly (sem memoização necessária)
- Dropdown fecha ao clicar fora (document.addEventListener)
- Animações CSS puras (sem JS)

**Acessibilidade:**
- Títulos descritivos (title attributes)
- Contraste adequado (WCAG AA)
- Ícones com emoji fallback
- Keyboard navigation pronto (falta implementar Tab)

---

**Status:** ✅ **Sistema Completo e Operacional**  
**Versão:** 3.4.0  
**Data:** Janeiro 2025  
**Autor:** GitHub Copilot + Rickson
