
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

// Mapeamento de campos do Action Plan para formulário do modal
export const planoAulaFieldMapping = {
  'Tema ou Tópico Central': 'theme',
  'Ano/Série Escolar': 'schoolYear', 
  'Componente Curricular': 'subject',
  'Carga Horária': 'timeLimit',
  'Habilidades BNCC': 'competencies',
  'Objetivo Geral': 'objectives',
  'Materiais/Recursos': 'materials',
  'Perfil da Turma': 'context',
  'Tipo de Aula': 'difficultyLevel',
  'Observações do Professor': 'evaluation'
};

export const planoAulaFieldMapping = {
  // Campos de entrada que vêm da IA ou dados existentes
  inputFields: {
    'Tema ou Tópico Central': 'tema',
    'Tema Central': 'tema',
    'Tema': 'tema',
    'Ano/Série Escolar': 'anoSerie',
    'Público-Alvo': 'anoSerie',
    'Ano de Escolaridade': 'anoSerie',
    'Componente Curricular': 'componenteCurricular',
    'Disciplina': 'componenteCurricular',
    'Carga Horária': 'cargaHoraria',
    'Tempo Estimado': 'cargaHoraria',
    'Habilidades BNCC': 'habilidadesBNCC',
    'Objetivo Geral': 'objetivoGeral',
    'Objetivos de Aprendizagem': 'objetivoGeral',
    'Objetivo Principal': 'objetivoGeral',
    'Materiais/Recursos': 'materiaisRecursos',
    'Recursos': 'materiaisRecursos',
    'Materiais Necessários': 'materiaisRecursos',
    'Perfil da Turma': 'perfilTurma',
    'Tipo de Aula': 'tipoAula',
    'Metodologia': 'tipoAula',
    'Observações do Professor': 'observacoesProfessor',
    'Observações': 'observacoesProfessor',
    'Avaliação': 'observacoesProfessor'
  },
  
  // Campos de saída que serão exibidos no mini-card
  displayFields: {
    tema: 'Tema ou Tópico Central',
    anoSerie: 'Ano/Série Escolar',
    componenteCurricular: 'Componente Curricular',
    cargaHoraria: 'Carga Horária',
    habilidadesBNCC: 'Habilidades BNCC',
    objetivoGeral: 'Objetivo Geral',
    materiaisRecursos: 'Materiais/Recursos',
    perfilTurma: 'Perfil da Turma',
    tipoAula: 'Tipo de Aula',
    observacoesProfessor: 'Observações do Professor'
  },

  // Valores padrão quando não informados
  defaultValues: {
    cargaHoraria: '1 aula de 50 minutos',
    habilidadesBNCC: 'A definir conforme BNCC',
    perfilTurma: 'Turma padrão do ano/série',
    tipoAula: 'Aula expositiva dialogada',
    observacoesProfessor: 'Considerar o ritmo individual dos alunos'
  }
};

export function transformPlanoAulaData(customFields: Record<string, string>): PlanoAulaFields {
  const mapping = planoAulaFieldMapping;
  
  return {
    tema: customFields['Tema ou Tópico Central'] || customFields['Tema Central'] || customFields['Tema'] || '',
    anoSerie: customFields['Ano/Série Escolar'] || customFields['Público-Alvo'] || customFields['Ano de Escolaridade'] || '',
    componenteCurricular: customFields['Componente Curricular'] || customFields['Disciplina'] || '',
    cargaHoraria: customFields['Carga Horária'] || customFields['Tempo Estimado'] || mapping.defaultValues.cargaHoraria,
    habilidadesBNCC: customFields['Habilidades BNCC'] || mapping.defaultValues.habilidadesBNCC,
    objetivoGeral: customFields['Objetivo Geral'] || customFields['Objetivos de Aprendizagem'] || customFields['Objetivo Principal'] || '',
    materiaisRecursos: customFields['Materiais/Recursos'] || customFields['Recursos'] || customFields['Materiais Necessários'] || '',
    perfilTurma: customFields['Perfil da Turma'] || mapping.defaultValues.perfilTurma,
    tipoAula: customFields['Tipo de Aula'] || customFields['Metodologia'] || mapping.defaultValues.tipoAula,
    observacoesProfessor: customFields['Observações do Professor'] || customFields['Observações'] || customFields['Avaliação'] || mapping.defaultValues.observacoesProfessor
  };
}
