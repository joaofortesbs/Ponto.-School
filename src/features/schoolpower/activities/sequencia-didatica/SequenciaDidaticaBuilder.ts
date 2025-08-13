import { sequenciaDidaticaGenerator, SequenciaDidaticaCompleta } from './SequenciaDidaticaGenerator';
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
      // Mapear dados do formulário para formato esperado
      const dadosSequencia: SequenciaDidaticaData = {
        tituloTemaAssunto: formData.tituloTemaAssunto || formData.title || '',
        anoSerie: formData.anoSerie || formData.schoolYear || '',
        disciplina: formData.disciplina || formData.subject || '',
        bnccCompetencias: formData.bnccCompetencias || formData.competencies || '',
        publicoAlvo: formData.publicoAlvo || formData.context || '',
        objetivosAprendizagem: formData.objetivosAprendizagem || formData.objectives || '',
        quantidadeAulas: formData.quantidadeAulas || '4',
        quantidadeDiagnosticos: formData.quantidadeDiagnosticos || '1',
        quantidadeAvaliacoes: formData.quantidadeAvaliacoes || '1',
        cronograma: formData.cronograma || ''
      };

      console.log('📋 Dados mapeados:', dadosSequencia);

      // Validar dados essenciais
      const validacao = this.validarDados(dadosSequencia);
      if (!validacao.valido) {
        throw new Error(`Dados inválidos: ${validacao.erro}`);
      }

      // Gerar sequência completa
      const sequenciaCompleta = await sequenciaDidaticaGenerator.gerarSequenciaCompleta(dadosSequencia);

      // Salvar no localStorage
      const storageKey = `sequencia_didatica_${Date.now()}`;
      localStorage.setItem(storageKey, JSON.stringify(sequenciaCompleta));

      // Também salvar com chave específica para recuperação
      const activityKey = 'constructed_sequencia-didatica_latest';
      localStorage.setItem(activityKey, JSON.stringify(sequenciaCompleta));

      console.log('✅ Sequência Didática construída e salva:', storageKey);

      return {
        success: true,
        data: sequenciaCompleta
      };

    } catch (error) {
      console.error('❌ Erro na construção da Sequência Didática:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido na construção'
      };
    }
  }

  async regenerarSequencia(
    dadosOriginais: SequenciaDidaticaData,
    alteracoes: Partial<SequenciaDidaticaData>
  ): Promise<{ success: boolean; data?: SequenciaDidaticaCompleta; error?: string }> {
    console.log('🔄 Regenerando Sequência Didática com alterações:', alteracoes);

    try {
      const sequenciaRegenerada = await sequenciaDidaticaGenerator.regenerarSequencia(dadosOriginais, alteracoes);

      // Atualizar localStorage
      const activityKey = 'constructed_sequencia-didatica_latest';
      localStorage.setItem(activityKey, JSON.stringify(sequenciaRegenerada));

      console.log('✅ Sequência regenerada com sucesso');

      return {
        success: true,
        data: sequenciaRegenerada
      };
    } catch (error) {
      console.error('❌ Erro na regeneração:', error);
      return {
        success: false,
        error: error.message || 'Erro na regeneração'
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

export const sequenciaDidaticaBuilder = SequenciaDidaticaBuilder.getInstance();