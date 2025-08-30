
import { geminiLogger } from '@/utils/geminiDebugLogger';

export interface QuizInterativoData {
  subject: string;
  schoolYear: string;
  theme: string;
  objectives: string;
  difficultyLevel: string;
  format: string;
  numberOfQuestions: string;
  timePerQuestion: string;
  instructions: string;
  evaluation: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  type: 'multipla-escolha' | 'verdadeiro-falso';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
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
        throw new Error('API Key do Gemini não configurada');
      }

      const prompt = this.buildPrompt(data);
      const response = await this.callGeminiAPI(prompt);
      const content = this.parseResponse(response, data);

      geminiLogger.logSuccess('✅ Quiz Interativo gerado com sucesso', content);
      return content;

    } catch (error) {
      geminiLogger.logError('❌ Erro ao gerar Quiz Interativo', error);
      throw error;
    }
  }

  private buildPrompt(data: QuizInterativoData): string {
    return `
Você é um especialista em educação e criação de quizzes interativos. Crie um quiz completo baseado nos seguintes parâmetros:

**DADOS DE ENTRADA:**
- Disciplina: ${data.subject}
- Ano Escolar: ${data.schoolYear}
- Tema: ${data.theme}
- Objetivos: ${data.objectives}
- Nível de Dificuldade: ${data.difficultyLevel}
- Formato: ${data.format}
- Número de Questões: ${data.numberOfQuestions}
- Tempo por Questão: ${data.timePerQuestion || '1 minuto'}
- Instruções: ${data.instructions}
- Critérios de Avaliação: ${data.evaluation}

**INSTRUÇÕES PARA CRIAÇÃO:**

1. **Formato das Questões:**
   - Se formato for "Múltipla Escolha": crie questões com 4 alternativas (A, B, C, D)
   - Se formato for "Verdadeiro/Falso": crie questões de V ou F
   - Se formato for "Misto": alterne entre múltipla escolha e verdadeiro/falso

2. **Estrutura de cada questão:**
   - Enunciado claro e objetivo
   - Alternativas bem elaboradas (para múltipla escolha)
   - Resposta correta
   - Breve explicação da resposta

3. **Critérios de Qualidade:**
   - Questões alinhadas aos objetivos de aprendizagem
   - Nível de dificuldade apropriado para o ano escolar
   - Linguagem adequada à faixa etária
   - Questões que testem compreensão, não decoreba

**RESPONDA APENAS EM JSON NO SEGUINTE FORMATO:**

{
  "title": "Título do Quiz",
  "description": "Descrição breve do quiz",
  "questions": [
    {
      "id": 1,
      "question": "Pergunta aqui",
      "type": "multipla-escolha" | "verdadeiro-falso",
      "options": ["A) opção", "B) opção", "C) opção", "D) opção"] (apenas para múltipla escolha),
      "correctAnswer": "resposta correta",
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

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Erro na API do Gemini: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Resposta inválida da API do Gemini');
    }

    return data.candidates[0].content.parts[0].text;
  }

  private parseResponse(response: string, originalData: QuizInterativoData): QuizInterativoContent {
    try {
      geminiLogger.logInfo('🔍 Processando resposta do Gemini', { 
        responseLength: response.length,
        originalData 
      });

      // Remove possíveis caracteres extras antes e depois do JSON
      let cleanResponse = response.trim();
      cleanResponse = cleanResponse.replace(/^```json\s*/g, '').replace(/\s*```$/g, '');
      cleanResponse = cleanResponse.replace(/^```\s*/g, '').replace(/\s*```$/g, '');
      
      // Encontrar início e fim do JSON
      const jsonStart = cleanResponse.indexOf('{');
      const jsonEnd = cleanResponse.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanResponse = cleanResponse.substring(jsonStart, jsonEnd + 1);
      }

      geminiLogger.logInfo('🧹 Resposta limpa', { cleanResponse });

      const parsed = JSON.parse(cleanResponse);

      // Validar estrutura básica
      if (!parsed.title || !parsed.questions || !Array.isArray(parsed.questions)) {
        geminiLogger.logError('❌ Estrutura de resposta inválida', parsed);
        throw new Error('Estrutura de resposta inválida');
      }

      // Processar questões com validação robusta
      const questions: QuizQuestion[] = parsed.questions.map((q: any, index: number) => {
        const processedQuestion = {
          id: index + 1,
          question: q.question || q.pergunta || `Questão ${index + 1}`,
          type: (q.type === 'verdadeiro-falso' || q.tipo === 'verdadeiro-falso') ? 'verdadeiro-falso' : 'multipla-escolha',
          options: q.options || q.opcoes || q.alternativas || [],
          correctAnswer: q.correctAnswer || q.respostaCorreta || q.resposta || '',
          explanation: q.explanation || q.explicacao || q.justificativa || ''
        };

        geminiLogger.logInfo('✅ Questão processada', processedQuestion);
        return processedQuestion;
      });

      // Converter tempo por questão de string para número
      let timePerQuestion = 60; // padrão
      if (originalData.timePerQuestion) {
        const timeValue = parseInt(originalData.timePerQuestion.toString().replace(/\D/g, ''));
        if (!isNaN(timeValue) && timeValue > 0) {
          timePerQuestion = timeValue;
        }
      }

      const result: QuizInterativoContent = {
        title: parsed.title || originalData.theme || 'Quiz Interativo',
        description: parsed.description || `Quiz sobre ${originalData.theme}`,
        questions,
        timePerQuestion,
        totalQuestions: questions.length,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true
      };

      geminiLogger.logInfo('✅ Conteúdo final processado', result);
      return result;

    } catch (error) {
      geminiLogger.logError('❌ Erro ao processar resposta do Gemini', error);
      
      // Fallback com dados básicos se o parsing falhar
      const fallbackQuestions: QuizQuestion[] = Array.from({ length: parseInt(originalData.numberOfQuestions) || 5 }, (_, index) => ({
        id: index + 1,
        question: `Questão ${index + 1} sobre ${originalData.theme}`,
        type: 'multipla-escolha',
        options: ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D'],
        correctAnswer: 'Alternativa A',
        explanation: 'Esta é uma questão de exemplo gerada automaticamente.'
      }));

      return {
        title: originalData.theme || 'Quiz Interativo',
        description: `Quiz sobre ${originalData.theme}`,
        questions: fallbackQuestions,
        timePerQuestion: parseInt(originalData.timePerQuestion) || 60,
        totalQuestions: fallbackQuestions.length,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: false,
        isFallback: true
      };
    }
  }
}
