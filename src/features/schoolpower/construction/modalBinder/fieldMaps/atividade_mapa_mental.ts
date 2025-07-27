
import { ActivityFieldMap } from './index';

export const activityMapaMentalFieldMap: ActivityFieldMap = {
  titulo: 'input[name="title"], #field-titulo, [data-field="title"]',
  descricao: 'textarea[name="description"], #field-descricao, [data-field="description"]',
  disciplina: 'select[name="subject"], #select-disciplina, [data-field="subject"]',
  dificuldade: 'select[name="difficulty"], #select-dificuldade, [data-field="difficulty"]',
  formatoEntrega: 'select[name="format"], #select-formato, [data-field="format"]',
  duracao: 'input[name="duration"], #input-duracao, [data-field="duration"]',
  objetivos: 'textarea[name="objectives"], #textarea-objetivos, [data-field="objectives"]',
  materiais: 'textarea[name="materials"], #textarea-materiais, [data-field="materials"]',
  temaCentral: 'input[name="central_theme"], #input-tema-central, [data-field="central_theme"]',
  ramificacoes: 'textarea[name="branches"], #textarea-ramificacoes, [data-field="branches"]',
  conceitos: 'textarea[name="concepts"], #textarea-conceitos, [data-field="concepts"]',
  conexoes: 'textarea[name="connections"], #textarea-conexoes, [data-field="connections"]',
  observacoes: 'textarea[name="notes"], #textarea-observacoes, [data-field="notes"]'
};
