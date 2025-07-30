import { ActivityFormData } from '../types/ActivityTypes';

export interface Question {
  id: string;
  number: number;
  text: string;
  type: 'multiple-choice' | 'essay' | 'true-false';
  difficulty: string;
  points: number;
  options?: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  expectedLength?: string;
  correctAnswer?: boolean | string;
  explanation?: string;
}

export interface ExerciseListData {
  title: string;
  description: string;
  subject: string;
  theme: string;
  schoolYear: string;
  numberOfQuestions: number;
  difficultyLevel: string;
  questionModel: string;
  sources: string;
  questions: Question[];
  metadata: {
    generatedAt: string;
    activityType: string;
  };
}

export class ActivityGenerationService {
  private generateQuestions(formData: ActivityFormData): Question[] {
    const numberOfQuestions = parseInt(formData.customFields?.['Quantidade de Questões'] || '10');
    const tema = formData.customFields?.['Tema'] || formData.title || 'Tema geral';
    const disciplina = formData.customFields?.['Disciplina'] || 'Disciplina';
    const nivelDificuldade = formData.customFields?.['Nível de Dificuldade'] || 'Médio';
    const tipoQuestao = formData.customFields?.['Tipo de Questão'] || 'multiple-choice';

    const questions: Question[] = [];

    for (let i = 0; i < numberOfQuestions; i++) {
      const questionNumber = i + 1;

      if (tipoQuestao === 'multiple-choice' || tipoQuestao === 'Múltipla Escolha') {
        questions.push({
          id: `q${questionNumber}`,
          number: questionNumber,
          text: `${questionNumber}. Com base no tema "${tema}" em ${disciplina}, analise a seguinte situação problema e assinale a alternativa correta:`,
          type: 'multiple-choice',
          difficulty: nivelDificuldade,
          points: 1,
          options: [
            {
              id: 'a',
              text: `Primeira alternativa relacionada ao ${tema}`,
              isCorrect: true
            },
            {
              id: 'b',
              text: `Segunda alternativa sobre ${tema}`,
              isCorrect: false
            },
            {
              id: 'c',
              text: `Terceira alternativa envolvendo ${tema}`,
              isCorrect: false
            },
            {
              id: 'd',
              text: `Quarta alternativa referente ao ${tema}`,
              isCorrect: false
            }
          ],
          explanation: `Esta questão avalia o conhecimento sobre ${tema} no contexto de ${disciplina}.`
        });
      } else if (tipoQuestao === 'essay' || tipoQuestao === 'Dissertativa') {
        questions.push({
          id: `q${questionNumber}`,
          number: questionNumber,
          text: `${questionNumber}. Desenvolva uma resposta dissertativa sobre "${tema}" em ${disciplina}, explicando os principais conceitos e suas aplicações.`,
          type: 'essay',
          difficulty: nivelDificuldade,
          points: 2,
          expectedLength: 'Entre 5 a 10 linhas',
          explanation: `Esta questão avalia a capacidade de argumentação e conhecimento sobre ${tema}.`
        });
      } else if (tipoQuestao === 'true-false' || tipoQuestao === 'Verdadeiro/Falso') {
        questions.push({
          id: `q${questionNumber}`,
          number: questionNumber,
          text: `${questionNumber}. A seguinte afirmação sobre ${tema} em ${disciplina} está correta: "Esta é uma afirmação relacionada ao conteúdo de ${tema}."`,
          type: 'true-false',
          difficulty: nivelDificuldade,
          points: 1,
          correctAnswer: true,
          explanation: `Esta questão verifica o entendimento sobre conceitos básicos de ${tema}.`
        });
      }
    }

    return questions;
  }

  public generateExerciseList(formData: ActivityFormData): ExerciseListData {
    console.log('🔄 Gerando Lista de Exercícios:', formData);

    const numberOfQuestions = parseInt(formData.customFields?.['Quantidade de Questões'] || '10');
    const tema = formData.customFields?.['Tema'] || formData.title || 'Tema geral';
    const disciplina = formData.customFields?.['Disciplina'] || 'Disciplina';
    const anoEscolaridade = formData.customFields?.['Ano de Escolaridade'] || 'Não especificado';
    const nivelDificuldade = formData.customFields?.['Nível de Dificuldade'] || 'Médio';
    const modeloQuestao = formData.customFields?.['Modelo de Questão'] || 'Múltipla Escolha';
    const fontes = formData.customFields?.['Fontes e Referências'] || 'Material didático padrão';

    const questions = this.generateQuestions(formData);

    const exerciseListData: ExerciseListData = {
      title: formData.title,
      description: formData.description,
      subject: disciplina,
      theme: tema,
      schoolYear: anoEscolaridade,
      numberOfQuestions: numberOfQuestions,
      difficultyLevel: nivelDificuldade,
      questionModel: modeloQuestao,
      sources: fontes,
      questions: questions,
      metadata: {
        generatedAt: new Date().toISOString(),
        activityType: 'lista-exercicios'
      }
    };

    console.log('✅ Lista de Exercícios gerada:', exerciseListData);
    return exerciseListData;
  }

  public generateActivityContent(activityType: string, formData: ActivityFormData): any {
    console.log('🎯 Gerando conteúdo para:', activityType, formData);

    switch (activityType) {
      case 'lista-exercicios':
        return this.generateExerciseList(formData);

      case 'prova':
        return this.generateExamContent(formData);

      default:
        return this.generateDefaultContent(formData);
    }
  }

  private generateExamContent(formData: ActivityFormData): string {
    const quantidade = formData.customFields?.['Quantidade de Questões'] || '20';
    const tema = formData.customFields?.['Tema'] || 'Tema geral';
    const tempoDuracao = formData.customFields?.['Tempo de Duração'] || '60 minutos';

    return `# ${formData.title}

## Avaliação - ${tema}
- **Total de Questões**: ${quantidade}
- **Tempo de Duração**: ${tempoDuracao}
- **Disciplina**: ${formData.customFields?.['Disciplina'] || 'Não especificado'}

## Descrição
${formData.description}

### Questões da Prova

${Array.from({length: parseInt(quantidade)}, (_, i) => `
**${i + 1}.** Questão sobre ${tema} - nível ${formData.customFields?.['Nível de Dificuldade'] || 'Médio'}
   a) Alternativa A
   b) Alternativa B  
   c) Alternativa C
   d) Alternativa D
`).join('\n')}

---
*Prova gerada automaticamente pelo School Power*`;
  }

  private generateDefaultContent(formData: ActivityFormData): string {
    return `# ${formData.title}

## Descrição
${formData.description}

### Conteúdo da Atividade

Esta atividade foi gerada automaticamente com base nos parâmetros fornecidos.

**Informações:**
- **Tipo**: ${formData.type || 'Atividade geral'}
- **Dificuldade**: ${formData.customFields?.['Nível de Dificuldade'] || 'Não especificado'}
- **Disciplina**: ${formData.customFields?.['Disciplina'] || 'Não especificado'}

---
*Atividade gerada automaticamente pelo School Power*`;
  }
}

export const activityGenerationService = new ActivityGenerationService();