
import { SequenciaDidaticaData } from './sequenciaDidaticaProcessor';
import { sequenciaDidaticaGenerator, SequenciaDidaticaCompleta } from './SequenciaDidaticaGenerator';

export class SequenciaDidaticaBuilder {
  static async saveSequencia(data: any): Promise<void> {
    try {
      const storageKey = `constructed_sequencia-didatica_${data.id || Date.now()}`;
      localStorage.setItem(storageKey, JSON.stringify(data));
      console.log('✅ Sequência Didática salva com sucesso:', storageKey);
    } catch (error) {
      console.error('❌ Erro ao salvar sequência:', error);
      throw error;
    }
  }

  static async loadSequencia(activityId: string): Promise<any> {
    try {
      const storageKey = `constructed_sequencia-didatica_${activityId}`;
      const savedData = localStorage.getItem(storageKey);
      
      if (savedData) {
        console.log('✅ Sequência carregada do localStorage');
        return JSON.parse(savedData);
      }
      
      console.log('⚠️ Nenhuma sequência salva encontrada');
      return null;
    } catch (error) {
      console.error('❌ Erro ao carregar sequência salva:', error);
      return null;
    }
  }

  static async buildSequencia(formData: SequenciaDidaticaData): Promise<SequenciaDidaticaCompleta> {
    try {
      console.log('🔨 Iniciando construção da Sequência Didática:', formData);

      // Validar dados obrigatórios
      if (!formData.tituloTemaAssunto?.trim()) {
        throw new Error('Título do tema/assunto é obrigatório');
      }
      if (!formData.disciplina?.trim()) {
        throw new Error('Disciplina é obrigatória');
      }
      if (!formData.anoSerie?.trim()) {
        throw new Error('Ano/Série é obrigatório');
      }

      // Gerar sequência completa usando o generator
      const sequenciaCompleta = await sequenciaDidaticaGenerator.generateFromFormData(formData);
      
      console.log('✅ Sequência Didática construída com sucesso');
      return sequenciaCompleta;

    } catch (error) {
      console.error('❌ Erro na construção da sequência:', error);
      throw new Error(`Falha na construção: ${error.message}`);
    }
  }

  static async recuperarSequencia(activityId: string): Promise<SequenciaDidaticaCompleta | null> {
    try {
      console.log('🔍 Recuperando sequência para:', activityId);
      
      const savedData = await this.loadSequencia(activityId);
      if (savedData) {
        console.log('✅ Sequência recuperada com sucesso');
        return savedData;
      }
      
      console.log('⚠️ Nenhuma sequência encontrada para recuperar');
      return null;
    } catch (error) {
      console.error('❌ Erro ao recuperar sequência:', error);
      return null;
    }
  }

  static async regenerarSequencia(
    formData: SequenciaDidaticaData,
    activityId?: string
  ): Promise<SequenciaDidaticaCompleta> {
    try {
      console.log('🔄 Regenerando sequência didática...');
      
      // Regenerar usando o generator
      const novaSequencia = await sequenciaDidaticaGenerator.generateFromFormData(formData);
      
      // Salvar nova versão
      if (activityId) {
        await this.saveSequencia({
          ...novaSequencia,
          id: activityId
        });
      }
      
      console.log('✅ Sequência regenerada com sucesso');
      return novaSequencia;
    } catch (error) {
      console.error('❌ Erro ao regenerar sequência:', error);
      throw error;
    }
  }
}

// Criar instância singleton para uso externo
export const sequenciaDidaticaBuilder = new SequenciaDidaticaBuilder();
