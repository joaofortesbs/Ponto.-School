
import { ActivityFieldMap } from './index';

export const activityPropostaRedacaoFieldMap: ActivityFieldMap = {
  titulo: 'input[name="title"], #field-titulo, [data-field="title"]',
  descricao: 'textarea[name="description"], #field-descricao, [data-field="description"]',
  disciplina: 'select[name="subject"], #select-disciplina, [data-field="subject"]',
  dificuldade: 'select[name="difficulty"], #select-dificuldade, [data-field="difficulty"]',
  formatoEntrega: 'select[name="format"], #select-formato, [data-field="format"]',
  duracao: 'input[name="duration"], #input-duracao, [data-field="duration"]',
  objetivos: 'textarea[name="objectives"], #textarea-objetivos, [data-field="objectives"]',
  materiais: 'textarea[name="materials"], #textarea-materiais, [data-field="materials"]',
  tema: 'input[name="theme"], #input-tema, [data-field="theme"]',
  generoTextual: 'select[name="text_genre"], #select-genero-textual, [data-field="text_genre"]',
  enunciado: 'textarea[name="statement"], #textarea-enunciado, [data-field="statement"]',
  textosApoio: 'textarea[name="support_texts"], #textarea-textos-apoio, [data-field="support_texts"]',
  criteriosAvaliacao: 'textarea[name="evaluation_criteria"], #textarea-criterios, [data-field="evaluation_criteria"]',
  observacoes: 'textarea[name="notes"], #textarea-observacoes, [data-field="notes"]'
};
