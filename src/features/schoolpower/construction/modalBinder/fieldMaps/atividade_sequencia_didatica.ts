
import { ActivityFieldMap } from './index';

export const activitySequenciaDidaticaFieldMap: ActivityFieldMap = {
  titulo: 'input[name="title"], #field-titulo, [data-field="title"]',
  descricao: 'textarea[name="description"], #field-descricao, [data-field="description"]',
  disciplina: 'select[name="subject"], #select-disciplina, [data-field="subject"]',
  dificuldade: 'select[name="difficulty"], #select-dificuldade, [data-field="difficulty"]',
  formatoEntrega: 'select[name="format"], #select-formato, [data-field="format"]',
  duracao: 'input[name="duration"], #input-duracao, [data-field="duration"]',
  objetivos: 'textarea[name="objectives"], #textarea-objetivos, [data-field="objectives"]',
  materiais: 'textarea[name="materials"], #textarea-materiais, [data-field="materials"]',
  etapas: 'textarea[name="steps"], #textarea-etapas, [data-field="steps"]',
  atividades: 'textarea[name="activities"], #textarea-atividades, [data-field="activities"]',
  metodologia: 'textarea[name="methodology"], #textarea-metodologia, [data-field="methodology"]',
  avaliacao: 'textarea[name="evaluation"], #textarea-avaliacao, [data-field="evaluation"]',
  observacoes: 'textarea[name="notes"], #textarea-observacoes, [data-field="notes"]'
};
