
import { sequenciaDidaticaGenerator, SequenciaDidaticaCompleta } from './SequenciaDidaticaGenerator';
import { ActivityFormData } from '../../construction/types/ActivityTypes';

export class SequenciaDidaticaBuilder {
  private static instance: SequenciaDidaticaBuilder;

  static getInstance(): SequenciaDidaticaBuilder {
    if (!SequenciaDidaticaBuilder.instance) {
      SequenciaDidaticaBuilder.instance = new SequenciaDidaticaBuilder();
    }
    return SequenciaDidaticaBuilder.instance;
  }

  async buildSequenciaDidatica(formData: ActivityFormData): Promise<SequenciaDidaticaCompleta> {
    console.log('🏗️ Iniciando construção da Sequência Didática:', formData);

    try {
      // Validar dados obrigatórios
      this.validarDadosObrigatorios(formData);

      // Preparar dados para a IA
      const dadosPreparados = this.prepararDadosParaIA(formData);
      console.log('📋 Dados preparados para IA:', dadosPreparados);

      // Gerar sequência usando o gerador com IA
      const sequenciaGerada = await sequenciaDidaticaGenerator.gerarSequenciaCompleta(dadosPreparados);
      console.log('🎯 Sequência gerada com sucesso');

      // Processar e enriquecer dados
      const sequenciaProcessada = this.processarSequenciaGerada(sequenciaGerada, formData);
      console.log('✅ Sequência processada e pronta');

      return sequenciaProcessada;

    } catch (error) {
      console.error('❌ Erro na construção da Sequência Didática:', error);
      throw new Error(`Falha na construção: ${error.message}`);
    }
  }

  private validarDadosObrigatorios(formData: ActivityFormData): void {
    const camposObrigatorios = [
      { campo: 'tituloTemaAssunto', valor: formData.tituloTemaAssunto },
      { campo: 'disciplina', valor: formData.disciplina },
      { campo: 'anoSerie', valor: formData.anoSerie },
      { campo: 'publicoAlvo', valor: formData.publicoAlvo },
      { campo: 'objetivosAprendizagem', valor: formData.objetivosAprendizagem },
      { campo: 'quantidadeAulas', valor: formData.quantidadeAulas },
      { campo: 'quantidadeDiagnosticos', valor: formData.quantidadeDiagnosticos },
      { campo: 'quantidadeAvaliacoes', valor: formData.quantidadeAvaliacoes }
    ];

    const camposFaltando = camposObrigatorios.filter(item => 
      !item.valor || item.valor.toString().trim() === ''
    );

    if (camposFaltando.length > 0) {
      const campos = camposFaltando.map(item => item.campo).join(', ');
      throw new Error(`Campos obrigatórios não preenchidos: ${campos}`);
    }
  }

  private prepararDadosParaIA(formData: ActivityFormData): any {
    return {
      id: `sequencia-${Date.now()}`,
      tituloTemaAssunto: formData.tituloTemaAssunto?.trim(),
      disciplina: formData.disciplina?.trim(),
      anoSerie: formData.anoSerie?.trim(),
      publicoAlvo: formData.publicoAlvo?.trim(),
      objetivosAprendizagem: formData.objetivosAprendizagem?.trim(),
      bnccCompetencias: formData.bnccCompetencias?.trim() || '',
      quantidadeAulas: formData.quantidadeAulas?.trim() || '4',
      quantidadeDiagnosticos: formData.quantidadeDiagnosticos?.trim() || '2',
      quantidadeAvaliacoes: formData.quantidadeAvaliacoes?.trim() || '2',
      cronograma: formData.cronograma?.trim() || '',
      // Dados complementares do formulário
      title: formData.title?.trim(),
      description: formData.description?.trim(),
      subject: formData.subject?.trim(),
      schoolYear: formData.schoolYear?.trim(),
      objectives: formData.objectives?.trim(),
      materials: formData.materials?.trim(),
      context: formData.context?.trim(),
      evaluation: formData.evaluation?.trim()
    };
  }

  private processarSequenciaGerada(sequencia: SequenciaDidaticaCompleta, formDataOriginal: ActivityFormData): SequenciaDidaticaCompleta {
    // Enriquecer com dados adicionais se necessário
    const sequenciaEnriquecida = {
      ...sequencia,
      // Garantir que dados obrigatórios estejam presentes
      titulo: sequencia.titulo || formDataOriginal.tituloTemaAssunto || formDataOriginal.title || 'Sequência Didática',
      disciplina: sequencia.disciplina || formDataOriginal.disciplina || formDataOriginal.subject || 'Disciplina',
      anoSerie: sequencia.anoSerie || formDataOriginal.anoSerie || formDataOriginal.schoolYear || 'Ano/Série',
      
      // Metadados aprimorados
      metadados: {
        ...sequencia.metadados,
        formDataOriginal: {
          title: formDataOriginal.title,
          description: formDataOriginal.description,
          materials: formDataOriginal.materials,
          context: formDataOriginal.context,
          evaluation: formDataOriginal.evaluation
        },
        processadoEm: new Date().toISOString(),
        sistemaVersao: "School Power v2.0"
      }
    };

    // Salvar no localStorage com chave específica
    const storageKey = `constructed_sequencia-didatica_${sequencia.id}`;
    localStorage.setItem(storageKey, JSON.stringify(sequenciaEnriquecida));
    console.log('💾 Sequência salva no localStorage:', storageKey);

    return sequenciaEnriquecida;
  }

  // Método para recuperar sequência do localStorage
  static recuperarSequencia(sequenciaId: string): SequenciaDidaticaCompleta | null {
    try {
      const storageKey = `constructed_sequencia-didatica_${sequenciaId}`;
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Erro ao recuperar sequência do localStorage:', error);
      return null;
    }
  }

  // Método para limpar sequências antigas
  static limparSequenciasAntigas(diasRetencao: number = 7): void {
    try {
      const agora = new Date();
      const limiteTempo = new Date(agora.getTime() - (diasRetencao * 24 * 60 * 60 * 1000));

      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('constructed_sequencia-didatica_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            const dataGeracao = new Date(data.metadados?.dataGeracao || 0);
            
            if (dataGeracao < limiteTempo) {
              localStorage.removeItem(key);
              console.log('🗑️ Sequência antiga removida:', key);
            }
          } catch (error) {
            // Se houver erro ao parsear, remove o item
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error('❌ Erro ao limpar sequências antigas:', error);
    }
  }
}

export const sequenciaDidaticaBuilder = SequenciaDidaticaBuilder.getInstance();aDidaticaBuilder = SequenciaDidaticaBuilder.getInstance();

// Inicializar limpeza automática quando o módulo for carregado
if (typeof window !== 'undefined') {
  // Executar limpeza uma vez ao carregar
  setTimeout(() => {
    SequenciaDidaticaBuilder.limparSequenciasAntigas();
  }, 1000);
}
