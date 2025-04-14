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
    // Importar o aiChatDatabase para acesso a dados do usuário
    const aiChatDatabase = (await import('./aiChatDatabaseService')).aiChatDatabase;

    // Inicializar cache do aiChatDatabase se ainda não foi feito
    if (typeof aiChatDatabase.initializeFromCache === 'function') {
      aiChatDatabase.initializeFromCache();
    }

    // Obter o contexto completo do usuário através do serviço especializado
    const userContext = await aiChatDatabase.getUserContext();

    // Se não conseguiu obter dados, usar fallback básico
    if (!userContext.isAuthenticated) {
      // Obter dados do localStorage e sessionStorage como fallback
      const usernameSources = {
        localStorage: localStorage.getItem('username'),
        sessionStorage: sessionStorage.getItem('username'),
        email: localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail')
      };

      const bestUsername = usernameSources.localStorage || 
                           usernameSources.sessionStorage || 
                           'Usuário';

      return {
        username: bestUsername,
        email: usernameSources.email || 'email@exemplo.com',
        userId: 'ID não disponível',
        fullName: 'Nome não disponível',
        displayName: bestUsername,
        createdAt: 'Data não disponível',
        planType: 'lite',
        userLevel: 1,
        followersCount: 0,
        currentPage: window.location.pathname,
        classes: [],
        series: []
      };
    }

    // Obter dados das estruturas globais sincronizadas
    let platformSections = [];
    let globalNotifications = [];
    let platformNews = [];
    let platformStats = {};

    try {
      // Tentar obter dados da sincronização global
      platformSections = aiChatDatabase.platformSections || [];
      globalNotifications = JSON.parse(localStorage.getItem('aiChatGlobalNotifications') || '[]');
      platformNews = JSON.parse(localStorage.getItem('aiChatPlatformNews') || '[]');
      platformStats = JSON.parse(localStorage.getItem('aiChatPlatformStats') || '{}');
    } catch (cacheError) {
      console.log('Erro ao obter dados de cache global:', cacheError);
    }

    // Adicionar dados extras relevantes ao contexto
    return {
      ...userContext,
      currentPage: window.location.pathname,
      lastActivity: localStorage.getItem('lastActivity') || 'Nenhuma atividade recente',

      // Dados do dispositivo e ambiente
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      darkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,

      // Dados sincronizados da plataforma
      platformSections,
      globalNotifications: globalNotifications.slice(0, 5), // Limitar para as 5 mais recentes
      platformNews: platformNews.slice(0, 3), // Limitar para as 3 mais recentes
      platformStats,

      // Dados do localStorage relevantes
      localStorageData: Object.keys(localStorage).filter(key => 
        key.startsWith('user_') || 
        key.startsWith('ponto_') || 
        key.startsWith('study_')
      ).reduce((acc, key) => {
        acc[key] = localStorage.getItem(key);
        return acc;
      }, {})
    };
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
      const BASE_URL = 'https://pontoschool.com/';

      // Sistema de mapeamento completo de todas as seções da plataforma
      const platformLinks = {
        // Seções principais
        'portal': { url: `${BASE_URL}portal`, title: 'Portal de Estudos', aliases: ['portal de estudos', 'meus estudos', 'conteúdo', 'material', 'materiais'] },
        'agenda': { url: `${BASE_URL}agenda`, title: 'Agenda', aliases: ['minha agenda', 'calendário', 'eventos', 'compromissos'] },
        'turmas': { url: `${BASE_URL}turmas`, title: 'Turmas', aliases: ['minhas turmas', 'grupos', 'classes', 'salas', 'aulas'] },
        'biblioteca': { url: `${BASE_URL}biblioteca`, title: 'Biblioteca', aliases: ['livros', 'materiais', 'acervo', 'recursos', 'documentos'] },
        'profile': { url: `${BASE_URL}profile`, title: 'Perfil', aliases: ['meu perfil', 'perfil', 'conta', 'minha conta', 'meus dados'] },
        'configuracoes': { url: `${BASE_URL}configuracoes`, title: 'Configurações', aliases: ['configs', 'ajustes', 'definições', 'minhas configurações', 'settings'] },
        'dashboard': { url: `${BASE_URL}dashboard`, title: 'Dashboard', aliases: ['painel', 'início', 'home', 'página inicial', 'principal'] },
        'epictus-ia': { url: `${BASE_URL}epictus-ia`, title: 'Epictus IA', aliases: ['epictus', 'ia', 'assistente ia', 'inteligência artificial', 'mentor ia'] },
        'mentor-ia': { url: `${BASE_URL}mentor-ia`, title: 'Mentor IA', aliases: ['mentor', 'assistente mentor', 'mentoria ia', 'tutor ia'] },
        'planos-estudo': { url: `${BASE_URL}planos-estudo`, title: 'Planos de Estudo', aliases: ['plano de estudos', 'planos', 'cronogramas', 'roteiros', 'roteiro de estudos'] },
        'conquistas': { url: `${BASE_URL}conquistas`, title: 'Conquistas', aliases: ['minhas conquistas', 'medalhas', 'prêmios', 'troféus', 'badges'] },
        'carteira': { url: `${BASE_URL}carteira`, title: 'Carteira', aliases: ['minha carteira', 'créditos', 'wallet', 'pagamentos', 'financeiro'] },
        'mercado': { url: `${BASE_URL}mercado`, title: 'Mercado', aliases: ['loja', 'shopping', 'store', 'comprar', 'produtos'] },
        'organizacao': { url: `${BASE_URL}organizacao`, title: 'Organização', aliases: ['tarefas', 'minha organização', 'to-do', 'planejamento', 'planner'] },
        'comunidades': { url: `${BASE_URL}comunidades`, title: 'Comunidades', aliases: ['grupos', 'fóruns', 'discussões', 'tópicos', 'comunidade'] },
        'chat-ia': { url: `${BASE_URL}chat-ia`, title: 'Chat IA', aliases: ['chat inteligente', 'conversa ia', 'bate-papo ia'] },
        'school-ia': { url: `${BASE_URL}school-ia`, title: 'School IA', aliases: ['school ai', 'ia escola', 'assistente escola'] },
        'novidades': { url: `${BASE_URL}novidades`, title: 'Novidades', aliases: ['notícias', 'atualizações', 'news', 'blog', 'anúncios'] },
        'lembretes': { url: `${BASE_URL}lembretes`, title: 'Lembretes', aliases: ['meus lembretes', 'alertas', 'notificações', 'reminders'] },
        'pedidos-ajuda': { url: `${BASE_URL}pedidos-ajuda`, title: 'Pedidos de Ajuda', aliases: ['ajuda', 'suporte', 'dúvidas', 'questões', 'problemas'] },
        'estudos': { url: `${BASE_URL}estudos`, title: 'Estudos', aliases: ['meus estudos', 'matérias', 'conteúdos', 'disciplinas', 'trilhas'] },

        // Seções adicionais e redirecionamentos
        'conexao-expert': { url: `${BASE_URL}conexao-expert`, title: 'Conexão Expert', aliases: ['experts', 'ajuda especializada', 'tirar dúvidas'] },
        'recursos': { url: `${BASE_URL}recursos`, title: 'Recursos', aliases: ['material extra', 'downloads', 'arquivos complementares'] },
        'certificados': { url: `${BASE_URL}certificados`, title: 'Certificados', aliases: ['meus certificados', 'diplomas', 'comprovantes', 'histórico'] },
        'avaliacao': { url: `${BASE_URL}avaliacao`, title: 'Avaliação', aliases: ['testes', 'provas', 'exames', 'simulados', 'questionários'] },
        'suporte': { url: `${BASE_URL}suporte`, title: 'Suporte', aliases: ['ajuda', 'contato', 'atendimento', 'faq', 'perguntas frequentes'] },
        'forum': { url: `${BASE_URL}forum`, title: 'Fórum', aliases: ['fóruns', 'discussões', 'debate', 'perguntas', 'comunidade'] },
        'faq': { url: `${BASE_URL}faq`, title: 'FAQ', aliases: ['perguntas frequentes', 'dúvidas comuns', 'ajuda rápida'] }
      };

      // Dicionário de termos completo para reconhecimento mais preciso
      const allPlatformTerms = Object.entries(platformLinks).reduce((terms, [key, data]) => {
        terms[data.title.toLowerCase()] = key;
        data.aliases.forEach(alias => {
          terms[alias.toLowerCase()] = key;
        });
        return terms;
      }, {} as Record<string, string>);

      // Regex mais abrangente para detectar pedidos de navegação/redirecionamento
      const navigationRegex = /(como|posso|quero|onde|qual|preciso|gostaria de|me ajud(e|a) a|como (eu )?fa(ço|z)|como (eu )?pos+o)?\s*(?:ir|acessar|entrar|ver|abrir|encontrar|navegar|visitar|chegar|visualizar)\s+(para|no|na|a|o|à|ao|em|até)\s+(?:a\s+)?(página\s+(?:de|do|da)\s+)?([a-zà-ú\s\-]+)/i;

      // Regex alternativo para comandos diretos
      const directCommandRegex = /(me\s+(?:redirecione|encaminhe|leve|direcione|mande|envie|mostre|mostra))\s+(?:para|ao|à|a|até)\s+(?:a\s+)?(página\s+(?:de|do|da)\s+)?([a-zà-ú\s\-]+)/i;

      // Regex para pedidos de "onde fica" ou "como acessar"
      const whereIsRegex = /(onde\s+(?:fica|está|encontro)|como\s+(?:acessar|entrar|encontrar))\s+(?:a|o|as|os)?\s*([a-zà-ú\s\-]+)/i;

      // Teste todos os padrões e escolha o melhor resultado
      let requestedSection = '';
      let match;

      // Tentar com o regex de navegação principal
      match = message.match(navigationRegex);
      if (match && match[6]) {
        requestedSection = match[6].trim().toLowerCase();
      }

      // Se não encontrou, tentar com o regex de comandos diretos
      if (!requestedSection) {
        match = message.match(directCommandRegex);
        if (match && match[3]) {
          requestedSection = match[3].trim().toLowerCase();
        }
      }

      // Se ainda não encontrou, tentar com o regex de "onde fica"
      if (!requestedSection) {
        match = message.match(whereIsRegex);
        if (match && match[2]) {
          requestedSection = match[2].trim().toLowerCase();
        }
      }

      // Se encontramos alguma seção solicitada, processar
      if (requestedSection) {
        // Limpar termos comuns que podem interferir na correspondência
        requestedSection = requestedSection
          .replace(/página d[eao]s?\s+/g, '')
          .replace(/seção d[eao]s?\s+/g, '')
          .replace(/área d[eao]s?\s+/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        console.log(`Seção solicitada (limpa): "${requestedSection}"`);

        // Encontrar a melhor correspondência pelo nome exato ou por aliases
        let bestMatchKey = '';

        // Primeiro tenta correspondência exata com os termos
        bestMatchKey = allPlatformTerms[requestedSection];

        // Se não encontrou correspondência exata, busca a melhor correspondência parcial
        if (!bestMatchKey) {
          // Lista todas as possíveis correspondências parciais
          const partialMatches = Object.entries(allPlatformTerms).filter(([term]) => {
            return term.includes(requestedSection) || requestedSection.includes(term);
          });

          // Ordena por relevância (tamanho da correspondência)
          if (partialMatches.length > 0) {
            partialMatches.sort((a, b) => {
              // Prioriza correspondências exatas
              if (a[0] === requestedSection) return -1;
              if (b[0] === requestedSection) return 1;

              // Depois prioriza correspondências no início do termo
              const aStartsWith = a[0].startsWith(requestedSection);
              const bStartsWith = b[0].startsWith(requestedSection);
              if (aStartsWith && !bStartsWith) return -1;
              if (!aStartsWith && bStartsWith) return 1;

              // Por fim, prioriza termos maiores para evitar falsos positivos
              return b[0].length - a[0].length;
            });

            bestMatchKey = partialMatches[0][1];
          }
        }

        // Se encontrou uma correspondência, retorna a resposta formatada
        if (bestMatchKey && platformLinks[bestMatchKey]) {
          const section = platformLinks[bestMatchKey];

          // Gerar resposta com o link formatado de maneira segura
          const response = `Claro, ${firstName}! Aqui está o link direto para ${section.title}:\n\n[${section.title}](${section.url})\n\nClique no link acima para acessar. Posso ajudar com mais alguma coisa?`;

          // Adicionar ao histórico e salvar
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

      // Transformar links em tutoriais detalhados
      let processedResponse = aiResponse;

      // Substituir links por instruções de tutorial completo
      processedResponse = processedResponse.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
        // Verificar se é um link interno da plataforma
        if (url.includes('pontoschool.com')) {
          // Extrair o nome da seção do URL
          const section = url.split('/').pop() || '';
          let tutorialText = '';

          // Criar tutorial personalizado com base na seção
          switch(section) {
            case 'portal':
              tutorialText = `Para acessar o Portal de Estudos, siga estes passos:\n1. No menu lateral esquerdo da plataforma, localize o ícone "Portal"\n2. Clique no ícone para entrar no Portal de Estudos\n3. Você verá todos os seus materiais didáticos organizados por disciplina\n4. Utilize os filtros disponíveis para encontrar conteúdos específicos\n5. Clique em qualquer material para acessar seu conteúdo completo`;
              break;
            case 'agenda':
              tutorialText = `Para acessar sua Agenda, siga estes passos:\n1. No menu lateral esquerdo da plataforma, localize o ícone "Agenda"\n2. Clique no ícone para abrir sua Agenda completa\n3. Você verá sua programação em formato de calendário\n4. Use as opções de visualização (dia, semana, mês) para navegar melhor\n5. Clique no botão "+" para adicionar novos eventos ou compromissos`;
              break;
            case 'turmas':
              tutorialText = `Para acessar suas Turmas, siga estes passos:\n1. No menu lateral esquerdo da plataforma, localize o ícone "Turmas"\n2. Clique no ícone para ver todas as suas turmas e grupos de estudo\n3. Você verá cards com cada turma que participa\n4. Clique em qualquer turma para acessar seu conteúdo, discussões e materiais\n5. Se desejar ingressar em uma nova turma, utilize o botão "Adicionar Turma"`;
              break;
            case 'profile':
              tutorialText = `Para acessar seu Perfil, siga estes passos:\n1. No cabeçalho superior da plataforma, clique no seu avatar ou nome de usuário\n2. Selecione "Meu Perfil" no menu dropdown que aparecer\n3. Você será direcionado para sua página de perfil\n4. Aqui você pode visualizar e editar suas informações, conquistas e histórico\n5. Use os botões de edição para atualizar foto, bio e outras informações`;
              break;
            case 'configuracoes':
              tutorialText = `Para acessar suas Configurações, siga estes passos:\n1. No cabeçalho superior da plataforma, clique no seu avatar ou nome de usuário\n2. Selecione "Configurações" no menu dropdown que aparecer\n3. Você será direcionado para a página de configurações\n4. Aqui você pode ajustar preferências de notificação, privacidade e conta\n5. Todas as alterações são salvas automaticamente ao serem realizadas`;
              break;
            case 'epictus-ia':
              tutorialText = `Para acessar o Epictus IA do menu lateral, siga estes passos:\n1. No menu lateral esquerdo da plataforma, localize o ícone "Epictus IA"\n2. Clique no ícone para abrir o assistente completo\n3. Você verá a interface do assistente com diferentes abas e funções\n4. Você pode fazer perguntas, criar planos de estudo e analisar seu desempenho\n5. Note que este é diferente do chat flutuante de suporte, pois é focado em estudos personalizados`;
              break;
            default:
              tutorialText = `Para acessar "${text}", siga estes passos:\n1. No menu lateral esquerdo da plataforma, procure o item correspondente\n2. Você pode também utilizar a barra de pesquisa superior para encontrar esta seção\n3. Clique no item para acessar a página\n4. Explore as funcionalidades disponíveis nesta seção\n5. Se precisar de mais ajuda com esta área específica, me pergunte!`;
          }

          return `"${text}": ${tutorialText}`;
        }

        // Para links externos, substituir por informação sem link
        return `"${text}": Este recurso está disponível diretamente na plataforma. Não é necessário acessar links externos, pois todas as funcionalidades estão integradas na Ponto.School.`;
      });

      // Remover URLs diretos
      processedResponse = processedResponse.replace(/(https?:\/\/[^\s]+)(?!\))/g, 'este recurso na plataforma');

      // Adicionar incentivo para continuar a conversa ao final das respostas
      if (!processedResponse.includes('Posso ajudar') && !processedResponse.includes('mais alguma coisa')) {
        processedResponse += '\n\nPosso ajudar com mais alguma coisa sobre a plataforma? Estou à disposição para qualquer dúvida adicional.';
      }

      // Formatação visual melhorada para a resposta processada
      const formattedResponse = formatMessage(processedResponse);


      // Adicionar a resposta da IA ao histórico
      conversationHistory[sessionId].push({ 
        role: 'assistant', 
        content: formattedResponse,
        timestamp: new Date()
      });

      // Salvar histórico atualizado no localStorage
      await saveConversationHistory(sessionId, conversationHistory[sessionId]);

      return formattedResponse;
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
      4. Use gírias leves e expressões coloquiaisquando apropriado.
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
      - Pedidos de Ajuda: https://pontoschool.com/pedidos-ajuda
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
              - Para o Portal: "Aqui está olink para o Portal: https://pontoschool.com/portal"
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

