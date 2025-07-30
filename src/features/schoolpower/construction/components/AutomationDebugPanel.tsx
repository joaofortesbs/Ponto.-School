
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
import React from 'react';
import { ConstructionActivity } from '../useConstructionActivities';
import { getAutoBuildStats } from '../auto/autoBuildActivities';
import { Bot, CheckCircle, AlertCircle, Clock, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface AutomationDebugPanelProps {
  activities: ConstructionActivity[];
  isAutoBuilding: boolean;
}

export function AutomationDebugPanel({ activities, isAutoBuilding }: AutomationDebugPanelProps) {
  const stats = getAutoBuildStats(activities);

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Bot className="w-4 h-4 text-purple-400" />
          Sistema de Auto-construção
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Geral */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Status:</span>
          <Badge className={`text-xs ${
            isAutoBuilding 
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
              : 'bg-green-500/10 text-green-400 border-green-500/20'
          }`}>
            {isAutoBuilding ? 'Construindo...' : 'Inativo'}
          </Badge>
        </div>

        {/* Progresso Geral */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Progresso Geral</span>
            <span className="text-white">{stats.progress}%</span>
          </div>
          <Progress value={stats.progress} className="h-2" />
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-gray-400" />
            <span className="text-gray-400">Total:</span>
            <span className="text-white font-medium">{stats.total}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span className="text-gray-400">Concluídas:</span>
            <span className="text-green-400 font-medium">{stats.completed}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-blue-400" />
            <span className="text-gray-400">Construindo:</span>
            <span className="text-blue-400 font-medium">{stats.building}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3 h-3 text-red-400" />
            <span className="text-gray-400">Erros:</span>
            <span className="text-red-400 font-medium">{stats.errors}</span>
          </div>
        </div>

        {/* Lista de Atividades */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-300">Atividades:</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between text-xs">
                <span className="text-gray-400 truncate flex-1" title={activity.title}>
                  {activity.title}
                </span>
                <div className="flex items-center gap-2 ml-2">
                  {activity.autoBuilt && (
                    <Bot className="w-3 h-3 text-purple-400" />
                  )}
                  <Badge className={`text-xs px-1 py-0 ${
                    activity.status === 'completed' 
                      ? 'bg-green-500/10 text-green-400' 
                      : activity.status === 'building'
                      ? 'bg-blue-500/10 text-blue-400'
                      : activity.status === 'error'
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-gray-500/10 text-gray-400'
                  }`}>
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
