/**
 * Auth Error Boundary
 * Captura erros de autenticação sem derrubar o app
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import Logger from '../../services/logger.service';
import { Button } from '../common';
import './AuthErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    Logger.error('Erro capturado pelo AuthErrorBoundary', error, 'AUTH_BOUNDARY');
    Logger.error('Stack trace', new Error(errorInfo.componentStack || ''), 'AUTH_BOUNDARY');

    this.setState({
      errorInfo,
    });
  }

  handleRetry = (): void => {
    this.setState(prev => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prev.retryCount + 1,
    }));
  };

  handleReset = (): void => {
    // Limpar cache de autenticação
    localStorage.removeItem('local_session');
    localStorage.removeItem('local_user');
    
    // Recarregar página
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Usar fallback customizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="auth-error-boundary">
          <div className="error-card">
            <div className="error-icon">⚠️</div>
            <h2>Ops! Algo deu errado</h2>
            <p className="error-message">
              Ocorreu um erro no sistema de autenticação
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Detalhes técnicos</summary>
                <pre>{this.state.error.toString()}</pre>
                {this.state.errorInfo && (
                  <pre>{this.state.errorInfo.componentStack}</pre>
                )}
              </details>
            )}

            <div className="error-actions">
              <Button onClick={this.handleRetry} variant="primary">
                🔄 Tentar Novamente
              </Button>
              
              <Button onClick={this.handleReset} variant="secondary">
                🔧 Resetar Sistema
              </Button>
            </div>

            {this.state.retryCount > 2 && (
              <div className="error-help">
                <p>
                  <strong>Problema persistente?</strong>
                </p>
                <ul>
                  <li>Verifique sua conexão com a internet</li>
                  <li>Limpe o cache do navegador (Ctrl+Shift+Del)</li>
                  <li>Tente usar outro navegador</li>
                  <li>Entre em contato com o suporte</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary;
