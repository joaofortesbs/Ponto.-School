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

// Chave da API Gemini
const GEMINI_API_KEY = 'AIzaSyD-Sso0SdyYKoA4M3tQhcWjQ1AoddB7Wo4';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Função para gerar resposta da IA usando a API Gemini
export const generateAIResponse = async (message: string, sessionId: string, options?: any, conversationId?: string): Promise<{response: string, conversationId: string}> => {
  try {
    // Obtém o userId do localStorage ou de algum outro armazenamento
    const userId = localStorage.getItem('user_id') || 'anonymous';
    let activeConversationId = conversationId;

    // Se não tiver conversationId, cria uma nova conversa
    if (!activeConversationId) {
      const tempTitle = message.length > 30 ? message.substring(0, 30) + '...' : message;
      activeConversationId = await createOrGetConversation(userId, tempTitle);
    }

    if (!activeConversationId) {
      throw new Error('Falha ao criar ou recuperar ID de conversa');
    }

    // Adiciona a mensagem do usuário à conversa
    await addMessageToConversation(activeConversationId, message, 'user');

    // Simular uma resposta de IA (em um cenário real seria uma chamada à API)
    // Adicionar um pequeno delay para simular processamento
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Mensagem do usuário
    const userMessage = createMessage(message, 'user');
    addMessageToHistory(sessionId, userMessage);

    // Um conjunto de respostas pré-definidas para simular a IA
    const responses = [
      `Compreendi sua questão sobre "${message.substring(0, 30)}...". Aqui está uma explicação detalhada...`,
      `Esta é uma excelente pergunta! Com relação a "${message.substring(0, 25)}...", posso explicar que...`,
      `Vamos analisar sua solicitação sobre "${message.substring(0, 20)}...". Do ponto de vista educacional...`,
      `Considerando sua questão sobre "${message.substring(0, 28)}...", existem várias abordagens possíveis...`,
      `Entendi sua dúvida relacionada a "${message.substring(0, 22)}...". Na perspectiva pedagógica...`
    ];

    // Escolhe uma resposta aleatória
    const baseResponse = responses[Math.floor(Math.random() * responses.length)];

    // Adiciona um conteúdo mais elaborado
    const elaboration = `\n\nPara aprofundar este tópico, considere os seguintes pontos:\n\n1. A importância do contexto e aplicação prática\n2. As diferentes abordagens metodológicas\n3. Como integrar este conhecimento com outras áreas\n\nEspero que esta explicação ajude! Se tiver mais dúvidas, estou à disposição.`;

    const fullResponse = baseResponse + elaboration;

    // Mensagem da IA
    const aiMessage = createMessage(fullResponse, 'ai');
    addMessageToHistory(sessionId, aiMessage);

    // Adiciona a resposta da IA à conversa no Supabase
    await addMessageToConversation(activeConversationId, fullResponse, 'ai');

    // Se esta for a primeira troca de mensagens, atualizamos o título e definimos a categoria
    const messages = await getConversationMessages(activeConversationId);
    if (messages && messages.length <= 2) {
      // Gera um título mais significativo baseado na primeira troca
      const betterTitle = generateBetterTitle(message);

      // Determina a categoria baseada no conteúdo
      const category = determineCategory([userMessage, aiMessage]);

      // Gera um resumo da conversa
      const summary = `Conversa sobre ${betterTitle.toLowerCase()}`;

      // Atualiza os metadados da conversa
      await updateConversationMetadata(activeConversationId, {
        title: betterTitle,
        categoria: category,
        resumo: summary
      });
    }

    return {
      response: fullResponse,
      conversationId: activeConversationId
    };
  } catch (error) {
    console.error('Erro ao gerar resposta:', error);
    return {
      response: 'Desculpe, encontrei um problema ao processar sua solicitação. Por favor, tente novamente em instantes.',
      conversationId: conversationId || ''
    };
  }
};

// Funções auxiliares para integração com o Supabase
import { 
  createConversation, 
  addMessage as addMessageToConversation,
  getMessages as getConversationMessages,
  updateConversationTitle,
  updateConversationMetadata,
  determineCategory
} from './conversationHistoryService';

// Função para criar uma nova conversa ou recuperar uma existente
const createOrGetConversation = async (userId: string, initialTitle: string): Promise<string> => {
  try {
    const conversationId = await createConversation(userId, initialTitle);
    return conversationId || '';
  } catch (error) {
    console.error('Erro ao criar conversa:', error);
    return '';
  }
};

// Função para gerar um título melhor com base na primeira mensagem
const generateBetterTitle = (message: string): string => {
  // Limita o tamanho do título
  const maxLength = 40;

  // Remove pontuações do final e trunca se necessário
  let title = message.trim().replace(/[.!?]$/, '');

  if (title.length > maxLength) {
    // Trunca no final de uma palavra para evitar cortar palavras no meio
    const truncated = title.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    if (lastSpaceIndex > maxLength * 0.7) { // Só trunca na palavra se não perder muito do título
      title = truncated.substring(0, lastSpaceIndex);
    } else {
      title = truncated;
    }

    title += '...';
  }

  // Capitaliza a primeira letra
  return title.charAt(0).toUpperCase() + title.slice(1);
};

// Função auxiliar para inicializar conversa
function initializeConversationHistory(sessionId: string): void {
  const initialSystemMessage: ChatMessage = {
    sender: 'system',
    content: 'Bem-vindo ao Epictus IA! Como posso ajudar com seus estudos hoje?',
    timestamp: new Date()
  };

  conversationHistory[sessionId] = [initialSystemMessage];
}

// Respostas de fallback para quando a API falhar
function useFallbackResponse(message: string): string {
  const fallbackResponses = [
    "Desculpe, estou enfrentando dificuldades técnicas no momento. Por favor, tente novamente em alguns instantes.",
    "Parece que estou com problemas para processar sua solicitação. Poderia reformular sua pergunta?",
    "Estou tendo problemas para me conectar aos meus serviços de conhecimento. Tente novamente mais tarde, por favor.",
    "Ops! Encontrei um problema ao gerar sua resposta. Vamos tentar novamente?",
    "Desculpe pela inconveniência. Estou enfrentando um problema técnico temporário. Por favor, tente novamente em breve."
  ];

  // Selecionar uma resposta aleatória do fallback
  const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
  return fallbackResponses[randomIndex];
}