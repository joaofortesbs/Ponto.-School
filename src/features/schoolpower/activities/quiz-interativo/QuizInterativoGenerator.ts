
import { geminiLogger } from '@/utils/geminiDebugLogger';

interface QuizQuestion {
  id: number;
  question: string;
  type: 'multipla-escolha' | 'verdadeiro-falso';
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizInterativoData {
  title: string;
  description: string;
  theme: string;
  schoolYear: string;
  subject: string;
  numberOfQuestions: string;
  questionModel: string;
  timePerQuestion: string;
  objectives: string;
  materials: string;
  instructions: string;
  evaluation: string;
}

interface QuizInterativoContent {
  title: string;
  description: string;
  questions: QuizQuestion[];
  timePerQuestion: number;
  totalQuestions: number;
  generatedAt: string;
  isGeneratedByAI: boolean;
}

export class QuizInterativoGenerator {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  async generateQuizContent(data: QuizInterativoData): Promise<QuizInterativoContent> {
    try {
      geminiLogger.logInfo('🎯 Iniciando geração de Quiz Interativo', data);

      if (!this.apiKey) {
        geminiLogger.logError('❌ API Key do Gemini não configurada');
        throw new Error('API Key do Gemini não configurada');
      }

      const prompt = this.buildPrompt(data);
      geminiLogger.logInfo('📝 Prompt construído para o Gemini', { promptLength: prompt.length });

      const response = await this.callGeminiAPI(prompt);
      geminiLogger.logInfo('📨 Resposta recebida do Gemini', { responseLength: response.length });

      const content = this.parseResponse(response, data);
      geminiLogger.logSuccess('✅ Quiz Interativo gerado com sucesso', content);

      return content;

    } catch (error) {
      geminiLogger.logError('❌ Erro ao gerar Quiz Interativo', error);
      
      // Retornar dados de fallback mais realistas
      const fallbackContent: QuizInterativoContent = {
        title: data.title || `Quiz Interativo: ${data.theme}`,
        description: data.description || `Quiz sobre ${data.theme} para ${data.schoolYear}`,
        questions: this.generateFallbackQuestions(data),
        timePerQuestion: parseInt(data.timePerQuestion) || 60,
        totalQuestions: parseInt(data.numberOfQuestions) || 5,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: false
      };

      geminiLogger.logInfo('🔄 Usando dados de fallback', fallbackContent);
      return fallbackContent;
    }
  }

  private buildPrompt(data: QuizInterativoData): string {
    const numQuestions = parseInt(data.numberOfQuestions) || 5;
    const questionType = data.questionModel?.toLowerCase().includes('verdadeiro') ? 'verdadeiro-falso' : 'multipla-escolha';

    return `
Você é um especialista em educação e criação de quizzes interativos. Crie um quiz completo baseado nos seguintes dados:

INFORMAÇÕES DO QUIZ:
- Título: ${data.title}
- Descrição: ${data.description}
- Tema: ${data.theme}
- Disciplina: ${data.subject}
- Ano/Série: ${data.schoolYear}
- Número de Questões: ${numQuestions}
- Tipo de Questão: ${questionType}
- Tempo por Questão: ${data.timePerQuestion} segundos
- Objetivos de Aprendizagem: ${data.objectives}
- Materiais Necessários: ${data.materials}
- Instruções da Atividade: ${data.instructions}
- Critérios de Avaliação: ${data.evaluation}

INSTRUÇÕES PARA CRIAÇÃO:
1. Crie exatamente ${numQuestions} questões sobre o tema "${data.theme}"
2. Use o tipo de questão: ${questionType}
3. Para múltipla escolha: 4 alternativas (A, B, C, D)
4. Para verdadeiro/falso: apenas "Verdadeiro" e "Falso"
5. Inclua explicações educativas para cada resposta
6. Questões adequadas para ${data.schoolYear}
7. Foque nos objetivos: ${data.objectives}

**RESPONDA APENAS EM JSON NO SEGUINTE FORMATO:**

{
  "title": "${data.title}",
  "description": "${data.description}",
  "questions": [
    {
      "id": 1,
      "question": "Pergunta aqui",
      "type": "${questionType}",
      "options": ["A) opção", "B) opção", "C) opção", "D) opção"],
      "correctAnswer": "A) opção correta",
      "explanation": "explicação da resposta"
    }
  ]
}

IMPORTANTE: Retorne APENAS o JSON, sem texto adicional antes ou depois.
    `;
  }

  private async callGeminiAPI(prompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.apiKey}`;
    
    const payload = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    };

    geminiLogger.logInfo('🌐 Enviando requisição para API Gemini', { url, payloadSize: JSON.stringify(payload).length });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      geminiLogger.logError(`❌ Erro na API do Gemini: ${response.status}`, errorText);
      throw new Error(`Erro na API do Gemini: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      geminiLogger.logError('❌ Resposta inválida da API do Gemini', data);
      throw new Error('Resposta inválida da API do Gemini');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    geminiLogger.logInfo('📨 Resposta extraída com sucesso', { responseLength: responseText.length });

