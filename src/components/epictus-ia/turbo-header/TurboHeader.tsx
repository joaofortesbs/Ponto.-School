import React, { useState } from "react";
import { Bell, Clock, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import HistoricoModal from "../modals/HistoricoModal";

export const TurboHeader: React.FC = () => {
  console.log("Renderizando TurboHeader");

  // Estado para controlar a exibição do modal de histórico
  const [isHistoricoModalOpen, setIsHistoricoModalOpen] = useState(false);

  // Função para abrir o modal
  const openHistoricoModal = () => {
    console.log("Abrindo modal de histórico");
    setIsHistoricoModalOpen(true);
  };

  // Função para fechar o modal
  const closeHistoricoModal = () => {
    console.log("Fechando modal de histórico");
    setIsHistoricoModalOpen(false);
  };

  try {
    return (
      <div className="flex items-center justify-between w-full h-14 px-4 bg-white dark:bg-[#0A2540] border-b border-gray-200 dark:border-gray-800">
        {/* Logo e nome do produto */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-600">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">
            Epictus IA
          </span>
          <span className="text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-600 px-1.5 py-0.5 rounded-sm">
            BETA
          </span>
        </div>

        {/* Botões de ação */}
        <div className="flex items-center space-x-2">
          {/* Botão de Histórico */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={openHistoricoModal}
            aria-label="Histórico de conversas"
          >
            <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Button>

          {/* Botão de Notificações */}
          <Button variant="ghost" size="icon" aria-label="Notificações">
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Button>

          {/* Botão de Configurações */}
          <Button variant="ghost" size="icon" aria-label="Configurações">
            <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Button>
        </div>

        {/* Modal de Histórico */}
        <HistoricoModal 
          isOpen={isHistoricoModalOpen} 
          onClose={closeHistoricoModal} 
        />
      </div>
    );
  } catch (error) {
    console.error("Erro ao renderizar TurboHeader:", error);
    return (
      <div className="w-full h-14 bg-white dark:bg-[#0A2540] border-b border-gray-200 dark:border-gray-800 px-4 flex items-center">
        <span className="text-red-500">Erro ao carregar cabeçalho</span>
      </div>
    );
  }
};