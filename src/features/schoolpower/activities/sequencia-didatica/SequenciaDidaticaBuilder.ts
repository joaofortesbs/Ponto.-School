
import { ActivityFormData } from '../../construction/types/ActivityTypes';
import { processSequenciaDidaticaData, ProcessedSequenciaDidaticaData, validateSequenciaDidaticaData } from './sequenciaDidaticaProcessor';
import { buildSequenciaDidaticaPrompt } from '../../prompts/sequenciaDidaticaPrompt';
import { geminiClient } from '@/utils/api/geminiClient';

export interface BuiltSequenciaDidaticaData {
  // Metadados básicos compatíveis com preview
  id: string;
  activityId: string;
  tituloTemaAssunto: string;
  disciplina: string;
  anoSerie: string;
  objetivosAprendizagem: string;
  publicoAlvo: string;
  bnccCompetencias: string;
  quantidadeAulas: number;
  quantidadeDiagnosticos: number;
  quantidadeAvaliacoes: number;

  // Metadados estruturados para preview
  metadados: {
    tituloTemaAssunto: string;
    disciplina: string;
    anoSerie: string;
    objetivosAprendizagem: string;
    publicoAlvo: string;
    bnccCompetencias: string;
    duracaoTotal: string;
  };

  // Dados gerados pela IA
  aulas: any[];
  diagnosticos: any[];
  avaliacoes: any[];
  cronogramaSugerido: any;

  // Status
  isBuilt: boolean;
  isGenerated: boolean;
  buildTimestamp: string;
  lastModified: string;
}

export class SequenciaDidaticaBuilder {
  private static instance: SequenciaDidaticaBuilder;

  static getInstance(): SequenciaDidaticaBuilder {
    if (!SequenciaDidaticaBuilder.instance) {
      SequenciaDidaticaBuilder.instance = new SequenciaDidaticaBuilder();
    }
    return SequenciaDidaticaBuilder.instance;
  }

  constructor() {
    console.log('🏗️ [SEQUENCIA_DIDATICA_BUILDER] Inicializado');
  }

  async buildSequencia(formData: ActivityFormData): Promise<BuiltSequenciaDidaticaData> {
    console.log('🎯 [SEQUENCIA_DIDATICA_BUILDER] Iniciando construção da Sequência Didática:', formData);

    try {
      // Processar e validar dados
      const processedData = processSequenciaDidaticaData(formData);
      const validation = validateSequenciaDidaticaData(processedData);

      if (!validation.isValid) {
        throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
      }

      console.log('✅ [SEQUENCIA_DIDATICA_BUILDER] Dados processados e validados:', processedData);

      // Gerar conteúdo com IA
      let sequenciaGerada;
      try {
        sequenciaGerada = await this.generateWithGemini(processedData);
        console.log('🤖 [SEQUENCIA_DIDATICA_BUILDER] Conteúdo gerado pela IA:', sequenciaGerada);
      } catch (error) {
        console.error('⚠️ [SEQUENCIA_DIDATICA_BUILDER] Erro na IA, usando dados padrão:', error);
        sequenciaGerada = this.createFallbackData(processedData);
      }

      // Criar estrutura completa da sequência didática
      const sequenciaCompleta: BuiltSequenciaDidaticaData = {
        // Metadados básicos
        id: `sequencia-didatica-${Date.now()}`,
        activityId: 'sequencia-didatica',
        tituloTemaAssunto: processedData.tituloTemaAssunto,
        disciplina: processedData.disciplina,
        anoSerie: processedData.anoSerie,
        objetivosAprendizagem: processedData.objetivosAprendizagem,
        publicoAlvo: processedData.publicoAlvo,
        bnccCompetencias: processedData.bnccCompetencias,
        quantidadeAulas: parseInt(processedData.quantidadeAulas) || 4,
        quantidadeDiagnosticos: parseInt(processedData.quantidadeDiagnosticos) || 1,
        quantidadeAvaliacoes: parseInt(processedData.quantidadeAvaliacoes) || 2,

        // Metadados estruturados para preview
        metadados: {
          tituloTemaAssunto: processedData.tituloTemaAssunto,
          disciplina: processedData.disciplina,
          anoSerie: processedData.anoSerie,
          objetivosAprendizagem: processedData.objetivosAprendizagem,
          publicoAlvo: processedData.publicoAlvo,
          bnccCompetencias: processedData.bnccCompetencias,
          duracaoTotal: `${parseInt(processedData.quantidadeAulas) * 50} minutos`
        },

        // Dados gerados pela IA ou dados padrão se falhar
        aulas: sequenciaGerada.aulas || this.createDefaultAulas(parseInt(processedData.quantidadeAulas), processedData),
        diagnosticos: sequenciaGerada.diagnosticos || this.createDefaultDiagnosticos(parseInt(processedData.quantidadeDiagnosticos), processedData),
        avaliacoes: sequenciaGerada.avaliacoes || this.createDefaultAvaliacoes(parseInt(processedData.quantidadeAvaliacoes), processedData),
        cronogramaSugerido: sequenciaGerada.cronogramaSugerido || {
          duracao: `${parseInt(processedData.quantidadeAulas)} aulas`,
          distribuicao: 'Distribuição flexível conforme calendário escolar',
          observacoes: 'Cronograma adaptável às necessidades da turma'
        },

        // Status e timestamps
        isBuilt: true,
        isGenerated: true,
        buildTimestamp: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };

      // Salvar automaticamente
      await this.saveSequencia(sequenciaCompleta);

      console.log('✅ [SEQUENCIA_DIDATICA_BUILDER] Sequência Didática construída com sucesso:', sequenciaCompleta);
      return sequenciaCompleta;

    } catch (error) {
      console.error('❌ [SEQUENCIA_DIDATICA_BUILDER] Erro ao construir:', error);
      throw new Error(`Erro na construção: ${error.message}`);
    }
  }

