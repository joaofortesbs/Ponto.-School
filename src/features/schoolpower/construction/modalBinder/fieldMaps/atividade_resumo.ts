
import { ActivityFieldMap } from './index';

export const activityResumoFieldMap: ActivityFieldMap = {
  titulo: 'input[name="title"], #field-titulo, [data-field="title"]',
  descricao: 'textarea[name="description"], #field-descricao, [data-field="description"]',
  disciplina: 'select[name="subject"], #select-disciplina, [data-field="subject"]',
  dificuldade: 'select[name="difficulty"], #select-dificuldade, [data-field="difficulty"]',
  formatoEntrega: 'select[name="format"], #select-formato, [data-field="format"]',
  duracao: 'input[name="duration"], #input-duracao, [data-field="duration"]',
  objetivos: 'textarea[name="objectives"], #textarea-objetivos, [data-field="objectives"]',
  materiais: 'textarea[name="materials"], #textarea-materiais, [data-field="materials"]',
  conteudo: 'textarea[name="content"], #editor-conteudo, [data-field="content"]',
  topicos: 'textarea[name="topics"], #textarea-topicos, [data-field="topics"]',
  pontosChave: 'textarea[name="key_points"], #textarea-pontos-chave, [data-field="key_points"]',
  referencias: 'textarea[name="references"], #textarea-referencias, [data-field="references"]',
  observacoes: 'textarea[name="notes"], #textarea-observacoes, [data-field="notes"]'
};
