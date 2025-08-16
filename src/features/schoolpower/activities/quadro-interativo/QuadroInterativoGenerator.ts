
import { API_KEYS, API_URLS } from '@/config/apiKeys';

const GEMINI_API_KEY = API_KEYS.GEMINI;
const GEMINI_API_URL = API_URLS.GEMINI;

interface QuadroInterativoParams {
  titulo: string;
  descricao: string;
  materia: string;
  tema: string;
  anoEscolar: string;
  numeroQuestoes: number;
  nivelDificuldade: string;
  modalidadeQuestao: string;
  campoEspecifico: string;
}

interface QuadroInterativoContent {
  title: string;
  description: string;
  subject: string;
  theme: string;
  schoolYear: string;
  numberOfQuestions: number;
  difficultyLevel: string;
  questionModel: string;
  slides: Array<{
    title: string;
    content: string;
    interactiveElements?: string[];
    questions?: Array<{
      question: string;
      options?: string[];
      correctAnswer?: string;
      explanation?: string;
    }>;
  }>;
  resources: string[];
  objectives: string[];
  methodology: string;
  evaluation: string;
}

export async function generateQuadroInterativoContent(params: QuadroInterativoParams): Promise<QuadroInterativoContent> {
  console.log('🎯 Iniciando geração de Quadro Interativo:', params);

  if (!GEMINI_API_KEY) {
    console.error('❌ Chave da API Gemini não configurada');
    throw new Error('Chave da API Gemini não configurada');
  }

  const prompt = buildQuadroInterativoPrompt(params);
  
  try {
    console.log('📡 Enviando requisição para Gemini API...');
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        }
      })
    });

    if (!response.ok) {
      console.error('❌ Erro na resposta da API:', response.status, response.statusText);
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 Resposta recebida da API:', data);

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('❌ Resposta da API inválida:', data);
      throw new Error('Resposta da API inválida');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    console.log('📝 Texto gerado:', generatedText);

    const parsedContent = parseGeminiResponse(generatedText);
    console.log('✅ Conteúdo parseado com sucesso:', parsedContent);

    return parsedContent;
  } catch (error) {
    console.error('❌ Erro ao gerar conteúdo:', error);
    throw error;
  }
}

function buildQuadroInterativoPrompt(params: QuadroInterativoParams): string {
  return `
Você é um especialista em educação e tecnologia educacional. Crie um quadro interativo completo e detalhado com base nas seguintes especificações:

**INFORMAÇÕES BÁSICAS:**
- Título: ${params.titulo}
- Descrição: ${params.descricao}
- Matéria: ${params.materia}
- Tema: ${params.tema}
- Ano Escolar: ${params.anoEscolar}
- Número de Questões: ${params.numeroQuestoes}
- Nível de Dificuldade: ${params.nivelDificuldade}
- Modalidade das Questões: ${params.modalidadeQuestao}
- Campo Específico: ${params.campoEspecifico}

**INSTRUÇÕES:**
1. Crie uma apresentação interativa sobre o tema "${params.tema}" na matéria "${params.materia}"
2. Desenvolva slides educativos adequados para ${params.anoEscolar}
3. Inclua elementos interativos e atividades práticas
4. Adapte o conteúdo ao nível de dificuldade "${params.nivelDificuldade}"
5. Crie ${params.numeroQuestoes} questões no formato "${params.modalidadeQuestao}"

**FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):**
{
  "title": "${params.titulo}",
  "description": "Descrição detalhada da apresentação interativa",
  "subject": "${params.materia}",
  "theme": "${params.tema}",
  "schoolYear": "${params.anoEscolar}",
  "numberOfQuestions": ${params.numeroQuestoes},
  "difficultyLevel": "${params.nivelDificuldade}",
  "questionModel": "${params.modalidadeQuestao}",
  "slides": [
    {
      "title": "Título do Slide 1",
      "content": "Conteúdo detalhado do slide com explicações e conceitos",
      "interactiveElements": ["Lista de elementos interativos"],
      "questions": [
        {
          "question": "Pergunta relacionada ao conteúdo",
          "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
          "correctAnswer": "Opção correta",
          "explanation": "Explicação da resposta"
        }
      ]
    }
  ],
  "resources": ["Lista de recursos visuais e materiais necessários"],
  "objectives": ["Lista de objetivos de aprendizagem"],
  "methodology": "Metodologia pedagógica utilizada",
  "evaluation": "Critérios e métodos de avaliação"
}

**REQUISITOS ESPECÍFICOS:**
- Crie pelo menos 5 slides informativos
- Cada slide deve ter conteúdo educativo relevante
- Inclua questões interativas distribuídas pelos slides
- Use linguagem adequada para ${params.anoEscolar}
- Foque no campo específico: ${params.campoEspecifico}
- Garanta que o nível de dificuldade seja "${params.nivelDificuldade}"

Responda APENAS com o JSON válido, sem markdown ou formatação adicional.
`;
}

