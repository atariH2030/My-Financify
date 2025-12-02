# 🤖 Sistema de IA Integrada - Guia Completo

## 📋 Visão Geral

Sistema de **IA Financeira Personalizada** integrado ao Financy Life, utilizando **Google Gemini Pro** (gratuito) para análise comportamental, notificações inteligentes e assistente conversacional.

---

## ✨ Funcionalidades

### 1. **Análise Comportamental**
- Identificação de padrões de gastos
- Detecção de anomalias (gastos atípicos)
- Previsão de despesas futuras

### 2. **Notificações Inteligentes**
- Alertas contextuais automáticos
- Sugestões de economia baseadas em histórico
- Lembretes preditivos

### 3. **Assistente Conversacional**
- Chat em linguagem natural
- Respostas contextualizadas aos dados do usuário
- Histórico de conversa mantido

### 4. **Insights Proativos**
- Widget no dashboard com análises em tempo real
- Classificação por prioridade (baixa, média, alta)
- Ações executáveis diretamente dos insights

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────┐
│         Google Gemini 1.5 Flash        │
│      (Modelo gratuito e rápido)        │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│      src/services/ai.service.ts        │
│  • analyze()     • chat()              │
│  • generateProactiveInsights()         │
│  • detectAnomalies()                   │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│      Integração com Services           │
│  • notification.service.ts             │
│  • transactions.service.ts             │
│  • budgets.service.ts                  │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│          UI Components                 │
│  • AIChat.tsx (chat conversacional)    │
│  • AIInsights.tsx (dashboard widget)   │
└─────────────────────────────────────────┘
```

---

## 🚀 Setup (Passo a Passo)

### **Passo 1: Obter API Key do Google Gemini**

1. Acesse: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em **"Create API Key"** (ou "Get API Key")
4. Copie a chave gerada (formato: `AIzaSy...`)

**Importante**: 
- ✅ **Gratuito**: 60 requisições/minuto
- ✅ **1 milhão de tokens/dia** no tier gratuito
- ✅ Não exige cartão de crédito

### **Passo 2: Configurar no App**

#### Opção A: Via Interface (Recomendado)
1. Abra o app Financy Life
2. Vá em **Configurações** (⚙️)
3. Encontre seção **"Assistente IA"**
4. Cole sua API Key no campo
5. Clique em **"Salvar"**

#### Opção B: Programaticamente
```typescript
import AIService from './services/ai.service';

await AIService.configure({
  provider: 'gemini',
  apiKey: 'SUA_API_KEY_AQUI',
  model: 'gemini-1.5-flash',
  maxTokens: 2048,
  temperature: 0.7,
});
```

### **Passo 3: Testar Integração**

```typescript
// Verificar se está configurado
const isConfigured = await AIService.isConfigured();
console.log('IA configurada:', isConfigured);

// Fazer uma pergunta simples
const context = {
  userId: 'user_123',
  timeRange: {
    start: '2025-01-01',
    end: '2025-01-31',
  },
  transactions: {
    total: 15,
    income: 5000,
    expenses: 3200,
    byCategory: {
      'Alimentação': 800,
      'Transporte': 400,
      'Lazer': 300,
    },
  },
};

const response = await AIService.chat(
  'Como estão meus gastos este mês?',
  context
);

console.log('Resposta da IA:', response);
```

---

## 📦 Componentes Criados

### **1. ai.service.ts** (650 linhas)
**Localização**: `src/services/ai.service.ts`

**Métodos Principais**:
```typescript
// Configuração
configure(config: Partial<AIProviderConfig>): Promise<void>
getConfig(): Promise<AIProviderConfig>
isConfigured(): Promise<boolean>

// Análise
analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse>
generateProactiveInsights(context: AIContext): Promise<AIInsight[]>

// Chat
chat(message: string, context: AIContext): Promise<string>
clearConversation(): Promise<void>

