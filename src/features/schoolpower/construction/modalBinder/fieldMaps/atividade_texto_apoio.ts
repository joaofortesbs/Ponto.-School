
import { ActivityFieldMap } from './index';

export const activityTextoApoioFieldMap: ActivityFieldMap = {
  titulo: 'input[name="title"], #field-titulo, [data-field="title"]',
  descricao: 'textarea[name="description"], #field-descricao, [data-field="description"]',
  disciplina: 'select[name="subject"], #select-disciplina, [data-field="subject"]',
  dificuldade: 'select[name="difficulty"], #select-dificuldade, [data-field="difficulty"]',
  formatoEntrega: 'select[name="format"], #select-formato, [data-field="format"]',
  duracao: 'input[name="duration"], #input-duracao, [data-field="duration"]',
  objetivos: 'textarea[name="objectives"], #textarea-objetivos, [data-field="objectives"]',
  materiais: 'textarea[name="materials"], #textarea-materiais, [data-field="materials"]',
  conteudo: 'textarea[name="content"], #editor-conteudo, [data-field="content"]',
  introducao: 'textarea[name="introduction"], #textarea-introducao, [data-field="introduction"]',
  desenvolvimento: 'textarea[name="development"], #textarea-desenvolvimento, [data-field="development"]',
  conclusao: 'textarea[name="conclusion"], #textarea-conclusao, [data-field="conclusion"]',
  referencias: 'textarea[name="references"], #textarea-referencias, [data-field="references"]',
  observacoes: 'textarea[name="notes"], #textarea-observacoes, [data-field="notes"]'
};
