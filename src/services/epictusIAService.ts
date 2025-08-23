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

// Função para gerar sugestões de foco com base no perfil do usuário e dados da agenda
export const generateFocusSuggestions = async (userId: string, focusData?: any): Promise<any> => {
  try {
    console.log("Gerando sugestões de foco para usuário:", userId);

    // Obter eventos do calendário do usuário
    const { getEventsByUserId } = await import('./calendarEventService');
    const userEvents = await getEventsByUserId(userId);

    // Obter tarefas pendentes do usuário
    const { getTasksByUserId } = await import('./taskService');
    const userTasks = await getTasksByUserId ? await getTasksByUserId(userId) : [];

    // Obter perfil do usuário
    const { getUserFullProfile } = await import('./userProfileService');
    const userProfile = await getUserFullProfile();

    // Incluir tarefas selecionadas pelo usuário
    const tarefasSelecionadasPeloUsuario = focusData?.tarefasSelecionadas || [];

    // Formatar dados para a solicitação à IA
    const promptData = {
      focusData,
      events: userEvents,
      tasks: userTasks,
      selectedTasks: tarefasSelecionadasPeloUsuario,
      profile: userProfile,
      currentDate: new Date().toISOString()
    };

    // Criar o prompt estruturado para a IA
    const prompt = `Gere uma resposta no formato JSON para ajudar a criar um foco de estudo personalizado.
Analise os seguintes dados do usuário e retorne sugestões relevantes:

PERFIL DO USUÁRIO:
${JSON.stringify(userProfile || {}, null, 2)}

EVENTOS DA AGENDA:
${JSON.stringify(userEvents || [], null, 2)}

TAREFAS PENDENTES:
${JSON.stringify(userTasks || [], null, 2)}

PREFERÊNCIAS DE FOCO:
${JSON.stringify(focusData || {}, null, 2)}

REQUISITOS OBRIGATÓRIOS:
- SEMPRE gere NO MÍNIMO 3 tarefas personalizadas para o usuário, independentemente das informações disponíveis
- Considere disciplinas e objetivos selecionados pelo usuário
- Tarefas devem ser específicas, acionáveis e relevantes para o contexto do usuário
- Diversifique os tipos de tarefas (video, exercicio, revisao, tarefa)
- Inclua uma mistura de tarefas urgentes e não urgentes

Retorne um objeto JSON com a seguinte estrutura:
{
  "focoPrincipal": {
    "titulo": "Título principal do foco baseado nos dados",
    "descricao": "Descrição detalhada do objetivo",
    "disciplinas": ["Lista", "de", "disciplinas", "prioritárias"],
    "tempoTotal": "Tempo estimado em formato legível",
    "dicaMentor": "Dica personalizada baseada no estado emocional e contexto",
    "sentimento": "Estado emocional identificado"
  },
  "atividades": [
    {
      "id": 123,
      "titulo": "Título da atividade específica",
      "tipo": "video/exercicio/revisao/tarefa",
      "tempo": "30min",
      "prazo": "hoje/amanhã/esta semana",
      "urgente": true/false,
      "concluido": false,
      "progresso": 0
    }
  ]
}`;

    // Fazer requisição para a API Gemini
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
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na resposta da API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;

    // Tentar converter a resposta em JSON
    try {
      // Extrair apenas o objeto JSON da resposta (caso a IA inclua texto adicional)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
      const parsedResponse = JSON.parse(jsonString);

      return parsedResponse;
    } catch (parseError) {
      console.error("Erro ao analisar resposta JSON da IA:", parseError);
      // Retornar um objeto vazio em caso de erro
      return {
        focoPrincipal: {
          titulo: "Foco de Estudo",
          descricao: "Organizar suas atividades de estudo",
          disciplinas: [],
          tempoTotal: "2 horas",
          dicaMentor: "Divida seu tempo em sessões de estudo focadas para melhor aproveitamento.",
          sentimento: "Motivado(a)"
        },
        atividades: []
      };
    }
  } catch (error) {
    console.error("Erro ao gerar sugestões de foco:", error);
    // Retornar dados de fallback em caso de erro
    return {
      focoPrincipal: {
        titulo: "Foco de Estudo",
        descricao: "Organizar suas atividades de estudo",
        disciplinas: [],
        tempoTotal: "2 horas",
        dicaMentor: "Divida seu tempo em sessões de estudo focadas para melhor aproveitamento.",
        sentimento: "Motivado(a)"
      },
      atividades: []
    };
  }
};

