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

    // Mensagem do usuário
    const userMessage = createMessage(message, 'user');
    addMessageToHistory(sessionId, userMessage);

    // Obtém o histórico de mensagens para fornecer contexto
    const historyMessages = getChatHistory(sessionId).slice(-10);
    
    // Criando um histórico de conversa mais context-aware para melhorar as respostas da IA
    const systemPrompt = {
      role: 'system',
      parts: [{ 
        text: `Você é o Epictus IA, um assistente educacional avançado da plataforma Ponto.School. 
        Seu objetivo é ajudar os estudantes com explicações claras, detalhadas e educacionalmente relevantes.
        
        Ao responder às perguntas:
        - Seja educativo, conciso e preciso
        - Use uma linguagem adaptada ao nível educacional do usuário
        - Forneça exemplos práticos quando apropriado
        - Organize suas respostas com formatação clara (títulos, listas, etc.)
        - Mantenha um tom amigável e encorajador

        Se o usuário fizer uma pergunta sobre conteúdo educacional, forneça uma resposta completa e bem estruturada.
        Se for solicitado para ajudar com estudos ou exercícios, ofereça orientação sem fornecer respostas diretas.
        
        Lembre-se que você é parte da plataforma Ponto.School, que tem como objetivo conectar os estudantes com o futuro através da educação.`
      }]
    };

    // Convertendo o histórico para o formato correto do Gemini
    const conversationHistory = historyMessages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Definindo os parâmetros da solicitação com o system prompt
    const requestBody = {
      contents: [
        systemPrompt,
        ...conversationHistory,
        {
          role: 'user',
          parts: [{ text: message }]
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
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    console.log('Enviando requisição para Gemini API...');
    
    // Realizar a chamada à API Gemini
    const response = await fetch(`${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.error(`Erro na API Gemini: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error('Detalhes do erro:', errorBody);
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Resposta recebida da Gemini API:', data);
    
    // Extrair a resposta da IA do resultado
    const aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                        useFallbackResponse(message);

    // Formatando a resposta para melhorar a legibilidade
    const formattedResponse = aiResponseText
      .replace(/\*\*(.*?)\*\*/g, '**$1**') // Garantir negrito
      .replace(/\n\n/g, '\n\n') // Manter espaçamento de parágrafos
      .trim();

    // Mensagem da IA
    const aiMessage = createMessage(formattedResponse, 'ai');
    addMessageToHistory(sessionId, aiMessage);

    // Adiciona a resposta da IA à conversa no Supabase
    await addMessageToConversation(activeConversationId, formattedResponse, 'ai');

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
      response: formattedResponse,
      conversationId: activeConversationId
    };
  } catch (error) {
    console.error('Erro ao gerar resposta:', error);
    return {
      response: useFallbackResponse(message),
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