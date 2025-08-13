import { sequenciaDidaticaGenerator, SequenciaDidaticaCompleta, SequenciaDidaticaGenerator } from './SequenciaDidaticaGenerator';
import { SequenciaDidaticaData } from './sequenciaDidaticaProcessor';

export class SequenciaDidaticaBuilder {
  static async saveSequencia(data: any): Promise<void> {
    try {
      console.log('💾 Salvando Sequência Didática:', data);

      const savedSequencias = JSON.parse(localStorage.getItem('sequenciasDidaticas') || '[]');
      savedSequencias.push({
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('sequenciasDidaticas', JSON.stringify(savedSequencias));

    } catch (error) {
      console.error('❌ Erro ao salvar Sequência Didática:', error);
      throw error;
    }
  }

  static async loadSequencia(id: string): Promise<any> {
    try {
      console.log('📂 Carregando Sequência Didática:', id);

      const savedSequencias = JSON.parse(localStorage.getItem('sequenciasDidaticas') || '[]');
      const sequencia = savedSequencias.find((s: any) => s.id === id);

      if (!sequencia) {
        throw new Error(`Sequência Didática com ID ${id} não encontrada`);
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
      // Validar dados essenciais
      if (!formData.tituloTemaAssunto?.trim()) {
        throw new Error('Título do tema/assunto é obrigatório');
      }

      if (!formData.disciplina?.trim()) {
        throw new Error('Disciplina é obrigatória');
      }

      // Usar o generator para criar a sequência completa
      const sequenciaGerada = await SequenciaDidaticaGenerator.generateSequenciaDidatica(formData);

      // Criar estrutura completa da sequência didática
      const sequenciaCompleta = {
        // Metadados básicos
        id: `seq_${Date.now()}`,
        tituloTemaAssunto: formData.tituloTemaAssunto,
        disciplina: formData.disciplina,
        anoSerie: formData.anoSerie,
        objetivosAprendizagem: formData.objetivosAprendizagem,
        publicoAlvo: formData.publicoAlvo,
        bnccCompetencias: formData.bnccCompetencias,
        quantidadeAulas: parseInt(formData.quantidadeAulas) || 4,
        quantidadeDiagnosticos: parseInt(formData.quantidadeDiagnosticos) || 2,
        quantidadeAvaliacoes: parseInt(formData.quantidadeAvaliacoes) || 2,

        // Dados gerados
        ...sequenciaGerada,

        // Status e timestamps
        isBuilt: true,
        isGenerated: true,
        buildTimestamp: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };

      console.log('✅ Sequência Didática construída com sucesso:', sequenciaCompleta);
      return sequenciaCompleta;

    } catch (error) {
      console.error('❌ Erro ao construir Sequência Didática:', error);
      throw new Error(`Erro na construção: ${error.message}`);
    }
  }
}

// Exportar instância singleton
export const sequenciaDidaticaBuilder = new SequenciaDidaticaBuilder();