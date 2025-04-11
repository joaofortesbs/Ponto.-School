
import React, { Component, ErrorInfo, ReactNode } from "react";

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
    // Atualiza o state para que a próxima renderização mostre a UI alternativa.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });
    
    // Você também pode registrar o erro em um serviço de relatório de erros
    console.error("Erro capturado pelo ErrorBoundary:", error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // UI de fallback padrão
      return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-red-200 dark:border-red-900">
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
            Algo deu errado
          </h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Ocorreu um problema ao carregar esta parte da interface. Por favor, tente novamente.
          </p>
          <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm text-red-500 overflow-auto max-h-40 mb-4">
            {this.state.error?.toString() || "Erro desconhecido"}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
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
