
import { ActivityFieldMap } from './index';

export const activityJogosEducativosFieldMap: ActivityFieldMap = {
  titulo: 'input[name="title"], #field-titulo, [data-field="title"]',
  descricao: 'textarea[name="description"], #field-descricao, [data-field="description"]',
  disciplina: 'select[name="subject"], #select-disciplina, [data-field="subject"]',
  dificuldade: 'select[name="difficulty"], #select-dificuldade, [data-field="difficulty"]',
  formatoEntrega: 'select[name="format"], #select-formato, [data-field="format"]',
  duracao: 'input[name="duration"], #input-duracao, [data-field="duration"]',
  objetivos: 'textarea[name="objectives"], #textarea-objetivos, [data-field="objectives"]',
  materiais: 'textarea[name="materials"], #textarea-materiais, [data-field="materials"]',
  regras: 'textarea[name="rules"], #textarea-regras, [data-field="rules"]',
  mecanicas: 'textarea[name="mechanics"], #textarea-mecanicas, [data-field="mechanics"]',
  recursos: 'textarea[name="resources"], #textarea-recursos, [data-field="resources"]',
  avaliacaoLudica: 'textarea[name="ludic_evaluation"], #textarea-avaliacao-ludica, [data-field="ludic_evaluation"]',
  observacoes: 'textarea[name="notes"], #textarea-observacoes, [data-field="notes"]'
};
