
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Loader2, 
  StopCircle,
  Settings,
  Activity
} from 'lucide-react';
import { useSchoolPowerAutomation } from './AutomationHooks';

interface AutomationMonitorProps {
  onClose?: () => void;
}

export const AutomationMonitor: React.FC<AutomationMonitorProps> = ({ onClose }) => {
  const { status, stopAutomation } = useSchoolPowerAutomation();

  if (!status.isRunning && !status.completed && status.currentActivity === 0) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto border-l-4 border-l-[#FF6B00]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Activity className="h-5 w-5 mr-2 text-[#FF6B00]" />
            School Power Automation
          </CardTitle>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              ×
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={
            status.isRunning 
              ? "border-blue-500 text-blue-700 bg-blue-50"
              : status.completed
              ? "border-green-500 text-green-700 bg-green-50"
              : status.errors.length > 0
              ? "border-red-500 text-red-700 bg-red-50"
              : "border-gray-500 text-gray-700 bg-gray-50"
          }>
            {status.isRunning ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Em Execução
              </>
            ) : status.completed ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Concluído
              </>
            ) : status.errors.length > 0 ? (
              <>
                <AlertCircle className="h-3 w-3 mr-1" />
                Erro
              </>
            ) : (
              <>
                <Clock className="h-3 w-3 mr-1" />
                Aguardando
              </>
            )}
          </Badge>

          {status.isRunning && (
            <Button
              variant="outline"
              size="sm"
              onClick={stopAutomation}
              className="text-red-600 hover:text-red-700"
            >
              <StopCircle className="h-4 w-4 mr-1" />
              Parar
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        {status.totalActivities > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progresso</span>
              <span className="font-medium">
                {status.currentActivity}/{status.totalActivities} atividades
              </span>
            </div>
            <Progress value={status.progress} className="h-2" />
            <div className="text-xs text-gray-500 text-center">
              {Math.round(status.progress)}% concluído
            </div>
          </div>
        )}

        {/* Current Activity */}
        {status.isRunning && status.currentActivity > 0 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center text-blue-700 dark:text-blue-300">
              <Settings className="h-4 w-4 mr-2 animate-spin" />
              <span className="text-sm font-medium">
                Construindo atividade {status.currentActivity}...
              </span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {status.completed && !status.isRunning && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center text-green-700 dark:text-green-300">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">
                {status.totalActivities} atividades construídas com sucesso!
              </span>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {status.errors.length > 0 && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-start text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <span className="text-sm font-medium">Erros encontrados:</span>
                {status.errors.map((error, index) => (
                  <div key={index} className="text-xs">
                    • {error}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!status.isRunning && !status.completed && status.currentActivity === 0 && (
          <div className="text-xs text-gray-500 text-center">
            Clique em "Aprovar e Construir" em um Plano de Ação para iniciar a automação
          </div>
        )}
      </CardContent>
    </Card>
  );
};
