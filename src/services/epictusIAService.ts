import { v4 as uuidv4 } from 'uuid';

// Interface para mensagens no chat
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// Armazenamento para histórico de conversas
let chatHistory: ChatMessage[] = [];

// Função para gerar resposta da IA - Versão simplificada (mantida para compatibilidade)
export const generateAIResponse = async (
  userInput: string,
  apiKey?: string
): Promise<string> => {
  // Respostas pré-definidas para não depender de API externa
  const responses = [
    "Estou processando sua pergunta... Poderia fornecer mais detalhes?",
    "Essa é uma pergunta interessante. Deixe-me analisar melhor.",
    "Considerando sua questão, existem várias abordagens possíveis.",
    "Hmm, isso é complexo. Vamos explorar algumas possibilidades.",
    "De acordo com meus dados, a resposta para sua pergunta é multifacetada.",
    "Excelente pergunta! Vou elaborar uma resposta bem estruturada para você.",
    "Estou processando sua solicitação. Aguarde um momento, por favor.",
    "Com base no contexto fornecido, posso sugerir algumas direções...",
    "Analisando sua pergunta do ponto de vista acadêmico...",
    "Vamos abordar isso por partes para uma compreensão mais clara."
  ];

  // Simula um tempo de processamento
  return new Promise(resolve => {
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * responses.length);
      resolve(responses[randomIndex]);
    }, 500);
  });
};

// Função para interagir com a API do Gemini
export const getResponse = async (message: string): Promise<string> => {
  try {
    // Chave da API fixa para garantir o funcionamento
    const apiKey = "AIzaSyDaMGN00DG-3KHgV9b7Fm_SHGvfruuMdgM";
    
    // Salvar no localStorage para uso futuro
    localStorage.setItem('GEMINI_API_KEY', apiKey);
    
    if (!apiKey) {
      console.warn("API Key do Gemini não encontrada. Usando resposta simulada.");
      return generateAIResponse(message);
    }
    
    // URL da API Gemini
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    
    // Preparar corpo da requisição
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: message
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };
    
    // Fazer a requisição
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extrair texto da resposta
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Formato de resposta inesperado da API Gemini");
    }
  } catch (error) {
    console.error("Erro ao chamar a API Gemini:", error);
    
    // Tentar novamente com resposta simulada em caso de erro
    try {
      console.log("Tentando gerar resposta alternativa...");
      return `Resposta simulada para: "${message}"\n\nNão foi possível conectar à API do Gemini neste momento, mas continuamos trabalhando para melhorar sua experiência. Esta é uma resposta gerada localmente para sua pergunta.`;
    } catch (fallbackError) {
      console.error("Erro ao gerar resposta de fallback:", fallbackError);
      return "Estamos enfrentando dificuldades técnicas temporárias. Por favor, tente novamente em alguns instantes.";
    }
  }
};

// Adicionar uma mensagem ao histórico
export const addMessageToHistory = (message: ChatMessage): void => {
  chatHistory = [...chatHistory, message];
};

// Criar uma nova mensagem
export const createMessage = (content: string, sender: 'user' | 'ai'): ChatMessage => {
  return {
    id: uuidv4(),
    content,
    sender,
    timestamp: new Date()
  };
};

// Obter o histórico de mensagens
export const getChatHistory = (): ChatMessage[] => {
  return [...chatHistory];
};

// Limpar o histórico de mensagens
export const clearChatHistory = (): void => {
  chatHistory = [];
};