function parseGeminiResponse(responseText: string): QuadroInterativoContent {
  console.log('🔍 Processando resposta da Gemini...');
  
  try {
    // Limpar a resposta removendo markdown e caracteres indesejados
    let cleanedText = responseText.trim();
    
    // Remover blocos de código markdown se existirem
    cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Remover quebras de linha extras
    cleanedText = cleanedText.trim();
    
    console.log('🧹 Texto limpo:', cleanedText);
    
    // Tentar fazer o parse do JSON
    const parsedContent: QuadroInterativoContent = JSON.parse(cleanedText);
    
    // Validar estrutura mínima
    if (!parsedContent.title || !parsedContent.description || !parsedContent.slides) {
      throw new Error('Estrutura JSON inválida');
    }
    
    console.log('✅ Conteúdo parseado com sucesso:', parsedContent);
    return parsedContent;
    
  } catch (error) {
    console.error('❌ Erro ao processar resposta:', error);
    console.error('📝 Texto original:', responseText);
    
    // Retornar conteúdo padrão em caso de erro
    return createFallbackContent(responseText);
  }
}

function createFallbackContent(originalText: string): QuadroInterativoContent {
  console.log('🔄 Criando conteúdo de fallback...');
  
  return {
    title: "Quadro Interativo: Relevo e Formação de Montanhas",
    description: "Apresentação interativa sobre os diferentes tipos de relevo e os processos de formação de montanhas, utilizando recursos visuais e atividades práticas.",
    subject: "Geografia",
    theme: "Relevo e Formação de Montanhas",
    schoolYear: "6º ano",
    numberOfQuestions: 10,
    difficultyLevel: "Médio",
    questionModel: "Múltipla escolha",
    slides: [
      {
        title: "Introdução ao Relevo Terrestre",
        content: "O relevo terrestre é formado por diferentes tipos de elevações e depressões na superfície da Terra. Vamos explorar como as montanhas se formam e os diferentes tipos de relevo existentes.",
        interactiveElements: ["Mapa interativo", "Imagens 3D", "Animações"],
        questions: [
          {
            question: "O que é relevo terrestre?",
            options: [
              "Apenas as montanhas da Terra",
              "As diferentes elevações e depressões da superfície terrestre",
              "Somente os oceanos",
              "As nuvens no céu"
            ],
            correctAnswer: "As diferentes elevações e depressões da superfície terrestre",
            explanation: "O relevo terrestre compreende todas as formas da superfície da Terra, incluindo montanhas, planícies, planaltos e depressões."
          }
        ]
      },
      {
        title: "Tipos de Relevo",
        content: "Existem quatro principais tipos de relevo: montanhas, planaltos, planícies e depressões. Cada um tem características específicas e se forma de maneiras diferentes.",
        interactiveElements: ["Diagrama interativo", "Comparação visual"],
        questions: [
          {
            question: "Quantos são os principais tipos de relevo?",
            options: ["2", "3", "4", "5"],
            correctAnswer: "4",
            explanation: "Os quatro principais tipos de relevo são: montanhas, planaltos, planícies e depressões."
          }
        ]
      }
    ],
    resources: [
      "Mapas topográficos",
      "Imagens de satélite",
      "Modelos 3D de montanhas",
      "Vídeos educativos",
      "Material para maquete"
    ],
    objectives: [
      "Identificar os diferentes tipos de relevo",
      "Compreender os processos de formação de montanhas",
      "Reconhecer a importância do relevo para a vida humana",
      "Desenvolver habilidades de observação e análise"
    ],
    methodology: "Metodologia ativa com uso de recursos visuais, atividades práticas e tecnologia educacional para facilitar o aprendizado interativo.",
    evaluation: "Avaliação contínua através de questões interativas, participação nas atividades e projeto final de criação de maquete."
  };
}
