# 🚀 Guia de Integração - Arquitetura Modular

## 📋 Índice
1. [Sistema de Tradução (i18n)](#sistema-de-tradução-i18n)
2. [Integração Supabase](#integração-supabase)
3. [Template de Componente](#template-de-componente)

---

## 🌍 Sistema de Tradução (i18n)

### ✅ Validação Automática
O arquivo `src/utils/i18n-validator.ts` **valida automaticamente** ao iniciar o dev server.

**Console esperado**:
```
✅ i18n Validation: All translations are complete!
📊 Total keys validated: 165
```

**Se houver erro**:
```
❌ i18n Validation FAILED!
Found 2 missing translation keys:

  🔴 "dashboard.greeting" is missing in: en-US, es-ES
  🔴 "transactions.addNew" is missing in: es-ES
```

### 📝 Como Usar em Componentes

```typescript
import { useTranslation } from '../../contexts/LanguageContext';

function MeuComponente() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### 📂 Adicionar Novas Traduções

1. **Edite os 3 arquivos** (`src/locales/`):
   - `pt-BR.json`
   - `en-US.json`
   - `es-ES.json`

2. **Estrutura aninhada**:
```json
{
  "dashboard": {
    "title": "Painel Principal",
    "greeting": "Bem-vindo",
    "widgets": {
      "balance": "Saldo Total",
      "income": "Receitas"
    }
  }
}
```

3. **Uso no componente**:
```typescript
t('dashboard.title')           // "Painel Principal"
t('dashboard.widgets.balance') // "Saldo Total"
```

---

## 💾 Integração Supabase

### 🎯 Service Centralizado
**Arquivo**: `src/services/supabase-integration.service.ts`

**Importar**:
```typescript
import { supabaseService } from '../services/supabase-integration.service';
```

### 📊 Métodos Disponíveis

#### **Transactions**
```typescript
// Buscar todas (com cache automático)
const transactions = await supabaseService.getTransactions();

// Buscar SEM cache (força requisição)
const freshData = await supabaseService.getTransactions(false);

// Criar nova
const newTx = await supabaseService.createTransaction({
  description: 'Salário',
  amount: 5000,
  type: 'income',
  date: new Date().toISOString(),
  category: 'Trabalho'
});

// Atualizar
await supabaseService.updateTransaction(id, {
  amount: 5500,
  description: 'Salário + Bônus'
});

// Deletar
await supabaseService.deleteTransaction(id);
```

#### **Accounts**
```typescript
const accounts = await supabaseService.getAccounts();
```

#### **Recurring Transactions**
```typescript
const recurring = await supabaseService.getRecurringTransactions();
```

#### **Goals**
```typescript
const goals = await supabaseService.getGoals();
```

#### **Budgets**
```typescript
const budgets = await supabaseService.getBudgets();
```

### 🔄 Cache Management

```typescript
// Limpar TODO cache
supabaseService.clearCache();

// Invalidar cache específico (pattern matching)
supabaseService.invalidateCache('transactions'); // Invalida tudo com "transactions"
supabaseService.invalidateCache('goals');
```

### 🎨 Exemplo Completo em Componente

```typescript
import React, { useEffect, useState } from 'react';
import { supabaseService } from '../../services/supabase-integration.service';
import { Transaction } from '../../types/financial.types';

function TransactionsList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await supabaseService.getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Erro ao carregar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supabaseService.deleteTransaction(id);
      await loadData(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <ul>
      {transactions.map(tx => (
        <li key={tx.id}>
          {tx.description} - R$ {tx.amount}
          <button onClick={() => handleDelete(tx.id)}>Deletar</button>
        </li>
      ))}
    </ul>
  );
}
```

---

## 📦 Template de Componente

### Estrutura Recomendada

```typescript
/**
 * [Nome do Componente]
 * [Descrição breve]
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import { supabaseService } from '../../services/supabase-integration.service';
import { Logger } from '../../services/logger.service';
import type { Transaction } from '../../types/financial.types';
import './[ComponentName].css';

interface [ComponentName]Props {
  // Props tipadas
}

const [ComponentName]: React.FC<[ComponentName]Props> = ({ ...props }) => {
  // 1. HOOKS
  const { t } = useTranslation();
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. EFFECTS
  useEffect(() => {
    loadData();
  }, []);

  // 3. HANDLERS
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await supabaseService.getTransactions();
      setData(result);
      Logger.info('[COMPONENT_NAME]', 'Data loaded successfully');
    } catch (err) {
      const errorMsg = 'Failed to load data';
      setError(errorMsg);
      Logger.error('[COMPONENT_NAME]', err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    try {
      // Ação específica
      await loadData(); // Recarregar após ação
    } catch (err) {
      Logger.error('[COMPONENT_NAME]', err as Error);
    }
  };

  // 4. RENDER
  if (loading) return <div>{t('common.loading')}</div>;
  if (error) return <div>{t('common.error')}: {error}</div>;

  return (
    <div className="component-name">
      <h1>{t('componentName.title')}</h1>
      {/* JSX */}
    </div>
  );
};

export default [ComponentName];
```

---

## ✅ Checklist de Integração

Ao criar/modificar um componente:

- [ ] **Tradução**: Usar `useTranslation()` para textos
- [ ] **Dados**: Usar `supabaseService` (não importar supabase diretamente)
- [ ] **Logs**: Usar `Logger` para info/error/debug
- [ ] **Tipos**: Importar types de `financial.types.ts`
- [ ] **CSS**: Arquivo separado (não inline)
- [ ] **Try/Catch**: Sempre ao fazer requisições
- [ ] **Loading State**: Mostrar feedback ao usuário
- [ ] **Error Handling**: Exibir erros de forma amigável

---

## 🎯 Benefícios da Arquitetura

✅ **Manutenibilidade**: Mudar lógica de banco? Edita 1 service  
✅ **Performance**: Cache automático reduz requisições  
✅ **i18n**: Troca idioma = troca tudo automaticamente  
✅ **Offline-first**: App funciona sem internet (localStorage fallback)  
✅ **Debug**: Logs padronizados + validação automática  
✅ **Escalabilidade**: Adicionar feature = seguir template  

---

**Versão**: 1.0  
**Última atualização**: 4 de dezembro de 2025  
**Autor**: DEV (GitHub Copilot)
