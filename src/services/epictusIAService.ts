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

// Função para gerar resposta da IA - Versão que tenta usar Gemini, com fallback para respostas locais
export const generateAIResponse = async (
  userInput: string,
  apiKey?: string
): Promise<string> => {
  try {
    // Tentar usar a API Gemini para gerar uma resposta
    const { generateAIResponse: geminiGenerateResponse } = await import('./aiChatService');
    const sessionId = `epictus-ia-${Date.now()}`;
    
    // Chamar a API Gemini
    return await geminiGenerateResponse(userInput, sessionId, {
      intelligenceLevel: 'advanced',
      languageStyle: 'formal',
      detailedResponse: true
    });
  } catch (error) {
    console.error("Erro ao acessar API Gemini, usando fallback local:", error);
    
    // Fallback para respostas pré-definidas quando a API falha
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