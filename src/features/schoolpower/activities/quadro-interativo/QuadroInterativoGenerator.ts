
import { ActivityFormData } from '../../construction/types/ActivityTypes';

export interface QuadroInterativoGeneratedContent {
  title: string;
  content: string;
  success: boolean;
  error?: string;
}

/**
 * Gerador específico para atividades de Quadro Interativo
 * Analisa os dados dos campos e gera conteúdo usando a API Gemini
 */
export class QuadroInterativoGenerator {
  private static readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  
  /**
   * Gera conteúdo para atividade de Quadro Interativo
   */
  static async generateContent(formData: ActivityFormData): Promise<QuadroInterativoGeneratedContent> {
    try {
      console.log('🎯 Iniciando geração de conteúdo do Quadro Interativo:', formData);

      // Validar dados essenciais
      if (!this.validateFormData(formData)) {
        return {
          title: 'Dados Insuficientes',
          content: 'Por favor, preencha todos os campos obrigatórios para gerar a atividade.',
          success: false,
          error: 'Campos obrigatórios não preenchidos'
        };
      }

      // Construir prompt para a API Gemini
      const prompt = this.buildPrompt(formData);
      console.log('📝 Prompt construído:', prompt);

      // Chamar API Gemini
      const generatedContent = await this.callGeminiAPI(prompt);
      
      if (generatedContent.success) {
        console.log('✅ Conteúdo gerado com sucesso:', generatedContent);
        return generatedContent;
      } else {
        throw new Error(generatedContent.error || 'Erro na geração de conteúdo');
      }

    } catch (error) {
      console.error('❌ Erro na geração de conteúdo do Quadro Interativo:', error);
      
      return {
        title: 'Erro na Geração',
        content: 'Ocorreu um erro ao gerar o conteúdo. Tente novamente.',
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Valida se os dados do formulário estão completos
   */
  private static validateFormData(formData: ActivityFormData): boolean {
    const requiredFields = [
      'title',
      'description', 
      'subject',
      'schoolYear',
      'theme',
      'objectives'
    ];

    return requiredFields.every(field => {
      const value = formData[field as keyof ActivityFormData];
      return value && typeof value === 'string' && value.trim().length > 0;
    });
  }

  /**
   * Constrói prompt específico para Quadro Interativo
   */
  private static buildPrompt(formData: ActivityFormData): string {
    return `
Você é um especialista em educação digital e criação de atividades interativas para quadros digitais.

Crie uma atividade de Quadro Interativo baseada nos seguintes dados:

**Informações da Atividade:**
- Título: ${formData.title}
- Descrição: ${formData.description}
- Disciplina: ${formData.subject}
- Ano/Série: ${formData.schoolYear}
- Tema: ${formData.theme}
- Objetivos: ${formData.objectives}
- Nível de Dificuldade: ${formData.difficultyLevel || 'Médio'}
- Materiais: ${formData.materials || 'Não especificado'}
- Instruções: ${formData.instructions || 'A definir'}
- Avaliação: ${formData.evaluation || 'A definir'}
- Contexto: ${formData.context || 'Geral'}

**Instruções:**
1. Crie um TÍTULO claro e atrativo para a atividade
2. Crie um CONTEÚDO simples e direto que descreva a atividade interativa
3. O conteúdo deve ser adequado para exibição em um quadro digital
4. Foque na interatividade e engajamento dos alunos
5. Mantenha a linguagem clara e apropriada para a faixa etária

**Formato de Resposta:**
Responda APENAS no seguinte formato JSON:
{
  "title": "Título da atividade",
  "content": "Descrição detalhada da atividade interativa"
}

NÃO inclua explicações adicionais, apenas o JSON.
    `.trim();
  }

  /**
   * Chama a API Gemini para gerar conteúdo
   */
  private static async callGeminiAPI(prompt: string): Promise<QuadroInterativoGeneratedContent> {
    try {
      // Obter chave da API
      const apiKey = this.getGeminiApiKey();
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
          maxOutputTokens: 1024,
        }
      };

      console.log('🌐 Enviando requisição para API Gemini...');

      const response = await fetch(`${this.GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Erro na API Gemini: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📡 Resposta da API Gemini recebida:', data);

      // Extrair e processar resposta
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!generatedText) {
        throw new Error('Resposta vazia da API Gemini');
      }

      return this.parseGeminiResponse(generatedText);

    } catch (error) {
      console.error('❌ Erro na chamada da API Gemini:', error);
      
      return {
        title: 'Erro na API',
        content: 'Não foi possível gerar o conteúdo. Verifique a conexão.',
        success: false,
        error: error instanceof Error ? error.message : 'Erro na API'
      };
    }
  }

  /**
   * Processa a resposta da API Gemini
   */
  private static parseGeminiResponse(responseText: string): QuadroInterativoGeneratedContent {
    try {
      // Tentar extrair JSON da resposta
      const cleanText = responseText.trim();
      let jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        // Se não encontrar JSON, criar resposta estruturada
        return {
          title: 'Atividade de Quadro Interativo',
          content: cleanText,
          success: true
        };
      }

      const jsonData = JSON.parse(jsonMatch[0]);
      
      return {
        title: jsonData.title || 'Atividade de Quadro Interativo',
        content: jsonData.content || jsonData.description || cleanText,
        success: true
      };

    } catch (error) {
      console.error('❌ Erro ao processar resposta:', error);
      
      // Fallback: usar o texto diretamente
      return {
        title: 'Atividade de Quadro Interativo',
        content: responseText.trim(),
        success: true
      };
    }
  }

  /**
   * Obtém a chave da API Gemini
   */
  private static getGeminiApiKey(): string | null {
    // Implementar múltiplas formas de obter a chave
    return import.meta.env.VITE_GEMINI_API_KEY || 
           import.meta.env.GEMINI_API_KEY ||
           localStorage.getItem('gemini_api_key') ||
           'AIzaSyBJ8XEk8LU5F7hxhNjhRKGq6jNcEU6F6js'; // Chave padrão de fallback
  }

  /**
   * Salva conteúdo gerado localmente
   */
  static saveGeneratedContent(activityId: string, content: QuadroInterativoGeneratedContent): void {
    try {
      const storageKey = `quadro_interativo_${activityId}`;
      const dataToSave = {
        ...content,
        timestamp: new Date().toISOString(),
        activityId
      };

      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      console.log('💾 Conteúdo salvo localmente:', storageKey);

    } catch (error) {
      console.error('❌ Erro ao salvar conteúdo:', error);
    }
  }

  /**
   * Recupera conteúdo salvo localmente
   */
  static getStoredContent(activityId: string): QuadroInterativoGeneratedContent | null {
    try {
      const storageKey = `quadro_interativo_${activityId}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const data = JSON.parse(stored);
        console.log('📂 Conteúdo recuperado:', data);
        return data;
      }

      return null;

    } catch (error) {
      console.error('❌ Erro ao recuperar conteúdo:', error);
      return null;
    }
  }
}

export default QuadroInterativoGenerator;
