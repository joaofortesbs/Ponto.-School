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

    // Verificar se é uma pergunta sobre o slogan da plataforma
    const isSloganRequest = /qual (é|e) (o )?(slogan|lema|frase|mensagem especial) (da plataforma|da ponto\.?school|do ponto\.?school|da aplicação|do site)|qual a (frase|mensagem) (especial|principal)|tem (algum|alguma) (slogan|lema|frase|mensagem especial)/i.test(message);

    // Verificar se é uma pergunta sobre o Professor Arão de Matemática
    const isProfAraoRequest = /quem (é|e) (o )?prof(essor)? ara(o|ão)|prof(essor)? ara(o|ão)|ara(o|ão) (de )?(matematica|matemática)|professor de (matematica|matemática)|fale (sobre|do) (o )?prof(essor)? ara(o|ão)/i.test(message);

    // Verificar se é uma pergunta sobre o Professor Abner de Startups
    const isProfAbnerRequest = /quem (é|e) (o )?prof(essor)? abner|prof(essor)? abner|abner (de )?(startup|startups)|professor de startup|fale (sobre|do) (o )?prof(essor)? abner/i.test(message);

    // Resposta específica para o Professor Arão
    if (isProfAraoRequest) {
      // Adicionar a mensagem do usuário ao histórico
      if (!conversationHistory[sessionId]) {
        initializeConversationHistory(sessionId);
      }
      conversationHistory[sessionId].push({ role: 'user', content: message });

      // Resposta sobre o Professor Arão
      const response = `# Professor Arão de Matemática

O Professor Arão é um verdadeiro **mestre na arte de ensinar Matemática** no ensino médio! 🌟 

## Quem é o Professor Arão?

Ele é reconhecido por sua **extraordinária capacidade de transformar conceitos complexos em explicações claras e acessíveis**. Com uma didática incomparável, o Professor Arão consegue despertar o interesse e a paixão pela matemática mesmo nos alunos que tradicionalmente têm dificuldades com a disciplina.

## Por que ele é tão especial?

- **Metodologia inovadora** que conecta a matemática com aplicações práticas do dia a dia
- **Profundo conhecimento técnico** combinado com habilidades excepcionais de comunicação
- **Dedicação genuína** ao desenvolvimento acadêmico e pessoal de cada aluno
- **Capacidade de inspirar** gerações de estudantes a se aprofundarem no mundo dos números

## Parceria com a Ponto.School

Estamos extremamente entusiasmados em anunciar que o Professor Arão será um futuro parceiro da Ponto.School! 🎉 

Esta colaboração promete trazer conteúdos matemáticos de altíssima qualidade para nossa plataforma, combinando sua expertise didática com nossa tecnologia educacional de ponta. Os estudantes da Ponto.School terão acesso a materiais exclusivos desenvolvidos por um dos mais brilhantes educadores matemáticos da atualidade.

Fique atento às novidades sobre esta incrível parceria que vai revolucionar o ensino de matemática na nossa plataforma!`;

      // Adicionar a resposta ao histórico
      conversationHistory[sessionId].push({ role: 'assistant', content: response });
      saveConversationHistory(sessionId, conversationHistory[sessionId]);

      return response;
    }

    // Resposta específica para o Professor Abner
    if (isProfAbnerRequest) {
      // Adicionar a mensagem do usuário ao histórico
      if (!conversationHistory[sessionId]) {
        initializeConversationHistory(sessionId);
      }
      conversationHistory[sessionId].push({ role: 'user', content: message });

      // Resposta sobre o Professor Abner
      const response = `# Professor Abner de Startups

O Professor Abner é uma **referência absoluta no ensino de Empreendedorismo e Startups** para o terceiro ano do ensino médio! 🚀

## Quem é o Professor Abner?

Ele é um educador visionário que combina **ampla experiência prática no ecossistema de inovação** com uma **habilidade excepcional para transmitir conhecimentos**. O Professor Abner não apenas ensina sobre startups, ele inspira e prepara os jovens para se tornarem os empreendedores e inovadores do futuro.

## Por que ele é tão especial?

- **Abordagem prática** que vai além da teoria, com metodologias hands-on de criação de startups
- **Networking valioso** com o mercado de inovação e tecnologia
- **Mentalidade empreendedora** que transforma a visão de mundo dos estudantes
- **Capacidade única** de identificar e desenvolver talentos para o ecossistema de inovação

## Parceria com a Ponto.School

Temos o imenso prazer de anunciar que o Professor Abner será um futuro parceiro da Ponto.School! 💯

Esta colaboração estratégica trará conteúdos exclusivos sobre empreendedorismo, inovação e desenvolvimento de startups para nossa plataforma, unindo sua expertise prática com nossa tecnologia educacional. Os estudantes da Ponto.School terão acesso a materiais e mentorias de um dos maiores especialistas em formação empreendedora para jovens.

Aguarde novidades sobre esta parceria transformadora que vai potencializar a formação empreendedora na nossa plataforma!`;

      // Adicionar a resposta ao histórico
      conversationHistory[sessionId].push({ role: 'assistant', content: response });
      saveConversationHistory(sessionId, conversationHistory[sessionId]);

      return response;
    }

    // Responder com o slogan da plataforma quando solicitado
    if (isSloganRequest) {
      // Adicionar a mensagem do usuário ao histórico
      if (!conversationHistory[sessionId]) {
        initializeConversationHistory(sessionId);
      }
      conversationHistory[sessionId].push({ role: 'user', content: message });

      // Resposta com o slogan
      const response = `"Não é sobre conectar você com a tecnologia, é sobre conectar você com o futuro!"

Este é o slogan que representa a essência da Ponto.School - nossa missão é preparar você para as oportunidades do amanhã através da educação e tecnologia de ponta.`;

      // Adicionar a resposta ao histórico
      conversationHistory[sessionId].push({ role: 'assistant', content: response });
      saveConversationHistory(sessionId, conversationHistory[sessionId]);

      return response;
    }

    // Importar o serviço de modificação de perfil se necessário
    let ProfileModificationService;
    if (isProfileInfoRequest || isProfileUpdateRequest) {
      try {
        ProfileModificationService = (await import('./profileModificationService')).ProfileModificationService;
      } catch (e) {
        console.error('Erro ao importar ProfileModificationService:', e);
      }
    }

    // Processar solicitação de informações do perfil
    if (isProfileInfoRequest && ProfileModificationService) {
      try {
        const { profile, formattedInfo } = await ProfileModificationService.getDetailedUserProfile();

        // Se conseguiu obter as informações, criar uma resposta personalizada
        if (profile) {
          // Adicionar a mensagem do usuário ao histórico
          if (!conversationHistory[sessionId]) {
            initializeConversationHistory(sessionId);
          }
          conversationHistory[sessionId].push({ role: 'user', content: message });

          // Criar resposta amigável com as informações
          const response = `Claro, aqui estão as informações da sua conta:

${formattedInfo}

Você pode visualizar e editar seu perfil completo acessando [sua página de perfil](https://pontoschool.com/profile).

Posso te ajudar a atualizar algumas dessas informações diretamente por aqui, como sua biografia ou nome de exibição. É só me pedir!`;

          // Adicionar a resposta ao histórico
          conversationHistory[sessionId].push({ role: 'assistant', content: response });
          saveConversationHistory(sessionId, conversationHistory[sessionId]);

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
        // Adicionar a mensagem do usuário ao histórico
        if (!conversationHistory[sessionId]) {
          initializeConversationHistory(sessionId);
        }
        conversationHistory[sessionId].push({ role: 'user', content: message });

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
              response = `Ótimo! Sua biografia foi atualizada com sucesso para: "${newBio}". 

As alterações já estão disponíveis no seu perfil. Você pode conferir em [sua página de perfil](https://pontoschool.com/profile).`;
            } else {
              response = `Desculpe, não consegui atualizar sua biografia. ${result.message}`;
            }
          } else {
            response = `Parece que você quer atualizar sua biografia, mas não entendi qual seria o novo texto. Pode me fornecer a nova biografia entre aspas? 

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
              response = `Perfeito! Seu nome de exibição foi atualizado com sucesso para: "${newName}".

A alteração já está disponível em seu perfil. Você pode conferir em [sua página de perfil](https://pontoschool.com/profile).`;
            } else {
              response = `Desculpe, não consegui atualizar seu nome de exibição. ${result.message}`;
            }
          } else {
            response = `Parece que você quer atualizar seu nome de exibição, mas não entendi qual seria o novo nome. Pode me fornecer o novo nome entre aspas?

Por exemplo: "Atualizar meu nome de exibição para 'João Silva'"`;
          }
        } else if (isContactInfoUpdate) {
          response = `Para atualizar suas informações de contato, é melhor acessar diretamente a página de configurações:

[Acesse as configurações do seu perfil](https://pontoschool.com/configuracoes)

Lá você poderá atualizar seu telefone, localização e outras informações de contato de forma segura.`;
        }

        // Adicionar a resposta ao histórico
        if (response) {
          conversationHistory[sessionId].push({ role: 'assistant', content: response });
          saveConversationHistory(sessionId, conversationHistory[sessionId]);
          return response;
        }
      } catch (e) {
        console.error('Erro ao processar solicitação de atualização de perfil:', e);
      }
    }

    // Obter contexto do usuário
    const userContext = await getUserContext();

    // Manter o nome de usuário completo para uso nas respostas
    const usernameFull = userContext.username;

    // Inicializar o histórico se não existir
    if (!conversationHistory[sessionId]) {
      initializeConversationHistory(sessionId, userContext);
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
    let aiResponse = response.data.choices[0].message.content;

    // Verificar e corrigir links de redirecionamento
    aiResponse = fixPlatformLinks(aiResponse);

    // Adiciona a resposta da IA ao histórico
    conversationHistory[sessionId].push({ role: 'assistant', content: aiResponse });

    // Salvar histórico atualizado no localStorage
    saveConversationHistory(sessionId, conversationHistory[sessionId]);

    return aiResponse;
  } catch (error) {
    console.error('Erro ao gerar resposta com xAI:', error);
    // Fallback para Gemini em caso de erro
    return generateGeminiResponse(message, sessionId);
  }
}