// Função para transformar links da plataforma em tutoriais completos
function fixPlatformLinks(text: string): string {
  const platformSections = {
    'Portal de Estudos': {
      path: '/portal',
      tutorial: `Para acessar o Portal de Estudos, siga estes passos:
1. No menu lateral esquerdo da plataforma, localize o ícone "Portal"
2. Clique no ícone para entrar no Portal de Estudos
3. Você verá todos os seus materiais didáticos organizados por disciplina
4. Utilize os filtros disponíveis para encontrar conteúdos específicos
5. Clique em qualquer material para acessar seu conteúdo completo`
    },
    'Portal': {
      path: '/portal',
      tutorial: `Para acessar o Portal, siga estes passos:
1. No menu lateral esquerdo da plataforma, localize o ícone "Portal"
2. Clique no ícone para entrar no Portal de Estudos
3. Você verá todos os seus materiais didáticos organizados por disciplina
4. Use os filtros na parte superior para encontrar materiais específicos
5. Você pode alternar entre visualização em grade ou lista no canto superior direito`
    },
    'Agenda': {
      path: '/agenda',
      tutorial: `Para acessar sua Agenda, siga estes passos:
1. No menu lateral esquerdo da plataforma, localize o ícone "Agenda"
2. Clique no ícone para abrir sua Agenda completa
3. Você verá sua programação em formato de calendário
4. Use as opções de visualização (dia, semana, mês) para navegar melhor
5. Clique no botão "+" para adicionar novos eventos ou compromissos
6. Você pode arrastar e soltar eventos para reorganizar sua agenda`
    },
    'Turmas': {
      path: '/turmas',
      tutorial: `Para acessar suas Turmas, siga estes passos:
1. No menu lateral esquerdo da plataforma, localize o ícone "Turmas"
2. Clique no ícone para ver todas as suas turmas e grupos de estudo
3. Você verá cards com cada turma que participa
4. Clique em qualquer turma para acessar seu conteúdo, discussões e materiais
5. Se desejar ingressar em uma nova turma, utilize o botão "Adicionar Turma"
6. Você também pode criar grupos de estudo clicando em "Criar Grupo"`
    },
    'Biblioteca': {
      path: '/biblioteca',
      tutorial: `Para acessar a Biblioteca, siga estes passos:
1. No menu lateral esquerdo da plataforma, localize o ícone "Biblioteca"
2. Clique no ícone para explorar a biblioteca completa
3. Você verá materiais organizados por categorias e tipos
4. Use a barra de pesquisa para encontrar recursos específicos
5. Filtre por tipo de mídia (PDF, vídeo, áudio, etc.) usando os filtros
6. Você pode favoritar materiais para acesso rápido posteriormente`
    },
    'Perfil': {
      path: '/profile',
      tutorial: `Para acessar seu Perfil, siga estes passos:
1. No cabeçalho superior da plataforma, clique no seu avatar ou nome de usuário
2. Selecione "Meu Perfil" no menu dropdown que aparecer
3. Você será direcionado para sua página de perfil
4. Aqui você pode visualizar e editar suas informações, conquistas e histórico
5. Use os botões de edição para atualizar foto, biografia e outras informações
6. Você também pode gerenciar suas conexões e configurações de privacidade`
    },
    'Meu Perfil': {
      path: '/profile',
      tutorial: `Para acessar seu Perfil, siga estes passos:
1. No cabeçalho superior da plataforma, clique no seu avatar ou nome de usuário
2. Selecione "Meu Perfil" no menu dropdown que aparecer
3. Você será direcionado para sua página de perfil
4. Aqui você pode visualizar e editar suas informações pessoais
5. Para editar sua biografia, clique no botão de edição ao lado da seção "Sobre mim"
6. Para atualizar sua foto, passe o mouse sobre a imagem e clique no ícone de edição`
    }
  };

  // Processar pedidos de redirecionamento
  const redirectPatterns = [
    /(?:me\s+(?:redirecione|encaminhe|leve|direcione|mande|envie)\s+(?:para|ao|à|a|até))\s+(?:a\s+)?(?:página\s+(?:de|do|da)\s+)?([a-zà-ú\s]+)/gi,
    /(?:quero\s+(?:ir|acessar|entrar|ver))\s+(?:a\s+)?(?:página\s+(?:de|do|da)\s+)?([a-zà-ú\s]+)/gi,
    /(?:me\s+(?:mostre|mostra))\s+(?:a\s+)?(?:página\s+(?:de|do|da)\s+)?([a-zà-ú\s]+)/gi,
    /(?:abrir?|abra|acesse|acessar|ver|veja)\s+(?:a\s+)?(?:página\s+(?:de|do|da)\s+)?([a-zà-ú\s]+)/gi
  ];

  // Substituir pedidos de redirecionamento por tutoriais completos
  for (const pattern of redirectPatterns) {
    text = text.replace(pattern, (match, sectionName) => {
      if (!sectionName) return match;

      const normalizedName = sectionName.trim();
      // Verificar se o nome normalizado corresponde a alguma seção conhecida
      for (const key in platformSections) {
        if (normalizedName.toLowerCase() === key.toLowerCase() || 
            key.toLowerCase().includes(normalizedName.toLowerCase()) || 
            normalizedName.toLowerCase().includes(key.toLowerCase())) {
          // Retornar tutorial completo em vez de link
          return `Para acessar ${key}:\n\n${platformSections[key].tutorial}`;
        }
      }

      // Resposta genérica para seções não específicas
      return `Para encontrar "${normalizedName}" na plataforma, você pode seguir estas etapas:
1. Verifique o menu lateral esquerdo, onde estão as principais seções da plataforma
2. Use a barra de pesquisa no topo da tela para buscar por "${normalizedName}"
3. Caso não encontre diretamente, acesse a seção mais relacionada ao que procura
4. Dentro das seções principais, use os filtros e categorias disponíveis
5. Se ainda não encontrar, me pergunte novamente com mais detalhes que posso ajudar melhor`;
    });
  }

  // Substituir links markdown por tutoriais
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let newText = text.replace(markdownLinkRegex, (match, linkText, url) => {
    if (url.includes('pontoschool.com')) {
      // Extrair a parte final do URL
      const pathPart = url.split('pontoschool.com/').pop();

      // Procurar em todas as seções por um caminho correspondente
      for (const key in platformSections) {
        if (platformSections[key].path.includes(pathPart)) {
          return `Para acessar ${linkText}:\n\n${platformSections[key].tutorial}`;
        }
      }

      // Resposta genérica para URLs não específicas
      return `Para acessar "${linkText}":\n
1. No menu lateral esquerdo da plataforma, procure o item correspondente
2. Você pode também utilizar a barra de pesquisa superior para encontrar esta seção
3. Clique no item para acessar a página
4. Explore as funcionalidades disponíveis nesta seção
5. Se precisar de mais ajuda com esta área específica, me pergunte!`;
    }

    // Para links externos
    return `O recurso "${linkText}" está disponível diretamente na plataforma. Não é necessário acessar links externos, pois todas as funcionalidades estão integradas na Ponto.School.`;
  });

  // Remover URLs diretos
  newText = newText.replace(/(https?:\/\/[^\s]+)(?!\))/g, 'este recurso na plataforma');

  // Garantir que há um convite para continuar a conversa
  if (!newText.includes('Posso ajudar') && !newText.includes('mais alguma coisa')) {
    newText += '\n\nPosso ajudar com mais alguma instrução ou dúvida sobre a plataforma? Estou à disposição para detalhar qualquer funcionalidade.';
  }

  return newText;
}

