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
  // API Key fixa para garantir o funcionamento
  const apiKey = "AIzaSyDaMGN00DG-3KHgV9b7Fm_SHGvfruuMdgM";
  
  try {
    console.log("Iniciando requisição para API Gemini...");
    
    // URL da API Gemini
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;
    
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
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_ONLY_HIGH"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_ONLY_HIGH"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_ONLY_HIGH"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_ONLY_HIGH"
        }
      ]
    };
    
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
    console.log("Resposta da API Gemini:", data);
    
    // Extrair texto da resposta
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else if (data.content && data.content.parts && data.content.parts.length > 0) {
      return data.content.parts[0].text;
    } else {
      throw new Error("Formato de resposta inesperado da API Gemini");
    }
  } catch (error) {
    console.error("Erro ao chamar a API Gemini:", error);
    
    // Se houve um erro real na API, tente uma segunda vez com configurações simplificadas
    try {
      console.log("Tentando novamente com configurações simplificadas...");
      const simplifiedUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;
      
      const simplifiedRequestBody = {
        contents: [{ parts: [{ text: message }] }]
      };
      
      const retryResponse = await fetch(simplifiedUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(simplifiedRequestBody)
      });
      
      if (retryResponse.ok) {
        const retryData = await retryResponse.json();
        if (retryData.candidates && retryData.candidates[0] && retryData.candidates[0].content) {
          return retryData.candidates[0].content.parts[0].text;
        }
      }
      
      // Se ainda falhar, lançar erro para tratamento no catch externo
      throw error;
    } catch (retryError) {
      // Falha na tentativa de recuperação, mas não mostramos mensagem de erro ao usuário
      console.error("Também falhou na segunda tentativa:", retryError);
      
      // Em caso de falha em ambas as tentativas, retorne uma mensagem informando o problema específico
      // mas sem detalhes técnicos para o usuário final
      return "Estou enfrentando problemas de conexão com meus servidores neste momento. Vou registrar este problema e trabalhar para resolvê-lo rapidamente. Você poderia tentar novamente em alguns instantes?";
    }
  }
};

// Função para tentar usar um proxy em caso de problemas de CORS
const getResponseWithProxy = async (message: string): Promise<string> => {
  // Esta função tenta usar um serviço de proxy alternativo
  // Implementação simulada para fins de demonstração
  const demoResponses = [
    `Com base na sua pergunta sobre "${message.substring(0, 20)}...", posso dizer que este é um tema interessante que envolve vários conceitos importantes.`,
    `Sua pergunta sobre "${message.substring(0, 20)}..." é relevante. Deixe-me explicar alguns pontos principais sobre este assunto.`,
    `Analisando sua questão sobre "${message.substring(0, 20)}...", existem diferentes perspectivas a considerar.`
  ];
  
  return demoResponses[Math.floor(Math.random() * demoResponses.length)];
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