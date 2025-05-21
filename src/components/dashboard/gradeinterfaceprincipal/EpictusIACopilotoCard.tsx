
import React, { useState } from "react";
import { Brain, Lightbulb, Send, ArrowRight, BarChart2 } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function EpictusIACopilotoCard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  const [pergunta, setPergunta] = useState("");

  // Tratar envio de pergunta rápida para a IA
  const handleEnviarPergunta = (e) => {
    e.preventDefault();
    if (pergunta.trim()) {
      console.log("Pergunta enviada para IA:", pergunta);
      // Aqui seria implementada a lógica para enviar a pergunta para a IA
      // e abrir o modal ou chat flutuante com a resposta
      // window.location.href = "/epictus-ia?pergunta=" + encodeURIComponent(pergunta);
      setPergunta("");
    }
  };

  return (
    <div className={`rounded-xl overflow-hidden shadow-lg h-full ${isLightMode ? 'bg-gradient-to-br from-[#0A2540] via-[#1A365D] to-[#0F2E51]' : 'bg-gradient-to-br from-[#0A1F35] via-[#0D2B4D] to-[#061325]'}`}>
      <div className="p-5 flex flex-col h-full">
        <div className="flex items-center mb-4">
          <div className={`p-2 rounded-lg ${isLightMode ? 'bg-[#FF6B00]/20' : 'bg-[#FF6B00]/10'} mr-3`}>
            <Brain className="h-5 w-5 text-[#FF6B00]" />
          </div>
          <div>
            <h3 className="font-bold text-white">
              Epictus IA: Seu Copiloto Inteligente
            </h3>
            <p className="text-xs text-gray-300">
              Assistente personalizado para seus estudos
            </p>
          </div>
        </div>

        {/* Dica do Dia / Insight Rápido */}
        <div className={`mb-4 p-3 rounded-lg ${isLightMode ? 'bg-white/10' : 'bg-[#0A2540]/40'}`}>
          <div className="flex items-start">
            <Lightbulb className="h-4 w-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-white font-medium mb-1">Dica Epictus:</p>
              <p className="text-xs text-gray-300">
                Revisar o conteúdo de Matemática hoje aumentará sua retenção para a prova da próxima semana.
              </p>
            </div>
          </div>
        </div>

        {/* Ação Inteligente Sugerida */}
        <div className={`mb-4 p-3 rounded-lg ${isLightMode ? 'bg-white/10' : 'bg-[#0A2540]/40'}`}>
          <div className="flex items-start">
            <BarChart2 className="h-4 w-4 text-[#FF6B00] mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-white font-medium mb-1">Ação sugerida:</p>
              <p className="text-xs text-gray-300 mb-2">
                Sua prova de Física é semana que vem. Que tal gerar um simulado personalizado?
              </p>
              <button className="text-xs bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white py-1.5 px-3 rounded-md transition-colors">
                Gerar Simulado
              </button>
            </div>
          </div>
        </div>

        {/* Conversa Rápida */}
        <div className="mt-auto">
          <form onSubmit={handleEnviarPergunta} className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Pergunte algo ao Epictus..."
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              className={`flex-1 py-2 px-3 rounded-md text-sm ${isLightMode ? 'bg-white/15 text-white placeholder-gray-400' : 'bg-[#0A2540]/60 text-white placeholder-gray-500'} focus:outline-none focus:ring-1 focus:ring-[#FF6B00]/50`}
            />
            <button 
              type="submit"
              className="p-2 rounded-md bg-[#FF6B00]/90 hover:bg-[#FF6B00] text-white transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          
          <button className="flex items-center justify-center text-sm text-[#FF6B00] hover:text-[#FF6B00]/80 mt-3 w-full transition-colors">
            <span>Explorar Todas as Ferramentas</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
