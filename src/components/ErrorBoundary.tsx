
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKey?: any;
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
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Erro capturado pelo ErrorBoundary:", error, errorInfo);
    
    // Reportar erro para serviço externo ou analytics
    this.logErrorToService(error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    this.setState({ errorInfo });
  }
  
  // Reset do error boundary ao mudar a prop resetKey
  public componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // Implementação futura para logging de erros em serviço externo
    // Por exemplo: Sentry, LogRocket, etc.
  }
  
  public resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white dark:bg-[#001427]">
          <div className="max-w-md w-full p-6 bg-white dark:bg-[#0A2540] rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
            <Alert variant="destructive" className="mb-4">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertTitle>Algo deu errado</AlertTitle>
              <AlertDescription>
                Ocorreu um problema ao carregar esta parte da plataforma.
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-auto mb-4">
              <code className="text-sm text-red-500 dark:text-red-400">
                {this.state.error?.message || "Erro desconhecido"}
              </code>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => window.location.reload()}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
              >
                Recarregar a página
              </Button>
              
              <Button
                onClick={this.resetErrorBoundary}
                variant="outline"
                className="w-full"
              >
                Tentar novamente
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
