
import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ApiErrorAlertProps {
  title?: string;
  description?: string;
  error?: Error | null;
  onRetry?: () => void;
  className?: string;
}

export function ApiErrorAlert({
  title = "Falha ao carregar dados",
  description = "Não foi possível obter as informações necessárias. Tente novamente mais tarde.",
  error,
  onRetry,
  className = "",
}: ApiErrorAlertProps) {
  return (
    <Alert variant="destructive" className={`flex flex-col ${className}`}>
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
        <div className="flex-1">
          <AlertTitle className="mb-1">{title}</AlertTitle>
          <AlertDescription className="text-sm">
            {description}
            {error && error.message && (
              <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-xs overflow-auto">
                {error.message}
              </div>
            )}
          </AlertDescription>
        </div>
      </div>
      
      {onRetry && (
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-3 self-end"
          onClick={onRetry}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      )}
    </Alert>
  );
}
