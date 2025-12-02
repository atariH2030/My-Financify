import React from 'react';
import { useToast, Button, Card } from '../common';

/**
 * Exemplo de uso do sistema de notificações Toast
 * Demonstra todas as variantes e funcionalidades
 */
const ToastExample: React.FC = () => {
  const toast = useToast();

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Sistema de Notificações - Toast</h1>
      
      <Card 
        title="Notificações Toast" 
        subtitle="Feedback visual consistente para o usuário"
        icon="fas fa-bell"
        padding="lg"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Button 
            variant="success" 
            icon="fas fa-check"
            onClick={() => toast.success('Operação realizada com sucesso!')}
          >
            Success Toast
          </Button>

          <Button 
            variant="danger" 
            icon="fas fa-times"
            onClick={() => toast.error('Erro ao processar a requisição')}
          >
            Error Toast
          </Button>

          <Button 
            variant="warning" 
            icon="fas fa-exclamation-triangle"
            onClick={() => toast.warning('Atenção: Verifique os dados')}
          >
            Warning Toast
          </Button>

          <Button 
            variant="primary" 
            icon="fas fa-info-circle"
            onClick={() => toast.info('Informação importante para você')}
          >
            Info Toast
          </Button>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h3>Durações Customizadas</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button 
              size="sm"
              onClick={() => toast.success('Rápido (2s)', 2000)}
            >
              2 segundos
            </Button>

            <Button 
              size="sm"
              onClick={() => toast.info('Padrão (5s)', 5000)}
            >
              5 segundos
            </Button>

            <Button 
              size="sm"
              onClick={() => toast.warning('Longo (10s)', 10000)}
            >
              10 segundos
            </Button>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h3>Múltiplas Notificações</h3>
          <Button 
            variant="secondary"
            onClick={() => {
              toast.success('Primeira notificação');
              setTimeout(() => toast.info('Segunda notificação'), 300);
              setTimeout(() => toast.warning('Terceira notificação'), 600);
            }}
          >
            Enviar 3 Toasts
          </Button>
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-secondary, #f9fafb)', borderRadius: '8px' }}>
          <h4>Características:</h4>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
            <li>✅ Animações suaves (slide in/out)</li>
            <li>✅ Auto-dismiss configurável</li>
            <li>✅ Limite de 5 toasts simultâneos (performance)</li>
            <li>✅ Botão de fechar manual</li>
            <li>✅ Responsivo (desktop: top-right, mobile: bottom)</li>
            <li>✅ Suporte a tema dark/light</li>
            <li>✅ Acessibilidade (keyboard + screen readers)</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default ToastExample;
