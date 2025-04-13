import axios from 'axios';
import * as aiChatDatabase from "./aiChatDatabaseService";

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

// Inicializar o histórico do localStorage quando o módulo carrega
try {
  const savedSessions = localStorage.getItem('aiChatSessions');
  if (savedSessions) {
    const parsedSessions = JSON.parse(savedSessions);
    // Verificar se é um objeto válido
    if (parsedSessions && typeof parsedSessions === 'object') {
      // Para cada sessão, converter as datas de string para Date
      Object.keys(parsedSessions).forEach(sessionId => {
        if (Array.isArray(parsedSessions[sessionId])) {
          conversationHistory[sessionId] = parsedSessions[sessionId].map(msg => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
          }));
        }
      });
      console.log(`Carregadas ${Object.keys(conversationHistory).length} sessões de chat do localStorage`);
    }
  }
} catch (error) {
  console.error('Erro ao carregar histórico de conversas do localStorage:', error);
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
      supabase = (await import('@/lib/supabase')).supabase;

      // Obter perfil completo do usuário com todos os detalhes
      completeUserProfile = await profileService.getCurrentUserProfile();

      // Obter session para determinar o ID do usuário atual
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData?.session?.user?.id;

      if (currentUserId && completeUserProfile) {
        // Obter turmas do usuário
        const { data: classesData } = await supabase
          .from('user_classes')
          .select('*, class:classes(*)')
          .eq('user_id', currentUserId);

        if (classesData) {
          userClasses = classesData;
        }

        // Obter séries do usuário
        const { data: seriesData } = await supabase
          .from('user_series')
          .select('*, serie:series(*)')
          .eq('user_id', currentUserId);

        if (seriesData) {
          userSeries = seriesData;
        }

        // Obter contagem de seguidores
        const { count } = await supabase
          .from('user_followers')
          .select('*', { count: 'exact' })
          .eq('followed_id', currentUserId);

        if (count !== null) {
          followersCount = count;
        }
      }
    } catch (error) {
      console.error('Erro ao obter dados completos do perfil:', error);
    }

    // Tentar obter dados expandidos do perfil via username-utils (fallback)
    let basicProfileData = {};
    let metadataUsername = null;

    try {
      const usernameUtils = await import('@/lib/username-utils');
      if (usernameUtils && usernameUtils.getUserProfile) {
        basicProfileData = await usernameUtils.getUserProfile();

        if (usernameUtils.getCurrentUsername) {
          metadataUsername = await usernameUtils.getCurrentUsername();
          usernameSources.metadata = metadataUsername;
        }

        if (basicProfileData && basicProfileData.username) {
          usernameSources.profile = basicProfileData.username;
        }
      }
    } catch (error) {
      console.log('Erro ao obter perfil via username-utils:', error);
    }

    // Determinar o melhor username para usar (prioridade: perfil completo > metadata > localStorage > sessionStorage)
    const bestUsername = 
      (completeUserProfile?.username || completeUserProfile?.display_name) || 
      metadataUsername || 
      usernameSources.localStorage || 
      usernameSources.sessionStorage || 
      usernameSources.profile || 
      'Usuário';

    // Construir contexto completo do usuário
    const userContext = {
      // Dados básicos
      username: bestUsername,
      email: completeUserProfile?.email || usernameSources.email || 'email@exemplo.com',

      // Dados completos do perfil
      profile: completeUserProfile || basicProfileData,

      // Dados específicos para fácil acesso
      userId: completeUserProfile?.user_id || 'ID não disponível',
      fullName: completeUserProfile?.full_name || 'Nome não disponível',
      displayName: completeUserProfile?.display_name || bestUsername,
      createdAt: completeUserProfile?.created_at || 'Data não disponível',
      planType: completeUserProfile?.plan_type || 'lite',
      userLevel: completeUserProfile?.level || 1,
      followersCount: followersCount,

      // Dados de contexto de uso
      currentPage: window.location.pathname,
      lastActivity: localStorage.getItem('lastActivity') || 'Nenhuma atividade recente',

      // Dados das turmas e séries
      classes: userClasses,
      series: userSeries,

      // Dados do dispositivo e ambiente
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      darkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,

      // Dados do localStorage
      localStorageData: Object.keys(localStorage).filter(key => 
        key.startsWith('user_') || 
        key.startsWith('ponto_') || 
        key.startsWith('study_')
      ).reduce((acc, key) => {
        acc[key] = localStorage.getItem(key);
        return acc;
      }, {})
    };

    // Obter atividades recentes
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