// Insights
getInsights(): Promise<AIInsight[]>
```

**Detecção Automática**:
- ⚠️ **Gastos anormais**: Detecta desvios >30% da média
- 💰 **Alertas de orçamento**: Avisa quando >80% usado
- 💡 **Dicas de economia**: Identifica categorias com maior potencial

### **2. AIChat.tsx** (230 linhas)
**Localização**: `src/components/ai/AIChat.tsx`

**Features**:
- Interface conversacional moderna
- Histórico de mensagens (máximo 20)
- Loading states com animação
- Sugestões de perguntas iniciais
- Markdown básico (negrito, quebras de linha)
- Auto-scroll para última mensagem
- Enter para enviar, Shift+Enter para nova linha

**Props**:
```typescript
interface AIChatProps {
  context: AIContext;  // Contexto financeiro do usuário
  onClose?: () => void; // Callback para fechar modal
}
```

### **3. AIInsights.tsx** (180 linhas)
**Localização**: `src/components/ai/AIInsights.tsx`

**Features**:
- Widget para dashboard
- Mostra 3 insights mais recentes (prioridade alta/média)
- Categorização por tipo (warning, tip, achievement, prediction)
- Ações clicáveis (navega para transações/orçamentos/metas)
- Tempo relativo ("5m atrás", "Ontem", etc.)
- Botão para abrir chat
- Estado vazio elegante

**Props**:
```typescript
interface AIInsightsProps {
  onOpenChat?: () => void; // Callback para abrir chat
}
```

### **4. ai.types.ts** (110 linhas)
**Localização**: `src/types/ai.types.ts`

**Tipos Principais**:
- `AIMessage`: Mensagem do chat (user/assistant)
- `AIContext`: Contexto financeiro completo
- `AIInsight`: Insight gerado pela IA
- `AIAnalysisRequest/Response`: Payloads de análise
- `AINotificationConfig`: Configuração de notificações
- `AIProviderConfig`: Configuração do provedor (Gemini/OpenAI/etc)

---

## 💻 Integração com Dashboard

### **Exemplo de Uso no Dashboard**

```typescript
// Dashboard.tsx
import React, { useState } from 'react';
import AIInsights from '../components/ai/AIInsights';
import AIChat from '../components/ai/AIChat';

