
import { ActivityFormData } from '../../construction/types/ActivityTypes';

export interface TeseRedacaoCustomFields {
  [key: string]: string;
}

export interface TeseRedacaoActivity {
  id: string;
  title: string;
  description: string;
  customFields: TeseRedacaoCustomFields;
  personalizedTitle?: string;
  personalizedDescription?: string;
}

/**
 * Processa dados de uma atividade de Tese da Redação do Action Plan
 * para o formato do formulário do modal
 */
export function processTeseRedacaoData(activity: TeseRedacaoActivity): ActivityFormData {
  console.log('📝 [PROCESSOR] Processando dados da Tese da Redação:', activity);
  console.log('📝 [PROCESSOR] Activity ID:', activity.id);
  console.log('📝 [PROCESSOR] Custom Fields recebidos:', activity.customFields);

  const customFields = activity.customFields || {};
  
  // Tentar múltiplas fontes para cada campo com logs detalhados
  const temaRedacao = customFields['Tema da Redação'] || 
                      customFields['temaRedacao'] || 
                      customFields['tema'] ||
                      activity.personalizedTitle ||
                      activity.title || '';
  
  console.log('🔍 [PROCESSOR] Tema da Redação extraído:', temaRedacao);
  
  const objetivo = customFields['Objetivos'] || 
                   customFields['objetivo'] || 
                   customFields['Objetivo'] ||
                   activity.personalizedDescription ||
                   activity.description || '';
  
  console.log('🔍 [PROCESSOR] Objetivos extraídos:', objetivo);
  
  const nivelDificuldade = customFields['Nível de Dificuldade'] || 
                           customFields['nivelDificuldade'] || 
                           customFields['dificuldade'] ||
                           'Médio';
  
  console.log('🔍 [PROCESSOR] Nível de Dificuldade extraído:', nivelDificuldade);
  
  const competenciasENEM = customFields['Competências ENEM'] || 
                           customFields['competenciasENEM'] || 
                           customFields['competencias'] ||
                           '';
  
  console.log('🔍 [PROCESSOR] Competências ENEM extraídas:', competenciasENEM);
  
  const contextoAdicional = customFields['Contexto Adicional'] || 
                            customFields['contextoAdicional'] || 
                            customFields['contexto'] ||
                            '';
  
  console.log('🔍 [PROCESSOR] Contexto Adicional extraído:', contextoAdicional);

  const formData: ActivityFormData = {
    title: activity.personalizedTitle || activity.title || '',
    description: activity.personalizedDescription || activity.description || '',
    
    // Campos específicos de Tese da Redação (NOMES EXATOS)
    temaRedacao: temaRedacao,
    objetivo: objetivo,
    nivelDificuldade: nivelDificuldade,
    competenciasENEM: competenciasENEM,
    contextoAdicional: contextoAdicional,

    // Campos padrão necessários
    subject: 'Língua Portuguesa',
    theme: temaRedacao,
    schoolYear: '3º Ano - Ensino Médio',
    numberOfQuestions: '1',
    difficultyLevel: nivelDificuldade,
    questionModel: 'Dissertativa',
    sources: '',
    objectives: objetivo,
    materials: '',
    instructions: '',
    evaluation: ''
  };

  console.log('✅ [PROCESSOR] Dados da Tese da Redação processados com sucesso');
  console.log('📋 [PROCESSOR] Form Data final:', formData);
  console.log('🔧 [PROCESSOR] Campos validados:', {
    temaRedacao: !!temaRedacao,
    objetivo: !!objetivo,
    nivelDificuldade: !!nivelDificuldade,
    competenciasENEM: !!competenciasENEM,
    contextoAdicional: !!contextoAdicional
  });
  
  return formData;
}

/**
 * Prepara dados de Tese da Redação para exibição no modal
 */
export function prepareTeseRedacaoDataForModal(activity: any): ActivityFormData {
  console.log('🔄 Preparando dados da Tese da Redação para modal:', activity);

  const customFields = activity?.customFields || {};
  
  return processTeseRedacaoData({
    id: activity?.id || 'tese-redacao',
    title: activity?.title || activity?.personalizedTitle || '',
    description: activity?.description || activity?.personalizedDescription || '',
    customFields: customFields,
    personalizedTitle: activity?.personalizedTitle,
    personalizedDescription: activity?.personalizedDescription
  });
}