// Função para gerar resposta usando a API xAI
export async function generateXAIResponse(
  message: string, 
  sessionId: string,
  options?: { 
    intelligenceLevel?: 'basic' | 'normal' | 'advanced',
    languageStyle?: 'casual' | 'formal' | 'technical'
  }
): Promise<string> {
  try {
    // Verificar se a mensagem contém comando para acessar ou modificar o perfil
    const isProfileInfoRequest = /qual (é|e) (o )?meu (ID|id)|me (mostre|mostra|diga|informe) (o )?meu (ID|id)|informações da minha conta|dados da minha conta|meu perfil completo/i.test(message);
    const isProfileUpdateRequest = /atualiz(e|ar) (minha|a) (bio|biografia)|mudar (minha|a) (bio|biografia)|modificar (minha|a) bio|mudar (meu|o) nome de exibição|atualizar (meu|o) nome de exibição|mudar (meu|o) telefone/i.test(message);
    const isRedirectRequest = /(me\s+(redirecione|encaminhe|leve|direcione|mande|envie)\s+(para|ao|à|a|até)|quero\s+(ir|acessar|entrar|ver)|me\s+(mostre|mostra)|abrir?|abra|acesse|acessar|ver|veja)\s+(a\s+)?(página\s+(de|do|da)\s+)?([a-zà-ú\s]+)/i.test(message);

    // Importar o serviço de modificação de perfil se necessário
    let ProfileModificationService;
    if (isProfileInfoRequest || isProfileUpdateRequest) {
      try {
        ProfileModificationService = (await import('./profileModificationService')).ProfileModificationService;
      } catch (e) {
        console.error('Erro ao importar ProfileModificationService:', e);
      }
    }

    // Obter contexto do usuário - fazer isso logo no início
    const userContext = await getUserContext();

    // Extrair o primeiro nome do usuário para uso personalizado nas respostas
    const firstName = userContext.fullName ? 
      userContext.fullName.split(' ')[0] : 
      (userContext.displayName || userContext.username || 'Usuário');

    // Inicializar o histórico se não existir
    if (!conversationHistory[sessionId]) {
      initializeConversationHistory(sessionId, userContext);
    }

    // Adiciona a mensagem do usuário ao histórico
    conversationHistory[sessionId].push({ 
      role: 'user', 
      content: message,
      timestamp: new Date() 
    });

    // Processar solicitação de informações do perfil
    if (isProfileInfoRequest && ProfileModificationService) {
      try {
        const { profile, formattedInfo } = await ProfileModificationService.getDetailedUserProfile();

        // Se conseguiu obter as informações, criar uma resposta personalizada
        if (profile) {
          // Criar resposta amigável com as informações
          const response = `Claro, ${firstName}! Aqui estão as informações da sua conta:

${formattedInfo}

Você pode visualizar e editar seu perfil completo acessando [sua página de perfil](https://pontoschool.com/profile).

Posso te ajudar a atualizar algumas dessas informações diretamente por aqui, como sua biografia ou nome de exibição. É só me pedir!`;

          // Adicionar a resposta ao histórico
          conversationHistory[sessionId].push({ 
            role: 'assistant', 
            content: response,
            timestamp: new Date()
          });

          await saveConversationHistory(sessionId, conversationHistory[sessionId]);
          return response;
        }
      } catch (e) {
        console.error('Erro ao processar solicitação de informações do perfil:', e);
      }
    }

    // Processar solicitação de atualização de perfil
    if (isProfileUpdateRequest && ProfileModificationService) {
      // Reconhecer o tipo de atualização solicitada
      const isBioUpdate = /atualiz(e|ar) (minha|a) (bio|biografia)|mudar (minha|a) (bio|biografia)|modificar (minha|a) bio/i.test(message);
      const isDisplayNameUpdate = /mudar (meu|o) nome de exibição|atualizar (meu|o) nome de exibição/i.test(message);
      const isContactInfoUpdate = /mudar (meu|o) telefone|atualizar (meu|o) telefone|mudar (minha|a) localização|atualizar (minha|a) localização/i.test(message);

      // Extrair o conteúdo a ser atualizado
      try {
        // Determinar qual atualização fazer e responder apropriadamente
        let response = '';

        if (isBioUpdate) {
          // Extrair a nova biografia da mensagem
          const bioRegex = /(?:para|como|com) ["|'|"](.+?)["|'|"]/i;
          const bioMatch = message.match(bioRegex);

          if (bioMatch && bioMatch[1]) {
            const newBio = bioMatch[1].trim();
            const result = await ProfileModificationService.updateUserBio(newBio);

            if (result.success) {
              response = `Ótimo, ${firstName}! Sua biografia foi atualizada com sucesso para: "${newBio}". 

As alterações já estão disponíveis no seu perfil. Você pode conferir em [sua página de perfil](https://pontoschool.com/profile).`;
            } else {
              response = `Desculpe ${firstName}, não consegui atualizar sua biografia. ${result.message}`;
            }
          } else {
            response = `Parece que você quer atualizar sua biografia, ${firstName}, mas não entendi qual seria o novo texto. Pode me fornecer a nova biografia entre aspas? 

Por exemplo: "Atualizar minha biografia para 'Estudante de engenharia apaixonado por tecnologia'"`;
          }
        } else if (isDisplayNameUpdate) {
          // Extrair o novo nome de exibição
          const nameRegex = /(?:para|como|com) ["|'|"](.+?)["|'|"]/i;
          const nameMatch = message.match(nameRegex);

          if (nameMatch && nameMatch[1]) {
            const newName = nameMatch[1].trim();
            const result = await ProfileModificationService.updateDisplayName(newName);

            if (result.success) {
              response = `Perfeito, ${firstName}! Seu nome de exibição foi atualizado com sucesso para: "${newName}".

A alteração já está disponível em seu perfil. Você pode conferir em [sua página de perfil](https://pontoschool.com/profile).`;
            } else {
              response = `Desculpe ${firstName}, não consegui atualizar seu nome de exibição. ${result.message}`;
            }
          } else {
            response = `Parece que você quer atualizar seu nome de exibição, ${firstName}, mas não entendi qual seria o novo nome. Pode me fornecer o novo nome entre aspas?

Por exemplo: "Atualizar meu nome de exibição para 'João Silva'"`;
          }
        } else if (isContactInfoUpdate) {
          response = `${firstName}, para atualizar suas informações de contato, é melhor acessar diretamente a página de configurações:

[Acesse as configurações do seu perfil](https://pontoschool.com/configuracoes)

Lá você poderá atualizar seu telefone, localização e outras informações de contato de forma segura.`;
        }

        // Adicionar a resposta ao histórico
        if (response) {
          conversationHistory[sessionId].push({ 
            role: 'assistant', 
            content: response,
            timestamp: new Date()
          });
          await saveConversationHistory(sessionId, conversationHistory[sessionId]);
          return response;
        }
      } catch (e) {
        console.error('Erro ao processar solicitação de atualização de perfil:', e);
      }
    }

    // Verificar se é um pedido de redirecionamento para área da plataforma
    if (isRedirectRequest) {
      const platformLinks = {
        'Portal de Estudos': 'https://pontoschool.com/portal',
        'Portal': 'https://pontoschool.com/portal',
        'Agenda': 'https://pontoschool.com/agenda',
        'Turmas': 'https://pontoschool.com/turmas',
        'Biblioteca': 'https://pontoschool.com/biblioteca',
        'Perfil': 'https://pontoschool.com/profile',
        'Meu Perfil': 'https://pontoschool.com/profile',
        'Configurações': 'https://pontoschool.com/configuracoes',
        'Minhas Configurações': 'https://pontoschool.com/configuracoes',
        'Dashboard': 'https://pontoschool.com/dashboard',
        'Epictus IA': 'https://pontoschool.com/epictus-ia',
        'Mentor IA': 'https://pontoschool.com/mentor-ia',
        'Planos de Estudo': 'https://pontoschool.com/planos-estudo',
        'Plano de Estudos': 'https://pontoschool.com/planos-estudo',
        'Conquistas': 'https://pontoschool.com/conquistas',
        'Minhas Conquistas': 'https://pontoschool.com/conquistas',
        'Carteira': 'https://pontoschool.com/carteira',
        'Minha Carteira': 'https://pontoschool.com/carteira',
        'Mercado': 'https://pontoschool.com/mercado',
        'Organização': 'https://pontoschool.com/organizacao',
        'Comunidades': 'https://pontoschool.com/comunidades',
        'Chat IA': 'https://pontoschool.com/chat-ia',
        'School IA': 'https://pontoschool.com/school-ia',
        'Novidades': 'https://pontoschool.com/novidades',
        'Lembretes': 'https://pontoschool.com/lembretes',
        'Pedidos de Ajuda': 'https://pontoschool.com/pedidos-ajuda',
        'Estudos': 'https://pontoschool.com/estudos'
      };

      // Regex mais preciso para extrair a seção desejada
      const sectionRegex = /(me\s+(redirecione|encaminhe|leve|direcione|mande|envie)\s+(para|ao|à|a|até)|quero\s+(ir|acessar|entrar|ver)|me\s+(mostre|mostra)|abrir?|abra|acesse|acessar|ver|veja)\s+(a\s+)?(página\s+(de|do|da)\s+)?([a-zà-ú\s]+)/i;
      const match = message.match(sectionRegex);

      if (match && match[9]) {
        const requestedSection = match[9].trim().toLowerCase();

        // Encontra a melhor correspondência entre as seções disponíveis
        const sections = Object.keys(platformLinks);
        const bestMatch = sections.find(section => 
          section.toLowerCase() === requestedSection || 
          section.toLowerCase().includes(requestedSection) ||
          requestedSection.includes(section.toLowerCase())
        );

        if (bestMatch) {
          const response = `Claro, ${firstName}! Aqui está o link direto para ${bestMatch}: [${bestMatch}](${platformLinks[bestMatch]})

Clique no link acima para ser redirecionado. Posso ajudar com mais alguma coisa?`;

          conversationHistory[sessionId].push({ 
            role: 'assistant', 
            content: response,
            timestamp: new Date()
          });
          await saveConversationHistory(sessionId, conversationHistory[sessionId]);
          return response;
        }
      }
    }

    // Limita o histórico para evitar exceder os limites da API
    if (conversationHistory[sessionId].length > 20) {
      // Mantém a mensagem do sistema e as últimas 19 mensagens
      const systemMessage = conversationHistory[sessionId][0];
      conversationHistory[sessionId] = [
        systemMessage,
        ...conversationHistory[sessionId].slice(-19)
      ];
    }

    try {
      // Configuração da solicitação para a API xAI
      const response = await axios.post(
        XAI_BASE_URL,
        {
          messages: conversationHistory[sessionId].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          model: 'grok-3-latest',
          stream: false,
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${XAI_API_KEY}`
          },
          timeout: 15000 // 15 segundos de timeout
        }
      );

      // Extrai a resposta
      let aiResponse = '';

      if (response.data && 
          response.data.choices && 
          response.data.choices.length > 0 && 
          response.data.choices[0].message) {
        aiResponse = response.data.choices[0].message.content;
      } else {
        throw new Error('Formato de resposta inválido da API xAI');
      }

      // Verificar e corrigir links de redirecionamento
      aiResponse = fixPlatformLinks(aiResponse);

      // Adicionar a resposta da IA à interface com formatação melhorada e corrigida
      const formattedResponse = aiResponse
        // Formatação de texto básica
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
        .replace(/\_(.*?)\_/g, '<em class="italic">$1</em>')
        .replace(/\~\~(.*?)\~\~/g, '<del class="line-through">$1</del>')
        .replace(/\`(.*?)\`/g, '<code class="bg-black/10 dark:bg-white/10 rounded px-1 py-0.5 font-mono text-xs">$1</code>')

        // Formatação de parágrafos e listas
        .replace(/\n\n/g, '</p><p class="mt-3">')
        .replace(/\n/g, '<br />')

        // Formatação de títulos
        .replace(/^# (.*?)$/gm, '<h3 class="text-lg font-bold my-2">$1</h3>')
        .replace(/^## (.*?)$/gm, '<h4 class="text-md font-bold my-2">$1</h4>')

        // Formatação de listas
        .replace(/^\* (.*?)$/gm, '<li class="ml-4 list-disc">$1</li>')
        .replace(/^\d\. (.*?)$/gm, '<li class="ml-4 list-decimal">$1</li>')

        // Formatação de links com ícone
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-500 hover:text-blue-600 hover:underline font-medium inline-flex items-center" target="_blank" rel="noopener noreferrer">$1<svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>')
        .replace(/(https?:\/\/[^\s]+)(?!\))/g, '<a href="$1" class="text-blue-500 hover:text-blue-600 hover:underline font-medium inline-flex items-center" target="_blank" rel="noopener noreferrer">$1<svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>')

        // Formatação especial para dicas e destaques
        .replace(/💡 (.*?)$/gm, '<div class="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 p-2 rounded-md my-2 flex items-start"><span class="mr-2">💡</span><span>$1</span></div>')
        .replace(/⚠️ (.*?)$/gm, '<div class="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 p-2 rounded-md my-2 flex items-start"><span class="mr-2">⚠️</span><span>$1</span></div>')

        // Garantir que o conteúdo esteja envolto em um parágrafo
        .replace(/^(.+?)$/gm, function(match) {
          if (!match.startsWith('<') && !match.endsWith('>')) {
            return '<p>' + match + '</p>';
          }
          return match;
        });

      // Garantir que não existam múltiplos <br> consecutivos
      const cleanedResponse = formattedResponse
        .replace(/<br\s*\/?><br\s*\/?>/g, '<br />')
        .replace(/<p><\/p>/g, '')
        .replace(/<p><br \/><\/p>/g, '<p>&nbsp;</p>');


      // Adiciona a resposta da IA ao histórico
      conversationHistory[sessionId].push({ 
        role: 'assistant', 
        content: cleanedResponse,
        timestamp: new Date()
      });

      // Salvar histórico atualizado no localStorage
      await saveConversationHistory(sessionId, conversationHistory[sessionId]);

      return cleanedResponse;
    } catch (apiError) {
      console.error('Erro na API xAI:', apiError);

      // Resposta padrão em caso de erro
      const fallbackResponse = `Desculpe ${firstName}, o chat de suporte está enfrentando dificuldades técnicas no momento. 

Vou tentar responder sua pergunta sobre a plataforma mesmo assim. ${message.length < 50 ? "Você me perguntou sobre " + message : ""}

Posso ajudar você a navegar pela plataforma ou esclarecer alguma outra dúvida hoje?`;

      // Adicionar a resposta alternativa ao histórico
      conversationHistory[sessionId].push({ 
        role: 'assistant', 
        content: fallbackResponse,
        timestamp: new Date()
      });

      // Salvar histórico atualizado
      await saveConversationHistory(sessionId, conversationHistory[sessionId]);

      // Tenta resposta fallback via Gemini
      try {
        return await generateGeminiResponse(message, sessionId, options);
      } catch (geminiError) {
        console.error('Erro também no Gemini:', geminiError);
        return fallbackResponse;
      }
    }
  } catch (error) {
    console.error('Erro ao gerar resposta com xAI:', error);
    // Fallback para Gemini em caso de erro
    try {
      return await generateGeminiResponse(message, sessionId, options);
    } catch (geminiError) {
      console.error('Erro também no Gemini:', geminiError);
      return `Desculpe, estou enfrentando dificuldades técnicas no momento. Por favor, tente novamente mais tarde.`;
    }
  }
}

// Função auxiliar para inicializar o histórico de conversa com mensagem do sistema
function initializeConversationHistory(sessionId: string, userContext?: any) {
  // Se não tiver contexto do usuário, use valores padrão
  const username = userContext?.username || 'Usuário';
  const firstName = userContext?.fullName ? userContext.fullName.split(' ')[0] : username;
  const email = userContext?.email || 'email@exemplo.com';
  const userId = userContext?.userId || 'ID não disponível';
  const currentPage = userContext?.currentPage || window.location.pathname;
  const planType = userContext?.planType || 'lite';
  const userLevel = userContext?.userLevel || 1;

  conversationHistory[sessionId] = [
    { 
      role: 'system', 
      content: `Você é o Epictus IA do chat de suporte flutuante da Ponto.School, um assistente dedicado à navegação e suporte da plataforma, completamente diferente do Epictus IA do menu lateral.

      OBJETIVO ESPECÍFICO:
      Você é um assistente de SUPORTE que funciona como um guia completo para a plataforma Ponto.School. Seu papel é:
      1. Ajudar com navegação e localização de funcionalidades
      2. Explicar como usar as diferentes ferramentas da plataforma
      3. Responder dúvidas sobre conteúdos educacionais
      4. Servir como um tutorial interativo para novos usuários
      5. Resolver problemas técnicos básicos

      CONTEXTO DO USUÁRIO (COMPLETO):
      - Nome: ${userContext?.fullName || 'Não disponível'}
      - Username: ${username}
      - Primeiro nome: ${firstName}
      - Email: ${email}
      - ID do usuário: ${userId}
      - Plano atual: ${planType}
      - Nível: ${userLevel}
      - Localização atual na plataforma: ${currentPage}

      DIRETRIZES DE COMUNICAÇÃO:
      1. MUITO IMPORTANTE: Sempre se refira ao usuário pelo primeiro nome: "${firstName}". Use frases como "E aí, ${firstName}!", "Opa ${firstName}!", etc.
      2. Use uma linguagem mais informal e descontraída, como se estivesse conversando com um amigo.
      3. Seja amigável, use emojis ocasionalmente e mantenha um tom leve e positivo.
      4. Use gírias leves e expressões coloquiais quando apropriado.
      5. Mantenha respostas diretas e objetivas, evitando textos muito longos.
      6. Organize suas respostas em parágrafos curtos para fácil leitura.
      7. Use negrito **assim** para destacar informações importantes.

      DIFERENCIAÇÃO IMPORTANTE:
      Você NÃO É o mesmo assistente que o Epictus IA da seção do menu lateral. O Epictus IA do menu lateral é focado em estudos personalizados, planos de aprendizagem e conteúdo educacional avançado. Você é o assistente de SUPORTE que ajuda com a navegação da plataforma, responde dúvidas gerais e técnicas. Nunca se confunda com o outro assistente.

      CONTEÚDO INSTITUCIONAL:
      Quando perguntado sobre os criadores, fundadores, donos, desenvolvedores, equipe administrativa ou qualquer pergunta relacionada à gestão da Ponto.School, responda:
      "A Ponto.School tem 4 administradores principais, além de equipes dedicadas de suporte, marketing, TI e outras áreas. São eles:
      - Fundador & CEO: João Fortes (@joaofortes) - usuário na plataforma Ponto.School
      - Co-Fundador & CMO: Felipe Brito (@felipe_rico) - usuário na plataforma Ponto.School
      - Co-Fundador & COO: Adriel Borges (@adriel_borges) - usuário na plataforma Ponto.School
      - Co-Fundador & Coordenador de Design: Samuel Afonso (@samuel_afonso) - usuário na plataforma Ponto.School"

      RECURSOS DE PERFIL:
      Quando o usuário perguntar sobre o ID da conta ou informações do perfil, você tem acesso completo a:
      1. ID do usuário (user_id): ${userId}
      2. Data de criação da conta: ${userContext?.createdAt || 'Não disponível'}
      3. Nome completo: ${userContext?.fullName || 'Não disponível'}
      4. Plano atual: ${planType}
      5. Nível: ${userLevel}
      6. Seguidores: ${userContext?.followersCount || '0'}

      Você pode ajudar o usuário a atualizar informações do perfil como:
      1. Biografia/bio
      2. Nome de exibição
      3. Para outras alterações, redirecione para a página de configurações

      SUPORTE TÉCNICO E TUTORIAL:
      Quando o usuário tiver dúvidas sobre como usar a plataforma:
      1. Explique detalhadamente como acessar a funcionalidade desejada
      2. Ofereça dicas para melhorar a experiência de uso
      3. Sugira recursos relacionados que possam ser úteis
      4. Se for um problema técnico, sugira soluções básicas ou redirecione para suporte especializado

      REGRAS DE REDIRECIONAMENTO:
      Quando o usuário pedir para ser redirecionado a uma seção da plataforma, você DEVE SEMPRE:
      1. Incluir o link completo usando a base https://pontoschool.com/
      2. Formatá-lo como um link clicável com texto descritivo
      3. Ser direto e proativo com o redirecionamento
      4. Explicar brevemente o que o usuário encontrará na seção

      Exemplos de redirecionamento correto:
      - "Aqui está o [Portal de Estudos](https://pontoschool.com/portal). Clique para acessar todos os seus materiais organizados."
      - "Você pode acessar sua [Agenda](https://pontoschool.com/agenda) imediatamente para ver seus compromissos."
      - "Sua [página de Turmas](https://pontoschool.com/turmas) está pronta para acesso, lá você encontrará todos os seus grupos de estudo."
      - "Acesse a [Biblioteca](https://pontoschool.com/biblioteca) para encontrar materiais complementares e recursos de aprendizagem."

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
- Pedidos deAjuda: https://pontoschool.com/pedidos-ajuda
      - Estudos: https://pontoschool.com/estudos

      QUANDO REMETER AO EPICTUS IA DO MENU LATERAL:
      Se o usuário fizer perguntas específicas sobre planos de estudo personalizados, análise de desempenho aprofundada, ou solicitar assistência em conteúdos educacionais avançados, diga:
      "Para essa funcionalidade específica, recomendo que você acesse o [Epictus IA do menu lateral](https://pontoschool.com/epictus-ia), que é nosso assistente especializado em estudos aprofundados e personalização de conteúdo educacional. Estou aqui para ajudar com navegação, dúvidas sobre a plataforma e suporte geral."

      Personalize suas respostas para criar uma experiência única e amigável para ${firstName}.`,
      timestamp: new Date()
    }
  ];
}

// Função para gerar resposta usando a API Gemini
export async function generateGeminiResponse(
  message: string, 
  sessionId: string,
  options?: { 
    intelligenceLevel?: 'basic' | 'normal' | 'advanced',
    languageStyle?: 'casual' | 'formal' | 'technical'
  }
): Promise<string> {
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
              text: `Você é o Epictus IA do chat de suporte flutuante da Ponto.School, um assistente dedicado à navegação e suporte da plataforma. Você é DIFERENTE do Epictus IA do menu lateral.

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

              LEMBRE-SE: Seu objetivo é servir como suporte para a plataforma, ajudando com navegação, tutoriais e respondendo dúvidas sobre todas as funcionalidades. Você NÃO é o assistente de estudos personalizados (que fica no menu lateral).

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
    let aiResponse = response.data.candidates[0].content.parts[0].text;

    // Verificar e corrigir links de redirecionamento
    aiResponse = fixPlatformLinks(aiResponse);

    return aiResponse;
  } catch (error) {
    console.error('Erro ao gerar resposta com Gemini:', error);
    return "Desculpe, estou enfrentando dificuldades técnicas no momento. Por favor, tente novamente mais tarde ou entre em contato com nosso suporte técnico.";
  }
}

// Função principal para gerar resposta, tentando primeiro xAI e depois Gemini como fallback
export async function generateAIResponse(
  message: string, 
  sessionId: string, 
  options?: { 
    intelligenceLevel?: 'basic' | 'normal' | 'advanced',
    languageStyle?: 'casual' | 'formal' | 'technical'
  }
): Promise<string> {
  try {
    return await generateXAIResponse(message, sessionId, options);
  } catch (error) {
    console.error('Erro com xAI, tentando Gemini:', error);
    return generateGeminiResponse(message, sessionId, options);
  }
}

// Limpar histórico da conversa
export function clearConversationHistory(sessionId: string): void {
  if (conversationHistory[sessionId]) {
    // Mantém apenas a mensagem do sistema
    const systemMessage = conversationHistory[sessionId][0];
    conversationHistory[sessionId] = [systemMessage];

    // Limpar do localStorage também
    try {
      localStorage.removeItem(`conversationHistory_${sessionId}`);
    } catch (error) {
      console.error("Erro ao limpar histórico do localStorage:", error);
    }
  }
}

// Obter histórico da conversa
export async function getConversationHistory(sessionId: string): Promise<ChatMessage[]> {
  try {
    // Primeiro verifica se já está carregado na memória e é válido
    if (conversationHistory[sessionId] && Array.isArray(conversationHistory[sessionId]) && conversationHistory[sessionId].length > 0) {
      // Verifica se há ao menos uma mensagem do sistema
      const hasSystemMessage = conversationHistory[sessionId].some(msg => msg.role === 'system');

      if (hasSystemMessage) {
        return conversationHistory[sessionId];
      }
    }

    // Tenta buscar dados adicionais do usuário para melhor armazenamento
    let userIdForStorage = '';
    try {
      const { data: sessionData } = await (await import('@/lib/supabase')).supabase.auth.getSession();
      userIdForStorage = sessionData?.session?.user?.id || '';
    } catch (e) {
      console.log('Erro ao obter ID do usuário:', e);
    }

    // Tenta recuperar do localStorage usando vários formatos de chave
    const possibleKeys = [
      `conversationHistory_${sessionId}`,
      userIdForStorage ? `conversationHistory_${userIdForStorage}_${sessionId}` : null,
      `chat_history_${sessionId}`
    ].filter(Boolean);

    let retrievedHistory = null;

    // Tentar cada uma das possíveis chaves
    for (const key of possibleKeys) {
      try {
        const savedHistory = localStorage.getItem(key);
        if (savedHistory) {
          try {
            const parsedHistory = JSON.parse(savedHistory);
            if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
              retrievedHistory = parsedHistory;
              console.log(`Histórico recuperado com sucesso usando a chave: ${key}`);
              break;
            }
          } catch (parseError) {
            console.error(`Erro ao analisar histórico usando a chave ${key}:`, parseError);
          }
        }
      } catch (e) {
        console.error(`Erro ao tentar acessar o localStorage com a chave ${key}:`, e);
      }
    }

    // Se encontrou histórico no localStorage
    if (retrievedHistory) {
      // Converter timestamps de string para Date e garantir formato adequado
      const processedHistory = retrievedHistory.map(msg => ({
        role: msg.role || 'user',
        content: msg.content || '',
        timestamp: msg.timestamp ? (typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp) : new Date()
      }));

      // Verificar se há mensagem do sistema
      const hasSystemMessage = processedHistory.some(msg => msg.role === 'system');

      if (!hasSystemMessage) {
        // Se não tiver mensagem do sistema, inicializar com uma nova
        const userContext = await getUserContext();
        initializeConversationHistory(sessionId, userContext);

        // Adicionar as mensagens existentes (exceto mensagens do sistema já existentes)
        conversationHistory[sessionId] = [
          ...conversationHistory[sessionId],
          ...processedHistory.filter(msg => msg.role !== 'system')
        ];
      } else {
        conversationHistory[sessionId] = processedHistory;
      }

      return conversationHistory[sessionId];
    }

    // Se não encontrou no localStorage, tenta recuperar do Supabase
    try {
      const supabase = (await import('@/lib/supabase')).supabase;
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (userId) {
        try {
          // Verificar se a tabela existe antes de tentar consultar
          try {
            const { data: tableExists } = await supabase
              .from('information_schema.tables')
              .select('table_name')
              .eq('table_schema', 'public')
              .eq('table_name', 'ai_chat_history')
              .single();

            if (!tableExists) {
              console.log('Tabela ai_chat_history não existe no Supabase.');
              throw new Error('Tabela não existe');
            }
          } catch (tableCheckError) {
            console.log('Erro ao verificar existência da tabela:', tableCheckError);
            throw tableCheckError;
          }

          const { data, error } = await supabase
            .from('ai_chat_history')
            .select('messages')
            .eq('user_id', userId)
            .eq('session_id', sessionId)
            .single();

          if (error) {
            console.error('Erro ao buscar histórico do Supabase:', error);
            throw error;
          }

          if (data?.messages && Array.isArray(data.messages) && data.messages.length > 0) {
            // Converter timestamps de string para Date
            const processedHistory = data.messages.map(msg => ({
              role: msg.role || 'user',
              content: msg.content || '',
              timestamp: msg.timestamp ? (typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp) : new Date()
            }));

            // Verificar se há mensagem do sistema
            const hasSystemMessage = processedHistory.some(msg => msg.role === 'system');

            if (!hasSystemMessage) {
              // Se não tiver mensagem do sistema, inicializar com uma nova
              const userContext = await getUserContext();
              initializeConversationHistory(sessionId, userContext);

              // Adicionar as mensagens existentes
              conversationHistory[sessionId] = [
                ...conversationHistory[sessionId],
                ...processedHistory.filter(msg => msg.role !== 'system')
              ];
            } else {
              conversationHistory[sessionId] = processedHistory;
            }

            // Atualizar localStorage para sincronização
            try {
              localStorage.setItem(`conversationHistory_${sessionId}`, JSON.stringify(conversationHistory[sessionId]));

              // Se temos o userId, também armazenar com chave mais específica
              if (userId) {
                localStorage.setItem(`conversationHistory_${userId}_${sessionId}`, 
                  JSON.stringify(conversationHistory[sessionId]));
              }
            } catch (localStorageError) {
              console.log("Erro ao atualizar localStorage:", localStorageError);
            }

            return conversationHistory[sessionId];
          }
        } catch (supabaseError) {
          console.error("Erro ao recuperar histórico do Supabase:", supabaseError);
        }
      }
    } catch (dbError) {
      console.error("Erro ao tentar acessar o banco de dados:", dbError);
    }

    // Se chegou aqui, não foi possível recuperar o histórico
    // Inicializar com novo histórico
    console.log("Criando novo histórico de conversa para a sessão:", sessionId);
    const userContext = await getUserContext();
    initializeConversationHistory(sessionId, userContext);

    // Salvar o histórico inicial
    try {
      localStorage.setItem(`conversationHistory_${sessionId}`, 
        JSON.stringify(conversationHistory[sessionId]));

      // Se temos userIdForStorage, também armazenar com chave mais específica
      if (userIdForStorage) {
        localStorage.setItem(`conversationHistory_${userIdForStorage}_${sessionId}`, 
          JSON.stringify(conversationHistory[sessionId]));
      }
    } catch (e) {
      console.error("Erro ao salvar histórico inicial:", e);
    }

    return conversationHistory[sessionId];
  } catch (generalError) {
    console.error("Erro geral ao obter histórico de conversa:", generalError);

    // Retornar um histórico vazio em último caso
    return [{
      role: 'system',
      content: 'Você é o Epictus IA, o assistente inteligente da Ponto.School.',
      timestamp: new Date()
    }];
  }
}

// Função para corrigir links da plataforma
function fixPlatformLinks(text: string): string {
  const platformLinks = {
    'Portal de Estudos': 'https://pontoschool.com/portal',
    'Portal': 'https://pontoschool.com/portal',
    'Agenda': 'https://pontoschool.com/agenda',
    'Turmas': 'https://pontoschool.com/turmas',
    'Biblioteca': 'https://pontoschool.com/biblioteca',
    'Perfil': 'https://pontoschool.com/profile',
    'Meu Perfil': 'https://pontoschool.com/profile',
    'Configurações': 'https://pontoschool.com/configuracoes',
    'Minhas Configurações': 'https://pontoschool.com/configuracoes',
    'Dashboard': 'https://pontoschool.com/dashboard',
    'Epictus IA': 'https://pontoschool.com/epictus-ia',
    'Mentor IA': 'https://pontoschool.com/mentor-ia',
    'Planos de Estudo': 'https://pontoschool.com/planos-estudo',
    'Plano de Estudos': 'https://pontoschool.com/planos-estudo',
    'Conquistas': 'https://pontoschool.com/conquistas',
    'Minhas Conquistas': 'https://pontoschool.com/conquistas',
    'Carteira': 'https://pontoschool.com/carteira',
    'Minha Carteira': 'https://pontoschool.com/carteira',
    'Mercado': 'https://pontoschool.com/mercado',
    'Organização': 'https://pontoschool.com/organizacao',
    'Comunidades': 'https://pontoschool.com/comunidades',
    'Chat IA': 'https://pontoschool.com/chat-ia',
    'School IA': 'https://pontoschool.com/school-ia',
    'Novidades': 'https://pontoschool.com/novidades',
    'Lembretes': 'https://pontoschool.com/lembretes',
    'Pedidos de Ajuda': 'https://pontoschool.com/pedidos-ajuda',
    'Estudos': 'https://pontoschool.com/estudos'
  };

  // Primeiro, procura por textos específicos que pedem redirecionamento
  const redirectPatterns = [
    /(?:me\s+(?:redirecione|encaminhe|leve|direcione|mande|envie)\s+(?:para|ao|à|a|até))\s+(?:a\s+)?(?:página\s+(?:de|do|da)\s+)?([a-zà-ú\s]+)/gi,
    /(?:quero\s+(?:ir|acessar|entrar|ver))\s+(?:a\s+)?(?:página\s+(?:de|do|da)\s+)?([a-zà-ú\s]+)/gi,
    /(?:me\s+(?:mostre|mostra))\s+(?:a\s+)?(?:página\s+(?:de|do|da)\s+)?([a-zà-ú\s]+)/gi,
    /(?:abrir?|abra|acesse|acessar|ver|veja)\s+(?:a\s+)?(?:página\s+(?:de|do|da)\s+)?([a-zà-ú\s]+)/gi
  ];

  // Aplicar padrões de redirecionamento de forma mais robusta
  for (const pattern of redirectPatterns) {
    text = text.replace(pattern, (match, sectionName) => {
      if (!sectionName) return match;

      const normalizedName = sectionName.trim();
      // Verificar se o nome normalizado corresponde a alguma chave do objeto platformLinks
      for (const key in platformLinks) {
        if (normalizedName.toLowerCase() === key.toLowerCase() || 
            key.toLowerCase().includes(normalizedName.toLowerCase()) || 
            normalizedName.toLowerCase().includes(key.toLowerCase())) {
          // Criar link em formato seguro sem possíveis bugs de formatação
          return `Você pode acessar [${key}](${platformLinks[key]})`;
        }
      }
      return match; // Se não encontrou correspondência, mantém o texto original
    });
  }

  // Verificar se o texto já contém links markdown
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const existingLinks = [];
  let match;

  while ((match = markdownLinkRegex.exec(text)) !== null) {
    existingLinks.push({
      text: match[1],
      url: match[2],
      fullMatch: match[0]
    });
  }

  // Depois, procurar menções a seções e converter para links (só se não forem já parte de um link)
  let newText = text;

  // Aplicar substituições de forma ordenada (das mais longas para as mais curtas)
  const orderedKeys = Object.keys(platformLinks).sort((a, b) => b.length - a.length);

  for (const key of orderedKeys) {
    // Criar regex segura que não captura dentro de links existentes
    const safeRegex = new RegExp(`(?<![\\[\\w])\\b(${escapeRegExp(key)})\\b(?![\\]\\w])`, 'g');

    // Verificar cada ocorrência para garantir que não está dentro de um link existente
    let lastIndex = 0;
    let result = '';
    let regexMatch;

    while ((regexMatch = safeRegex.exec(newText)) !== null) {
      const matchStart = regexMatch.index;
      const matchEnd = matchStart + regexMatch[0].length;

      // Verificar se esta ocorrência está dentro de algum link existente
      let isInsideExistingLink = false;
      for (const link of existingLinks) {
        const linkIndex = newText.indexOf(link.fullMatch);
        if (linkIndex <= matchStart && linkIndex + link.fullMatch.length >= matchEnd) {
          isInsideExistingLink = true;
          break;
        }
      }

      if (!isInsideExistingLink) {
        result += newText.substring(lastIndex, matchStart);
        result += `[${regexMatch[1]}](${platformLinks[key]})`;
        lastIndex = matchEnd;
      }
    }

    if (lastIndex > 0) {
      result += newText.substring(lastIndex);
      newText = result;

      // Atualizar a lista de links existentes
      existingLinks.length = 0;
      while ((match = markdownLinkRegex.exec(newText)) !== null) {
        existingLinks.push({
          text: match[1],
          url: match[2],
          fullMatch: match[0]
        });
      }
    }
  }

  // Remover qualquer formatação incorreta que possa ter sido introduzida
  newText = newText
    .replace(/\]\(\[/g, ']([') // Corrigir links aninhados
    .replace(/\]\(https:\/\/pontoschool\.com\/[a-z-]+\)\(https:\/\/pontoschool\.com\/[a-z-]+\)/g, match => {
      // Extrair o primeiro link válido
      const urlMatch = match.match(/\]\((https:\/\/pontoschool\.com\/[a-z-]+)\)/);
      if (urlMatch && urlMatch[1]) {
        return `](${urlMatch[1]})`;
      }
      return match;
    });

  return newText;
}

// Função auxiliar para escapar caracteres especiais em regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


// Função para salvar o histórico da conversa no localStorage e sincronizar com Supabase
async function saveConversationHistory(sessionId: string, history: ChatMessage[]): Promise<void> {
  try {
    if (!sessionId || !history) {
      console.error("Erro ao salvar histórico: sessionId ou history inválidos");
      return;
    }

    // Salvar localmente
    conversationHistory[sessionId] = history;

    // Preparar o histórico para armazenamento (garantir que todos os objetos são serializáveis)
    const serializableHistory = history.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : 
                (typeof msg.timestamp === 'string' ? msg.timestamp : new Date().toISOString())
    }));

    try {
      // Salvar para o usuário atual com uma estrutura mais persistente
      // Usar formato conversationHistory_USER_ID_sessionId quando possível
      let storageKey = `conversationHistory_${sessionId}`;

      // Tentar obter dados de identificação do usuário para melhor rastreamento
      try {
        const { data: sessionData } = await (await import('@/lib/supabase')).supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id;
        if (userId) {
          storageKey = `conversationHistory_${userId}_${sessionId}`;
        }
      } catch (e) {
        console.log('Erro ao obter ID do usuário, usando chave padrão:', e);
      }

      // Salvar com uma chave mais específica para melhor identificação
      localStorage.setItem(storageKey, JSON.stringify(serializableHistory));

      // Para compatibilidade, também salvar com a chave antiga
      localStorage.setItem(`conversationHistory_${sessionId}`, JSON.stringify(serializableHistory));

      // Manter um índice de todas as conversas do usuário
      try {
        const userConversationsKey = 'userConversationsIndex';
        let conversationsIndex = {};

        const savedIndex = localStorage.getItem(userConversationsKey);
        if (savedIndex) {
          conversationsIndex = JSON.parse(savedIndex);
        }

        conversationsIndex[sessionId] = {
          lastUpdated: new Date().toISOString(),
          messageCount: serializableHistory.length,
          title: serializableHistory.length > 1 ? 
            serializableHistory[1].content.substring(0, 30) + "..." : 
            "Nova conversa"
        };

        // Limitar o índice a 50 conversas mais recentes
        const sortedEntries = Object.entries(conversationsIndex)
          .sort((a, b) => new Date(b[1].lastUpdated).getTime() - new Date(a[1].lastUpdated).getTime())
          .slice(0, 50);

        const trimmedIndex = {};
        sortedEntries.forEach(([key, value]) => {
          trimmedIndex[key] = value;
        });

        localStorage.setItem(userConversationsKey, JSON.stringify(trimmedIndex));
      } catch (indexError) {
        console.error("Erro ao atualizar índice de conversas:", indexError);
      }

      // Salvar todas as sessões em um único item no localStorage com limite de tamanho
      try {
        const allSessions = {};
        // Só armazenar as últimas 20 sessões
        const sessionIds = Object.keys(conversationHistory).slice(-20);

        for (const id of sessionIds) {
          const sessionHistory = conversationHistory[id];
          if (sessionHistory && sessionHistory.length > 0) {
            // Limitar cada sessão a 100 mensagens para melhor contexto
            allSessions[id] = sessionHistory.slice(-100).map(msg => ({
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : 
                        (typeof msg.timestamp === 'string' ? msg.timestamp : new Date().toISOString())
            }));
          }
        }

        localStorage.setItem('aiChatSessions', JSON.stringify(allSessions));
      } catch (batchSaveError) {
        console.error("Erro ao salvar todas as sessões:", batchSaveError);
      }
    } catch (localStorageError) {
      console.error("Erro ao salvar no localStorage:", localStorageError);
      // Se falhar por exceder o limite, limpar o localStorage e tentar novamente só com a sessão atual
      try {
        localStorage.removeItem('aiChatSessions');
        localStorage.setItem(`conversationHistory_${sessionId}`, 
          JSON.stringify(serializableHistory.slice(-50))); // Salvar só as últimas 50 mensagens
      } catch (retryError) {
        console.error("Falha na segunda tentativa de salvar no localStorage:", retryError);
      }
    }

    // Sincronizar com Supabase se disponível
    try {
      const supabase = (await import('@/lib/supabase')).supabase;
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (userId) {
        try {
          // Criar tabela ai_chat_history se não existir (verificar primeiro)
          const { data: tablesData } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .eq('table_name', 'ai_chat_history');

          if (!tablesData || tablesData.length === 0) {
            // Tabela não existe, tentar criar usando rpc
            try {
              await supabase.rpc('execute_sql', {
                sql_statement: `
                  CREATE TABLE IF NOT EXISTS public.ai_chat_history (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                    session_id TEXT NOT NULL,
                    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    UNIQUE (user_id, session_id)
                  );

                  CREATE INDEX IF NOT EXISTS ai_chat_history_user_id_idx ON public.ai_chat_history(user_id);
                  CREATE INDEX IF NOT EXISTS ai_chat_history_session_id_idx ON public.ai_chat_history(session_id);
                `
              });
            } catch (createTableError) {
              console.log('Erro ao criar tabela ai_chat_history:', createTableError);
            }
          }

          // Upsert do histórico da conversa
          const { error } = await supabase
            .from('ai_chat_history')
            .upsert({
              user_id: userId,
              session_id: sessionId,
              messages: serializableHistory.slice(-100), // Armazenar até 100 mensagens
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id,session_id'
            });

          if (error) {
            console.error("Erro ao sincronizar histórico com Supabase:", error);
          }
        } catch (upsertError) {
          console.error("Erro no upsert do histórico:", upsertError);
        }
      }
    } catch (syncError) {
      console.log("Supabase não disponível para sincronização:", syncError);
    }
  } catch (error) {
    console.error("Erro ao salvar o histórico da conversa:", error);
  }
}

