/**
 * AI Service - Motor de IA integrada com Gemini Pro
 * Sistema inteligente de análise financeira e notificações proativas
 * 
 * @version 1.0.0
 */

import Logger from './logger.service';
import NotificationService from './notification.service';
import Storage from './storage.service';
import type {
  AIMessage,
  AIContext,
  AIInsight,
  AIAnalysisRequest,
  AIAnalysisResponse,
  AINotificationConfig,
  AIProviderConfig,
} from '../types/ai.types';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
    finishReason: string;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

class AIService {
  private readonly CONFIG_KEY = 'ai_config';
  private readonly INSIGHTS_KEY = 'ai_insights';
  private readonly CONVERSATION_KEY = 'ai_conversation';
  private readonly MAX_CONVERSATION_LENGTH = 20;

  private defaultConfig: AIProviderConfig = {
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-1.5-flash', // Mais rápido e gratuito
    maxTokens: 2048,
    temperature: 0.7,
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
  };

  private notificationConfig: AINotificationConfig = {
    enabled: true,
    frequency: 'realtime',
    types: {
      spendingAlerts: true,
      savingsTips: true,
      budgetInsights: true,
      goalReminders: true,
      anomalyDetection: true,
    },
    thresholds: {
      unusualSpending: 30, // 30% acima da média
      budgetWarning: 80, // 80% do orçamento usado
      goalDeadline: 7, // 7 dias antes do prazo
    },
  };

  /**
   * Configurar provedor de IA
   */
  async configure(config: Partial<AIProviderConfig>): Promise<void> {
    try {
      const currentConfig = await this.getConfig();
      const updated = { ...currentConfig, ...config };
      await Storage.save(this.CONFIG_KEY, updated);
      Logger.info('✅ Configuração de IA atualizada', { provider: updated.provider }, 'AI');
    } catch (error) {
      Logger.error('Falha ao configurar IA', error as Error, 'AI');
      throw error;
    }
  }

  /**
   * Obter configuração atual
   */
  async getConfig(): Promise<AIProviderConfig> {
    try {
      const config = await Storage.load<AIProviderConfig>(this.CONFIG_KEY);
      return config || this.defaultConfig;
    } catch (error) {
      Logger.error('Falha ao carregar config de IA', error as Error, 'AI');
      return this.defaultConfig;
    }
  }

  /**
   * Verificar se IA está configurada
   */
  async isConfigured(): Promise<boolean> {
    const config = await this.getConfig();
    return !!config.apiKey;
  }

