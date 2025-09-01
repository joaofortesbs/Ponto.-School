
import { ActivityFieldMap } from './index';

export const activityMapaMentalFieldMap: ActivityFieldMap = {
  titulo: 'input[name="title"], #field-titulo, [data-field="title"]',
  descricao: 'textarea[name="description"], #field-descricao, [data-field="description"]',
  disciplina: 'select[name="subject"], #select-disciplina, [data-field="subject"]',
  dificuldade: 'select[name="difficulty"], #select-dificuldade, [data-field="difficulty"]',
  formatoEntrega: 'select[name="format"], #select-formato, [data-field="format"]',
  duracao: 'input[name="duration"], #input-duracao, [data-field="duration"]',
  objetivos: 'textarea[name="objectives"], #objetivo-geral, [data-field="objectives"]',
  materiais: 'textarea[name="materials"], #textarea-materiais, [data-field="materials"]',
  temaCentral: 'input[name="central_theme"], #tema-central, [data-field="central_theme"]',
  categoriasPrincipais: 'textarea[name="branches"], #categorias-principais, [data-field="branches"]',
  objetivoGeral: 'textarea[name="objectives"], #objetivo-geral, [data-field="objectives"]',
  criteriosAvaliacao: 'textarea[name="evaluation_criteria"], #criterios-avaliacao, [data-field="evaluation_criteria"]',
  ramificacoes: 'textarea[name="branches"], #textarea-ramificacoes, [data-field="branches"]',
  conceitos: 'textarea[name="concepts"], #textarea-conceitos, [data-field="concepts"]',
  conexoes: 'textarea[name="connections"], #textarea-conexoes, [data-field="connections"]',
  observacoes: 'textarea[name="notes"], #textarea-observacoes, [data-field="notes"]'
};
