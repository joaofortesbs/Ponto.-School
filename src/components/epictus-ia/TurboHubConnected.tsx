import React from "react";

const TurboHubConnected: React.FC = () => {
  console.log("Renderizando TurboHubConnected");

  try {
    return (
      <div className="w-full px-4 py-3 bg-white dark:bg-[#0A2540]/50 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Hub Conectado
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Epictus Turbo pronto para responder
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erro ao renderizar TurboHubConnected:", error);
    return (
      <div className="w-full px-4 py-3 bg-white dark:bg-[#0A2540]/50 border-b border-gray-200 dark:border-gray-800">
        <div className="text-red-500 text-sm">Erro ao carregar o componente Hub</div>
      </div>
    );
  }
};

export default TurboHubConnected;