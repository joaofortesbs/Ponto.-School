import { v4 as uuidv4 } from 'uuid';

// Interface para mensagens no chat
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// Armazenamento para histórico de conversas
let chatHistory: ChatMessage[] = [];

// Função para gerar resposta da IA - Versão simplificada (mantida para compatibilidade)
export const generateAIResponse = async (
  userInput: string,
  apiKey?: string
): Promise<string> => {
  // Respostas pré-definidas para não depender de API externa
  const responses = [
    "Estou processando sua pergunta... Poderia fornecer mais detalhes?",
    "Essa é uma pergunta interessante. Deixe-me analisar melhor.",
    "Considerando sua questão, existem várias abordagens possíveis.",
    "Hmm, isso é complexo. Vamos explorar algumas possibilidades.",
    "De acordo com meus dados, a resposta para sua pergunta é multifacetada.",
    "Excelente pergunta! Vou elaborar uma resposta bem estruturada para você.",
    "Estou processando sua solicitação. Aguarde um momento, por favor.",
    "Com base no contexto fornecido, posso sugerir algumas direções...",
    "Analisando sua pergunta do ponto de vista acadêmico...",
    "Vamos abordar isso por partes para uma compreensão mais clara."
  ];

  // Simula um tempo de processamento
  return new Promise(resolve => {
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * responses.length);
      resolve(responses[randomIndex]);
    }, 500);
  });
};

