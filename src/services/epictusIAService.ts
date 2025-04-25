import { v4 as uuidv4 } from 'uuid';

// Interface de mensagem para o chat
export interface ChatMessage {
  id?: string;
  sender: 'user' | 'ai' | 'system';
  content: string;
  timestamp?: Date;
}

// Histórico de conversas por sessão
const conversationHistory: Record<string, ChatMessage[]> = {};

// Função para criar uma nova mensagem
export const createMessage = (content: string, sender: 'user' | 'ai' | 'system'): ChatMessage => {
  return {
    id: uuidv4(),
    sender,
    content,
    timestamp: new Date()
  };
};

// Função para adicionar mensagem ao histórico
export const addMessageToHistory = (sessionId: string, message: ChatMessage): void => {
  if (!conversationHistory[sessionId]) {
    conversationHistory[sessionId] = [];
  }

  conversationHistory[sessionId].push(message);

  // Salvar no localStorage
  try {
    localStorage.setItem(`epictus_ia_history_${sessionId}`, JSON.stringify(conversationHistory[sessionId]));
  } catch (error) {
    console.error("Erro ao salvar histórico de conversa:", error);
  }
};

// Função para obter histórico de conversas
export const getChatHistory = (sessionId: string): ChatMessage[] => {
  if (conversationHistory[sessionId]) {
    return conversationHistory[sessionId];
  }

  // Tentar recuperar do localStorage
  try {
    const savedHistory = localStorage.getItem(`epictus_ia_history_${sessionId}`);
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory) as ChatMessage[];
      conversationHistory[sessionId] = parsedHistory;
      return parsedHistory;
    }
  } catch (error) {
    console.error("Erro ao recuperar histórico do localStorage:", error);
  }

  return [];
};

// Função para limpar histórico da conversa
export const clearChatHistory = (sessionId: string): void => {
  conversationHistory[sessionId] = [];
  try {
    localStorage.removeItem(`epictus_ia_history_${sessionId}`);
  } catch (error) {
    console.error("Erro ao limpar histórico do localStorage:", error);
  }
};

// Função para gerar resposta da IA
export const generateAIResponse = async (message: string, sessionId?: string): Promise<string> => {
  try {
    // Aqui poderia ser integrada a chamada para uma API externa de IA
    // Por enquanto vamos usar uma lista de respostas pré-definidas

    const responses = [
      "Entendi! Como posso te ajudar mais com isso?",
      "Interessante perspectiva. Vamos explorar mais esse conceito?",
      "Ótima pergunta! Vou explicar de forma detalhada.",
      "Isso é um excelente ponto. Deixe-me expandir um pouco mais...",
      "Baseado no que você disse, acho que podemos abordar isso de várias maneiras.",
      "Compreendo sua dúvida. Vamos dividir esse problema em partes menores.",
      "Vamos analisar isso passo a passo para garantir uma compreensão completa.",
      "Essa é uma questão complexa. Vou fornecer uma explicação abrangente.",
      "Obrigado por compartilhar isso. Aqui está o que penso sobre o assunto...",
      "Sua abordagem é interessante! Posso sugerir algumas alternativas também?"
    ];

    // Adicionar contexto específico baseado em palavras-chave
    if (message.toLowerCase().includes("vibe code")) {
      return "Vibe Code é uma poderosa linguagem de programação orientada a objetos que combina a sintaxe intuitiva do Python com a tipagem forte do TypeScript. Ela é especialmente projetada para aplicações de IA e desenvolvimento web moderno. Quer aprender os conceitos básicos ou tem alguma dúvida específica sobre como implementar algo em Vibe Code?";
    }

    if (message.toLowerCase().includes("programar") || message.toLowerCase().includes("programação")) {
      return "A programação é uma habilidade essencial no mundo digital de hoje! Para começar, recomendo entender os conceitos fundamentais como variáveis, loops, condicionais e funções. Que linguagem de programação você está interessado em aprender? Posso te dar uma introdução personalizada.";
    }

    if (message.toLowerCase().includes("matemática") || message.toLowerCase().includes("cálculo")) {
      return "A matemática é fascinante! Desde conceitos básicos até tópicos avançados como cálculo, álgebra linear ou estatística, há muito a explorar. Em que área específica você gostaria de focar? Posso ajudar com explicações, exemplos ou exercícios práticos.";
    }

    if (message.toLowerCase().includes("fluxograma")) {
      return "Fluxogramas são representações visuais poderosas de processos ou algoritmos. Eles usam símbolos como retângulos (processos), losangos (decisões) e setas (fluxo) para ilustrar sequências lógicas. Você gostaria de aprender como criar um fluxograma eficaz ou precisa de ajuda com um fluxograma específico?";
    }

    // Resposta aleatória se não houver contexto específico
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];

  } catch (error) {
    console.error("Erro ao gerar resposta da IA:", error);
    return "Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.";
  }
};