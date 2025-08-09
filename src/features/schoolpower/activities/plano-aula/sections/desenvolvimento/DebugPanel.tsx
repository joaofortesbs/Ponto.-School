
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bug, 
  Database, 
  Clock, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface DebugPanelProps {
  planoId: string;
  show: boolean;
  onClose: () => void;
}

export default function DebugPanel({ planoId, show, onClose }: DebugPanelProps) {
  const [debugData, setDebugData] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (show && planoId) {
      carregarDadosDebug();
    }
  }, [show, planoId]);

  const carregarDadosDebug = () => {
    try {
      // Carregar contexto de debug
      const contextoDebug = localStorage.getItem(`debug_contexto_${planoId}`);
      const desenvolvimentoData = localStorage.getItem(`plano_desenvolvimento_${planoId}`);
      const tempoData = localStorage.getItem(`plano_tempo_${planoId}`);
      const recursosData = localStorage.getItem(`plano_recursos_${planoId}`);
      
      const dados = {
        contextoDebug: contextoDebug ? JSON.parse(contextoDebug) : null,
        desenvolvimentoData: desenvolvimentoData ? JSON.parse(desenvolvimentoData) : null,
        tempoData: tempoData ? JSON.parse(tempoData) : null,
        recursosData: recursosData ? JSON.parse(recursosData) : null,
        ultimaAtualizacao: new Date().toISOString()
      };
      
      setDebugData(dados);
      
      // Carregar logs do console (simulado)
      const logsSimulados = [
        { tipo: 'success', mensagem: 'Contexto coletado com sucesso', timestamp: new Date().toISOString() },
        { tipo: 'info', mensagem: 'Gerando etapas via Gemini API', timestamp: new Date().toISOString() },
        { tipo: 'success', mensagem: 'Etapas geradas e salvas', timestamp: new Date().toISOString() },
        { tipo: 'info', mensagem: 'Sincronização com outras seções concluída', timestamp: new Date().toISOString() }
      ];
      
      setLogs(logsSimulados);
      
    } catch (error) {
      console.error('Erro ao carregar dados de debug:', error);
    }
  };

  const limparDadosDebug = () => {
    try {
      localStorage.removeItem(`debug_contexto_${planoId}`);
      localStorage.removeItem(`plano_desenvolvimento_${planoId}`);
      localStorage.removeItem(`plano_tempo_${planoId}`);
      localStorage.removeItem(`plano_recursos_${planoId}`);
      
      setDebugData(null);
      setLogs([]);
      
      alert('Dados de debug limpos com sucesso!');
    } catch (error) {
      console.error('Erro ao limpar dados de debug:', error);
    }
  };

  const exportarDadosDebug = () => {
    try {
      const dadosExport = {
        planoId,
        debugData,
        logs,
        timestamp: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(dadosExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `debug_plano_${planoId}_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar dados de debug:', error);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white dark:bg-gray-900">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-orange-500" />
              Debug Panel - Desenvolvimento IA
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={carregarDadosDebug} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-1" />
                Atualizar
              </Button>
              <Button onClick={exportarDadosDebug} size="sm" variant="outline">
                <Database className="h-4 w-4 mr-1" />
                Exportar
              </Button>
              <Button onClick={limparDadosDebug} size="sm" variant="outline">
                <Trash2 className="h-4 w-4 mr-1" />
                Limpar
              </Button>
              <Button onClick={onClose} size="sm">
                Fechar
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <ScrollArea className="h-96">
            <div className="space-y-6">
              
              {/* Status Geral */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Contexto</span>
                  </div>
                  <Badge className={debugData?.contextoDebug ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {debugData?.contextoDebug ? 'Coletado' : 'Pendente'}
                  </Badge>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">IA Gemini</span>
                  </div>
                  <Badge className={debugData?.desenvolvimentoData ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                    {debugData?.desenvolvimentoData ? 'Gerado' : 'Aguardando'}
                  </Badge>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Sincronização</span>
                  </div>
                  <Badge className={debugData?.tempoData ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {debugData?.tempoData ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm font-medium">Armazenamento</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    LocalStorage
                  </Badge>
                </div>
              </div>

              {/* Contexto Coletado */}
              {debugData?.contextoDebug && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Contexto Coletado</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(debugData.contextoDebug.contexto, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Dados de Desenvolvimento */}
              {debugData?.desenvolvimentoData && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Dados de Desenvolvimento</h3>
                  <div className="space-y-2">
                    <p><strong>Etapas Geradas:</strong> {debugData.desenvolvimentoData.etapas?.length || 0}</p>
                    <p><strong>Tempo Total:</strong> {debugData.desenvolvimentoData.tempoTotalEstimado}</p>
                    <p><strong>Sugestões IA:</strong> {debugData.desenvolvimentoData.sugestoesIA?.length || 0}</p>
                  </div>
                </div>
              )}

              {/* Dados Sincronizados */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {debugData?.tempoData && (
                  <div>
                    <h4 className="font-medium mb-2">Sincronização de Tempo</h4>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                      <p className="text-sm"><strong>Tempo Desenvolvimento:</strong> {debugData.tempoData.tempoDesenvolvimento}</p>
                      <p className="text-xs text-gray-600">Atualizado: {new Date(debugData.tempoData.ultimaAtualizacao).toLocaleString()}</p>
                    </div>
                  </div>
                )}
                
                {debugData?.recursosData && (
                  <div>
                    <h4 className="font-medium mb-2">Recursos Extraídos</h4>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                      <p className="text-sm"><strong>Recursos:</strong> {debugData.recursosData.recursosDesenvolvimento?.length || 0}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {debugData.recursosData.recursosDesenvolvimento?.slice(0, 3).map((recurso: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">{recurso}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Logs */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Logs de Atividade</h3>
                <div className="space-y-2">
                  {logs.map((log, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      {log.tipo === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {log.tipo === 'info' && <AlertTriangle className="h-4 w-4 text-blue-500" />}
                      {log.tipo === 'error' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      <span className="text-sm flex-1">{log.mensagem}</span>
                      <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