  /**
   * Analisar contexto financeiro e gerar insights
   */
  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    try {
      const config = await this.getConfig();

      if (!config.apiKey) {
        throw new Error('API Key não configurada. Configure em Configurações > IA');
      }

      // Montar prompt contextualizado
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(request);

      // Fazer chamada à API
      const response = await this.callGemini(systemPrompt, userPrompt, config);

      // Extrair insights do texto
      const insights = this.extractInsights(response.answer, request.context);

      Logger.info('✅ Análise de IA concluída', { 
        tokensUsed: response.tokensUsed,
        insightsFound: insights.length 
      }, 'AI');

      return {
        ...response,
        insights,
      };
    } catch (error) {
      Logger.error('Falha na análise de IA', error as Error, 'AI');
      throw error;
    }
  }

  /**
   * Gerar insights proativos (executar periodicamente)
   */
  async generateProactiveInsights(context: AIContext): Promise<AIInsight[]> {
    try {
      if (!this.notificationConfig.enabled) {
        return [];
      }

      const insights: AIInsight[] = [];

      // 1. Detectar gastos anormais
      if (this.notificationConfig.types.anomalyDetection) {
        const anomalies = this.detectAnomalies(context);
        insights.push(...anomalies);
      }

      // 2. Alertas de orçamento
      if (this.notificationConfig.types.budgetInsights && context.budgets) {
        if (context.budgets.percentage >= this.notificationConfig.thresholds.budgetWarning) {
          insights.push({
            id: `insight_budget_${Date.now()}`,
            type: 'warning',
            title: '⚠️ Orçamento em Alerta',
            description: `Você já usou ${context.budgets.percentage.toFixed(0)}% do seu orçamento mensal. Considere reduzir gastos não essenciais.`,
            actionable: true,
            actionUrl: '/budgets',
            actionLabel: 'Ver Orçamentos',
            priority: context.budgets.percentage >= 95 ? 'high' : 'medium',
            timestamp: new Date().toISOString(),
            metadata: {
              percentage: context.budgets.percentage,
            },
          });
        }
      }

      // 3. Dicas de economia (baseado em padrões)
      if (this.notificationConfig.types.savingsTips && context.patterns) {
        const savingsTips = this.generateSavingsTips(context);
        insights.push(...savingsTips);
      }

      // Salvar insights gerados
      await this.saveInsights(insights);

      // Enviar notificações importantes
      for (const insight of insights) {
        if (insight.priority === 'high' || insight.priority === 'medium') {
          await NotificationService.create(
            insight.type === 'warning' ? 'warning' : 'info',
            insight.title,
            insight.description,
            {
              priority: insight.priority === 'high' ? 'high' : 'medium',
              actionUrl: insight.actionUrl,
              actionLabel: insight.actionLabel,
            }
          );
        }
      }

      Logger.info('✅ Insights proativos gerados', { count: insights.length }, 'AI');
      return insights;
    } catch (error) {
      Logger.error('Falha ao gerar insights proativos', error as Error, 'AI');
      return [];
    }
  }

  /**
   * Chat conversacional (histórico mantido)
   */
  async chat(message: string, context: AIContext): Promise<string> {
    try {
      // Carregar histórico
      const history = await this.getConversationHistory();

      // Adicionar mensagem do usuário
      const userMessage: AIMessage = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };

      history.push(userMessage);

      // Analisar com contexto
      const response = await this.analyze({
        query: message,
        context,
        conversationHistory: history,
      });

      // Adicionar resposta do assistente
      const assistantMessage: AIMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toISOString(),
        metadata: {
          tokens: response.tokensUsed,
        },
      };

      history.push(assistantMessage);

      // Salvar histórico (limitado)
      await this.saveConversationHistory(history.slice(-this.MAX_CONVERSATION_LENGTH));

      return response.answer;
    } catch (error) {
      Logger.error('Falha no chat', error as Error, 'AI');
      throw error;
    }
  }

  /**
   * Limpar histórico de conversa
   */
  async clearConversation(): Promise<void> {
    try {
      await Storage.save(this.CONVERSATION_KEY, []);
      Logger.info('🗑️ Histórico de conversa limpo', undefined, 'AI');
    } catch (error) {
      Logger.error('Falha ao limpar conversa', error as Error, 'AI');
    }
  }

  /**
   * Obter insights salvos
   */
  async getInsights(): Promise<AIInsight[]> {
    try {
      const insights = await Storage.load<AIInsight[]>(this.INSIGHTS_KEY);
      return insights || [];
    } catch (error) {
      Logger.error('Falha ao carregar insights', error as Error, 'AI');
      return [];
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  private buildSystemPrompt(): string {
    return `Você é um assistente financeiro pessoal inteligente integrado ao app "Financy Life".

SUAS CAPACIDADES:
- Analisar padrões de gastos e receitas do usuário
- Identificar oportunidades de economia
- Alertar sobre anomalias e gastos excessivos
- Sugerir ajustes no orçamento
- Prever despesas futuras baseado em histórico
- Explicar relatórios financeiros de forma clara

DIRETRIZES:
1. Seja objetivo, direto e didático
2. Use linguagem acessível (evite jargões)
3. Forneça números concretos quando possível
4. Sugira ações práticas e executáveis
5. Seja empático mas realista sobre finanças
6. Use emojis de forma moderada para clareza visual
7. Respostas curtas (máximo 200 palavras)

FORMATO DE RESPOSTA:
- Responda em Português do Brasil
- Use markdown para formatação
- Cite valores em R$ (Real brasileiro)
- Seja positivo mas honesto sobre problemas financeiros`;
  }

  private buildUserPrompt(request: AIAnalysisRequest): string {
    const { query, context } = request;

    let prompt = `PERGUNTA DO USUÁRIO: ${query}\n\n`;
    prompt += 'CONTEXTO FINANCEIRO:\n';
    prompt += `Período: ${context.timeRange.start} até ${context.timeRange.end}\n\n`;

    if (context.transactions) {
      prompt += 'TRANSAÇÕES:\n';
      prompt += `- Total: ${context.transactions.total}\n`;
      prompt += `- Receitas: R$ ${context.transactions.income.toFixed(2)}\n`;
      prompt += `- Despesas: R$ ${context.transactions.expenses.toFixed(2)}\n`;
      prompt += `- Saldo: R$ ${(context.transactions.income - context.transactions.expenses).toFixed(2)}\n`;
      prompt += `- Por categoria: ${JSON.stringify(context.transactions.byCategory, null, 2)}\n\n`;
    }

    if (context.budgets) {
      prompt += 'ORÇAMENTOS:\n';
      prompt += `- Limite total: R$ ${context.budgets.total.toFixed(2)}\n`;
      prompt += `- Usado: R$ ${context.budgets.used.toFixed(2)} (${context.budgets.percentage.toFixed(0)}%)\n`;
      prompt += `- Alertas ativos: ${context.budgets.alerts}\n\n`;
    }

    if (context.goals) {
      prompt += 'METAS:\n';
      prompt += `- Total: ${context.goals.total}\n`;
      prompt += `- Concluídas: ${context.goals.completed}\n`;
      prompt += `- Em progresso: ${context.goals.inProgress}\n\n`;
    }

    if (context.patterns) {
      prompt += 'PADRÕES IDENTIFICADOS:\n';
      prompt += `- Categorias principais: ${context.patterns.topCategories.join(', ')}\n`;
      prompt += `- Gasto médio mensal: R$ ${context.patterns.avgMonthlySpending.toFixed(2)}\n`;
      prompt += `- Transações recorrentes: ${context.patterns.recurringTransactions}\n\n`;
    }

    // Incluir histórico se existir
    if (request.conversationHistory && request.conversationHistory.length > 0) {
      prompt += 'HISTÓRICO DA CONVERSA:\n';
      for (const msg of request.conversationHistory.slice(-6)) {
        prompt += `${msg.role === 'user' ? 'USUÁRIO' : 'ASSISTENTE'}: ${msg.content}\n`;
      }
      prompt += '\n';
    }

    return prompt;
  }

  private async callGemini(
    systemPrompt: string,
    userPrompt: string,
    config: AIProviderConfig
  ): Promise<AIAnalysisResponse> {
    try {
      const url = `${config.endpoint}/${config.model}:generateContent?key=${config.apiKey}`;

      const requestBody = {
        contents: [
          {
            parts: [
              { text: systemPrompt },
              { text: userPrompt },
            ],
          },
        ],
        generationConfig: {
          temperature: config.temperature,
          maxOutputTokens: config.maxTokens,
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`
        );
      }

      const data: GeminiResponse = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('Nenhuma resposta gerada pela IA');
      }

      const answer = data.candidates[0].content.parts[0].text;
      const tokensUsed = data.usageMetadata?.totalTokenCount || 0;

      return {
        answer,
        confidence: 0.85,
        tokensUsed,
      };
    } catch (error) {
      Logger.error('Falha na chamada Gemini API', error as Error, 'AI');
      throw error;
    }
  }

  private extractInsights(answer: string, _context: AIContext): AIInsight[] {
    const insights: AIInsight[] = [];

    // Regex para detectar padrões de insights no texto
    const warningRegex = /⚠️|alerta|atenção|cuidado|excesso/gi;
    const tipRegex = /💡|dica|sugestão|considere|recomendo/gi;

    if (warningRegex.test(answer)) {
      insights.push({
        id: `insight_${Date.now()}_warning`,
        type: 'warning',
        title: 'Alerta Identificado',
        description: answer.substring(0, 150) + '...',
        actionable: true,
        priority: 'medium',
        timestamp: new Date().toISOString(),
      });
    }

    if (tipRegex.test(answer)) {
      insights.push({
        id: `insight_${Date.now()}_tip`,
        type: 'tip',
        title: 'Dica de Economia',
        description: answer.substring(0, 150) + '...',
        actionable: true,
        priority: 'low',
        timestamp: new Date().toISOString(),
      });
    }

    return insights;
  }

  private detectAnomalies(context: AIContext): AIInsight[] {
    const insights: AIInsight[] = [];

    if (!context.transactions || !context.patterns) {
      return insights;
    }

    const avgSpending = context.patterns.avgMonthlySpending;
    const currentSpending = context.transactions.expenses;
    const deviation = ((currentSpending - avgSpending) / avgSpending) * 100;

    if (deviation >= this.notificationConfig.thresholds.unusualSpending) {
      insights.push({
        id: `insight_anomaly_${Date.now()}`,
        type: 'warning',
        title: '📊 Gasto Atípico Detectado',
        description: `Seus gastos este mês estão ${deviation.toFixed(0)}% acima da média (R$ ${currentSpending.toFixed(2)} vs R$ ${avgSpending.toFixed(2)}). Revise suas transações recentes.`,
        actionable: true,
        actionUrl: '/transactions',
        actionLabel: 'Ver Transações',
        priority: deviation >= 50 ? 'high' : 'medium',
        timestamp: new Date().toISOString(),
        metadata: {
          amount: currentSpending,
          percentage: deviation,
        },
      });
    }

    return insights;
  }

  private generateSavingsTips(context: AIContext): AIInsight[] {
    const tips: AIInsight[] = [];

    if (!context.transactions || !context.patterns) {
      return tips;
    }

    // Identificar categoria com maior gasto
    const byCategory = context.transactions.byCategory;
    const sortedCategories = Object.entries(byCategory)
      .sort(([, a], [, b]) => b - a);

    if (sortedCategories.length > 0) {
      const [topCategory, amount] = sortedCategories[0];
      const percentage = (amount / context.transactions.expenses) * 100;

      if (percentage >= 30) {
        tips.push({
          id: `insight_tip_${Date.now()}`,
          type: 'tip',
          title: '💡 Oportunidade de Economia',
          description: `"${topCategory}" representa ${percentage.toFixed(0)}% dos seus gastos (R$ ${amount.toFixed(2)}). Pequenas reduções aqui podem gerar grande economia!`,
          actionable: true,
          actionUrl: '/transactions',
          actionLabel: 'Analisar Categoria',
          priority: 'low',
          timestamp: new Date().toISOString(),
          metadata: {
            category: topCategory,
            amount,
            percentage,
          },
        });
      }
    }

    return tips;
  }

  private async saveInsights(insights: AIInsight[]): Promise<void> {
    try {
      const existing = await this.getInsights();
      const updated = [...insights, ...existing].slice(0, 50); // Máximo 50 insights
      await Storage.save(this.INSIGHTS_KEY, updated);
    } catch (error) {
      Logger.error('Falha ao salvar insights', error as Error, 'AI');
    }
  }

  private async getConversationHistory(): Promise<AIMessage[]> {
    try {
      const history = await Storage.load<AIMessage[]>(this.CONVERSATION_KEY);
      return history || [];
    } catch (error) {
      Logger.error('Falha ao carregar histórico', error as Error, 'AI');
      return [];
    }
  }

  private async saveConversationHistory(history: AIMessage[]): Promise<void> {
    try {
      await Storage.save(this.CONVERSATION_KEY, history);
    } catch (error) {
      Logger.error('Falha ao salvar histórico', error as Error, 'AI');
    }
  }
}

// Singleton
export default new AIService();
