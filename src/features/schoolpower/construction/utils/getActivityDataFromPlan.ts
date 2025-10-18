
import { ActionPlanItem } from '../../actionplan/ActionPlanCard';
import { ActivityFormData } from '../types/ActivityTypes';

export const getActivityDataFromPlan = (activity: ActionPlanItem): ActivityFormData | null => {
  console.log('📊 Extraindo dados da atividade do plano:', activity);

  try {
    // Dados básicos da atividade
    const baseData: ActivityFormData = {
      title: activity.title || '',
      description: activity.description || '',
      subject: 'Português', // Valor padrão
      theme: '',
      schoolYear: '8º ano', // Valor padrão
      numberOfQuestions: '10',
      difficultyLevel: 'Médio',
      questionModel: 'Múltipla Escolha',
      sources: '',
      objectives: '',
      materials: '',
      instructions: '',
      evaluation: ''
    };

    // Mapeamento específico por tipo de atividade
    if (activity.id === 'lista-exercicios') {
      return {
        ...baseData,
        theme: extrairTemaDoTitulo(activity.title),
        objectives: `Desenvolver competências em ${extrairTemaDoTitulo(activity.title)}`,
        instructions: `Complete os exercícios sobre ${extrairTemaDoTitulo(activity.title)} conforme orientado`,
        evaluation: 'Avaliação baseada na correção dos exercícios e participação',
        sources: 'Material didático da disciplina e recursos complementares'
      };
    }

    if (activity.id === 'prova') {
      return {
        ...baseData,
        numberOfQuestions: '15',
        difficultyLevel: 'Intermediário',
        questionModel: 'Mista',
        theme: extrairTemaDoTitulo(activity.title),
        objectives: `Avaliar conhecimentos em ${extrairTemaDoTitulo(activity.title)}`,
        instructions: 'Leia atentamente cada questão antes de responder',
        evaluation: 'Avaliação somativa com pontuação distribuída igualmente entre as questões'
      };
    }

    if (activity.id === 'atividade-pratica') {
      return {
        ...baseData,
        theme: extrairTemaDoTitulo(activity.title),
        objectives: `Aplicar conceitos de ${extrairTemaDoTitulo(activity.title)} na prática`,
        materials: 'Materiais diversos conforme especificado na atividade',
        instructions: 'Siga as instruções passo a passo para realizar a atividade prática',
        evaluation: 'Avaliação baseada na execução e apresentação dos resultados'
      };
    }

    // Mapeamento específico para Tese da Redação
    if (activity.id === 'tese-redacao') {
      console.log('🎯 Mapeando dados da Tese da Redação do Plano:', activity.customFields);
      
      return {
        ...baseData,
        temaRedacao: activity.customFields?.['Tema da Redação'] || activity.customFields?.['temaRedacao'] || '',
        nivelDificuldade: activity.customFields?.['Nível de Dificuldade'] || activity.customFields?.['nivelDificuldade'] || 'Médio',
        objetivo: activity.customFields?.['Objetivo'] || activity.customFields?.['objetivo'] || '',
        competenciasENEM: activity.customFields?.['Competências ENEM'] || activity.customFields?.['competenciasENEM'] || '',
        contextoAdicional: activity.customFields?.['Contexto Adicional'] || activity.customFields?.['contextoAdicional'] || ''
      };
    }

    // Para outras atividades, usar dados genéricos
    return {
      ...baseData,
      theme: extrairTemaDoTitulo(activity.title),
      objectives: `Desenvolver competências relacionadas a ${activity.title}`,
      instructions: 'Siga as orientações fornecidas para completar a atividade',
      evaluation: 'Avaliação baseada na participação e qualidade das respostas'
    };

  } catch (error) {
    console.error('❌ Erro ao extrair dados da atividade:', error);
    return null;
  }
};

// Função auxiliar para extrair tema do título
const extrairTemaDoTitulo = (titulo: string): string => {
  // Remove prefixos comuns e extrai o tema principal
  const temaLimpo = titulo
    .replace(/^(Lista de Exercícios|Prova|Atividade):?\s*/i, '')
    .replace(/^(de|sobre|em)\s+/i, '')
    .trim();
  
  return temaLimpo || 'Conteúdo da disciplina';
};
