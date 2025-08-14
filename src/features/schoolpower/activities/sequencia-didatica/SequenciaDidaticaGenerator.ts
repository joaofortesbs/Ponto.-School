
import { GeminiClient } from '@/utils/api/geminiClient';
import { buildSequenciaDidaticaPrompt, SequenciaDidaticaPromptData } from '../../prompts/sequenciaDidaticaPrompt';

export interface SequenciaDidaticaGeneratedContent {
  sequenciaDidatica: {
    titulo: string;
    disciplina: string;
    anoSerie: string;
    cargaHoraria: string;
    descricaoGeral: string;
    aulas: Array<{
      id: string;
      tipo: 'Aula';
      titulo: string;
      objetivo: string;
      resumo: string;
      duracaoEstimada?: string;
      materiaisNecessarios?: string[];
      metodologia?: string;
      avaliacaoFormativa?: string;
    }>;
    diagnosticos: Array<{
      id: string;
      tipo: 'Diagnostico';
      titulo: string;
      objetivo: string;
      resumo: string;
      instrumentos?: string[];
      momentoAplicacao?: string;
    }>;
    avaliacoes: Array<{
      id: string;
      tipo: 'Avaliacao';
      titulo: string;
      objetivo: string;
      resumo: string;
      criteriosAvaliacao?: string[];
      instrumentos?: string[];
      valorPontuacao?: string;
    }>;
  };
  metadados: {
    totalAulas: number;
    totalDiagnosticos: number;
    totalAvaliacoes: number;
    competenciasBNCC: string;
    objetivosGerais: string;
    generatedAt: string;
    isGeneratedByAI: boolean;
  };
}

export class SequenciaDidaticaGenerator {
  private geminiClient: GeminiClient;

  constructor() {
    this.geminiClient = new GeminiClient();
  }

  async generateSequenciaDidatica(
    promptData: SequenciaDidaticaPromptData
  ): Promise<SequenciaDidaticaGeneratedContent> {
    try {
      console.log('🚀 Iniciando geração de Sequência Didática com Gemini...');
      console.log('📋 Dados recebidos:', promptData);

      // Validar dados de entrada
      this.validateInputData(promptData);

      // Construir prompt específico
      const prompt = buildSequenciaDidaticaPrompt(promptData);
      console.log('📝 Prompt construído para Sequência Didática');

      // Chamar API Gemini
      const response = await this.geminiClient.generate({
        prompt,
        temperature: 0.7,
        maxTokens: 6000, // Aumentado para sequências didáticas mais complexas
        topP: 0.9,
        topK: 40
      });

      if (!response.success) {
        throw new Error(response.error || 'Erro na API Gemini');
      }

      console.log('✅ Resposta recebida do Gemini');
      console.log('📊 Estimativa de tokens:', response.estimatedTokens);

      // Processar resposta da IA
      const generatedContent = this.parseGeminiResponse(response.result || response.content);

      // Validar conteúdo gerado
      this.validateGeneratedContent(generatedContent, promptData);

      console.log('✅ Sequência Didática gerada com sucesso');
      return generatedContent;

    } catch (error) {
      console.error('❌ Erro na geração da Sequência Didática:', error);
      throw new Error(`Falha na geração: ${error.message}`);
    }
  }

  private validateInputData(data: SequenciaDidaticaPromptData): void {
    const requiredFields = [
      'tituloTemaAssunto',
      'anoSerie', 
      'disciplina',
      'publicoAlvo',
      'objetivosAprendizagem',
      'quantidadeAulas',
      'quantidadeDiagnosticos',
      'quantidadeAvaliacoes'
    ];

    for (const field of requiredFields) {
      if (!data[field] || data[field].trim() === '') {
        throw new Error(`Campo obrigatório não preenchido: ${field}`);
      }
    }

    // Validar números
    const aulas = parseInt(data.quantidadeAulas);
    const diagnosticos = parseInt(data.quantidadeDiagnosticos);
    const avaliacoes = parseInt(data.quantidadeAvaliacoes);

    if (isNaN(aulas) || aulas < 1) {
      throw new Error('Quantidade de aulas deve ser um número maior que 0');
    }
    if (isNaN(diagnosticos) || diagnosticos < 0) {
      throw new Error('Quantidade de diagnósticos deve ser um número maior ou igual a 0');
    }
    if (isNaN(avaliacoes) || avaliacoes < 0) {
      throw new Error('Quantidade de avaliações deve ser um número maior ou igual a 0');
    }
  }

