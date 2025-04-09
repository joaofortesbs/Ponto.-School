
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Erro capturado pelo ErrorBoundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white dark:bg-[#001427]">
          <div className="max-w-md w-full p-6 bg-white dark:bg-[#0A2540] rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-red-600 mb-4">Algo deu errado</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Ocorreu um problema ao carregar a plataforma.
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-auto mb-4">
              <code className="text-sm text-red-500 dark:text-red-400">
                {this.state.error?.message || "Erro desconhecido"}
              </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
