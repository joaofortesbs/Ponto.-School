
import { MapaMentalPreview } from './MapaMentalPreview';

interface MapaMentalData {
  titulo?: string;
  descricao?: string;
  temaCentral?: string;
  categoriasPrincipais?: string[];
  objetivoGeral?: string;
  criteriosAvaliacao?: string[];
  [key: string]: any;
}

export const mapaMentalProcessor = {
  /**
   * Processa dados brutos da IA para o formato do Mapa Mental
   */
  processAIData: (rawData: any): MapaMentalData => {
    console.log('🗺️ Processando dados do Mapa Mental:', rawData);

    const processedData: MapaMentalData = {
      titulo: rawData.titulo || rawData.title || 'Mapa Mental',
      descricao: rawData.descricao || rawData.description || '',
      temaCentral: rawData.temaCentral || rawData.tema_central || rawData.centralTheme || '',
      categoriasPrincipais: processCategorias(rawData.categoriasPrincipais || rawData.categorias_principais || rawData.mainCategories || []),
      objetivoGeral: rawData.objetivoGeral || rawData.objetivo_geral || rawData.generalObjective || '',
      criteriosAvaliacao: processCriterios(rawData.criteriosAvaliacao || rawData.criterios_avaliacao || rawData.evaluationCriteria || [])
    };

    console.log('✅ Dados do Mapa Mental processados:', processedData);
    return processedData;
  },

  /**
   * Extrai campos customizados para o mini-card
   */
  extractCustomFields: (data: MapaMentalData) => {
    return {
      temaCentral: data.temaCentral,
      categoriasPrincipais: Array.isArray(data.categoriasPrincipais) 
        ? data.categoriasPrincipais.join(', ') 
        : data.categoriasPrincipais,
      objetivoGeral: data.objetivoGeral,
      criteriosAvaliacao: Array.isArray(data.criteriosAvaliacao)
        ? data.criteriosAvaliacao.join('; ')
        : data.criteriosAvaliacao
    };
  },

  /**
   * Componente de preview
   */
  PreviewComponent: MapaMentalPreview
};

/**
 * Processa categorias principais
 */
function processCategorias(categorias: any): string[] {
  if (!categorias) return [];
  
  if (typeof categorias === 'string') {
    return categorias.split(',').map(cat => cat.trim()).filter(cat => cat.length > 0);
  }
  
  if (Array.isArray(categorias)) {
    return categorias.map(cat => String(cat).trim()).filter(cat => cat.length > 0);
  }
  
  return [];
}

/**
 * Processa critérios de avaliação
 */
function processCriterios(criterios: any): string[] {
  if (!criterios) return [];
  
  if (typeof criterios === 'string') {
    return criterios.split(';').map(crit => crit.trim()).filter(crit => crit.length > 0);
  }
  
  if (Array.isArray(criterios)) {
    return criterios.map(crit => String(crit).trim()).filter(crit => crit.length > 0);
  }
  
  return [];
}
