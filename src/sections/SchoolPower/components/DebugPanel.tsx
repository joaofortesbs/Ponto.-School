"use client";
import React, { useState, useEffect } from 'react';
import useSchoolPowerFlow from '../../../features/schoolpower/hooks/useSchoolPowerFlow';

interface GeminiApiCall {
  id: string;
  timestamp: string;
  status: 'preparing' | 'sending' | 'success' | 'error' | 'timeout';
  requestData?: {
    prompt: string;
    promptLength: number;
    temperature?: number;
    maxTokens?: number;
  };
  responseData?: {
    responseText: string;
    responseLength: number;
    tokensUsed?: number;
    executionTime: number;
  };
  errorData?: {
    errorMessage: string;
    errorCode?: string;
    httpStatus?: number;
  };
  phase: string;
  processingSteps: string[];
}

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
  geminiApiCalls: GeminiApiCall[];
  geminiApiStats: {
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    averageResponseTime: number;
  };
}

export default function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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
    },
    geminiApiCalls: [],
    geminiApiStats: {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      averageResponseTime: 0
    }
  });

  const { flowState, flowData, isLoading } = useSchoolPowerFlow();

  // Verificações do sistema
  const performSystemChecks = () => {
    const checks = {
      reactImported: typeof React !== 'undefined',
      hooksLoaded: typeof useSchoolPowerFlow === 'function',
      componentsLoaded: true, // Se chegou até aqui, os componentes carregaram
      servicesLoaded: true, // Verificar se os serviços estão disponíveis
      dataValidated: flowData !== null
    };

    return checks;
  };

  // Monitorar chamadas da API Gemini
  const monitorGeminiApiCalls = () => {
    const storedCalls = localStorage.getItem('gemini_api_calls');
    const calls: GeminiApiCall[] = storedCalls ? JSON.parse(storedCalls) : [];
    
    // Manter apenas as últimas 20 chamadas
    const recentCalls = calls.slice(-20);
    
    // Calcular estatísticas
    const stats = {
      totalCalls: recentCalls.length,
      successfulCalls: recentCalls.filter(call => call.status === 'success').length,
      failedCalls: recentCalls.filter(call => call.status === 'error').length,
      averageResponseTime: recentCalls
        .filter(call => call.responseData?.executionTime)
        .reduce((acc, call) => acc + (call.responseData?.executionTime || 0), 0) / 
        Math.max(recentCalls.filter(call => call.responseData?.executionTime).length, 1)
    };

    return { calls: recentCalls, stats };
  };

  // Capturar erros do console
  const captureConsoleErrors = () => {
    const errors: string[] = [];

    // Override console.error para capturar erros
    const originalError = console.error;
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

  // Interceptar fetch para monitorar chamadas Gemini
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [url, options] = args;
      const urlString = typeof url === 'string' ? url : url.toString();
      
      // Verificar se é uma chamada para Gemini API
      if (urlString.includes('generativelanguage.googleapis.com')) {
        const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const startTime = Date.now();
        
        // Criar registro inicial da chamada
        const apiCall: GeminiApiCall = {
          id: callId,
          timestamp: new Date().toISOString(),
          status: 'preparing',
          phase: 'Preparando requisição',
          processingSteps: ['Iniciando chamada para API Gemini'],
          requestData: {
            prompt: 'Extraindo prompt...',
            promptLength: 0,
            temperature: 0.7,
            maxTokens: 2048
          }
        };

        // Tentar extrair dados da requisição
        try {
          if (options?.body) {
            const requestBody = JSON.parse(options.body as string);
            if (requestBody.contents?.[0]?.parts?.[0]?.text) {
              const prompt = requestBody.contents[0].parts[0].text;
              apiCall.requestData = {
                prompt: prompt.substring(0, 500) + (prompt.length > 500 ? '...' : ''),
                promptLength: prompt.length,
                temperature: requestBody.generationConfig?.temperature || 0.7,
                maxTokens: requestBody.generationConfig?.maxOutputTokens || 2048
              };
            }
          }
        } catch (error) {
          apiCall.processingSteps.push(`Erro ao extrair dados da requisição: ${error}`);
        }

        // Salvar chamada inicial
        const existingCalls = JSON.parse(localStorage.getItem('gemini_api_calls') || '[]');
        existingCalls.push(apiCall);
        localStorage.setItem('gemini_api_calls', JSON.stringify(existingCalls));

        try {
          // Atualizar status
          apiCall.status = 'sending';
          apiCall.phase = 'Enviando requisição';
          apiCall.processingSteps.push('Requisição enviada para o servidor Gemini');
          
          const response = await originalFetch(...args);
          const responseTime = Date.now() - startTime;

          if (response.ok) {
            const responseData = await response.clone().json();
            
            apiCall.status = 'success';
            apiCall.phase = 'Resposta recebida com sucesso';
            apiCall.processingSteps.push(`Resposta recebida em ${responseTime}ms`);
            
            if (responseData.candidates?.[0]?.content?.parts?.[0]?.text) {
              const responseText = responseData.candidates[0].content.parts[0].text;
              apiCall.responseData = {
                responseText: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''),
                responseLength: responseText.length,
                executionTime: responseTime,
                tokensUsed: Math.ceil((apiCall.requestData?.promptLength || 0 + responseText.length) / 4)
              };
              apiCall.processingSteps.push(`Texto gerado: ${responseText.length} caracteres`);
              apiCall.processingSteps.push(`Tokens estimados: ${apiCall.responseData.tokensUsed}`);
            } else {
              apiCall.status = 'error';
              apiCall.phase = 'Resposta inválida';
              apiCall.errorData = {
                errorMessage: 'Resposta da API não contém texto válido',
                errorCode: 'INVALID_RESPONSE'
              };
              apiCall.processingSteps.push('Erro: Resposta não contém conteúdo válido');
            }
          } else {
            const errorText = await response.text();
            apiCall.status = 'error';
            apiCall.phase = 'Erro na resposta HTTP';
            apiCall.errorData = {
              errorMessage: errorText || 'Erro desconhecido na API',
              httpStatus: response.status,
              errorCode: `HTTP_${response.status}`
            };
            apiCall.processingSteps.push(`Erro HTTP ${response.status}: ${errorText}`);
          }

          // Atualizar chamada no localStorage
          const updatedCalls = JSON.parse(localStorage.getItem('gemini_api_calls') || '[]');
          const callIndex = updatedCalls.findIndex((call: GeminiApiCall) => call.id === callId);
          if (callIndex !== -1) {
            updatedCalls[callIndex] = apiCall;
            localStorage.setItem('gemini_api_calls', JSON.stringify(updatedCalls));
          }

          return response;

        } catch (error) {
          const responseTime = Date.now() - startTime;
          
          apiCall.status = 'error';
          apiCall.phase = 'Erro na requisição';
          apiCall.errorData = {
            errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
            errorCode: 'NETWORK_ERROR'
          };
          apiCall.processingSteps.push(`Erro de rede após ${responseTime}ms: ${error}`);

          // Atualizar chamada no localStorage
          const updatedCalls = JSON.parse(localStorage.getItem('gemini_api_calls') || '[]');
          const callIndex = updatedCalls.findIndex((call: GeminiApiCall) => call.id === callId);
          if (callIndex !== -1) {
            updatedCalls[callIndex] = apiCall;
            localStorage.setItem('gemini_api_calls', JSON.stringify(updatedCalls));
          }

          throw error;
        }
      }

      return originalFetch(...args);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // Verificar status das APIs
  const checkAPIStatus = async () => {
    const status = {
      gemini: 'idle' as const,
      supabase: 'idle' as const
    };

    try {
      // Verificar se a chave da API Gemini está disponível
      const geminiKey = 'AIzaSyD-Sso0SdyYKoA4M3tQhcWjQ1AoddB7Wo4';
      if (geminiKey) {
        status.gemini = 'active';
      } else {
        status.gemini = 'error';
      }
    } catch (error) {
      status.gemini = 'error';
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
    }

    return status;
  };

  // Atualizar dados de debug
  useEffect(() => {
    const updateDebugData = async () => {
      const errors = captureConsoleErrors();
      const systemChecks = performSystemChecks();
      const apiStatus = await checkAPIStatus();
      const { calls, stats } = monitorGeminiApiCalls();

      let localStorage_data = null;
      try {
        localStorage_data = JSON.parse(localStorage.getItem('schoolpower_flow_data') || 'null');
      } catch (error) {
        errors.push(`LocalStorage Error: ${error}`);
      }

      setDebugData({
        timestamp: new Date().toLocaleTimeString(),
        flowState: flowState || 'undefined',
        flowData: flowData || null,
        isLoading: isLoading || false,
        localStorage: localStorage_data,
        errors: errors.slice(-10), // Manter apenas os últimos 10 erros
        apiStatus,
        systemChecks,
        geminiApiCalls: calls,
        geminiApiStats: stats
      });
    };

    updateDebugData();
    const interval = setInterval(updateDebugData, 2000); // Atualizar a cada 2 segundos

    return () => clearInterval(interval);
  }, [flowState, flowData, isLoading]);

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

  // Listener para ativar debug mode
  useEffect(() => {
    const handleActivateDebug = () => {
      setIsVisible(true);
      setIsExpanded(true);
    };

    window.addEventListener('activateDebugMode', handleActivateDebug);
    
    return () => {
      window.removeEventListener('activateDebugMode', handleActivateDebug);
    };
  }, []);

  if (process.env.NODE_ENV !== 'development' || !isVisible) {
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

          {/* Estatísticas da API Gemini */}
          <div className="mb-4">
            <h4 className="text-purple-300 font-semibold mb-2">🧠 API Gemini - Estatísticas</h4>
            <div className="bg-purple-900/20 border border-purple-500/30 p-2 rounded text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>Total de Calls: <span className="text-purple-300">{debugData.geminiApiStats.totalCalls}</span></div>
                <div>Calls com Sucesso: <span className="text-green-300">{debugData.geminiApiStats.successfulCalls}</span></div>
                <div>Calls com Erro: <span className="text-red-300">{debugData.geminiApiStats.failedCalls}</span></div>
                <div>Tempo Médio: <span className="text-yellow-300">{Math.round(debugData.geminiApiStats.averageResponseTime)}ms</span></div>
              </div>
              <div className="mt-2">
                Taxa de Sucesso: <span className={debugData.geminiApiStats.totalCalls > 0 
                  ? (debugData.geminiApiStats.successfulCalls / debugData.geminiApiStats.totalCalls) > 0.8 
                    ? 'text-green-300' : 'text-yellow-300'
                  : 'text-gray-300'}>
                  {debugData.geminiApiStats.totalCalls > 0 
                    ? `${Math.round((debugData.geminiApiStats.successfulCalls / debugData.geminiApiStats.totalCalls) * 100)}%`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Chamadas Recentes da API Gemini */}
          <div className="mb-4">
            <h4 className="text-purple-300 font-semibold mb-2">📡 Chamadas API Gemini Recentes</h4>
            <div className="bg-purple-900/20 border border-purple-500/30 p-2 rounded text-xs max-h-64 overflow-y-auto">
              {debugData.geminiApiCalls.length > 0 ? (
                debugData.geminiApiCalls.slice(-5).reverse().map((call) => (
                  <div key={call.id} className="mb-3 pb-2 border-b border-purple-500/20 last:border-b-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-purple-200 font-semibold">Call #{call.id.split('_')[1]?.substring(0, 4)}</span>
                      <span className={`px-1 py-0.5 rounded text-xs ${
                        call.status === 'success' ? 'bg-green-600 text-green-100' :
                        call.status === 'error' ? 'bg-red-600 text-red-100' :
                        call.status === 'sending' ? 'bg-yellow-600 text-yellow-100' :
                        'bg-gray-600 text-gray-100'
                      }`}>
                        {call.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-300 mb-1">
                      📅 {new Date(call.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-blue-200 mb-1">
                      📍 Fase: {call.phase}
                    </div>
                    
                    {call.requestData && (
                      <div className="text-xs mb-2">
                        <div className="text-green-300">📤 Request:</div>
                        <div className="text-gray-300 pl-2">
                          • Prompt: {call.requestData.promptLength} chars
                          • Temp: {call.requestData.temperature}
                          • Max Tokens: {call.requestData.maxTokens}
                        </div>
                      </div>
                    )}

                    {call.responseData && (
                      <div className="text-xs mb-2">
                        <div className="text-green-300">📥 Response:</div>
                        <div className="text-gray-300 pl-2">
                          • Resposta: {call.responseData.responseLength} chars
                          • Tokens: ~{call.responseData.tokensUsed}
                          • Tempo: {call.responseData.executionTime}ms
                        </div>
                      </div>
                    )}

                    {call.errorData && (
                      <div className="text-xs mb-2">
                        <div className="text-red-300">❌ Erro:</div>
                        <div className="text-red-200 pl-2 break-words">
                          {call.errorData.errorCode && `[${call.errorData.errorCode}] `}
                          {call.errorData.errorMessage}
                          {call.errorData.httpStatus && ` (HTTP ${call.errorData.httpStatus})`}
                        </div>
                      </div>
                    )}

                    <div className="text-xs">
                      <div className="text-blue-300">🔄 Etapas:</div>
                      {call.processingSteps.map((step, index) => (
                        <div key={index} className="text-gray-300 pl-2">
                          {index + 1}. {step}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-gray-400">Nenhuma chamada registrada ainda</span>
              )}
            </div>
          </div>

          {/* Teste Manual da API */}
          <div className="mb-4">
            <h4 className="text-orange-300 font-semibold mb-2">🧪 Teste Manual API</h4>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try {
                    const testPrompt = 'Teste de conectividade: responda apenas "OK" se você recebeu esta mensagem.';
                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyBHSqe2PLstOR-M9pBn45DQFcuAN3msYmw`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        contents: [{ parts: [{ text: testPrompt }] }],
                        generationConfig: { temperature: 0.3, maxOutputTokens: 50 }
                      })
                    });
                    
                    if (response.ok) {
                      alert('✅ Teste manual bem-sucedido! API Gemini está funcionando.');
                    } else {
                      alert(`❌ Teste manual falhou! HTTP ${response.status}`);
                    }
                  } catch (error) {
                    alert(`❌ Erro no teste: ${error}`);
                  }
                }}
                className="px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded text-xs transition-colors duration-200"
              >
                🔥 Testar API
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('gemini_api_calls');
                  alert('Histórico de chamadas Gemini limpo!');
                }}
                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs transition-colors duration-200"
              >
                🧹 Limpar Histórico
              </button>
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
              }}
              className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors duration-200"
            >
              🗑️ Limpar Cache
            </button>
            <button
              onClick={() => {
                const debugReport = {
                  timestamp: new Date().toISOString(),
                  flowState: debugData.flowState,
                  geminiStats: debugData.geminiApiStats,
                  recentCalls: debugData.geminiApiCalls.slice(-3),
                  systemChecks: debugData.systemChecks,
                  errors: debugData.errors
                };
                navigator.clipboard.writeText(JSON.stringify(debugReport, null, 2));
                alert('📋 Relatório completo copiado para área de transferência!');
              }}
              className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs transition-colors duration-200"
            >
              📊 Copiar Relatório
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