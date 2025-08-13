
import { processSequenciaDidaticaData, ProcessedSequenciaDidaticaData, validateSequenciaDidaticaData } from './sequenciaDidaticaProcessor';
import { buildSequenciaDidaticaPrompt, validatePromptData } from '../../prompts/sequenciaDidaticaPrompt';
import { GeminiClient } from '../../../../utils/api/geminiClient';
import { ActivityFormData } from '../../construction/types/ActivityTypes';

export interface SequenciaDidaticaBuildResult {
  success: boolean;
  data?: any;
  error?: string;
  debugInfo?: {
    processingSteps: string[];
    errors: string[];
    aiResponse?: string;
    timestamp: string;
  };
}

export class SequenciaDidaticaBuilder {
  private geminiClient: GeminiClient;
  private debugInfo: {
    processingSteps: string[];
    errors: string[];
    aiResponse?: string;
    timestamp: string;
  };

  constructor() {
    this.geminiClient = new GeminiClient();
    this.debugInfo = {
      processingSteps: [],
      errors: [],
      timestamp: new Date().toISOString()
    };
    
    console.log('🏗️ [SEQUENCIA_DIDATICA_BUILDER] Inicializado');
  }

  async build(formData: ActivityFormData, contextualizationData?: any): Promise<SequenciaDidaticaBuildResult> {
    console.log('🚀 [SEQUENCIA_DIDATICA_BUILDER] Iniciando construção da sequência didática');
    
    this.debugInfo.processingSteps.push('Início da construção');
    
    try {
      // Etapa 1: Processar dados do formulário
      this.debugInfo.processingSteps.push('Processando dados do formulário');
      console.log('📋 [SEQUENCIA_DIDATICA_BUILDER] Processando dados do formulário...');
      
      const processedData = processSequenciaDidaticaData(formData);
      
      if (!processedData.isComplete) {
        const error = `Dados incompletos: ${processedData.validationErrors.join(', ')}`;
        this.debugInfo.errors.push(error);
        console.error('❌ [SEQUENCIA_DIDATICA_BUILDER]', error);
        
        return {
          success: false,
          error,
          debugInfo: this.debugInfo
        };
      }

      this.debugInfo.processingSteps.push('Dados processados com sucesso');
      console.log('✅ [SEQUENCIA_DIDATICA_BUILDER] Dados processados:', processedData);

      // Etapa 2: Validar dados para o prompt
      this.debugInfo.processingSteps.push('Validando dados para o prompt');
      console.log('🔍 [SEQUENCIA_DIDATICA_BUILDER] Validando dados para o prompt...');
      
      const promptErrors = validatePromptData({
        ...processedData,
        contextualizationData
      });

      if (promptErrors.length > 0) {
        const error = `Erros de validação do prompt: ${promptErrors.join(', ')}`;
        this.debugInfo.errors.push(error);
        console.error('❌ [SEQUENCIA_DIDATICA_BUILDER]', error);
        
        return {
          success: false,
          error,
          debugInfo: this.debugInfo
        };
      }

      this.debugInfo.processingSteps.push('Validação do prompt concluída');

      // Etapa 3: Construir prompt para IA
      this.debugInfo.processingSteps.push('Construindo prompt para IA');
      console.log('📝 [SEQUENCIA_DIDATICA_BUILDER] Construindo prompt...');
      
      const prompt = buildSequenciaDidaticaPrompt({
        ...processedData,
        contextualizationData
      });

      console.log('📤 [SEQUENCIA_DIDATICA_BUILDER] Prompt construído, tamanho:', prompt.length);

      // Etapa 4: Chamar API Gemini
      this.debugInfo.processingSteps.push('Chamando API Gemini');
      console.log('🤖 [SEQUENCIA_DIDATICA_BUILDER] Enviando para API Gemini...');
      
      const geminiResponse = await this.geminiClient.generate({
        prompt,
        temperature: 0.7,
        maxTokens: 6000,
        topP: 0.9,
        topK: 40
      });

      if (!geminiResponse.success) {
        const error = `Erro na API Gemini: ${geminiResponse.error}`;
        this.debugInfo.errors.push(error);
        console.error('❌ [SEQUENCIA_DIDATICA_BUILDER]', error);
        
        return {
          success: false,
          error,
          debugInfo: this.debugInfo
        };
      }

      this.debugInfo.processingSteps.push('Resposta da API Gemini recebida');
      this.debugInfo.aiResponse = geminiResponse.content;
      console.log('📥 [SEQUENCIA_DIDATICA_BUILDER] Resposta da IA recebida, tamanho:', geminiResponse.content?.length);

      // Etapa 5: Processar resposta da IA
      this.debugInfo.processingSteps.push('Processando resposta da IA');
      console.log('🔄 [SEQUENCIA_DIDATICA_BUILDER] Processando resposta da IA...');
      
      const parsedData = this.parseAIResponse(geminiResponse.content);
      
      if (!parsedData) {
        const error = 'Falha ao processar resposta da IA - JSON inválido';
        this.debugInfo.errors.push(error);
        console.error('❌ [SEQUENCIA_DIDATICA_BUILDER]', error);
        
        return {
          success: false,
          error,
          debugInfo: this.debugInfo
        };
      }

      this.debugInfo.processingSteps.push('Resposta da IA processada com sucesso');

      // Etapa 6: Validar estrutura da resposta
      this.debugInfo.processingSteps.push('Validando estrutura da resposta');
      console.log('🔍 [SEQUENCIA_DIDATICA_BUILDER] Validando estrutura da resposta...');
      
      const validationResult = this.validateAIResponse(parsedData, processedData);
      
      if (!validationResult.isValid) {
        const error = `Resposta da IA inválida: ${validationResult.errors.join(', ')}`;
        this.debugInfo.errors.push(error);
        console.error('❌ [SEQUENCIA_DIDATICA_BUILDER]', error);
        
        return {
          success: false,
          error,
          debugInfo: this.debugInfo
        };
      }

      this.debugInfo.processingSteps.push('Validação da estrutura concluída');

      // Etapa 7: Finalizar dados
      this.debugInfo.processingSteps.push('Finalizando dados');
      const finalData = {
        ...parsedData,
        generatedAt: new Date().toISOString(),
        inputData: processedData,
        isGeneratedByAI: true,
        debugInfo: this.debugInfo
      };

      console.log('✅ [SEQUENCIA_DIDATICA_BUILDER] Sequência didática construída com sucesso!');
      this.debugInfo.processingSteps.push('Construção finalizada com sucesso');

      return {
        success: true,
        data: finalData,
        debugInfo: this.debugInfo
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.debugInfo.errors.push(`Erro crítico: ${errorMessage}`);
      console.error('💥 [SEQUENCIA_DIDATICA_BUILDER] Erro crítico:', error);
      
      return {
        success: false,
        error: `Erro crítico na construção: ${errorMessage}`,
        debugInfo: this.debugInfo
      };
    }
  }

  private parseAIResponse(content?: string): any | null {
    if (!content) {
      console.error('❌ [SEQUENCIA_DIDATICA_BUILDER] Conteúdo da IA vazio');
      return null;
    }

    try {
      // Tentar parse direto primeiro
      console.log('🔄 [SEQUENCIA_DIDATICA_BUILDER] Tentando parse direto do JSON...');
      return JSON.parse(content);
      
    } catch (firstError) {
      console.log('⚠️ [SEQUENCIA_DIDATICA_BUILDER] Parse direto falhou, tentando extrair JSON...');
      
      try {
        // Tentar extrair JSON do conteúdo
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const extractedJson = jsonMatch[0];
          console.log('🔄 [SEQUENCIA_DIDATICA_BUILDER] JSON extraído, tentando parse...');
          return JSON.parse(extractedJson);
        }
        
        // Tentar encontrar entre ```json
        const codeBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
          console.log('🔄 [SEQUENCIA_DIDATICA_BUILDER] JSON encontrado em code block...');
          return JSON.parse(codeBlockMatch[1]);
        }
        
        throw new Error('Nenhum JSON válido encontrado no conteúdo');
        
      } catch (secondError) {
        console.error('❌ [SEQUENCIA_DIDATICA_BUILDER] Falha completa no parse:', {
          firstError: firstError.message,
          secondError: secondError.message,
          contentPreview: content.substring(0, 500)
        });
        return null;
      }
    }
  }

  private validateAIResponse(data: any, processedData: ProcessedSequenciaDidaticaData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    console.log('🔍 [SEQUENCIA_DIDATICA_BUILDER] Validando resposta da IA...');

    // Validar estrutura básica
    if (!data || typeof data !== 'object') {
      errors.push('Resposta não é um objeto válido');
      return { isValid: false, errors };
    }

    // Validar metadados - mais flexível
    if (!data.metadados && !data.metadata) {
      console.warn('⚠️ [SEQUENCIA_DIDATICA_BUILDER] Metadados ausentes, criando estrutura básica...');
      data.metadados = {
        titulo: processedData.tituloTemaAssunto || 'Sequência Didática',
        disciplina: processedData.disciplina || 'Educação',
        anoSerie: processedData.anoSerie || 'Ensino Fundamental',
        objetivos: processedData.objetivosAprendizagem || 'Objetivos de aprendizagem'
      };
    }

    // Validar aulas - mais flexível
    if (!Array.isArray(data.aulas)) {
      console.warn('⚠️ [SEQUENCIA_DIDATICA_BUILDER] Aulas não é array, criando estrutura...');
      data.aulas = [];
      const expectedAulas = parseInt(processedData.quantidadeAulas) || 1;
      for (let i = 1; i <= expectedAulas; i++) {
        data.aulas.push({
          numero: i,
          titulo: `Aula ${i}`,
          duracao: '50 minutos',
          objetivos: [`Objetivo da aula ${i}`],
          conteudo: `Conteúdo da aula ${i}`,
          atividades: [`Atividade da aula ${i}`],
          recursos: ['Recursos necessários'],
          avaliacao: 'Avaliação formativa'
        });
      }
    }

    // Validar diagnósticos - mais flexível
    if (!Array.isArray(data.diagnosticos)) {
      console.warn('⚠️ [SEQUENCIA_DIDATICA_BUILDER] Diagnósticos não é array, criando estrutura...');
      data.diagnosticos = [];
      const expectedDiag = parseInt(processedData.quantidadeDiagnosticos) || 1;
      for (let i = 1; i <= expectedDiag; i++) {
        data.diagnosticos.push({
          titulo: `Diagnóstico ${i}`,
          descricao: `Avaliação diagnóstica ${i}`,
          tipo: 'Diagnóstica',
          instrumentos: ['Questionário', 'Observação'],
          criterios: ['Participação', 'Compreensão']
        });
      }
    }

    // Validar avaliações - mais flexível
    if (!Array.isArray(data.avaliacoes)) {
      console.warn('⚠️ [SEQUENCIA_DIDATICA_BUILDER] Avaliações não é array, criando estrutura...');
      data.avaliacoes = [];
      const expectedAval = parseInt(processedData.quantidadeAvaliacoes) || 1;
      for (let i = 1; i <= expectedAval; i++) {
        data.avaliacoes.push({
          titulo: `Avaliação ${i}`,
          descricao: `Avaliação formativa ${i}`,
          tipo: 'Formativa',
          instrumentos: ['Prova', 'Atividade prática'],
          criterios: ['Conhecimento', 'Aplicação'],
          peso: 1
        });
      }
    }

    // Após correções automáticas, validar novamente
    const hasValidStructure = 
      data.metadados && 
      Array.isArray(data.aulas) && 
      Array.isArray(data.diagnosticos) && 
      Array.isArray(data.avaliacoes);

    if (!hasValidStructure) {
      errors.push('Estrutura básica inválida mesmo após correções automáticas');
    }

    const isValid = errors.length === 0;
    
    console.log(`${isValid ? '✅' : '❌'} [SEQUENCIA_DIDATICA_BUILDER] Validação da resposta:`, {
      isValid,
      errorsCount: errors.length,
      errors,
      structure: {
        hasMetadados: !!data.metadados,
        aulasCount: data.aulas?.length || 0,
        diagnosticosCount: data.diagnosticos?.length || 0,
        avaliacoesCount: data.avaliacoes?.length || 0
      }
    });

    return { isValid, errors };
  }

  async buildSequenciaDidatica(formData: ActivityFormData, contextualizationData?: any): Promise<SequenciaDidaticaBuildResult> {
    console.log('🔄 [SEQUENCIA_DIDATICA_BUILDER] Método buildSequenciaDidatica chamado');
    return this.build(formData, contextualizationData);
  }

  // Método para validar dados do formulário
  validateFormData(formData: ActivityFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!formData.tituloTemaAssunto?.trim()) {
      errors.push('Título do tema/assunto é obrigatório');
    }

    if (!formData.disciplina?.trim()) {
      errors.push('Disciplina é obrigatória');
    }

    if (!formData.anoSerie?.trim()) {
      errors.push('Ano/Série é obrigatório');
    }

    if (!formData.publicoAlvo?.trim()) {
      errors.push('Público-alvo é obrigatório');
    }

    if (!formData.objetivosAprendizagem?.trim()) {
      errors.push('Objetivos de aprendizagem são obrigatórios');
    }

    if (!formData.quantidadeAulas?.trim()) {
      errors.push('Quantidade de aulas é obrigatória');
    }

    if (!formData.quantidadeDiagnosticos?.trim()) {
      errors.push('Quantidade de diagnósticos é obrigatória');
    }

    if (!formData.quantidadeAvaliacoes?.trim()) {
      errors.push('Quantidade de avaliações é obrigatória');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  getDebugInfo() {
    return this.debugInfo;
  }
}

// Export default instance
export const sequenciaDidaticaBuilder = new SequenciaDidaticaBuilder();
