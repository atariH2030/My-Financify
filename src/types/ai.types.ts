/**
 * AI Types - Tipos para sistema de IA integrada
 * 
 * @version 1.0.0
 */

export type AIProvider = 'gemini' | 'openai' | 'claude' | 'groq';

export type AIMessageRole = 'user' | 'assistant' | 'system';

export interface AIMessage {
  id: string;
  role: AIMessageRole;
  content: string;
  timestamp: string;
  metadata?: {
    tokens?: number;
    model?: string;
    cost?: number;
  };
}

export interface AIContext {
  userId: string;
  timeRange: {
    start: string;
    end: string;
  };
  transactions?: {
    total: number;
    income: number;
    expenses: number;
    byCategory: Record<string, number>;
  };
  budgets?: {
    total: number;
    used: number;
    percentage: number;
    alerts: number;
  };
  goals?: {
    total: number;
    completed: number;
    inProgress: number;
  };
  patterns?: {
    topCategories: string[];
    avgMonthlySpending: number;
    recurringTransactions: number;
  };
}

export interface AIInsight {
  id: string;
  type: 'warning' | 'tip' | 'achievement' | 'prediction';
  title: string;
  description: string;
  actionable: boolean;
  actionUrl?: string;
  actionLabel?: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
  metadata?: {
    category?: string;
    amount?: number;
    percentage?: number;
  };
}

export interface AIAnalysisRequest {
  query: string;
  context: AIContext;
  conversationHistory?: AIMessage[];
  maxTokens?: number;
}

export interface AIAnalysisResponse {
  answer: string;
  insights?: AIInsight[];
  suggestedActions?: string[];
  confidence: number;
  tokensUsed: number;
}

export interface AINotificationConfig {
  enabled: boolean;
  frequency: 'realtime' | 'daily' | 'weekly' | 'monthly';
  types: {
    spendingAlerts: boolean;
    savingsTips: boolean;
    budgetInsights: boolean;
    goalReminders: boolean;
    anomalyDetection: boolean;
  };
  thresholds: {
    unusualSpending: number; // Percentage deviation
    budgetWarning: number; // Percentage of budget used
    goalDeadline: number; // Days before deadline
  };
}

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  endpoint?: string;
}
