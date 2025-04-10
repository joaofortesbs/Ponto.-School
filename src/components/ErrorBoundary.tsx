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

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Atualiza o estado para que o próximo render mostre a UI alternativa
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });

    // Você pode registrar o erro em um serviço de relatório de erros
    console.error('Erro capturado pela ErrorBoundary:', error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI de fallback padrão
      return (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Algo deu errado</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
          <details className="text-left bg-white dark:bg-gray-800 p-4 rounded-md text-sm mb-4 overflow-auto max-h-60">
            <summary className="font-medium cursor-pointer mb-2">Detalhes técnicos (para desenvolvedores)</summary>
            <pre className="text-red-600 dark:text-red-400 overflow-auto p-2">
              {this.state.error && this.state.error.toString()}
            </pre>
            {this.state.errorInfo && (
              <pre className="text-gray-600 dark:text-gray-400 overflow-auto p-2 mt-2 text-xs">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </details>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
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