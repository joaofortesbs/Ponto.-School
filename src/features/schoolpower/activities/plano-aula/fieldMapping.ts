
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
    'Avaliação': 'observacoesProfessor'
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
    observacoesProfessor: 'Observações'
  },

  // Valores padrão quando não informados
  defaultValues: {
    cargaHoraria: '1 aula de 50 minutos',
    habilidadesBNCC: 'A definir conforme BNCC',
    perfilTurma: 'Turma padrão',
    tipoAula: 'Aula expositiva dialogada'
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
    observacoesProfessor: customFields['Avaliação'] || customFields['observacoesProfessor'] || ''
  };
}
