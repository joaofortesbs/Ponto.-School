
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
    
    // Obter histórico de interações
    const userPreferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const favoriteContent = JSON.parse(localStorage.getItem('favoriteContent') || '[]');
    const courseProgress = JSON.parse(localStorage.getItem('courseProgress') || '{}');
    
    // Obter outras informações contextuais disponíveis
    const userContext = {
      username: username,
      firstName: username.split(' ')[0],
      email: localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail') || 'email@exemplo.com',
      profile: profileData,
      currentPage: window.location.pathname,
      lastActivity: localStorage.getItem('lastActivity') || 'Nenhuma atividade recente',
      preferences: userPreferences,
      recentSearches: recentSearches,
      favoriteContent: favoriteContent,
      courseProgress: courseProgress,
      achievements: JSON.parse(localStorage.getItem('achievements') || '[]'),
      schoolPoints: localStorage.getItem('schoolPoints') || '0',
      notifications: JSON.parse(localStorage.getItem('notifications') || '[]')
    };
    
    return userContext;
  } catch (error) {
    console.error('Erro ao obter contexto do usuário:', error);
    return { username: 'Usuário', firstName: 'Usuário' };
  }
}

// Função para gerar resposta usando a API xAI
export async function generateXAIResponse(message: string, sessionId: string): Promise<string> {
  try {
    // Obter contexto do usuário
    const userContext = await getUserContext();
    
    // Inicializa o histórico se não existir
    if (!conversationHistory[sessionId]) {
      conversationHistory[sessionId] = [
        { 
          role: 'system', 
          content: `Você é o Epictus IA, o assistente inteligente da Ponto.School, uma plataforma educacional. 
          
          Contexto do usuário:
          - Nome: ${userContext.firstName}
          - Username: ${userContext.username}
          - Email: ${userContext.email}
          - Localização atual na plataforma: ${userContext.currentPage}
          - Última atividade: ${userContext.lastActivity}
          - School Points: ${userContext.schoolPoints}
          
          INFORMAÇÕES SOBRE A PLATAFORMA:
          
          A Ponto.School é uma plataforma educacional criada e desenvolvida por uma equipe de quatro administradores principais:
          - Fundador & CEO: João Fortes (username: @joaofortes na plataforma)
          - Co-Fundador & CMO: Felipe Brito (username: @felipe_rico na plataforma) 
          - Co-Fundador & COO: Adriel Borges (username: @adriel_borges na plataforma)
          - Co-Fundador & Coordenador de Design: Samuel Afonso (username: @samuel_afonso na plataforma)
          
          Além destes, a plataforma conta com equipes de suporte, marketing, TI e outras áreas.
          
          INSTRUÇÕES PARA VOCÊ:
          
          1. Sempre se refira ao usuário pelo primeiro nome: ${userContext.firstName}
          2. Use uma linguagem informal e descontraída, mas profissional
          3. Quando o usuário perguntar sobre quem criou, desenvolveu ou sobre a equipe da plataforma, compartilhe as informações dos 4 administradores mencionados acima
          4. Se o usuário solicitar acesso a alguma seção da plataforma, envie o link direto utilizando https://pontoschool.com/ como base
          5. Você tem acesso ao perfil completo, histórico, conquistas, School Points, e todas as informações do usuário na plataforma
          6. Para personalizar as respostas, utilize o contexto atual do usuário
          7. Demonstre entusiasmo e seja prestativo
          
          LINKS IMPORTANTES DA PLATAFORMA:
          - Dashboard: https://pontoschool.com/dashboard
          - Biblioteca: https://pontoschool.com/biblioteca
          - Turmas: https://pontoschool.com/turmas
          - Portal: https://pontoschool.com/portal
          - Perfil: https://pontoschool.com/profile
          - Organização: https://pontoschool.com/organizacao
          - School Points: https://pontoschool.com/carteira
          - Conquistas: https://pontoschool.com/conquistas
          - Conexão Expert: https://pontoschool.com/pedidos-ajuda
          - Comunidades: https://pontoschool.com/comunidades
          - Mercado: https://pontoschool.com/mercado
          
          Sempre referir-se ao usuário como ${userContext.firstName} e personalizar as respostas com base no contexto acima.`
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
    
    // Implementa retry logic com backoff exponencial
    let attempts = 0;
    const maxAttempts = 3;
    const baseDelay = 1000; // 1 segundo
    
    while (attempts < maxAttempts) {
      try {
        // Configuração da solicitação para a API xAI
        const response = await axios.post(
          XAI_BASE_URL,
          {
            messages: conversationHistory[sessionId],
            model: 'grok-3-latest',
            stream: false,
            temperature: 0.7,
            max_tokens: 2048 // Limitar tamanho da resposta para evitar erros
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${XAI_API_KEY}`
            },
            timeout: 30000 // Timeout de 30 segundos
          }
        );
        
        // Verifica se a resposta contém os dados esperados
        if (response.data && 
            response.data.choices && 
            response.data.choices.length > 0 && 
            response.data.choices[0].message && 
            response.data.choices[0].message.content) {
          
          // Extrai a resposta
          const aiResponse = response.data.choices[0].message.content;
          
          // Adiciona a resposta da IA ao histórico
          conversationHistory[sessionId].push({ role: 'assistant', content: aiResponse });
          
          return aiResponse;
        } else {
          throw new Error("Resposta da API xAI incompleta ou malformada");
        }
      } catch (error) {
        attempts++;
        
        // Se atingiu o número máximo de tentativas, propaga o erro
        if (attempts >= maxAttempts) {
          console.error(`Erro na tentativa ${attempts}/${maxAttempts} ao chamar xAI:`, error);
          throw error;
        }
        
        // Espera com backoff exponencial antes de tentar novamente
        const delay = baseDelay * Math.pow(2, attempts - 1);
        console.warn(`Tentativa ${attempts}/${maxAttempts} falhou. Tentando novamente em ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error("Todas as tentativas de conexão com a API xAI falharam");
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
    
    // Configuração da solicitação para a API Gemini
    const response = await axios.post(
      `${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [
            {
              text: `Você é o Epictus IA, o assistente inteligente da Ponto.School, uma plataforma educacional.
              
              Contexto do usuário:
              - Username: ${userContext.username}
              - Email: ${userContext.email}
              - Localização atual na plataforma: ${userContext.currentPage}
              - Última atividade: ${userContext.lastActivity}
              
              Forneça respostas úteis, precisas e personalizadas para este usuário específico.
              Quando perguntado sobre sua identidade, responda que você é o Epictus IA, assistente da Ponto.School.
              Você tem acesso aos dados do usuário e pode ajudar com informações sobre o perfil, agenda, turmas, conquistas, School Points, etc.
              Se o usuário pedir para acessar alguma seção da plataforma, ofereça um link ou caminho para chegar lá.
              
              Responda à seguinte pergunta do usuário ${userContext.username}: ${message}`
            }
          ]
        }]
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