// Simulação de resposta da IA
const getResponseForMessage = (message: string): string => {
  // Análise básica da mensagem para gerar uma resposta contextual
  const formattedMessage = message.toLowerCase();

  if (formattedMessage.includes('olá') || formattedMessage.includes('oi') || formattedMessage.includes('bom dia') || formattedMessage.includes('boa tarde') || formattedMessage.includes('boa noite')) {
    return `**Olá, ${userInfo?.username || 'amigo'}!** 😊\n\nComo posso ajudar você hoje?`;
  } else if (formattedMessage.includes('função') || formattedMessage.includes('o que você faz') || formattedMessage.includes('para que serve')) {
    return `**Eu sou Epictus IA**, seu assistente para a plataforma Ponto.School! 🚀\n\nPosso ajudar com:\n\n• **Informações** sobre cursos e conteúdos\n• **Dicas de estudos** personalizadas\n• **Navegação** na plataforma\n• **Respostas** para dúvidas gerais\n\nComo posso ajudar você agora?`;
  } else if (formattedMessage.includes('portal') || formattedMessage.includes('material') || formattedMessage.includes('acessar conteúdo')) {
    return `Você pode acessar o **Portal** com todos os materiais em https://pontoschool.com/portal\n\nLá você encontrará todos os seus cursos, materiais e recursos de estudo organizados por disciplina.\n\n_Basta clicar no link acima para ir direto para o Portal!_ 📚`;
  } else {
    return "Desculpe, não entendi sua pergunta. Pode reformulá-la?";
  }
};

