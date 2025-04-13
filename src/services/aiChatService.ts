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
      navigationHistory: localStorage.getItem('navigationHistory') || '[]', // Add navigation history
      courses: localStorage.getItem('courses') || '[]', // Add courses
      groups: localStorage.getItem('groups') || '[]', // Add groups
      achievements: localStorage.getItem('achievements') || '[]', // Add achievements
      preferences: localStorage.getItem('preferences') || '{}', // Add preferences
      lastLogin: localStorage.getItem('lastLogin') || 'Nunca', // Add last login
      deviceInfo: localStorage.getItem('deviceInfo') || '{}', //Add device info
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

// Função para extrair informações de redirecionamento da mensagem do usuário (implementação necessária)
function extractRedirectInfo(message: string): { detected: boolean; route?: string; link?: string; originalText:string } {
  // Implementação para extrair informações de redirecionamento da mensagem.
  // Essa função precisa analisar a mensagem do usuário e retornar:
  // - detected: boolean (true se detectar uma solicitação de redirecionamento)
  // - route: string (a rota para redirecionamento, se encontrada)
  // - link: string (o link HTML para redirecionamento, se encontrado)
  // - originalText: string (A parte original da mensagem que indicava o redirecionamento)

  //Exemplo (implementação incompleta - precisa ser adaptada para a lógica real):
  const keywords = ["ir para", "acesse", "navegue para", "redirecionar para"];
  const found = keywords.some(keyword => message.toLowerCase().includes(keyword));
  let originalText = "";
  if(found){
    // lógica para extrair a rota da mensagem.
    originalText = message.substring(message.indexOf(keywords.find(k => message.toLowerCase().includes(k)))+ keywords.find(k => message.toLowerCase().includes(k)).length).trim()
  }
  return { detected: found, originalText: originalText };
}


// Função para extrair o nome de exibição da DOM (implementação necessária)
function extractDisplayNameFromDOM(): string | null {
  // Implementação para extrair o nome de exibição do menu lateral ou dashboard.
  // Essa função precisa acessar o DOM da página e retornar o nome do usuário, se encontrado.
  // Retorna null se o nome não for encontrado.

  //Exemplo (implementação incompleta - precisa ser adaptada para a lógica real):
  const displayNameElement = document.getElementById('user-display-name'); // Substitua pelo seletor correto
  return displayNameElement ? displayNameElement.textContent : null;
}


