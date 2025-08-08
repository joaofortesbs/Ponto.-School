
import { ActivityFormData } from '../../construction/types/ActivityTypes';
import { PlanoAulaBuilder, PlanoAulaData, PlanoAulaResponse } from './PlanoAulaBuilder';

export class PlanoAulaGenerator {
  private static readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
  
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

      // 3. Chamar API do Gemini
      const aiResponse = await this.callGeminiAPI(prompt);
      console.log('✅ Resposta recebida da IA');

      // 4. Processar resposta da IA
      const processedPlan = PlanoAulaBuilder.processAIResponse(aiResponse);
      console.log('📋 Plano processado:', processedPlan);

      // 5. Formatar para preview
      const formattedPlan = PlanoAulaBuilder.formatForPreview(processedPlan);
      console.log('🎨 Plano formatado para preview:', formattedPlan);

      // 6. Garantir estrutura consistente
      const finalPlan = {
        ...formattedPlan,
        activityId: 'plano-aula',
        activityType: 'plano-aula',
        isGeneratedByAI: true,
        generatedAt: new Date().toISOString(),
        formData: formData
      };

      console.log('📋 Plano final gerado:', finalPlan);
      return finalPlan;

    } catch (error) {
      console.error('❌ Erro na geração do plano de aula:', error);
      
      // Retornar plano de fallback
      console.log('🔄 Retornando plano de fallback');
      const fallbackResponse = PlanoAulaBuilder.createFallbackResponse();
      return PlanoAulaBuilder.formatForPreview(fallbackResponse);
    }
  }

  /**
   * Chama a API do Gemini para gerar o plano de aula
   */
  private static async callGeminiAPI(prompt: string): Promise<string> {
    const apiKey = this.getGeminiAPIKey();
    
    if (!apiKey) {
      throw new Error('Chave da API Gemini não configurada');
    }

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH", 
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    console.log('📤 Enviando requisição para Gemini API');

    const response = await fetch(`${this.GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Erro na resposta da API Gemini:', errorData);
      throw new Error(`Erro na API Gemini: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('📥 Resposta bruta da API Gemini:', data);

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Resposta inválida da API Gemini');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    console.log('📝 Texto gerado:', generatedText);

    return generatedText;
  }

  /**
   * Obtém a chave da API Gemini
   */
  private static getGeminiAPIKey(): string | null {
    // Tentar várias fontes de configuração
    const sources = [
      () => import.meta.env.VITE_GOOGLE_GEMINI_API_KEY,
      () => process.env.VITE_GOOGLE_GEMINI_API_KEY,
      () => localStorage.getItem('gemini_api_key'),
      () => sessionStorage.getItem('gemini_api_key')
    ];

    for (const source of sources) {
      try {
        const key = source();
        if (key && typeof key === 'string' && key.trim().length > 0) {
          return key.trim();
        }
      } catch (error) {
        console.warn('Erro ao obter chave da API:', error);
      }
    }

    console.warn('⚠️ Chave da API Gemini não encontrada');
    return null;
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
