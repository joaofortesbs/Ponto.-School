
export default {
  // Campos básicos
  'titulo': 'input[name="title"], #activity-title, [data-field="title"]',
  'descricao': 'textarea[name="description"], #activity-description, [data-field="description"]',
  'disciplina': 'select[name="subject"], #activity-subject, [data-field="subject"]',
  'serie': 'select[name="grade"], #activity-grade, [data-field="grade"]',
  
  // Campos específicos de lista de exercícios
  'objetivo_aprendizado': 'textarea[name="objective"], #learning-objective, [data-field="objective"]',
  'conteudo_programatico': 'textarea[name="content"], #programmatic-content, [data-field="content"]',
  'nivel_dificuldade': 'select[name="difficulty"], #difficulty-level, [data-field="difficulty"]',
  'tempo_estimado': 'input[name="duration"], #estimated-time, [data-field="duration"]',
  
  // Exercícios
  'exercicios': 'textarea[name="exercises"], #exercises-content, [data-field="exercises"]',
  'gabarito': 'textarea[name="answer_key"], #answer-key, [data-field="answer_key"]',
  'criterios_avaliacao': 'textarea[name="evaluation_criteria"], #evaluation-criteria, [data-field="evaluation_criteria"]',
  
  // Observações
  'observacoes_professor': 'textarea[name="teacher_notes"], #teacher-notes, [data-field="teacher_notes"]'
};