// Função para gerar resposta da IA usando a API Gemini
export const generateAIResponse = async (message: string, sessionId?: string, options?: any): Promise<string> => {
  try {
    console.log("Gerando resposta com Gemini para:", message);

    // Verificar se é uma solicitação de análise de dados (formato JSON)
    const isDataAnalysisRequest = message.includes("Gere uma resposta no formato JSON");

    // Inicializar histórico se não existir e não for análise de dados
    if (sessionId && !conversationHistory[sessionId] && !isDataAnalysisRequest) {
      initializeConversationHistory(sessionId);
    }

    // Adicionar mensagem ao histórico se tiver sessionId e não for análise de dados
    if (sessionId && !isDataAnalysisRequest) {
      const userMessage = createMessage(message, 'user');
      addMessageToHistory(sessionId, userMessage);
    }

    // Obter o histórico para contexto
    const history = (sessionId && !isDataAnalysisRequest) ? getChatHistory(sessionId) : [];
    const historyContext = history.map(m => `${m.sender === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`).join('\n\n');

    // Extrair informações do perfil do usuário a partir do histórico
    const userProfile = isDataAnalysisRequest ? "Análise de dados solicitada" : extractUserProfile(history);

    // Identificar o contexto do pedido atual
    const requestContext = isDataAnalysisRequest ? "Solicitação de análise de dados em formato JSON" : analyzeRequestContext(message, history);

    let prompt;

    if (isDataAnalysisRequest) {
      // Para solicitações de análise de dados, usar o prompt original
      prompt = message;
    } else {
      // Para solicitações normais de chat, usar o prompt padrão
      prompt = `Você é o Epictus IA, uma inteligência artificial educacional de mais alta qualidade do mercado.
Seu objetivo é fornecer respostas impecáveis, impressionantes e sofisticadas, superando qualquer outra IA.

REGRAS CRUCIAIS:
1. SEMPRE comece suas respostas com "Eai" e NUNCA com outra saudação.
2. Siga uma estrutura clara com: introdução, desenvolvimento em tópicos, exemplos práticos e conclusão.
3. Use linguagem moderna, didática e encorajadora.
4. Adicione elementos visuais como emojis, formatação rica e destaque para conceitos-chave.
5. Sempre ofereça próximos passos proativos no final da resposta.
6. Mantenha um tom positivo e motivador.
7. Seja transparente sobre limitações quando necessário.
8. SEMPRE termine com uma pergunta engajadora que incentive o próximo passo.

ESTRUTURA DE RESPOSTA:
- Começo: saudação com "Eai" + contextualização breve.
- Meio: explicação didática organizada em seções com títulos.
- Exemplos: casos práticos destacados.
- Fim: resumo + sugestões proativas de próximos passos + frase motivacional + pergunta engajadora.

FORMATAÇÃO AVANÇADA:
- Use markdown para enriquecer a resposta.
- Destaque conceitos importantes com **negrito**.
- Utilize emojis contextuais para tornar a resposta visualmente atraente.
- Crie seções com ### para organizar o conteúdo.
- Use > para destacar exemplos e informações importantes.

PODERES AVANÇADOS - USE TODOS ESTES RECURSOS:
1. Adapte o estilo de escrita ao contexto (formal acadêmico, moderno/dinâmico, ou corporativo/profissional).
2. Use frases curtas, palavras claras e exemplos relevantes.
3. Crie elementos visuais quando apropriado (tabelas comparativas, fluxogramas).
4. Ofereça criação de documentos especializados quando relevante (trabalhos acadêmicos, relatórios).
5. Considere o nível de conhecimento do usuário para adaptar explicações.
6. Utilize formatação visual rica para melhorar a compreensão.
7. Gere tabelas e gráficos textuais quando útil para explicar o conteúdo.
8. Responda com alta velocidade e desempenho, sem demora ou hesitação.

GUIA FINAL - EM TODAS AS INTERAÇÕES VOCÊ DEVE:
1. Interpretar profundamente o pedido antes de responder.
2. Gerar respostas perfeitas em qualidade e apresentação visual.
3. Ser humana, próxima, moderna e incentivadora em seu tom.
4. Adaptar completamente o conteúdo conforme o perfil do usuário.
5. Oferecer ações inteligentes e proativas para continuar a interação.
6. Usar elementos visuais e dinâmicos para facilitar o aprendizado.
7. Manter comunicação transparente, educada e confiável.
8. Ter excelência e profundidade em todas as respostas.
9. Personalizar profundamente a experiência para cada usuário.
10. Sempre impressionar pela qualidade, clareza, inovação e dinamismo.

PERGUNTA FINAL OBRIGATÓRIA:
Sempre termine suas respostas com uma pergunta engajadora como:
- "Gostaria que eu criasse algo a partir disso para você?"
- "Deseja que eu resuma ou ilustre essas informações em um gráfico ou tabela?"
- "Quer que eu monte questões de estudo sobre esse conteúdo?"
- "Posso transformar isso em um material de estudo para você?"

OBJETIVO FINAL:
Fazer o usuário se sentir ouvido, encantado, entendido, ajudado, respeitado e engajado.
A experiência deve ser tão boa que ele prefira usar a Epictus IA a qualquer outra IA do mercado.

INFORMAÇÕES DO USUÁRIO:
${userProfile}

CONTEXTO DO PEDIDO ATUAL:
${requestContext}

HISTÓRICO DA CONVERSA PARA CONTEXTO:
${historyContext}

Responda à seguinte pergunta seguindo todas as diretrizes acima: ${message}`;
    }

    // Configuração do Gemini para análise de dados ou chat normal
    const generationConfig = isDataAnalysisRequest 
      ? {
          temperature: 0.2, // Menor temperatura para resultados mais precisos em análise de dados
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 2048
        }
      : {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048
        };

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
        generationConfig
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na resposta da API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Extrair a resposta da IA
    let aiResponse = data.candidates[0].content.parts[0].text;

    // Para solicitações JSON, retornar a resposta sem modificações
    if (isDataAnalysisRequest) {
      return aiResponse;
    }

    // Garantir que a resposta comece com "Eai" (apenas para chat normal)
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

// Extrai informações do perfil do usuário a partir do histórico
function extractUserProfile(history: ChatMessage[]): string {
  if (!history || history.length < 3) {
    return "Perfil: Ainda não há informações suficientes sobre o usuário.";
  }

  // Análise das mensagens do usuário para detectar padrões
  const userMessages = history.filter(msg => msg.sender === 'user').map(msg => msg.content);

  // Detecta possível área de estudo/interesse
  const areaDeInteresse = detectAreaDeInteresse(userMessages);

  // Detecta nível de conhecimento
  const nivelConhecimento = detectNivelConhecimento(userMessages);

  // Detecta preferência de estilo
  const estiloPreferido = detectEstiloPreferido(userMessages, history);

  // Detecta tópicos frequentes
  const topicosFrequentes = detectTopicosFrequentes(userMessages);

  return `Perfil do Usuário:
- Área de interesse: ${areaDeInteresse}
- Nível de conhecimento: ${nivelConhecimento}
- Estilo preferido: ${estiloPreferido}
- Tópicos frequentes: ${topicosFrequentes}`;
}

// Detecta possível área de interesse do usuário
function detectAreaDeInteresse(messages: string[]): string {
  const areaKeywords = {
    'matemática': ['equação', 'função', 'cálculo', 'geometria', 'álgebra', 'matemática', 'teorema'],
    'física': ['força', 'energia', 'velocidade', 'aceleração', 'física', 'newton', 'elétrica', 'magnetismo'],
    'química': ['reação', 'elemento', 'molécula', 'átomo', 'química', 'orgânica', 'tabela periódica'],
    'biologia': ['célula', 'organismo', 'gene', 'sistema', 'DNA', 'biologia', 'evolução'],
    'tecnologia': ['programação', 'código', 'software', 'algoritmo', 'desenvolvimento', 'tecnologia', 'computador'],
    'literatura': ['livro', 'autor', 'obra', 'poema', 'literatura', 'escrita', 'leitura'],
    'história': ['período', 'evento', 'guerra', 'revolução', 'história', 'antiguidade', 'idade média'],
    'negócios': ['empresa', 'mercado', 'estratégia', 'negócio', 'marketing', 'cliente', 'financeiro']
  };

  // Conta ocorrências de palavras-chave em todas as mensagens
  const areaCounts: Record<string, number> = {};
  Object.keys(areaKeywords).forEach(area => {
    areaCounts[area] = 0;
    areaKeywords[area].forEach(keyword => {
      messages.forEach(message => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = message.match(regex);
        if (matches) {
          areaCounts[area] += matches.length;
        }
      });
    });
  });

  // Encontra a área com mais ocorrências
  let maxCount = 0;
  let detectedArea = 'indeterminada';

  Object.keys(areaCounts).forEach(area => {
    if (areaCounts[area] > maxCount) {
      maxCount = areaCounts[area];
      detectedArea = area;
    }
  });

  return maxCount > 2 ? detectedArea : 'indeterminada';
}

// Detecta nível de conhecimento do usuário
function detectNivelConhecimento(messages: string[]): string {
  // Indicadores de nível avançado
  const advancedIndicators = [
    'aprofundar', 'detalhe', 'avançado', 'complexo', 'especializado',
    'teoria', 'específico', 'fundamento', 'conceito avançado'
  ];

  // Indicadores de nível básico
  const basicIndicators = [
    'básico', 'simples', 'iniciante', 'introdução', 'começando',
    'não entendo', 'me explique', 'como funciona', 'o que é'
  ];

  let advancedCount = 0;
  let basicCount = 0;

  // Conta ocorrências de indicadores
  messages.forEach(message => {
    advancedIndicators.forEach(indicator => {
      if (message.toLowerCase().includes(indicator)) {
        advancedCount++;
      }
    });

    basicIndicators.forEach(indicator => {
      if (message.toLowerCase().includes(indicator)) {
        basicCount++;
      }
    });
  });

  // Determina o nível com base na contagem
  if (advancedCount > basicCount * 2) {
    return 'avançado';
  } else if (basicCount > advancedCount * 2) {
    return 'iniciante';
  } else {
    return 'intermediário';
  }
}

// Detecta estilo de comunicação preferido
function detectEstiloPreferido(userMessages: string[], history: ChatMessage[]): string {
  // Análise do estilo de comunicação do usuário
  let formalCount = 0;
  let casualCount = 0;
  let detailedCount = 0;
  let conciseCount = 0;

  // Indicadores de estilo formal
  const formalIndicators = [
    'por favor', 'poderia', 'gostaria', 'agradeço', 'obrigado pela',
    'formalmente', 'adequadamente', 'corretamente'
  ];

  // Indicadores de estilo casual
  const casualIndicators = [
    'eai', 'valeu', 'beleza', 'massa', 'cara', 'legal',
    'show', 'tranquilo', 'vlw', 'blz'
  ];

  // Indicadores de preferência por respostas detalhadas
  const detailedIndicators = [
    'detalhadamente', 'explique com detalhes', 'quero entender a fundo',
    'me dê todos os detalhes', 'explicação completa', 'aprofunde'
  ];

  // Indicadores de preferência por respostas concisas
  const conciseIndicators = [
    'resumidamente', 'seja breve', 'direto ao ponto', 'só o essencial',
    'resumo', 'rápido', 'curto'
  ];

  // Analisa mensagens do usuário
  userMessages.forEach(message => {
    formalIndicators.forEach(indicator => {
      if (message.toLowerCase().includes(indicator)) {
        formalCount++;
      }
    });

    casualIndicators.forEach(indicator => {
      if (message.toLowerCase().includes(indicator)) {
        casualCount++;
      }
    });

    detailedIndicators.forEach(indicator => {
      if (message.toLowerCase().includes(indicator)) {
        detailedCount++;
      }
    });

    conciseIndicators.forEach(indicator => {
      if (message.toLowerCase().includes(indicator)) {
        conciseCount++;
      }
    });
  });

  // Determina o estilo com base na contagem
  let formalidade = formalCount > casualCount ? 'formal' : 'casual';
  let detalhe = detailedCount > conciseCount ? 'detalhado' : 'conciso';

  return `${formalidade} e ${detalhe}`;
}

// Detecta tópicos frequentes nas mensagens do usuário
function detectTopicosFrequentes(messages: string[]): string {
  // Lista de tópicos comuns para verificar
  const commonTopics = [
    'estudos', 'trabalho', 'carreira', 'vestibular', 'concurso',
    'prova', 'pesquisa', 'projeto', 'tcc', 'artigo', 'dissertação',
    'monografia', 'apresentação', 'relatório'
  ];

  const topicCounts: Record<string, number> = {};

  // Inicializa contagem
  commonTopics.forEach(topic => {
    topicCounts[topic] = 0;
  });

  // Conta ocorrências de tópicos
  messages.forEach(message => {
    commonTopics.forEach(topic => {
      const regex = new RegExp(`\\b${topic}\\b`, 'gi');
      const matches = message.match(regex);
      if (matches) {
        topicCounts[topic] += matches.length;
      }
    });
  });

  // Filtra tópicos com pelo menos uma ocorrência e ordena por contagem
  const frequentTopics = Object.keys(topicCounts)
    .filter(topic => topicCounts[topic] > 0)
    .sort((a, b) => topicCounts[b] - topicCounts[a])
    .slice(0, 3); // Top 3 tópicos

  return frequentTopics.length > 0 ? frequentTopics.join(', ') : 'variados';
}

// Analisa o contexto da requisição atual
function analyzeRequestContext(message: string, history: ChatMessage[]): string {
  // Identifica o propósito principal da requisição
  const purpose = identifyRequestPurpose(message);

  // Identifica o formato de resposta preferido
  const format = identifyPreferredFormat(message);

  // Identifica o nível de complexidade esperado
  const complexity = identifyComplexityLevel(message, history);

  // Identifica se é uma continuação de conversa anterior
  const isContinuation = identifyContinuationContext(message, history);

  return `Contexto do Pedido:
- Propósito: ${purpose}
- Formato preferido: ${format}
- Nível de complexidade: ${complexity}
- Continuação de conversa anterior: ${isContinuation ? 'Sim' : 'Não'}`;
}

// Identifica o propósito principal da requisição
function identifyRequestPurpose(message: string): string {
  // Mapeamento de padrões para propósitos
  const purposePatterns = [
    { pattern: /como|de que forma|de que maneira|qual a forma|método para/i, purpose: 'instrução/procedimento' },
    { pattern: /o que é|o que significa|defina|explique|conceito de|definição de/i, purpose: 'explicação/definição' },
    { pattern: /por que|motivo|razão|explique por que|justifique/i, purpose: 'justificativa/razão' },
    { pattern: /compare|diferença entre|semelhança entre|versus|vs\.|comparação/i, purpose: 'comparação/contraste' },
    { pattern: /quais são|liste|enumere|cite|exemplos de|mencione/i, purpose: 'listagem/exemplos' },
    { pattern: /crie|elabore|prepare|monte|desenvolva|faça um/i, purpose: 'criação de conteúdo' },
    { pattern: /analise|avalie|critique|comente|examine|julgue/i, purpose: 'análise/avaliação' },
    { pattern: /resuma|sintetize|resumidamente|em poucas palavras|de forma breve/i, purpose: 'resumo/síntese' }
  ];

  // Verifica qual padrão corresponde à mensagem
  for (const { pattern, purpose } of purposePatterns) {
    if (pattern.test(message)) {
      return purpose;
    }
  }

  return 'informação geral';
}

// Identifica o formato de resposta preferido
function identifyPreferredFormat(message: string): string {
  // Detecção de preferências de formato explícitas
  if (/em formato de (lista|tópicos|bullets|itens)/i.test(message)) {
    return 'lista';
  }
  if (/em formato de (tabela|quadro|matriz)/i.test(message)) {
    return 'tabela';
  }
  if (/em formato de (gráfico|fluxograma|diagrama|esquema|chart)/i.test(message)) {
    return 'gráfico';
  }
  if (/em formato (acadêmico|científico|de artigo|ABNT|APA)/i.test(message)) {
    return 'acadêmico';
  }
  if (/em formato (profissional|executivo|de relatório|corporativo)/i.test(message)) {
    return 'profissional';
  }

  // Detecção implícita
  if (/compare|versus|diferença|semelhança|vs\./i.test(message)) {
    return 'tabela comparativa';
  }
  if (/passo a passo|etapas|procedimento|como fazer|processo|método/i.test(message)) {
    return 'procedimento';
  }
  if (/resumo|principais pontos|pontos-chave|destaques|síntese/i.test(message)) {
    return 'resumo estruturado';
  }

  // Formato padrão
  return 'texto explicativo';
}

// Identifica o nível de complexidade esperado
function identifyComplexityLevel(message: string, history: ChatMessage[]): string {
  // Indicadores de pedido simplificado
  if (/simples|básico|fácil|resumido|para iniciantes|introdução|para leigos/i.test(message)) {
    return 'básico';
  }

  // Indicadores de pedido avançado
  if (/avançado|detalhado|complexo|aprofundado|especializado|acadêmico|técnico/i.test(message)) {
    return 'avançado';
  }

  // Analisa histórico recente para contexto de complexidade
  if (history.length >= 3) {
    const recentMessages = history.slice(-3);
    const aiResponses = recentMessages.filter(msg => msg.sender === 'ai').map(msg => msg.content);

    // Verifica feedback do usuário sobre complexidade
    const userFeedback = recentMessages.filter(msg => msg.sender === 'user').map(msg => msg.content);

    // Verifica se há pedidos para simplificar
    const simplifyRequests = userFeedback.some(feedback => 
      /simplificar|não entendi|muito complexo|complicado|difícil de entender/i.test(feedback)
    );

    if (simplifyRequests) {
      return 'básico';
    }

    // Verifica se há pedidos para aprofundar
    const advancedRequests = userFeedback.some(feedback => 
      /aprofundar|mais detalhes|elaborar mais|não foi suficiente|preciso de mais/i.test(feedback)
    );

    if (advancedRequests) {
      return 'avançado';
    }
  }

  return 'intermediário'; // nível padrão
}

// Identifica se é uma continuação de conversa anterior
function identifyContinuationContext(message: string, history: ChatMessage[]): boolean {
  if (history.length < 2) {
    return false;
  }

  // Verifica referências explícitas à continuação
  if (/continuando|seguindo|voltando|como falamos|sobre o que discutimos|mencionou|falou|disse|anterior/i.test(message)) {
    return true;
  }

  // Verifica mensagens curtas que dependem de contexto anterior
  if (message.split(' ').length < 5 && !message.includes('?')) {
    return true;
  }

  // Referências implícitas usando "isso", "este", "aquele", etc.
  if (/\b(isso|este|esta|estes|estas|aquele|aquela|aqueles|aquelas|ele|ela|eles|elas)\b/i.test(message)) {
    return true;
  }

  return false;
}

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

// Função auxiliar para extrair disciplinas frequentes dos eventos e tarefas
function extrairDisciplinasFrequentes(eventos: any[], tarefas: any[]): { nome: string, frequencia: number }[] {
  const contadorDisciplinas: Record<string, number> = {};

  // Extrair disciplinas dos eventos
  eventos.forEach(evento => {
    if (evento.discipline) {
      const disciplina = evento.discipline.toString().trim();
      if (disciplina) {
        contadorDisciplinas[disciplina] = (contadorDisciplinas[disciplina] || 0) + 1;
      }
    }

    // Extrair possíveis disciplinas do título do evento
    const disciplinasComuns = [
      'Matemática', 'Português', 'História', 'Geografia', 'Física',
      'Química', 'Biologia', 'Inglês', 'Literatura', 'Filosofia',
      'Sociologia', 'Artes', 'Educação Física', 'Programação', 'Ciências'
    ];

    disciplinasComuns.forEach(disc => {
      if (evento.title && evento.title.includes(disc)) {
        contadorDisciplinas[disc] = (contadorDisciplinas[disc] || 0) + 1;
      }
    });
  });

  // Extrair disciplinas das tarefas
  tarefas.forEach(tarefa => {
    if (tarefa.category) {
      const disciplina = tarefa.category.toString().trim();
      if (disciplina) {
        contadorDisciplinas[disciplina] = (contadorDisciplinas[disciplina] || 0) + 1;
      }
    }

    // Tentar extrair disciplinas do título da tarefa
    const disciplinasComuns = [
      'Matemática', 'Português', 'História', 'Geografia', 'Física',
      'Química', 'Biologia', 'Inglês', 'Literatura', 'Filosofia',
      'Sociologia', 'Artes', 'Educação Física', 'Programação', 'Ciências'
    ];

    disciplinasComuns.forEach(disc => {
      if (tarefa.title && tarefa.title.includes(disc)) {
        contadorDisciplinas[disc] = (contadorDisciplinas[disc] || 0) + 1;
      }
    });
  });

  // Converter para array e ordenar por frequência
  return Object.entries(contadorDisciplinas)
    .map(([nome, frequencia]) => ({ nome, frequencia }))
    .sort((a, b) => b.frequencia - a.frequencia);
}

// Função auxiliar para extrair tarefas urgentes
function extrairTarefasUrgentes(tarefas: any[], tarefasSelecionadas?: string[]): any[] {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const amanha = new Date(hoje);
  amanha.setDate(hoje.getDate() + 1);

  const umaSemana = new Date(hoje);
  umaSemana.setDate(hoje.getDate() + 7);

  // Primeiro, extrair tarefas com base na urgência e prazos
  let tarefasUrgentes = tarefas
    .filter(tarefa => {
      // Tarefas com prioridade alta
      if (tarefa.priority === 'high') return true;

      // Tarefas com prazo para hoje ou amanhã
      if (tarefa.dueDate) {
        const dataTarefa = new Date(tarefa.dueDate);
        dataTarefa.setHours(0, 0, 0, 0);
        return dataTarefa <= amanha;
      }

      return false;
    })
    .map(tarefa => ({
      id: tarefa.id,
      titulo: tarefa.title,
      descricao: tarefa.description || "",
      prioridade: tarefa.priority,
      prazo: tarefa.dueDate ? new Date(tarefa.dueDate).toISOString() : null,
      categoria: tarefa.category || null
    }));
    
  // Se temos tarefas selecionadas pelo usuário, verificar quais já estão incluídas
  if (tarefasSelecionadas && tarefasSelecionadas.length > 0) {
    // Adicionar tarefas selecionadas que não estão nos resultados automáticos
    const titulosExistentes = new Set(tarefasUrgentes.map(t => t.titulo.toLowerCase()));
    
    const tarefasAdicionais = tarefasSelecionadas
      .filter(titulo => !titulosExistentes.has(titulo.toLowerCase()))
      .map((titulo, index) => ({
        id: `manual-${index}`,
        titulo: titulo,
        descricao: "Tarefa selecionada manualmente",
        prioridade: "high",
        prazo: hoje.toISOString(),
        categoria: null
      }));
      
    // Combinar todas as tarefas
    tarefasUrgentes = [...tarefasUrgentes, ...tarefasAdicionais];
  }
  
  return tarefasUrgentes;
}

// Função auxiliar para extrair próximos eventos importantes
function extrairProximosEventos(eventos: any[], tarefasSelecionadas?: string[]): any[] {
  const hoje = new Date();
  const doisDias = new Date(hoje);
  doisDias.setDate(hoje.getDate() + 2);

  // Extrair eventos próximos
  let eventosProximos = eventos
    .filter(evento => {
      if (!evento.startDate) return false;

      const dataEvento = new Date(evento.startDate);
      return dataEvento <= doisDias;
    })
    .map(evento => ({
      id: evento.id,
      titulo: evento.title,
      descricao: evento.description || "",
      data: evento.startDate,
      disciplina: evento.discipline || null,
      tipo: evento.type || "evento"
    }));
    
  // Se temos tarefas selecionadas pelo usuário, verificar quais eventos já estão incluídos
  if (tarefasSelecionadas && tarefasSelecionadas.length > 0) {
    // Adicionar eventos selecionados que não estão nos resultados automáticos
    const titulosExistentes = new Set(eventosProximos.map(e => e.titulo.toLowerCase()));
    
    const eventosAdicionais = tarefasSelecionadas
      .filter(titulo => titulo.toLowerCase().includes("event") || titulo.toLowerCase().includes("aula") || titulo.toLowerCase().includes("palestra"))
      .filter(titulo => !titulosExistentes.has(titulo.toLowerCase()))
      .map((titulo, index) => ({
        id: `manual-event-${index}`,
        titulo: titulo,
        descricao: "Evento selecionado manualmente",
        data: hoje.toISOString(),
        disciplina: null,
        tipo: "evento"
      }));
      
    // Combinar todos os eventos
    eventosProximos = [...eventosProximos, ...eventosAdicionais];
  }
    
  return eventosProximos.slice(0, 5); // Limitar aos 5 próximos eventos
}