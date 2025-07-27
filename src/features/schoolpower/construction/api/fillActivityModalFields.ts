
import { ActivityFormData } from '../types/ActivityTypes';

export const fillActivityModalFields = async (
  activityId: string,
  formData: ActivityFormData
): Promise<boolean> => {
  console.log(`🔧 Preenchendo campos automaticamente para atividade: ${activityId}`);
  
  try {
    // Armazenar dados no localStorage para o modal acessar
    const storageKey = `auto_activity_data_${activityId}`;
    localStorage.setItem(storageKey, JSON.stringify({
      formData,
      timestamp: Date.now(),
      autoFilled: true
    }));

    // Simular preenchimento e construção automática
    await simulateActivityGeneration(activityId, formData);
    
    console.log(`✅ Campos preenchidos e atividade gerada para: ${activityId}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Erro ao preencher campos para ${activityId}:`, error);
    return false;
  }
};

const simulateActivityGeneration = async (
  activityId: string,
  formData: ActivityFormData
): Promise<void> => {
  // Simular delay de geração
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Gerar conteúdo baseado no tipo de atividade
  let generatedContent = '';
  
  if (activityId === 'lista-exercicios') {
    generatedContent = generateExerciseListContent(formData);
  } else if (activityId === 'prova') {
    generatedContent = generateExamContent(formData);
  } else {
    generatedContent = generateGenericActivityContent(formData);
  }
  
  // Salvar conteúdo gerado
  const contentKey = `generated_content_${activityId}`;
  localStorage.setItem(contentKey, generatedContent);
};

const generateExerciseListContent = (formData: ActivityFormData): string => {
  const exercises = [];
  const numQuestions = parseInt(formData.numberOfQuestions) || 10;
  
  for (let i = 1; i <= numQuestions; i++) {
    if (formData.questionModel === 'Múltipla Escolha') {
      exercises.push(`${i}. Questão sobre ${formData.theme} - ${formData.difficultyLevel}
      a) Alternativa A
      b) Alternativa B  
      c) Alternativa C
      d) Alternativa D`);
    } else {
      exercises.push(`${i}. Questão dissertativa sobre ${formData.theme} (${formData.difficultyLevel})`);
    }
  }
  
  return JSON.stringify({
    title: formData.title,
    description: formData.description,
    subject: formData.subject,
    theme: formData.theme,
    schoolYear: formData.schoolYear,
    difficulty: formData.difficultyLevel,
    questions: exercises
  });
};

const generateExamContent = (formData: ActivityFormData): string => {
  return `# ${formData.title}

**Disciplina:** ${formData.subject}
**Tema:** ${formData.theme}
**Ano:** ${formData.schoolYear}
**Dificuldade:** ${formData.difficultyLevel}

## Instruções
${formData.instructions}

## Questões
[Conteúdo da prova gerado automaticamente com base nos parâmetros fornecidos]

## Critérios de Avaliação
${formData.evaluation}`;
};

const generateGenericActivityContent = (formData: ActivityFormData): string => {
  return `# ${formData.title}

**Descrição:** ${formData.description}

## Objetivos
${formData.objectives}

## Materiais Necessários
${formData.materials}

## Instruções
${formData.instructions}

## Avaliação
${formData.evaluation}`;
};
