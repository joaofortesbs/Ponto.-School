
import { ActivityFormData } from '../../construction/types/ActivityTypes';

export interface QuadroInterativoGeneratedContent {
  title: string;
  content: string;
  success: boolean;
  error?: string;
  timestamp?: string;
  activityId?: string;
}

class QuadroInterativoGenerator {
  private static readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
  private static readonly STORAGE_PREFIX = 'quadro_interativo_';

  /**
   * Gera conteúdo para atividade de Quadro Interativo
   */
  static async generateContent(formData: ActivityFormData): Promise<QuadroInterativoGeneratedContent> {
    try {
      console.log('🎯 Iniciando geração de conteúdo para Quadro Interativo');
      console.log('📝 Dados recebidos:', formData);

      // Validar dados essenciais
      if (!this.validateRequiredData(formData)) {
        return {
          title: 'Dados Insuficientes',
          content: 'Por favor, preencha todos os campos obrigatórios: Disciplina, Ano/Série, Tema e Nível de Dificuldade.',
          success: false,
          error: 'Dados obrigatórios não preenchidos'
        };
      }

      // Gerar prompt otimizado
      const prompt = this.buildOptimizedPrompt(formData);
      console.log('🔧 Prompt gerado para API');

      // Chamar API Gemini
      const result = await this.callGeminiAPI(prompt);
      
      if (result.success) {
        console.log('✅ Conteúdo gerado com sucesso');
        return {
          ...result,
          timestamp: new Date().toISOString()
        };
      } else {
        console.error('❌ Falha na geração:', result.error);
        return result;
      }

    } catch (error) {
      console.error('❌ Erro inesperado no gerador:', error);
      return {
        title: 'Erro no Sistema',
        content: 'Ocorreu um erro inesperado durante a geração. Tente novamente.',
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Valida se os dados obrigatórios estão presentes
   */
  private static validateRequiredData(formData: ActivityFormData): boolean {
    const required = ['subject', 'schoolYear', 'theme', 'difficultyLevel'];
    return required.every(field => formData[field as keyof ActivityFormData] && 
                                  String(formData[field as keyof ActivityFormData]).trim().length > 0);
  }

  /**
   * Constrói prompt otimizado para geração de conteúdo
   */
  private static buildOptimizedPrompt(formData: ActivityFormData): string {
    return `
SISTEMA: Você é um especialista em educação que cria atividades interativas para quadros digitais.

TAREFA: Criar uma atividade completa de Quadro Interativo baseada nos seguintes dados:

**INFORMAÇÕES DA ATIVIDADE:**
- Título: ${formData.title || 'Atividade de Quadro Interativo'}
- Descrição: ${formData.description || 'Atividade interativa educacional'}
- Disciplina: ${formData.subject}
- Ano/Série: ${formData.schoolYear}
- Tema: ${formData.theme}
- Objetivos: ${formData.objectives || 'Desenvolver conhecimentos sobre o tema proposto'}
- Nível de Dificuldade: ${formData.difficultyLevel}
- Materiais: ${formData.materials || 'Quadro interativo, recursos digitais'}
- Instruções: ${formData.instructions || 'Seguir as orientações da atividade'}
- Avaliação: ${formData.evaluation || 'Participação e compreensão do conteúdo'}
- Contexto: ${formData.context || 'Educacional'}

**INSTRUÇÕES ESPECÍFICAS:**
1. Crie um conteúdo estruturado em formato JSON
2. O título deve ser claro e atrativo
3. O conteúdo deve incluir:
   - Introdução ao tema
   - Desenvolvimento da atividade interativa
   - Recursos visuais sugeridos
   - Atividades práticas
   - Instruções para o professor
   - Critérios de avaliação
4. Use linguagem apropriada para a faixa etária
5. Foque na interatividade e engajamento dos alunos
6. Inclua elementos que aproveitem as funcionalidades do quadro digital

**FORMATO DE RESPOSTA:**
Responda APENAS no seguinte formato JSON:
{
  "title": "Título da atividade de quadro interativo",
  "content": "Conteúdo detalhado e estruturado da atividade interativa, incluindo todas as seções mencionadas acima"
}

IMPORTANTE: NÃO inclua explicações adicionais, apenas o JSON válido.
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
        console.warn('⚠️ Chave da API Gemini não encontrada, usando conteúdo padrão');
        return this.generateFallbackContent(prompt);
      }

      console.log('🔑 Chave da API obtida, fazendo chamada para Gemini');

      // Preparar dados para a API
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
          maxOutputTokens: 2048,
        }
      };

      // Fazer chamada para a API
      const response = await fetch(`${this.GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        console.error('❌ Erro na resposta da API:', response.status, response.statusText);
        throw new Error(`Erro da API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📥 Resposta da API recebida');

      // Processar resposta
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const generatedText = data.candidates[0].content.parts[0].text;
        return this.parseGeminiResponse(generatedText);
      } else {
        throw new Error('Resposta da API em formato inesperado');
      }

    } catch (error) {
      console.error('❌ Erro na chamada da API:', error);
      
      // Fallback para conteúdo padrão
      return this.generateFallbackContent(prompt);
    }
  }

  /**
   * Processa a resposta da API Gemini
   */
  private static parseGeminiResponse(responseText: string): QuadroInterativoGeneratedContent {
    try {
      console.log('🔄 Processando resposta da API');
      
      // Tentar extrair JSON da resposta
      const cleanText = responseText.trim();
      
      // Procurar por JSON na resposta
      let jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        console.log('⚠️ JSON não encontrado, criando resposta estruturada');
        return {
          title: 'Atividade de Quadro Interativo',
          content: this.formatTextContent(cleanText),
          success: true
        };
      }

      const jsonData = JSON.parse(jsonMatch[0]);
      
      return {
        title: jsonData.title || 'Atividade de Quadro Interativo',
        content: jsonData.content || this.formatTextContent(cleanText),
        success: true
      };

    } catch (error) {
      console.error('❌ Erro ao processar resposta:', error);
      
      // Fallback: usar o texto diretamente formatado
      return {
        title: 'Atividade de Quadro Interativo',
        content: this.formatTextContent(responseText),
        success: true
      };
    }
  }

  /**
   * Formata texto simples em conteúdo estruturado
   */
  private static formatTextContent(text: string): string {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    return lines.join('\n\n');
  }

  /**
   * Gera conteúdo padrão como fallback
   */
  private static generateFallbackContent(prompt: string): QuadroInterativoGeneratedContent {
    const basicData = this.extractDataFromPrompt(prompt);
    
    const content = `
🎯 ATIVIDADE DE QUADRO INTERATIVO

📚 Disciplina: ${basicData.subject}
👥 Ano/Série: ${basicData.schoolYear}
🎨 Tema: ${basicData.theme}
⭐ Nível: ${basicData.difficultyLevel}

📋 DESENVOLVIMENTO DA ATIVIDADE:

1. INTRODUÇÃO INTERATIVA
   • Apresentação do tema usando recursos visuais
   • Ativação de conhecimentos prévios dos alunos
   • Uso de elementos multimídia no quadro

2. EXPLORAÇÃO DO CONTEÚDO
   • Navegação interativa pelos conceitos principais
   • Atividades de arrastar e soltar
   • Questionamentos direcionados para participação

3. ATIVIDADES PRÁTICAS
   • Exercícios interativos no quadro
   • Trabalho colaborativo dos alunos
   • Resolução de desafios em grupo

4. CONSOLIDAÇÃO
   • Síntese dos aprendizados
   • Aplicação dos conhecimentos
   • Avaliação formativa

💡 RECURSOS NECESSÁRIOS:
- Quadro interativo
- Materiais digitais preparados
- Participação ativa dos estudantes

🎯 OBJETIVOS ALCANÇADOS:
- Engajamento ativo dos alunos
- Compreensão do tema proposto
- Desenvolvimento de habilidades colaborativas
    `.trim();

    return {
      title: `Quadro Interativo: ${basicData.theme}`,
      content,
      success: true
    };
  }

  /**
   * Extrai dados básicos do prompt para fallback
   */
  private static extractDataFromPrompt(prompt: string): any {
    const extractField = (field: string) => {
      const regex = new RegExp(`${field}:\\s*(.+?)(?:\n|$)`, 'i');
      const match = prompt.match(regex);
      return match ? match[1].trim() : 'Não especificado';
    };

    return {
      subject: extractField('Disciplina'),
      schoolYear: extractField('Ano/Série'),
      theme: extractField('Tema'),
      difficultyLevel: extractField('Nível de Dificuldade')
    };
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
      const storageKey = `${this.STORAGE_PREFIX}${activityId}`;
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
      const storageKey = `${this.STORAGE_PREFIX}${activityId}`;
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

  /**
   * Remove conteúdo salvo
   */
  static clearStoredContent(activityId: string): void {
    try {
      const storageKey = `${this.STORAGE_PREFIX}${activityId}`;
      localStorage.removeItem(storageKey);
      console.log('🗑️ Conteúdo removido:', storageKey);
    } catch (error) {
      console.error('❌ Erro ao remover conteúdo:', error);
    }
  }
}

export default QuadroInterativoGenerator;
