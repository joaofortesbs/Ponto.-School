
import { geminiClient } from '@/utils/api/geminiClient';

export interface FlashCardData {
  id: number;
  front: string;
  back: string;
  category?: string;
  difficulty?: 'Fácil' | 'Médio' | 'Difícil';
  tags?: string[];
}

export interface FlashCardsContent {
  title: string;
  description: string;
  flashCards: FlashCardData[];
  totalFlashcards: number;
  theme: string;
  subject: string;
  schoolYear: string;
  difficulty: string;
  objectives: string;
  instructions: string;
  evaluation: string;
  generatedByAI: boolean;
  generatedAt: string;
  isGeneratedByAI: boolean;
  isFallback?: boolean;
  formDataUsed?: any;
}

export interface FlashCardsGenerationData {
  subject: string;
  schoolYear: string;
  theme: string;
  objectives: string;
  difficulty: string;
  numberOfFlashcards: string;
  topicos: string;
  instructions: string;
  evaluation: string;
  context?: string;
}

export class FlashCardsGenerator {
  private geminiClient = geminiClient;

  async generateFlashCardsContent(data: FlashCardsGenerationData): Promise<FlashCardsContent> {
    console.log('🃏 FlashCardsGenerator: Iniciando geração de flash cards', data);

    try {
      // Validar dados de entrada
      this.validateInputData(data);

      // Preparar prompt para o Gemini
      const prompt = this.buildGeminiPrompt(data);
      
      console.log('📝 FlashCardsGenerator: Prompt preparado:', prompt);

      // Chamar API do Gemini
      const response = await this.geminiClient.generateContent(prompt);
      
      console.log('🤖 FlashCardsGenerator: Resposta bruta do Gemini:', response);

      // Processar resposta
      const processedContent = this.processGeminiResponse(response, data);
      
      console.log('✅ FlashCardsGenerator: Conteúdo processado:', processedContent);

      return processedContent;

    } catch (error) {
      console.error('❌ FlashCardsGenerator: Erro na geração:', error);
      
      // Retornar conteúdo de fallback em caso de erro
      return this.generateFallbackContent(data);
    }
  }

