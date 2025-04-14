import axios from 'axios';
import { getChatHistory, saveChatMessage, getAllChatSessions, deleteChatSession } from "./aiChatDatabaseService";

// Chaves de API
const XAI_API_KEY = 'xai-PGLSB6snVtQm82k7xEmfCSo3RjkO41ICX4dUagAp5bz2GY02NTVqO6XWEXuNK5HCYWpYBYuz7WP2ENFP';
const GEMINI_API_KEY = 'AIzaSyD-Sso0SdyYKoA4M3tQhcWjQ1AoddB7Wo4';

// URLs base
const XAI_BASE_URL = 'https://api.x.ai/v1/chat/completions';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Interface para mensagens
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

// Função para obter dados do usuário atual com acesso expandido e completo
async function getUserContext() {
  try {
    // Obter dados do localStorage e sessionStorage
    const usernameSources = {
      localStorage: localStorage.getItem('username'),
      sessionStorage: sessionStorage.getItem('username'),
      profile: null,
      metadata: null,
      email: localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail')
    };

    // Importar serviços e utilitários necessários
    let profileService;
    let supabase;
    let completeUserProfile = null;
    let userClasses = [];
    let userSeries = [];
    let followersCount = 0;

    try {
      // Importar o serviço de perfil e o cliente Supabase
      profileService = (await import('@/services/profileService')).profileService;
      // Se o serviço estiver disponível, obter dados completos do perfil
      if (profileService) {
        completeUserProfile = await profileService.getCurrentProfileExpanded();
      }

      // Tentar obter o cliente Supabase
      const supabaseModule = await import('@/lib/supabase');
      supabase = supabaseModule.supabase;

      // Se tiver Supabase e não tiver perfil completo, tentar obter perfil diretamente
      if (supabase && !completeUserProfile) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            completeUserProfile = profile;
          }
        }
      }
    } catch (error) {
      console.error("Erro ao obter dados expandidos do perfil:", error);
    }

    // Construir objeto de contexto completo
    return {
      username: usernameSources.localStorage || usernameSources.sessionStorage || 'usuário',
      email: usernameSources.email || 'sem email registrado',
      profile: completeUserProfile || {},
      classes: userClasses || [],
      series: userSeries || [],
      followersCount: followersCount || 0,
      isAuthenticated: !!completeUserProfile || !!localStorage.getItem('auth_status') === true,
      preferences: localStorage.getItem('userPreferences') ? JSON.parse(localStorage.getItem('userPreferences') || '{}') : {}
    };
  } catch (error) {
    console.error("Erro ao obter contexto do usuário:", error);
    return {
      username: localStorage.getItem('username') || sessionStorage.getItem('username') || 'usuário',
      isAuthenticated: false
    };
  }
}

// Função para reordenar e filtrar contexto para o prompt do X.ai
function prepareContextForModel(context) {
  // Garantir que dados sensíveis não sejam enviados
  const safeContext = { ...context };
  delete safeContext.email;
  delete safeContext.preferences;

  // Se houver um perfil detalhado, garantir que apenas informações relevantes sejam enviadas
  if (safeContext.profile) {
    const { displayName, bio, interests, studyGoal, preferredStudyTime } = safeContext.profile;
    safeContext.profile = { displayName, bio, interests, studyGoal, preferredStudyTime };
  }

  return safeContext;
}

