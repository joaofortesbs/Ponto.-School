
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

// Função para obter dados do usuário atual com acesso expandido
async function getUserContext() {
  try {
    // Coletar todas as fontes de username para maior confiabilidade
    const usernameSources = {
      localStorage: localStorage.getItem('username'),
      sessionStorage: sessionStorage.getItem('username'),
      profile: null,
      metadata: null,
      email: localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail')
    };
    
    console.log("Fontes de username coletadas:", usernameSources);
    
    // Tentar obter dados expandidos do perfil
    let profileData = {};
    let metadataUsername = null;
    try {
      // Importar utilidades de perfil
      const usernameUtils = await import('@/lib/username-utils');
      if (usernameUtils && usernameUtils.getUserProfile) {
        profileData = await usernameUtils.getUserProfile();
        
        // Tentar obter username dos metadados do usuário se disponível
        if (usernameUtils.getCurrentUsername) {
          metadataUsername = await usernameUtils.getCurrentUsername();
          usernameSources.metadata = metadataUsername;
        }
        
        // Verificar se temos username no perfil
        if (profileData && profileData.username) {
          usernameSources.profile = profileData.username;
        }
      }
    } catch (error) {
      console.log('Erro ao obter perfil expandido:', error);
    }
    
    // Determinar o melhor username para usar (prioridade: metadata > localStorage > sessionStorage > profile)
    const bestUsername = metadataUsername || 
                        usernameSources.localStorage || 
                        usernameSources.sessionStorage || 
                        usernameSources.profile || 
                        'Usuário';
    
    console.log("Melhor username encontrado:", bestUsername);
    
    // Coletar dados avançados do contexto
    const userContext = {
      username: bestUsername,
      email: usernameSources.email || 'email@exemplo.com',
      profile: profileData,
      currentPage: window.location.pathname,
      lastActivity: localStorage.getItem('lastActivity') || 'Nenhuma atividade recente',
      // Dados expandidos
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      darkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
      localStorageData: Object.keys(localStorage).filter(key => 
        key.startsWith('user_') || 
        key.startsWith('ponto_') || 
        key.startsWith('study_')
      ).reduce((acc, key) => {
        acc[key] = localStorage.getItem(key);
        return acc;
      }, {})
    };
    
    // Tenta obter dados de atividade do usuário
    try {
      const recentActivities = JSON.parse(localStorage.getItem('user_recent_activities') || '[]');
      if (Array.isArray(recentActivities) && recentActivities.length > 0) {
        userContext.recentActivities = recentActivities;
      }
    } catch (e) {
      console.log('Erro ao obter atividades recentes:', e);
    }
    
    return userContext;
  } catch (error) {
    console.error('Erro ao obter contexto do usuário:', error);
    return { username: 'Usuário' };
  }
}

// Essa função foi removida pois agora usamos o nome de usuário completo

