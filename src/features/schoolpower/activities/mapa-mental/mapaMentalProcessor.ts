
import { transformMapaMentalData, MapaMentalFields } from './fieldMapping';

export interface MapaMentalActivity {
  id: string;
  title: string;
  description: string;
  customFields?: Record<string, string>;
}

export interface MapaMentalFormData {
  title: string;
  description: string;
  centralTheme: string;
  mainCategories: string;
  generalObjective: string;
  evaluationCriteria: string;
  subject: string;
  schoolYear: string;
  duration: string;
  difficulty: string;
}

export class MapaMentalProcessor {
  /**
   * Processa dados de uma atividade de Mapa Mental para uso no formulário
   */
  static processData(activity: MapaMentalActivity): MapaMentalFormData {
    console.log('🗂️ Processando dados do Mapa Mental:', activity);
    
    const customFields = activity.customFields || {};
    const mapaMentalData = transformMapaMentalData(customFields);
    
    const formData: MapaMentalFormData = {
      title: activity.title || mapaMentalData.titulo || '',
      description: activity.description || mapaMentalData.descricao || '',
      centralTheme: mapaMentalData.temaCentral,
      mainCategories: mapaMentalData.categoriasPrincipais,
      generalObjective: mapaMentalData.objetivoGeral,
      evaluationCriteria: mapaMentalData.criteriosAvaliacao,
      subject: customFields['Disciplina'] || customFields['Subject'] || 'Geral',
      schoolYear: customFields['Ano/Série'] || customFields['School Year'] || '',
      duration: customFields['Duração'] || customFields['Duration'] || '50 min',
      difficulty: customFields['Dificuldade'] || customFields['Difficulty'] || 'Médio'
    };

    console.log('📝 Dados processados do Mapa Mental:', formData);
    return formData;
  }

  /**
   * Valida se uma atividade é um Mapa Mental válido
   */
  static isValidMapaMentalActivity(activity: any): activity is MapaMentalActivity {
    return activity &&
           activity.id === 'mapa-mental' &&
           typeof activity.title === 'string' &&
           typeof activity.description === 'string';
  }
}

/**
 * Função helper para processar dados de Mapa Mental
 */
export function processMapaMentalData(activityData: any): MapaMentalFormData {
  if (!MapaMentalProcessor.isValidMapaMentalActivity(activityData)) {
    console.warn('⚠️ Dados inválidos para Mapa Mental:', activityData);
    throw new Error('Dados inválidos para atividade de Mapa Mental');
  }

  return MapaMentalProcessor.processData(activityData);
}
