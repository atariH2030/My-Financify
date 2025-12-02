/**
 * @file components.test.tsx
 * @description Testes para componentes comuns
 * @version 2.4.0
 * @author DEV - Rickson (TQM)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';

describe('Button Component', () => {
  it('deve renderizar o botão com texto correto', () => {
    render(<Button>Clique aqui</Button>);
    expect(screen.getByText('Clique aqui')).toBeInTheDocument();
  });

  it('deve executar onClick quando clicado', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clique aqui</Button>);

    const button = screen.getByText('Clique aqui');
    await userEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('deve estar desabilitado quando disabled=true', () => {
    render(<Button disabled>Botão desabilitado</Button>);
    const button = screen.getByRole('button', { name: /botão desabilitado/i });
    expect(button).toBeDisabled();
  });

  it('deve mostrar estado de loading', () => {
    render(<Button loading>Carregando...</Button>);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('deve aplicar variante correta', () => {
    const { container: _container } = render(<Button variant="primary">Primary</Button>);
    expect(_container.querySelector('.btn-primary')).toBeInTheDocument();
  });

  it('deve aplicar tamanho correto', () => {
    const { container: _container } = render(<Button size="lg">Grande</Button>);
    expect(_container.querySelector('.btn-lg')).toBeInTheDocument();
  });
});

describe('Card Component', () => {
  it('deve renderizar card com título', () => {
    render(<Card title="Título do Card">Conteúdo</Card>);
    expect(screen.getByText('Título do Card')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
  });

  it('deve renderizar card com subtítulo', () => {
    render(
      <Card title="Título" subtitle="Subtítulo">
        Conteúdo
      </Card>
    );
    expect(screen.getByText('Subtítulo')).toBeInTheDocument();
  });

  it('deve renderizar card sem header quando não houver título', () => {
    const { container: _container } = render(<Card>Conteúdo</Card>);
    expect(_container.querySelector('.card-header')).not.toBeInTheDocument();
  });

  it('deve aplicar padding correto', () => {
    const { container: _container } = render(<Card padding="lg">Conteúdo</Card>);
    expect(_container.querySelector('.card-padding-lg')).toBeInTheDocument();
  });
});

describe('Input Component', () => {
  it('deve renderizar input com label', () => {
    render(<Input label="Nome" />);
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
  });

  it('deve mostrar mensagem de erro', () => {
    render(<Input label="Email" error="Email inválido" />);
    expect(screen.getByText('Email inválido')).toBeInTheDocument();
  });

  it('deve mostrar helper text', () => {
    render(<Input label="Senha" helperText="Mínimo 8 caracteres" />);
    expect(screen.getByText('Mínimo 8 caracteres')).toBeInTheDocument();
  });

  it('deve executar onChange ao digitar', async () => {
    const handleChange = vi.fn();
    render(<Input label="Nome" onChange={handleChange} />);

    const input = screen.getByLabelText('Nome');
    await userEvent.type(input, 'Teste');

    expect(handleChange).toHaveBeenCalled();
  });

  it('deve aplicar estado de erro visualmente', () => {
    const { container: _container } = render(<Input label="Email" error="Email inválido" />);
    expect(_container.querySelector('.input-error')).toBeInTheDocument();
  });

  it('deve estar desabilitado quando disabled=true', () => {
    render(<Input label="Nome" disabled />);
    const input = screen.getByLabelText('Nome');
    expect(input).toBeDisabled();
  });
});

describe('Modal Component', () => {
  it('deve renderizar modal quando isOpen=true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <div>Conteúdo do Modal</div>
      </Modal>
    );
    expect(screen.getByText('Conteúdo do Modal')).toBeInTheDocument();
  });

  it('não deve renderizar modal quando isOpen=false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        <div>Conteúdo do Modal</div>
      </Modal>
    );
    expect(screen.queryByText('Conteúdo do Modal')).not.toBeInTheDocument();
  });

  it('deve chamar onClose ao clicar no backdrop', async () => {
    const handleClose = vi.fn();
    const { container } = render(
      <Modal isOpen={true} onClose={handleClose}>
        <div>Conteúdo</div>
      </Modal>
    );

    const backdrop = container.querySelector('.modal-backdrop');
    if (backdrop) {
      await userEvent.click(backdrop);
      expect(handleClose).toHaveBeenCalledTimes(1);
    }
  });

  it('deve renderizar título quando fornecido', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Título do Modal">
        <div>Conteúdo</div>
      </Modal>
    );
    expect(screen.getByText('Título do Modal')).toBeInTheDocument();
  });

  it('deve renderizar footer customizado', () => {
    render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        footer={<button>Confirmar</button>}
      >
        <div>Conteúdo</div>
      </Modal>
    );
    expect(screen.getByText('Confirmar')).toBeInTheDocument();
  });

  it('deve aplicar tamanho correto', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} size="lg">
        <div>Conteúdo</div>
      </Modal>
    );
    expect(container.querySelector('.modal-lg')).toBeInTheDocument();
  });
});