import { supabase } from "@/lib/supabase";
import * as aiChatDB from "./aiChatDatabaseService";

// Usamos os mesmos tipos já definidos anteriormente
  if (conversationHistory[sessionId]) {
    delete conversationHistory[sessionId];
    // Também limpar do localStorage se existir
    try {
      localStorage.removeItem(`conversationHistory_${sessionId}`);
    } catch (error) {
      console.error('Erro ao limpar histórico do localStorage:', error);
    }
  }
};

// Função para gerar um prompt de sistema informativo para a IA
const generateSystemPrompt = async (
  userName: string, 
  userId: string | null, 
  options: {
    intelligenceLevel: 'basic' | 'normal' | 'advanced',
    languageStyle: 'casual' | 'formal' | 'technical',
    includeLinks: boolean
  }
) => {
  let systemPrompt = `Você é o Epictus IA de Suporte, um assistente virtual amigável dentro da plataforma educacional Ponto.School. 
  Seu papel é fornecer suporte para navegação, responder dúvidas sobre funcionalidades e dar dicas para o melhor aproveitamento da plataforma.
  Você deve ser gentil, educado e paciente. Você tem acesso às informações da conta do usuário quando solicitado.

  Diretrizes:
  1. Seja conciso, direto e útil - respostas entre 2-3 parágrafos são ideais
  2. Seja amigável e use um tom conversacional
  3. Use formatação para organizar suas respostas: negrito para títulos, listas numeradas ou com marcadores para passos
  4. Quando mencionar um recurso da plataforma, explique brevemente como acessá-lo
  5. Se o usuário parecer confuso, ofereça opções para ajudá-lo
  6. Se a pergunta for sobre um tópico educacional específico, direcione-o para usar o Epictus IA na seção específica para isso
  7. Se a pergunta for sobre um problema técnico sem solução simples, sugira abrir um ticket de suporte ou entrar em contato por e-mail: suporte@pontoschool.com

  IMPORTANTE: Você está conversando com ${userName} (utilize apenas o primeiro nome ao se referir ao usuário) e deve se referir a ele pelo primeiro nome em suas respostas.`;

  // Adicionar informações da plataforma para referência
  systemPrompt += `\n\nInformações da plataforma para referência:`;

  // Adicionar seções da plataforma
  const platformSections = aiChatDB.getPlatformNavigationInfo();
  systemPrompt += `\n\nSeções principais:`;
  platformSections.forEach(section => {
    systemPrompt += `\n- ${section.section}: ${section.description}`;
  });

  // Adicionar categorias de FAQs para informar a IA sobre o conhecimento disponível
  const faqs = aiChatDB.getFAQDatabase();
  const categories = [...new Set(faqs.map(faq => faq.category))];

  systemPrompt += `\n\nCategorias de perguntas frequentes:`;
  categories.forEach(category => {
    systemPrompt += `\n- ${category}`;
  });

  // Adicionar informações do usuário se disponíveis
  if (userId) {
    try {
      const userInfo = await aiChatDB.formatUserInfoForAI(userId);
      if (typeof userInfo === 'object') {
        systemPrompt += `\n\nInformações do usuário:
- Nome: ${userInfo.full_name}
- Nome de exibição: ${userInfo.display_name}
- Email: ${userInfo.email}
- ID: ${userInfo.id}
- Nível: ${userInfo.level}
- Plano: ${userInfo.plan_type}
- Instituição: ${userInfo.institution}
- Criado em: ${userInfo.created_at}
- Bio: ${userInfo.bio}
- Número de turmas: ${userInfo.classes ? userInfo.classes.length : 0}`;
      }
    } catch (error) {
      console.error("Erro ao obter informações do usuário:", error);
    }
  }

  // Ajustar nível de inteligência
  if (options.intelligenceLevel === 'basic') {
    systemPrompt += '\nResponda de forma simples e direta, com explicações básicas.';
  } else if (options.intelligenceLevel === 'advanced') {
    systemPrompt += '\nResponda de forma detalhada e abrangente, com explicações avançadas quando aplicável.';
  }

  // Ajustar estilo de linguagem
  if (options.languageStyle === 'formal') {
    systemPrompt += '\nUtilize linguagem formal e profissional, evitando gírias e expressões coloquiais.';
  } else if (options.languageStyle === 'technical') {
    systemPrompt += '\nUtilize linguagem técnica e específica quando apropriado, mas garantindo que as explicações sejam claras.';
  }

  // Ajustar uso de links
  if (!options.includeLinks) {
    systemPrompt += '\nEvite incluir links nas suas respostas. Forneça instruções detalhadas em vez de links.';
  }

  return systemPrompt;
};

