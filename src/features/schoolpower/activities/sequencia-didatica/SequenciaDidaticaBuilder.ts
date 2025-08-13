
import { sequenciaDidaticaGenerator, SequenciaDidaticaCompleta, SequenciaDidaticaGenerator } from './SequenciaDidaticaGenerator';
import { SequenciaDidaticaData } from './sequenciaDidaticaProcessor';

export class SequenciaDidaticaBuilder {
  private static instance: SequenciaDidaticaBuilder;

  static getInstance(): SequenciaDidaticaBuilder {
    if (!SequenciaDidaticaBuilder.instance) {
      SequenciaDidaticaBuilder.instance = new SequenciaDidaticaBuilder();
    }
    return SequenciaDidaticaBuilder.instance;
  }

  async construirSequenciaDidatica(formData: any): Promise<{ success: boolean; data?: SequenciaDidaticaCompleta; error?: string }> {
    console.log('🏗️ Iniciando construção da Sequência Didática:', formData);

    try {
      // Validar dados de entrada
      const validacao = this.validarDados(formData);
      if (!validacao.valido) {
        return {
          success: false,
          error: validacao.erro
        };
      }

      // Gerar a sequência didática usando o generator
      const sequenciaCompleta = await SequenciaDidaticaGenerator.generateSequenciaDidatica(formData);

      // Salvar no localStorage
      this.salvarSequencia(sequenciaCompleta);

      console.log('✅ Sequência Didática construída com sucesso:', sequenciaCompleta);

      return {
        success: true,
        data: sequenciaCompleta
      };

    } catch (error) {
      console.error('❌ Erro ao construir Sequência Didática:', error);
      return {
        success: false,
        error: error.message || 'Erro na construção da sequência didática'
      };
    }
  }

  async regenerarSequencia(formData: any): Promise<{ success: boolean; data?: SequenciaDidaticaCompleta; error?: string }> {
    console.log('🔄 Regenerando Sequência Didática:', formData);

    try {
      // Limpar dados anteriores
      this.limparSequenciaSalva();

      // Construir nova sequência
      return await this.construirSequenciaDidatica(formData);

    } catch (error) {
      console.error('❌ Erro ao regenerar Sequência Didática:', error);
      return {
        success: false,
        error: 'Erro na regeneração'
      };
    }
  }

  private validarDados(dados: SequenciaDidaticaData): { valido: boolean; erro?: string } {
    if (!dados.tituloTemaAssunto?.trim()) {
      return { valido: false, erro: 'Título do tema/assunto é obrigatório' };
    }

    if (!dados.disciplina?.trim()) {
      return { valido: false, erro: 'Disciplina é obrigatória' };
    }

    if (!dados.anoSerie?.trim()) {
      return { valido: false, erro: 'Ano/série é obrigatório' };
    }

    if (!dados.objetivosAprendizagem?.trim()) {
      return { valido: false, erro: 'Objetivos de aprendizagem são obrigatórios' };
    }

    if (!dados.quantidadeAulas || parseInt(dados.quantidadeAulas) < 1) {
      return { valido: false, erro: 'Quantidade de aulas deve ser pelo menos 1' };
    }

    if (!dados.quantidadeDiagnosticos || parseInt(dados.quantidadeDiagnosticos) < 0) {
      return { valido: false, erro: 'Quantidade de diagnósticos deve ser 0 ou maior' };
    }

    if (!dados.quantidadeAvaliacoes || parseInt(dados.quantidadeAvaliacoes) < 0) {
      return { valido: false, erro: 'Quantidade de avaliações deve ser 0 ou maior' };
    }

    return { valido: true };
  }

  private salvarSequencia(sequencia: SequenciaDidaticaCompleta): void {
    try {
      const activityKey = 'constructed_sequencia-didatica_latest';
      localStorage.setItem(activityKey, JSON.stringify(sequencia));
      console.log('💾 Sequência Didática salva no localStorage');
    } catch (error) {
      console.error('❌ Erro ao salvar sequência:', error);
    }
  }

  private limparSequenciaSalva(): void {
    try {
      const activityKey = 'constructed_sequencia-didatica_latest';
      localStorage.removeItem(activityKey);
      console.log('🗑️ Sequência Didática anterior removida do localStorage');
    } catch (error) {
      console.error('❌ Erro ao limpar sequência salva:', error);
    }
  }

  carregarSequenciaSalva(): SequenciaDidaticaCompleta | null {
    try {
      const activityKey = 'constructed_sequencia-didatica_latest';
      const savedData = localStorage.getItem(activityKey);

      if (savedData) {
        return JSON.parse(savedData);
      }

      return null;
    } catch (error) {
      console.error('❌ Erro ao carregar sequência salva:', error);
      return null;
    }
  }

  static async buildSequenciaDidatica(formData: any): Promise<any> {
    console.log('🔨 Construindo Sequência Didática:', formData);

    try {
      // Usar o generator para criar a sequência
      const sequenciaGerada = await SequenciaDidaticaGenerator.generateSequenciaDidatica(formData);

      // Combinar dados do formulário com dados gerados
      const sequenciaCompleta = {
        ...formData,
        ...sequenciaGerada,
        isBuilt: true,
        buildTimestamp: new Date().toISOString()
      };

      console.log('✅ Sequência Didática construída:', sequenciaCompleta);
      return sequenciaCompleta;

    } catch (error) {
      console.error('❌ Erro ao construir Sequência Didática:', error);
      throw error;
    }
  }
}

// Exportar instância singleton
export const sequenciaDidaticaBuilder = SequenciaDidaticaBuilder.getInstance();
