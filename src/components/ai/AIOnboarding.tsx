/**
 * @file AIOnboarding.tsx
 * @description Onboarding interativo para primeiro uso da IA
 * @version 3.12.0
 * @author DEV - Rickson (TQM)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AIOnboarding.css';
import AIService from '../../services/ai.service';
import AnalyticsService from '../../services/analytics.service';

interface AIOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

const AIOnboarding: React.FC<AIOnboardingProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState<'gemini-1.5-flash' | 'gemini-1.5-pro'>('gemini-1.5-flash');
  const [isValidating, setIsValidating] = useState(false);

  const steps = [
    {
      title: '🤖 Bem-vindo ao Assistente IA!',
      description: 'Configure sua IA financeira em 3 passos simples e receba insights personalizados sobre suas finanças.',
      content: (
        <div className="onboarding-welcome">
          <div className="feature-list">
            <div className="feature-item">
              <i className="fas fa-brain"></i>
              <div>
                <h4>Análise Inteligente</h4>
                <p>Insights automáticos sobre seus gastos e receitas</p>
              </div>
            </div>
            <div className="feature-item">
              <i className="fas fa-chart-line"></i>
              <div>
                <h4>Previsões Precisas</h4>
                <p>Projeções de gastos baseadas em seu histórico</p>
              </div>
            </div>
            <div className="feature-item">
              <i className="fas fa-lightbulb"></i>
              <div>
                <h4>Dicas Personalizadas</h4>
                <p>Recomendações para economizar e investir melhor</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '🔑 Obter API Key do Google',
      description: 'Siga os passos abaixo para gerar sua chave gratuita:',
      content: (
        <div className="onboarding-api-steps">
          <ol className="steps-list">
            <li>
              <strong>Acesse:</strong>{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="link-primary"
              >
                Google AI Studio
              </a>
            </li>
            <li>
              <strong>Faça login</strong> com sua conta Google
            </li>
            <li>
              <strong>Clique em</strong> "Create API Key"
            </li>
            <li>
              <strong>Copie a chave</strong> gerada
            </li>
          </ol>
          <div className="info-box success">
            <i className="fas fa-gift"></i>
            <div>
              <strong>100% Gratuito!</strong>
              <p>60 requisições/minuto • 1 milhão de tokens/dia</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '⚙️ Configurar API Key',
      description: 'Cole sua API Key e escolha o modelo ideal:',
      content: (
        <div className="onboarding-config">
          <div className="form-group">
            <label htmlFor="apiKey">
              <i className="fas fa-key"></i> API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Cole sua API Key aqui..."
              className="input-text"
              autoFocus
            />
            <small className="help-text">
              Sua chave é criptografada e armazenada apenas localmente
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="model">
              <i className="fas fa-microchip"></i> Modelo
            </label>
            <select
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value as typeof model)}
              className="input-select"
            >
              <option value="gemini-1.5-flash">
                Gemini 1.5 Flash (Rápido • Recomendado)
              </option>
              <option value="gemini-1.5-pro">
                Gemini 1.5 Pro (Mais Poderoso)
              </option>
            </select>
            <small className="help-text">
              Flash é ideal para análises rápidas do dia a dia
            </small>
          </div>
        </div>
      ),
    },
    {
      title: '🎉 Tudo Pronto!',
      description: 'Sua IA está configurada e pronta para usar.',
      content: (
        <div className="onboarding-success">
          <div className="success-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <p className="success-text">
            Comece a conversar com sua IA para obter insights instantâneos sobre suas finanças!
          </p>
          <div className="quick-tips">
            <h4>Experimente perguntar:</h4>
            <div className="tip-item">
              <i className="fas fa-comments"></i>
              <span>"Quanto gastei este mês?"</span>
            </div>
            <div className="tip-item">
              <i className="fas fa-comments"></i>
              <span>"Quais categorias posso economizar?"</span>
            </div>
            <div className="tip-item">
              <i className="fas fa-comments"></i>
              <span>"Me dê dicas de investimento"</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = async () => {
    if (currentStep === 2) {
      // Validar e salvar configuração
      if (!apiKey.trim()) {
        alert('Por favor, insira sua API Key');
        return;
      }

      setIsValidating(true);
      try {
        await AIService.configure({
          provider: 'google-gemini' as any,
          apiKey: apiKey.trim(),
          model,
          temperature: 0.7,
          maxTokens: 2048,
        });

        // Testar conexão
        await AIService.chat('Olá!', {
          userId: 'onboarding',
          timeRange: { start: new Date().toISOString(), end: new Date().toISOString() },
          transactions: { total: 0, income: 0, expenses: 0, byCategory: {} },
        });

        AnalyticsService.trackFeatureUsed('ai_onboarding_complete');
        setCurrentStep(currentStep + 1);
      } catch (error) {
        alert(
          `Erro ao validar API Key: ${(error as Error).message}\n\nVerifique se a chave está correta.`
        );
      } finally {
        setIsValidating(false);
      }
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    AnalyticsService.trackFeatureUsed('ai_onboarding_skipped');
    onSkip();
  };

  return (
    <div className="ai-onboarding-overlay">
      <motion.div
        className="ai-onboarding-modal"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="onboarding-header">
          <div className="step-indicator">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`step-dot ${index === currentStep ? 'active' : ''} ${
                  index < currentStep ? 'completed' : ''
                }`}
              />
            ))}
          </div>
          {currentStep < steps.length - 1 && (
            <button className="btn-skip" onClick={handleSkip}>
              Pular
            </button>
          )}
        </div>

        <div className="onboarding-body">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="step-title">{steps[currentStep].title}</h2>
              <p className="step-description">{steps[currentStep].description}</p>
              <div className="step-content">{steps[currentStep].content}</div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="onboarding-footer">
          {currentStep > 0 && currentStep < steps.length - 1 && (
            <button className="btn-back" onClick={handleBack} disabled={isValidating}>
              <i className="fas fa-arrow-left"></i> Voltar
            </button>
          )}
          <button
            className="btn-next"
            onClick={handleNext}
            disabled={isValidating || (currentStep === 2 && !apiKey.trim())}
          >
            {isValidating ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Validando...
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                Começar <i className="fas fa-rocket"></i>
              </>
            ) : currentStep === 2 ? (
              <>
                Validar e Continuar <i className="fas fa-arrow-right"></i>
              </>
            ) : (
              <>
                Continuar <i className="fas fa-arrow-right"></i>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AIOnboarding;
