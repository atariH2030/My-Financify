/**
 * @file Fase2Example.tsx
 * @description Exemplo de uso dos novos componentes da Fase 2
 * @version 1.0.0
 */

import React, { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
import EmptyState from './EmptyState';
import { useToastEnhanced } from './ToastEnhanced';
import Button from './Button';
import './Card.css';

export const Fase2Example: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasData, setHasData] = useState(false);
  
  const toast = useToastEnhanced();

  const handleDelete = async () => {
    setIsDeleting(true);
    
    // Simular operação assíncrona
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsDeleting(false);
    setShowConfirm(false);
    setHasData(false);
    
    toast.success('Item excluído com sucesso!', {
      action: {
        label: 'Desfazer',
        onClick: () => {
          setHasData(true);
          toast.info('Ação desfeita');
        }
      },
      duration: 7000
    });
  };

  const handleCreate = () => {
    setHasData(true);
    toast.success('Item criado com sucesso!', {
      title: 'Tudo certo!',
      duration: 4000
    });
  };

  const showExamples = () => {
    // Exemplo: Sucesso simples
    toast.success('Operação concluída!');
    
    // Exemplo: Erro com ação
    setTimeout(() => {
      toast.error('Falha ao sincronizar dados', {
        title: 'Erro de Conexão',
        action: {
          label: 'Tentar novamente',
          onClick: () => toast.info('Reconectando...')
        },
        duration: 0 // Não fecha automaticamente
      });
    }, 1000);
    
    // Exemplo: Warning
    setTimeout(() => {
      toast.warning('Seu plano expira em 7 dias', {
        title: 'Atenção',
        action: {
          label: 'Renovar',
          onClick: () => toast.info('Abrindo página de assinatura...')
        }
      });
    }, 2000);
    
    // Exemplo: Info com título longo
    setTimeout(() => {
      toast.info('Nova atualização disponível com melhorias de performance e novos recursos', {
        title: 'Atualização Disponível',
        action: {
          label: 'Atualizar',
          onClick: () => toast.success('Iniciando atualização...')
        }
      });
    }, 3000);
  };

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <div className="card-header">
        <h2>🎓 Fase 2 - Componentes UX</h2>
        <p>Exemplos de ConfirmDialog, EmptyState e ToastEnhanced</p>
      </div>
      
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Seção: ConfirmDialog */}
        <section>
          <h3>1. ConfirmDialog - Confirmação de Ações</h3>
          <p>Evita ações acidentais em operações destrutivas</p>
          <Button 
            variant="danger" 
            onClick={() => setShowConfirm(true)}
            icon="🗑️"
          >
            Excluir Item
          </Button>
          
          <ConfirmDialog
            isOpen={showConfirm}
            title="Excluir item?"
            message="Esta ação não pode ser desfeita. Todos os dados relacionados serão permanentemente removidos."
            confirmText="Sim, excluir"
            cancelText="Cancelar"
            confirmVariant="danger"
            icon="⚠️"
            loading={isDeleting}
            onConfirm={handleDelete}
            onCancel={() => setShowConfirm(false)}
          />
        </section>

        {/* Seção: EmptyState */}
        <section>
          <h3>2. EmptyState - Estados Vazios</h3>
          <p>Interface convidativa quando não há dados</p>
          
          {!hasData ? (
            <EmptyState
              illustration="transactions"
              title="Nenhuma transação encontrada"
              description="Comece criando sua primeira transação para acompanhar suas finanças de forma organizada."
              primaryAction={{
                label: 'Nova Transação',
                onClick: handleCreate
              }}
              secondaryAction={{
                label: 'Importar planilha',
                onClick: () => toast.info('Funcionalidade em desenvolvimento')
              }}
              helpLink={{
                label: 'Como funciona?',
                href: '#'
              }}
            />
          ) : (
            <div style={{ 
              padding: '2rem', 
              textAlign: 'center', 
              background: 'var(--color-success-bg)',
              borderRadius: 'var(--border-radius-md)',
              border: '2px dashed var(--color-success-primary)'
            }}>
              <p>✅ Você tem dados! O EmptyState não aparece.</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setHasData(false)}
              >
                Limpar dados
              </Button>
            </div>
          )}
        </section>

        {/* Seção: ToastEnhanced */}
        <section>
          <h3>3. ToastEnhanced - Notificações Avançadas</h3>
          <p>Toasts com ações, títulos e mensagens longas</p>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={showExamples}>
              Mostrar Exemplos
            </Button>
            
            <Button 
              variant="success" 
              onClick={() => toast.success('Operação concluída!')}
            >
              Sucesso
            </Button>
            
            <Button 
              variant="danger" 
              onClick={() => toast.error('Algo deu errado')}
            >
              Erro
            </Button>
            
            <Button 
              variant="warning" 
              onClick={() => toast.warning('Atenção necessária')}
            >
              Aviso
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => toast.info('Informação útil')}
            >
              Info
            </Button>
          </div>
        </section>

        {/* Seção: Integração */}
        <section style={{ 
          padding: '1.5rem', 
          background: 'var(--background-secondary)', 
          borderRadius: 'var(--border-radius-md)',
          borderLeft: '4px solid var(--color-info-primary)'
        }}>
          <h4>💡 Como usar nos seus componentes:</h4>
          <pre style={{ 
            background: 'var(--background-primary)', 
            padding: '1rem', 
            borderRadius: 'var(--border-radius-sm)',
            overflow: 'auto',
            fontSize: '0.85rem'
          }}>
{`import { 
  ConfirmDialog, 
  EmptyState, 
  useToastEnhanced 
} from '@/components/common';

const _MyComponent = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const toast = useToastEnhanced();
  
  const handleDelete = async () => {
    // Confirmação
    setShowConfirm(true);
  };
  
  const confirmDelete = async () => {
    try {
      await deleteItem();
      toast.success('Item excluído!', {
        action: {
          label: 'Desfazer',
          onClick: restoreItem
        }
      });
    } catch (error) {
      toast.error('Falha ao excluir');
    }
  };
  
  return (
    <>
      {items.length === 0 ? (
        <EmptyState
          illustration="transactions"
          title="Nenhum item"
          primaryAction={{ label: "Criar", onClick: create }}
        />
      ) : (
        <ItemList onDelete={handleDelete} />
      )}
      
      <ConfirmDialog
        isOpen={showConfirm}
        title="Excluir item?"
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
};`}
          </pre>
        </section>
      </div>
    </div>
  );
};

export default Fase2Example;
