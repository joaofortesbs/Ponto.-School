import { buildSequenciaDidaticaPrompt } from '../../prompts/sequenciaDidaticaPrompt';
import { processSequenciaDidaticaData, validateSequenciaDidaticaData, parseSequenciaDidaticaResponse, type SequenciaDidaticaData } from './sequenciaDidaticaProcessor';

interface GenerateSequenciaDidaticaParams {
  formData: any;
  apiKey?: string;
}

export class SequenciaDidaticaGenerator {
  private static instance: SequenciaDidaticaGenerator;

  static getInstance(): SequenciaDidaticaGenerator {
    if (!SequenciaDidaticaGenerator.instance) {
      SequenciaDidaticaGenerator.instance = new SequenciaDidaticaGenerator();
    }
    return SequenciaDidaticaGenerator.instance;
  }

  async generate({ formData, apiKey }: GenerateSequenciaDidaticaParams): Promise<SequenciaDidaticaData> {
    console.log('🚀 [SEQUENCIA_DIDATICA_GENERATOR] Iniciando geração:', formData);

    try {
      // 1. Validar dados de entrada
      if (!formData) {
        throw new Error('Dados do formulário não fornecidos');
      }

      // 2. Processar dados do formulário
      const processedData = processSequenciaDidaticaData(formData);
      console.log('✅ [SEQUENCIA_DIDATICA_GENERATOR] Dados processados:', processedData);

      // 3. Validar dados processados
      const isValid = validateSequenciaDidaticaData(processedData);
      if (!isValid) {
        throw new Error('Dados inválidos para geração da Sequência Didática');
      }

      // 4. Construir prompt para a IA
      const prompt = buildSequenciaDidaticaPrompt(processedData);
      console.log('📝 [SEQUENCIA_DIDATICA_GENERATOR] Prompt construído');

      // 5. Chamar API do Gemini
      const response = await this.callGeminiAPI(prompt, apiKey);
      console.log('🤖 [SEQUENCIA_DIDATICA_GENERATOR] Resposta da IA recebida');

      // 6. Processar resposta da IA
      const parsedResponse = parseSequenciaDidaticaResponse(response);
      if (!parsedResponse) {
        throw new Error('Erro ao processar resposta da IA');
      }

      // 7. Validar resposta final
      const finalValidation = validateSequenciaDidaticaData(parsedResponse);
      if (!finalValidation) {
        console.warn('⚠️ [SEQUENCIA_DIDATICA_GENERATOR] Resposta da IA não passou na validação, usando dados processados');
        return processedData;
      }

      console.log('✅ [SEQUENCIA_DIDATICA_GENERATOR] Sequência Didática gerada com sucesso');
      return parsedResponse;

    } catch (error) {
      console.error('❌ [SEQUENCIA_DIDATICA_GENERATOR] Erro na geração:', error);

      // Fallback: retornar dados processados do formulário
      const fallbackData = processSequenciaDidaticaData(formData);
      console.log('🔄 [SEQUENCIA_DIDATICA_GENERATOR] Usando fallback data');
      return fallbackData;
    }
  }

  private async callGeminiAPI(prompt: string, apiKey?: string): Promise<string> {
    const GEMINI_API_KEY = apiKey || 'AIzaSyDGPgWz2qr5_yYj7wMl5ykYvhz3EJ8L7Ps';
    const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

    console.log('🔗 [SEQUENCIA_DIDATICA_GENERATOR] Chamando API do Gemini');

    try {
      const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 4000,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Resposta inválida da API do Gemini');
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      console.log('✅ [SEQUENCIA_DIDATICA_GENERATOR] Resposta da API recebida com sucesso');

      return generatedText;

    } catch (error) {
      console.error('❌ [SEQUENCIA_DIDATICA_GENERATOR] Erro na chamada da API:', error);
      throw error;
    }
  }
}

export const generateSequenciaDidatica = async (params: GenerateSequenciaDidaticaParams): Promise<SequenciaDidaticaData> => {
  const generator = SequenciaDidaticaGenerator.getInstance();
  return generator.generate(params);
};