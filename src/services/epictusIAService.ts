
import { supabase } from '@/lib/supabase';

// Tipos para as mensagens
export interface IAMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
}

export interface IAConversation {
  id: string;
  title: string;
  messages: IAMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Respostas simuladas da IA para diferentes tipos de perguntas
const aiResponses = {
  // Respostas para saudações
  greetings: [
    "Olá! Como posso ajudar você hoje nos seus estudos?",
    "Oi! Sou o Epictus IA, seu assistente de estudos pessoal. Como posso auxiliar?",
    "Olá! Estou aqui para ajudar com seus estudos. O que você gostaria de aprender?"
  ],
  
  // Respostas para perguntas sobre matérias escolares
  mathResponses: [
    "A matemática é a ciência que estuda quantidades, medidas, espaços, estruturas e variações. Qual tópico específico você gostaria de aprender?",
    "Na matemática, resolvemos problemas através de fórmulas e lógica. Posso ajudar com álgebra, geometria, cálculo e muito mais!",
    "O estudo da matemática desenvolve o pensamento lógico e a capacidade de resolução de problemas. Como posso ajudar você nessa área?"
  ],

  physicsResponses: [
    "A física estuda as leis fundamentais do universo, incluindo matéria, energia, força e movimento. Em qual tópico você tem interesse?",
    "Na física, analisamos desde partículas subatômicas até galáxias inteiras! Qual conceito você gostaria de explorar?",
    "A física nos ajuda a entender o mundo natural através de observações e experimentos. Posso ajudar com mecânica, eletricidade, termodinâmica e mais!"
  ],

  chemistryResponses: [
    "A química é o estudo da matéria, suas propriedades e transformações. Posso ajudar com elementos, reações químicas e muito mais!",
    "Na química, exploramos a composição, estrutura e propriedades das substâncias. Qual tema específico você gostaria de aprender?",
    "A química está em tudo ao nosso redor, desde os alimentos até os medicamentos. Como posso ajudar você nessa área?"
  ],

  biologyResponses: [
    "A biologia estuda os seres vivos e suas interações com o ambiente. Posso ajudar com células, genética, ecologia e muito mais!",
    "Na biologia, exploramos desde microorganismos até ecossistemas inteiros. Qual tópico você gostaria de aprender?",
    "A biologia nos ajuda a entender a vida em todas as suas formas e níveis de organização. Como posso auxiliar nos seus estudos?"
  ],

  // Respostas para planos de estudo
  studyPlanResponses: [
    "Para criar um plano de estudos eficiente, precisamos considerar seus objetivos, tempo disponível e matérias prioritárias. Vamos começar?",
    "Um bom plano de estudos deve ser equilibrado e realista. Podemos criar um adaptado às suas necessidades!",
    "Planos de estudo personalizados podem aumentar sua produtividade. Vamos elaborar um que funcione para você!"
  ],

  // Respostas para perguntas sobre o ENEM
  enemResponses: [
    "O ENEM avalia conhecimentos em quatro áreas: ciências humanas, ciências da natureza, linguagens e matemática. Como posso ajudar na sua preparação?",
    "Para se preparar para o ENEM, é importante manter uma rotina consistente de estudos e fazer muitos simulados. Posso ajudar a criar um plano para você!",
    "No ENEM, além do conteúdo, é importante desenvolver boas técnicas de resolução de questões e gerenciamento de tempo. Vamos trabalhar nisso juntos?"
  ],

  // Respostas gerais para perguntas não categorizadas
  generalResponses: [
    "Essa é uma ótima pergunta! Vamos explorar esse tema juntos.",
    "Entendi sua dúvida. Vamos trabalhar para encontrar a melhor resposta.",
    "Excelente questão! Vou ajudar você a entender esse conceito."
  ],
  
  // Respostas para quando não entende a pergunta
  fallbackResponses: [
    "Desculpe, não entendi completamente sua pergunta. Pode reformular?",
    "Hmmm, não tenho certeza se compreendi. Pode explicar de outra forma?",
    "Parece uma questão interessante, mas preciso de mais detalhes para ajudar melhor."
  ]
};

// Função para categorizar a pergunta do usuário
function categorizeQuestion(question: string): string {
  question = question.toLowerCase();
  
  // Verificar saudações
  if (question.match(/ol[aá]|oi|hey|e a[ií]|tudo bem|como vai|bom dia|boa tarde|boa noite/)) {
    return 'greetings';
  }
  
  // Verificar matemática
  if (question.match(/matem[aá]tica|[aá]lgebra|geometria|c[aá]lculo|equa[cç][aã]o|n[uú]mero|trigo|logaritmo|matriz/)) {
    return 'mathResponses';
  }
  
  // Verificar física
  if (question.match(/f[ií]sica|gravidade|movimento|for[cç]a|energia|el[eé]tri|magn[eé]ti|ac[eé]lera[cç][aã]o|velocidade|newton|qu[aâ]nti/)) {
    return 'physicsResponses';
  }
  
  // Verificar química
  if (question.match(/qu[ií]mica|elemento|mol[eé]cula|rea[cç][aã]o|[aá]tomo|tabela peri[oó]dica|substância|ácido|base|org[aâ]nica|inorg[aâ]nica/)) {
    return 'chemistryResponses';
  }
  
  // Verificar biologia
  if (question.match(/biologia|c[eé]lula|gen[eé]tica|ecologia|evolu[cç][aã]o|darwin|organismo|ser vivo|planta|animal|corpo humano|tecido|[oó]rg[aã]o|sistema/)) {
    return 'biologyResponses';
  }
  
  // Verificar plano de estudos
  if (question.match(/plano de estudo|como estudar|rotina de estudo|organizar estudo|m[eé]todo de estudo|t[eé]cnica de estudo|pomodoro|revis[aã]o/)) {
    return 'studyPlanResponses';
  }
  
  // Verificar ENEM
  if (question.match(/enem|exame nacional|vestibular|prova nacional|redação enem|universidade|faculdade|ingresso/)) {
    return 'enemResponses';
  }
  
  // Se não conseguir categorizar, usar respostas gerais
  return 'generalResponses';
}

// Função para obter uma resposta aleatória da categoria
function getRandomResponse(category: string): string {
  // Se a categoria não existir, usar fallback
  if (!aiResponses[category]) {
    category = 'fallbackResponses';
  }
  
  const responses = aiResponses[category];
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
}

// Função para gerar uma resposta baseada na pergunta
function generateResponse(question: string): string {
  // Se a pergunta for muito curta, pedir mais detalhes
  if (question.trim().length < 3) {
    return aiResponses.fallbackResponses[0];
  }
  
  const category = categorizeQuestion(question);
  return getRandomResponse(category);
}

// Serviço principal
const epictusIAService = {
  // Gerar uma resposta para a pergunta do usuário
  async getResponse(question: string): Promise<string> {
    // Simular um pequeno atraso para parecer mais natural
    await new Promise(resolve => setTimeout(resolve, 1000));
    return generateResponse(question);
  },
  
  // Salvar conversa no banco de dados (caso implementemos integração com Supabase)
  async saveConversation(userId: string, conversation: IAConversation): Promise<boolean> {
    try {
      // Aqui você pode implementar a lógica para salvar no Supabase
      // Por enquanto, apenas retornamos sucesso
      return true;
    } catch (error) {
      console.error('Erro ao salvar conversa:', error);
      return false;
    }
  },
  
  // Obter conversas do usuário do banco de dados
  async getUserConversations(userId: string): Promise<IAConversation[]> {
    try {
      // Aqui você pode implementar a lógica para buscar do Supabase
      // Por enquanto, retornamos um array vazio
      return [];
    } catch (error) {
      console.error('Erro ao obter conversas:', error);
      return [];
    }
  }
};

export default epictusIAService;
