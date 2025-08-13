
import { sequenciaDidaticaGenerator, SequenciaDidaticaCompleta, SequenciaDidaticaGenerator } from './SequenciaDidaticaGenerator';
import { SequenciaDidaticaData, processSequenciaDidaticaData, validateSequenciaDidaticaData } from './sequenciaDidaticaProcessor';

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

  static async buildSequenciaDidatica(formData: any): Promise<any> {
    console.log('🔨 Iniciando construção da Sequência Didática:', formData);

    try {
      // Processar e validar dados
      const processedData = processSequenciaDidaticaData(formData);
      console.log('📋 Dados processados:', processedData);

      if (!validateSequenciaDidaticaData(processedData)) {
        throw new Error('Dados obrigatórios não preenchidos corretamente');
      }

      // Gerar sequência completa usando o generator
      console.log('🎯 Chamando generator para criar sequência...');
      const sequenciaGerada = await SequenciaDidaticaGenerator.generateSequenciaDidatica(processedData);

      // Criar estrutura completa da sequência didática
      const sequenciaCompleta = {
        // Metadados básicos
        id: `sequencia-didatica`,
        activityId: 'sequencia-didatica',
        tituloTemaAssunto: processedData.tituloTemaAssunto,
        disciplina: processedData.disciplina,
        anoSerie: processedData.anoSerie,
        objetivosAprendizagem: processedData.objetivosAprendizagem,
        publicoAlvo: processedData.publicoAlvo,
        bnccCompetencias: processedData.bnccCompetencias,
        quantidadeAulas: parseInt(processedData.quantidadeAulas) || 4,
        quantidadeDiagnosticos: parseInt(processedData.quantidadeDiagnosticos) || 2,
        quantidadeAvaliacoes: parseInt(processedData.quantidadeAvaliacoes) || 2,

        // Dados gerados
        ...sequenciaGerada,

        // Status e timestamps
        isBuilt: true,
        isGenerated: true,
        buildTimestamp: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };

      // Salvar automaticamente
      await this.saveSequencia(sequenciaCompleta);

      console.log('✅ Sequência Didática construída e salva com sucesso:', sequenciaCompleta);
      return sequenciaCompleta;

    } catch (error) {
      console.error('❌ Erro ao construir Sequência Didática:', error);
      throw new Error(`Erro na construção: ${error.message}`);
    }
  }

  static async regenerateSequencia(activityId: string, newData: any): Promise<any> {
    console.log('🔄 Regenerando Sequência Didática:', activityId, newData);

    try {
      // Carregar dados existentes
      const existingData = await this.loadSequencia(activityId);
      
      // Mesclar com novos dados
      const mergedData = { ...existingData, ...newData };
      
      // Reconstruir
      return await this.buildSequenciaDidatica(mergedData);

    } catch (error) {
      console.error('❌ Erro ao regenerar Sequência Didática:', error);
      throw error;
    }
  }
}

// Exportar instância singleton
export const sequenciaDidaticaBuilder = new SequenciaDidaticaBuilder();
