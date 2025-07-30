
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Monitor, Play, Square, RefreshCw } from 'lucide-react';

interface AutomationLog {
  timestamp: number;
  activityId: string;
  action: string;
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export function AutomationDebugPanel() {
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (!isMonitoring) return;

    // Intercepta console.log para capturar logs do AutomationController
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addLog = (message: string, status: AutomationLog['status']) => {
      if (message.includes('[AutomationController]')) {
        const log: AutomationLog = {
          timestamp: Date.now(),
          activityId: 'unknown',
          action: 'automation',
          status,
          message
        };
        
        setLogs(prev => [...prev.slice(-49), log]); // Mantém apenas os últimos 50 logs
      }
    };

    console.log = (...args) => {
      originalLog(...args);
      addLog(args.join(' '), 'info');
    };

    console.error = (...args) => {
      originalError(...args);
      addLog(args.join(' '), 'error');
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog(args.join(' '), 'warning');
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, [isMonitoring]);

  const clearLogs = () => setLogs([]);

  const getStatusColor = (status: AutomationLog['status']) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          Debug - Automação de Atividades
        </CardTitle>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={isMonitoring ? "destructive" : "default"}
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? (
              <>
                <Square className="w-4 h-4 mr-1" />
                Parar Monitoramento
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Iniciar Monitoramento
              </>
            )}
          </Button>
          <Button size="sm" variant="outline" onClick={clearLogs}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Limpar Logs
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              {isMonitoring ? 'Aguardando logs de automação...' : 'Inicie o monitoramento para ver os logs'}
            </p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="flex items-start gap-2 p-2 rounded border">
                <Badge className={`${getStatusColor(log.status)} text-white`}>
                  {log.status.toUpperCase()}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm font-mono">{log.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
