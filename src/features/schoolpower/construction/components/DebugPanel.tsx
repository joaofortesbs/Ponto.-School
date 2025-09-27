import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Bug, Database, Activity, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface DebugLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  category: 'construction' | 'profile' | 'database' | 'autosave' | 'api';
  message: string;
  data?: any;
}

interface DebugPanelProps {
  isVisible: boolean;
  onToggle: () => void;
}

export function DebugPanel({ isVisible, onToggle }: DebugPanelProps) {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Sistema de captura de logs
  useEffect(() => {
    const addLog = (level: DebugLog['level'], category: DebugLog['category'], message: string, data?: any) => {
      const log: DebugLog = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        level,
        category,
        message,
        data
      };
      
      setLogs(prev => [...prev.slice(-99), log]); // Manter apenas os últimos 100 logs
      
      // Log no console também para debug
      const prefix = `🔍 [DEBUG-${category.toUpperCase()}]`;
      switch (level) {
        case 'error':
          console.error(prefix, message, data);
          break;
        case 'warn':
          console.warn(prefix, message, data);
          break;
        case 'success':
          console.log(`✅ ${prefix}`, message, data);
          break;
        default:
          console.log(prefix, message, data);
      }
    };

    // Interceptar logs específicos da construção
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.log = (...args) => {
      const message = args.join(' ');
      
      // Detectar logs específicos do sistema
      if (message.includes('[AUTO-BUILD]')) {
        addLog('info', 'construction', message.replace(/.*\[AUTO-BUILD\]/, ''), args);
      } else if (message.includes('[AUTO-SAVE]')) {
        addLog('info', 'autosave', message.replace(/.*\[AUTO-SAVE\]/, ''), args);
      } else if (message.includes('[PROFILE]')) {
        addLog('info', 'profile', message.replace(/.*\[PROFILE\]/, ''), args);
      } else if (message.includes('atividade')) {
        addLog('info', 'database', message, args);
      }
      
      originalConsoleLog.apply(console, args);
    };

    console.error = (...args) => {
      const message = args.join(' ');
      
      if (message.includes('[AUTO-BUILD]') || message.includes('[AUTO-SAVE]')) {
        addLog('error', 'autosave', message.replace(/.*\[(AUTO-BUILD|AUTO-SAVE)\]/, ''), args);
      } else if (message.includes('[PROFILE]')) {
        addLog('error', 'profile', message.replace(/.*\[PROFILE\]/, ''), args);
      } else {
        addLog('error', 'api', message, args);
      }
      
      originalConsoleError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args.join(' ');
      addLog('warn', 'construction', message, args);
      originalConsoleWarn.apply(console, args);
    };

    // Listeners para eventos customizados do sistema
    const handleActivityBuilt = (event: CustomEvent) => {
      addLog('success', 'construction', `Atividade construída: ${event.detail.activityTitle}`, event.detail);
    };

    const handleActivityAutoSaved = (event: CustomEvent) => {
      addLog('success', 'autosave', `Atividade salva automaticamente: ID ${event.detail.databaseId}`, event.detail);
    };

    const handleProfileLoaded = (event: CustomEvent) => {
      addLog('success', 'profile', `Perfil carregado: ${event.detail.profileId}`, event.detail);
    };

    window.addEventListener('activity-built', handleActivityBuilt);
    window.addEventListener('activity-auto-saved', handleActivityAutoSaved);
    window.addEventListener('profile-loaded', handleProfileLoaded);

    // Log inicial
    addLog('info', 'construction', 'Sistema de debug inicializado');

    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      window.removeEventListener('activity-built', handleActivityBuilt);
      window.removeEventListener('activity-auto-saved', handleActivityAutoSaved);
      window.removeEventListener('profile-loaded', handleProfileLoaded);
    };
  }, []);

  const clearLogs = () => {
    setLogs([]);
  };

  const exportLogs = () => {
    const logData = logs.map(log => ({
      ...log,
      data: JSON.stringify(log.data, null, 2)
    }));
    
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString().slice(0, 16)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = filterCategory === 'all' 
    ? logs 
    : logs.filter(log => log.category === filterCategory);

  const getLevelIcon = (level: DebugLog['level']) => {
    switch (level) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warn': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCategoryColor = (category: DebugLog['category']) => {
    switch (category) {
      case 'construction': return 'bg-blue-100 text-blue-800';
      case 'autosave': return 'bg-green-100 text-green-800';
      case 'profile': return 'bg-purple-100 text-purple-800';
      case 'database': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 bg-red-500 text-white hover:bg-red-600"
      >
        <Bug className="h-4 w-4 mr-2" />
        Debug Panel
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] bg-white border border-gray-300 rounded-lg shadow-lg">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">🔍 Debug Panel - School Power</CardTitle>
            <Button onClick={onToggle} variant="ghost" size="sm">
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setFilterCategory('all')}
              variant={filterCategory === 'all' ? 'default' : 'outline'}
              size="sm"
            >
              Todos ({logs.length})
            </Button>
            <Button
              onClick={() => setFilterCategory('construction')}
              variant={filterCategory === 'construction' ? 'default' : 'outline'}
              size="sm"
            >
              Construção
            </Button>
            <Button
              onClick={() => setFilterCategory('autosave')}
              variant={filterCategory === 'autosave' ? 'default' : 'outline'}
              size="sm"
            >
              Auto-Save
            </Button>
            <Button
              onClick={() => setFilterCategory('profile')}
              variant={filterCategory === 'profile' ? 'default' : 'outline'}
              size="sm"
            >
              Perfil
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={clearLogs} variant="outline" size="sm">
              Limpar
            </Button>
            <Button onClick={exportLogs} variant="outline" size="sm">
              Exportar
            </Button>
          </div>
        </CardHeader>

        <CardContent className="max-h-96 overflow-y-auto text-xs">
          {filteredLogs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum log encontrado</p>
          ) : (
            <div className="space-y-2">
              {filteredLogs.slice(-20).reverse().map((log) => (
                <Collapsible key={log.id}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center gap-2 p-2 rounded border hover:bg-gray-50 text-left">
                      {getLevelIcon(log.level)}
                      <span className="text-xs text-gray-500">{log.timestamp}</span>
                      <Badge className={`text-xs ${getCategoryColor(log.category)}`}>
                        {log.category}
                      </Badge>
                      <span className="flex-1 truncate text-left">
                        {log.message}
                      </span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-2 bg-gray-50 rounded text-xs">
                      <div className="font-medium mb-1">Mensagem:</div>
                      <div className="mb-2">{log.message}</div>
                      {log.data && (
                        <>
                          <div className="font-medium mb-1">Dados:</div>
                          <pre className="bg-white p-2 rounded text-xs overflow-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DebugPanel;