const Dashboard: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Montar contexto baseado nos dados do usuário
  const aiContext = {
    userId: currentUser.id,
    timeRange: {
      start: startOfMonth(new Date()).toISOString(),
      end: new Date().toISOString(),
    },
    transactions: {
      total: transactions.length,
      income: transactions.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
      expenses: transactions.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
      byCategory: groupByCategory(transactions),
    },
    budgets: {
      total: budgets.reduce((sum, b) => sum + b.limit, 0),
      used: budgets.reduce((sum, b) => sum + b.spent, 0),
      percentage: calculateBudgetPercentage(budgets),
      alerts: budgets.filter(b => b.percentage >= 80).length,
    },
    goals: {
      total: goals.length,
      completed: goals.filter(g => g.progress >= 100).length,
      inProgress: goals.filter(g => g.progress < 100).length,
    },
  };

  return (
    <div className="dashboard">
      {/* Widget de Insights no Grid */}
      <div className="dashboard-grid">
        <AIInsights onOpenChat={() => setIsChatOpen(true)} />
        {/* Outros widgets... */}
      </div>

      {/* Chat Modal (opcional) */}
      {isChatOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AIChat 
              context={aiContext}
              onClose={() => setIsChatOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## 🔔 Notificações Inteligentes Automáticas

### **Executar Insights Proativos**

```typescript
// Executar periodicamente (ex: a cada hora ou quando houver mudanças)
import AIService from './services/ai.service';

async function runProactiveAnalysis() {
  const context = getCurrentUserContext();
  const insights = await AIService.generateProactiveInsights(context);
  
  console.log(`✅ ${insights.length} insights gerados`);
  // Insights de alta prioridade já geram notificações automaticamente
}

// Agendar execução
setInterval(runProactiveAnalysis, 60 * 60 * 1000); // A cada hora
```

**Tipos de Insights Gerados Automaticamente**:
1. **Gastos Anormais**: Detecta quando gastos excedem >30% da média
2. **Alertas de Orçamento**: Avisa quando >80% do orçamento foi usado
3. **Dicas de Economia**: Identifica categorias com maior potencial de redução (>30% do total)

---

## 🎨 Customização

### **Alterar Modelo de IA**

```typescript
await AIService.configure({
  model: 'gemini-1.5-pro', // Mais poderoso (mas pago após limite)
  // ou
  model: 'gemini-1.5-flash', // Mais rápido e gratuito (padrão)
});
```

### **Ajustar Temperatura (Criatividade)**

```typescript
await AIService.configure({
  temperature: 0.3, // Mais conservador e preciso
  // ou
  temperature: 1.0, // Mais criativo e variado
});
```

### **Mudar Provedor (Futuro)**

```typescript
// Arquitetura preparada para múltiplos provedores
await AIService.configure({
  provider: 'openai',
  apiKey: 'sk-...',
  model: 'gpt-4-turbo',
  endpoint: 'https://api.openai.com/v1/chat/completions',
});
```

---

## 📊 Custos e Limites

### **Google Gemini 1.5 Flash (Atual)**
- ✅ **Grátis**: 60 requisições/minuto
- ✅ **1M tokens/dia** grátis
- ✅ Suficiente para **centenas de usuários ativos**
- 💰 Após limite: $0.075/1M tokens input, $0.30/1M tokens output

### **Estimativa de Uso por Usuário**
- **Chat**: ~1000 tokens/mensagem (contexto + resposta)
- **Insights proativos**: ~500 tokens/execução
- **Uso médio/dia**: 5-10 mensagens + 1 insight = ~6K tokens/usuário
- **Suporta grátis**: ~165 usuários ativos/dia (1M/6K)

### **Quando Migrar para Pago**
- Após **500+ usuários ativos diários**
- Quando precisar de análises mais complexas (Gemini Pro)
- Se quiser usar GPT-4 (mais caro mas melhor qualidade)

---

## 🧪 Testes

### **Teste Manual**

1. Configure API Key
2. Abra Dashboard
3. Veja widget AIInsights
4. Clique em "Perguntar à IA"
5. Digite: "Quanto gastei este mês?"
6. Verifique resposta contextualizada

### **Teste de Insights Proativos**

```typescript
// No console do navegador
import AIService from './services/ai.service';

const mockContext = {
  userId: 'test_user',
  timeRange: { start: '2025-01-01', end: '2025-01-31' },
  transactions: {
    total: 50,
    income: 5000,
    expenses: 6500, // Gasto >30% acima da média (5000)
    byCategory: {
      'Alimentação': 2000, // 30%+ do total
      'Transporte': 500,
      'Lazer': 300,
    },
  },
  budgets: {
    total: 5000,
    used: 4500,
    percentage: 90, // Alerta: >80%
    alerts: 2,
  },
  patterns: {
    topCategories: ['Alimentação', 'Transporte'],
    avgMonthlySpending: 5000,
    recurringTransactions: 5,
  },
};

const insights = await AIService.generateProactiveInsights(mockContext);
console.log('Insights gerados:', insights);
// Deve gerar 3 insights: anomalia, orçamento, dica de economia
```

---

## 🐛 Troubleshooting

### **Problema: "API Key não configurada"**
- ✅ Verifique se colou a chave corretamente (sem espaços)
- ✅ Certifique-se de que salvou as configurações
- ✅ Limpe localStorage e configure novamente

### **Problema: "Error 400 - Invalid API Key"**
- ✅ Gere nova API Key no Google AI Studio
- ✅ Verifique se a chave está ativa (não deletada)
- ✅ Confirme que está usando Gemini (não outra API)

### **Problema: "Error 429 - Rate Limit"**
- ⚠️ Você excedeu 60 req/min (improvável em uso normal)
- ✅ Aguarde 1 minuto e tente novamente
- ✅ Considere implementar debounce nos inputs

### **Problema: Respostas genéricas (não contextualizadas)**
- ✅ Verifique se `AIContext` está sendo montado corretamente
- ✅ Confirme que transações/budgets/goals têm dados
- ✅ Aumente `maxTokens` para respostas mais detalhadas

### **Problema: Chat não mantém histórico**
- ✅ Verifique se localStorage está habilitado
- ✅ Limpe histórico e teste novamente: `AIService.clearConversation()`

---

## 🔒 Segurança e Privacidade

### **Dados Enviados à API**
- ✅ **Apenas contexto financeiro agregado** (totais, categorias, percentuais)
- ❌ **NUNCA** envia IDs reais de usuário ou dados sensíveis (CPF, senhas)
- ❌ **NUNCA** envia descrições completas de transações (apenas categorias)

### **Armazenamento Local**
- API Key: `localStorage` (criptografada em produção)
- Histórico de chat: `localStorage` (máximo 20 mensagens)
- Insights: `localStorage` (máximo 50)

### **Recomendações**
- 🔒 Nunca compartilhe sua API Key
- 🔒 Use variáveis de ambiente em produção
- 🔒 Implemente rate limiting customizado
- 🔒 Monitore uso de tokens no console do Google

---

## 🚀 Próximos Passos (Roadmap)

### **v1.1 - Melhorias de UX**
- [ ] Voice input (Web Speech API)
- [ ] Exportar histórico de chat
- [ ] Temas customizáveis para chat
- [ ] Atalhos de teclado (Ctrl+K para abrir chat)

### **v1.2 - Análises Avançadas**
- [ ] Previsões de gastos futuros (ML local com TensorFlow.js)
- [ ] Comparação com outros usuários (anônimo)
- [ ] Metas inteligentes sugeridas pela IA

### **v1.3 - Multi-Provedor**
- [ ] Suporte a OpenAI GPT-4
- [ ] Suporte a Anthropic Claude
- [ ] Fallback automático se um provedor falhar

### **v2.0 - Fine-Tuning**
- [ ] Treinar modelo customizado com dados do usuário
- [ ] Personalização de estilo de resposta
- [ ] Integração com Open Finance (dados bancários reais)

---

## 📄 Licença

Parte do projeto **Financy Life** - v3.11.8  
© 2025 Rickson (Rick)

---

## 📞 Suporte

**Dúvidas ou problemas?**
- 📧 Email: [seu-email@exemplo.com]
- 💬 GitHub Issues: [link-do-repo]
- 📚 Documentação completa: `docs/guides/AI_SYSTEM_GUIDE.md`

---

✨ **IA configurada e pronta para uso!** Agora seus usuários têm um assistente financeiro inteligente 24/7.
