import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuração da API Key do Gemini com múltiplas opções
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 
                import.meta.env.GEMINI_API_KEY || 
                'AIzaSyDvKXBqzB6AtggaTGTJ_qOwShEGsDVME1I';

if (!API_KEY || API_KEY === 'sua_chave_aqui') {
  console.warn('⚠️ API Key do Gemini não configurada adequadamente');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export const geminiClient = {
  async generateContent(prompt: string, options = {}) {
    try {
      console.log('🤖 Enviando prompt personalizado para Gemini...');
      console.log('📝 Tamanho do prompt:', prompt.length, 'caracteres');

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-pro',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
          ...options
        }
      });

      const result = await model.generateContent([
        {
          text: `${prompt}\n\nIMPORTANTE: Retorne um conteúdo estruturado, detalhado e personalizado baseado exatamente nos dados fornecidos. Use formato JSON quando possível para melhor organização.`
        }
      ]);

      const response = await result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        throw new Error('Resposta vazia do Gemini');
      }

      console.log('✅ Resposta recebida do Gemini:', text.length, 'caracteres');
      console.log('📊 Preview da resposta:', text.substring(0, 200) + '...');

      return { text: text.trim() };

    } catch (error) {
      console.error('❌ Erro detalhado ao chamar Gemini:', {
        message: error.message,
        status: error.status,
        code: error.code
      });

      // Melhor tratamento de erros
      if (error.message?.includes('API_KEY')) {
        throw new Error('Chave da API do Gemini inválida ou não configurada');
      } else if (error.message?.includes('quota')) {
        throw new Error('Cota da API do Gemini excedida');
      } else if (error.message?.includes('network')) {
        throw new Error('Erro de conexão com a API do Gemini');
      }

      throw new Error(`Erro ao gerar conteúdo: ${error.message}`);
    }
  },

  async generateStructuredContent(prompt: string, schema?: any) {
    try {
      const response = await this.generateContent(prompt);

      // Tentar extrair JSON da resposta
      const text = response.text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.warn('⚠️ Não foi possível parsear JSON, retornando texto');
        }
      }

      return { generatedText: text };

    } catch (error) {
      console.error('❌ Erro ao gerar conteúdo estruturado:', error);
      throw error;
    }
  }
};