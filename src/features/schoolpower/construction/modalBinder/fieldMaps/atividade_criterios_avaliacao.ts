
import { ActivityFieldMap } from './index';

export const activityCriteriosAvaliacaoFieldMap: ActivityFieldMap = {
  titulo: 'input[name="title"], #field-titulo, [data-field="title"]',
  descricao: 'textarea[name="description"], #field-descricao, [data-field="description"]',
  disciplina: 'select[name="subject"], #select-disciplina, [data-field="subject"]',
  dificuldade: 'select[name="difficulty"], #select-dificuldade, [data-field="difficulty"]',
  formatoEntrega: 'select[name="format"], #select-formato, [data-field="format"]',
  duracao: 'input[name="duration"], #input-duracao, [data-field="duration"]',
  objetivos: 'textarea[name="objectives"], #textarea-objetivos, [data-field="objectives"]',
  materiais: 'textarea[name="materials"], #textarea-materiais, [data-field="materials"]',
  criterios: 'textarea[name="criteria"], #textarea-criterios, [data-field="criteria"]',
  competencias: 'textarea[name="competencies"], #textarea-competencias, [data-field="competencies"]',
  habilidades: 'textarea[name="skills"], #textarea-habilidades, [data-field="skills"]',
  indicadores: 'textarea[name="indicators"], #textarea-indicadores, [data-field="indicators"]',
  rubricas: 'textarea[name="rubrics"], #textarea-rubricas, [data-field="rubrics"]',
  observacoes: 'textarea[name="notes"], #textarea-observacoes, [data-field="notes"]'
};