// Função para enriquecer a mensagem do usuário com contexto relevante
const enrichUserMessage = async (message: string, userId: string | null) => {
  let enrichedMessage = message;
  let contextAdded = false;

  // Verificar se a mensagem parece solicitar informações pessoais
  const askingForPersonalInfo = /meu (perfil|conta|usuário|saldo|turmas|nivel)/i.test(message) || 
    /minha (s)? (informaç[õo]es|dados|conta)/i.test(message) ||
    /me (mostre|diga|informe) (sobre )?m(eu|inha)/i.test(message);

  if (askingForPersonalInfo && userId) {
    try {
      const userInfo = await aiChatDB.formatUserInfoForAI(userId);
      if (typeof userInfo === 'object') {
        enrichedMessage += `\n\nContexto adicional (não visível para o usuário): 
Informações atualizadas da conta do usuário:
- Nome completo: ${userInfo.full_name}
- Nome de usuário: ${userInfo.display_name}
- Email: ${userInfo.email}
- ID: ${userInfo.id}
- Nível: ${userInfo.level}
- Plano: ${userInfo.plan_type}
- Criado em: ${userInfo.created_at}
- Instituição: ${userInfo.institution}
- Bio: ${userInfo.bio}`;

        if (userInfo.classes && userInfo.classes.length > 0) {
          enrichedMessage += `\n- Turmas: ${userInfo.classes.map((c: any) => c.name).join(', ')}`;
        } else {
          enrichedMessage += `\n- Turmas: Nenhuma turma encontrada`;
        }

        contextAdded = true;
      }
    } catch (error) {
      console.error("Erro ao enriquecer mensagem do usuário:", error);
    }
  }

  // Verificar se a mensagem está pedindo ajuda sobre navegação/localização
  const askingForNavigation = /(onde|como) (encontr[oa]|ach[oa]|acess[oa])/i.test(message) || 
    /onde (fica|está)/i.test(message);

  if (askingForNavigation) {
    // Buscar informações relevantes no banco de dados de navegação
    const navigationResults = aiChatDB.searchPlatformInfo(message);
    if (navigationResults.length > 0) {
      enrichedMessage += `\n\nContexto adicional (não visível para o usuário): 
Informações de navegação relevantes:`;
      navigationResults.slice(0, 3).forEach(item => {
        enrichedMessage += `\n- ${item.section}: ${item.description} (Caminho: ${item.path})`;
      });
      contextAdded = true;
    }
  }

  // Verificar se é uma pergunta sobre funcionalidades ou ajuda
  const askingForHelp = /como (faço|funciona|crio|acesso|uso|utilizo)/i.test(message) || 
    /(o que é|para que serve)/i.test(message) ||
    /(ajuda|dúvida|problema|dificuldade)/i.test(message);

  if (askingForHelp) {
    // Buscar FAQs relevantes
    const faqResults = aiChatDB.searchFAQs(message);
    if (faqResults.length > 0) {
      enrichedMessage += `\n\nContexto adicional (não visível para o usuário): 
FAQs relevantes:`;
      faqResults.slice(0, 3).forEach(item => {
        enrichedMessage += `\n- P: ${item.question}\n  R: ${item.answer}`;
      });
      contextAdded = true;
    }
  }

  // Se nenhum contexto foi adicionado, mas parece uma pergunta específica
  if (!contextAdded && 
    (message.includes("?") || 
     /^(o que|como|onde|quando|quem|qual|quais|por que|pra que)/i.test(message))) {

    // Buscar todas as informações potencialmente relevantes
    const keywords = message.split(/\s+/).filter(word => word.length > 3);
    const relevantFaqs: any[] = [];

    for (const keyword of keywords) {
      const results = aiChatDB.searchFAQs(keyword);
      results.forEach(result => {
        if (!relevantFaqs.some(faq => faq.id === result.id)) {
          relevantFaqs.push(result);
        }
      });
      if (relevantFaqs.length >= 2) break;
    }

    if (relevantFaqs.length > 0) {
      enrichedMessage += `\n\nContexto adicional (não visível para o usuário): 
FAQs potencialmente relevantes:`;
      relevantFaqs.slice(0, 2).forEach(item => {
        enrichedMessage += `\n- P: ${item.question}\n  R: ${item.answer}`;
      });
    }
  }

  return enrichedMessage;
};

