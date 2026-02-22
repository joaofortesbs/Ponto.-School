
import React, { useState, useEffect } from 'react';

interface ApiCallStep {
  step: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  timestamp: string;
  details?: string;
}

interface LiveApiCall {
  id: string;
  startTime: number;
  steps: ApiCallStep[];
  currentPhase: string;
  isActive: boolean;
}

export default function GeminiApiMonitor() {
  const [isDebugActive, setIsDebugActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [liveCall, setLiveCall] = useState<LiveApiCall | null>(null);
  const [apiHealth, setApiHealth] = useState<'healthy' | 'warning' | 'error' | 'unknown'>('unknown');
  
  // Monitorar saúde da API
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const healthCheck = await fetch('https://generativelanguage.googleapis.com', { 
          method: 'HEAD',
          mode: 'no-cors'
        });
        setApiHealth('healthy');
      } catch (error) {
        setApiHealth('error');
      }
    };

    checkApiHealth();
    const healthInterval = setInterval(checkApiHealth, 30000); // Check every 30 seconds

    return () => clearInterval(healthInterval);
  }, []);

  // Interceptar e monitorar chamadas em tempo real
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [url] = args;
      const urlString = typeof url === 'string' ? url : url.toString();
      
      if (urlString.includes('generativelanguage.googleapis.com')) {
        const callId = `monitor_${Date.now()}`;
        const startTime = Date.now();
        
        const newCall: LiveApiCall = {
          id: callId,
          startTime,
          steps: [
            {
              step: 'Iniciando chamada',
              status: 'completed',
              timestamp: new Date().toLocaleTimeString(),
              details: 'Preparando requisição para API Gemini'
            },
            {
              step: 'Enviando requisição',
              status: 'processing',
              timestamp: new Date().toLocaleTimeString()
            },
            {
              step: 'Aguardando resposta',
              status: 'pending',
              timestamp: ''
            },
            {
              step: 'Processando resposta',
              status: 'pending',
              timestamp: ''
            },
            {
              step: 'Finalizando',
              status: 'pending',
              timestamp: ''
            }
          ],
          currentPhase: 'Enviando requisição',
          isActive: true
        };

        setLiveCall(newCall);

        try {
          const response = await originalFetch(...args);
          const responseTime = Date.now() - startTime;

          // Atualizar step de aguardando resposta
          newCall.steps[2] = {
            step: 'Aguardando resposta',
            status: 'completed',
            timestamp: new Date().toLocaleTimeString(),
            details: `Resposta recebida em ${responseTime}ms`
          };
          newCall.steps[3].status = 'processing';
          newCall.currentPhase = 'Processando resposta';
          setLiveCall({...newCall});

          if (response.ok) {
            const data = await response.clone().json();
            
            // Finalizar com sucesso
            newCall.steps[3] = {
              step: 'Processando resposta',
              status: 'completed',
              timestamp: new Date().toLocaleTimeString(),
              details: data.candidates?.[0]?.content?.parts?.[0]?.text ? 
                `Texto gerado: ${data.candidates[0].content.parts[0].text.length} caracteres` :
                'Resposta processada sem conteúdo'
            };
            newCall.steps[4] = {
              step: 'Finalizando',
              status: 'completed',
              timestamp: new Date().toLocaleTimeString(),
              details: `Chamada concluída com sucesso (${responseTime}ms)`
            };
            newCall.currentPhase = 'Concluído com sucesso';
            newCall.isActive = false;
            setApiHealth('healthy');
          } else {
            // Finalizar com erro HTTP
            newCall.steps[3] = {
              step: 'Processando resposta',
              status: 'error',
              timestamp: new Date().toLocaleTimeString(),
              details: `Erro HTTP ${response.status}: ${response.statusText}`
            };
            newCall.steps[4] = {
              step: 'Finalizando',
              status: 'error',
              timestamp: new Date().toLocaleTimeString(),
              details: 'Chamada falhou com erro HTTP'
            };
            newCall.currentPhase = `Erro HTTP ${response.status}`;
            newCall.isActive = false;
            setApiHealth('error');
          }
          
          setLiveCall({...newCall});
          
          // Limpar após 5 segundos
          setTimeout(() => {
            setLiveCall(null);
          }, 5000);

          return response;

        } catch (error) {
          const responseTime = Date.now() - startTime;
          
          // Atualizar com erro de rede
          newCall.steps[1] = {
            step: 'Enviando requisição',
            status: 'error',
            timestamp: new Date().toLocaleTimeString(),
            details: `Erro de rede: ${error}`
          };
          newCall.steps[2].status = 'error';
          newCall.steps[3].status = 'error';
          newCall.steps[4] = {
            step: 'Finalizando',
            status: 'error',
            timestamp: new Date().toLocaleTimeString(),
            details: `Falha na conexão após ${responseTime}ms`
          };
          newCall.currentPhase = 'Erro de Conexão';
          newCall.isActive = false;
          setApiHealth('error');
          
          setLiveCall({...newCall});
          
          setTimeout(() => {
            setLiveCall(null);
          }, 10000); // Manter erro visível por mais tempo

          throw error;
        }
      }
      
      return originalFetch(...args);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const getHealthColor = (health: typeof apiHealth) => {
    switch (health) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getHealthIcon = (health: typeof apiHealth) => {
    switch (health) {
      case 'healthy': return '🟢';
      case 'warning': return '🟡';
      case 'error': return '🔴';
      default: return '⚪';
    }
  };

  const getStepIcon = (status: ApiCallStep['status']) => {
    switch (status) {
      case 'completed': return '✅';
      case 'processing': return '🔄';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  // Listener para ativar debug mode
  useEffect(() => {
    const handleActivateDebug = () => {
      setIsDebugActive(true);
      setIsVisible(true);
    };

    window.addEventListener('activateDebugMode', handleActivateDebug);
    
    return () => {
      window.removeEventListener('activateDebugMode', handleActivateDebug);
    };
  }, []);

  if (process.env.NODE_ENV !== 'development' || !isDebugActive) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999] max-w-md">
      {/* Indicador de Status da API */}
      <div className="mb-2 flex items-center gap-2">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className={`px-3 py-2 rounded-lg shadow-lg transition-colors duration-200 font-mono text-xs ${
            apiHealth === 'healthy' ? 'bg-green-600 hover:bg-green-700' :
            apiHealth === 'error' ? 'bg-red-600 hover:bg-red-700' :
            'bg-yellow-600 hover:bg-yellow-700'
          } text-white`}
        >
          {getHealthIcon(apiHealth)} Gemini API Monitor {isVisible ? '▼' : '▶'}
        </button>
        
        {liveCall && liveCall.isActive && (
          <div className="px-2 py-1 bg-blue-600 rounded text-xs text-white font-mono animate-pulse">
            🔄 Chamada Ativa
          </div>
        )}
      </div>

      {/* Painel de Monitoramento */}
      {isVisible && (
        <div className="bg-black/95 border border-green-500/30 rounded-lg p-4 text-xs font-mono text-white shadow-2xl backdrop-blur-sm max-h-[70vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-green-500/30">
            <h3 className="text-green-300 font-bold">🧠 Monitor API Gemini</h3>
            <span className={getHealthColor(apiHealth)}>
              {getHealthIcon(apiHealth)} {apiHealth.toUpperCase()}
            </span>
          </div>

          {/* Chamada Ativa */}
          {liveCall ? (
            <div className="mb-4">
              <h4 className="text-yellow-300 font-semibold mb-2">
                📡 Chamada em Tempo Real
              </h4>
              <div className="bg-yellow-900/20 border border-yellow-500/30 p-3 rounded">
                <div className="mb-2">
                  <div className="text-yellow-200 font-semibold">
                    Fase Atual: {liveCall.currentPhase}
                  </div>
                  <div className="text-gray-300 text-xs">
                    Tempo decorrido: {Math.floor((Date.now() - liveCall.startTime) / 1000)}s
                  </div>
                </div>
                
                <div className="space-y-2">
                  {liveCall.steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-lg">{getStepIcon(step.status)}</span>
                      <div className="flex-1">
                        <div className={`text-sm ${
                          step.status === 'completed' ? 'text-green-300' :
                          step.status === 'processing' ? 'text-yellow-300' :
                          step.status === 'error' ? 'text-red-300' :
                          'text-gray-400'
                        }`}>
                          {step.step}
                        </div>
                        {step.timestamp && (
                          <div className="text-xs text-gray-400">{step.timestamp}</div>
                        )}
                        {step.details && (
                          <div className="text-xs text-gray-300 mt-1">{step.details}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <h4 className="text-gray-400 font-semibold mb-2">📡 Aguardando Chamada</h4>
              <div className="text-gray-500 text-center py-4">
                Nenhuma chamada ativa no momento
              </div>
            </div>
          )}

          {/* Teste Rápido */}
          <div className="mb-4">
            <h4 className="text-blue-300 font-semibold mb-2">🧪 Teste Rápido</h4>
            <button
              onClick={async () => {
                try {
                  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY || ''}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      contents: [{ parts: [{ text: 'Responda apenas: "Monitor funcionando!"' }] }],
                      generationConfig: { temperature: 0.1, maxOutputTokens: 20 }
                    })
                  });
                  
                  if (response.ok) {
                    const data = await response.json();
                    alert(`✅ Teste OK: ${data.candidates?.[0]?.content?.parts?.[0]?.text}`);
                  } else {
                    alert(`❌ Teste falhou: HTTP ${response.status}`);
                  }
                } catch (error) {
                  alert(`❌ Erro: ${error}`);
                }
              }}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors duration-200 w-full"
            >
              🚀 Testar Conexão
            </button>
          </div>

          {/* Informações da API */}
          <div className="pt-2 border-t border-green-500/30">
            <div className="text-xs text-gray-400">
              <div>Endpoint: generativelanguage.googleapis.com</div>
              <div>Modelo: gemini-2.5-flash</div>
              <div>Monitoramento: Ativo</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
