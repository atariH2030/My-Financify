import { Component, ErrorInfo, ReactNode } from 'react';
import Logger from '../../services/logger.service';
import './ErrorBoundary.css';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary - Captura erros React e previne crash total da app
 * Implementa TQM: Robustez e logs detalhados para debug
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Atualiza state para mostrar UI fallback
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log detalhado do erro
    Logger.error('React Error Boundary capturou um erro', error, 'ERROR_BOUNDARY');
    Logger.error('Stack de componentes', new Error(errorInfo.componentStack || 'No stack available'), 'ERROR_BOUNDARY');

    // Atualiza state com informações completas
    this.setState({
      error,
      errorInfo
    });

    // Callback customizado se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Em produção, pode enviar para serviço de monitoramento (Sentry, Azure Application Insights)
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorToMonitoring(error, errorInfo);
    }
  }

  /**
   * Envia erro para serviço de monitoramento externo
   */
  private sendErrorToMonitoring(error: Error, errorInfo: ErrorInfo): void {
    // TODO: Integrar com Azure Application Insights ou Sentry
    console.log('🚨 Erro enviado para monitoramento:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  /**
   * Reset do erro - permite usuário tentar novamente
   */
  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    Logger.info('ErrorBoundary resetado pelo usuário', undefined, 'ERROR_BOUNDARY');
  };

  /**
   * Recarrega a página (último recurso)
   */
  private handleReload = (): void => {
    Logger.info('Página recarregada após erro', undefined, 'ERROR_BOUNDARY');
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Fallback customizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI padrão de erro
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            
            <h1 className="error-title">Oops! Algo deu errado</h1>
            
            <p className="error-message">
              Desculpe, encontramos um problema inesperado. Não se preocupe, 
              seus dados estão seguros e você pode tentar novamente.
            </p>

            <div className="error-actions">
              <button 
                className="btn btn-primary" 
                onClick={this.handleReset}
              >
                <i className="fas fa-redo"></i>
                Tentar Novamente
              </button>
              
              <button 
                className="btn btn-secondary" 
                onClick={this.handleReload}
              >
                <i className="fas fa-sync"></i>
                Recarregar Página
              </button>
            </div>

            {/* Detalhes técnicos (apenas em desenvolvimento) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Detalhes Técnicos (Dev)</summary>
                <div className="error-stack">
                  <h3>Error:</h3>
                  <pre>{this.state.error.toString()}</pre>
                  
                  <h3>Stack Trace:</h3>
                  <pre>{this.state.error.stack}</pre>
                  
                  {this.state.errorInfo && (
                    <>
                      <h3>Component Stack:</h3>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}

            <div className="error-footer">
              <p>
                Se o problema persistir, entre em contato com o suporte.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
