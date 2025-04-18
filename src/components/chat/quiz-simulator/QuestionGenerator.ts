
import { generateAIResponse } from "@/services/aiChatService";
import { QuestionsConfig } from "./QuestionsConfigModal";

export interface Question {
  number: string;
  type: string;
  statement: string;
  answer: string;
  explanation: string;
}

export const generateQuizQuestions = async (
  sessionId: string, 
  content: string, 
  useSmartDifficulty: boolean, 
  useStudyMode: boolean
): Promise<any[]> => {
  try {
    // Fallback questions if AI generation fails
    const fallbackQuestions = [
      {
        id: "q1",
        text: "Qual é a principal vantagem de utilizar a Ponto.School para seus estudos?",
        options: [
          { id: "q1-a", text: "Apenas materiais didáticos", isCorrect: false },
          { id: "q1-b", text: "Personalização inteligente com IA", isCorrect: true },
          { id: "q1-c", text: "Apenas vídeo-aulas", isCorrect: false },
          { id: "q1-d", text: "Só funciona para ensino fundamental", isCorrect: false }
        ],
        explanation: "A Ponto.School oferece personalização inteligente com IA para adaptar o conteúdo às suas necessidades de aprendizado."
      },
      {
        id: "q2",
        text: "O que é o Epictus IA na plataforma Ponto.School?",
        options: [
          { id: "q2-a", text: "Um jogo educativo", isCorrect: false },
          { id: "q2-b", text: "Um assistente de inteligência artificial", isCorrect: true },
          { id: "q2-c", text: "Um calendário de estudos", isCorrect: false },
          { id: "q2-d", text: "Uma calculadora avançada", isCorrect: false }
        ],
        explanation: "O Epictus IA é um assistente de inteligência artificial que ajuda na personalização do aprendizado."
      },
      {
        id: "q3",
        text: "Qual recurso permite estudar com outros alunos na Ponto.School?",
        options: [
          { id: "q3-a", text: "Modo Solo", isCorrect: false },
          { id: "q3-b", text: "Calendário", isCorrect: false },
          { id: "q3-c", text: "Grupos de Estudo", isCorrect: true },
          { id: "q3-d", text: "Agenda", isCorrect: false }
        ],
        explanation: "Os Grupos de Estudo permitem colaboração e aprendizado conjunto com outros estudantes."
      },
      {
        id: "q4",
        text: "Como funciona o sistema de pontos na plataforma?",
        options: [
          { id: "q4-a", text: "São usados apenas para jogos", isCorrect: false },
          { id: "q4-b", text: "Podem ser trocados por recompensas", isCorrect: true },
          { id: "q4-c", text: "Não existem pontos na plataforma", isCorrect: false },
          { id: "q4-d", text: "São apenas decorativos", isCorrect: false }
        ],
        explanation: "Os pontos na plataforma são acumulados ao completar atividades e podem ser trocados por recompensas."
      },
      {
        id: "q5",
        text: "O que é o Modo Estudo no quiz da Ponto.School?",
        options: [
          { id: "q5-a", text: "Um timer para limitar o tempo", isCorrect: false },
          { id: "q5-b", text: "Um modo sem perguntas", isCorrect: false },
          { id: "q5-c", text: "Mostra explicações após cada resposta", isCorrect: true },
          { id: "q5-d", text: "Não permite consultar material", isCorrect: false }
        ],
        explanation: "O Modo Estudo mostra explicações detalhadas após cada resposta para melhorar o aprendizado."
      }
    ];

    // Formato do prompt para gerar o quiz
    const quizPrompt = `
    Gere um quiz com 5 perguntas de múltipla escolha baseadas no seguinte conteúdo:
    "${content.substring(0, 500)}..."
    
    Regras:
    - As perguntas devem estar diretamente relacionadas ao conteúdo fornecido
    ${useSmartDifficulty ? '- Misture níveis de dificuldade (fácil, médio e difícil)' : '- Mantenha um nível médio de dificuldade'}
    - Cada pergunta deve ter 4 alternativas, com apenas uma correta
    - Forneça uma explicação concisa para cada resposta
    
    Responda APENAS com um array JSON com as 5 perguntas no formato a seguir, sem qualquer texto ou explicação adicional:
    [
      {
        "id": "q1",
        "text": "Enunciado da pergunta",
        "options": [
          { "id": "q1-a", "text": "Alternativa A", "isCorrect": false },
          { "id": "q1-b", "text": "Alternativa B", "isCorrect": true },
          { "id": "q1-c", "text": "Alternativa C", "isCorrect": false },
          { "id": "q1-d", "text": "Alternativa D", "isCorrect": false }
        ],
        "explanation": "Explicação da resposta correta"
      }
    ]
    `;
    
    try {
      // Chamar a API para gerar as perguntas
      const quizResponse = await generateAIResponse(
        quizPrompt,
        sessionId || 'default_session',
        {
          intelligenceLevel: 'advanced',
          languageStyle: 'formal'
        }
      );
      
      // Se a resposta contiver JSON válido, substituir as perguntas de fallback
      if (quizResponse) {
        // Extrair apenas o JSON da resposta
        let jsonText = quizResponse;
        if (quizResponse.includes('[') && quizResponse.includes(']')) {
          const startIdx = quizResponse.indexOf('[');
          const endIdx = quizResponse.lastIndexOf(']') + 1;
          jsonText = quizResponse.substring(startIdx, endIdx);
        }
        
        // Tentar parsear o JSON
        try {
          const customQuestions = JSON.parse(jsonText);
          
          // Verificar se o JSON é válido e tem a estrutura esperada
          if (Array.isArray(customQuestions) && customQuestions.length > 0) {
            // Validar cada pergunta
            const validQuestions = customQuestions.filter(q => 
              q.id && q.text && Array.isArray(q.options) && q.options.length >= 3
            );
            
            if (validQuestions.length >= 3) {
              // Usar as perguntas customizadas em vez do fallback
              return validQuestions;
            }
          }
        } catch (jsonError) {
          console.log('Erro ao parsear JSON, usando perguntas de fallback:', jsonError);
          // Continuamos com as perguntas de fallback
        }
      }
    } catch (aiError) {
      console.log('Erro ao gerar perguntas, usando fallback:', aiError);
    }
    
    // Retorna as questões de fallback se algo deu errado
    return fallbackQuestions;
  } catch (error) {
    console.error('Erro ao gerar quiz:', error);
    throw error;
  }
};

