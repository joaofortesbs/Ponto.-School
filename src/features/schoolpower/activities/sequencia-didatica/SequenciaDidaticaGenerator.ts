
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

      // Construir prompt específico para Sequência Didática
      const prompt = buildSequenciaDidaticaPrompt(promptData);
      console.log('📝 Prompt construído para Sequência Didática');

      // Chamar API Gemini com configurações otimizadas
      const response = await this.geminiClient.generate({
        prompt,
        temperature: 0.8, // Mais criatividade para conteúdo educacional
        maxTokens: 8000, // Aumentado para sequências didáticas complexas
        topP: 0.9,
        topK: 40
      });

      if (!response.success) {
        console.error('❌ Erro na API Gemini:', response.error);
        throw new Error(response.error || 'Erro na API Gemini');
      }

      console.log('✅ Resposta recebida do Gemini');
      console.log('📊 Estimativa de tokens:', response.estimatedTokens);
      console.log('💰 Custo estimado:', response.estimatedPowerCost);

      // Processar resposta da IA
      const generatedContent = this.parseGeminiResponse(response.result || response.content);

      // Validar conteúdo gerado
      this.validateGeneratedContent(generatedContent, promptData);

      // Salvar no localStorage para futuras visualizações
      const storageKey = `sequencia_didatica_cache_${Date.now()}`;
      localStorage.setItem(storageKey, JSON.stringify(generatedContent));

      console.log('✅ Sequência Didática gerada com sucesso');
      return generatedContent;

    } catch (error) {
      console.error('❌ Erro na geração da Sequência Didática:', error);
      
      // Em caso de erro, retornar estrutura básica
      const fallbackContent = this.createFallbackContent(promptData);
      console.log('🔄 Usando conteúdo de fallback');
      
      return fallbackContent;
    }
  }

  private validateInputData(data: SequenciaDidaticaPromptData): void {
    console.log('🔍 Validando dados de entrada...');
    
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

    const missingFields = [];
    for (const field of requiredFields) {
      if (!data[field] || data[field].trim() === '') {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      console.error('❌ Campos obrigatórios ausentes:', missingFields);
      throw new Error(`Campos obrigatórios não preenchidos: ${missingFields.join(', ')}`);
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

    console.log('✅ Dados validados com sucesso');
  }

  private parseGeminiResponse(responseContent: string): SequenciaDidaticaGeneratedContent {
    try {
      console.log('🔄 Fazendo parse da resposta do Gemini...');
      console.log('📄 Resposta bruta (primeiros 500 chars):', responseContent.substring(0, 500));
      
      // Limpar resposta removendo caracteres indesejados
      let cleanedResponse = responseContent.trim();
      
      // Remover markdown se presente
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\s*/, '').replace(/\s*```$/, '');
      }
      
      if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Buscar JSON na resposta
      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        console.error('❌ JSON não encontrado na resposta');
        throw new Error('JSON não encontrado na resposta');
      }
      
      cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd);
      console.log('🔄 JSON extraído (primeiros 300 chars):', cleanedResponse.substring(0, 300));
      
      const parsedContent = JSON.parse(cleanedResponse);
      
      // Verificar estrutura básica
      if (!parsedContent.sequenciaDidatica && !parsedContent.aulas) {
        console.error('❌ Estrutura JSON inválida');
        throw new Error('Estrutura JSON inválida: faltam campos obrigatórios');
      }
      
      // Normalizar estrutura se necessário
      if (!parsedContent.sequenciaDidatica && parsedContent.aulas) {
        console.log('🔄 Normalizando estrutura da resposta');
        const normalizedContent = {
          sequenciaDidatica: parsedContent,
          metadados: parsedContent.metadados || {
            totalAulas: parsedContent.aulas?.length || 0,
            totalDiagnosticos: parsedContent.diagnosticos?.length || 0,
            totalAvaliacoes: parsedContent.avaliacoes?.length || 0,
            competenciasBNCC: parsedContent.competenciasBNCC || '',
            objetivosGerais: parsedContent.objetivosGerais || '',
            isGeneratedByAI: true,
            generatedAt: new Date().toISOString()
          }
        };
        return normalizedContent as SequenciaDidaticaGeneratedContent;
      }
      
      console.log('✅ Parse da resposta concluído com sucesso');
      return parsedContent as SequenciaDidaticaGeneratedContent;
      
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse da resposta:', parseError);
      console.error('📄 Resposta que causou erro:', responseContent.substring(0, 1000));
      
      // Tentar extrair JSON de forma mais agressiva
      try {
        console.log('🔄 Tentando extração agressiva de JSON...');
        const jsonPattern = /\{[\s\S]*\}/;
        const match = responseContent.match(jsonPattern);
        
        if (match) {
          const extractedJson = match[0];
          console.log('🔄 JSON extraído agressivamente');
          const secondAttempt = JSON.parse(extractedJson);
          
          // Normalizar estrutura
          if (secondAttempt.aulas || secondAttempt.sequenciaDidatica) {
            const normalizedContent = {
              sequenciaDidatica: secondAttempt.sequenciaDidatica || secondAttempt,
              metadados: secondAttempt.metadados || {
                totalAulas: (secondAttempt.aulas || secondAttempt.sequenciaDidatica?.aulas)?.length || 0,
                totalDiagnosticos: (secondAttempt.diagnosticos || secondAttempt.sequenciaDidatica?.diagnosticos)?.length || 0,
                totalAvaliacoes: (secondAttempt.avaliacoes || secondAttempt.sequenciaDidatica?.avaliacoes)?.length || 0,
                isGeneratedByAI: true,
                generatedAt: new Date().toISOString()
              }
            };
            console.log('✅ Segunda tentativa de parse bem sucedida');
            return normalizedContent as SequenciaDidaticaGeneratedContent;
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
    console.log('🔍 Validando conteúdo gerado...');
    
    const { sequenciaDidatica, metadados } = content;
    
    if (!sequenciaDidatica) {
      throw new Error('Conteúdo de sequência didática não encontrado');
    }
    
    // Verificar se as quantidades batem (aproximadamente)
    const expectedAulas = parseInt(originalData.quantidadeAulas);
    const expectedDiagnosticos = parseInt(originalData.quantidadeDiagnosticos);
    const expectedAvaliacoes = parseInt(originalData.quantidadeAvaliacoes);
    
    const actualAulas = sequenciaDidatica.aulas?.length || 0;
    const actualDiagnosticos = sequenciaDidatica.diagnosticos?.length || 0;
    const actualAvaliacoes = sequenciaDidatica.avaliacoes?.length || 0;
    
    if (Math.abs(actualAulas - expectedAulas) > 1) {
      console.warn(`⚠️ Quantidade de aulas geradas (${actualAulas}) difere significativamente do esperado (${expectedAulas})`);
    }
    
    if (Math.abs(actualDiagnosticos - expectedDiagnosticos) > 1) {
      console.warn(`⚠️ Quantidade de diagnósticos gerados (${actualDiagnosticos}) difere do esperado (${expectedDiagnosticos})`);
    }
    
    if (Math.abs(actualAvaliacoes - expectedAvaliacoes) > 1) {
      console.warn(`⚠️ Quantidade de avaliações geradas (${actualAvaliacoes}) difere do esperado (${expectedAvaliacoes})`);
    }
    
    // Verificar campos obrigatórios
    if (!sequenciaDidatica.titulo || !sequenciaDidatica.disciplina) {
      console.warn('⚠️ Alguns campos básicos estão ausentes, mas continuando...');
    }
    
    // Garantir metadados
    if (!metadados) {
      content.metadados = {
        totalAulas: actualAulas,
        totalDiagnosticos: actualDiagnosticos,
        totalAvaliacoes: actualAvaliacoes,
        competenciasBNCC: originalData.bnccCompetencias || '',
        objetivosGerais: originalData.objetivosAprendizagem || '',
        isGeneratedByAI: true,
        generatedAt: new Date().toISOString()
      };
    }
    
    // Marcar como gerado pela IA
    content.metadados.isGeneratedByAI = true;
    content.metadados.generatedAt = new Date().toISOString();
    
    console.log('✅ Conteúdo validado com sucesso');
    console.log('📊 Estatísticas finais:', {
      aulas: actualAulas,
      diagnosticos: actualDiagnosticos,
      avaliacoes: actualAvaliacoes
    });
  }

  private createFallbackContent(promptData: SequenciaDidaticaPromptData): SequenciaDidaticaGeneratedContent {
    console.log('🔄 Criando conteúdo de fallback...');
    
    const quantidadeAulas = parseInt(promptData.quantidadeAulas);
    const quantidadeDiagnosticos = parseInt(promptData.quantidadeDiagnosticos);
    const quantidadeAvaliacoes = parseInt(promptData.quantidadeAvaliacoes);
    
    // Gerar aulas básicas
    const aulas = Array.from({ length: quantidadeAulas }, (_, index) => ({
      id: `aula-${index + 1}`,
      tipo: 'Aula' as const,
      titulo: `Aula ${index + 1}: ${promptData.tituloTemaAssunto}`,
      objetivo: `Objetivo da aula ${index + 1} sobre ${promptData.tituloTemaAssunto}`,
      resumo: `Esta aula aborda aspectos importantes de ${promptData.tituloTemaAssunto} para ${promptData.publicoAlvo}`,
      duracaoEstimada: '50 minutos',
      materiaisNecessarios: ['Quadro', 'Material didático', 'Recursos audiovisuais'],
      metodologia: 'Aula expositiva e interativa',
      avaliacaoFormativa: 'Participação e exercícios em sala'
    }));
    
    // Gerar diagnósticos básicos
    const diagnosticos = Array.from({ length: quantidadeDiagnosticos }, (_, index) => ({
      id: `diagnostico-${index + 1}`,
      tipo: 'Diagnostico' as const,
      titulo: `Diagnóstico ${index + 1}: Avaliação Inicial`,
      objetivo: `Verificar conhecimentos prévios sobre ${promptData.tituloTemaAssunto}`,
      resumo: 'Avaliação diagnóstica para identificar o nível de conhecimento dos alunos',
      instrumentos: ['Questionário', 'Observação'],
      momentoAplicacao: 'Início da sequência didática'
    }));
    
    // Gerar avaliações básicas
    const avaliacoes = Array.from({ length: quantidadeAvaliacoes }, (_, index) => ({
      id: `avaliacao-${index + 1}`,
      tipo: 'Avaliacao' as const,
      titulo: `Avaliação ${index + 1}: ${promptData.tituloTemaAssunto}`,
      objetivo: `Avaliar a aprendizagem sobre ${promptData.tituloTemaAssunto}`,
      resumo: 'Avaliação somativa dos conhecimentos adquiridos',
      criteriosAvaliacao: ['Compreensão dos conceitos', 'Aplicação prática', 'Participação'],
      instrumentos: ['Prova escrita', 'Trabalho prático'],
      valorPontuacao: '10 pontos'
    }));
    
    return {
      sequenciaDidatica: {
        titulo: promptData.tituloTemaAssunto,
        disciplina: promptData.disciplina,
        anoSerie: promptData.anoSerie,
        cargaHoraria: `${quantidadeAulas * 50} minutos`,
        descricaoGeral: promptData.objetivosAprendizagem,
        aulas,
        diagnosticos,
        avaliacoes
      },
      metadados: {
        totalAulas: quantidadeAulas,
        totalDiagnosticos: quantidadeDiagnosticos,
        totalAvaliacoes: quantidadeAvaliacoes,
        competenciasBNCC: promptData.bnccCompetencias || '',
        objetivosGerais: promptData.objetivosAprendizagem,
        isGeneratedByAI: false, // Fallback não é da IA
        generatedAt: new Date().toISOString()
      }
    };
  }
}

export const sequenciaDidaticaGenerator = new SequenciaDidaticaGenerator();