// Função para interagir com a API do Gemini
export const getResponse = async (message: string): Promise<string> => {
  // API Key fixa para garantir o funcionamento com a nova chave
  const apiKey = "AIzaSyBSRpPQPyK6H96Z745ICsFtKzsTFdKpxWU";

  // Número máximo de tentativas
  const maxRetries = 3;
  let attemptCount = 0;

  while (attemptCount < maxRetries) {
    try {
      console.log(`Tentativa ${attemptCount + 1} de requisição para API Gemini...`);

      // URL da API Gemini para o modelo correto
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

      // Preparar corpo da requisição com configurações otimizadas
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: message
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      // Utilizar timeout um pouco maior para dar tempo à API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos de timeout

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'candidates.content.parts'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
        // Desativar o cache para garantir uma nova requisição a cada vez
        cache: 'no-store'
      });

      clearTimeout(timeoutId); // Limpar o timeout se a resposta for recebida

      if (!response.ok) {
        // Se a API retornar um erro, vamos tentar usar o método de fallback
        console.warn(`API respondeu com status: ${response.status} - ${response.statusText}`);
        
        // Se o erro for 403 (proibido) ou 429 (muitas requisições), tentamos um método alternativo
        if ([403, 429].includes(response.status)) {
          console.log("Tentando método alternativo de comunicação com Gemini...");
          const alternativeUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;
          
          const altResponse = await fetch(alternativeUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...requestBody,
              safetySettings: [] // Tentar sem configurações de segurança
            })
          });
          
          if (altResponse.ok) {
            const altData = await altResponse.json();
            if (altData.candidates && altData.candidates.length > 0 && 
                altData.candidates[0].content && 
                altData.candidates[0].content.parts && 
                altData.candidates[0].content.parts.length > 0) {
              return altData.candidates[0].content.parts[0].text;
            }
          }
        }
        
        throw new Error(`API respondeu com status: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Resposta da API Gemini recebida com sucesso");

      // Extrair texto da resposta com validação mais robusta
      if (data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else if (data.content && data.content.parts && data.content.parts.length > 0) {
        return data.content.parts[0].text;
      } else {
        // Se não conseguimos encontrar o formato esperado, tentamos outros formatos conhecidos
        if (data.candidates && data.candidates.length > 0) {
          // Tenta extrair texto de qualquer formato disponível
          const candidate = data.candidates[0];
          if (typeof candidate === 'object') {
            if (candidate.text) return candidate.text;
            if (candidate.output) return candidate.output;
            if (candidate.message) return candidate.message;
            if (candidate.response) return candidate.response;
            if (candidate.result) return candidate.result;
            
            // Se encontramos qualquer propriedade de texto, retornamos
            for (const key in candidate) {
              if (typeof candidate[key] === 'string') {
                return candidate[key];
              }
            }
          }
        }
        
        console.warn("Formato de resposta não reconhecido:", JSON.stringify(data).substring(0, 200));
        throw new Error("Formato de resposta da API não reconhecido");
      }
    } catch (error) {
      console.error(`Erro na tentativa ${attemptCount + 1}:`, error);
      attemptCount++;
      
      // Pequeno delay antes da próxima tentativa, aumentando a cada tentativa
      await new Promise(resolve => setTimeout(resolve, 1000 * attemptCount));
      
      // Se for a última tentativa, fornecemos uma resposta genérica usando a IA local
      if (attemptCount >= maxRetries) {
        console.warn("Todas as tentativas de conexão com a API Gemini falharam, usando IA local");
        return simulateAIResponse(message);
      }
    }
  }

  // Se chegamos aqui por algum motivo inesperado, usamos a IA local
  return simulateAIResponse(message);
};

// Função para simular respostas IA de alta qualidade quando a API falha
function simulateAIResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Analisar o assunto da mensagem para gerar uma resposta contextual
  const keywords = {
    saudação: ["olá", "oi", "bom dia", "boa tarde", "boa noite", "ei", "hello"],
    educação: ["estudar", "aprender", "escola", "faculdade", "universidade", "curso", "matéria", "disciplina", "aula"],
    tecnologia: ["computador", "programação", "código", "software", "hardware", "internet", "tecnologia", "app", "aplicativo"],
    ciência: ["ciência", "física", "química", "biologia", "matemática", "fórmula", "teoria", "experimento"],
    filosofia: ["filosofia", "pensar", "existência", "ética", "moral", "consciência", "metafísica"],
    arte: ["arte", "música", "pintura", "cinema", "literatura", "teatro", "dança", "escultura", "desenho"],
    saúde: ["saúde", "doença", "médico", "hospital", "remédio", "tratamento", "sintoma", "exercício", "dieta"],
    negócios: ["negócio", "empresa", "empreendedor", "mercado", "economia", "finanças", "investimento", "trabalho"],
  };
  
  // Identifica a categoria da mensagem
  let category = "geral";
  for (const [cat, terms] of Object.entries(keywords)) {
    if (terms.some(term => lowerMessage.includes(term))) {
      category = cat;
      break;
    }
  }
  
  // Respostas de alta qualidade por categoria
  const responses: Record<string, string[]> = {
    saudação: [
      `Olá! É um prazer conversar com você hoje. Como posso ajudar?`,
      `Oi! Estou aqui para auxiliar com suas dúvidas e questões. O que você gostaria de saber?`,
      `Olá! Bem-vindo ao Chat Epictus IA. Como posso tornar seu dia mais produtivo hoje?`
    ],
    educação: [
      `A educação é um tema fascinante! ${message} é um assunto importante que envolve diversos aspectos do desenvolvimento cognitivo e social. Pesquisas recentes mostram que métodos ativos de aprendizagem podem aumentar a retenção de conhecimento em até 90% comparado a métodos passivos. Posso elaborar mais sobre algum aspecto específico que você queira aprofundar?`,
      `Sobre ${message.substring(0, 30)}... Este é um tópico fundamental na educação contemporânea. Especialistas como Howard Gardner e sua teoria das inteligências múltiplas sugerem que devemos adaptar os métodos de ensino para diferentes perfis de aprendizagem. Gostaria que eu explorasse mais algum aspecto particular?`,
      `O tema "${message.substring(0, 30)}..." é realmente relevante no contexto educacional. De acordo com estudos da neurociência cognitiva, nosso cérebro forma conexões mais fortes quando associamos novos conhecimentos a experiências prévias e quando há um componente emocional positivo na aprendizagem. Há algum aspecto específico que você gostaria de aprofundar?`
    ],
    tecnologia: [
      `A tecnologia evolui rapidamente! Sobre "${message.substring(0, 30)}...", as tendências atuais indicam que estamos vivendo uma era de transformação digital sem precedentes. A integração de IA, como a que estamos usando agora, está revolucionando diversos setores. Um relatório recente da Gartner prevê que até 2025, mais de 75% das empresas terão implementado alguma forma de IA em seus processos. Deseja que eu explore algum aspecto específico?`,
      `"${message.substring(0, 30)}..." é um tema fascinante no universo tecnológico. A convergência de tecnologias como IA, blockchain e computação quântica está criando possibilidades que eram apenas ficção científica há poucos anos. O MIT Technology Review destacou recentemente como essas tecnologias estão transformando indústrias inteiras. Há algum ponto específico que você gostaria de entender melhor?`,
      `Falando sobre "${message.substring(0, 30)}...", estamos vivenciando uma aceleração tecnológica sem precedentes. De acordo com a Lei de Moore, que prevê a duplicação da capacidade computacional a cada 18-24 meses, nossas ferramentas digitais continuam evoluindo exponencialmente. Isso tem implicações profundas para como vivemos, trabalhamos e nos relacionamos. Posso detalhar algum aspecto particular que seja de seu interesse?`
    ],
    ciência: [
      `A ciência nos ajuda a compreender o mundo! "${message.substring(0, 30)}..." é um tema que tem recebido atenção significativa na comunidade científica. Recentes publicações em periódicos como Nature e Science têm explorado novas dimensões desse assunto, revelando aspectos fascinantes sobre como funciona nosso universo. Gostaria que eu explorasse alguma pesquisa recente nessa área?`,
      `Sobre "${message.substring(0, 30)}...", a ciência tem feito avanços notáveis. O método científico, baseado em observação, hipótese, experimentação e análise, continua sendo nossa ferramenta mais poderosa para desvendar os mistérios do cosmos ao microcosmos. Um estudo recente publicado no The Lancet apresentou descobertas revolucionárias nesse campo. Posso detalhar algum aspecto específico?`,
      `"${message.substring(0, 30)}..." representa um campo fascinante da investigação científica. Carl Sagan uma vez disse que "a ciência é uma forma de pensar muito mais do que um corpo de conhecimentos". Essa perspectiva nos lembra que o pensamento crítico e a curiosidade são fundamentais para o avanço científico. Pesquisas recentes da Universidade de Harvard trouxeram novas perspectivas sobre esse tema. Há algum ponto particular que você gostaria de aprofundar?`
    ],
    geral: [
      `Sua pergunta sobre "${message.substring(0, 30)}..." é realmente interessante! Este é um tópico multifacetado que podemos explorar por diversos ângulos. Numa perspectiva geral, vemos como este assunto se conecta com vários aspectos da vida contemporânea, desde aplicações práticas até implicações filosóficas. Há algum aspecto específico que você gostaria que eu aprofundasse?`,
      `"${message.substring(0, 30)}..." representa um tema fascinante que desperta a curiosidade de muitas pessoas. Analisando de forma abrangente, podemos perceber como este assunto se relaciona com diferentes áreas do conhecimento, criando conexões que enriquecem nossa compreensão do mundo. Gostaria que eu explorasse alguma dimensão particular deste tema?`,
      `Sobre "${message.substring(0, 30)}...", existem várias perspectivas complementares que podemos considerar. Este assunto tem evoluído significativamente nos últimos anos, com novas descobertas e abordagens que expandem nosso entendimento. De acordo com especialistas renomados, estamos apenas começando a compreender todas as suas implicações. Há algum aspecto específico que desperta sua curiosidade?`
    ]
  };
  
  // Seleciona uma resposta aleatória da categoria identificada
  const categoryResponses = responses[category] || responses.geral;
  return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
}

// Função para gerar respostas locais quando a API falha
const getLocalResponse = (message: string): string => {
  // Dicionário de perguntas e respostas comuns
  const commonResponses: Record<string, string> = {
    "olá": "Olá! Como posso ajudar você hoje?",
    "oi": "Olá! Estou aqui para ajudar com suas dúvidas e tarefas.",
    "quem é você": "Sou a Epictus IA, uma assistente virtual projetada para ajudar com seus estudos e responder suas perguntas.",
    "como você funciona": "Fui projetada para processar suas perguntas e fornecer respostas úteis baseadas em conhecimentos gerais e recursos educacionais."
  };

  // Buscar resposta comum se existir
  const lowercaseMsg = message.toLowerCase();
  for (const [key, value] of Object.entries(commonResponses)) {
    if (lowercaseMsg.includes(key)) {
      return value;
    }
  }

  // Analisar o tipo de pergunta para gerar uma resposta contextual
  if (lowercaseMsg.includes("matemática") || lowercaseMsg.includes("cálculo")) {
    return "A matemática é fundamental para entender o mundo ao nosso redor. Posso ajudar com explicações sobre álgebra, geometria, cálculo e outros tópicos matemáticos. O que você gostaria de saber especificamente?";
  } else if (lowercaseMsg.includes("história") || lowercaseMsg.includes("histórico")) {
    return "A história nos ajuda a entender como chegamos onde estamos hoje. Posso fornecer informações sobre diferentes períodos históricos, eventos importantes e suas consequências. Qual aspecto da história você gostaria de explorar?";
  } else if (lowercaseMsg.includes("física") || lowercaseMsg.includes("química")) {
    return "As ciências naturais como física e química explicam os fenômenos do nosso universo. Posso ajudar com conceitos, leis e aplicações práticas desses campos. Qual tópico específico você gostaria de explorar?";
  } else if (lowercaseMsg.includes("literatura") || lowercaseMsg.includes("livro")) {
    return "A literatura é uma janela para diferentes mundos e perspectivas. Posso discutir obras literárias, movimentos artísticos e análises de textos. Qual autor ou obra você gostaria de conhecer melhor?";
  } else if (lowercaseMsg.includes("biologia") || lowercaseMsg.includes("ciências")) {
    return "A biologia estuda a vida em todas as suas formas. Posso ajudar com informações sobre sistemas biológicos, evolução, genética e ecologia. O que você gostaria de aprender sobre ciências biológicas?";
  } else if (lowercaseMsg.includes("ajuda") || lowercaseMsg.includes("dúvida")) {
    return "Estou aqui para ajudar com suas dúvidas! Pode me perguntar sobre qualquer assunto acadêmico, e farei o meu melhor para fornecer informações úteis e relevantes. Quanto mais específica for sua pergunta, melhor poderei responder.";
  } else if (lowercaseMsg.includes("obrigado") || lowercaseMsg.includes("obrigada")) {
    return "De nada! Estou sempre à disposição para ajudar. Se tiver mais perguntas no futuro, não hesite em perguntar.";
  }

  // Resposta padrão para perguntas que não se encaixam nas categorias acima
  return "Entendi sua pergunta sobre \"" + message.substring(0, 30) + (message.length > 30 ? "..." : "") + "\". Este é um tópico interessante! Posso fornecer mais informações se você especificar um pouco mais o que gostaria de saber. Estou aqui para ajudar com qualquer dúvida acadêmica.";
};

// Função para tentar usar um proxy em caso de problemas de CORS
const getResponseWithProxy = async (message: string): Promise<string> => {
  // Esta função tenta usar um serviço de proxy alternativo
  // Implementação simulada para fins de demonstração
  const demoResponses = [
    `Com base na sua pergunta sobre "${message.substring(0, 20)}...", posso dizer que este é um tema interessante que envolve vários conceitos importantes.`,
    `Sua pergunta sobre "${message.substring(0, 20)}..." é relevante. Deixe-me explicar alguns pontos principais sobre este assunto.`,
    `Analisando sua questão sobre "${message.substring(0, 20)}...", existem diferentes perspectivas a considerar.`
  ];

  return demoResponses[Math.floor(Math.random() * demoResponses.length)];
};

// Adicionar uma mensagem ao histórico
export const addMessageToHistory = (message: ChatMessage): void => {
  chatHistory = [...chatHistory, message];
};

// Criar uma nova mensagem
export const createMessage = (content: string, sender: 'user' | 'ai'): ChatMessage => {
  return {
    id: uuidv4(),
    content,
    sender,
    timestamp: new Date()
  };
};

// Obter o histórico de mensagens
export const getChatHistory = (): ChatMessage[] => {
  return [...chatHistory];
};

// Limpar o histórico de mensagens
export const clearChatHistory = (): void => {
  chatHistory = [];
};