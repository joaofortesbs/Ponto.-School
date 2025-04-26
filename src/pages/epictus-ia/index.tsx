
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import EpictusIAInterface from "@/components/epictus-ia/EpictusIAComplete";
import EpictusBetaMode from "@/components/epictus-ia/EpictusBetaMode";
import ErrorBoundary from "@/components/ErrorBoundary";

// Componente de fallback para carregamento
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full w-full bg-[#001427]/80">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white text-lg">Carregando Epictus IA...</p>
    </div>
  </div>
);

// Componente de fallback para erro específico deste módulo
const ErrorFallback = () => (
  <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-b from-[#001427] to-[#002a55] p-6">
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 max-w-md text-center">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="48" 
        height="48" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-red-400 mx-auto mb-4"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <h2 className="text-xl font-bold text-white mb-2">Não foi possível carregar o Epictus IA</h2>
      <p className="text-gray-300 mb-6">Ocorreu um erro ao carregar esta interface. Nossa equipe foi notificada.</p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  </div>
);

export default function EpictusIAPage() {
  console.log("Renderizando EpictusIAPage");
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    try {
      console.log("Inicializando página do Epictus IA");
      // Get the mode from URL parameters
      const urlMode = searchParams.get("mode");
      console.log("Modo detectado na URL:", urlMode);
      setMode(urlMode);
      
      // Listen for the custom event that might be triggered by other components
      const handleModeChange = (event: CustomEvent) => {
        console.log("Evento de mudança de modo detectado:", event.detail.mode);
        setMode(event.detail.mode);
      };
      
      window.addEventListener("activateBetaMode", handleModeChange as EventListener);
      
      // Simulando carregamento
      const loadingTimeout = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      
      return () => {
        window.removeEventListener("activateBetaMode", handleModeChange as EventListener);
        clearTimeout(loadingTimeout);
        console.log("Limpeza da página do Epictus IA");
      };
    } catch (error) {
      console.error("Erro ao inicializar página Epictus IA:", error);
      setIsLoading(false);
    }
  }, [searchParams]);
  
  if (isLoading) {
    return <LoadingFallback />;
  }
  
  // Render the appropriate interface based on the mode
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <div className="w-full h-full">
        <Suspense fallback={<LoadingFallback />}>
          {mode === "beta" ? (
            <ErrorBoundary>
              <EpictusBetaMode />
            </ErrorBoundary>
          ) : (
            <ErrorBoundary>
              <EpictusIAInterface />
            </ErrorBoundary>
          )}
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
