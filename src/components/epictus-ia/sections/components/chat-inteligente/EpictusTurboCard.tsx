import React, { useState } from "react";
import { Zap } from "lucide-react";
import { ChatCard } from "./ChatCard";
import { useNavigate } from "react-router-dom";

export const EpictusTurboCard: React.FC = () => {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);

  const handleActivateTurbo = () => {
    console.log("Ativando modo Turbo...");
    // Mostrar feedback visual ao usuário
    const feedbackEl = document.createElement('div');
    feedbackEl.className = 'fixed inset-0 flex items-center justify-center bg-black/50 z-50';
    feedbackEl.innerHTML = `
      <div class="bg-white dark:bg-gray-900 rounded-lg p-6 flex flex-col items-center">
        <div class="w-16 h-16 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white animate-pulse"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
        </div>
        <p class="text-xl font-bold mb-2">Ativando Modo Turbo</p>
        <div class="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
          <div class="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] animate-[progress_1s_ease-in-out]"></div>
        </div>
      </div>
    `;
    document.body.appendChild(feedbackEl);

    // Armazenar no localStorage que o Turbo foi ativado
    localStorage.setItem("epictus_turbo_active", "true");

    // Mostrar animação de feedback antes de recarregar
    setTimeout(() => {
      // Recarregar a página atual para aplicar a interface Turbo
      window.location.reload();
    }, 800);
  };

  const assistantData = {
    id: "epictus-turbo",
    title: "Epictus Turbo",
    description: "O único Agente de IA que você precisa para ter o boletim e desempenho dos sonhos, com apenas um comando, a revolução da educação começa aqui!",
    icon: <Zap className="h-6 w-6 text-white" />,
    badge: "Único",
    buttonText: "Usar Turbo",
    highlight: true,
    onClick: handleActivateTurbo
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 rounded-xl pointer-events-none"></div>
      <ChatCard assistant={assistantData} />
    </div>
  );
};