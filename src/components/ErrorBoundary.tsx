import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: (props: { error: Error; resetErrorBoundary: () => void }) => ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Prevenção para interceptar erros relacionados a propriedades undefined
    if (error.message.includes("Cannot read properties of undefined")) {
      error._suppressLogging = true; // Propriedade para indicar que o erro foi tratado
      console.log("Erro capturado pelo ErrorBoundary:", error);
    }
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Erro capturado pelo ErrorBoundary:", error, info);
    if (this.props.onError) {
      this.props.onError(error, info);
    }

    // Logging específico para ajudar o debugging
    if (error.message.includes("Cannot read properties of undefined")) {
      console.warn("Detectado erro de propriedade undefined - verifique inicialização de objetos");
    }
  }

  public render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          resetErrorBoundary: this.resetErrorBoundary,
        });
      }

      return (
        <div className="error-boundary p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-900/30 text-center m-6">
          <h2 className="text-xl font-bold text-red-800 dark:text-red-300 mb-3">Algo deu errado</h2>
          <p className="text-red-700 dark:text-red-200 mb-3">
            Ocorreu um problema ao carregar este componente.
          </p>
          <p className="text-sm text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-900/30 p-3 rounded-md font-mono mb-3">
            {this.state.error.message}
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={this.resetErrorBoundary}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Tentar novamente
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }

  private resetErrorBoundary = (): void => {
    this.setState({ hasError: false, error: null });
  };
}