// Função para gerar resposta usando a API xAI
export async function generateXAIResponse(message: string, sessionId: string): Promise<string> {
  try {
    // Obter contexto do usuário
    const userContext = await getUserContext();

    // Extrair primeiro nome do usuário para uso nas respostas
    const firstName = getFirstName(userContext.username);

    // Verificar se há um pedido de redirecionamento na mensagem
    const redirectInfo = extractRedirectInfo(message);

    // Inicializa o histórico se não existir
    if (!conversationHistory[sessionId]) {
      // Tentar obter o nome do usuário direto da DOM primeiro
      const displayNameFromDOM = extractDisplayNameFromDOM();
      const finalFirstName = displayNameFromDOM || firstName;

      conversationHistory[sessionId] = [
        { 
          role: 'system', 
          content: `Você é o Epictus IA, o assistente inteligente da Ponto.School, uma plataforma educacional inovadora.

          CONTEXTO DO USUÁRIO (DADOS ATUAIS):
          - Nome: ${finalFirstName}
          - Username completo: ${userContext.username}
          - Email: ${userContext.email}
          - Perfil completo: ${JSON.stringify(userContext.profile)}
          - Localização atual na plataforma: ${userContext.currentPage}
          - Última atividade: ${userContext.lastActivity}
          - Histórico de navegação: ${JSON.stringify(userContext.navigationHistory)}
          - Cursos inscritos: ${JSON.stringify(userContext.courses)}
          - Grupos: ${JSON.stringify(userContext.groups)}
          - Conquistas: ${JSON.stringify(userContext.achievements)}
          - Preferências: ${JSON.stringify(userContext.preferences)}
          - Último login: ${userContext.lastLogin}
          - Informações do dispositivo: ${JSON.stringify(userContext.deviceInfo)}

          DIRETRIZES DE COMUNICAÇÃO:
          1. SEMPRE se refira ao usuário pelo primeiro nome: "${finalFirstName}". Use frases como "E aí, ${finalFirstName}!", "Opa ${finalFirstName}!", etc. É FUNDAMENTAL sempre usar o nome do usuário.
          2. Use linguagem informal e descontraída, como se estivesse conversando com um amigo.
          3. Seja amigável, use emojis ocasionalmente e mantenha um tom leve e positivo.
          4. Use gírias leves e expressões coloquiais quando apropriado.

          CONTEÚDO INSTITUCIONAL:
          Quando perguntado sobre os criadores, fundadores, donos, desenvolvedores, equipe administrativa ou qualquer pergunta relacionada à gestão da Ponto.School, responda exatamente com:
          "A Ponto.School tem 4 administradores principais, além de equipes dedicadas de suporte, marketing, TI e outras áreas. São eles:
          - Fundador & CEO: João Fortes (@joaofortes) - usuário na plataforma Ponto.School
          - Co-Fundador & CMO: Felipe Brito (@felipe_rico) - usuário na plataforma Ponto.School
          - Co-Fundador & COO: Adriel Borges (@adriel_borges) - usuário na plataforma Ponto.School
          - Co-Fundador & Coordenador de Design: Samuel Afonso (@samuel_afonso) - usuário na plataforma Ponto.School"

          NAVEGAÇÃO NA PLATAFORMA:
          Se ${finalFirstName} pedir para acessar/ir/navegar para alguma seção da plataforma, SEMPRE forneça um link clicável. Por exemplo:
          "Para acessar o portal, [clique aqui](/portal)" ou "Você pode acessar suas turmas [clicando aqui](/turmas)".

          ACESSO A DADOS:
          Você tem acesso completo a todos os dados do usuário e pode ajudar com informações personalizadas sobre:
          - Perfil pessoal
          - Agenda e compromissos
          - Turmas e grupos de estudo
          - Conquistas e progressos
          - School Points e carteira
          - Histórico de atividades
          - Preferências e configurações

          Use esses dados para criar respostas altamente personalizadas para ${finalFirstName}. O objetivo é que ele sinta que você realmente conhece seu histórico e necessidades na plataforma.`
        }
      ];
    }

    // Se for solicitação de redirecionamento, adicione contexto
    let userMessageContent = message;
    if (redirectInfo.detected) {
      if (redirectInfo.link) {
        console.log(`Detectada solicitação de redirecionamento para: ${redirectInfo.route}`);
        userMessageContent = `${message} [SISTEMA: Usuário quer ir para "${redirectInfo.originalText}". Forneça o link HTML: ${redirectInfo.link} para redirecioná-lo.]`;
      } else {
        console.log(`Detectada possível solicitação de redirecionamento, mas rota não encontrada: ${redirectInfo.originalText}`);
        userMessageContent = `${message} [SISTEMA: Usuário possivelmente quer ir para "${redirectInfo.originalText}", mas não encontrei uma rota específica. Sugira alternativas se possível.]`;
      }
    }

    // Adiciona a mensagem do usuário ao histórico
    conversationHistory[sessionId].push({ role: 'user', content: userMessageContent });

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
    let aiResponse = response.data.choices[0].message.content;

    // Processa links HTML nas respostas para garantir que funcionem corretamente
    // Substitui [clique aqui](/caminho) por <a href="/caminho">clique aqui</a>
    aiResponse = aiResponse.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-orange-500 hover:text-orange-600 underline">$1</a>');

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
              - Fundador & CEO: João Fortes (@joaofortes) - usuário na plataforma Ponto.School
              - Co-Fundador & CMO: Felipe Brito (@felipe_rico) - usuário na plataforma Ponto.School
              - Co-Fundador & COO: Adriel Borges (@adriel_borges) - usuário na plataforma Ponto.School
              - Co-Fundador & Coordenador de Design: Samuel Afonso (@samuel_afonso) - usuário na plataforma Ponto.School"

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