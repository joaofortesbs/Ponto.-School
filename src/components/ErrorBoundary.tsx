import React, { ReactNode, ErrorInfo } from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error) {
    // Atualiza o state para que o próximo render mostre a UI alternativa.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Você também pode registrar o erro em um serviço de relatório de erros
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Você pode renderizar qualquer UI alternativa
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow p-6 max-w-md w-full border border-red-200 dark:border-red-800">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Algo deu errado</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Ocorreu um erro inesperado. Nossa equipe foi notificada.
            </p>
            <div className="bg-black/5 dark:bg-white/5 p-4 rounded-md mb-4 text-left overflow-auto text-sm">
              <p className="text-red-500 dark:text-red-400 whitespace-pre-wrap font-mono">
                {this.state.error && this.state.error.toString()}
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md"
            >
              Recarregar a página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;