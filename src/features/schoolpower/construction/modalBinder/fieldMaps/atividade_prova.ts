
export default {
  // Campos básicos
  'titulo': 'input[name="title"], #activity-title, [data-field="title"]',
  'descricao': 'textarea[name="description"], #activity-description, [data-field="description"]',
  'disciplina': 'select[name="subject"], #activity-subject, [data-field="subject"]',
  'serie': 'select[name="grade"], #activity-grade, [data-field="grade"]',
  
  // Campos específicos de prova
  'objetivo_avaliacao': 'textarea[name="evaluation_objective"], #evaluation-objective, [data-field="evaluation_objective"]',
  'conteudo_abordado': 'textarea[name="content"], #test-content, [data-field="content"]',
  'tempo_prova': 'input[name="duration"], #test-duration, [data-field="duration"]',
  'valor_total': 'input[name="total_points"], #total-points, [data-field="total_points"]',
  
  // Questões
  'questoes_multipla_escolha': 'textarea[name="multiple_choice"], #multiple-choice-questions, [data-field="multiple_choice"]',
  'questoes_dissertativas': 'textarea[name="essay_questions"], #essay-questions, [data-field="essay_questions"]',
  'gabarito': 'textarea[name="answer_key"], #answer-key, [data-field="answer_key"]',
  
  // Critérios
  'criterios_correcao': 'textarea[name="correction_criteria"], #correction-criteria, [data-field="correction_criteria"]',
  'instrucoes_prova': 'textarea[name="test_instructions"], #test-instructions, [data-field="test_instructions"]'
};