  private parseGeminiResponse(responseContent: string): SequenciaDidaticaGeneratedContent {
    try {
      // Limpar resposta removendo caracteres indesejados
      let cleanedResponse = responseContent.trim();
      
      // Remover markdown se presente
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\s*/, '').replace(/\s*```$/, '');
      }
      
      // Remover qualquer texto antes ou depois do JSON
      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('JSON não encontrado na resposta');
      }
      
      cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd);
      
      console.log('🔄 Tentando fazer parse da resposta JSON...');
      const parsedContent = JSON.parse(cleanedResponse);
      
      // Verificar estrutura básica
      if (!parsedContent.sequenciaDidatica || !parsedContent.metadados) {
        throw new Error('Estrutura JSON inválida: faltam campos obrigatórios');
      }
      
      return parsedContent as SequenciaDidaticaGeneratedContent;
      
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse da resposta:', parseError);
      console.error('📄 Resposta que causou erro:', responseContent.substring(0, 500));
      
      // Tentar extrair JSON de forma mais agressiva
      try {
        const jsonPattern = /\{[\s\S]*\}/;
        const match = responseContent.match(jsonPattern);
        
        if (match) {
          const extractedJson = match[0];
          console.log('🔄 Tentando JSON extraído...');
          const secondAttempt = JSON.parse(extractedJson);
          
          if (secondAttempt.sequenciaDidatica && secondAttempt.metadados) {
            return secondAttempt as SequenciaDidaticaGeneratedContent;
          }
        }
      } catch (secondError) {
        console.error('❌ Segunda tentativa de parse também falhou:', secondError);
      }
      
      throw new Error(`Erro ao processar resposta da IA: ${parseError.message}`);
    }
  }

  private validateGeneratedContent(
    content: SequenciaDidaticaGeneratedContent, 
    originalData: SequenciaDidaticaPromptData
  ): void {
    const { sequenciaDidatica, metadados } = content;
    
    // Verificar se as quantidades batem
    const expectedAulas = parseInt(originalData.quantidadeAulas);
    const expectedDiagnosticos = parseInt(originalData.quantidadeDiagnosticos);
    const expectedAvaliacoes = parseInt(originalData.quantidadeAvaliacoes);
    
    if (sequenciaDidatica.aulas?.length !== expectedAulas) {
      console.warn(`⚠️ Quantidade de aulas geradas (${sequenciaDidatica.aulas?.length}) diferente do esperado (${expectedAulas})`);
    }
    
    if (sequenciaDidatica.diagnosticos?.length !== expectedDiagnosticos) {
      console.warn(`⚠️ Quantidade de diagnósticos gerados (${sequenciaDidatica.diagnosticos?.length}) diferente do esperado (${expectedDiagnosticos})`);
    }
    
    if (sequenciaDidatica.avaliacoes?.length !== expectedAvaliacoes) {
      console.warn(`⚠️ Quantidade de avaliações geradas (${sequenciaDidatica.avaliacoes?.length}) diferente do esperado (${expectedAvaliacoes})`);
    }
    
    // Verificar campos obrigatórios
    if (!sequenciaDidatica.titulo || !sequenciaDidatica.disciplina) {
      throw new Error('Conteúdo gerado inválido: faltam campos básicos');
    }
    
    // Marcar como gerado pela IA
    metadados.isGeneratedByAI = true;
    metadados.generatedAt = new Date().toISOString();
    
    console.log('✅ Conteúdo validado com sucesso');
  }
}

export const sequenciaDidaticaGenerator = new SequenciaDidaticaGenerator();
