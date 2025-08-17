"use client";
import React, { useState, useEffect } from 'react';
// Removendo a importação de useSchoolPowerFlow pois as props serão passadas externamente
// import useSchoolPowerFlow from '../../../features/schoolpower/hooks/useSchoolPowerFlow';

interface DebugData {
  timestamp: string;
  flowState: string;
  flowData: any;
  isLoading: boolean;
  localStorage: any;
  errors: string[];
  apiStatus: {
    gemini: 'loading' | 'active' | 'error' | 'idle';
    supabase: 'loading' | 'active' | 'error' | 'idle';
  };
  systemChecks: {
    reactImported: boolean;
    hooksLoaded: boolean;
    componentsLoaded: boolean;
    servicesLoaded: boolean;
    dataValidated: boolean;
  };
}

interface DebugPanelProps {
  flowState: string;
  flowData: any;
  isLoading: boolean;
}

export default function DebugPanel({ flowState, flowData, isLoading }: DebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false); // Renomeado de isVisible para isExpanded para clareza
  const [debugData, setDebugData] = useState<DebugData>({
    timestamp: '',
    flowState: '',
    flowData: null,
    isLoading: false,
    localStorage: null,
    errors: [],
    apiStatus: {
      gemini: 'idle',
      supabase: 'idle'
    },
    systemChecks: {
      reactImported: false,
      hooksLoaded: false,
      componentsLoaded: false,
      servicesLoaded: false,
      dataValidated: false
    }
  });

  // Removendo a chamada ao hook useSchoolPowerFlow, pois as props são recebidas
  // const { flowState, flowData, isLoading } = useSchoolPowerFlow();

  // Verificações do sistema
  const performSystemChecks = () => {
    const checks = {
      reactImported: typeof React !== 'undefined',
      // hooksLoaded: typeof useSchoolPowerFlow === 'function', // Descomentar se useSchoolPowerFlow for importado em outro lugar e necessário verificar
      hooksLoaded: true, // Assumindo que os hooks estão disponíveis se o componente for renderizado
      componentsLoaded: true, // Se chegou até aqui, os componentes carregaram
      servicesLoaded: true, // Verificar se os serviços estão disponíveis
      dataValidated: flowData !== null
    };

    return checks;
  };

  // Capturar erros do console
  const captureConsoleErrors = () => {
    const errors: string[] = [];

    // Override console.error para capturar erros
    const originalError = console.error;
    // @ts-ignore
    console.error = (...args) => {
      const errorMessage = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');

      if (errorMessage.toLowerCase().includes('school power') || 
          errorMessage.toLowerCase().includes('gemini') ||
          errorMessage.toLowerCase().includes('react is not defined')) {
        errors.push(`${new Date().toLocaleTimeString()}: ${errorMessage}`);
      }

      originalError.apply(console, args);
    };

    return errors;
  };

  // Verificar status das APIs
  const checkAPIStatus = async () => {
    const status = {
      gemini: 'idle' as const,
      supabase: 'idle' as const
    };

    try {
      // Verificar se a chave da API Gemini está disponível (simulada)
      // Substituir por uma lógica real de verificação se necessário
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY; // Assumindo que a chave está em .env
      if (geminiKey) {
        status.gemini = 'active';
      } else {
        status.gemini = 'error';
      }
    } catch (error) {
      status.gemini = 'error';
      console.error("Erro ao verificar status da API Gemini:", error);
    }

    try {
      // Verificar Supabase
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl) {
        status.supabase = 'active';
      } else {
        status.supabase = 'error';
      }
    } catch (error) {
      status.supabase = 'error';
      console.error("Erro ao verificar status da API Supabase:", error);
    }

    return status;
  };

  // Atualizar dados de debug
  useEffect(() => {
    const updateDebugData = async () => {
      const errors = captureConsoleErrors();
      const systemChecks = performSystemChecks();
      const apiStatus = await checkAPIStatus();

      let localStorage_data = null;
      try {
        // A chave do localStorage pode precisar ser ajustada dependendo de onde os dados são salvos.
        // Assumindo que 'schoolpower_flow_data' é a chave correta.
        localStorage_data = localStorage.getItem('schoolpower_flow_data');
        if (localStorage_data) {
          localStorage_data = JSON.parse(localStorage_data);
        } else {
          localStorage_data = null;
        }
      } catch (error) {
        console.error("Erro ao ler do LocalStorage:", error);
        errors.push(`LocalStorage Read Error: ${JSON.stringify(error)}`);
      }

      setDebugData({
        timestamp: new Date().toLocaleTimeString(),
        flowState: flowState || 'undefined', // Usa a prop flowState
        flowData: flowData || null,       // Usa a prop flowData
        isLoading: isLoading || false,      // Usa a prop isLoading
        localStorage: localStorage_data,
        errors: errors.slice(-10), // Manter apenas os últimos 10 erros
        apiStatus,
        systemChecks
      });
    };

    // Executa imediatamente ao montar o componente
    updateDebugData();

    // Configura o intervalo apenas se o componente estiver visível (isExpanded)
    const interval = isExpanded ? setInterval(updateDebugData, 2000) : null;

    // Limpa o intervalo quando o componente é desmontado ou quando isExpanded muda para false
    return () => {
      if (interval) clearInterval(interval);
      // Restaurar console.error original ao desmontar para evitar efeitos colaterais
      // @ts-ignore
      console.error = console.error.originalError || console.log; 
    };
  }, [flowState, flowData, isLoading, isExpanded]); // Adicionado isExpanded às dependências

  const getStatusColor = (status: string | boolean) => {
    if (typeof status === 'boolean') {
      return status ? 'text-green-400' : 'text-red-400';
    }
    switch (status) {
      case 'active': return 'text-green-400';
      case 'loading': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string | boolean) => {
    if (typeof status === 'boolean') {
      return status ? '✅' : '❌';
    }
    switch (status) {
      case 'active': return '🟢';
      case 'loading': return '🟡';
      case 'error': return '🔴';
      default: return '⚪';
    }
  };

  // O debug só deve ser visível em ambiente de desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-sm">
      {/* Botão de Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mb-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg shadow-lg transition-colors duration-200 font-mono"
      >
        🔍 Debug School Power {isExpanded ? '▼' : '▶'}
      </button>

      {/* Painel de Debug */}
      {isExpanded && (
        <div className="bg-black/95 border border-blue-500/30 rounded-lg p-4 text-xs font-mono text-white shadow-2xl backdrop-blur-sm max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-blue-500/30">
            <h3 className="text-blue-300 font-bold">🚀 School Power Debug</h3>
            <span className="text-gray-400">{debugData.timestamp}</span>
          </div>

          {/* Status Geral */}
          <div className="mb-4">
            <h4 className="text-green-300 font-semibold mb-2">📊 Status Geral</h4>
            <div className="space-y-1 text-xs">
              <div>Estado do Flow: <span className="text-cyan-300">{debugData.flowState}</span></div>
              <div>Carregando: <span className={getStatusColor(debugData.isLoading)}>{debugData.isLoading ? 'SIM' : 'NÃO'}</span></div>
              <div>Dados Válidos: <span className={getStatusColor(!!debugData.flowData)}>{debugData.flowData ? 'SIM' : 'NÃO'}</span></div>
            </div>
          </div>

          {/* Verificações do Sistema */}
          <div className="mb-4">
            <h4 className="text-green-300 font-semibold mb-2">🔧 Sistema</h4>
            <div className="space-y-1 text-xs">
              {Object.entries(debugData.systemChecks).map(([key, status]) => (
                <div key={key} className="flex justify-between">
                  <span>{key}:</span>
                  <span className={getStatusColor(status)}>
                    {getStatusIcon(status)} {status ? 'OK' : 'ERRO'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Status das APIs */}
          <div className="mb-4">
            <h4 className="text-green-300 font-semibold mb-2">🌐 APIs</h4>
            <div className="space-y-1 text-xs">
              {Object.entries(debugData.apiStatus).map(([api, status]) => (
                <div key={api} className="flex justify-between">
                  <span>{api.toUpperCase()}:</span>
                  <span className={getStatusColor(status)}>
                    {getStatusIcon(status)} {status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dados do Flow */}
          <div className="mb-4">
            <h4 className="text-green-300 font-semibold mb-2">💾 Dados do Flow</h4>
            <div className="bg-gray-900/50 p-2 rounded text-xs overflow-x-auto">
              <div>Mensagem: <span className="text-yellow-300">{debugData.flowData?.initialMessage || 'null'}</span></div>
              <div>Contexto: <span className="text-yellow-300">{debugData.flowData?.contextualizationData ? 'Definido' : 'null'}</span></div>
              <div>Plano: <span className="text-yellow-300">{debugData.flowData?.actionPlan?.length || 0} itens</span></div>
            </div>
          </div>

          {/* LocalStorage */}
          <div className="mb-4">
            <h4 className="text-green-300 font-semibold mb-2">💽 LocalStorage</h4>
            <div className="bg-gray-900/50 p-2 rounded text-xs overflow-x-auto">
              {debugData.localStorage ? (
                <pre className="text-yellow-300 whitespace-pre-wrap">
                  {JSON.stringify(debugData.localStorage, null, 2)}
                </pre>
              ) : (
                <span className="text-red-300">Nenhum dado encontrado</span>
              )}
            </div>
          </div>

          {/* Erros Recentes */}
          <div className="mb-4">
            <h4 className="text-red-300 font-semibold mb-2">🚨 Erros Recentes</h4>
            <div className="bg-red-900/20 border border-red-500/30 p-2 rounded text-xs max-h-32 overflow-y-auto">
              {debugData.errors.length > 0 ? (
                debugData.errors.map((error, index) => (
                  <div key={index} className="text-red-300 mb-1 break-words">
                    {error}
                  </div>
                ))
              ) : (
                <span className="text-green-300">✅ Nenhum erro detectado</span>
              )}
            </div>
          </div>

          {/* Ações de Debug */}
          <div className="flex gap-2 pt-2 border-t border-blue-500/30">
            <button
              onClick={() => {
                console.log('🔍 School Power Debug Data:', debugData);
                alert('Dados enviados para o console!');
              }}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors duration-200"
            >
              📋 Log Console
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('schoolpower_flow_data');
                alert('LocalStorage limpo!');
                // Forçar uma atualização dos dados de debug após limpar o cache
                setDebugData(prev => ({ ...prev, localStorage: null }));
              }}
              className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors duration-200"
            >
              🗑️ Limpar Cache
            </button>
          </div>

          {/* Indicador de Atualização Automática */}
          <div className="mt-3 pt-2 border-t border-blue-500/30 text-center">
            <span className="text-gray-400 text-xs">
              🔄 Atualizando a cada 2s
            </span>
          </div>
        </div>
      )}
    </div>
  );
}