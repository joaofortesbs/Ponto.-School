
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
  
  public static getInstance(): SequenciaDidaticaBuilder {
    if (!SequenciaDidaticaBuilder.instance) {
      SequenciaDidaticaBuilder.instance = new SequenciaDidaticaBuilder();
    }
    return SequenciaDidaticaBuilder.instance;
  }

  async buildSequenciaDidatica(formData: ActivityFormData): Promise<BuiltSequenciaDidaticaData> {
    console.log('🏗️ [SEQUENCIA_DIDATICA_BUILDER] Iniciando construção:', formData);

    try {
      // Processar e validar dados
      const processedData = processSequenciaDidaticaData(formData);
      
      if (!processedData.isComplete) {
        console.error('❌ [SEQUENCIA_DIDATICA_BUILDER] Dados incompletos:', processedData.validationErrors);
        throw new Error(`Dados incompletos: ${processedData.validationErrors.join(', ')}`);
      }

      console.log('✅ [SEQUENCIA_DIDATICA_BUILDER] Dados validados, iniciando geração com IA...');

      // Gerar conteúdo com IA usando Gemini
      const sequenciaGerada = await this.generateWithGemini(processedData);

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
        aulas: sequenciaGerada.aulas || this.createDefaultAulas(parseInt(processedData.quantidadeAulas)),
        diagnosticos: sequenciaGerada.diagnosticos || this.createDefaultDiagnosticos(parseInt(processedData.quantidadeDiagnosticos)),
        avaliacoes: sequenciaGerada.avaliacoes || this.createDefaultAvaliacoes(parseInt(processedData.quantidadeAvaliacoes)),
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
    console.log('🤖 [SEQUENCIA_DIDATICA_BUILDER] Gerando com Gemini API...');

    try {
      // Construir prompt específico
      const prompt = buildSequenciaDidaticaPrompt({
        tituloTemaAssunto: data.tituloTemaAssunto,
        anoSerie: data.anoSerie,
        disciplina: data.disciplina,
        bnccCompetencias: data.bnccCompetencias,
        publicoAlvo: data.publicoAlvo,
        objetivosAprendizagem: data.objetivosAprendizagem,
        quantidadeAulas: data.quantidadeAulas,
        quantidadeDiagnosticos: data.quantidadeDiagnosticos,
        quantidadeAvaliacoes: data.quantidadeAvaliacoes,
        cronograma: data.cronograma
      });

      console.log('📝 [SEQUENCIA_DIDATICA_BUILDER] Prompt gerado, enviando para Gemini...');

      // Chamar API Gemini
      const response = await geminiClient.generate({
        prompt,
        temperature: 0.7,
        maxTokens: 4000,
        topP: 0.9,
        topK: 40
      });

      if (!response.success) {
        throw new Error(`Erro na API Gemini: ${response.error}`);
      }

      console.log('✅ [SEQUENCIA_DIDATICA_BUILDER] Resposta recebida do Gemini');
      console.log('📄 [SEQUENCIA_DIDATICA_BUILDER] Resposta bruta:', response.content.substring(0, 500) + '...');

      // Processar resposta com múltiplas tentativas
      let sequenciaData;
      try {
        // Primeira tentativa: remover markdown e parsear
        let cleanedResponse = response.content.replace(/```json|```/g, '').trim();
        
        // Segunda tentativa: limpar caracteres problemáticos
        cleanedResponse = cleanedResponse
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove caracteres de controle
          .replace(/,(\s*[}\]])/g, '$1') // Remove vírgulas órfãs
          .replace(/([}\]])(\s*)([{[])/g, '$1,$2$3'); // Adiciona vírgulas entre objetos/arrays

        // Tentar parsear diretamente
        sequenciaData = JSON.parse(cleanedResponse);
        
        // Verificar se tem a estrutura esperada
        if (sequenciaData.sequenciaDidatica) {
          sequenciaData = sequenciaData.sequenciaDidatica;
        }

      } catch (parseError) {
        console.error('❌ [SEQUENCIA_DIDATICA_BUILDER] Erro ao parsear resposta (primeira tentativa):', parseError);
        
        try {
          // Terceira tentativa: extrair JSON válido com regex mais robusto
          const jsonMatches = response.content.match(/\{(?:[^{}]|{(?:[^{}]|{[^{}]*})*})*\}/g);
          if (jsonMatches && jsonMatches.length > 0) {
            // Tentar o maior JSON encontrado
            const largestJson = jsonMatches.reduce((a, b) => a.length > b.length ? a : b);
            sequenciaData = JSON.parse(largestJson);
            
            if (sequenciaData.sequenciaDidatica) {
              sequenciaData = sequenciaData.sequenciaDidatica;
            }
          } else {
            throw new Error('Nenhum JSON válido encontrado na resposta da IA');
          }
        } catch (secondError) {
          console.error('❌ [SEQUENCIA_DIDATICA_BUILDER] Erro ao parsear resposta (segunda tentativa):', secondError);
          
          // Quarta tentativa: usar dados padrão estruturados
          console.log('⚠️ [SEQUENCIA_DIDATICA_BUILDER] Usando estrutura padrão devido a erro de parsing');
          sequenciaData = this.createFallbackSequenciaData(data);
        }
      }

      // Validar estrutura mínima dos dados
      if (!sequenciaData.aulas) {
        sequenciaData.aulas = this.createDefaultAulas(parseInt(data.quantidadeAulas));
      }
      if (!sequenciaData.diagnosticos) {
        sequenciaData.diagnosticos = this.createDefaultDiagnosticos(parseInt(data.quantidadeDiagnosticos));
      }
      if (!sequenciaData.avaliacoes) {
        sequenciaData.avaliacoes = this.createDefaultAvaliacoes(parseInt(data.quantidadeAvaliacoes));
      }

      console.log('✅ [SEQUENCIA_DIDATICA_BUILDER] Dados processados com sucesso');
      console.log('📊 [SEQUENCIA_DIDATICA_BUILDER] Estrutura final:', {
        aulas: sequenciaData.aulas?.length || 0,
        diagnosticos: sequenciaData.diagnosticos?.length || 0,
        avaliacoes: sequenciaData.avaliacoes?.length || 0
      });

      return sequenciaData;

    } catch (error) {
      console.error('❌ [SEQUENCIA_DIDATICA_BUILDER] Erro na geração com Gemini:', error);
      // Retornar dados padrão em caso de erro total
      console.log('🔄 [SEQUENCIA_DIDATICA_BUILDER] Retornando dados padrão devido a erro');
      return this.createFallbackSequenciaData(data);
    }
  }

  private createFallbackSequenciaData(data: ProcessedSequenciaDidaticaData): any {
    return {
      aulas: this.createDefaultAulas(parseInt(data.quantidadeAulas)),
      diagnosticos: this.createDefaultDiagnosticos(parseInt(data.quantidadeDiagnosticos)),
      avaliacoes: this.createDefaultAvaliacoes(parseInt(data.quantidadeAvaliacoes)),
      cronogramaSugerido: {
        duracao: `${data.quantidadeAulas} aulas`,
        distribuicao: 'Distribuição flexível conforme calendário escolar',
        observacoes: 'Cronograma adaptável às necessidades da turma'
      },
      tituloTemaAssunto: data.tituloTemaAssunto,
      disciplina: data.disciplina,
      anoSerie: data.anoSerie,
      publicoAlvo: data.publicoAlvo,
      objetivosAprendizagem: data.objetivosAprendizagem
    };
  }

  private async saveSequencia(data: BuiltSequenciaDidaticaData): Promise<void> {
    try {
      const storageKey = `constructed_sequencia-didatica_${data.activityId}`;
      localStorage.setItem(storageKey, JSON.stringify(data));
      
      console.log('💾 [SEQUENCIA_DIDATICA_BUILDER] Sequência salva no localStorage:', storageKey);
    } catch (error) {
      console.error('❌ [SEQUENCIA_DIDATICA_BUILDER] Erro ao salvar:', error);
    }
  }

  private async loadSequencia(activityId: string): Promise<any> {
    try {
      const storageKey = `constructed_sequencia-didatica_${activityId}`;
      const data = localStorage.getItem(storageKey);
      
      if (data) {
        return JSON.parse(data);
      }
      
      return null;
    } catch (error) {
      console.error('❌ [SEQUENCIA_DIDATICA_BUILDER] Erro ao carregar:', error);
      return null;
    }
  }

  public createDefaultAulas(quantidade: number): any[] {
    const aulas = [];
    for (let i = 1; i <= quantidade; i++) {
      aulas.push({
        id: `aula-${i}`,
        numero: i,
        titulo: `Aula ${i} - Desenvolvimento do Tema`,
        objetivoEspecifico: `Objetivo específico da aula ${i}`,
        resumoContexto: `Contextualização e desenvolvimento dos conceitos principais da aula ${i}`,
        tempoEstimado: "50 min",
        etapas: {
          introducao: {
            tempo: "10 min",
            descricao: "Introdução aos conceitos da aula"
          },
          desenvolvimento: {
            tempo: "30 min",
            descricao: "Desenvolvimento dos conteúdos principais"
          },
          fechamento: {
            tempo: "10 min",
            descricao: "Síntese e conclusão da aula"
          }
        },
        recursos: ["Quadro", "Material didático", "Projetor"],
        atividadesPraticas: {
          tipo: "Exercícios práticos",
          descricao: "Atividades para consolidação do aprendizado",
          tempo: "15 min"
        }
      });
    }
    return aulas;
  }

  public createDefaultDiagnosticos(quantidade: number): any[] {
    const diagnosticos = [];
    for (let i = 1; i <= quantidade; i++) {
      diagnosticos.push({
        id: `diagnostico-${i}`,
        numero: i,
        titulo: `Diagnóstico ${i} - Avaliação Formativa`,
        objetivoAvaliativo: `Verificar o nível de compreensão dos conceitos apresentados`,
        tipo: "Quiz Diagnóstico",
        tempoEstimado: "20 min",
        questoes: "5 questões",
        formato: "Múltipla escolha",
        criteriosCorrecao: {
          excelente: "4-5 acertos: Excelente compreensão",
          bom: "3 acertos: Boa compreensão",
          precisaMelhorar: "<3 acertos: Necessita reforço"
        }
      });
    }
    return diagnosticos;
  }

  public createDefaultAvaliacoes(quantidade: number): any[] {
    const avaliacoes = [];
    for (let i = 1; i <= quantidade; i++) {
      avaliacoes.push({
        id: `avaliacao-${i}`,
        numero: i,
        titulo: `Avaliação ${i} - Prova Somativa`,
        objetivoAvaliativo: `Avaliar o aprendizado adquirido durante o período`,
        tipo: "Prova Escrita",
        tempoEstimado: "45 min",
        questoes: "10 questões",
        valorTotal: "10,0 pontos",
        composicao: {
          multipplaEscolha: {
            quantidade: 6,
            pontos: "6,0 pts"
          },
          discursivas: {
            quantidade: 4,
            pontos: "4,0 pts"
          }
        },
        criteriosCorrecao: "Critérios baseados na BNCC e objetivos de aprendizagem",
        gabarito: "Gabarito disponível para correção"
      });
    }
    return avaliacoes;
  }

  static async regenerateSequencia(activityId: string, newData: any): Promise<any> {
    console.log('🔄 [SEQUENCIA_DIDATICA_BUILDER] Regenerando:', activityId);

    try {
      const instance = SequenciaDidaticaBuilder.getInstance();
      const existingData = await instance.loadSequencia(activityId);
      const mergedData = { ...existingData, ...newData };
      return await instance.buildSequenciaDidatica(mergedData);
    } catch (error) {
      console.error('❌ [SEQUENCIA_DIDATICA_BUILDER] Erro ao regenerar:', error);
      throw error;
    }
  }
}

// Exportar instância singleton
export const sequenciaDidaticaBuilder = SequenciaDidaticaBuilder.getInstance();