  private async generateWithGemini(data: ProcessedSequenciaDidaticaData): Promise<any> {
    console.log('🤖 [SEQUENCIA_DIDATICA_BUILDER] Gerando com Gemini:', data);

    try {
      const prompt = buildSequenciaDidaticaPrompt(data);
      console.log('📝 [SEQUENCIA_DIDATICA_BUILDER] Prompt gerado:', prompt.substring(0, 500) + '...');

      const response = await geminiClient.generateContent(prompt);
      console.log('🔄 [SEQUENCIA_DIDATICA_BUILDER] Resposta bruta da IA recebida');

      if (!response || !response.text) {
        throw new Error('Resposta vazia da IA');
      }

      const responseText = response.text;
      console.log('📄 [SEQUENCIA_DIDATICA_BUILDER] Texto da resposta:', responseText.substring(0, 500) + '...');

      // Extrair JSON da resposta
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('JSON não encontrado na resposta da IA');
      }

      const jsonStr = jsonMatch[0];
      console.log('🔍 [SEQUENCIA_DIDATICA_BUILDER] JSON extraído:', jsonStr.substring(0, 300) + '...');

      let parsedData;
      try {
        parsedData = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error('❌ [SEQUENCIA_DIDATICA_BUILDER] Erro de parsing JSON:', parseError);
        throw new Error('Erro ao processar resposta da IA: JSON inválido');
      }

      // Validar estrutura da resposta
      const validatedData = this.validateAndStructureAIResponse(parsedData, data);
      console.log('✅ [SEQUENCIA_DIDATICA_BUILDER] Dados validados e estruturados:', validatedData);

      return validatedData;

    } catch (error) {
      console.error('❌ [SEQUENCIA_DIDATICA_BUILDER] Erro na geração com IA:', error);
      throw error;
    }
  }

  private validateAndStructureAIResponse(aiData: any, inputData: ProcessedSequenciaDidaticaData): any {
    console.log('🔧 [SEQUENCIA_DIDATICA_BUILDER] Validando resposta da IA');

    const result = {
      aulas: [],
      diagnosticos: [],
      avaliacoes: [],
      cronogramaSugerido: null
    };

    // Processar aulas
    if (aiData.aulas && Array.isArray(aiData.aulas)) {
      result.aulas = aiData.aulas.map((aula, index) => ({
        id: `aula-${index + 1}`,
        numero: index + 1,
        titulo: aula.titulo || `Aula ${index + 1}`,
        objetivoEspecifico: aula.objetivoEspecifico || aula.objetivo || 'Objetivo não especificado',
        resumoContexto: aula.resumoContexto || aula.resumo || aula.contexto || 'Resumo não disponível',
        tempoEstimado: aula.tempoEstimado || aula.tempo || '50 min',
        etapas: aula.etapas || {
          introducao: {
            tempo: '10 min',
            descricao: 'Introdução ao conteúdo da aula'
          },
          desenvolvimento: {
            tempo: '30 min',
            descricao: 'Desenvolvimento do conteúdo'
          },
          fechamento: {
            tempo: '10 min',
            descricao: 'Fechamento e síntese da aula'
          }
        },
        recursos: aula.recursos || ['Quadro', 'Material didático'],
        atividadesPraticas: aula.atividadesPraticas || {
          descricao: 'Atividades práticas relacionadas ao tema'
        }
      }));
    }

    // Processar diagnósticos
    if (aiData.diagnosticos && Array.isArray(aiData.diagnosticos)) {
      result.diagnosticos = aiData.diagnosticos.map((diag, index) => ({
        id: `diagnostico-${index + 1}`,
        numero: index + 1,
        titulo: diag.titulo || `Diagnóstico ${index + 1}`,
        objetivoAvaliativo: diag.objetivoAvaliativo || diag.objetivo || 'Avaliar conhecimentos prévios',
        tipo: diag.tipo || 'Diagnóstica',
        questoes: diag.questoes || 10,
        formato: diag.formato || 'Múltipla escolha',
        tempoEstimado: diag.tempoEstimado || '20 min',
        criteriosCorrecao: diag.criteriosCorrecao || {
          excelente: '9-10 pontos',
          bom: '7-8 pontos',
          precisaMelhorar: '0-6 pontos'
        }
      }));
    }

    // Processar avaliações
    if (aiData.avaliacoes && Array.isArray(aiData.avaliacoes)) {
      result.avaliacoes = aiData.avaliacoes.map((aval, index) => ({
        id: `avaliacao-${index + 1}`,
        numero: index + 1,
        titulo: aval.titulo || `Avaliação ${index + 1}`,
        objetivoAvaliativo: aval.objetivoAvaliativo || aval.objetivo || 'Avaliar aprendizagem',
        tipo: aval.tipo || 'Formativa',
        questoes: aval.questoes || 15,
        valorTotal: aval.valorTotal || '10,0 pontos',
        tempoEstimado: aval.tempoEstimado || '45 min',
        composicao: aval.composicao || {
          multipplaEscolha: {
            quantidade: 10,
            pontos: '6,0 pontos'
          },
          discursivas: {
            quantidade: 3,
            pontos: '4,0 pontos'
          }
        },
        gabarito: aval.gabarito || 'Gabarito disponível para o professor'
      }));
    }

    // Processar cronograma
    result.cronogramaSugerido = aiData.cronogramaSugerido || {
      duracao: `${inputData.quantidadeAulas} aulas`,
      distribuicao: 'Sugerido: 2 aulas por semana',
      observacoes: 'Cronograma flexível conforme necessidades da turma'
    };

    return result;
  }

  private createDefaultAulas(quantidade: number, data: ProcessedSequenciaDidaticaData): any[] {
    console.log('🔧 [SEQUENCIA_DIDATICA_BUILDER] Criando aulas padrão');

    const aulas = [];
    for (let i = 0; i < quantidade; i++) {
      aulas.push({
        id: `aula-${i + 1}`,
        numero: i + 1,
        titulo: `${data.tituloTemaAssunto} - Aula ${i + 1}`,
        objetivoEspecifico: `Desenvolver conhecimentos específicos sobre ${data.tituloTemaAssunto}`,
        resumoContexto: `Aula ${i + 1} aborda aspectos fundamentais de ${data.tituloTemaAssunto} para ${data.anoSerie}`,
        tempoEstimado: '50 min',
        etapas: {
          introducao: {
            tempo: '10 min',
            descricao: 'Introdução aos conceitos da aula'
          },
          desenvolvimento: {
            tempo: '30 min',
            descricao: 'Desenvolvimento do conteúdo principal'
          },
          fechamento: {
            tempo: '10 min',
            descricao: 'Síntese e fechamento da aula'
          }
        },
        recursos: ['Quadro', 'Material didático', 'Apresentação'],
        atividadesPraticas: {
          descricao: `Atividades práticas relacionadas ao conteúdo da aula ${i + 1}`
        }
      });
    }

    return aulas;
  }

  private createDefaultDiagnosticos(quantidade: number, data: ProcessedSequenciaDidaticaData): any[] {
    console.log('🔧 [SEQUENCIA_DIDATICA_BUILDER] Criando diagnósticos padrão');

    const diagnosticos = [];
    for (let i = 0; i < quantidade; i++) {
      diagnosticos.push({
        id: `diagnostico-${i + 1}`,
        numero: i + 1,
        titulo: `Diagnóstico ${i + 1}: ${data.tituloTemaAssunto}`,
        objetivoAvaliativo: `Diagnosticar conhecimentos sobre ${data.tituloTemaAssunto}`,
        tipo: 'Diagnóstica',
        questoes: 10,
        formato: 'Múltipla escolha',
        tempoEstimado: '20 min',
        criteriosCorrecao: {
          excelente: '9-10 acertos',
          bom: '7-8 acertos',
          precisaMelhorar: '0-6 acertos'
        }
      });
    }

    return diagnosticos;
  }

  private createDefaultAvaliacoes(quantidade: number, data: ProcessedSequenciaDidaticaData): any[] {
    console.log('🔧 [SEQUENCIA_DIDATICA_BUILDER] Criando avaliações padrão');

    const avaliacoes = [];
    for (let i = 0; i < quantidade; i++) {
      avaliacoes.push({
        id: `avaliacao-${i + 1}`,
        numero: i + 1,
        titulo: `Avaliação ${i + 1}: ${data.tituloTemaAssunto}`,
        objetivoAvaliativo: `Avaliar aprendizagem sobre ${data.tituloTemaAssunto}`,
        tipo: i === 0 ? 'Formativa' : 'Somativa',
        questoes: 15,
        valorTotal: '10,0 pontos',
        tempoEstimado: '45 min',
        composicao: {
          multipplaEscolha: {
            quantidade: 10,
            pontos: '6,0 pontos'
          },
          discursivas: {
            quantidade: 3,
            pontos: '4,0 pontos'
          }
        },
        gabarito: 'Disponível para correção'
      });
    }

    return avaliacoes;
  }

  private createFallbackData(data: ProcessedSequenciaDidaticaData): any {
    console.log('🔧 [SEQUENCIA_DIDATICA_BUILDER] Criando dados de fallback');

    return {
      aulas: this.createDefaultAulas(parseInt(data.quantidadeAulas), data),
      diagnosticos: this.createDefaultDiagnosticos(parseInt(data.quantidadeDiagnosticos), data),
      avaliacoes: this.createDefaultAvaliacoes(parseInt(data.quantidadeAvaliacoes), data),
      cronogramaSugerido: {
        duracao: `${data.quantidadeAulas} aulas`,
        distribuicao: 'Sugerido: 2 aulas por semana',
        observacoes: 'Cronograma adaptável às necessidades da turma'
      }
    };
  }

  async saveSequencia(sequencia: BuiltSequenciaDidaticaData): Promise<void> {
    console.log('💾 [SEQUENCIA_DIDATICA_BUILDER] Salvando sequência:', sequencia.id);

    try {
      // Salvar no localStorage
      const storageKey = `activity_sequencia-didatica`;
      const storageData = {
        ...sequencia,
        savedAt: new Date().toISOString()
      };

      localStorage.setItem(storageKey, JSON.stringify(storageData));

      // Marcar como construída
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      constructedActivities['sequencia-didatica'] = {
        isBuilt: true,
        builtAt: new Date().toISOString(),
        dataKey: storageKey
      };
      localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));

      console.log('✅ [SEQUENCIA_DIDATICA_BUILDER] Sequência salva com sucesso');

    } catch (error) {
      console.error('❌ [SEQUENCIA_DIDATICA_BUILDER] Erro ao salvar:', error);
      throw new Error(`Erro ao salvar sequência: ${error.message}`);
    }
  }

  async loadSequencia(id: string): Promise<BuiltSequenciaDidaticaData | null> {
    console.log('📖 [SEQUENCIA_DIDATICA_BUILDER] Carregando sequência:', id);

    try {
      const storageKey = `activity_${id}`;
      const savedData = localStorage.getItem(storageKey);

      if (!savedData) {
        console.log('⚠️ [SEQUENCIA_DIDATICA_BUILDER] Sequência não encontrada no storage');
        return null;
      }

      const sequencia = JSON.parse(savedData);
      console.log('✅ [SEQUENCIA_DIDATICA_BUILDER] Sequência carregada com sucesso');

      return sequencia;

    } catch (error) {
      console.error('❌ [SEQUENCIA_DIDATICA_BUILDER] Erro ao carregar:', error);
      return null;
    }
  }
}

// Export singleton instance
export const sequenciaDidaticaBuilder = SequenciaDidaticaBuilder.getInstance();