    return responseText;
  }

  private parseResponse(response: string, originalData: QuizInterativoData): QuizInterativoContent {
    try {
      geminiLogger.logInfo('🔍 Iniciando parse da resposta', { responseLength: response.length });

      // Limpar resposta removendo markdown e caracteres extras
      let cleanResponse = response.trim();
      cleanResponse = cleanResponse.replace(/^```json\s*/g, '').replace(/\s*```$/g, '');
      cleanResponse = cleanResponse.replace(/^```\s*/g, '').replace(/\s*```$/g, '');

      // Encontrar o JSON na resposta
      const jsonStart = cleanResponse.indexOf('{');
      const jsonEnd = cleanResponse.lastIndexOf('}');

      if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
        throw new Error('JSON não encontrado na resposta');
      }

      const jsonString = cleanResponse.substring(jsonStart, jsonEnd + 1);
      geminiLogger.logInfo('📋 JSON extraído', { jsonLength: jsonString.length });

      const parsed = JSON.parse(jsonString);

      // Validar estrutura básica
      if (!parsed.title || !parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Estrutura de resposta inválida - campos obrigatórios ausentes');
      }

      // Processar questões garantindo dados válidos
      const questions: QuizQuestion[] = parsed.questions.map((q: any, index: number) => {
        const questionData = {
          id: index + 1,
          question: q.question || `Questão ${index + 1} sobre ${originalData.theme}`,
          type: (q.type || originalData.questionModel?.toLowerCase().includes('verdadeiro') ? 'verdadeiro-falso' : 'multipla-escolha') as 'multipla-escolha' | 'verdadeiro-falso',
          options: Array.isArray(q.options) ? q.options : ['A) Opção 1', 'B) Opção 2', 'C) Opção 3', 'D) Opção 4'],
          correctAnswer: q.correctAnswer || (Array.isArray(q.options) ? q.options[0] : 'A) Opção 1'),
          explanation: q.explanation || 'Explicação da resposta.'
        };

        // Validar tipo verdadeiro/falso
        if (questionData.type === 'verdadeiro-falso') {
          questionData.options = ['Verdadeiro', 'Falso'];
          if (!['Verdadeiro', 'Falso'].includes(questionData.correctAnswer)) {
            questionData.correctAnswer = 'Verdadeiro';
          }
        }

        return questionData;
      });

      // Garantir que temos pelo menos uma questão
      if (questions.length === 0) {
        questions.push({
          id: 1,
          question: `Qual é o conceito principal de ${originalData.theme}?`,
          type: 'multipla-escolha',
          options: ['A) Conceito básico', 'B) Conceito intermediário', 'C) Conceito avançado', 'D) Todos os anteriores'],
          correctAnswer: 'A) Conceito básico',
          explanation: 'Esta é a resposta correta baseada no tema estudado.'
        });
      }

      const finalContent: QuizInterativoContent = {
        title: parsed.title || data.title || `Quiz Interativo: ${data.theme}`,
        description: parsed.description || data.description || `Quiz sobre ${data.theme}`,
        questions,
        timePerQuestion: parseInt(data.timePerQuestion) || 60,
        totalQuestions: questions.length,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true
      };

      geminiLogger.logSuccess('✅ Parse concluído com sucesso', finalContent);
      return finalContent;

    } catch (error) {
      geminiLogger.logError('❌ Erro ao processar resposta do Gemini', error);
      throw new Error(`Erro ao processar resposta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private generateFallbackQuestions(data: QuizInterativoData): QuizQuestion[] {
    const numQuestions = parseInt(data.numberOfQuestions) || 5;
    const questionType = data.questionModel?.toLowerCase().includes('verdadeiro') ? 'verdadeiro-falso' : 'multipla-escolha';
    const questions: QuizQuestion[] = [];

    for (let i = 1; i <= numQuestions; i++) {
      if (questionType === 'verdadeiro-falso') {
        questions.push({
          id: i,
          question: `Questão ${i}: O tema "${data.theme}" é fundamental para ${data.subject}?`,
          type: 'verdadeiro-falso',
          options: ['Verdadeiro', 'Falso'],
          correctAnswer: 'Verdadeiro',
          explanation: `Esta afirmação é verdadeira porque ${data.theme} é essencial para compreender ${data.subject}.`
        });
      } else {
        questions.push({
          id: i,
          question: `Questão ${i}: Qual é a principal característica de ${data.theme}?`,
          type: 'multipla-escolha',
          options: [
            'A) Característica fundamental',
            'B) Característica secundária', 
            'C) Característica opcional',
            'D) Não possui características'
          ],
          correctAnswer: 'A) Característica fundamental',
          explanation: `A resposta correta é A, pois ${data.theme} possui características fundamentais importantes para ${data.subject}.`
        });
      }
    }

    return questions;
  }
}