export const generateExamQuestions = async (
  sessionId: string,
  content: string,
  config: QuestionsConfig
): Promise<Question[]> => {
  try {
    // Criar prompt específico para geração de questões
    const promptText = `Com base na última resposta da IA sobre "${content.substring(0, 100)}...", gere ${config.totalQuestions} questões diretamente relacionadas ao conteúdo explicado na resposta. Sendo:
    ${config.multipleChoice} questões de múltipla escolha, ${config.discursive} questões discursivas, ${config.trueFalse} questões de verdadeiro ou falso. ${config.bnccCompetence ? `Se possível, alinhe com a competência BNCC selecionada: ${config.bnccCompetence}.` : ""}

    IMPORTANTE: 
    1. Cada questão DEVE abordar especificamente os conceitos, temas e exemplos mencionados na resposta da IA
    2. Para cada questão, forneça:
      - Um título curto e descritivo sobre o tema principal da questão
      - O tipo de questão (múltipla escolha, discursiva ou verdadeiro/falso)
      - Enunciado completo
      - Alternativas (para múltipla escolha) ou afirmações (para V/F)
      - Gabarito com a resposta correta
      - Uma explicação detalhada da resposta

    REGRAS OBRIGATÓRIAS:
    - NÃO INCLUA SAUDAÇÕES AO USUÁRIO (como "Olá", "Oi", "Bom dia", etc)
    - NÃO INCLUA NENHUM TIPO DE LINK em nenhuma questão
    - NÃO FAÇA REFERÊNCIAS A NENHUMA PLATAFORMA ou recurso externo
    - NÃO INCLUA LEMBRETES DA PLATAFORMA - APENAS AS QUESTÕES
    - NÃO FAÇA REFERÊNCIA A NENHUMA SEÇÃO OU PÁGINA DA PLATAFORMA
    - APRESENTE APENAS AS QUESTÕES sem textos introdutórios ou conclusivos
    - NÃO USE EMOJIS ou elementos decorativos

    Use exatamente os termos e conceitos explicados na resposta da IA. Não invente tópicos não abordados.`;

    const response = await generateAIResponse(
      promptText,
      sessionId || 'default_session',
      {
        intelligenceLevel: 'advanced',
        languageStyle: 'formal'
      }
    );

    // Processar a resposta para o formato de questões
    return processQuestions(response);
  } catch (error) {
    console.error('Erro ao gerar questões:', error);
    throw error;
  }
};

// Função para processar o texto de resposta em um array de objetos Question
function processQuestions(text: string): Question[] {
  // Dividir o texto em questões individuais
  let questions: Question[] = [];
  
  // Padrão para identificar questões numeradas 
  const questionRegex = /(?:^|\n)(?:Questão\s*)?(\d+)[\.:\)]\s*(.*?)(?=(?:\n(?:Questão\s*)?(?:\d+)[\.:\)])|$)/gs;
  
  let match;
  while ((match = questionRegex.exec(text)) !== null) {
    const fullContent = match[2].trim();
    
    // Tentar identificar tipo, enunciado, gabarito e explicação
    const typeMatch = fullContent.match(/^(?:Tipo|Tipo de questão):\s*(.*?)(?:\n|$)/i);
    const type = typeMatch ? typeMatch[1].trim() : "Não especificado";
    
    const questionContent = fullContent.replace(/^(?:Tipo|Tipo de questão):\s*(.*?)(?:\n|$)/i, '').trim();
    
    // Separar gabarito e explicação
    const answerMatch = questionContent.match(/(?:Gabarito|Resposta):\s*(.*?)(?:\n|$)/i);
    const answer = answerMatch ? answerMatch[1].trim() : "";
    
    const explanationMatch = questionContent.match(/(?:Explicação|Justificativa):\s*([\s\S]*?)$/i);
    const explanation = explanationMatch ? explanationMatch[1].trim() : "";
    
    // O enunciado é o que resta após remover tipo, gabarito e explicação
    let statement = questionContent
      .replace(/(?:Gabarito|Resposta):\s*(.*?)(?:\n|$)/i, '')
      .replace(/(?:Explicação|Justificativa):\s*([\s\S]*?)$/i, '')
      .trim();
    
    // Adicionar à lista de questões
    questions.push({
      number: match[1],
      type,
      statement,
      answer,
      explanation
    });
  }
  
  // Se não encontrou nenhuma questão com o regex, considerar o texto completo
  if (questions.length === 0) {
    questions.push({
      number: "1",
      type: "Não especificado",
      statement: text,
      answer: "",
      explanation: ""
    });
  }
  
  return questions;
}
