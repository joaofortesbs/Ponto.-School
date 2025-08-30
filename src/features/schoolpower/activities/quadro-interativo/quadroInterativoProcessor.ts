
import { quadroInterativoFieldMapping } from './fieldMapping';

export interface QuadroInterativoProcessedData {
  subject: string;
  schoolYear: string;
  theme: string;
  objectives: string;
  difficultyLevel: string;
  quadroInterativoCampoEspecifico?: string;
  customFields?: Record<string, any>;
}

/**
 * Prepara os dados do Quadro Interativo para o Preview processar
 */
export function prepareQuadroInterativoData(activityData: any): QuadroInterativoProcessedData {
  console.log('🔄 Preparando dados para Quadro Interativo:', activityData);

  // Extrair dados dos customFields se disponível
  const customFields = activityData.customFields || {};
  
  // Mapear campos usando o fieldMapping
  const mappedData: QuadroInterativoProcessedData = {
    subject: customFields['Disciplina / Área de conhecimento'] || customFields['subject'] || activityData.subject || '',
    schoolYear: customFields['Ano / Série'] || customFields['schoolYear'] || activityData.schoolYear || '',
    theme: customFields['Tema ou Assunto da aula'] || customFields['theme'] || activityData.theme || '',
    objectives: customFields['Objetivo de aprendizagem da aula'] || customFields['objectives'] || activityData.objectives || '',
    difficultyLevel: customFields['Nível de Dificuldade'] || customFields['difficultyLevel'] || activityData.difficultyLevel || '',
    quadroInterativoCampoEspecifico: customFields['Atividade mostrada'] || customFields['quadroInterativoCampoEspecifico'] || activityData.quadroInterativoCampoEspecifico || '',
    customFields: customFields
  };

  console.log('✅ Dados preparados para Quadro Interativo:', mappedData);
  return mappedData;
}

/**
 * Processa os dados do Quadro Interativo (alias para compatibilidade)
 */
export function processQuadroInterativoData(activityData: any): QuadroInterativoProcessedData {
  return prepareQuadroInterativoData(activityData);
}

/**
 * Valida se os dados do Quadro Interativo estão completos
 */
export function validateQuadroInterativoData(data: QuadroInterativoProcessedData): boolean {
  const requiredFields = ['subject', 'schoolYear', 'theme', 'objectives'];
  
  for (const field of requiredFields) {
    if (!data[field as keyof QuadroInterativoProcessedData]) {
      console.warn(`❌ Campo obrigatório ausente: ${field}`);
      return false;
    }
  }
  
  console.log('✅ Dados do Quadro Interativo validados com sucesso');
  return true;
}

export default { 
  prepareQuadroInterativoData, 
  processQuadroInterativoData,
  validateQuadroInterativoData 
};
