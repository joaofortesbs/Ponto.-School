
import React, { useEffect } from "react";
import ChatIAInterface from "@/components/chat-ia/ChatIAInterface";

export default function ChatIAPage() {
  // Pré-carregar a API para ter melhor desempenho
  useEffect(() => {
    const preloadGeminiAPI = async () => {
      try {
        // Verificar se a API do Gemini está acessível
        const API_KEY = "AIzaSyDaMGN00DG-3KHgV9b7Fm_SHGvfruuMdgM";
        await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`, {
          method: 'GET'
        });
        console.log("API do Gemini pré-carregada com sucesso");
      } catch (error) {
        console.warn("Falha ao pré-carregar API do Gemini:", error);
      }
    };
    
    preloadGeminiAPI();
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <ChatIAInterface />
      </div>
    </div>
  );
}
