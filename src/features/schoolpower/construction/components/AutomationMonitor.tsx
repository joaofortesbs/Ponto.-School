
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Bot, CheckCircle, XCircle, Clock, Eye, RefreshCw } from 'lucide-react';

interface AutomationLog {
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  activityId?: string;
}

export function AutomationMonitor() {
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (!isMonitoring) return;

    // Intercepta console.log para capturar logs da automação
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;

    const addLog = (level: AutomationLog['level'], message: string) => {
      const timestamp = new Date().toLocaleTimeString();
      setLogs(prev => [...prev.slice(-49), { timestamp, level, message }]);
    };

    console.log = (...args) => {
      const message = args.join(' ');
      if (message.includes('🤖') || message.includes('✅') || message.includes('🔍') || message.includes('📋')) {
        addLog('info', message);
      }
      originalConsoleLog(...args);
    };

    console.warn = (...args) => {
      const message = args.join(' ');
      addLog('warning', message);
      originalConsoleWarn(...args);
    };

    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('automação') || message.includes('atividade')) {
        addLog('error', message);
      }
      originalConsoleError(...args);
    };

    return () => {
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
    };
  }, [isMonitoring]);

  const clearLogs = () => {
    setLogs([]);
  };

  const getLevelIcon = (level: AutomationLog['level']) => {
    switch (level) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Bot className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLevelColor = (level: AutomationLog['level']) => {
    switch (level) {
      case 'success': return 'border-l-green-500 bg-green-50';
      case 'error': return 'border-l-red-500 bg-red-50';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg hover:shadow-xl"
        >
          <Eye className="w-4 h-4 mr-2" />
          Monitor Automação
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="max-h-96 shadow-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Monitor de Automação
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsMonitoring(!isMonitoring)}
                variant="outline"
                size="sm"
                className={isMonitoring ? 'bg-green-100 text-green-700' : ''}
              >
                {isMonitoring ? 'Pausar' : 'Iniciar'}
              </Button>
              <Button
                onClick={clearLogs}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                variant="outline"
                size="sm"
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                {isMonitoring ? 'Aguardando logs da automação...' : 'Clique em "Iniciar" para monitorar'}
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={`border-l-4 pl-3 py-2 text-xs ${getLevelColor(log.level)}`}
                  >
                    <div className="flex items-start gap-2">
                      {getLevelIcon(log.level)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-500">{log.timestamp}</span>
                          <Badge variant="outline" className="text-xs">
                            {log.level}
                          </Badge>
                        </div>
                        <p className="text-gray-700 leading-tight">{log.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
