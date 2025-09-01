
export const mapaMentalFieldMapping = {
  // Campos principais
  titulo: ['titulo', 'title', 'nome'],
  descricao: ['descricao', 'description', 'desc'],
  
  // Campos específicos do Mapa Mental
  temaCentral: [
    'temaCentral', 
    'tema_central', 
    'centralTheme', 
    'tema', 
    'assunto_principal',
    'topico_central'
  ],
  
  categoriasPrincipais: [
    'categoriasPrincipais',
    'categorias_principais', 
    'mainCategories',
    'categorias',
    'subdivisoes',
    'ramos_principais'
  ],
  
  objetivoGeral: [
    'objetivoGeral',
    'objetivo_geral',
    'generalObjective',
    'objetivo',
    'finalidade',
    'proposito'
  ],
  
  criteriosAvaliacao: [
    'criteriosAvaliacao',
    'criterios_avaliacao',
    'evaluationCriteria',
    'criterios',
    'avaliacao',
    'parametros_avaliacao'
  ]
};

/**
 * Extrai valor de campo baseado no mapeamento
 */
export function extractFieldValue(data: any, fieldKey: keyof typeof mapaMentalFieldMapping): any {
  const possibleKeys = mapaMentalFieldMapping[fieldKey];
  
  for (const key of possibleKeys) {
    if (data[key] !== undefined && data[key] !== null) {
      return data[key];
    }
  }
  
  return undefined;
}
