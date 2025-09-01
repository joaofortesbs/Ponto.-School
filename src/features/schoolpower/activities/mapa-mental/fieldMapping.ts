
export interface MapaMentalFields {
  titulo: string;
  descricao: string;
  temaCentral: string;
  categoriasPrincipais: string;
  objetivoGeral: string;
  criteriosAvaliacao: string;
}

// Mapeamento de campos específicos para Mapa Mental
export const mapaMentalFieldMapping = {
  // Campos de entrada que vêm da IA ou dados existentes
  inputFields: {
    'Título': 'titulo',
    'Descrição': 'descricao',
    'Tema Central': 'temaCentral',
    'Categorias Principais': 'categoriasPrincipais',
    'Categoria Principal': 'categoriasPrincipais',
    'Objetivo Geral': 'objetivoGeral',
    'Objetivos': 'objetivoGeral',
    'Critérios de Avaliação': 'criteriosAvaliacao',
    'Critérios': 'criteriosAvaliacao',
    'Avaliação': 'criteriosAvaliacao'
  },
  
  // Campos de saída que serão exibidos no mini-card
  displayFields: {
    titulo: 'Título',
    descricao: 'Descrição',
    temaCentral: 'Tema Central',
    categoriasPrincipais: 'Categorias Principais',
    objetivoGeral: 'Objetivo Geral',
    criteriosAvaliacao: 'Critérios de Avaliação'
  },

  // Valores padrão quando não informados
  defaultValues: {
    temaCentral: 'Tema a ser definido',
    categoriasPrincipais: 'Categorias a serem definidas',
    objetivoGeral: 'Organizar e visualizar conhecimentos',
    criteriosAvaliacao: 'Clareza, organização e completude'
  }
};

export function transformMapaMentalData(customFields: Record<string, string>): MapaMentalFields {
  const mapping = mapaMentalFieldMapping;
  
  return {
    titulo: customFields['Título'] || customFields['Title'] || '',
    descricao: customFields['Descrição'] || customFields['Description'] || '',
    temaCentral: customFields['Tema Central'] || customFields['Central Theme'] || mapping.defaultValues.temaCentral,
    categoriasPrincipais: customFields['Categorias Principais'] || customFields['Categoria Principal'] || customFields['Main Categories'] || mapping.defaultValues.categoriasPrincipais,
    objetivoGeral: customFields['Objetivo Geral'] || customFields['Objetivos'] || customFields['General Objective'] || mapping.defaultValues.objetivoGeral,
    criteriosAvaliacao: customFields['Critérios de Avaliação'] || customFields['Critérios'] || customFields['Avaliação'] || customFields['Evaluation Criteria'] || mapping.defaultValues.criteriosAvaliacao
  };
}
