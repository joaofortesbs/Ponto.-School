
import React, { ErrorInfo, ReactNode, Component } from "react";

interface ErrorHandlerProps {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface ErrorHandlerState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Componente de tratamento de erros para envolver componentes propensos a problemas
 */
class ErrorHandler extends Component<ErrorHandlerProps, ErrorHandlerState> {
  constructor(props: ErrorHandlerProps) {
    super(props);
    this.state = { 
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorHandlerState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`Erro capturado em ${this.props.componentName || 'componente'}:`, error);
    console.error("Informações do erro:", errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Renderizar fallback personalizado ou padrão
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-4 m-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-300">
            {this.props.componentName 
              ? `Erro ao renderizar ${this.props.componentName}`
              : "Erro ao renderizar componente"}
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 px-2 py-1 text-xs bg-red-100 dark:bg-red-800/30 text-red-700 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-700/30"
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorHandler;
