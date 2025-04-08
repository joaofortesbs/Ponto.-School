
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
        
        // Verificar múltiplos endpoints para aumentar chances de sucesso
        const endpoints = [
          // Endpoint v1beta (mais recente)
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
          // Endpoint v1 (mais estável)
          `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`,
          // Endpoint de listagem de modelos (mais leve)
          `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`
        ];
        
        // Verificar todos os endpoints em paralelo
        const requests = endpoints.map(endpoint => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos de timeout
          
          return fetch(endpoint, {
            method: endpoint.includes('models?') ? 'GET' : 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: endpoint.includes('models?') ? undefined : JSON.stringify({
              contents: [{ parts: [{ text: "Hello" }] }],
              generationConfig: { temperature: 0.1, maxOutputTokens: 20 }
            }),
            signal: controller.signal,
            cache: 'no-store'
          })
            .then(response => {
              clearTimeout(timeoutId);
              return { endpoint, status: response.status, ok: response.ok };
            })
            .catch(error => {
              clearTimeout(timeoutId);
              return { endpoint, status: 0, ok: false, error };
            });
        });
        
        // Esperar pelo primeiro endpoint que responder ou por todos falharem
        const results = await Promise.all(requests);
        const successResult = results.find(result => result.ok);
        
        if (successResult) {
          console.log("API do Gemini verificada com sucesso via:", successResult.endpoint);
          setApiStatus('available');
          
          // Não é necessário fazer teste adicional se já tivemos sucesso em uma chamada
          if (!successResult.endpoint.includes('models?')) {
            return; // Se foi endpoint de geração, já temos confirmação suficiente
          }
          
          // Fazer um pequeno teste com uma chamada real só se usamos o endpoint de listagem
          await testGeminiAPI(API_KEY);
        } else {
          console.warn("Todos os endpoints da API do Gemini falharam:", 
            results.map(r => `${r.endpoint.split('/').pop()}: ${r.status}`).join(', '));
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
        // Tentar primeiro v1beta, depois v1 como fallback
        const urls = [
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
          `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`
        ];
        
        for (const url of urls) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          
          try {
            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                contents: [{ parts: [{ text: testMessage }] }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 20 }
              }),
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
              const data = await response.json();
              console.log("Teste de API bem-sucedido via:", url.split('/').pop(), 
                          data ? "Resposta recebida" : "Sem dados");
              return; // Sucesso, sair do loop
            } else {
              console.warn("Teste de API falhou com status:", response.status, "para", url.split('/').pop());
            }
          } catch (innerError) {
            clearTimeout(timeoutId);
            console.warn("Erro no teste para", url.split('/').pop(), ":", innerError);
          }
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
    }, 10000); // 10 segundos para timeout total
    
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
