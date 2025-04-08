
import React, { useEffect, useState } from "react";
import ChatIAInterface from "@/components/chat-ia/ChatIAInterface";

export default function ChatIAPage() {
  const [apiPreloaded, setApiPreloaded] = useState(false);

  // Pré-carregar a API para ter melhor desempenho
  useEffect(() => {
    const preloadGeminiAPI = async () => {
      try {
        // Verificar se a API do Gemini está acessível
        const API_KEY = "AIzaSyDaMGN00DG-3KHgV9b7Fm_SHGvfruuMdgM";
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          console.log("API do Gemini pré-carregada com sucesso");
          setApiPreloaded(true);
        } else {
          console.warn("API do Gemini respondeu com status:", response.status);
          // Continuar mesmo com erro
          setApiPreloaded(true);
        }
      } catch (error) {
        console.warn("Falha ao pré-carregar API do Gemini:", error);
        // Continuar mesmo com erro
        setApiPreloaded(true);
      }
    };
    
    // Iniciar pré-carregamento
    preloadGeminiAPI();
    
    // Definir um timeout para garantir que a interface seja carregada mesmo se a API falhar
    const timeout = setTimeout(() => {
      if (!apiPreloaded) {
        console.log("Timeout atingido, carregando interface mesmo sem pré-carregamento da API");
        setApiPreloaded(true);
      }
    }, 3000);
    
    // Limpar timeout
    return () => clearTimeout(timeout);
  }, []);

  // Renderizar a interface apenas quando a API estiver pré-carregada ou o timeout for atingido
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        {/* Sempre mostrar a interface, mesmo se o pré-carregamento falhar */}
        <ChatIAInterface />
      </div>
    </div>
  );
}
