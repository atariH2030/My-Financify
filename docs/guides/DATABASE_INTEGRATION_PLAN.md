# 📊 Plano de Integração: Banco de Dados & Nuvem

**Projeto**: My-Financify  
**Versão Atual**: v3.11.5  
**Data**: 21/11/2025  
**Status**: 🟡 Planejamento

---

## 🎯 Objetivos

1. **Persistência de dados** - Salvar transações, metas, orçamentos
2. **Sincronização em nuvem** - Acesso multi-dispositivo
3. **Backup automático** - Segurança dos dados
4. **Modo offline** - Funcionar sem internet com sync posterior

---

## 🏗️ Arquitetura Recomendada

### Opção 1: **Supabase** (Recomendado - Gratuito)
✅ **Vantagens**:
- PostgreSQL gerenciado
- Auth integrado (login/registro)
- Real-time subscriptions
- Storage para arquivos
- Edge Functions (serverless)
- API REST automática
- SDK TypeScript oficial
- Tier gratuito generoso (500MB DB, 1GB Storage)

📦 **Stack**:
```
Frontend: React + TypeScript (atual)
Backend: Supabase (PostgreSQL + Auth + Storage)
Cache Local: IndexedDB (Dexie.js)
Sync: SWR ou React Query
```

### Opção 2: **Firebase** (Alternativa)
✅ **Vantagens**:
- Firestore (NoSQL)
- Auth robusto
- Hosting integrado
- Analytics
- Tier gratuito bom

❌ **Desvantagens**:
- NoSQL pode ser limitante para queries complexas
- Vendor lock-in maior

### Opção 3: **Backend Próprio** (Mais controle)
- Node.js + Express
- PostgreSQL / MongoDB
- Deploy: Railway / Render / Fly.io
- Auth: Passport.js / JWT

---

## 📋 Fases de Implementação

### **Fase 1: Setup Inicial** (1-2h)
- [ ] Criar conta Supabase
- [ ] Configurar projeto
- [ ] Definir schema do banco
- [ ] Instalar dependências (`@supabase/supabase-js`)
- [ ] Configurar variáveis de ambiente

### **Fase 2: Schema do Banco** (2-3h)
```sql
-- Tabelas principais
- users (id, email, name, created_at)
- accounts (id, user_id, name, type, balance, currency)
- transactions (id, user_id, account_id, amount, category, date, description)
- categories (id, user_id, name, type, color, icon)
- budgets (id, user_id, category_id, amount, period, month)
- goals (id, user_id, name, target_amount, current_amount, deadline)
- recurring_transactions (id, user_id, amount, frequency, next_date)
- dashboard_settings (id, user_id, widgets, layout_mode)
```

### **Fase 3: Autenticação** (3-4h)
- [ ] Página de login/registro
- [ ] Integrar Supabase Auth
- [ ] Gerenciar sessão do usuário
- [ ] Protected routes
- [ ] Perfil do usuário

### **Fase 4: Migração de Dados** (4-5h)
- [ ] Criar service layer (API client)
- [ ] Migrar storage.service.ts para usar Supabase
- [ ] Implementar cache local (IndexedDB)
- [ ] Sync bidirecional (local ↔ cloud)

### **Fase 5: Features por Página** (8-10h)

#### **Dashboard**
- [ ] Carregar widgets personalizados do usuário
- [ ] Salvar layout no banco
- [ ] Cache local de KPIs

#### **Transações**
- [ ] CRUD completo
- [ ] Filtros e busca
- [ ] Paginação
- [ ] Upload de anexos (Supabase Storage)

#### **Orçamentos**
- [ ] CRUD de budgets
- [ ] Cálculo de progresso em tempo real
- [ ] Alertas de limite

#### **Metas**
- [ ] CRUD de goals
- [ ] Progresso visual
- [ ] Notificações de marcos

#### **Relatórios**
- [ ] Queries agregadas
- [ ] Export CSV/PDF
- [ ] Cache de relatórios

### **Fase 6: Sincronização Offline** (5-6h)
- [ ] Service Worker para cache
- [ ] Queue de operações pendentes
- [ ] Conflict resolution
- [ ] Sync on reconnect

### **Fase 7: Otimizações** (3-4h)
- [ ] Lazy loading de dados
- [ ] Optimistic updates
- [ ] Pagination infinita
- [ ] Debounce de saves

---

## 🔧 Estrutura de Código

```
src/
├── services/
│   ├── supabase.service.ts       # Cliente Supabase
│   ├── auth.service.ts            # Autenticação
│   ├── transactions.service.ts    # CRUD Transações
│   ├── budgets.service.ts         # CRUD Orçamentos
│   ├── goals.service.ts           # CRUD Metas
│   ├── sync.service.ts            # Sincronização
│   └── cache.service.ts           # Cache local (IndexedDB)
├── hooks/
│   ├── useAuth.ts                 # Hook de autenticação
│   ├── useTransactions.ts         # Hook de transações
│   ├── useBudgets.ts              # Hook de orçamentos
│   └── useSync.ts                 # Hook de sincronização
├── types/
│   ├── database.types.ts          # Types gerados do Supabase
│   └── api.types.ts               # Types de API
└── config/
    └── supabase.config.ts         # Configuração
```

---

## 🔐 Segurança

1. **Row Level Security (RLS)** no Supabase
   - Usuários só acessam seus próprios dados
   - Policies automáticas por tabela

2. **Validação**
   - Client-side: Yup/Zod schemas
   - Server-side: Supabase policies

3. **Encriptação**
   - HTTPS obrigatório
   - Tokens JWT seguros
   - Senhas hasheadas (bcrypt)

---

## 💰 Custos (Estimativa)

### **Tier Gratuito Supabase**:
- ✅ 500MB Database
- ✅ 1GB Storage
- ✅ 2GB Bandwidth
- ✅ 50,000 usuários ativos/mês
- ✅ Auth ilimitado

**Suficiente para:** ~1000 usuários ativos com uso moderado

### **Tier Pago** (se necessário):
- **Pro**: $25/mês (8GB DB, 100GB Storage)
- **Team**: $599/mês (empresarial)

---

## 📊 Estimativa de Tempo Total

| Fase | Tempo | Prioridade |
|------|-------|-----------|
| Setup | 2h | 🔴 Alta |
| Schema | 3h | 🔴 Alta |
| Auth | 4h | 🔴 Alta |
| Migração | 5h | 🔴 Alta |
| Features | 10h | 🟡 Média |
| Offline | 6h | 🟢 Baixa |
| Otimização | 4h | 🟢 Baixa |
| **TOTAL** | **34h** | |

**Timeline**: 1-2 semanas (4-5h/dia)

---

## 🚀 Próximos Passos Imediatos

1. **Decidir stack**: Supabase vs Firebase vs Backend próprio
2. **Criar conta** no serviço escolhido
3. **Definir schema** detalhado do banco
4. **Implementar Fase 1** (Setup)
5. **Testar autenticação** básica

---

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Supabase + React Tutorial](https://supabase.com/docs/guides/with-react)
- [IndexedDB (Dexie.js)](https://dexie.org/)
- [SWR for data fetching](https://swr.vercel.app/)

---

**Observação**: Este é um plano vivo e será atualizado conforme o desenvolvimento.
