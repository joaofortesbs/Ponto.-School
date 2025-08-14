
import { SequenciaDidaticaData } from './types';

export interface SequenciaDidaticaFormData {
  tituloTemaAssunto: string;
  disciplina: string;
  anoSerie: string;
  quantidadeAulas: string;
  publicoAlvo?: string;
  objetivosAprendizagem?: string;
  bnccCompetencias?: string;
  quantidadeDiagnosticos?: string;
  quantidadeAvaliacoes?: string;
  cronograma?: string;
}

export class SequenciaDidaticaGenerator {
  static generateFromFormData(formData: SequenciaDidaticaFormData): SequenciaDidaticaData {
    const baseData: SequenciaDidaticaData = {
      id: `sequencia-${Date.now()}`,
      title: formData.tituloTemaAssunto || 'Sequência Didática',
      type: 'sequencia-didatica',
      tituloTemaAssunto: formData.tituloTemaAssunto,
      disciplina: formData.disciplina,
      anoSerie: formData.anoSerie,
      quantidadeAulas: formData.quantidadeAulas,
      publicoAlvo: formData.publicoAlvo,
      objetivosAprendizagem: formData.objetivosAprendizagem,
      bnccCompetencias: formData.bnccCompetencias,
      quantidadeDiagnosticos: formData.quantidadeDiagnosticos,
      quantidadeAvaliacoes: formData.quantidadeAvaliacoes,
      cronograma: formData.cronograma,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return baseData;
  }

  static validateFormData(formData: SequenciaDidaticaFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!formData.tituloTemaAssunto?.trim()) {
      errors.push('Título/Tema/Assunto é obrigatório');
    }

    if (!formData.disciplina?.trim()) {
      errors.push('Disciplina é obrigatória');
    }

    if (!formData.anoSerie?.trim()) {
      errors.push('Ano/Série é obrigatório');
    }

    if (!formData.quantidadeAulas?.trim()) {
      errors.push('Quantidade de aulas é obrigatória');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const sequenciaDidaticaGenerator = {
  generate: SequenciaDidaticaGenerator.generateFromFormData,
  validate: SequenciaDidaticaGenerator.validateFormData
};

export default SequenciaDidaticaGenerator;
