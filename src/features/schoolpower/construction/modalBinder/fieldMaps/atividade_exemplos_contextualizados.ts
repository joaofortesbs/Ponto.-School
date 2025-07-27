
import { ActivityFieldMap } from './index';

export const activityExemplosContextualizadosFieldMap: ActivityFieldMap = {
  titulo: 'input[name="title"], #field-titulo, [data-field="title"]',
  descricao: 'textarea[name="description"], #field-descricao, [data-field="description"]',
  disciplina: 'select[name="subject"], #select-disciplina, [data-field="subject"]',
  dificuldade: 'select[name="difficulty"], #select-dificuldade, [data-field="difficulty"]',
  formatoEntrega: 'select[name="format"], #select-formato, [data-field="format"]',
  duracao: 'input[name="duration"], #input-duracao, [data-field="duration"]',
  objetivos: 'textarea[name="objectives"], #textarea-objetivos, [data-field="objectives"]',
  materiais: 'textarea[name="materials"], #textarea-materiais, [data-field="materials"]',
  exemplos: 'textarea[name="examples"], #textarea-exemplos, [data-field="examples"]',
  contextos: 'textarea[name="contexts"], #textarea-contextos, [data-field="contexts"]',
  situacoesPraticas: 'textarea[name="practical_situations"], #textarea-situacoes-praticas, [data-field="practical_situations"]',
  aplicacoes: 'textarea[name="applications"], #textarea-aplicacoes, [data-field="applications"]',
  observacoes: 'textarea[name="notes"], #textarea-observacoes, [data-field="notes"]'
};
