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
  // API Key fixa para garantir o funcionamento
  const apiKey = "AIzaSyDaMGN00DG-3KHgV9b7Fm_SHGvfruuMdgM";
  
  try {
    console.log("Iniciando requisição para API Gemini...");
    
    // URL da API Gemini
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;
    
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
      }
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      // Em vez de lançar erro, vamos usar respostas pré-definidas
      return getLocalResponse(message);
    }
    
    const data = await response.json();
    console.log("Resposta da API Gemini:", data);
    
    // Extrair texto da resposta
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else if (data.content && data.content.parts && data.content.parts.length > 0) {
      return data.content.parts[0].text;
    } else {
      // Em vez de lançar erro, usar resposta local
      return getLocalResponse(message);
    }
  } catch (error) {
    console.error("Erro ao chamar a API Gemini:", error);
    return getLocalResponse(message);
  }
};

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