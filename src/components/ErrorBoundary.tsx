
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Atualiza o estado para mostrar o fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Erro capturado pelo ErrorBoundary:", error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Opcional: Reportar erro para um serviço de monitoramento
    // reportErrorToService(error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      // Renderizar UI de fallback customizada
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </div>

              <h1 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                Ocorreu um erro
              </h1>
              
              <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
                A aplicação encontrou um erro inesperado. Por favor, tente recarregar a página.
              </p>

              <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-4 mb-4 overflow-auto max-h-32">
                <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                  {this.state.error?.toString()}
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  onClick={this.handleReload}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recarregar Página
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="border-gray-300 dark:border-gray-600"
                >
                  Ir para o Início
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Se não houver erro, renderiza os filhos normalmente
    return this.props.children;
  }
}

export default ErrorBoundary;
