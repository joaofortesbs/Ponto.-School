
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoBack = (): void => {
    window.history.back();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Verificar se há um fallback personalizado
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Interface padrão de erro
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 bg-white dark:bg-[#1E293B] rounded-lg shadow-md border border-gray-200 dark:border-gray-700 m-4">
          <div className="flex flex-col items-center text-center max-w-md">
            <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Ops! Algo deu errado
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Ocorreu um erro inesperado ao renderizar esta página. Nossa equipe foi notificada e estamos trabalhando para corrigir o problema.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex items-center"
                onClick={this.handleGoBack}
              >
                Voltar
              </Button>
              <Button
                className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white flex items-center"
                onClick={this.handleReload}
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Tentar novamente
              </Button>
            </div>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-auto text-left w-full">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                  Detalhes do erro:
                </h3>
                <p className="text-sm font-mono text-gray-800 dark:text-gray-200 mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
