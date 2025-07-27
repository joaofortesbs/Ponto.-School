
import { ActivityFieldMap } from './index';

export const activityProvaFieldMap: ActivityFieldMap = {
  titulo: 'input[name="title"], #field-titulo, [data-field="title"]',
  descricao: 'textarea[name="description"], #field-descricao, [data-field="description"]',
  disciplina: 'select[name="subject"], #select-disciplina, [data-field="subject"]',
  dificuldade: 'select[name="difficulty"], #select-dificuldade, [data-field="difficulty"]',
  formatoEntrega: 'select[name="format"], #select-formato, [data-field="format"]',
  duracao: 'input[name="duration"], #input-duracao, [data-field="duration"]',
  objetivos: 'textarea[name="objectives"], #textarea-objetivos, [data-field="objectives"]',
  materiais: 'textarea[name="materials"], #textarea-materiais, [data-field="materials"]',
  instrucoes: 'textarea[name="instructions"], #textarea-instrucoes, [data-field="instructions"]',
  questoes: 'textarea[name="questions"], #editor-questoes, [data-field="questions"]',
  gabarito: 'textarea[name="answer_key"], #textarea-gabarito, [data-field="answer_key"]',
  criteriosAvaliacao: 'textarea[name="evaluation_criteria"], #textarea-criterios, [data-field="evaluation_criteria"]',
  pontuacao: 'input[name="score"], #input-pontuacao, [data-field="score"]',
  observacoes: 'textarea[name="notes"], #textarea-observacoes, [data-field="notes"]'
};