// Função para escapar caracteres especiais em regex
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

// Format the response from the AI with enhanced styling
  function formatMessage(message: string): string {
    // Aplicar formatação de negrito para títulos
    message = message.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#FF6B00] font-semibold">$1</strong>');

    // Aplicar formatação para listas
    message = message.replace(/- (.*?)(?:\n|$)/g, '<div class="flex items-start mb-2"><span class="text-[#FF6B00] mr-2">•</span><span>$1</span></div>');

    // Formatar parágrafos importantes
    message = message.replace(/\[IMPORTANTE\](.*?)(?:\n\n|$)/gs, '<div class="p-3 bg-[#FF6B00]/10 border-l-4 border-[#FF6B00] rounded my-3">$1</div>');

    // Formatar dicas
    message = message.replace(/\[DICA\](.*?)(?:\n\n|$)/gs, '<div class="p-3 bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded my-3">💡 $1</div>');

    // Adicionar emojis no início de parágrafos específicos
    message = message.replace(/\n(Perfil:)/g, '\n📊 $1');
    message = message.replace(/\n(Turmas:)/g, '\n👥 $1');
    message = message.replace(/\n(Plano:)/g, '\n✨ $1');
    message = message.replace(/\n(Nível:)/g, '\n🏆 $1');
    message = message.replace(/\n(Email:)/g, '\n📧 $1');
    message = message.replace(/\n(ID:)/g, '\n🆔 $1');
    message = message.replace(/\n(Data de criação:)/g, '\n📅 $1');
    message = message.replace(/\n(Seguidores:)/g, '\n👥 $1');

    // Formatar tabelas simples
    if (message.includes('| ') && message.includes(' |')) {
      const tableRegex = /((?:\|.*\|[\n\r])+)/g;
      message = message.replace(tableRegex, (match) => {
        const tableHTML = '<div class="overflow-x-auto my-4"><table class="w-full border-collapse border border-[#FF6B00]/20 rounded">' +
          match.split('\n').filter(line => line.trim().length > 0).map((row, index) => {
            const cells = row.split('|').filter(cell => cell.trim().length > 0);
            const isHeader = index === 0;
            const cellTag = isHeader ? 'th' : 'td';

            return '<tr class="' + (isHeader ? 'bg-[#FF6B00]/20' : (index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/20' : '')) + '">' +
              cells.map(cell => 
                `<${cellTag} class="p-2 border border-[#FF6B00]/10 text-${isHeader ? 'center font-semibold' : 'left'}">${cell.trim()}</${cellTag}>`
              ).join('') +
              '</tr>';
          }).join('') +
          '</table></div>';
        return tableHTML;
      });
    }

    return message;
  }

// Função para adicionar mensagem ao histórico
export async function addMessageToHistory(
  sessionId: string,
  message: ChatMessage
): Promise<void> {
  try {
    if (!sessionId || !message || !message.content) {
      console.error('Parâmetros inválidos para adição ao histórico');
      return;
    }

    // Adiciona a mensagem ao histórico em memória
    if (!conversationHistory[sessionId]) {
      // Se não existe histórico para esta sessão, inicializar
      await getConversationHistory(sessionId);
    }

    // Adicionar a mensagem ao histórico
    if (conversationHistory[sessionId]) {
      conversationHistory[sessionId].push({
        ...message,
        timestamp: new Date()
      });

      // Salvar no localStorage e sincronizar com Supabase
      await saveConversationHistory(sessionId, conversationHistory[sessionId]);
    }
  } catch (error) {
    console.error('Erro ao adicionar mensagem ao histórico:', error);
  }
}

// Add blur effect to the rest of the page when chat is open
}