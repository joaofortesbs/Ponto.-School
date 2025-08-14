
import SequenciaDidaticaBuilder, { SequenciaDidaticaData, SequenciaDidaticaResult } from './SequenciaDidaticaBuilder';

export class SequenciaDidaticaGenerator {
  static async generate(formData: any): Promise<SequenciaDidaticaResult> {
    console.log('🎯 SequenciaDidaticaGenerator: Iniciando geração com dados:', formData);

    // Mapear dados do formulário para o formato esperado
    const sequenciaData: SequenciaDidaticaData = {
      tituloTemaAssunto: formData.tituloTemaAssunto || formData.title || '',
      anoSerie: formData.anoSerie || formData.schoolYear || '',
      disciplina: formData.disciplina || formData.subject || '',
      bnccCompetencias: formData.bnccCompetencias || formData.competencies || '',
      publicoAlvo: formData.publicoAlvo || formData.context || '',
      objetivosAprendizagem: formData.objetivosAprendizagem || formData.objectives || '',
      quantidadeAulas: formData.quantidadeAulas || '3',
      quantidadeDiagnosticos: formData.quantidadeDiagnosticos || '1',
      quantidadeAvaliacoes: formData.quantidadeAvaliacoes || '1',
      cronograma: formData.cronograma || ''
    };

    console.log('📋 Dados mapeados para geração:', sequenciaData);

    try {
      const result = await SequenciaDidaticaBuilder.generateSequenciaDidatica(sequenciaData);
      
      // Salvar no localStorage para visualização
      const storageKey = `sequencia_didatica_content_${Date.now()}`;
      localStorage.setItem(storageKey, JSON.stringify(result));
      
      console.log('✅ Sequência Didática gerada e salva:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Erro na geração da Sequência Didática:', error);
      throw error;
    }
  }

  static async loadFromStorage(activityId: string): Promise<SequenciaDidaticaResult | null> {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('sequencia_didatica_content_') || 
        key === `activity_${activityId}` ||
        key === `constructed_sequencia-didatica_${activityId}`
      );

      for (const key of keys) {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.aulas) {
            return parsed;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Erro ao carregar Sequência Didática do storage:', error);
      return null;
    }
  }
}

export default SequenciaDidaticaGenerator;