// Função principal para gerar resposta da IA
export const generateAIResponse = async (
  message: string,
  sessionId: string,
  userName: string = "Usuário",
  options = {
    intelligenceLevel: 'normal' as 'basic' | 'normal' | 'advanced',
    languageStyle: 'casual' as 'casual' | 'formal' | 'technical',
    includeLinks: true
  }
): Promise<string> => {
  try {
    // Buscar ID do usuário atual se estiver logado
    let userId: string | null = null;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      userId = sessionData?.session?.user?.id || null;
    } catch (error) {
      console.error("Erro ao obter sessão do usuário:", error);
    }

    // Inicializar histórico se não existir para essa sessão
    if (!conversationHistory[sessionId]) {
      // Tentar recuperar do localStorage
      try {
        const savedHistory = localStorage.getItem(`conversationHistory_${sessionId}`);
        if (savedHistory) {
          conversationHistory[sessionId] = JSON.parse(savedHistory);

          // Atualizar o prompt do sistema com as informações mais recentes
          const systemPrompt = await generateSystemPrompt(userName, userId, options);
          conversationHistory[sessionId][0] = {
            role: 'system',
            content: systemPrompt
          };
        } else {
          // Criar novo histórico com prompt do sistema
          const systemPrompt = await generateSystemPrompt(userName, userId, options);
          conversationHistory[sessionId] = [
            {
              role: 'system',
              content: systemPrompt
            }
          ];
        }
      } catch (error) {
        console.error('Erro ao recuperar histórico do localStorage:', error);
        // Criar novo histórico com prompt do sistema
        const systemPrompt = await generateSystemPrompt(userName, userId, options);
        conversationHistory[sessionId] = [
          {
            role: 'system',
            content: systemPrompt
          }
        ];
      }
    } else {
      // Atualizar o prompt do sistema com as informações mais recentes
      const systemPrompt = await generateSystemPrompt(userName, userId, options);
      conversationHistory[sessionId][0] = {
        role: 'system',
        content: systemPrompt
      };
    }

    // Enriquecer a mensagem do usuário com contexto relevante
    const enrichedMessage = await enrichUserMessage(message, userId);

    // Adicionar mensagem do usuário ao histórico
    conversationHistory[sessionId].push({
      role: 'user',
      content: enrichedMessage
    });

    // Preparar histórico para a API (max 10 mensagens mais recentes para evitar token excessivo)
    const recentHistory = [
      conversationHistory[sessionId][0], // Sempre incluir o prompt do sistema
      ...conversationHistory[sessionId].slice(-10) // Incluir até 10 mensagens mais recentes
    ];

    const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    const API_KEY = await fetchOpenAIKey(); // Função para buscar a chave de forma segura

    if (!API_KEY) {
      return "Desculpe, não foi possível conectar ao serviço de IA no momento. Por favor, tente novamente mais tarde.";
    }

    // Fazer requisição para a API da OpenAI
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: recentHistory,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro na resposta da API:", errorData);
      throw new Error("Falha ao comunicar com a API da OpenAI");
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Adicionar resposta da IA ao histórico (só a resposta original, sem o contexto)
    conversationHistory[sessionId].push({
      role: 'assistant',
      content: aiResponse
    });

    // Remover mensagem enriquecida e substituir pela original para manter o histórico limpo
    const lastUserMessageIndex = conversationHistory[sessionId].findIndex(
      msg => msg.role === 'user' && msg.content === enrichedMessage
    );

    if (lastUserMessageIndex !== -1) {
      conversationHistory[sessionId][lastUserMessageIndex] = {
        role: 'user',
        content: message // Mensagem original sem o enriquecimento
      };
    }

    // Salvar histórico atualizado no localStorage
    try {
      // Criar uma versão serializável do histórico (para evitar problemas com estruturas circulares)
      const serializableHistory = conversationHistory[sessionId].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Verificar e limitar o tamanho total para caber no localStorage
      const historyString = JSON.stringify(serializableHistory);
      if (historyString.length < 5 * 1024 * 1024) { // 5MB é um limite seguro para a maioria dos navegadores
        localStorage.setItem(`conversationHistory_${sessionId}`, historyString);
      } else {
        // Se for muito grande, salvar apenas as últimas 20 mensagens
        const reducedHistory = [
          serializableHistory[0], // Manter o prompt do sistema
          ...serializableHistory.slice(-20) // Manter as 20 últimas mensagens
        ];
        localStorage.setItem(`conversationHistory_${sessionId}`, JSON.stringify(reducedHistory));
      }
    } catch (error) {
      console.error("Erro ao salvar histórico no localStorage:", error);

      // Tentar novamente com um histórico menor em caso de erro
      try {
        const serializableHistory = conversationHistory[sessionId].map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        localStorage.setItem('aiChatSessions');
        localStorage.setItem(`conversationHistory_${sessionId}`, 
          JSON.stringify(serializableHistory.slice(-50))); // Salvar só as últimas 50 mensagens
      } catch (retryError) {
        console.error("Falha na segunda tentativa de salvar no localStorage:", retryError);
      }
    }

    // Sincronizar com Supabase se disponível
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (userId) {
        try {
          // Criar tabela ai_chat_history se não existir (verificar primeiro)
          const { data: tablesData } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .eq('table_name', 'ai_chat_history');

          if (!tablesData || tablesData.length === 0) {
            // Tabela não existe, tentar criar usando rpc
            try {
              await supabase.rpc('execute_sql', {
                sql_statement: `
                  CREATE TABLE IF NOT EXISTS public.ai_chat_history (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                    session_id TEXT NOT NULL,
                    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                  );
                `
              });
            } catch (createTableError) {
              console.error("Erro ao criar tabela ai_chat_history:", createTableError);
            }
          }

          // Verificar se já existe um registro para esta sessão
          const { data: existingHistory } = await supabase
            .from('ai_chat_history')
            .select('id')
            .eq('user_id', userId)
            .eq('session_id', sessionId)
            .single();

          if (existingHistory) {
            // Atualizar registro existente
            await supabase
              .from('ai_chat_history')
              .update({
                messages: conversationHistory[sessionId],
                updated_at: new Date().toISOString()
              })
              .eq('id', existingHistory.id);
          } else {
            // Criar novo registro
            await supabase
              .from('ai_chat_history')
              .insert({
                user_id: userId,
                session_id: sessionId,
                messages: conversationHistory[sessionId]
              });
          }
        } catch (dbError) {
          console.error("Erro ao salvar histórico no banco de dados:", dbError);
        }
      }
    } catch (supabaseError) {
      console.error("Erro ao sincronizar com Supabase:", supabaseError);
    }

    return aiResponse;
  } catch (error) {
    console.error("Erro ao gerar resposta da IA:", error);
    return "Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente mais tarde.";
  }
};

