import React, { useState } from 'react';
import { Button, Card, Input, Modal } from '../common';

/**
 * Exemplo de uso dos componentes reutilizáveis
 * Demonstra todas as variantes e props disponíveis
 */
const ComponentsExample: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Exemplo de validação
    if (value && value.length < 3) {
      setInputError('Mínimo 3 caracteres');
    } else {
      setInputError('');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Componentes Reutilizáveis - Financify Life v2.1</h1>
      
      {/* === BUTTONS === */}
      <Card title="Buttons" icon="fas fa-hand-pointer" padding="lg">
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="success">Success</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <Button size="sm" icon="fas fa-star">Small</Button>
          <Button size="md" icon="fas fa-heart">Medium</Button>
          <Button size="lg" icon="fas fa-rocket">Large</Button>
        </div>
        
        <div style={{ marginTop: '1rem' }}>
          <Button loading>Loading...</Button>
          <Button disabled style={{ marginLeft: '1rem' }}>Disabled</Button>
        </div>
      </Card>

      {/* === CARDS === */}
      <Card 
        title="Cards com Hover" 
        subtitle="Passe o mouse sobre os cards"
        icon="fas fa-layer-group"
        padding="lg"
        style={{ marginTop: '2rem' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <Card hover padding="md">
            <h4>Card Hover 1</h4>
            <p>Efeito de elevação ao passar o mouse</p>
          </Card>
          <Card hover padding="md">
            <h4>Card Hover 2</h4>
            <p>Transições suaves e profissionais</p>
          </Card>
          <Card hover padding="md">
            <h4>Card Hover 3</h4>
            <p>Design system consistente</p>
          </Card>
        </div>
      </Card>

      {/* === INPUTS === */}
      <Card 
        title="Inputs com Validação" 
        icon="fas fa-keyboard"
        padding="lg"
        style={{ marginTop: '2rem' }}
      >
        <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '600px' }}>
          <Input
            label="Nome Completo"
            placeholder="Digite seu nome"
            icon="fas fa-user"
            required
          />
          
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            icon="fas fa-envelope"
            helperText="Nunca compartilharemos seu email"
          />
          
          <Input
            label="Validação em Tempo Real"
            value={inputValue}
            onChange={handleInputChange}
            error={inputError}
            placeholder="Digite pelo menos 3 caracteres"
            icon="fas fa-check-circle"
          />
          
          <Input
            label="Campo Desabilitado"
            value="Não editável"
            disabled
            icon="fas fa-lock"
          />
        </div>
      </Card>

      {/* === MODAL === */}
      <Card 
        title="Modal" 
        icon="fas fa-window-restore"
        padding="lg"
        style={{ marginTop: '2rem' }}
      >
        <Button onClick={() => setModalOpen(true)} icon="fas fa-external-link-alt">
          Abrir Modal
        </Button>
        
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Exemplo de Modal"
          size="md"
          footer={
            <>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={() => setModalOpen(false)}>
                Confirmar
              </Button>
            </>
          }
        >
          <p>Este é um exemplo de modal responsivo com:</p>
          <ul>
            <li>✅ Backdrop com blur</li>
            <li>✅ Animações suaves</li>
            <li>✅ Fecha com ESC ou clique fora</li>
            <li>✅ Previne scroll do body</li>
            <li>✅ Footer customizável</li>
            <li>✅ Responsivo (mobile-first)</li>
          </ul>
        </Modal>
      </Card>

      {/* === INTEGRAÇÃO === */}
      <Card 
        title="Integração Completa" 
        subtitle="Todos os componentes funcionando juntos"
        icon="fas fa-puzzle-piece"
        padding="lg"
        style={{ marginTop: '2rem' }}
        actions={
          <Button size="sm" variant="ghost" icon="fas fa-code">
            Ver Código
          </Button>
        }
      >
        <p>
          Estes componentes seguem os <strong>Pilares de Qualidade (TQM)</strong>:
        </p>
        <ul>
          <li>✅ <strong>Manutenibilidade:</strong> Código limpo e desacoplado</li>
          <li>✅ <strong>Reutilização:</strong> DRY (Don&apos;t Repeat Yourself)</li>
          <li>✅ <strong>Acessibilidade:</strong> ARIA labels, keyboard navigation</li>
          <li>✅ <strong>Performance:</strong> CSS otimizado, transições suaves</li>
          <li>✅ <strong>Responsividade:</strong> Mobile-first design</li>
          <li>✅ <strong>Tema Dark/Light:</strong> Suporte nativo</li>
        </ul>
      </Card>
    </div>
  );
};

export default ComponentsExample;
