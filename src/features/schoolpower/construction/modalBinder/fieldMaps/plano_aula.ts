
export const planoAulaFieldMap = {
  // Mapeamento dos campos do modal para a estrutura de dados
  disciplina: 'disciplina',
  turma: 'turma', 
  professor: 'professor',
  duracao: 'duracao',
  tema: 'tema',
  nivel: 'nivel',
  instituicao: 'instituicao',
  objetivos: 'objetivos',
  conteudo: 'conteudo',
  metodologia: 'metodologia',
  recursos: 'recursos',
  avaliacao: 'avaliacao',
  data: 'data'
};

export const planoAulaRequiredFields = [
  'disciplina',
  'turma', 
  'professor',
  'duracao',
  'tema',
  'nivel'
];

export const planoAulaValidationRules = {
  disciplina: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  turma: {
    required: true,
    minLength: 1,
    maxLength: 50
  },
  professor: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  duracao: {
    required: true,
    validOptions: ['30 minutos', '45 minutos', '50 minutos', '1 hora', '1h30min', '2 horas']
  },
  tema: {
    required: true,
    minLength: 5,
    maxLength: 200
  },
  nivel: {
    required: true,
    validOptions: [
      'Educação Infantil',
      'Ensino Fundamental I', 
      'Ensino Fundamental II',
      'Ensino Médio',
      'Ensino Superior',
      'Pós-graduação',
      'Educação de Jovens e Adultos'
    ]
  }
};

export const planoAulaDefaultValues = {
  duracao: '50 minutos',
  nivel: 'Ensino Fundamental II',
  data: new Date().toLocaleDateString('pt-BR')
};
