
import axios from 'axios';

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
}

// Histórico de conversas
let conversationHistory: Record<string, ChatMessage[]> = {};

// Função para obter dados do usuário atual
async function getUserContext() {
  try {
    // Obter username do localStorage ou sessionStorage
    const username = localStorage.getItem('username') || 
                    sessionStorage.getItem('username') || 
                    'Usuário';
    
    // Obter dados do perfil, se disponíveis
    let profileData = {};
    try {
      const { data: profileModule } = await import('@/lib/username-utils');
      if (profileModule && profileModule.getUserProfile) {
        profileData = await profileModule.getUserProfile();
      }
    } catch (error) {
      console.log('Perfil não disponível para IA:', error);
    }
    
    // Obter outras informações contextuais disponíveis
    const userContext = {
      username: username,
      email: localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail') || 'email@exemplo.com',
      profile: profileData,
      currentPage: window.location.pathname,
      lastActivity: localStorage.getItem('lastActivity') || 'Nenhuma atividade recente',
      // Adicionar mais contextos conforme disponíveis
    };
    
    return userContext;
  } catch (error) {
    console.error('Erro ao obter contexto do usuário:', error);
    return { username: 'Usuário' };
  }
}

// Função para extrair primeiro nome do username
function getFirstName(username: string): string {
  // Remove underscores e pega apenas o primeiro nome
  const nameParts = username.split(/[_\s]/);
  return nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
}

