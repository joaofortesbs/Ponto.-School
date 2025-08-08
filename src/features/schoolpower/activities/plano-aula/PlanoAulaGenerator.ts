import { ActivityFormData } from '../../construction/types/ActivityTypes';
import { PlanoAulaBuilder } from './PlanoAulaBuilder';

export class PlanoAulaGenerator {
  /**
   * Gera um plano de aula completo usando a IA Gemini
   */
  static async generatePlanoAula(formData: ActivityFormData): Promise<any> {
    console.log('🎓 [PlanoAulaGenerator] Iniciando geração do plano de aula');
    console.log('📝 Dados recebidos:', formData);

    try {
      // 1. Validar dados de entrada
      const validation = this.validateFormData(formData);
      if (!validation.isValid) {
        console.warn('⚠️ Dados incompletos:', validation.errors);
        // Continuar com dados disponíveis
      }

      // 2. Formatar dados para a IA
      const planoData = PlanoAulaBuilder.formatDataForAI(formData);
      console.log('📊 Dados formatados para IA:', planoData);

      // 3. Gerar prompt estruturado
      const prompt = PlanoAulaBuilder.generatePrompt(planoData);
      console.log('🤖 Prompt gerado para Gemini');

      // 4. Chamar API do Gemini
      const aiResponse = await PlanoAulaBuilder.callGeminiAPI(prompt);
      console.log('✅ Resposta recebida da IA');

      // 5. Processar resposta da IA
      const processedPlan = PlanoAulaBuilder.processAIResponse(aiResponse);
      console.log('📋 Plano processado:', processedPlan);

      // 6. Formatar para preview
      const formattedPlan = PlanoAulaBuilder.formatForPreview(processedPlan);
      console.log('🎨 Plano formatado para preview:', formattedPlan);

      return formattedPlan;

    } catch (error) {
      console.error('❌ Erro na geração do plano de aula:', error);

      // Retornar plano de fallback personalizado
      console.log('🔄 Retornando plano de fallback personalizado');
      const fallbackResponse = PlanoAulaBuilder.createFallbackResponse();

      // Personalizar fallback com dados do formulário
      if (formData.subject) fallbackResponse.visao_geral.disciplina = formData.subject;
      if (formData.theme) fallbackResponse.visao_geral.tema = formData.theme;
      if (formData.schoolYear) fallbackResponse.visao_geral.serie = formData.schoolYear;
      if (formData.timeLimit) fallbackResponse.visao_geral.tempo = formData.timeLimit;
      if (formData.objectives) {
        fallbackResponse.objetivos[0].descricao = formData.objectives;
      }

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
    console.log('🧪 Gerando plano de teste');

    const fallbackResponse = PlanoAulaBuilder.createFallbackResponse();

    // Personalizar com dados do formulário
    if (formData.subject) fallbackResponse.visao_geral.disciplina = formData.subject;
    if (formData.theme) fallbackResponse.visao_geral.tema = formData.theme;
    if (formData.schoolYear) fallbackResponse.visao_geral.serie = formData.schoolYear;
    if (formData.timeLimit) fallbackResponse.visao_geral.tempo = formData.timeLimit;

    return PlanoAulaBuilder.formatForPreview(fallbackResponse);
  }
}