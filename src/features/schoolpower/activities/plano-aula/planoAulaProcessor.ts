import { ActivityFormData } from '../../construction/types/ActivityTypes';
import { PlanoAulaFields, planoAulaFieldMapping } from './fieldMapping';

export interface PlanoAulaCustomFields {
  [key: string]: string;
}

export interface PlanoAulaActivity {
  id: string;
  title: string;
  description: string;
  customFields: PlanoAulaCustomFields;
  personalizedTitle?: string;
  personalizedDescription?: string;
}

/**
 * Processa dados de uma atividade de Plano de Aula do Action Plan
 * para o formato do formulário do modal
 */
export function processPlanoAulaData(activity: PlanoAulaActivity): ActivityFormData {
  console.log('📚 Processando dados do Plano de Aula:', activity);

  const customFields = activity.customFields || {};

  // Dados básicos da atividade
  const formData: ActivityFormData = {
    title: activity.personalizedTitle || activity.title || '',
    description: activity.personalizedDescription || activity.description || '',
    subject: 'Português', // valor padrão
    theme: '',
    schoolYear: '',
    numberOfQuestions: '1', // não aplicável para plano de aula
    difficultyLevel: '',
    questionModel: '', // não aplicável para plano de aula
    sources: '',
    objectives: '',
    materials: '',
    instructions: '',
    evaluation: '',
    timeLimit: '',
    context: '',
    textType: '',
    textGenre: '',
    textLength: '',
    associatedQuestions: '',
    competencies: '',
    readingStrategies: '',
    visualResources: '',
    practicalActivities: '',
    wordsIncluded: '',
    gridFormat: '',
    providedHints: '',
    vocabularyContext: '',
    language: '',
    associatedExercises: '',
    knowledgeArea: '',
    complexityLevel: ''
  };

  // Mapear campos customizados com prioridade
  const fieldMappings = {
    // Mapeamentos principais
    'Tema ou Tópico Central': 'theme',
    'Tema Central': 'theme',
    'Tema': 'theme',
    'tema': 'theme',
    
    'Componente Curricular': 'subject',
    'Disciplina': 'subject',
    'disciplina': 'subject',
    
    'Ano/Série Escolar': 'schoolYear',
    'Público-Alvo': 'schoolYear',
    'Ano de Escolaridade': 'schoolYear',
    'anoEscolaridade': 'schoolYear',
    
    'Objetivo Geral': 'objectives',
    'Objetivos de Aprendizagem': 'objectives',
    'Objetivo Principal': 'objectives',
    'Objetivos': 'objectives',
    'objetivos': 'objectives',
    
    'Materiais/Recursos': 'materials',
    'Recursos': 'materials',
    'Materiais Necessários': 'materials',
    'Materiais': 'materials',
    'materiais': 'materials',
    
    'Habilidades BNCC': 'competencies',
    'Competências': 'competencies',
    'competencias': 'competencies',
    
    'Carga Horária': 'timeLimit',
    'Tempo Estimado': 'timeLimit',
    'Tempo Limite': 'timeLimit',
    'tempoLimite': 'timeLimit',
    
    'Perfil da Turma': 'context',
    'Contexto': 'context',
    'contexto': 'context',
    
    'Tipo de Aula': 'difficultyLevel',
    'Metodologia': 'difficultyLevel',
    'tipoAula': 'difficultyLevel',
    
    'Observações do Professor': 'evaluation',
    'Observações': 'evaluation',
    'Avaliação': 'evaluation',
    'observacoes': 'evaluation',
    
    'Instruções': 'instructions',
    'instrucoes': 'instructions',
    
    'Fontes': 'sources',
    'Referencias': 'sources',
    'fontes': 'sources'
  };

  // Aplicar mapeamentos com log detalhado
  Object.entries(fieldMappings).forEach(([customFieldKey, formFieldKey]) => {
    const value = customFields[customFieldKey];
    if (value && value.trim() && formFieldKey in formData) {
      (formData as any)[formFieldKey] = value;
      console.log(`✅ Mapeado: ${customFieldKey} -> ${formFieldKey} = ${value}`);
    }
  });

  console.log('📝 Dados processados do Plano de Aula:', formData);
  return formData;
}

/**
 * Valida se uma atividade é um Plano de Aula válido
 */
export function isValidPlanoAulaActivity(activity: any): activity is PlanoAulaActivity {
  return activity &&
         activity.id === 'plano-aula' &&
         typeof activity.title === 'string' &&
         typeof activity.description === 'string' &&
         typeof activity.customFields === 'object';
}

/**
 * Extrai campos obrigatórios do Plano de Aula
 */
export function extractRequiredPlanoAulaFields(customFields: PlanoAulaCustomFields): PlanoAulaFields {
  return {
    tema: customFields['Tema ou Tópico Central'] || customFields['Tema'] || '',
    anoSerie: customFields['Ano/Série Escolar'] || customFields['Ano de Escolaridade'] || '',
    componenteCurricular: customFields['Componente Curricular'] || customFields['Disciplina'] || '',
    cargaHoraria: customFields['Carga Horária'] || customFields['Tempo Limite'] || '',
    habilidadesBNCC: customFields['Habilidades BNCC'] || customFields['Competências'] || '',
    objetivoGeral: customFields['Objetivo Geral'] || customFields['Objetivos'] || '',
    materiaisRecursos: customFields['Materiais/Recursos'] || customFields['Materiais'] || '',
    perfilTurma: customFields['Perfil da Turma'] || customFields['Contexto'] || '',
    tipoAula: customFields['Tipo de Aula'] || '',
    observacoesProfessor: customFields['Observações do Professor'] || customFields['Observações'] || ''
  };
}