
export interface PlanoAulaFields {
  tema: string;
  anoSerie: string;
  componenteCurricular: string;
  cargaHoraria: string;
  habilidadesBNCC: string;
  objetivoGeral: string;
  materiaisRecursos: string;
  perfilTurma: string;
  tipoAula: string;
  observacoesProfessor: string;
  // Novos campos para o mini-card
  objetivoPrincipal: string;
  materiaisNecessarios: string;
  recursosAdicionais: string;
  tempoEstimado: string;
  nivelDificuldade: string;
  palavrasChave: string;
}

export const planoAulaFieldMapping = {
  // Campos de entrada que vêm da IA ou dados existentes
  inputFields: {
    'Tema': 'tema',
    'Público-Alvo': 'anoSerie',
    'Disciplina': 'componenteCurricular',
    'Objetivos': 'objetivoGeral',
    'Metodologia': 'tipoAula',
    'Recursos': 'materiaisRecursos',
    'Avaliação': 'observacoesProfessor',
    'Objetivo Principal': 'objetivoPrincipal',
    'Materiais Necessários': 'materiaisNecessarios',
    'Recursos Adicionais': 'recursosAdicionais',
    'Tempo Estimado': 'tempoEstimado',
    'Nível de Dificuldade': 'nivelDificuldade',
    'Palavras-chave': 'palavrasChave'
  },
  
  // Campos de saída que serão exibidos no mini-card
  displayFields: {
    tema: 'Tema',
    anoSerie: 'Ano/Série',
    componenteCurricular: 'Disciplina',
    cargaHoraria: 'Carga Horária',
    habilidadesBNCC: 'Habilidades BNCC',
    objetivoGeral: 'Objetivo Geral',
    materiaisRecursos: 'Materiais/Recursos',
    perfilTurma: 'Perfil da Turma',
    tipoAula: 'Tipo de Aula',
    observacoesProfessor: 'Observações',
    objetivoPrincipal: 'Objetivo Principal',
    materiaisNecessarios: 'Materiais Necessários',
    recursosAdicionais: 'Recursos Adicionais',
    tempoEstimado: 'Tempo Estimado',
    nivelDificuldade: 'Nível de Dificuldade',
    palavrasChave: 'Palavras-chave'
  },

  // Valores padrão quando não informados
  defaultValues: {
    cargaHoraria: '1 aula de 50 minutos',
    habilidadesBNCC: 'A definir conforme BNCC',
    perfilTurma: 'Turma padrão',
    tipoAula: 'Aula expositiva dialogada',
    tempoEstimado: '50 min',
    nivelDificuldade: 'Médio'
  }
};

export function transformPlanoAulaData(customFields: Record<string, string>): PlanoAulaFields {
  const mapping = planoAulaFieldMapping;
  
  return {
    tema: customFields['Tema'] || customFields['tema'] || '',
    anoSerie: customFields['Público-Alvo'] || customFields['anoSerie'] || '',
    componenteCurricular: customFields['Disciplina'] || customFields['componenteCurricular'] || '',
    cargaHoraria: customFields['Carga Horária'] || customFields['cargaHoraria'] || mapping.defaultValues.cargaHoraria,
    habilidadesBNCC: customFields['Habilidades BNCC'] || customFields['habilidadesBNCC'] || mapping.defaultValues.habilidadesBNCC,
    objetivoGeral: customFields['Objetivos'] || customFields['objetivoGeral'] || '',
    materiaisRecursos: customFields['Recursos'] || customFields['materiaisRecursos'] || '',
    perfilTurma: customFields['Perfil da Turma'] || customFields['perfilTurma'] || mapping.defaultValues.perfilTurma,
    tipoAula: customFields['Metodologia'] || customFields['tipoAula'] || mapping.defaultValues.tipoAula,
    observacoesProfessor: customFields['Avaliação'] || customFields['observacoesProfessor'] || '',
    // Novos campos para o mini-card
    objetivoPrincipal: customFields['Objetivo Principal'] || customFields['objetivoPrincipal'] || customFields['Objetivos'] || '',
    materiaisNecessarios: customFields['Materiais Necessários'] || customFields['materiaisNecessarios'] || customFields['Recursos'] || '',
    recursosAdicionais: customFields['Recursos Adicionais'] || customFields['recursosAdicionais'] || '',
    tempoEstimado: customFields['Tempo Estimado'] || customFields['tempoEstimado'] || mapping.defaultValues.tempoEstimado,
    nivelDificuldade: customFields['Nível de Dificuldade'] || customFields['nivelDificuldade'] || mapping.defaultValues.nivelDificuldade,
    palavrasChave: customFields['Palavras-chave'] || customFields['palavrasChave'] || ''
  };
}