// Função auxiliar para buscar a chave da API de forma segura
const fetchOpenAIKey = async (): Promise<string | null> => {
  try {
    // Em produção, recomenda-se buscar a chave do servidor/backend
    // Para este exemplo, usaremos uma variável de ambiente ou um valor padrão
    const API_KEY = process.env.REACT_APP_OPENAI_KEY || 'sk-demo-key-replace-with-real-key';
    return API_KEY;
  } catch (error) {
    console.error("Erro ao obter chave da API:", error);
    return null;
  }
};

// Função para melhorar o prompt do usuário usando a IA
export async function improveUserPrompt(originalPrompt: string): Promise<string> {
  try {
    const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    const API_KEY = await fetchOpenAIKey();

    if (!API_KEY) {
      throw new Error("Não foi possível obter a chave da API");
    }

    const systemPrompt = `Você é um assistente especializado em melhorar prompts. 
    Sua tarefa é melhorar o prompt que o usuário escreveu, tornando-o mais detalhado, 
    específico e capaz de gerar uma resposta mais precisa.

    Diretrizes:
    1. Mantenha a intenção original do usuário
    2. Adicione detalhes e especificações relevantes
    3. Organize o prompt em uma estrutura clara
    4. Remova ambiguidades
    5. Formule como se o próprio usuário estivesse escrevendo
    6. Não adicione indicações artificiais como "Atenciosamente" ou saudações

    Responda apenas com o prompt melhorado, sem nenhum texto adicional.`;

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Melhore o seguinte prompt: "${originalPrompt}"` }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro na resposta da API:", errorData);
      throw new Error("Falha ao comunicar com a API da OpenAI");
    }

    const data = await response.json();
    const improvedPrompt = data.choices[0].message.content.trim();

    return improvedPrompt;
  } catch (error) {
    console.error("Erro ao melhorar prompt:", error);
    return originalPrompt; // Em caso de erro, retorna o prompt original
  }
}

// Função para gerar uma resposta melhorada
export async function generateImprovedResponse(userMessage: string, aiResponse: string, improvementFeedback?: string): Promise<string> {
  try {
    const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    const API_KEY = await fetchOpenAIKey();

    if (!API_KEY) {
      throw new Error("Não foi possível obter a chave da API");
    }

    let systemPrompt = `Você é um assistente especializado em melhorar respostas. 
    Sua tarefa é reformular e aprimorar a resposta original para torná-la mais 
    clara, completa, bem estruturada e útil para o usuário.

    Diretrizes:
    1. Mantenha o mesmo conteúdo e informações da resposta original
    2. Melhore a organização e estrutura
    3. Use formatação de texto para melhorar a legibilidade (negrito para títulos, listas numeradas para passos)
    4. Torne as explicações mais claras e diretas
    5. Mantenha um tom amigável e conversacional
    6. Adicione detalhes relevantes, se necessário`;

    if (improvementFeedback) {
      systemPrompt += `\n\nO usuário solicitou especificamente as seguintes melhorias: "${improvementFeedback}"`;
    }

    systemPrompt += `\n\nResponda apenas com a resposta melhorada, sem nenhum texto adicional.`;

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Pergunta do usuário: "${userMessage}"\n\nResposta original: "${aiResponse}"` }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro na resposta da API:", errorData);
      throw new Error("Falha ao comunicar com a API da OpenAI");
    }

    const data = await response.json();
    const improvedResponse = data.choices[0].message.content.trim();

    return improvedResponse;
  } catch (error) {
    console.error("Erro ao melhorar resposta:", error);
    return aiResponse; // Em caso de erro, retorna a resposta original
  }
}