  private validateInputData(data: FlashCardsGenerationData): void {
    const requiredFields = ['subject', 'theme', 'numberOfFlashcards'];
    const missingFields = requiredFields.filter(field => !data[field as keyof FlashCardsGenerationData]);
    
    if (missingFields.length > 0) {
      throw new Error(`Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
    }

    const numberOfFlashcards = parseInt(data.numberOfFlashcards);
    if (isNaN(numberOfFlashcards) || numberOfFlashcards < 1 || numberOfFlashcards > 50) {
      throw new Error('Número de flash cards deve estar entre 1 e 50');
    }
  }

  private buildGeminiPrompt(data: FlashCardsGenerationData): string {
    return `
Você é um especialista em educação e criação de materiais didáticos. Crie flash cards educacionais baseados nas seguintes especificações:

**INFORMAÇÕES DO CONTEÚDO:**
- Disciplina: ${data.subject}
- Ano/Série: ${data.schoolYear}
- Tema Principal: ${data.theme}
- Tópicos Específicos: ${data.topicos || 'Não especificado'}
- Número de Flash Cards: ${data.numberOfFlashcards}
- Nível de Dificuldade: ${data.difficulty}

**OBJETIVOS:**
${data.objectives || `Criar flash cards sobre ${data.theme} para facilitar o aprendizado e memorização dos conceitos principais.`}

**INSTRUÇÕES ESPECÍFICAS:**
${data.instructions || 'Crie flash cards claros e objetivos que facilitem a memorização e compreensão do tema.'}

**CRITÉRIOS DE AVALIAÇÃO:**
${data.evaluation || 'Os flash cards devem ser precisos, educacionalmente relevantes e apropriados para o nível escolar especificado.'}

**FORMATO DE RESPOSTA OBRIGATÓRIO:**
Responda EXCLUSIVAMENTE em formato JSON válido, seguindo exatamente esta estrutura:

{
  "title": "Título descritivo dos flash cards",
  "description": "Breve descrição do conjunto de flash cards",
  "flashCards": [
    {
      "id": 1,
      "front": "Pergunta ou conceito na frente do card",
      "back": "Resposta ou explicação no verso do card",
      "category": "Categoria do flash card",
      "difficulty": "Fácil|Médio|Difícil",
      "tags": ["tag1", "tag2"]
    }
  ],
  "totalFlashcards": ${data.numberOfFlashcards},
  "theme": "${data.theme}",
  "subject": "${data.subject}",
  "difficulty": "${data.difficulty}",
  "generatedByAI": true
}

**REGRAS IMPORTANTES:**
1. Crie exatamente ${data.numberOfFlashcards} flash cards
2. Cada flash card deve ter conteúdo educacional relevante
3. A frente deve conter pergunta, termo ou conceito
4. O verso deve conter resposta, definição ou explicação clara
5. Use linguagem apropriada para ${data.schoolYear}
6. Mantenha consistência no nível de dificuldade: ${data.difficulty}
7. Inclua categorias e tags relevantes para organização
8. Responda APENAS com JSON válido, sem texto adicional

Gere os flash cards agora:
`;
  }

  private processGeminiResponse(response: any, originalData: FlashCardsGenerationData): FlashCardsContent {
    try {
      // Extrair texto da resposta
      let responseText = '';
      if (response.candidates && response.candidates[0] && response.candidates[0].content) {
        responseText = response.candidates[0].content.parts[0].text;
      } else if (typeof response === 'string') {
        responseText = response;
      } else {
        throw new Error('Formato de resposta inesperado do Gemini');
      }

      console.log('📄 FlashCardsGenerator: Texto da resposta:', responseText);

      // Limpar e extrair JSON
      const cleanedResponse = this.extractAndCleanJSON(responseText);
      console.log('🧹 FlashCardsGenerator: JSON limpo:', cleanedResponse);

      // Parse do JSON
      const parsedData = JSON.parse(cleanedResponse);
      console.log('🔍 FlashCardsGenerator: Dados parseados:', parsedData);

      // Validar estrutura da resposta
      this.validateGeminiResponse(parsedData);

      // Construir conteúdo final
      const finalContent: FlashCardsContent = {
        title: parsedData.title || `Flash Cards: ${originalData.theme}`,
        description: parsedData.description || `Flash cards sobre ${originalData.theme} para ${originalData.subject}`,
        flashCards: parsedData.flashCards || [],
        totalFlashcards: parsedData.flashCards?.length || parseInt(originalData.numberOfFlashcards),
        theme: originalData.theme,
        subject: originalData.subject,
        schoolYear: originalData.schoolYear,
        difficulty: originalData.difficulty,
        objectives: originalData.objectives,
        instructions: originalData.instructions,
        evaluation: originalData.evaluation,
        generatedByAI: true,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true,
        formDataUsed: originalData
      };

      return finalContent;

    } catch (error) {
      console.error('❌ FlashCardsGenerator: Erro ao processar resposta:', error);
      throw new Error(`Erro ao processar resposta do Gemini: ${error.message}`);
    }
  }

  private extractAndCleanJSON(text: string): string {
    // Remover blocos de código markdown
    let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Procurar pelo JSON usando regex
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }
    
    // Limpezas adicionais
    cleaned = cleaned.trim();
    cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    
    return cleaned;
  }

  private validateGeminiResponse(data: any): void {
    if (!data || typeof data !== 'object') {
      throw new Error('Resposta deve ser um objeto JSON válido');
    }

    if (!Array.isArray(data.flashCards)) {
      throw new Error('Campo "flashCards" deve ser um array');
    }

    if (data.flashCards.length === 0) {
      throw new Error('Nenhum flash card foi gerado');
    }

    // Validar estrutura de cada flash card
    data.flashCards.forEach((card: any, index: number) => {
      if (!card.front || !card.back) {
        throw new Error(`Flash card ${index + 1} deve ter campos "front" e "back"`);
      }
      if (!card.id) {
        card.id = index + 1;
      }
    });
  }

  private generateFallbackContent(data: FlashCardsGenerationData): FlashCardsContent {
    console.log('🛡️ FlashCardsGenerator: Gerando conteúdo de fallback');

    const numberOfCards = Math.min(parseInt(data.numberOfFlashcards) || 5, 10);
    const fallbackCards: FlashCardData[] = [];

    for (let i = 1; i <= numberOfCards; i++) {
      fallbackCards.push({
        id: i,
        front: `Conceito ${i} sobre ${data.theme}`,
        back: `Explicação do conceito ${i} em ${data.subject}. Este é um exemplo de flash card gerado automaticamente para demonstração.`,
        category: data.subject,
        difficulty: data.difficulty as any,
        tags: [data.theme.toLowerCase(), data.subject.toLowerCase()]
      });
    }

    return {
      title: `Flash Cards: ${data.theme} (Modo Demonstração)`,
      description: `Flash cards sobre ${data.theme} criados em modo demonstração`,
      flashCards: fallbackCards,
      totalFlashcards: fallbackCards.length,
      theme: data.theme,
      subject: data.subject,
      schoolYear: data.schoolYear,
      difficulty: data.difficulty,
      objectives: data.objectives,
      instructions: data.instructions,
      evaluation: data.evaluation,
      generatedByAI: false,
      generatedAt: new Date().toISOString(),
      isGeneratedByAI: false,
      isFallback: true
    };
  }
}
