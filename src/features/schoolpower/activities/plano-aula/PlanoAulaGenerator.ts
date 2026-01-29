import { ActivityFormData } from '../../construction/types/ActivityTypes';
import { PlanoAulaBuilder, PlanoAulaData, PlanoAulaResponse } from './PlanoAulaBuilder';
import { generateContent } from '@/services/llm-orchestrator';

export class PlanoAulaGenerator {
  
  /**
   * Gera um plano de aula completo usando a IA Gemini
   */
  static async generatePlanoAula(formData: ActivityFormData): Promise<any> {
    console.log('🎓 [PlanoAulaGenerator] Iniciando geração do plano de aula');
    console.log('📝 Dados recebidos:', formData);

    try {
      // 1. Formatar dados para a IA
      const planoData = PlanoAulaBuilder.formatDataForAI(formData);
      console.log('📊 Dados formatados para IA:', planoData);

      // 2. Gerar prompt estruturado
      const prompt = PlanoAulaBuilder.generatePrompt(planoData);
      console.log('🤖 Prompt gerado para Gemini');

      // 3. Chamar LLM Orchestrator
      console.log('🤖 [PlanoAulaGenerator] Usando LLM Orchestrator v3.0 Enterprise');
      const result = await generateContent(prompt, {
        activityType: 'plano-aula',
        onProgress: (status) => console.log(`🎓 [PlanoAula] ${status}`),
      });
      
      if (!result.success || !result.data) {
        console.warn('⚠️ LLM Orchestrator falhou, usando fallback');
        const fallbackResponse = PlanoAulaBuilder.createFallbackResponse();
        return PlanoAulaBuilder.formatForPreview(fallbackResponse);
      }
      
      const aiResponse = result.data;
      console.log('✅ Resposta recebida da IA');

      // 4. Processar resposta da IA
      const processedPlan = PlanoAulaBuilder.processAIResponse(aiResponse);
      console.log('📋 Plano processado:', processedPlan);

      // 5. Formatar para preview
      const formattedPlan = PlanoAulaBuilder.formatForPreview(processedPlan);
      console.log('🎨 Plano formatado para preview:', formattedPlan);

      return formattedPlan;

    } catch (error) {
      console.error('❌ Erro na geração do plano de aula:', error);
      
      // Retornar plano de fallback
      console.log('🔄 Retornando plano de fallback');
      const fallbackResponse = PlanoAulaBuilder.createFallbackResponse();
      return PlanoAulaBuilder.formatForPreview(fallbackResponse);
    }
  }

  /**
   * Valida se os dados do formulário são suficientes para gerar um plano de aula
   */
  static validateFormData(formData: ActivityFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!formData.title?.trim()) {
      errors.push('Título é obrigatório');
    }

    if (!formData.theme?.trim()) {
      errors.push('Tema é obrigatório');
    }

    if (!formData.subject?.trim()) {
      errors.push('Disciplina é obrigatória');
    }

    if (!formData.schoolYear?.trim()) {
      errors.push('Ano/Série é obrigatório');
    }

    if (!formData.objectives?.trim()) {
      errors.push('Objetivo Geral é obrigatório');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Gera uma versão simplificada do plano para testes
   */
  static generateTestPlan(formData: ActivityFormData): any {
    const planoData = PlanoAulaBuilder.formatDataForAI(formData);
    const fallbackResponse = PlanoAulaBuilder.createFallbackResponse();
    
    // Personalizar com dados do formulário
    fallbackResponse.visao_geral.disciplina = planoData.disciplina;
    fallbackResponse.visao_geral.tema = planoData.tema;
    fallbackResponse.visao_geral.serie = planoData.serie;
    fallbackResponse.visao_geral.tempo = planoData.cargaHoraria;

    return PlanoAulaBuilder.formatForPreview(fallbackResponse);
  }
}
