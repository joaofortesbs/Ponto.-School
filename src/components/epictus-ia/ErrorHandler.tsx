
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
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
    // Atualiza o estado para que a próxima renderização mostre a UI alternativa
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Erro capturado em ${this.props.componentName || 'componente'}:`, error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-4 border rounded-md m-4">
          <Alert variant="destructive">
            <h3 className="text-lg font-semibold mb-2">
              Algo deu errado {this.props.componentName ? `no componente ${this.props.componentName}` : ''}
            </h3>
            <AlertDescription>
              <p className="text-sm mb-4">
                Ocorreu um erro ao carregar este componente. Por favor, tente novamente ou recarregue a página.
              </p>
              <div className="pre-wrap text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mb-4 max-h-24 overflow-auto">
                {this.state.error && this.state.error.toString()}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={this.handleRetry}>
                  Tentar novamente
                </Button>
                <Button size="sm" variant="outline" onClick={this.handleReload}>
                  Recarregar página
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