// Função para gerar resposta usando a API xAI
export async function generateXAIResponse(message: string, sessionId: string): Promise<string> {
  try {
    // Obter contexto do usuário
    const userContext = await getUserContext();
    
    // Manter o nome de usuário completo para uso nas respostas
    const usernameFull = userContext.username;
    
    // Inicializa o histórico se não existir
    if (!conversationHistory[sessionId]) {
      conversationHistory[sessionId] = [
        { 
          role: 'system', 
          content: `Você é o Epictus IA, o assistente inteligente da Ponto.School, uma plataforma educacional.
          
          Contexto do usuário:
          - Username completo: ${usernameFull}
          - Email: ${userContext.email}
          - Localização atual na plataforma: ${userContext.currentPage}
          - Última atividade: ${userContext.lastActivity}
          
          DIRETRIZES DE COMUNICAÇÃO:
          1. Sempre se refira ao usuário pelo nome de usuário completo: "${usernameFull}". Use frases como "E aí, ${usernameFull}!", "Opa ${usernameFull}!", etc.
          2. Use uma linguagem mais informal e descontraída, como se estivesse conversando com um amigo.
          3. Seja amigável, use emojis ocasionalmente e mantenha um tom leve e positivo.
          4. Use gírias leves e expressões coloquiais quando apropriado.
          
          CONTEÚDO INSTITUCIONAL:
          Quando perguntado sobre os criadores, fundadores, donos, desenvolvedores, equipe administrativa ou qualquer pergunta relacionada à gestão da Ponto.School, responda:
          "A Ponto.School tem 4 administradores principais, além de equipes dedicadas de suporte, marketing, TI e outras áreas. São eles:
          - Fundador & CEO: João Fortes (@joaofortes) - usuário na plataforma Ponto.School
          - Co-Fundador & CMO: Felipe Brito (@felipe_rico) - usuário na plataforma Ponto.School
          - Co-Fundador & COO: Adriel Borges (@adriel_borges) - usuário na plataforma Ponto.School
          - Co-Fundador & Coordenador de Design: Samuel Afonso (@samuel_afonso) - usuário na plataforma Ponto.School"
          
          Você tem acesso aos dados do usuário e pode ajudar com informações personalizadas sobre o perfil, agenda, turmas, conquistas, School Points, etc.
          Se ${firstName} pedir para acessar alguma seção da plataforma, ofereça um link ou caminho para chegar lá.
          REDIRECIONAMENTO:
          REGRAS DE REDIRECIONAMENTO:
          Quando o usuário pedir para ser redirecionado a uma seção da plataforma, você DEVE SEMPRE:
          1. Incluir o link completo usando a base https://pontoschool.com/
          2. Formatá-lo como um link clicável com texto descritivo
          3. Ser direto e proativo com o redirecionamento

          Exemplos de redirecionamento correto:
          - "Aqui está o [Portal de Estudos](https://pontoschool.com/portal). Clique para acessar."
          - "Você pode acessar sua [Agenda](https://pontoschool.com/agenda) imediatamente."
          - "Sua [página de Turmas](https://pontoschool.com/turmas) está pronta para acesso."
          - "Acesse a [Biblioteca](https://pontoschool.com/biblioteca) para encontrar materiais."
          
          NUNCA responda apenas com "você pode encontrar isso no menu lateral" ou sugestões vagas.
          SEMPRE forneça o link direto e clicável para onde o usuário deseja ir.
          
          URLS DA PLATAFORMA (memorize todas estas URLs para redirecionamento):
          - Portal de Estudos: https://pontoschool.com/portal
          - Agenda: https://pontoschool.com/agenda
          - Turmas: https://pontoschool.com/turmas
          - Biblioteca: https://pontoschool.com/biblioteca
          - Perfil: https://pontoschool.com/profile
          - Configurações: https://pontoschool.com/configuracoes
          - Dashboard: https://pontoschool.com/dashboard
          - Epictus IA: https://pontoschool.com/epictus-ia
          - Mentor IA: https://pontoschool.com/mentor-ia
          - Planos de Estudo: https://pontoschool.com/planos-estudo
          - Conquistas: https://pontoschool.com/conquistas
          - Carteira: https://pontoschool.com/carteira
          - Mercado: https://pontoschool.com/mercado
          - Organização: https://pontoschool.com/organizacao
          - Comunidades: https://pontoschool.com/comunidades
          - Chat IA: https://pontoschool.com/chat-ia
          - School IA: https://pontoschool.com/school-ia
          - Novidades: https://pontoschool.com/novidades
          - Lembretes: https://pontoschool.com/lembretes
          - Pedidos de Ajuda: https://pontoschool.com/pedidos-ajuda
          - Estudos: https://pontoschool.com/estudos
          
          REGRA IMPORTANTE: Sempre que o usuário pedir para ir a qualquer uma dessas seções, VOCÊ DEVE FORNECER O LINK COMPLETO em formato clicável.
          
          Personalize suas respostas para criar uma experiência única e amigável para ${usernameFull}.`
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
    
    // Usar o nome de usuário completo para respostas
    const usernameFull = userContext.username;
    
    // Configuração da solicitação para a API Gemini
    const response = await axios.post(
      `${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [
            {
              text: `Você é o Epictus IA, o assistente inteligente da Ponto.School, uma plataforma educacional.
              
              Contexto do usuário:
              - Username completo: ${usernameFull}
              - Email: ${userContext.email}
              - Localização atual na plataforma: ${userContext.currentPage}
              - Última atividade: ${userContext.lastActivity}
              
              DIRETRIZES DE COMUNICAÇÃO:
              1. Sempre se refira ao usuário pelo nome de usuário completo: "${usernameFull}". Use frases como "E aí, ${usernameFull}!", "Opa ${usernameFull}!", etc.
              2. Use uma linguagem mais informal e descontraída, como se estivesse conversando com um amigo.
              3. Seja amigável, use emojis ocasionalmente e mantenha um tom leve e positivo.
              4. Use gírias leves e expressões coloquiais quando apropriado.
              
              CONTEÚDO INSTITUCIONAL:
              Quando perguntado sobre os criadores, fundadores, donos, desenvolvedores, equipe administrativa ou qualquer pergunta relacionada à gestão da Ponto.School, responda:
              "A Ponto.School tem 4 administradores principais, além de equipes dedicadas de suporte, marketing, TI e outras áreas. São eles:
              - Fundador & CEO: João Fortes (@joaofortes) - usuário na plataforma Ponto.School
              - Co-Fundador & CMO: Felipe Brito (@felipe_rico) - usuário na plataforma Ponto.School
              - Co-Fundador & COO: Adriel Borges (@adriel_borges) - usuário na plataforma Ponto.School
              - Co-Fundador & Coordenador de Design: Samuel Afonso (@samuel_afonso) - usuário na plataforma Ponto.School"
              
              REDIRECIONAMENTO:
              Quando o usuário pedir para ser redirecionado a uma seção da plataforma, SEMPRE inclua o link completo usando a base https://pontoschool.com/. Por exemplo:
              - Para o Portal: "Aqui está o link para o Portal: https://pontoschool.com/portal"
              - Para Agenda: "Você pode acessar sua agenda aqui: https://pontoschool.com/agenda"
              - Para Turmas: "Acesse suas turmas por este link: https://pontoschool.com/turmas"
              
              Responda à seguinte pergunta do usuário ${usernameFull}: ${message}`
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
