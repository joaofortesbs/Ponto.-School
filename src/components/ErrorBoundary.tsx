
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('ErrorBoundary capturou um erro:', error.message);
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Detalhes do erro capturado:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
    
    // Você poderia enviar o erro para um serviço de rastreamento aqui
    // Ex: reportErrorToService(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Fallback padrão se nenhum for fornecido
      return (
        <div className="p-4 rounded-md bg-red-50 border border-red-200 m-4">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Algo deu errado
          </h2>
          <div className="text-red-700 mb-4">
            {this.state.error?.message}
          </div>
          <details className="mt-2 text-sm text-gray-700 rounded-md bg-white p-2 overflow-auto max-h-96">
            <summary className="font-medium cursor-pointer mb-2">Detalhes técnicos para depuração</summary>
            <pre className="whitespace-pre-wrap font-mono text-xs">
              {this.state.error?.stack}
            </pre>
            {this.state.errorInfo && (
              <pre className="whitespace-pre-wrap font-mono text-xs mt-2 pt-2 border-t border-gray-200">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </details>
          <button
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Recarregar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
