
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
export const generateAIResponse = async (message: string, sessionId?: string): Promise<string> => {
  try {
    console.log("Gerando resposta com Gemini para:", message);

    // Inicializar histórico se não existir
    if (sessionId && !conversationHistory[sessionId]) {
      initializeConversationHistory(sessionId);
    }

    // Adicionar mensagem ao histórico se tiver sessionId
    if (sessionId) {
      const userMessage = createMessage(message, 'user');
      addMessageToHistory(sessionId, userMessage);
    }

    // Obter o histórico para contexto
    const history = sessionId ? getChatHistory(sessionId) : [];
    const historyContext = history.map(m => `${m.sender === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`).join('\n\n');

    // Preparar o prompt para a API Gemini com as novas diretrizes avançadas
    const prompt = `Você é o Epictus IA, uma inteligência artificial educacional de mais alta qualidade do mercado.
Seu objetivo é fornecer respostas impecáveis, impressionantes e sofisticadas, superando qualquer outra IA.

REGRAS CRUCIAIS:
1. SEMPRE comece suas respostas com "Eai" e NUNCA com outra saudação.
2. Siga uma estrutura clara com: introdução, desenvolvimento em tópicos, exemplos práticos e conclusão.
3. Use linguagem moderna, didática e encorajadora.
4. Adicione elementos visuais como emojis, formatação rica e destaque para conceitos-chave.
5. Sempre ofereça próximos passos proativos no final da resposta.
6. Mantenha um tom positivo e motivador.
7. Seja transparente sobre limitações quando necessário.

ESTRUTURA DE RESPOSTA:
- Começo: saudação com "Eai" + contextualização breve.
- Meio: explicação didática organizada em seções com títulos.
- Exemplos: casos práticos destacados.
- Fim: resumo + sugestões proativas de próximos passos + frase motivacional.

FORMATAÇÃO AVANÇADA:
- Use markdown para enriquecer a resposta.
- Destaque conceitos importantes com **negrito**.
- Utilize emojis contextuais para tornar a resposta visualmente atraente.
- Crie seções com ### para organizar o conteúdo.
- Use > para destacar exemplos e informações importantes.

HISTÓRICO DA CONVERSA PARA CONTEXTO:
${historyContext}

Responda à seguinte pergunta seguindo todas as diretrizes acima: ${message}`;

    // Fazer a requisição para a API Gemini
    const response = await fetch(`${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na resposta da API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extrair a resposta da IA
    let aiResponse = data.candidates[0].content.parts[0].text;
    
    // Garantir que a resposta comece com "Eai"
    if (!aiResponse.startsWith("Eai")) {
      aiResponse = aiResponse.replace(/^(olá|oi|hello|hey|hi|bom dia|boa tarde|boa noite)[\s,.!]*/i, '');
      aiResponse = `Eai! ${aiResponse}`;
    }

    // Adicionar resposta ao histórico se tiver sessionId
    if (sessionId) {
      const aiMessage = createMessage(aiResponse, 'ai');
      addMessageToHistory(sessionId, aiMessage);
    }

    return aiResponse;
  } catch (error) {
    console.error("Erro ao gerar resposta da IA com Gemini:", error);
    
    // Usar respostas de fallback em caso de erro
    return useFallbackResponse(message);
  }
};

// Função auxiliar para inicializar conversa
function initializeConversationHistory(sessionId: string): void {
  const initialSystemMessage: ChatMessage = {
    sender: 'system',
    content: 'Eai! Bem-vindo ao Epictus IA! Como posso ajudar com seus estudos hoje?',
    timestamp: new Date()
  };

  conversationHistory[sessionId] = [initialSystemMessage];
}

// Respostas de fallback para quando a API falhar
function useFallbackResponse(message: string): string {
  const fallbackResponses = [
    "Eai! Desculpe, estou enfrentando dificuldades técnicas no momento. Por favor, tente novamente em alguns instantes.",
    "Eai! Parece que estou com problemas para processar sua solicitação. Poderia reformular sua pergunta?",
    "Eai! Estou tendo problemas para me conectar aos meus serviços de conhecimento. Tente novamente mais tarde, por favor.",
    "Eai! Encontrei um problema ao gerar sua resposta. Vamos tentar novamente?",
    "Eai! Desculpe pela inconveniência. Estou enfrentando um problema técnico temporário. Por favor, tente novamente em breve."
  ];

  // Selecionar uma resposta aleatória do fallback
  const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
  return fallbackResponses[randomIndex];
}
