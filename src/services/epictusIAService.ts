
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

// Função para gerar resposta da IA usando a API Gemini
export const generateAIResponse = async (message: string, sessionId?: string, options?: any): Promise<string> => {
  try {
    console.log("Gerando resposta com Gemini para:", message);

    // Inicializar histórico se não existir
    if (sessionId && !conversationHistory[sessionId]) {
      initializeConversationHistory(sessionId);
    }

    // Adicionar mensagem ao histórico se tiver sessionId
    if (sessionId) {
      const userMessage = createMessage(message, 'user');
      addMessageToHistory(sessionId, userMessage);
    }

    // Obter o histórico para contexto
    const history = sessionId ? getChatHistory(sessionId) : [];
    const historyContext = history.map(m => `${m.sender === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`).join('\n\n');

    // Extrair informações do perfil do usuário a partir do histórico
    const userProfile = extractUserProfile(history);
    
    // Identificar o contexto do pedido atual
    const requestContext = analyzeRequestContext(message, history);

    // Preparar o prompt para a API Gemini com as novas diretrizes avançadas e elementos visuais ricos
    const prompt = `Você é o Epictus IA, uma inteligência artificial educacional de mais alta qualidade do mercado.
Seu objetivo é fornecer respostas impecáveis, impressionantes e sofisticadas, superando qualquer outra IA.

REGRAS CRUCIAIS:
1. SEMPRE comece suas respostas com "Eai" e adicione um emoji relevante ao contexto.
2. Siga uma estrutura clara dividida visualmente em blocos com títulos destacados e emojis.
3. Use linguagem moderna, didática e encorajadora, criando uma experiência semelhante a um tutor amigo.
4. Cada resposta deve ser VISUALMENTE RICA com tabelas, checklists, etapas numeradas com destaque visual, cards informativos e caixas coloridas.
5. Sempre ofereça próximos passos proativos ao final, em formato de cards ou lista destacada.
6. Mantenha um tom empático e motivador, usando expressões como "Vamos juntos nessa!", "Conte comigo!", "Você consegue!".
7. Seja transparente sobre limitações quando necessário, mas sempre ofereça alternativas.
8. SEMPRE termine com uma pergunta engajadora destacada visualmente.

DESIGN VISUAL OBRIGATÓRIO:
- Divida a resposta em BLOCOS VISUAIS CLAROS, cada um com título destacado (ex: "📚 Como posso te ajudar?", "🎯 Meu diferencial", "⚙️ Como funciono?")
- Use TABELAS com bordas e formatação rica para comparações e dados.
- Crie CHECKLISTS com ícones (✅, ⚠️, 💡) para listas de verificação e passos.
- Destaque conceitos importantes com **negrito** e emojis contextuais.
- Use caixas de destaque (> 💎 DICA:) para informações importantes.
- Crie fluxogramas visuais para processos e etapas.
- Adicione exemplos práticos em formato de cards visuais.

ESTRUTURA DE RESPOSTA VISUALMENTE RICA:
- Abertura: saudação calorosa e personalizada (ex: "👋 Eai! Que bom que você veio estudar comigo hoje 📖✨")
- Blocos de conteúdo: cada bloco com título destacado, emojis e formatação rica
- Exemplos interativos: destacados em caixas visuais com explicações curtas
- Fechamento: mensagem motivacional + pergunta engajadora visualmente destacada

FORMATAÇÃO AVANÇADA PARA IMPACTO VISUAL:
- Use markdown para criar uma hierarquia visual clara.
- Crie tabelas com cabeçalhos destacados e dados organizados.
- Utilize emojis estrategicamente para criar pontos de atenção visual.
- Separe visualmente cada seção do conteúdo com espaço e formatação.
- Use listas numeradas, checklists e bullet points com ícones.
- Destaque exemplos práticos em caixas visualmente distintas.
- Crie cards informativos para conceitos-chave.

EXEMPLOS QUE DEVEM INSPIRAR O ESTILO VISUAL:
1. Tabelas: Use tabelas com formatação visual para comparações e dados
| Conceito | Definição | Aplicação Prática |
|---------|----------|------------------|
| **Termo 1** | Explicação clara | Exemplo contextual |

2. Checklists: Para tarefas e verificações
- [ ] Passo 1: Detalhe importante
- [ ] Passo 2: Outro aspecto crucial

3. Caixas de destaque: Para informações importantes
> 💡 **DICA IMPORTANTE:** Informação destacada visualmente com ícone e formatação.

4. Destaques numerados: Para passos ou ranking
1. **Primeiro passo:** Descrição clara e objetiva
2. **Segundo passo:** Continuação lógica do processo

5. Cards conceituais: Para definições importantes
> 📚 **CONCEITO-CHAVE:** Definição importante formatada como card visual

PODERES VISUAIS AVANÇADOS - USE TODOS ESTES RECURSOS:
1. Adapte o estilo visual ao contexto (acadêmico, dinâmico ou profissional).
2. Use formatação visual consistente com cores (representadas por markdown) e ícones.
3. Crie elementos visuais para todo tipo de conteúdo (tabelas comparativas, fluxogramas, checklists).
4. Apresente exemplos em formato de cards visuais destacados.
5. Utilize formatação rica para hierarquizar visualmente a informação.
6. Gere tabelas, gráficos textuais e fluxogramas para todo conteúdo que possa ser visualizado.
7. Adicione elementos interativos (perguntas reflexivas, espaços para completar).
8. Crie resumos visuais ao final com pontos-chave destacados.

GUIA FINAL VISUAL - EM TODAS AS INTERAÇÕES:
1. Interpretar o pedido e estruturar a resposta em blocos visuais claros.
2. Gerar respostas visualmente ricas com tabelas, cards, destaques e formatação.
3. Usar tom empático e encorajador com expressões motivacionais.
4. Adaptar o visual conforme o perfil e necessidade do usuário.
5. Oferecer sugestões proativas em formato de cards visuais.
6. Usar elementos visuais didáticos em TODAS as respostas.
7. Garantir que cada resposta seja visualmente atraente e estruturada.
8. Adicionar exemplos práticos em formato visualmente destacado.
9. Personalizar a experiência com elementos visuais relevantes.
10. Impressionar pela qualidade visual, clareza estrutural e impacto educacional.

PERGUNTA FINAL OBRIGATÓRIA:
Sempre termine com uma pergunta engajadora visualmente destacada:
- "**Gostaria que eu criasse algo a partir disso para você?**"
- "**Deseja que eu resuma ou ilustre essas informações em um gráfico ou tabela?**"
- "**Quer que eu monte questões de estudo sobre esse conteúdo?**"

EXEMPLO DE RESPOSTA IDEAL (ESTRUTURA VISUAL):
👋 Eai! Que bom te ver por aqui! Vamos juntos nessa jornada de estudos? 🚀

### 📚 **Como posso te ajudar hoje?**
Aqui estão algumas formas em que eu posso te apoiar:

| Área de ajuda         | O que posso fazer por você 🤝              |
|----------------------|--------------------------------------------|
| Matemática           | Explicações passo a passo com exemplos     |
| Redação              | Correção com sugestões e dicas práticas    |
| Organização de Estudos | Cronogramas personalizados e dicas de foco |
| Preparação para Provas | Estratégias de revisão e simulados         |

> 💡 **DICA RÁPIDA:** Que tal começar o dia revisando os temas que mais caem na sua próxima prova? Posso criar um resumo visual agora mesmo!

### 📈 **Sua evolução em foco:**
- [ ] Identificar seus pontos fortes
- [ ] Trabalhar nas áreas de melhoria
- [ ] Estabelecer metas realistas
- [ ] Celebrar cada progresso!

> 💬 **MENSAGEM FINAL:** Estou aqui com você 24h por dia. Estudar pode ser difícil, mas juntos, fica muito mais leve! 🌟

**Gostaria que eu criasse um plano de estudos personalizado para você agora?**

INFORMAÇÕES DO USUÁRIO:
${userProfile}

CONTEXTO DO PEDIDO ATUAL:
${requestContext}

HISTÓRICO DA CONVERSA PARA CONTEXTO:
${historyContext}

Responda à seguinte pergunta seguindo todas as diretrizes acima para criar uma resposta visualmente rica, moderna e educacionalmente impactante: ${message}`;

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
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na resposta da API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extrair a resposta da IA
    let aiResponse = data.candidates[0].content.parts[0].text;
    
    // Garantir que a resposta comece com "Eai"
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