// Função para gerar resposta usando a API xAI
export async function generateXAIResponse(message: string, sessionId: string): Promise<string> {
  try {
    // Obter contexto do usuário
    const userContext = await getUserContext();
    
    // Extrair primeiro nome do usuário para uso nas respostas
    const firstName = getFirstName(userContext.username);
    
    // Inicializa o histórico se não existir
    if (!conversationHistory[sessionId]) {
      conversationHistory[sessionId] = [
        { 
          role: 'system', 
          content: `Você é o Epictus IA, o assistente inteligente da Ponto.School, uma plataforma educacional.
          
          Contexto do usuário:
          - Nome: ${firstName}
          - Username completo: ${userContext.username}
          - Email: ${userContext.email}
          - Localização atual na plataforma: ${userContext.currentPage}
          - Última atividade: ${userContext.lastActivity}
          
          DIRETRIZES DE COMUNICAÇÃO:
          1. Sempre se refira ao usuário pelo primeiro nome: "${firstName}". Use frases como "E aí, ${firstName}!", "Opa ${firstName}!", etc.
          2. Use uma linguagem mais informal e descontraída, como se estivesse conversando com um amigo.
          3. Seja amigável, use emojis ocasionalmente e mantenha um tom leve e positivo.
          4. Use gírias leves e expressões coloquiais quando apropriado.
          
          CONTEÚDO INSTITUCIONAL:
          Quando perguntado sobre os criadores, fundadores, donos, desenvolvedores, equipe administrativa ou qualquer pergunta relacionada à gestão da Ponto.School, responda:
          "A Ponto.School tem 4 administradores principais, além de equipes dedicadas de suporte, marketing, TI e outras áreas. São eles:
          - Fundador & CEO: João Fortes (@joaofortes)
          - Co-Fundador & CMO: Felipe Brito (@felipe_rico)
          - Co-Fundador & COO: Adriel Borges (@adriel_borges)
          - Co-Fundador & Coordenador de Design: Samuel Afonso (@samuel_afonso)"
          
          Você tem acesso aos dados do usuário e pode ajudar com informações personalizadas sobre o perfil, agenda, turmas, conquistas, School Points, etc.
          Se ${firstName} pedir para acessar alguma seção da plataforma, ofereça um link ou caminho para chegar lá.
          Personalize suas respostas para criar uma experiência única e amigável para ${firstName}.`
        }
      ];
    }
    
    // Adiciona a mensagem do usuário ao histórico
    conversationHistory[sessionId].push({ role: 'user', content: message });
    
    // Limita o histórico para evitar exceder os limites da API
    if (conversationHistory[sessionId].length > 10) {
      // Mantém a mensagem do sistema e as últimas 9 mensagens
      const systemMessage = conversationHistory[sessionId][0];
      conversationHistory[sessionId] = [
        systemMessage,
        ...conversationHistory[sessionId].slice(-9)
      ];
    }
    
    // Configuração da solicitação para a API xAI
    const response = await axios.post(
      XAI_BASE_URL,
      {
        messages: conversationHistory[sessionId],
        model: 'grok-3-latest',
        stream: false,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${XAI_API_KEY}`
        }
      }
    );
    
    // Extrai a resposta
    const aiResponse = response.data.choices[0].message.content;
    
    // Adiciona a resposta da IA ao histórico
    conversationHistory[sessionId].push({ role: 'assistant', content: aiResponse });
    
    return aiResponse;
  } catch (error) {
    console.error('Erro ao gerar resposta com xAI:', error);
    // Fallback para Gemini em caso de erro
    return generateGeminiResponse(message, sessionId);
  }
}

// Função para gerar resposta usando a API Gemini
export async function generateGeminiResponse(message: string, sessionId: string): Promise<string> {
  try {
    // Obter contexto do usuário
    const userContext = await getUserContext();
    
    // Extrair primeiro nome do usuário para uso nas respostas
    const firstName = getFirstName(userContext.username);
    
    // Configuração da solicitação para a API Gemini
    const response = await axios.post(
      `${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [
            {
              text: `Você é o Epictus IA, o assistente inteligente da Ponto.School, uma plataforma educacional.
              
              Contexto do usuário:
              - Nome: ${firstName}
              - Username completo: ${userContext.username}
              - Email: ${userContext.email}
              - Localização atual na plataforma: ${userContext.currentPage}
              - Última atividade: ${userContext.lastActivity}
              
              DIRETRIZES DE COMUNICAÇÃO:
              1. Sempre se refira ao usuário pelo primeiro nome: "${firstName}". Use frases como "E aí, ${firstName}!", "Opa ${firstName}!", etc.
              2. Use uma linguagem mais informal e descontraída, como se estivesse conversando com um amigo.
              3. Seja amigável, use emojis ocasionalmente e mantenha um tom leve e positivo.
              4. Use gírias leves e expressões coloquiais quando apropriado.
              
              CONTEÚDO INSTITUCIONAL:
              Quando perguntado sobre os criadores, fundadores, donos, desenvolvedores, equipe administrativa ou qualquer pergunta relacionada à gestão da Ponto.School, responda:
              "A Ponto.School tem 4 administradores principais, além de equipes dedicadas de suporte, marketing, TI e outras áreas. São eles:
              - Fundador & CEO: João Fortes (@joaofortes)
              - Co-Fundador & CMO: Felipe Brito (@felipe_rico)
              - Co-Fundador & COO: Adriel Borges (@adriel_borges)
              - Co-Fundador & Coordenador de Design: Samuel Afonso (@samuel_afonso)"
              
              Responda à seguinte pergunta do usuário ${firstName}: ${message}`
            }
          ]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Extrai a resposta
    const aiResponse = response.data.candidates[0].content.parts[0].text;
    
    return aiResponse;
  } catch (error) {
    console.error('Erro ao gerar resposta com Gemini:', error);
    return "Desculpe, estou enfrentando dificuldades técnicas no momento. Por favor, tente novamente mais tarde ou entre em contato com nosso suporte técnico.";
  }
}

// Função principal para gerar resposta, tentando primeiro xAI e depois Gemini como fallback
export async function generateAIResponse(message: string, sessionId: string): Promise<string> {
  try {
    return await generateXAIResponse(message, sessionId);
  } catch (error) {
    console.error('Erro com xAI, tentando Gemini:', error);
    return generateGeminiResponse(message, sessionId);
  }
}

// Limpar histórico da conversa
export function clearConversationHistory(sessionId: string): void {
  if (conversationHistory[sessionId]) {
    // Mantém apenas a mensagem do sistema
    const systemMessage = conversationHistory[sessionId][0];
    conversationHistory[sessionId] = [systemMessage];
  }
}
