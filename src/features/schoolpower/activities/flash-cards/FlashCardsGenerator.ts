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

  async generateFlashCardsContent(data: FlashCardsFormData): Promise<FlashCardsContent> {
    try {
      console.log('🃏 FlashCardsGenerator: Iniciando geração com dados:', data);

      // Validar dados de entrada mais rigorosamente
      if (!data.theme?.trim()) {
        throw new Error('Tema é obrigatório para gerar flash cards');
      }
      if (!data.topicos?.trim()) {
        throw new Error('Tópicos são obrigatórios para gerar flash cards');
      }

      const numberOfCards = parseInt(data.numberOfFlashcards) || 10;

      // Validar número de cards
      if (numberOfCards < 1 || numberOfCards > 50) {
        throw new Error('Número de flash cards deve estar entre 1 e 50');
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = this.buildPrompt(data);
      console.log('📝 Prompt enviado para Gemini:', prompt);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('📥 Resposta bruta do Gemini:', text);

      const parsedContent = this.parseGeminiResponse(text, data);

      // Validar cards gerados com verificação mais robusta
      if (!parsedContent.cards || !Array.isArray(parsedContent.cards)) {
        console.error('❌ parsedContent.cards não é um array válido:', parsedContent);
        throw new Error('API não retornou formato de cards válido');
      }

      if (parsedContent.cards.length === 0) {
        console.error('❌ Array de cards está vazio:', parsedContent);
        throw new Error('API não gerou nenhum flash card');
      }

      // Validar e limpar estrutura dos cards
      const validCards = [];
      const invalidCards = [];

      parsedContent.cards.forEach((card, index) => {
        if (!card || typeof card !== 'object') {
          invalidCards.push({ index, reason: 'Card não é um objeto válido', card });
          return;
        }

        if (!card.question || typeof card.question !== 'string' || card.question.trim() === '') {
          invalidCards.push({ index, reason: 'Pergunta inválida ou vazia', card });
          return;
        }

        if (!card.answer || typeof card.answer !== 'string' || card.answer.trim() === '') {
          invalidCards.push({ index, reason: 'Resposta inválida ou vazia', card });
          return;
        }

        // Card válido - adicionar à lista
        validCards.push({
          id: card.id || index + 1,
          question: card.question.trim(),
          answer: card.answer.trim(),
          category: card.category || data.theme || 'Geral'
        });
      });

      if (invalidCards.length > 0) {
        console.warn(`⚠️ ${invalidCards.length} cards inválidos detectados:`, invalidCards);
      }

      if (validCards.length === 0) {
        console.error('❌ Nenhum card válido após validação:', {
          totalCards: parsedContent.cards.length,
          invalidCards: invalidCards.length,
          invalidDetails: invalidCards
        });
        throw new Error('Todos os cards gerados pela API são inválidos');
      }

      console.log(`✅ ${validCards.length} cards válidos de ${parsedContent.cards.length} gerados`);
      parsedContent.cards = validCards;

      console.log('✅ Flash Cards gerados com sucesso:', parsedContent);

      return parsedContent;

    } catch (error) {
      console.error('❌ Erro ao gerar Flash Cards:', error);

      // Fallback com dados de exemplo
      return this.generateFallbackContent(data);
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