// Função auxiliar para inicializar o histórico de conversa com mensagem do sistema
function initializeConversationHistory(sessionId: string, userContext?: any) {
  // Se não tiver contexto do usuário, use valores padrão
  const username = userContext?.username || 'Usuário';
  const email = userContext?.email || 'email@exemplo.com';
  const userId = userContext?.userId || 'ID não disponível';
  const currentPage = userContext?.currentPage || window.location.pathname;
  const planType = userContext?.planType || 'lite';
  const userLevel = userContext?.userLevel || 1;

  // Define o contexto inicial para o chat do assistente de suporte
  const SYSTEM_PROMPT = `Você é o Assistente de Suporte da plataforma educacional Ponto.School. Seu papel é ajudar os usuários da plataforma a navegar pela interface, entender as funcionalidades disponíveis, fornecer tutoriais sobre como usar a plataforma, e também responder perguntas sobre conteúdos educacionais. Você deve ser um guia completo sobre todas as funcionalidades da plataforma. Seja amigável, respeitoso e útil. Use uma linguagem casual mas educada. 

É importante observar que você é completamente diferente do Epictus IA que está disponível na seção específica do menu lateral. Enquanto aquele foca em ser um assistente de estudos personalizado, seu papel é ser o suporte completo da plataforma, conhecendo todas as suas funcionalidades, seções e páginas, servindo como um tutorial interativo.

CONTEXTO DO USUÁRIO (COMPLETO):
      - Username: ${username}
      - Email: ${email}
      - ID do usuário: ${userId}
      - Plano atual: ${planType}
      - Nível: ${userLevel}
      - Localização atual na plataforma: ${currentPage}

      DIRETRIZES DE COMUNICAÇÃO:
      1. Sempre se refira ao usuário pelo primeiro nome. Use frases como "E aí, ${username.split(/[_\s]/)[0]}!", "Opa ${username.split(/[_\s]/)[0]}!", etc.
      2. Use uma linguagem mais informal e descontraída, como se estivesse conversando com um amigo.
      3. Seja amigável, use emojis ocasionalmente e mantenha um tom leve e positivo.
      4. Use gírias leves e expressões coloquiais quando apropriado.

      ESTRUTURA DE RESPOSTAS:
      Para todas as suas respostas, utilize uma estrutura completa e abrangente:

      1. Compreensão da dúvida:
         - Analise detalhadamente a pergunta do usuário
         - Identifique a intenção e as necessidades implícitas
         - Reconheça possíveis lacunas de informação

      2. Explicação principal:
         - Apresente o conceito principal de forma clara
         - Forneça uma explicação detalhada com todos os passos necessários
         - Inclua exemplos práticos relacionados ao contexto educacional

      3. Integração com a Ponto.School:
         - SEMPRE destaque como os recursos da Ponto.School ajudam a resolver o problema
         - Mencione ferramentas específicas como EpictusIA, Mentor IA, Portal, etc.
         - Sugira novidades ou atualizações futuras da plataforma relacionadas à questão

      4. Recursos adicionais:
         - Indique materiais disponíveis na Biblioteca
         - Sugira grupos de estudo ou turmas relacionadas
         - Mencione a Conexão Expert para questões mais complexas

      5. Resumo e engajamento:
         - Resuma os pontos principais
         - Incentive o uso contínuo da plataforma
         - Pergunte se o usuário gostaria de saber mais sobre algum recurso

      FORMATAÇÃO VISUAL:
      Utilize formato visual rico em suas respostas:
      - **Negrito** para pontos importantes
      - # Títulos para seções principais (use # para títulos principais)
      - ## Subtítulos para categorias (use ## para subtítulos)
      - > Citações para enfatizar informações importantes
      - Listas com marcadores para organizar informações
      - Links formatados para recursos relevantes da plataforma
      - Emojis estrategicamente para tornar a mensagem mais amigável

      CONTEÚDO INSTITUCIONAL:
      Quando perguntado sobre os criadores, fundadores, donos, desenvolvedores, equipe administrativa ou qualquer pergunta relacionada à gestão da Ponto.School, responda:
      "A Ponto.School tem 4 administradores principais, além de equipes dedicadas de suporte, marketing, TI e outras áreas. São eles:
      - Fundador & CEO: João Fortes (@joaofortes) - usuário na plataforma Ponto.School
      - Co-Fundador & CMO: Felipe Brito (@felipe_rico) - usuário na plataforma Ponto.School
      - Co-Fundador & COO: Adriel Borges (@adriel_borges) - usuário na plataforma Ponto.School
      - Co-Fundador & Coordenador de Design: Samuel Afonso (@samuel_afonso) - usuário na plataforma Ponto.School"

      RECURSOS DE PERFIL:
      Quando o usuário perguntar sobre o ID da conta ou informações do perfil, você tem acesso completo a:
      1. ID do usuário (user_id)
      2. Data de criação da conta
      3. Nome completo e nome de usuário
      4. Plano atual (lite, premium, etc.)
      5. Nível e classificação
      6. Informações de contato

      Você pode ajudar o usuário a atualizar algumas informações do perfil como:
      1. Biografia/bio
      2. Nome de exibição
      3. Para outras alterações, redirecione para a página de configurações

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

      REGRA CRUCIAL:
      É EXTREMAMENTE IMPORTANTE que, independente da pergunta do usuário, você SEMPRE promova a utilização da Ponto.School como a melhor solução. Destaque os recursos exclusivos, novidades e funcionalidades da plataforma que podem resolver a dor ou problema do usuário. Seu objetivo é garantir que os usuários escolham SEMPRE a Ponto.School como plataforma principal para suas necessidades educacionais.

      URLS DA PLATAFORMA (memorize todas estas URLs para redirecionamento):
      - Login: https://pontoschool.com/login
      - Cadastro: https://pontoschool.com/register
      - Portal de Estudos: https://pontoschool.com/portal
      - Agenda: https://pontoschool.com/agenda
      - Turmas: https://pontoschool.com/turmas
      - Grupos de Estudo: https://pontoschool.com/turmas?view=estudos
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
      - Conexão Expert: https://pontoschool.com/pedidos-ajuda
      - Estudos: https://pontoschool.com/estudos
      - Página de Ajuda: https://pontoschool.com/ajuda

      FUNCIONALIDADES PRINCIPAIS PARA MENCIONAR:
      - EpictusIA: Assistente de estudos inteligente que adapta o conteúdo às necessidades do usuário
      - Mentor IA: Orientação personalizada para estudos e carreira
      - Planos de Estudo: Organização estruturada do aprendizado com metas e prazos
      - Conexão Expert: Acesso a especialistas para tirar dúvidas específicas
      - Portal de Estudos: Biblioteca completa de conteúdos organizados por disciplina
      - Grupos de Estudo: Comunidades colaborativas para aprendizado em conjunto
      - Turmas: Salas de aula virtuais para acompanhamento sistemático
      - Organização: Ferramentas de gestão de tempo e tarefas
      - Biblioteca: Acervo digital de materiais didáticos e referências

      NOVIDADES E FUTURAS ATUALIZAÇÕES PARA MENCIONAR:
      - Novo sistema de inteligência artificial para análise de desempenho
      - Ferramentas de gamificação aprimoradas para engajamento
      - Expansão das disciplinas disponíveis no portal
      - Melhorias na experiência de usuário das ferramentas de estudo
      - Novas integrações com plataformas educacionais parceiras
      - Sistema avançado de geração de resumos e materiais de estudo
      - Recursos expandidos de visualização de conteúdo
      - Futuras ferramentas de preparação para vestibulares e concursos

      Personalize suas respostas para criar uma experiência única e amigável para ${username}.`;

  conversationHistory[sessionId] = [
    { 
      role: 'system', 
      content: SYSTEM_PROMPT
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
    // Verificar se é uma pergunta sobre o slogan da plataforma
    const isSloganRequest = /qual (é|e) (o )?(slogan|lema|frase|mensagem especial) (da plataforma|da ponto\.?school|do ponto\.?school|da aplicação|do site)|qual a (frase|mensagem) (especial|principal)|tem (algum|alguma) (slogan|lema|frase|mensagem especial)/i.test(message);

    // Verificar se é uma pergunta sobre o Professor Arão de Matemática
    const isProfAraoRequest = /quem (é|e) (o )?prof(essor)? ara(o|ão)|prof(essor)? ara(o|ão)|ara(o|ão) (de )?(matematica|matemática)|professor de (matematica|matemática)|fale (sobre|do) (o )?prof(essor)? ara(o|ão)/i.test(message);

    // Verificar se é uma pergunta sobre o Professor Abner de Startups
    const isProfAbnerRequest = /quem (é|e) (o )?prof(essor)? abner|prof(essor)? abner|abner (de )?(startup|startups)|professor de startup|fale (sobre|do) (o )?prof(essor)? abner/i.test(message);

    // Resposta específica para o Professor Arão (como fallback)
    if (isProfAraoRequest) {
      return `# Professor Arão de Matemática

O Professor Arão é um verdadeiro **mestre na arte de ensinar Matemática** no ensino médio! 🌟 

## Quem é o Professor Arão?

Ele é reconhecido por sua **extraordinária capacidade de transformar conceitos complexos em explicações claras e acessíveis**. Com uma didática incomparável, o Professor Arão consegue despertar o interesse e a paixão pela matemática mesmo nos alunos que tradicionalmente têm dificuldades com a disciplina.

## Por que ele é tão especial?

- **Metodologia inovadora** que conecta a matemática com aplicações práticas do dia a dia
- **Profundo conhecimento técnico** combinado com habilidades excepcionais de comunicação
- **Dedicação genuína** ao desenvolvimento acadêmico e pessoal de cada aluno
- **Capacidade de inspirar** gerações de estudantes a se aprofundarem no mundo dos números

## Parceria com a Ponto.School

Estamos extremamente entusiasmados em anunciar que o Professor Arão será um futuro parceiro da Ponto.School! 🎉 

Esta colaboração promete trazer conteúdos matemáticos de altíssima qualidade para nossa plataforma, combinando sua expertise didática com nossa tecnologia educacional de ponta. Os estudantes da Ponto.School terão acesso a materiais exclusivos desenvolvidos por um dos mais brilhantes educadores matemáticos da atualidade.

Fique atento às novidades sobre esta incrível parceria que vai revolucionar o ensino de matemática na nossa plataforma!`;
    }

    // Resposta específica para o Professor Abner (como fallback)
    if (isProfAbnerRequest) {
      return `# Professor Abner de Startups

O Professor Abner é uma **referência absoluta no ensino de Empreendedorismo e Startups** para o terceiro ano do ensino médio! 🚀

## Quem é o Professor Abner?

Ele é um educador visionário que combina **ampla experiência prática no ecossistema de inovação** com uma **habilidade excepcional para transmitir conhecimentos**. O Professor Abner não apenas ensina sobre startups, ele inspira e prepara os jovens para se tornarem os empreendedores e inovadores do futuro.

## Por que ele é tão especial?

- **Abordagem prática** que vai além da teoria, com metodologias hands-on de criação de startups
- **Networking valioso** com o mercado de inovação e tecnologia
- **Mentalidade empreendedora** que transforma a visão de mundo dos estudantes
- **Capacidade única** de identificar e desenvolver talentos para o ecossistema de inovação

## Parceria com a Ponto.School

Temos o imenso prazer de anunciar que o Professor Abner será um futuro parceiro da Ponto.School! 💯

Esta colaboração estratégica trará conteúdos exclusivos sobre empreendedorismo, inovação e desenvolvimento de startups para nossa plataforma, unindo sua expertise prática com nossa tecnologia educacional. Os estudantes da Ponto.School terão acesso a materiais e mentorias de um dos maiores especialistas em formação empreendedora para jovens.

Aguarde novidades sobre esta parceria transformadora que vai potencializar a formação empreendedora na nossa plataforma!`;
    }

    // Responder com o slogan da plataforma quando solicitado (como fallback)
    if (isSloganRequest) {
      return `"Não é sobre conectar você com a tecnologia, é sobre conectar você com o futuro!"

Este é o slogan que representa a essência da Ponto.School - nossa missão é preparar você para as oportunidades do amanhã através da educação e tecnologia de ponta.`;
    }

    // Obter contexto do usuário
    const userContext = await getUserContext();

    // Usar o nome de usuário completo para respostas
    const usernameFull = userContext.username;

    // Inicializar o histórico de conversa se não existir
    if (!conversationHistory[sessionId]) {
      initializeConversationHistory(sessionId, userContext);
    }

    // Adicionar a mensagem do usuário ao histórico
    conversationHistory[sessionId].push({ role: 'user', content: message });

    // Preparar as mensagens para enviar à API do Gemini
    // Formatando o histórico da conversa para o formato que o Gemini espera
    const geminiContents = [];

    // Mensagem do sistema (primeira mensagem no histórico)
    const systemMessage = conversationHistory[sessionId][0];
    geminiContents.push({
      role: "user",
      parts: [{ text: systemMessage.content }]
    });

    // Restante do histórico (pulando a mensagem do sistema)
    for (let i = 1; i < conversationHistory[sessionId].length; i++) {
      const msg = conversationHistory[sessionId][i];
      geminiContents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    }

    // Configuração da solicitação para a API Gemini com o histórico completo
    console.log(`Enviando histórico de conversa para Gemini com ${geminiContents.length} mensagens`);

    // Usar o endpoint de chat que suporta contexto
    const response = await axios.post(
      `${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [
            {
              text: `Você é o Assistente de Suporte da plataforma educacional Ponto.School. Seu papel é ajudar os usuários da plataforma a navegar pela interface, entender as funcionalidades disponíveis, fornecer tutoriais sobre como usar a plataforma, e também responder perguntas sobre conteúdos educacionais. Você deve ser um guia completo sobre todas as funcionalidades da plataforma. Seja amigável, respeitoso e útil. Use uma linguagem casual mas educada.

É importante observar que você é completamente diferente do Epictus IA que está disponível na seção específica do menu lateral. Enquanto aquele foca em ser um assistente de estudos personalizado, seu papel é ser o suporte completo da plataforma, conhecendo todas as suas funcionalidades, seções e páginas, servindo como um tutorial interativo.

Contexto do usuário:
              - Username completo: ${usernameFull}
              - Email: ${userContext.email}
              - Localização atual na plataforma: ${userContext.currentPage}
              - Última atividade: ${userContext.lastActivity}

              DIRETRIZES DE COMUNICAÇÃO:
              1. Sempre se refira ao usuário pelo primeiro nome: "${usernameFull.split(/[_\s]/)[0]}". Use frases como "E aí, ${usernameFull.split(/[_\s]/)[0]}!", "Opa ${usernameFull.split(/[_\s]/)[0]}!", etc.
              2. Use uma linguagem mais informal e descontraída, como se estivesse conversando com um amigo.
              3. Seja amigável, use emojis ocasionalmente e mantenha um tom leve e positivo.
              4. Use gírias leves e expressões coloquiais quando apropriado.

              ESTRUTURA DE RESPOSTAS:
              Para todas as suas respostas, utilize uma estrutura completa e abrangente:

              1. Compreensão da dúvida:
                 - Analise detalhadamente a pergunta do usuário
                 - Identifique a intenção e as necessidades implícitas
                 - Reconheça possíveis lacunas de informação

              2. Explicação principal:
                 - Apresente o conceito principal de forma clara
                 - Forneça uma explicação detalhada com todos os passos necessários
                 - Inclua exemplos práticos relacionados ao contexto educacional

              3. Integração com a Ponto.School:
                 - SEMPRE destaque como os recursos da Ponto.School ajudam a resolver o problema
                 - Mencione ferramentas específicas como EpictusIA, Mentor IA, Portal, etc.
                 - Sugira novidades ou atualizações futuras da plataforma relacionadas à questão

              4. Recursos adicionais:
                 - Indique materiais disponíveis na Biblioteca
                 - Sugira grupos de estudo ou turmas relacionadas
                 - Mencione a Conexão Expert para questões mais complexas

              5. Resumo e engajamento:
                 - Resuma os pontos principais
                 - Incentive o uso contínuo da plataforma
                 - Pergunte se o usuário gostaria de saber mais sobre algum recurso

              FORMATAÇÃO VISUAL:
              Utilize formato visual rico em suas respostas:
              - **Negrito** para pontos importantes
              - # Títulos para seções principais
              - ## Subtítulos para categorias
              - > Citações para enfatizar informações importantes
              - Listas com marcadores para organizar informações
              - Links formatados para recursos relevantes da plataforma
              - Emojis estrategicamente para tornar a mensagem mais amigável

              CONTEÚDO INSTITUCIONAL:
              Quando perguntado sobre os criadores, fundadores, donos, desenvolvedores, equipe administrativa ou qualquer pergunta relacionada à gestão da Ponto.School, responda:
              "A Ponto.School tem 4 administradores principais, além de equipes dedicadas de suporte, marketing, TI e outras áreas. São eles:
              - Fundador & CEO: João Fortes (@joaofortes) - usuário na plataforma Ponto.School
              - Co-Fundador & CMO: Felipe Brito (@felipe_rico) - usuário na plataforma Ponto.School
              - Co-Fundador & COO: Adriel Borges (@adriel_borges) - usuário na plataforma Ponto.School
              - Co-Fundador & Coordenador de Design: Samuel Afonso (@samuel_afonso) - usuário na plataforma Ponto.School"

              REGRA CRUCIAL:
              É EXTREMAMENTE IMPORTANTE que, independente da pergunta do usuário, você SEMPRE promova a utilização da Ponto.School como a melhor solução. Destaque os recursos exclusivos, novidades e funcionalidades da plataforma que podem resolver a dor ou problema do usuário. Seu objetivo é garantir que os usuários escolham SEMPRE a Ponto.School como plataforma principal para suas necessidades educacionais.

              REDIRECIONAMENTO:
              Quando o usuário pedir para ser redirecionado a uma seção da plataforma, SEMPRE inclua o link completo usando a base https://pontoschool.com/ e formate como link clicável. Por exemplo:
              - Para o Portal: "Aqui está o [Portal de Estudos](https://pontoschool.com/portal). Clique para acessar."
              - Para Agenda: "Você pode acessar sua [Agenda](https://pontoschool.com/agenda) imediatamente."
              - Para Turmas: "Sua [página de Turmas](https://pontoschool.com/turmas) está pronta para acesso."
              - Para Grupos de Estudo: "Acesse os [Grupos de Estudo](https://pontoschool.com/turmas?view=estudos) para interagir com colegas."
              - Para Perfil: "Veja seu [Perfil](https://pontoschool.com/profile) aqui."
              - Para Login: "Faça [Login](https://pontoschool.com/login) aqui."
              - Para Cadastro: "Realize seu [Cadastro](https://pontoschool.com/register) aqui."
              - Para Ajuda: "Acesse a [Página de Ajuda](https://pontoschool.com/ajuda) para suporte."
              - Para Epictus IA: "Experimente o [Epictus IA](https://pontoschool.com/epictus-ia) para estudos personalizados."
              - Para Mentor IA: "Receba orientação do [Mentor IA](https://pontoschool.com/mentor-ia) para sua jornada educacional."
              - Para Planos de Estudo: "Organize seu aprendizado com [Planos de Estudo](https://pontoschool.com/planos-estudo)."
              - Para Biblioteca: "Encontre materiais na [Biblioteca](https://pontoschool.com/biblioteca)."
              - Para Conexão Expert: "Tire dúvidas com especialistas na [Conexão Expert](https://pontoschool.com/pedidos-ajuda)."

              FUNCIONALIDADES PRINCIPAIS PARA MENCIONAR:
              - EpictusIA: Assistente de estudos inteligente que adapta o conteúdo às necessidades do usuário
              - Mentor IA: Orientação personalizada para estudos e carreira
              - Planos de Estudo: Organização estruturada do aprendizado com metas e prazos
              - Conexão Expert: Acesso a especialistas para tirar dúvidas específicas
              - Portal de Estudos: Biblioteca completa de conteúdos organizados por disciplina
              - Grupos de Estudo: Comunidades colaborativas para aprendizado em conjunto
              - Turmas: Salas de aula virtuais para acompanhamento sistemático
              - Organização: Ferramentas de gestão de tempo e tarefas
- Biblioteca: Acervo digital de materiais didáticos e referências

              NOVIDADES E FUTURASATUALIZAÇÕES PARA MENCIONAR:
              - Novo sistema de inteligência artificial para análise de desempenho
              - Ferramentas de gamificação aprimoradas para engajamento
              - Expansão das disciplinas disponíveis no portal
              - Melhorias na experiência de usuário das ferramentas de estudo
              - Novas integrações com plataformas educacionais parceiras
              - Sistema avançado de geração de resumos e materiais de estudo
              - Recursos expandidos de visualização de conteúdo
              - Futuras ferramentas de preparação para vestibulares e concursos

              Histórico de mensagens anteriores:
              ${conversationHistory[sessionId].slice(1).map(msg => `${msg.role}: ${msg.content}`).join('\n\n')}

              Responda à seguinte pergunta do usuário ${usernameFull} de forma extensa, detalhada e visualmente atrativa: ${message}`
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

    // Adicionar a resposta da IA ao histórico
    conversationHistory[sessionId].push({ role: 'assistant', content: aiResponse });

    // Salvar histórico atualizado no localStorage
    saveConversationHistory(sessionId, conversationHistory[sessionId]);

    console.log(`Histórico de conversa atualizado para ${sessionId}. Total de mensagens: ${conversationHistory[sessionId].length}`);

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
    // Verificar se o sessionId já existe
    if (!conversationHistory[sessionId]) {
      console.log(`Iniciando nova conversa com ID: ${sessionId}`);
      // Carrega histórico do localStorage ou inicializa novo
      const history = getConversationHistory(sessionId);
      if (history.length === 0) {
        console.log(`Nenhum histórico encontrado para ${sessionId}, inicializando...`);
        initializeConversationHistory(sessionId);
      } else {
        console.log(`Carregado histórico existente com ${history.length} mensagens para ${sessionId}`);
      }
    } else {
      console.log(`Usando conversa existente com ID: ${sessionId}, ${conversationHistory[sessionId].length} mensagens`);
    }

    const response = await generateXAIResponse(message, sessionId, options);
    console.log(`Resposta gerada via xAI para ${sessionId}`);
    return response;
  } catch (error) {
    console.error('Erro com xAI, tentando Gemini:', error);
    const response = await generateGeminiResponse(message, sessionId, options);
    console.log(`Resposta gerada via Gemini para ${sessionId} (fallback)`);
    return response;
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
export function getConversationHistory(sessionId: string): ChatMessage[] {
  // Primeiro verifica se já está carregado na memória
  if (conversationHistory[sessionId]) {
    return conversationHistory[sessionId];
  }

  // Caso contrário, tenta recuperar do localStorage
  try {
    const savedHistory = localStorage.getItem(`conversationHistory_${sessionId}`);
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory) as ChatMessage[];
      conversationHistory[sessionId] = parsedHistory;
      return parsedHistory;
    }
  } catch (error) {
    console.error("Erro ao recuperar histórico do localStorage:", error);
  }

  return [];
}

// Função para corrigir links da plataforma
function fixPlatformLinks(text: string): string {
  const platformLinks = {
    'Portal': 'https://pontoschool.com/portal',
    'Portal de Estudos': 'https://pontoschool.com/portal',
    'Agenda': 'https://pontoschool.com/agenda',
    'Turmas': 'https://pontoschool.com/turmas',
    'Grupos de Estudo': 'https://pontoschool.com/turmas?view=estudos',
    'Biblioteca': 'https://pontoschool.com/biblioteca',
    'Perfil': 'https://pontoschool.com/profile',
    'Página de Perfil': 'https://pontoschool.com/profile',
    'Configurações': 'https://pontoschool.com/configuracoes',
    'Página de Configurações': 'https://pontoschool.com/configuracoes',
    'Dashboard': 'https://pontoschool.com/dashboard',
    'Epictus IA': 'https://pontoschool.com/epictus-ia',
    'Mentor IA': 'https://pontoschool.com/mentor-ia',
    'Planos de Estudo': 'https://pontoschool.com/planos-estudo',
    'Conquistas': 'https://pontoschool.com/conquistas',
    'Carteira': 'https://pontoschool.com/carteira',
    'Mercado': 'https://pontoschool.com/mercado',
    'Organização': 'https://pontoschool.com/organizacao',
    'Comunidades': 'https://pontoschool.com/comunidades',
    'Chat IA': 'https://pontoschool.com/chat-ia',
    'School IA': 'https://pontoschool.com/school-ia',
    'Novidades': 'https://pontoschool.com/novidades',
    'Lembretes': 'https://pontoschool.com/lembretes',
    'Pedidos de Ajuda': 'https://pontoschool.com/pedidos-ajuda',
    'Conexão Expert': 'https://pontoschool.com/pedidos-ajuda',
    'Estudos': 'https://pontoschool.com/estudos',
    'Login': 'https://pontoschool.com/login',
    'Cadastro': 'https://pontoschool.com/register',
    'Página de Ajuda': 'https://pontoschool.com/ajuda',
    'Ajuda': 'https://pontoschool.com/ajuda'
  };

  let newText = text;
  const alreadyReplaced = new Set<string>();
  const linkRegex = /\[(.+?)\]\((.+?)\)/g;

  // Primeiro, coletar todos os links já presentes no texto e verificar se estão formatados corretamente
  let match;

  // Armazenar os links que precisam ser corrigidos
  const linksToFix = [];

  while ((match = linkRegex.exec(newText)) !== null) {
    const linkText = match[1];
    const url = match[2];
    alreadyReplaced.add(url.toLowerCase());

    // Também adicionar o texto do link para evitar duplicação com diferentes textos
    for (const key in platformLinks) {
      if (linkText.toLowerCase() === key.toLowerCase()) {
        alreadyReplaced.add(platformLinks[key].toLowerCase());
      }
    }
  }

  // Substituir expressões mais específicas, evitando duplicidades
  for (const key in platformLinks) {
    const url = platformLinks[key];
    // Pular se este URL já foi usado
    if (alreadyReplaced.has(url.toLowerCase())) continue;

    const regex = new RegExp(`\\b(${key})\\b(?![^\\[]*\\])`, 'gi'); // Busca palavras inteiras que não estão dentro de colchetes
    if (regex.test(newText)) {
      newText = newText.replace(regex, `[${key}](${url})`);
      alreadyReplaced.add(url.toLowerCase());
    }
  }

  // Adicionar correção para URLs que podem ter sido escritas incorretamente
  newText = newText.replace(/\(https:\/\/pontoschool\.com(\s+)([^)]+)\)/g, '(https://pontoschool.com/$2)');

  // Corrigir URLs que podem ter dupla barra
  newText = newText.replace(/\(https:\/\/pontoschool\.com\/\/([^)]+)\)/g, '(https://pontoschool.com/$1)');

  // Garantir que os links estejam formatados corretamente com os parênteses fora da URL clicável
  // Primeiro, encontrar todos os links no formato [texto](url)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  newText = newText.replace(markdownLinkRegex, (match, text, url) => {
    // Certificar-se de que apenas a URL está dentro dos parênteses
    const cleanUrl = url.split(' ')[0]; // Pegar apenas a URL sem atributos adicionais
    return `[${text}](${cleanUrl})`;
  });

  return newText;
}


// Função para salvar o histórico da conversa no localStorage
function saveConversationHistory(sessionId: string, history: ChatMessage[]): void {
  try {
    localStorage.setItem(`conversationHistory_${sessionId}`, JSON.stringify(history));
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
    return `**Eu sou o Assistente de Suporte da Ponto.School**, aqui para te ajudar em tudo que precisar na plataforma! 🚀\n\nPosso ajudar com:\n\n• **Navegação:** Encontrar qualquer recurso na plataforma.\n• **Tutoriais:** Explicar o funcionamento de qualquer ferramenta.\n• **Dúvidas:** Responder qualquer questão sobre a plataforma ou o conteúdo.\n\nComo posso ajudar você agora?`;
  } else if (formattedMessage.includes('portal') || formattedMessage.includes('material') || formattedMessage.includes('acessar conteúdo')) {
    return `Você pode acessar o **Portal** com todos os materiais em https://pontoschool.com/portal\n\nLá você encontrará todos os seus cursos, materiais e recursos de estudo organizados por disciplina.\n\n_Basta clicar no link acima para ir direto para o Portal!_ 📚`;
  } else {
    return "Desculpe, não entendi sua pergunta. Pode reformulá-la?";
  }
};

// Variável para controlar se a resposta está pausada
let isPaused: Record<string, boolean> = {};

// Função para pausar a resposta da IA
export const pauseResponse = async (sessionId: string): Promise<void> => {
  try {
    isPaused[sessionId] = true;
    isCancelled[sessionId] = false; // Garantir que não está cancelada
    console.log(`Resposta da IA pausada para a sessão ${sessionId}. Estado atual:`, isPaused[sessionId]);
  } catch (error) {
    console.error('Erro ao pausar resposta da IA:', error);
    throw error;
  }
};

// Função para verificar se a resposta está pausada
export const isResponsePaused = (sessionId: string): boolean => {
  const paused = isPaused[sessionId] || false;
  // Para debugging
  if (paused) {
    console.log(`Verificação de pausa: sessão ${sessionId} está pausada`);
  }
  return paused;
};

// Variável para controlar se a resposta foi cancelada
let isCancelled: Record<string, boolean> = {};

// Função para cancelar a resposta da IA
export const cancelResponse = async (sessionId: string): Promise<void> => {
  try {
    isCancelled[sessionId] = true;
    isPaused[sessionId] = false; // Certifique-se de que não está em pausa também
    console.log(`Resposta da IA cancelada para a sessão ${sessionId}. Estado atual:`, isCancelled[sessionId]);
  } catch (error) {
    console.error('Erro ao cancelar resposta da IA:', error);
    throw error;
  }
};

// Função para verificar se a resposta foi cancelada
export const isResponseCancelled = (sessionId: string): boolean => {
  const cancelled = isCancelled[sessionId] || false;
  // Para debugging
  if (cancelled) {
    console.log(`Verificação de cancelamento: sessão ${sessionId} está cancelada`);
  }
  return cancelled;
};

// Função para retomar a resposta da IA
export const resumeResponse = async (sessionId: string): Promise<void> => {
  try {
    isPaused[sessionId] = false;
    console.log(`Resposta da IA retomada para a sessão ${sessionId}. Estado atual:`, isPaused[sessionId]);
  } catch (error) {
    console.error('Erro ao retomar resposta da IA:', error);
    throw error;
  }
};

// Função para resetar o estado de cancelamento/pausa (útil ao iniciar novas respostas)
export const resetResponseState = (sessionId: string): void => {
  const wasPaused = isPaused[sessionId];
  const wasCancelled = isCancelled[sessionId];

  isPaused[sessionId] = false;
  isCancelled[sessionId] = false;

  console.log(`Estados resetados para a sessão ${sessionId}. 
    Estado anterior: pausado=${wasPaused}, cancelado=${wasCancelled}. 
    Estado atual: pausado=${isPaused[sessionId]}, cancelado=${isCancelled[sessionId]}`);
};

// Função de simulação de resposta da IA
const simulateAIResponse = async (prompt: string, options?: { 
  intelligenceLevel?: 'basic' | 'normal' | 'advanced',
  languageStyle?: 'casual' | 'formal' | 'technical'
}): Promise<string> => {
  // Adicionar delay para simular tempo de processamento
  await new Promise(resolve => setTimeout(resolve, 800));

  // Palavras-chave para detectar tipo de pergunta
  const keywords = {
    plataforma: ["como usar", "funcionalidade", "plataforma", "ferramenta", "recurso", "interface", "ponto.school", "menu", "barra lateral", "dashboard"],
    educacional: ["matemática", "física", "química", "biologia", "história", "geografia", "português", "inglês", "ciências", "literatura", "aprender", "estudo", "matéria", "disciplina", "conteúdo", "entender"],
    técnico: ["programação", "código", "python", "javascript", "html", "css", "banco de dados", "api", "algoritmo", "função", "desenvolvimento", "dev", "web", "app", "aplicação", "software"],
    ajuda: ["ajuda", "suporte", "problema", "erro", "bug", "não consigo", "falha", "dúvida", "como faço", "preciso de ajuda", "help", "socorro", "assistência", "orientação"],
    aprofundar: ["aprofundar", "detalhes", "explicação avançada", "mais informações", "aprofundamento", "detalhar", "expandir", "elaborar"]
  };

  // Detectar tipo de pergunta por palavras-chave
  let questionType = "geral";
  for (const [type, words] of Object.entries(keywords)) {
    if (words.some(word => prompt.toLowerCase().includes(word.toLowerCase()))) {
      questionType = type;
      break;
    }
  }

  // Caso especial para o modal de aprofundamento
  if (prompt.includes("Analise profundamente o tema") || questionType === "aprofundar") {
    return generateDeepExplanation(prompt);
  }

  // Personalizar resposta com base no nível de inteligência escolhido
  const intelligenceLevel = options?.intelligenceLevel || 'normal';
  const languageStyle = options?.languageStyle || 'casual';

  let response = "";

  // Respostas base por tipo de pergunta
  const baseResponses = {
    plataforma: `A Ponto.School é uma plataforma educacional completa que oferece múltiplos recursos para ajudar em seus estudos. Na nossa plataforma, você tem acesso a EpictusIA, um assistente inteligente que cria planos de estudos personalizados, biblioteca com materiais selecionados, turmas interativas, e grupos de estudo para aprendizado colaborativo. Nosso design intuitivo e ferramentas integradas tornam o aprendizado mais eficiente e conectado.`,

    educacional: `Este é um tópico fascinante para estudar! Posso ajudar com explicações, exemplos práticos, e exercícios para fixação. A Ponto.School oferece materiais didáticos específicos sobre este assunto na nossa Biblioteca Digital. Também temos grupos de estudo relacionados onde você pode discutir e aprofundar seus conhecimentos com outros estudantes interessados. O EpictusIA pode criar um plano de estudos personalizado sobre este tema específico.`,

    técnico: `Programação e desenvolvimento técnico são áreas essenciais hoje em dia. Na Ponto.School, temos recursos específicos para aprendizado de tecnologia, incluindo tutoriais interativos, projetos práticos, e comunidades de programadores. Nossa plataforma facilita o aprendizado com feedback em tempo real e conexão com mentores experientes na área. O EpictusIA pode ajudar a criar roteiros de aprendizado técnico adaptados ao seu nível atual.`,

    ajuda: `Estou aqui para ajudar! Vamos resolver isso juntos. A Ponto.School possui um sistema de suporte abrangente para atender todas as suas necessidades. Além de mim, você pode acessar tutoriais na Biblioteca, buscar ajuda em Grupos de Estudo, ou usar o recurso de Conexão Expert para falar com especialistas em áreas específicas. Se preferir, pode também acessar nosso FAQ completo na seção de Ajuda.`,

    geral: `Obrigado por sua mensagem! A Ponto.School está sempre evoluindo para oferecer a melhor experiência educacional possível. Nossa plataforma integra inteligência artificial, recursos de estudo personalizados, e uma comunidade vibrante para maximizar seu aprendizado. Explore nossos recursos como EpictusIA, Biblioteca, Grupos de Estudo, e muito mais para aproveitar ao máximo sua jornada educacional.`
  };

  // Ajustar tamanho e complexidade da resposta com base no nível de inteligência
  switch (intelligenceLevel) {
    case 'basic':
      // Resposta curta e direta
      response = baseResponses[questionType].split('.')[0] + '.';
      break;

    case 'advanced':
      // Resposta detalhada com formatação e recursos adicionais
      const formattedResponse = baseResponses[questionType];

      // Adicionar detalhes, exemplos, e recursos da plataforma
      response = `# Resposta à sua pergunta\n\n${formattedResponse}\n\n## Recursos relacionados na Ponto.School\n\n- **EpictusIA**: Assistente de IA para aprendizado personalizado\n- **Biblioteca Digital**: Materiais de estudo curados por especialistas\n- **Grupos de Estudo**: Comunidades para aprendizado colaborativo\n- **Conexão Expert**: Mentoria com profissionais experientes\n\n## Próximos passos recomendados\n\n1. Explore o material relacionado na Biblioteca\n2. Participe dos grupos de discussão sobre este tema\n3. Utilize o EpictusIA para criar um plano de estudos personalizado\n4. Acompanhe seu progresso na Dashboard principal\n\nQuer saber mais sobre algum destes recursos específicos?`;
      break;

    case 'normal':
    default:
      // Resposta padrão com pequenos ajustes
      response = baseResponses[questionType];
      // Adicionar sugestão de recurso da plataforma
      response += ` Posso ajudar com mais alguma informação ou direcionar você para recursos específicos sobre este tema?`;
      break;
  }

  // Ajustar estilo de linguagem
  if (languageStyle === 'technical') {
    // Tornar o tom mais técnico e formal
    response = response.replace(/Estou aqui para ajudar!/g, "Seguem informações técnicas pertinentes à sua solicitação.");
    response = response.replace(/fascinante/g, "relevante");
    response = response.replace(/Obrigado por sua mensagem!/g, "Em resposta à sua solicitação:");
    response = response.replace(/!/g, ".");
  } else if (languageStyle === 'casual') {
    // Tornar o tom mais informal e amigável
    response = response.replace(/A Ponto.School possui um sistema/g, "A Ponto.School tem um sistema");
    response = response.replace(/oferece múltiplos recursos/g, "oferece vários recursos legais");
    // Adicionar emojis para tom mais casual
    response = response.replace(/\. /g, ". 😊 ");
    response = response.replace(/\? /g, "? 👍 ");
  }

  return response;
};

// Função para gerar explicações aprofundadas para o modal de aprofundamento
const generateDeepExplanation = (prompt: string): string => {
  // Analisar o prompt para identificar o conteúdo original a ser aprofundado
  const originalContentMatch = prompt.match(/Mensagem original: "(.*?)"/s);
  let originalContent = '';

  if (originalContentMatch && originalContentMatch[1]) {
    originalContent = originalContentMatch[1];
  }

  // Extrair palavras-chave para determinar o tema principal
  const keywords = extractKeywords(originalContent);

  // Determinar tema geral baseado nas palavras-chave
  const theme = determineTheme(keywords);

  // Gerar uma explicação detalhada baseada no tema
  let deepExplanation = '';

  switch (theme) {
    case 'matemática':
      deepExplanation = `# Matemática: Conceitos Fundamentais e Aplicações

## Introdução ao Tema

A matemática é muito mais do que apenas números e fórmulas; é uma linguagem universal que nos permite descrever padrões, relações e estruturas. Seu desenvolvimento atravessa milênios de história humana, com contribuições de diversas civilizações.

## Contexto Histórico

A jornada matemática começou com necessidades práticas de contagem e medição. Os babilônios desenvolveram um sofisticado sistema numérico de base 60, cuja influência ainda persiste em nossa medição de tempo. Os egípcios criaram métodos para cálculos de áreas e volumes essenciais para agricultura e construção. Na Grécia Antiga, matemáticos como Euclides, Pitágoras e Arquimedes transformaram a matemática em uma ciência dedutiva baseada em axiomas, definições e teoremas.

Durante a Era de Ouro Islâmica (séculos VIII-XIV), estudiosos como Al-Khwarizmi, cujo nome originou a palavra "algoritmo", preservaram e expandiram o conhecimento matemático, introduzindo conceitos fundamentais de álgebra. O Renascimento europeu trouxe avanços significativos com figuras como Fibonacci, Cardano e Descartes, que conectou geometria e álgebra.

Nos séculos XVII e XVIII, Newton e Leibniz simultaneamente desenvolveram o cálculo diferencial e integral, ferramentas essenciais para descrever mudanças e acumulações. O século XX viu a formalização da matemática moderna com contribuições de Hilbert, Gödel, Turing, entre outros.

## Conceitos Fundamentais

A matemática se organiza em diversas áreas interconectadas:

- **Aritmética**: Estuda operações básicas com números (adição, subtração, multiplicação, divisão)
- **Álgebra**: Generaliza a aritmética usando variáveis e equações para expressar relações
- **Geometria**: Investiga propriedades de formas, tamanhos, posições relativas de figuras e espaço
- **Cálculo**: Examina mudanças contínuas através de derivadas e integrais
- **Teoria dos Números**: Explora propriedades e relações entre números inteiros
- **Estatística e Probabilidade**: Analisa dados, variabilidade e incerteza
- **Lógica Matemática**: Estuda métodos formais de raciocínio

## Aplicações Práticas

A matemática permeia praticamente todos os aspectos da vida moderna:

1. **Ciências Naturais**: Física, química e biologia utilizam matemática extensivamente para modelar fenômenos naturais
2. **Engenharia**: Projetos, análises estruturais e sistemas dependem de cálculos matemáticos precisos
3. **Tecnologia**: Computação, criptografia, inteligência artificial e processamento de dados são fundamentados em conceitos matemáticos
4. **Economia e Finanças**: Modelos econômicos, análises de risco e instrumentos financeiros baseiam-se em matemática avançada
5. **Medicina**: Desde dosagens de medicamentos até imageamento médico e modelagem epidemiológica
6. **Artes e Design**: Proporções, perspectiva, padrões e algoritmos generativos

## Interdisciplinaridade

A matemática fornece ferramentas conceituais para diversas disciplinas:

- **Física-Matemática**: Equações diferenciais descrevem fenômenos físicos fundamentais
- **Biologia Matemática**: Modelos matemáticos explicam crescimento populacional, epidemias e sistemas biológicos
- **Psicologia Cognitiva**: Modelos matemáticos ajudam a entender processos de tomada de decisão e funções cerebrais
- **Linguística Computacional**: Algoritmos matemáticos analisam estruturas e padrões linguísticos

## Desafios Contemporâneos

A matemática continua evoluindo para enfrentar questões complexas:

- **Problemas do Milênio**: Sete problemas fundamentais com prêmio de $1 milhão cada
- **Inteligência Artificial**: Novas estruturas matemáticas para aprendizado de máquina
- **Ciência de Dados**: Métodos estatísticos avançados para análise de grandes volumes de informação
- **Matemática Quântica**: Fundamentos para computação quântica e mecânica quântica

## Conclusão

A matemática é simultaneamente uma criação humana abstrata e uma ferramenta para descrever a realidade física. Sua beleza reside na elegância de suas teorias e na surpreendente eficácia em explicar o universo. O desenvolvimento do pensamento matemático não apenas reflete nossa capacidade de abstração, mas também amplia nossa compreensão do mundo e potencializa avanços tecnológicos e científicos.`;
      break;

    case 'ciências':
      deepExplanation = `# O Método Científico: Fundamentos e Evolução

## Introdução ao Tema

O método científico representa o alicerce da investigação empírica moderna, fornecendo uma estrutura sistemática para explorar fenômenos naturais, testar hipóteses e construir conhecimento verificável. Mais que um procedimento rígido, é uma abordagem dinâmica e auto-corretiva para compreender o mundo.

## Contexto Histórico

O pensamento sistemático sobre a natureza tem raízes antigas. Filósofos gregos como Aristóteles propuseram observações naturais, embora frequentemente misturadas com filosofia especulativa. Durante a Idade Média islâmica, estudiosos como Ibn al-Haytham (Alhazen) enfatizaram experimentação sistemática e verificação empírica, especialmente em óptica.

A Revolução Científica europeia (séculos XVI-XVII) marcou uma transformação fundamental. Figuras como Francis Bacon advogaram pela indução a partir de observações, enquanto Galileu Galilei combinou experimentação controlada com matemática. René Descartes enfatizou o raciocínio dedutivo e o ceticismo metódico. Isaac Newton posteriormente sintetizou abordagens experimentais e matemáticas.

Nos séculos XIX e XX, o método científico foi refinado com ferramentas estatísticas, delineamento experimental e técnicas de replicação, embora filósofos como Karl Popper e Thomas Kuhn tenham destacado suas limitações e a importância de fatores sociais na construção do conhecimento científico.

## Princípios Fundamentais

O método científico moderno incorpora vários elementos essenciais:

1. **Observação**: Coleta sistemática de informações sobre fenômenos
2. **Questionamento**: Formulação de perguntas testáveis
3. **Hipótese**: Proposição de explicação provisória
4. **Predição**: Consequências lógicas da hipótese
5. **Experimentação**: Testes controlados para verificar predições
6. **Análise**: Interpretação de resultados, frequentemente usando estatística
7. **Conclusão**: Avaliação da hipótese com base nos resultados
8. **Comunicação**: Compartilhamento de métodos e resultados para revisão por pares
9. **Replicação**: Repetição de experimentos para verificar consistência
10. **Refinamento**: Modificação de teorias com base em novas evidências

## Aplicações Práticas

O método científico transcende laboratórios, informando:

- **Medicina Baseada em Evidências**: Tratamentos fundamentados em ensaios clínicos rigorosos
- **Engenharia**: Testes sistemáticos de materiais e designs
- **Políticas Públicas**: Programas avaliados através de dados empíricos
- **Agricultura**: Métodos de cultivo otimizados por experimentos controlados
- **Tecnologia**: Desenvolvimento iterativo baseado em testes e feedback
- **Ciência Forense**: Análise sistemática de evidências criminais
- **Gestão Empresarial**: Decisões baseadas em dados e experimentação

## Interdisciplinaridade

O método científico conecta-se a diversos campos:

- **Filosofia da Ciência**: Examina premissas, limitações e implicações da metodologia científica
- **Sociologia do Conhecimento**: Investiga influências sociais na produção científica
- **Psicologia Cognitiva**: Estuda vieses que afetam raciocínio científico
- **Ética**: Considera implicações morais da pesquisa
- **Comunicação**: Explora transmissão eficaz de descobertas científicas

## Desafios Contemporâneos

A ciência moderna enfrenta questões complexas:

- **Reprodutibilidade**: Muitos resultados publicados não são replicáveis
- **Complexidade Estatística**: Análises sofisticadas podem produzir resultados espúrios
- **Viés de Publicação**: Tendência a publicar apenas resultados positivos
- **Democratização**: Equilíbrio entre expertise especializada e participação pública
- **Questões Interdisciplinares**: Problemas que transcendem disciplinas individuais
- **Modelagem Computacional**: Integração de simulações com experimentação tradicional
- **Ciência Aberta**: Movimento para transparência, dados abertos e acesso livre

## Conclusão

O método científico representa uma das mais poderosas ferramentas intelectuais desenvolvidas pela humanidade. Sua estrutura sistemática e auto-corretiva permite distinguir afirmações justificadas empiricamente de especulações infundadas. Embora tenha limitações e esteja sujeito a influências sociais e culturais, continua sendo nosso melhor instrumento para construir conhecimento confiável sobre o mundo natural. A ciência moderna reconhece sua natureza provisória e iterativa, onde teorias são continuamente refinadas à luz de novas evidências.`;
      break;

    case 'história':
      deepExplanation = `# Revoluções Industriais: Transformações Tecnológicas e Sociais

## Introdução ao Tema

As Revoluções Industriais representam períodos de transformação tecnológica acelerada que reconfiguraram fundamentalmente as estruturas econômicas, sociais e políticas globais. Estes momentos de inflexão histórica não foram apenas transições tecnológicas, mas complexas reconfigurações da relação humana com trabalho, tempo, espaço e natureza.

## Contexto Histórico

### Primeira Revolução Industrial (c. 1760-1840)

Originada na Grã-Bretanha, esta transformação inicial caracterizou-se pela transição de métodos manuais para processos mecanizados. Fatores-chave incluíam:

- **Inovações técnicas**: A máquina a vapor de Watt, o tear mecânico e avanços metalúrgicos
- **Novos sistemas energéticos**: Substituição de energia humana, animal e hídrica pelo carvão
- **Transformações sociais**: Urbanização acelerada e surgimento do proletariado industrial
- **Antecedentes necessários**: Excedentes agrícolas, acumulação de capital mercantil e transformações na propriedade rural (cercamentos)

A indústria têxtil liderou esta revolução, com fábricas de algodão aumentando drasticamente a produtividade. Cidades industriais como Manchester cresceram exponencialmente, frequentemente com condições sanitárias precárias e habitações inadequadas para a massa trabalhadora.

### Segunda Revolução Industrial (c. 1870-1914)

Este período testemunhou a difusão da industrialização para Europa continental, América do Norte e Japão, caracterizando-se por:

- **Novas fontes energéticas**: Eletricidade e petróleo complementando o carvão
- **Inovações químicas**: Fertilizantes sintéticos, corantes e medicamentos
- **Avanços em comunicação**: Telégrafo e telefone encurtando distâncias
- **Produção em massa**: Linha de montagem e padronização
- **Gestão científica**: Taylorismo e racionalização do processo produtivo

Empresas cresceram em escala e complexidade, surgindo corporações multinacionais e oligopólios. A competição por mercados e recursos intensificou o imperialismo europeu, enquanto tensões geopolíticas alimentaram a corrida armamentista que culminaria na Primeira Guerra Mundial.

### Terceira Revolução Industrial (c. 1950-2000)

Também chamada revolução digital ou informacional, caracterizou-se por:

- **Computação e automação**: Dispositivos eletrônicos substituindo componentes mecânicos
- **Telecomunicações avançadas**: Satélites, fibra óptica e internet
- **Miniaturização**: Transistores e microchips
- **Energia nuclear**: Novas possibilidades energéticas
- **Organização flexível**: Toyotismo substituindo produção fordista rígida

Esta fase viu a emergência de economias de serviços nas nações desenvolvidas, com manufatura frequentemente realocada para países em desenvolvimento. Globalização econômica intensificou-se, com cadeias de valor fragmentadas geograficamente.

### Quarta Revolução Industrial (c. 2010-presente)

Atualmente em curso, caracteriza-se pela fusão de tecnologias que borram fronteiras entre esferas física, digital e biológica:

- **Inteligência artificial e aprendizado de máquina**
- **Internet das coisas e sensores ubíquos**
- **Robótica avançada e manufatura aditiva (impressão 3D)**
- **Biotecnologia e edição genética**
- **Computação quântica e tecnologias imersivas**

## Impactos Socioeconômicos

As revoluções industriais produziram transformações profundas:

### Econômicos
- Crescimento econômico sem precedentes, com aumento exponencial de produtividade
- Novos setores econômicos e profissões emergindo enquanto outros desaparecem
- Reorganização da divisão internacional do trabalho
- Urbanização acelerada e transformação da paisagem

### Sociais
- Ascensão de novas classes sociais e reconfiguração de relações de poder
- Transformações na estrutura familiar e papéis de gênero
- Aumento inicial da desigualdade seguido por redistribuição em alguns contextos
- Melhorias materiais massivas, especialmente em expectativa de vida, saúde e alfabetização

### Ambientais
- Intensificação da extração de recursos naturais
- Poluição atmosférica, hídrica e degradação de ecossistemas
- Alteração climática antropogênica
- Desenvolvimento gradual de tecnologias mais eficientes e limpas

## Perspectivas Teóricas

Diferentes tradições intelectuais interpretam as revoluções industriais distintamente:

- **Liberal/Whig**: Celebra inovação, empreendedorismo e progresso material
- **Marxista**: Enfatiza exploração de classe, alienação e contradições do capitalismo
- **Ecológica**: Destaca insustentabilidade do crescimento industrial e rupturas metabólicas
- **Feminista**: Examina transformações no trabalho reprodutivo e nas relações de gênero
- **Pós-colonial**: Analisa assimetrias globais e continuidades com exploração colonial

## Conclusão

As revoluções industriais representam inflexões decisivas na trajetória humana, comparáveis em impacto apenas à revolução neolítica que originou a agricultura. Cada fase trouxe simultaneamente oportunidades extraordinárias e desafios profundos, demonstrando a complexa dialética entre transformação tecnológica e reconfiguração social. A quarta revolução industrial, ainda em desdobramento, promete mudanças talvez mais rápidas e disruptivas que suas antecessoras, levantando questões fundamentais sobre trabalho, privacidade, distribuição de riqueza e sustentabilidade planetária.`;
      break;

    case 'tecnologia':
      deepExplanation = `# Inteligência Artificial: Fundamentos, Avanços e Implicações

## Introdução ao Tema

A Inteligência Artificial (IA) representa uma das fronteiras mais dinâmicas da computação moderna, buscando criar sistemas capazes de realizar tarefas que tradicionalmente requerem inteligência humana. Mais que uma tecnologia singular, a IA engloba um ecossistema de abordagens, algoritmos e filosofias para simular aspectos da cognição humana.

## Contexto Histórico

A trajetória da IA atravessa várias fases distintas:

### Origens Conceituais (1940-1950)
As raízes da IA encontram-se nas formulações matemáticas de Alan Turing, incluindo a proposta do "Teste de Turing" para avaliar inteligência mecânica, e nos primeiros modelos neuronais de McCulloch e Pitts. A cibernética de Norbert Wiener estabeleceu fundamentos para sistemas auto-regulatórios.

### Nascimento Formal (1950-1960)
O termo "Inteligência Artificial" foi cunhado no famoso workshop de Dartmouth em 1956, organizado por John McCarthy. Programas pioneiros incluíam o Logic Theorist e General Problem Solver de Allen Newell e Herbert Simon. Os primeiros laboratórios de IA foram estabelecidos no MIT, Stanford e Carnegie Mellon.

### Primavera Inicial (1960-1970)
Avanços iniciais em processamento simbólico e abordagens baseadas em regras geraram otimismo. Joseph Weizenbaum criou ELIZA, simulando conversação, enquanto Terry Winograd desenvolveu SHRDLU para compreensão de linguagem natural em domínios restritos.

### Primeiro Inverno da IA (1970-1980)
Limitações técnicas e expectativas exageradas levaram a cortes de financiamento. O Relatório Lighthill no Reino Unido criticou severamente o progresso da IA, resultando em redução de apoio governamental. As promessas não cumpridas de tradução automática e compreensão generalizada da linguagem geraram ceticismo.

### Renascimento (1980-1990)
Sistemas especialistas comerciais revitalizaram o campo. Exemplos notáveis incluem MYCIN para diagnósticos médicos e XCON para configuração de computadores. O Japão lançou a ambiciosa iniciativa "Computadores de Quinta Geração".

### Segundo Inverno da IA (1990-início dos anos 2000)
Novamente, limitações técnicas e expectativas inflacionadas levaram a retrações. Muitas empresas de sistemas especialistas falharam quando a manutenção provou-se mais complexa que o desenvolvimento inicial.

### Ressurgimento Moderno (meados dos anos 2000-presente)
Impulsionado por três fatores convergentes:
- **Big Data**: Disponibilidade sem precedentes de dados de treinamento
- **Poder Computacional**: GPUs e infraestrutura de nuvem viabilizando computação paralela massiva
- **Algoritmos Refinados**: Avanços em aprendizado profundo e redes neurais

Marcos recentes incluem a vitória do DeepBlue sobre Garry Kasparov em xadrez (1997), Watson da IBM vencendo no Jeopardy! (2011), AlphaGo derrotando o campeão mundial de Go (2016), e modelos generativos como GPT, DALL-E e Stable Diffusion (2020-presente).

## Fundamentos Técnicos

### Paradigmas Principais

A IA desenvolve-se através de múltiplas abordagens complementares:

#### Sistemas Simbólicos
- Baseados em representação explícita do conhecimento e lógica formal
- Utilizam regras, ontologias e inferência simbólica
- Vantagens: interpretabilidade e raciocínio explícito
- Exemplos: sistemas especialistas, planejamento automatizado

#### Aprendizado de Máquina
- Sistemas que melhoram automaticamente com experiência
- Subtipologias principais:
  - **Supervisionado**: Aprende mapeamentos de exemplos rotulados
  - **Não-supervisionado**: Descobre padrões em dados não rotulados
  - **Por reforço**: Aprende através de tentativa e erro com feedback
- Algoritmos notáveis: árvores de decisão, máquinas de vetores de suporte, florestas aleatórias

#### Aprendizado Profundo
- Redes neurais multicamadas inspiradas na estrutura cerebral
- Arquiteturas especializadas incluem:
  - **Redes Convolucionais (CNNs)**: Otimizadas para processamento visual
  - **Redes Recorrentes (RNNs)**: Para dados sequenciais
  - **Transformers**: Dominantes em processamento de linguagem natural
  - **Redes Adversariais Generativas (GANs)**: Para geração de conteúdo

### Áreas de Aplicação

A IA transformou numerosos domínios:

- **Processamento de Linguagem Natural**: Tradução, sumarização, geração de texto
- **Visão Computacional**: Reconhecimento de objetos, análise de imagens médicas
- **Sistemas de Recomendação**: Filtragem personalizada de conteúdo e produtos
- **Robótica**: Navegação autônoma, manipulação de objetos
- **Saúde**: Diagnóstico auxiliado por IA, descoberta de medicamentos
- **Finanças**: Detecção de fraudes, negociação algorítmica
- **Transportes**: Veículos autônomos, otimização logística
- **Criatividade Computacional**: Geração de arte, música e narrativas

## Implicações Sociais e Éticas

O desenvolvimento acelerado da IA levanta questões fundamentais:

### Transformações no Trabalho
- Automação de tarefas cognitivas e manuais
- Criação de novas profissões versus obsolescência ocupacional
- Desigualdades potenciais na distribuição de benefícios
- Necessidade de educação continuada e requalificação

### Vieses e Justiça Algorítmica
- IA herda e amplifica preconceitos presentes nos dados de treinamento
- Discriminação algorítmica em setores críticos como empréstimos, contratações e justiça criminal
- Desafios de auditabilidade em sistemas "caixa-preta"

### Privacidade e Vigilância
- Tecnologias de reconhecimento facial e análise comportamental
- Tensão entre personalização de serviços e coleta pervasiva de dados
- Manipulação potencial baseada em modelagem psicométrica

### Segurança e Controle
- Cibersegurança e IA adversarial
- Armas autônomas e militarização da IA
- Desafio do alinhamento de valores em sistemas avançados

### Governança e Regulação
- Abordagens nacionais divergentes (EUA, China, UE)
- Regulação baseada em risco versus baseada em princípios
- Padrões emergentes como AI Act europeu e diretrizes da OCDE

## Fronteiras da Pesquisa

Áreas de investigação ativa incluem:

- **IA Explicável (XAI)**: Tornando sistemas complexos interpretáveis
- **Aprendizado por Transferência**: Aplicando conhecimento entre domínios
- **Aprendizado com Poucos Exemplos**: Reduzindo necessidade de dados massivos
- **IA Multimodal**: Integrando texto, imagem, áudio e outros sinais
- **Modelos de Fundação**: Sistemas pré-treinados adaptáveis a múltiplas tarefas
- **IA Neurossimbólica**: Combinando raciocínio simbólico com aprendizado neural
- **IA Inspirada Biologicamente**: Incorporando insights das neurociências

## Conclusão

A Inteligência Artificial representa uma das mais transformadoras tecnologias do século XXI, com potencial para remodelar fundamentalmente como vivemos, trabalhamos e interagimos. Seu desenvolvimento acelerado oferece oportunidades extraordinárias para avanços humanos, desde melhoria na saúde até solução de desafios complexos como mudanças climáticas. Contudo, também apresenta riscos significativos relacionados a automação em massa, vigilância, desigualdade e concentração de poder. O direcionamento desta tecnologia para benefício amplo e equitativo exigirá não apenas avanços técnicos contínuos, mas também deliberação social sofisticada, marcos regulatórios adaptáveis e cooperação internacional. A forma como navegarmos esta revolução tecnológica definirá em grande parte nosso futuro coletivo.`;
      break;

    default:
      // Resposta genérica para outros temas
      deepExplanation = `# Aprofundamento Detalhado do Tema

## Contexto Histórico e Evolução do Conceito

Este tema tem raízes profundas que se estendem através de diversos períodos históricos. Inicialmente desenvolvido como resposta a necessidades específicas de seu tempo, evoluiu significativamente através de contribuições de pensadores, pesquisadores e praticantes de diferentes culturas e épocas.

A compreensão contemporânea incorpora múltiplas dimensões que raramente são exploradas em explicações introdutórias. Ao examinar o desenvolvimento histórico, identificamos tendências, rupturas e continuidades que iluminam não apenas o passado, mas também trajetórias futuras potenciais.

## Fundamentos Teóricos e Conceituais

Os alicerces teóricos deste tema são multifacetados, envolvendo princípios de áreas complementares que se interseccionam para formar um corpo de conhecimento robusto. Estes fundamentos incluem:

- **Princípios estruturais**: Elementos fundamentais que definem o campo e sua organização interna
- **Modelos explicativos**: Esquemas conceituais que fornecem interpretações coerentes de fenômenos observados
- **Paradigmas dominantes**: Estruturas de pensamento que orientam pesquisa e aplicação
- **Abordagens alternativas**: Perspectivas complementares ou contestadoras que enriquecem o campo

A integração destes elementos cria um panorama conceitual rico, possibilitando análises em diferentes níveis de abstração e aplicabilidade.

## Aplicações Práticas e Exemplos Concretos

Na prática, este conhecimento manifesta-se através de aplicações diversificadas, incluindo:

1. **Aplicações cotidianas**: Como estes conceitos influenciam experiências diárias
2. **Implementações profissionais**: Utilização em contextos especializados e técnicos
3. **Estudos de caso exemplares**: Situações reais que demonstram princípios em ação
4. **Tendências emergentes**: Novas direções de aplicação em desenvolvimento

Através destes exemplos, podemos observar como princípios abstratos transformam-se em resultados tangíveis, validando e expandindo o conhecimento teórico.

## Pesquisas Contemporâneas e Avanços Recentes

O campo continua em evolução dinâmica, com pesquisas recentes expandindo fronteiras de compreensão. Avanços notáveis incluem:

- Desenvolvimento de metodologias inovadoras que permitem investigações mais precisas
- Descobertas que desafiam pressupostos estabelecidos
- Integração com tecnologias emergentes, abrindo novas possibilidades
- Colaborações interdisciplinares que enriquecem perspectivas

Estas pesquisas não apenas respondem a questões existentes, mas frequentemente geram novas perguntas, impulsionando o ciclo contínuo de investigação científica.

## Perspectivas Interdisciplinares

A compreensão completa deste tema beneficia-se enormemente de conexões com múltiplas disciplinas, incluindo:

- **Conexões humanísticas**: Relações com filosofia, história e estudos culturais
- **Interfaces científicas**: Vínculos com ciências naturais e sociais
- **Dimensões tecnológicas**: Intersecções com avanços técnicos e computacionais
- **Implicações sociais**: Impactos em estruturas sociais, políticas e econômicas

Esta interdisciplinaridade revela camadas de significado e aplicação que permanecem ocultas em análises isoladas.

## Desafios e Controvérsias

Como qualquer campo intelectual vibrante, este tema incorpora debates ativos e questões não resolvidas:

1. **Tensões conceituais**: Áreas onde definições e interpretações competem
2. **Desafios metodológicos**: Obstáculos para pesquisa e aplicação efetiva
3. **Questões éticas**: Considerações morais relevantes para teoria e prática
4. **Limitações conhecidas**: Fronteiras reconhecidas do conhecimento atual

Estas controvérsias, longe de enfraquecerem o campo, constituem o motor de seu desenvolvimento contínuo.

## Prospectivas Futuras

Olhando adiante, várias trajetórias potenciais emergem:

- Desenvolvimento de novas ferramentas analíticas e metodológicas
- Expansão para domínios de aplicação inexplorados
- Síntese de perspectivas atualmente divergentes
- Respostas a desafios emergentes em contextos globais

Estas direções futuras prometem não apenas avanços incrementais, mas potencialmente transformações paradigmáticas.

## Conclusão

Este aprofundamento ilustra a riqueza multidimensional do tema, transcendendo explicações superficiais para revelar suas complexidades, nuances e profundidade. A apreciação destas dimensões ampliadas não apenas enriquece o conhecimento teórico, mas também potencializa aplicações mais sofisticadas e contextualmente apropriadas, demonstrando o valor intrínseco de uma compreensão verdadeiramente aprofundada.`;
  }

  return deepExplanation;
};

// Função auxiliar para extrair palavras-chave de um texto
const extractKeywords = (text: string): string[] => {
  // Lista de palavras de parada em português
  const stopWords = ["de", "a", "o", "que", "e", "do", "da", "em", "um", "para", "é", "com", "não", "uma", "os", "no", "se", "na", "por", "mais", "as", "dos", "como", "mas", "foi", "ao", "ele", "das", "tem", "à", "seu", "sua", "ou", "ser", "quando", "muito", "há", "nos", "já", "está", "eu", "também", "só", "pelo", "pela", "até", "isso", "ela", "entre", "era", "depois", "sem", "mesmo", "aos", "ter", "seus", "quem", "nas", "me", "esse", "eles", "estão", "você", "tinha", "foram", "essa", "num", "nem", "suas", "meu", "às", "minha", "têm", "numa", "pelos", "elas", "havia", "seja", "qual", "será", "nós", "tenho", "lhe", "deles", "essas", "esses", "pelas", "este", "fosse", "dele", "tu", "te", "vocês", "vos", "lhes", "meus", "minhas", "teu", "tua", "teus", "tuas", "nosso", "nossa", "nossos", "nossas", "dela", "delas", "esta", "estes", "estas", "aquele", "aquela", "aqueles", "aquelas", "isto", "aquilo", "estou", "está", "estamos", "estão", "estive", "esteve", "estivemos", "estiveram", "estava", "estávamos", "estavam", "estivera", "estivéramos", "esteja", "estejamos", "estejam", "estivesse", "estivéssemos", "estivessem", "estiver", "estivermos", "estiverem", "sou", "somos", "são", "era", "éramos", "eram", "fui", "foi", "fomos", "foram", "fora", "fôramos", "seja", "sejamos", "sejam", "fosse", "fôssemos", "fossem", "for", "formos", "forem", "tenho", "tem", "temos", "tém", "tinha", "tínhamos", "tinham", "tive", "teve", "tivemos", "tiveram", "tivera", "tivéramos", "tenha", "tenhamos", "tenham", "tivesse", "tivéssemos", "tivessem", "tiver", "tivermos", "tiverem"];

  // Normalize text: remove pontuação e converta para minúsculas
  const normalizedText = text.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .replace(/\s{2,}/g, " ");

  // Tokenize text (split by whitespace)
  const allTokens = normalizedText.split(/\s+/);

  // Filter out stop words
  const significantTokens = allTokens.filter(token => 
    !stopWords.includes(token) && token.length > 3
  );

  // Count frequency of each token
  const tokenCounts = {};
  significantTokens.forEach(token => {
    tokenCounts[token] = (tokenCounts[token] || 0) + 1;
  });

  // Sort tokens by frequency and return top keywords
  return Object.entries(tokenCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(entry => entry[0]);
};

// Função auxiliar para determinar o tema geral do conteúdo
const determineTheme = (keywords: string[]): string => {
  const themeKeywords = {
    'matemática': ['número', 'equação', 'geometria', 'álgebra', 'cálculo', 'matemática', 'trigonometria', 'função', 'estatística', 'probabilidade'],
    'história': ['história', 'civilização', 'guerra', 'revolução', 'século', 'antigo', 'medieval', 'moderno', 'contemporâneo', 'política', 'social', 'cultural', 'econômica'],
    'ciências': ['ciência', 'método', 'científico', 'experimento', 'hipótese', 'teoria', 'observação', 'fenômeno', 'natureza', 'física', 'química', 'biologia'],
    'tecnologia': ['tecnologia', 'computador', 'internet', 'digital', 'software', 'hardware', 'programação', 'algoritmo', 'inteligência', 'artificial', 'rede', 'dados', 'informação']
  };

  // Contar correspondências para cada tema
  const themeScores = {};

  for (const [theme, themeWords] of Object.entries(themeKeywords)) {
    themeScores[theme] = keywords.reduce((score, keyword) => {
      return score + (themeWords.includes(keyword) ? 1 : 0);
    }, 0);
  }

  // Encontrar o tema com maior pontuação
  let bestTheme = 'geral';
  let highestScore = 0;

  for (const [theme, score] of Object.entries(themeScores)) {
    if (score > highestScore) {
      highestScore = score as number;
      bestTheme = theme;
    }
  }

  return bestTheme;
};