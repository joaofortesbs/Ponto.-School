import React, { useEffect, useState } from "react";
import { TurboHeader } from "./turbo-header";
import TurboHubConnected from "./TurboHubConnected";
import TurboMessageBox from "./TurboMessageBox";
import { ErrorBoundary } from "react-error-boundary";

// Componente de fallback para tratamento de erros
const FallbackComponent = ({ error, resetErrorBoundary }) => {
  console.error("Erro no EpictusBetaMode:", error);
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-200">
      <h3 className="text-2xl font-medium mb-2">Erro ao carregar a interface</h3>
      <p className="text-base mb-6 max-w-lg text-center">
        Ocorreu um erro ao carregar o Modo Epictus IA BETA. Isso pode acontecer devido a um problema temporário.
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-6 py-3 bg-red-100 dark:bg-red-800/30 rounded-md hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  );
};

// Componentes individuais com tratamento de erro próprio
const SafeTurboHeader = () => {
  console.log("Renderizando SafeTurboHeader");
  try {
    return <TurboHeader />;
  } catch (error) {
    console.error("Erro ao renderizar TurboHeader:", error);
    return (
      <div className="w-full bg-yellow-50 dark:bg-yellow-900/10 p-3 text-center text-yellow-800 dark:text-yellow-200">
        Não foi possível carregar o cabeçalho. Algumas funcionalidades podem estar indisponíveis.
      </div>
    );
  }
};

const SafeTurboHubConnected = () => {
  console.log("Renderizando SafeTurboHubConnected");
  try {
    return <TurboHubConnected />;
  } catch (error) {
    console.error("Erro ao renderizar TurboHubConnected:", error);
    return (
      <div className="w-full p-6 text-center text-gray-500 dark:text-gray-400">
        Hub de conexões temporariamente indisponível.
      </div>
    );
  }
};

const SafeTurboMessageBox = () => {
  console.log("Renderizando SafeTurboMessageBox");
  try {
    return <TurboMessageBox />;
  } catch (error) {
    console.error("Erro ao renderizar TurboMessageBox:", error);
    return (
      <div className="w-full p-6 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Não foi possível carregar a caixa de mensagens. Tente recarregar a página.
        </p>
      </div>
    );
  }
};

// Componente principal
const EpictusBetaMode = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    console.log("EpictusBetaMode montado");

    // Simular carregamento para garantir que os componentes estejam prontos
    const timer = setTimeout(() => {
      setIsLoaded(true);
      console.log("EpictusBetaMode pronto");
    }, 100);

    return () => {
      clearTimeout(timer);
      console.log("EpictusBetaMode desmontado");
    };
  }, []);

  if (!isLoaded) {
    console.log("EpictusBetaMode: Aguardando carregamento");
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-pulse text-center">
          <p className="text-gray-500 dark:text-gray-400">Carregando interface...</p>
        </div>
      </div>
    );
  }

  try {
    console.log("Renderizando EpictusBetaMode completo");

    return (
      <ErrorBoundary FallbackComponent={FallbackComponent}>
        <div className="w-full h-full flex flex-col bg-background dark:bg-[#001427] text-foreground">
          {/* Cabeçalho */}
          <ErrorBoundary FallbackComponent={({ error }) => {
            console.error("Erro isolado no cabeçalho:", error);
            return <div className="h-14 bg-red-50 dark:bg-red-900/10 flex items-center justify-center">Erro no cabeçalho</div>;
          }}>
            <SafeTurboHeader />
          </ErrorBoundary>

          {/* Área de conteúdo abaixo do cabeçalho */}
          <div className="w-full flex flex-col items-center justify-center mt-0 mb-2 flex-grow">
            {/* Hub Conectado */}
            <div className="w-full">
              <ErrorBoundary FallbackComponent={({ error }) => {
                console.error("Erro isolado no hub conectado:", error);
                return null;
              }}>
                <SafeTurboHubConnected />
              </ErrorBoundary>
            </div>

            {/* Área central flexível */}
            <div className="w-full flex-grow flex items-center justify-center">
              {/* Conteúdo principal - vazio por enquanto */}
            </div>

            {/* Caixa de mensagens na parte inferior */}
            <div className="w-full bottom-0 left-0 right-0 z-30 mt-1">
              <ErrorBoundary FallbackComponent={({ error }) => {
                console.error("Erro isolado na caixa de mensagens:", error);
                return (
                  <div className="mx-auto max-w-4xl p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
                    <p className="text-center text-red-800 dark:text-red-200">
                      Não foi possível carregar a caixa de mensagens.
                    </p>
                  </div>
                );
              }}>
                <SafeTurboMessageBox />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error("Erro fatal ao renderizar EpictusBetaMode:", error);
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50 dark:bg-red-900/10 p-10">
        <div className="max-w-md">
          <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-4">
            Erro inesperado
          </h2>
          <p className="text-red-700 dark:text-red-300 mb-6">
            Ocorreu um erro ao carregar a interface do Epictus IA BETA. 
            Por favor, atualize a página ou tente novamente mais tarde.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-100 dark:bg-red-800/30 text-red-800 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
          >
            Recarregar página
          </button>
        </div>
      </div>
    );
  }
};

export default EpictusBetaMode;