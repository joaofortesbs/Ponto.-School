import { GoogleGenerativeAI } from '@google/generative-ai';

export interface FlashCard {
  id: number;
  question: string;
  answer: string;
  category?: string;
}

export interface FlashCardsContent {
  title: string;
  description: string;
  theme: string;
  topicos: string;
  numberOfFlashcards: number;
  context: string;
  cards: FlashCard[];
  totalCards: number;
  generatedAt: string;
  isGeneratedByAI: boolean;
  isFallback?: boolean; // Adicionado para indicar se o conteúdo é de fallback
}

export interface FlashCardsFormData {
  title: string;
  description: string;
  theme: string;
  topicos: string;
  numberOfFlashcards: string;
  context: string;
}

export class FlashCardsGenerator {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ Chave da API Gemini não encontrada');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
  }

  async generateFlashCardsContent(formData: FlashCardsFormData): Promise<FlashCardsContent> {
    console.log('🃏 Iniciando geração de Flash Cards com Gemini:', formData);

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = this.buildPrompt(formData);
      console.log('📝 Prompt enviado para Gemini:', prompt);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('📥 Resposta bruta do Gemini:', text);

      const parsedContent = this.parseGeminiResponse(text, formData);

      console.log('✅ Flash Cards gerados com sucesso:', parsedContent);

      return parsedContent;

    } catch (error) {
      console.error('❌ Erro ao gerar Flash Cards:', error);

      // Fallback com dados de exemplo
      return this.generateFallbackContent(formData);
    }
  }

  private buildPrompt(formData: FlashCardsFormData): string {
    return `
Você é um especialista em educação e criação de materiais didáticos. Gere ${formData.numberOfFlashcards} flash cards sobre o tema "${formData.theme}".

DADOS FORNECIDOS:
- Tema: ${formData.theme}
- Tópicos Principais: ${formData.topicos}
- Contexto de Uso: ${formData.context}
- Quantidade: ${formData.numberOfFlashcards} cards

INSTRUÇÕES PARA CRIAÇÃO:
1. Crie perguntas claras e objetivas relacionadas ao tema
2. As respostas devem ser concisas mas completas
3. Varie o tipo de pergunta (conceitos, aplicações, exemplos)
4. Mantenha a linguagem adequada ao contexto fornecido
5. Cada card deve abordar um aspecto diferente do tema

FORMATO DE RESPOSTA (JSON):
{
  "cards": [
    {
      "id": 1,
      "question": "Pergunta clara e objetiva",
      "answer": "Resposta completa e didática",
      "category": "Categoria do conteúdo"
    }
  ]
}

IMPORTANTE: Retorne APENAS o JSON válido, sem explicações adicionais.
    `;
  }

  private parseGeminiResponse(text: string, formData: FlashCardsFormData): FlashCardsContent {
    try {
      // Limpar a resposta para extrair apenas o JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('JSON não encontrado na resposta');
      }

      const jsonText = jsonMatch[0];
      const parsedData = JSON.parse(jsonText);

      if (!parsedData.cards || !Array.isArray(parsedData.cards)) {
        throw new Error('Formato de resposta inválido');
      }

      // Validar e processar cards
      const processedCards: FlashCard[] = parsedData.cards.map((card: any, index: number) => ({
        id: index + 1,
        question: card.question || `Pergunta ${index + 1}`,
        answer: card.answer || `Resposta ${index + 1}`,
        category: card.category || 'Geral'
      }));

      return {
        title: formData.title,
        description: formData.description,
        theme: formData.theme,
        topicos: formData.topicos,
        numberOfFlashcards: parseInt(formData.numberOfFlashcards),
        context: formData.context,
        cards: processedCards,
        totalCards: processedCards.length,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true
      };

    } catch (error) {
      console.error('❌ Erro ao parsear resposta do Gemini:', error);
      throw error;
    }
  }

  private generateFallbackContent(formData: FlashCardsFormData): FlashCardsContent {
    console.log('🛡️ Gerando conteúdo de fallback para Flash Cards');

    const numberOfCards = parseInt(formData.numberOfFlashcards) || 5;
    const topicsList = formData.topicos ? formData.topicos.split(',').map(t => t.trim()) : ['Conceitos básicos'];

    const cards: FlashCard[] = Array.from({ length: numberOfCards }, (_, index) => {
      const topic = topicsList[index % topicsList.length];
      return {
        id: index + 1,
        question: `O que você sabe sobre ${topic} em ${formData.theme}?`,
        answer: `${topic} é um conceito importante em ${formData.theme}. ${formData.context ? `No contexto: ${formData.context}` : 'É fundamental para o entendimento do tema.'}`,
        category: formData.theme || 'Geral'
      };
    });

    const fallbackContent: FlashCardsContent = {
      title: formData.title,
      description: formData.description || `Flash Cards sobre ${formData.theme} (Modo Demonstração)`,
      theme: formData.theme,
      topicos: formData.topicos,
      numberOfFlashcards: numberOfCards,
      context: formData.context,
      cards: cards,
      totalCards: numberOfCards,
      generatedAt: new Date().toISOString(),
      isGeneratedByAI: false,
      isFallback: true
    };

    console.log('🛡️ Conteúdo de fallback gerado:', fallbackContent);
    console.log('📊 Cards de fallback:', cards);

    return fallbackContent;
  }
}