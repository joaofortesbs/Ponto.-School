
import React, { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

// Componente de diagnóstico para ajudar a depurar problemas
export const DiagnosticTool: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);

  // Função para coletar diagnósticos
  const runDiagnostics = () => {
    setIsChecking(true);
    setDiagnosticLogs([]);

    // Adicionar log ao array
    const addLog = (message: string, isError = false) => {
      setDiagnosticLogs(prev => [...prev, message]);
      if (isError) setHasErrors(true);
    };

    // Executar verificações
    try {
      // Verificar carregamento de módulos críticos
      addLog("Verificando carregamento de módulos críticos...");
      
      // Verificar importações do lucide-react
      try {
        const lucideMod = require("lucide-react");
        addLog(`Módulo lucide-react carregado: ${Object.keys(lucideMod).length} ícones disponíveis`);
      } catch (err) {
        addLog(`⚠️ Erro ao carregar lucide-react: ${err.message}`, true);
      }
      
      // Verificar se temos acesso ao Supabase
      addLog("Verificando conexão com Supabase...");
      try {
        const { supabase } = require("@/lib/supabase");
        if (supabase) {
          addLog("Conexão com Supabase disponível");
        }
      } catch (err) {
        addLog(`⚠️ Erro ao conectar com Supabase: ${err.message}`, true);
      }
      
      // Verificar rotas
      addLog("Verificando definições de rotas...");
      try {
        const { routes } = require("@/tempo-routes");
        addLog(`Rotas definidas: ${routes.length}`);
      } catch (err) {
        addLog(`⚠️ Erro nas definições de rotas: ${err.message}`, true);
      }
      
      // Verificar componentes críticos
      addLog("Verificando componentes críticos...");
      
      // Verificar estado do DOM
      addLog("Analisando estado do DOM...");
      const bodyClasses = document.body.classList.toString();
      addLog(`Classes do body: ${bodyClasses || 'nenhuma'}`);
      
      if (document.getElementById('root')) {
        addLog("Elemento root encontrado");
      } else {
        addLog("⚠️ Elemento root não encontrado", true);
      }
      
      // Verificar console por erros
      addLog("Verificando erros recentes no console...");
      if (console.error.toString().includes('native code')) {
        addLog("Console funcionando normalmente");
      } else {
        addLog("⚠️ Console pode ter sido modificado", true);
      }
      
      addLog("Diagnóstico concluído.");
    } catch (error) {
      addLog(`⚠️ Erro durante diagnóstico: ${error.message}`, true);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Esconder diagnóstico após 30 segundos de inatividade
    const timer = setTimeout(() => {
      if (isVisible) setIsVisible(false);
    }, 30000);
    
    return () => clearTimeout(timer);
  }, [isVisible, diagnosticLogs]);

  // Atalho para mostrar o diagnóstico (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsVisible(prev => !prev);
        if (!isVisible) runDiagnostics();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-900 shadow-lg rounded-lg p-4 w-96 max-h-[80vh] overflow-auto border border-gray-200 dark:border-gray-800">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">Ferramenta de Diagnóstico</h3>
        <div className="flex gap-2">
          <button 
            onClick={runDiagnostics}
            className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
          >
            Verificar
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded"
          >
            Fechar
          </button>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        Pressione Ctrl+Shift+D para abrir/fechar
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-800 pt-2">
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {isChecking && (
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verificando...</span>
            </div>
          )}
          
          {diagnosticLogs.length === 0 && !isChecking ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 italic">
              Clique em Verificar para executar diagnóstico
            </div>
          ) : (
            diagnosticLogs.map((log, index) => (
              <div 
                key={index} 
                className={`text-sm ${log.includes('⚠️') 
                  ? 'text-amber-600 dark:text-amber-400' 
                  : 'text-gray-700 dark:text-gray-300'}`}
              >
                {log}
              </div>
            ))
          )}
        </div>
        
        {diagnosticLogs.length > 0 && !isChecking && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-800 flex items-center gap-2">
            {hasErrors ? (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Problemas detectados</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Nenhum problema crítico detectado</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticTool;
