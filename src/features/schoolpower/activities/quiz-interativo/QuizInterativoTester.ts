
import { QuizInterativoGenerator, QuizInterativoData } from './QuizInterativoGenerator';
import { geminiLogger } from '@/utils/geminiDebugLogger';

export class QuizInterativoTester {
  private generator: QuizInterativoGenerator;

  constructor() {
    this.generator = new QuizInterativoGenerator();
  }

  /**
   * Testa a geração de quiz com dados de exemplo
   */
  async testQuizGeneration(): Promise<boolean> {
    try {
      geminiLogger.logInfo('🧪 Iniciando teste de geração de Quiz Interativo');

      const testData: QuizInterativoData = {
        subject: 'Matemática',
        schoolYear: '7º Ano - Ensino Fundamental',
        theme: 'Equações do 1º Grau',
        objectives: 'Compreender conceitos de equações, resolução de problemas e aplicações práticas',
        difficultyLevel: 'Médio',
        format: 'Misto',
        numberOfQuestions: '8',
        timePerQuestion: '90',
        instructions: 'Resolva cada questão com atenção',
        evaluation: 'Avaliação formativa baseada em acertos'
      };

      const result = await this.generator.generateQuizContent(testData);

      // Validar resultado
      const validationResults = this.validateQuizContent(result);
      
      geminiLogger.logInfo('🔍 Resultado da validação do teste', validationResults);

      return validationResults.isValid;

    } catch (error) {
      geminiLogger.logError('❌ Erro no teste de geração', error);
      return false;
    }
  }

  /**
   * Valida se o conteúdo gerado está correto
   */
  private validateQuizContent(content: any): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar estrutura básica
    if (!content.title || content.title.length < 10) {
      errors.push('Título inválido ou muito curto');
    }

    if (!content.description || content.description.length < 20) {
      errors.push('Descrição inválida ou muito curta');
    }

    if (!content.questions || !Array.isArray(content.questions)) {
      errors.push('Questões não encontradas ou formato inválido');
      return { isValid: false, errors, warnings };
    }

    if (content.questions.length === 0) {
      errors.push('Nenhuma questão foi gerada');
      return { isValid: false, errors, warnings };
    }

    // Validar cada questão
    content.questions.forEach((question: any, index: number) => {
      const questionNum = index + 1;

      if (!question.question || question.question.length < 10) {
        errors.push(`Questão ${questionNum}: Texto da questão inválido`);
      }

      if (!question.type || !['multipla-escolha', 'verdadeiro-falso'].includes(question.type)) {
        errors.push(`Questão ${questionNum}: Tipo de questão inválido`);
      }

      if (!question.options || !Array.isArray(question.options)) {
        errors.push(`Questão ${questionNum}: Opções não encontradas`);
      } else {
        if (question.type === 'multipla-escolha' && question.options.length !== 4) {
          warnings.push(`Questão ${questionNum}: Múltipla escolha deveria ter 4 opções, tem ${question.options.length}`);
        }
        if (question.type === 'verdadeiro-falso' && question.options.length !== 2) {
          warnings.push(`Questão ${questionNum}: Verdadeiro/Falso deveria ter 2 opções, tem ${question.options.length}`);
        }
      }

      if (!question.correctAnswer) {
        errors.push(`Questão ${questionNum}: Resposta correta não definida`);
      }

      if (!question.explanation || question.explanation.length < 15) {
        warnings.push(`Questão ${questionNum}: Explicação muito curta ou ausente`);
      }
    });

    // Validar diversidade
    const questionTypes = content.questions.map((q: any) => q.type);
    const uniqueTypes = new Set(questionTypes);
    
    if (content.questions.length > 4 && uniqueTypes.size === 1) {
      warnings.push('Baixa diversidade: todas as questões são do mesmo tipo');
    }

    // Validar se há questões repetidas
    const questionTexts = content.questions.map((q: any) => q.question);
    const uniqueQuestions = new Set(questionTexts);
    
    if (uniqueQuestions.size !== questionTexts.length) {
      errors.push('Questões duplicadas encontradas');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Testa conectividade com a API Gemini
   */
  async testApiConnectivity(): Promise<{ connected: boolean; details: any }> {
    try {
      geminiLogger.logInfo('🔌 Testando conectividade com API Gemini');

      const testPrompt = 'Responda apenas: "API Gemini funcionando"';
      
      const generator = new QuizInterativoGenerator();
      
      // Usar método privado através de reflexão para teste
      const response = await (generator as any).callGeminiAPI(testPrompt);
      
      const isWorking = response.includes('funcionando') || response.includes('working');
      
      geminiLogger.logInfo('✅ Teste de conectividade concluído', { 
        isWorking, 
        response: response.substring(0, 100) 
      });

      return {
        connected: isWorking,
        details: {
          response: response.substring(0, 200),
          responseLength: response.length,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      geminiLogger.logError('❌ Falha no teste de conectividade', error);
      
      return {
        connected: false,
        details: {
          error: error.message,
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}

// Exportar função de teste global
export const testQuizInterativoSystem = async (): Promise<void> => {
  const tester = new QuizInterativoTester();
  
  console.log('🧪 ===== TESTE DO SISTEMA QUIZ INTERATIVO =====');
  
  // Teste 1: Conectividade da API
  console.log('🔌 Teste 1: Conectividade da API Gemini...');
  const connectivityResult = await tester.testApiConnectivity();
  console.log('Resultado:', connectivityResult);
  
  // Teste 2: Geração de conteúdo
  console.log('🎯 Teste 2: Geração de conteúdo completo...');
  const generationResult = await tester.testQuizGeneration();
  console.log('Resultado:', generationResult ? 'SUCESSO' : 'FALHA');
  
  console.log('🧪 ===== FIM DOS TESTES =====');
};

// Disponibilizar teste globalmente para debug
(window as any).testQuizInterativo = testQuizInterativoSystem;
