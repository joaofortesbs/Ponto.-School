/**
 * GEMINI CLIENT - WRAPPER DO LLM ORCHESTRATOR
 * 
 * Este arquivo agora funciona como um wrapper do Sistema Unificado de LLMs v3.0 Enterprise.
 * Mantém a interface existente para compatibilidade com código legado.
 * 
 * O fluxo real de chamadas é:
 * geminiClient.generateContent() → LLM Orchestrator → 11 modelos em cascata
 * 
 * @version 3.0.0 (wrapper)
 */

import { 
  generateContent,
  getOrchestratorStats,
  getActiveModels,
  validateGroqApiKey as validateGroq,
  validateGeminiApiKey as validateGemini,
  getGroqApiKey,
  getGeminiApiKey,
} from '@/services/llm-orchestrator';

export interface GeminiRequest {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

export interface GeminiResponse {
  success: boolean;
  result: string;
  content?: string;
  estimatedTokens: number;
  estimatedPowerCost: number;
  executionTime: number;
  error?: string;
  provider?: string;
}

export class GeminiClient {
  constructor() {
    const groqConfigured = validateGroq(getGroqApiKey());
    const geminiConfigured = validateGemini(getGeminiApiKey());
    
    console.log('🤖 [GeminiClient] Sistema Multi-API Resiliente inicializado');
    console.log(`   ✅ Groq API: ${groqConfigured ? 'Configurada' : 'NÃO configurada'}`);
    console.log(`   ✅ Gemini API: ${geminiConfigured ? 'Configurada' : 'NÃO configurada'}`);
    console.log(`   📊 Total de modelos disponíveis: ${getActiveModels().length}`);
  }

  async generate(request: GeminiRequest): Promise<GeminiResponse> {
    const startTime = Date.now();
    
    console.log('🤖 [GeminiClient] ====== INICIANDO GERAÇÃO COM FALLBACK ======');
    console.log('🤖 [GeminiClient] Prompt (primeiros 300 chars):', request.prompt?.substring(0, 300));

    try {
      const result = await generateContent(request.prompt, {
        temperature: request.temperature,
        maxTokens: request.maxTokens,
        onProgress: (status) => console.log(`📝 [GeminiClient] ${status}`),
      });

      const executionTime = Date.now() - startTime;

      if (result.success && result.data) {
        console.log(`✅ [GeminiClient] SUCESSO com ${result.model} em ${executionTime}ms`);
        console.log(`✅ [GeminiClient] Resposta (primeiros 500 chars):`, result.data?.substring(0, 500));

        const estimatedTokens = this.estimateTokens(request.prompt + result.data);

        return {
          success: true,
          result: result.data,
          content: result.data,
          estimatedTokens,
          estimatedPowerCost: estimatedTokens * 0.00001,
          executionTime,
          provider: result.provider,
        };
      }

      const errorMsg = result.errors.map(e => e.error).join('; ') || 'Erro desconhecido';
      console.error('❌ [GeminiClient] Falha:', errorMsg);

      return {
        success: false,
        result: '',
        estimatedTokens: 0,
        estimatedPowerCost: 0,
        executionTime,
        error: errorMsg,
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      console.error('❌ [GeminiClient] Erro crítico:', errorMsg);

      return {
        success: false,
        result: '',
        estimatedTokens: 0,
        estimatedPowerCost: 0,
        executionTime,
        error: errorMsg,
      };
    }
  }

  async generateContent(prompt: string): Promise<string> {
    console.log('%c🤖 [GeminiClient] generateContent() CHAMADO', 'background: #FF5722; color: white; font-size: 14px; padding: 5px;');
    console.log('🤖 [GeminiClient] Prompt length:', prompt?.length);
    
    try {
      console.log('🤖 [GeminiClient] Chamando orchestrator generateContent...');
      const result = await generateContent(prompt, {
        onProgress: (status) => console.log(`📝 [GeminiClient] Progress: ${status}`),
      });
      
      console.log('🤖 [GeminiClient] Resultado do orchestrator:', {
        success: result.success,
        model: result.model,
        provider: result.provider,
        dataLength: result.data?.length || 0,
        errorsCount: result.errors?.length || 0
      });
      
      if (!result.success || !result.data) {
        const errorMsg = result.errors.map(e => e.error).join('; ') || 'Erro ao gerar conteúdo';
        console.error('%c❌ [GeminiClient] generateContent FALHOU', 'background: red; color: white; font-size: 14px; padding: 5px;');
        console.error('❌ [GeminiClient] Erros:', result.errors);
        throw new Error(errorMsg);
      }
      
      console.log(`%c✅ [GeminiClient] generateContent SUCESSO com ${result.model}`, 'background: green; color: white; font-size: 14px; padding: 5px;');
      console.log(`✅ [GeminiClient] Resposta (${result.data.length} chars):`, result.data.substring(0, 500));
      return result.data;
    } catch (error) {
      console.error('%c💥 [GeminiClient] EXCEÇÃO CAPTURADA', 'background: darkred; color: white; font-size: 14px; padding: 5px;');
      console.error('💥 [GeminiClient] Erro:', error);
      throw error;
    }
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  getAvailableProviders(): string[] {
    return getActiveModels()
      .filter(m => m.provider !== 'local')
      .map(m => m.id);
  }

  getStats() {
    return getOrchestratorStats();
  }
}

export const geminiClient = new GeminiClient();