// Função principal para conect com o X.ai
export async function sendMessageToXAI(sessionId: string, userMessage: string): Promise<string> {
  try {
    // Recuperar histórico da conversa atual
    const historyMessages = await getChatHistory(sessionId);

    // Obter contexto do usuário para personalização
    const userContext = await getUserContext();

    // Configurar mensagem do sistema com contexto
    const systemPrompt = `Você é Epictus, o assistente virtual educacional da plataforma Ponto School. 

    Contexto do usuário: ${JSON.stringify(prepareContextForModel(userContext))}

    Sua personalidade: Amigável, prestativo, paciente e especialista em educação. Você deve se referir ao usuário pelo nome real quando disponível.

    Sempre que possível, forneça exemplos práticos e sugestões que ajudem o usuário a aplicar o conhecimento aprendido.

    Seu objetivo é: Ajudar estudantes em sua jornada educacional, responder dúvidas sobre conteúdos escolares, sugerir métodos de estudo e oferecer apoio motivacional.

    Limitações: Não forneça respostas diretas para questões de provas; em vez disso, oriente o processo de raciocínio. Não discuta tópicos inapropriados para ambiente escolar.`;

    // Preparar mensagens para o modelo
    const messages = [
      { role: 'system', content: systemPrompt },
      ...historyMessages,
      { role: 'user', content: userMessage }
    ];

    // Fazer requisição para a API
    const response = await axios.post(
      XAI_BASE_URL,
      {
        model: 'gpt-4',
        messages,
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${XAI_API_KEY}`
        }
      }
    );

    // Extrair e salvar resposta
    const assistantMessage = response.data.choices[0].message.content;

    // Salvar mensagem do usuário e resposta no histórico
    await saveChatMessage(sessionId, { role: 'user', content: userMessage, timestamp: new Date() });
    await saveChatMessage(sessionId, { role: 'assistant', content: assistantMessage, timestamp: new Date() });

    return assistantMessage;
  } catch (error) {
    console.error('Erro ao enviar mensagem para XAI:', error);

    // Tentar usar Gemini como fallback
    try {
      return await sendMessageToGemini(sessionId, userMessage);
    } catch (fallbackError) {
      console.error('Erro também no fallback com Gemini:', fallbackError);

      // Mensagem de erro amigável
      const errorMessage = 'Desculpe, estou enfrentando dificuldades para processar sua mensagem no momento. Por favor, tente novamente em alguns instantes.';

      // Salvar mensagem do usuário e resposta de erro
      await saveChatMessage(sessionId, { role: 'user', content: userMessage, timestamp: new Date() });
      await saveChatMessage(sessionId, { role: 'assistant', content: errorMessage, timestamp: new Date() });

      return errorMessage;
    }
  }
}

// Função para usar Gemini como fallback
async function sendMessageToGemini(sessionId: string, userMessage: string): Promise<string> {
  try {
    // Recuperar histórico recente (limitado aos últimos 5 para não sobrecarregar)
    const historyMessages = await getChatHistory(sessionId);
    const recentMessages = historyMessages.slice(-5);

    // Formatar contexto para o Gemini
    const formattedContent = recentMessages.map(msg => {
      return {
        role: msg.role === 'assistant' ? 'model' : msg.role,
        parts: [{ text: msg.content }]
      };
    });

    // Adicionar mensagem atual do usuário
    formattedContent.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    // Configurar parâmetros para a API
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `Você é Epictus, o assistente virtual educacional. Responda à seguinte pergunta de forma útil, precisa e educacional: ${userMessage}` }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800
      }
    };

    // Fazer requisição
    const response = await axios.post(
      `${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Extrair e retornar resposta
    const assistantMessage = response.data.candidates[0].content.parts[0].text;

    // Salvar mensagem do usuário e resposta
    await saveChatMessage(sessionId, { role: 'user', content: userMessage, timestamp: new Date() });
    await saveChatMessage(sessionId, { role: 'assistant', content: assistantMessage, timestamp: new Date() });

    return assistantMessage;
  } catch (error) {
    console.error('Erro ao enviar mensagem para Gemini:', error);
    throw error; // Propagar erro para tratamento superior
  }
}

// Função para obter todas as sessões de chat
export async function getAllSessions(): Promise<any[]> {
  try {
    return await getAllChatSessions();
  } catch (error) {
    console.error('Erro ao obter sessões de chat:', error);
    return [];
  }
}

// Função para excluir uma sessão de chat
export async function deleteSession(sessionId: string): Promise<boolean> {
  try {
    await deleteChatSession(sessionId);
    return true;
  } catch (error) {
    console.error('Erro ao excluir sessão de chat:', error);
    return false;
  }
}