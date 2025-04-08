
import React, { useEffect, useState } from "react";
import ChatIAInterface from "@/components/chat-ia/ChatIAInterface";

export default function ChatIAPage() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');

  // Pré-carregar e verificar a API do Gemini
  useEffect(() => {
    const checkGeminiAPI = async () => {
      try {
        console.log("Verificando conexão com a API do Gemini...");
        
        // Verificar se a API do Gemini está acessível
        const API_KEY = "AIzaSyBSRpPQPyK6H96Z745ICsFtKzsTFdKpxWU";
        
        // Usar AbortController para limitar o tempo de espera
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          signal: controller.signal,
          cache: 'no-store' // Desativar cache para ter resposta atual
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log("API do Gemini verificada com sucesso");
          setApiStatus('available');
          
          // Fazer um pequeno teste com uma chamada real
          await testGeminiAPI(API_KEY);
        } else {
          console.warn("API do Gemini respondeu com status:", response.status);
          setApiStatus('unavailable');
        }
      } catch (error) {
        console.warn("Falha ao verificar API do Gemini:", error);
        setApiStatus('unavailable');
      }
    };
    
    // Teste adicional com uma chamada real
    const testGeminiAPI = async (apiKey: string) => {
      try {
        const testMessage = "test connection";
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: testMessage }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 50 }
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          console.log("Teste de API bem-sucedido:", data ? "Resposta recebida" : "Sem dados");
        } else {
          console.warn("Teste de API falhou com status:", response.status);
        }
      } catch (error) {
        console.warn("Erro no teste de chamada à API:", error);
      }
    };
    
    // Iniciar verificação
    checkGeminiAPI();
    
    // Definir um timeout para garantir que a interface seja carregada mesmo se a API falhar
    const timeout = setTimeout(() => {
      if (apiStatus === 'checking') {
        console.log("Timeout atingido na verificação da API");
        setApiStatus('unavailable');
      }
    }, 15000); // 15 segundos para timeout total
    
    // Limpar timeout
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        {apiStatus === 'checking' ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="flex space-x-2 justify-center items-center mb-4">
                <div className="h-4 w-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-4 w-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-4 w-4 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
              <p className="text-muted-foreground">Conectando à API do Gemini...</p>
            </div>
          </div>
        ) : (
          <ChatIAInterface />
        )}
      </div>
    </div>
  );
}
