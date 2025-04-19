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

export const generateSimpleAIResponse = async (prompt: string, sessionId?: string) => {
  try {
    // Simulação da resposta para desenvolvimento rápido e demonstração
    // Esta função mockada será usada apenas se a API falhar
    const mockResponse = (prompt: string) => {
      if (prompt.includes("tema principal")) {
        return "Inteligência Artificial e Educação";
      } else if (prompt.includes("texto detalhado e aprofundado")) {
        return `# Inteligência Artificial na Educação: Uma Análise Aprofundada

A intersecção entre Inteligência Artificial (IA) e educação representa um dos campos mais promissores e transformadores do século XXI. Esta área tem evoluído significativamente desde seus primórdios conceituais na década de 1950 até as implementações sofisticadas que vemos hoje em ambientes educacionais ao redor do mundo.

## Contexto Histórico e Científico

O conceito de utilizar máquinas para auxiliar no processo educacional remonta à década de 1960, quando os primeiros sistemas de Instrução Assistida por Computador (CAI) foram desenvolvidos. No entanto, foi apenas com os avanços em algoritmos de aprendizado de máquina e processamento de linguagem natural nas décadas de 1990 e 2000 que a IA começou a demonstrar potencial real para transformar fundamentalmente a educação.

Os Sistemas Tutoriais Inteligentes (STI), desenvolvidos inicialmente na década de 1980, representaram um marco importante ao introduzir adaptabilidade e personalização no processo educacional automatizado. Estes sistemas já incorporavam princípios básicos de IA para modelar o conhecimento do aluno e ajustar o ensino conforme necessário.

## Fundamentos Teóricos e Evolução Conceitual

A aplicação da IA na educação baseia-se em várias teorias pedagógicas e tecnológicas convergentes:

1. **Aprendizado Adaptativo**: Fundamentado nas teorias construtivistas de Piaget e Vygotsky, este conceito propõe que o aprendizado é mais eficaz quando adaptado ao nível atual e às necessidades específicas do aluno.

2. **Análise de Aprendizado (Learning Analytics)**: Envolve a coleta e análise de dados sobre interações dos alunos com ferramentas educacionais para informar intervenções pedagógicas.

3. **Sistemas Multiagentes**: Arquiteturas de software onde vários agentes de IA colaboram para criar ambientes educacionais complexos e responsivos.

4. **Processamento de Linguagem Natural (PLN)**: Permite a comunicação em linguagem natural entre sistemas educacionais e estudantes, facilitando interações mais naturais e produtivas.

## Marcos Importantes e Desenvolvimentos Significativos

Diversos marcos históricos moldaram a evolução da IA educacional:

- **1997**: O projeto SCHOLAR, um dos primeiros sistemas tutoriais baseados em diálogo natural.
- **2011**: O lançamento da Khan Academy, que embora não utilizasse IA avançada inicialmente, estabeleceu um paradigma de aprendizado online personalizado.
- **2016**: O advento de chatbots educacionais mais sofisticados, capazes de responder perguntas dos alunos em tempo real.
- **2020**: A pandemia de COVID-19 acelerou dramaticamente a adoção de tecnologias educacionais baseadas em IA.
- **2023**: O surgimento de modelos generativos de grande escala (LLMs) como tutores virtuais capazes de explicações personalizadas em diversos tópicos.

## Debates Acadêmicos e Perspectivas Críticas

O campo não está isento de controvérsias e debates significativos:

- **Viés Algorítmico**: Preocupações de que sistemas de IA podem perpetuar ou amplificar desigualdades existentes no sistema educacional.
- **Privacidade e Ética**: Questões sobre a coleta de dados de estudantes, especialmente menores de idade.
- **Substituição vs. Ampliação**: Debate sobre se a IA deve substituir ou complementar o papel dos educadores humanos.
- **Eficácia Pedagógica**: Questionamentos sobre a real eficácia de abordagens baseadas em IA em comparação com métodos tradicionais.

## Relações com Outras Áreas do Conhecimento

A IA educacional está intrinsecamente relacionada a diversas disciplinas:

- **Psicologia Cognitiva**: Informando como modelar o processo de aprendizado no desenvolvimento de sistemas tutoriais.
- **Ciência da Computação**: Fornecendo algoritmos e estruturas para implementação técnica.
- **Ciências da Educação**: Orientando a pedagogia subjacente aos sistemas de IA.
- **Neurociência**: Contribuindo com insights sobre como o cérebro aprende e retém informações.
- **Sociologia da Educação**: Abordando questões de acesso, equidade e impacto social das tecnologias educacionais.

O futuro da IA na educação promete avanços ainda mais significativos, com sistemas cada vez mais capazes de personalizar completamente a experiência educacional, avaliar habilidades complexas e criar ambientes imersivos para aprendizado. No entanto, o equilíbrio entre inovação tecnológica e valores educacionais fundamentais continuará sendo um desafio central para pesquisadores, educadores e formuladores de políticas.`;
      } else if (prompt.includes("termos técnicos")) {
        return `[
  {
    "termo": "Aprendizado Adaptativo",
    "definicao": "Sistema educacional que utiliza algoritmos de IA para ajustar o conteúdo, ritmo e método de ensino de acordo com as necessidades individuais, preferências de aprendizado e desempenho de cada estudante."
  },
  {
    "termo": "Learning Analytics",
    "definicao": "Campo que se dedica à coleta, medição, análise e relato de dados sobre alunos e seus contextos, com o objetivo de compreender e otimizar o aprendizado e os ambientes em que ocorre."
  },
  {
    "termo": "Sistemas Tutoriais Inteligentes (STI)",
    "definicao": "Sistemas computacionais que fornecem instrução ou feedback personalizado aos alunos sem intervenção humana direta, utilizando algoritmos de IA para modelar o conhecimento do aluno, identificar lacunas e adaptar o ensino."
  }
]`;
      } else if (prompt.includes("aplicações práticas")) {
        return `# Principais Aplicações Práticas da IA na Educação

## 1. Personalização do Aprendizado em Escala
A IA permite criar experiências educacionais verdadeiramente personalizadas para cada estudante. Sistemas como Carnegie Learning e DreamBox Learning utilizam algoritmos adaptativos para ajustar constantemente o conteúdo, ritmo e método de ensino com base no desempenho individual, preferências de aprendizado e necessidades específicas. Isso possibilita atender simultaneamente dezenas de milhares de alunos com experiências personalizadas - algo impossível em modelos tradicionais.

## 2. Assistentes Virtuais e Tutores Inteligentes
Plataformas como Duolingo (para aprendizado de idiomas) e Khan Academy implementam tutores virtuais que fornecem feedback imediato, respondem perguntas e oferecem suporte fora do horário escolar. Estes assistentes podem identificar padrões de erro, recomendar recursos adicionais e manter os alunos engajados através de técnicas de gamificação. Estudos mostram que o acesso a tutores 24/7 pode reduzir significativamente a desistência em disciplinas desafiadoras.

## 3. Automação de Tarefas Administrativas e Avaliação
Ferramentas de IA como Gradescope estão revolucionando a avaliação educacional, sendo capazes de corrigir automaticamente testes, detectar plágio, fornecer feedback detalhado e identificar lacunas de aprendizado comuns em uma turma. Isto libera os educadores de tarefas repetitivas, permitindo que dediquem mais tempo à instrução de qualidade e intervenções personalizadas. Estudos indicam que professores podem economizar até 30% de seu tempo com estas ferramentas.`;
      } else {
        return "Conteúdo gerado por IA para: " + prompt;
      }
    };

    // Adicionar timeout para a requisição
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos de timeout

    try {
      const response = await fetch('/api/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, sessionId }),
        signal: controller.signal
      });

      clearTimeout(timeoutId); // Limpar o timeout se a requisição completar

      if (!response.ok) {
        console.warn(`Erro na API (código ${response.status}), usando resposta simulada`);
        return mockResponse(prompt);
      }

      const data = await response.json();

      // Verificar se a resposta é válida
      if (!data.response || typeof data.response !== 'string' || data.response.trim() === '') {
        console.warn('Resposta vazia ou inválida do servidor, usando resposta simulada');
        return mockResponse(prompt);
      }

      return data.response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      console.log('Fallback para resposta simulada local');
      return mockResponse(prompt);
    }
  } catch (finalError) {
    console.error('Erro crítico em generateSimpleAIResponse:', finalError);
    return "A Inteligência Artificial está processando muitas solicitações neste momento. Este é um texto de exemplo para demonstrar como o conteúdo apareceria normalmente.";
  }
};