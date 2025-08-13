
import { SequenciaDidaticaData } from './sequenciaDidaticaProcessor';
import { SequenciaDidaticaGenerator, SequenciaDidaticaCompleta } from './SequenciaDidaticaGenerator';

export class SequenciaDidaticaBuilder {
  static async saveSequencia(data: any): Promise<void> {
    try {
      console.log('💾 Salvando Sequência Didática:', data);

      const sequenciaId = data.id || `seq_${Date.now()}`;
      const storageKey = `constructed_sequencia-didatica_${sequenciaId}`;

      // Salvar no localStorage específico
      localStorage.setItem(storageKey, JSON.stringify(data));

      // Também salvar na lista geral
      const savedSequencias = JSON.parse(localStorage.getItem('sequenciasDidaticas') || '[]');
      const existingIndex = savedSequencias.findIndex((s: any) => s.id === sequenciaId);

      if (existingIndex >= 0) {
        savedSequencias[existingIndex] = data;
      } else {
        savedSequencias.push({
          ...data,
          id: sequenciaId,
          createdAt: new Date().toISOString()
        });
      }

      localStorage.setItem('sequenciasDidaticas', JSON.stringify(savedSequencias));

      console.log('✅ Sequência Didática salva com sucesso:', sequenciaId);

    } catch (error) {
      console.error('❌ Erro ao salvar Sequência Didática:', error);
      throw error;
    }
  }

  static async loadSequencia(id: string): Promise<any> {
    try {
      console.log('📂 Carregando Sequência Didática:', id);

      // Tentar carregar do localStorage específico primeiro
      const specificKey = `constructed_sequencia-didatica_${id}`;
      const specificData = localStorage.getItem(specificKey);

      if (specificData) {
        console.log('✅ Sequência encontrada no storage específico');
        return JSON.parse(specificData);
      }

      // Fallback para lista geral
      const savedSequencias = JSON.parse(localStorage.getItem('sequenciasDidaticas') || '[]');
      const sequencia = savedSequencias.find((s: any) => s.id === id);

      if (!sequencia) {
        console.warn(`⚠️ Sequência Didática com ID ${id} não encontrada`);
        return null;
      }

      return sequencia;

    } catch (error) {
      console.error('❌ Erro ao carregar sequência salva:', error);
      return null;
    }
  }

  static recuperarSequencia(id: string): Promise<any> {
    return this.loadSequencia(id);
  }

  static async buildSequencia(formData: SequenciaDidaticaData): Promise<SequenciaDidaticaCompleta> {
    try {
      console.log('🔨 Construindo Sequência Didática:', formData);

      const generator = SequenciaDidaticaGenerator.getInstance();
      const sequenciaCompleta = await generator.generateFromFormData(formData);

      // Salvar a sequência construída
      await this.saveSequencia(sequenciaCompleta);

      console.log('✅ Sequência Didática construída com sucesso');
      return sequenciaCompleta;

    } catch (error) {
      console.error('❌ Erro ao construir Sequência Didática:', error);
      throw error;
    }
  }

  static async regenerateSequencia(id: string, formData: SequenciaDidaticaData): Promise<SequenciaDidaticaCompleta> {
    try {
      console.log('🔄 Regenerando Sequência Didática:', id);

      const generator = SequenciaDidaticaGenerator.getInstance();
      const sequenciaCompleta = await generator.regenerateWithAI(formData);

      // Atualizar com o ID existente
      const updatedSequencia = { ...sequenciaCompleta, id };
      await this.saveSequencia(updatedSequencia);

      console.log('✅ Sequência Didática regenerada com sucesso');
      return updatedSequencia;

    } catch (error) {
      console.error('❌ Erro ao regenerar Sequência Didática:', error);
      throw error;
    }
  }

  static async deleteSequencia(id: string): Promise<void> {
    try {
      console.log('🗑️ Removendo Sequência Didática:', id);

      // Remover do storage específico
      const specificKey = `constructed_sequencia-didatica_${id}`;
      localStorage.removeItem(specificKey);

      // Remover da lista geral
      const savedSequencias = JSON.parse(localStorage.getItem('sequenciasDidaticas') || '[]');
      const filteredSequencias = savedSequencias.filter((s: any) => s.id !== id);
      localStorage.setItem('sequenciasDidaticas', JSON.stringify(filteredSequencias));

      console.log('✅ Sequência Didática removida com sucesso');

    } catch (error) {
      console.error('❌ Erro ao remover Sequência Didática:', error);
      throw error;
    }
  }

  static async listSequencias(): Promise<any[]> {
    try {
      console.log('📋 Listando todas as Sequências Didáticas');

      const savedSequencias = JSON.parse(localStorage.getItem('sequenciasDidaticas') || '[]');
      return savedSequencias;

    } catch (error) {
      console.error('❌ Erro ao listar Sequências Didáticas:', error);
      return [];
    }
  }
}

export default SequenciaDidaticaBuilder;
