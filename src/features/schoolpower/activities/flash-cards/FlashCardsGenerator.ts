import { geminiClient } from '@/utils/api/geminiClient';

export interface FlashCard {
  id: number;
  front: string;
  back: string;
  category?: string;
  difficulty?: string;
}

export interface FlashCardsData {
  theme: string;
  subject: string;
  schoolYear: string;
  topicos: string;
  numberOfFlashcards: string | number;
  context?: string;
  difficultyLevel?: string;
  objectives?: string;
  instructions?: string;
  evaluation?: string;
}

export interface FlashCardsGeneratedContent {
  title: string;
  description: string;
  cards: FlashCard[];
  totalCards: number;
  theme: string;
  subject: string;
  schoolYear: string;
  topicos: string;
  numberOfFlashcards: number;
  context: string;
  difficultyLevel: string;
  objectives: string;
  instructions: string;
  evaluation: string;
  generatedByAI: boolean;
  generatedAt: string;
  isGeneratedByAI: boolean;
  isFallback?: boolean;
  formDataUsed?: FlashCardsData;
}

export class FlashCardsGenerator {
  async generateFlashCardsContent(data: FlashCardsData): Promise<FlashCardsGeneratedContent> {
    console.log('🃏 Iniciando geração de Flash Cards com Gemini API:', data);

    try {
      // Validar dados obrigatórios
      if (!data.theme || !data.topicos) {
        throw new Error('Tema e tópicos são obrigatórios para gerar flash cards');
      }

      const numberOfCards = parseInt(data.numberOfFlashcards?.toString() || '10');

      // Preparar prompt para o Gemini
      const prompt = this.buildFlashCardsPrompt(data, numberOfCards);

      console.log('📝 Prompt enviado para Gemini:', prompt);

      // Chamar API do Gemini
      const response = await geminiClient.generateContent(prompt);

      console.log('✅ Resposta recebida do Gemini:', response);

      // Processar resposta
      const processedContent = this.processGeminiResponse(response, data, numberOfCards);

      console.log('📦 Conteúdo processado dos Flash Cards:', processedContent);

      return processedContent;

    } catch (error) {
      console.error('❌ Erro ao gerar Flash Cards:', error);

      // Fallback com dados estruturados
      return this.generateFallbackContent(data);
    }
  }

  private buildFlashCardsPrompt(data: FlashCardsData, numberOfCards: number): string {
    return `
Gere ${numberOfCards} flash cards educativos sobre o tema: "${data.theme}"

DADOS DO CONTEXTO:
- Disciplina: ${data.subject || 'Geral'}
- Ano de Escolaridade: ${data.schoolYear || 'Ensino Médio'}
- Tópicos Principais: ${data.topicos}
- Contexto de Uso: ${data.context || 'Estudos e revisão'}
- Nível de Dificuldade: ${data.difficultyLevel || 'Médio'}

INSTRUÇÕES ESPECÍFICAS:
1. Crie ${numberOfCards} flash cards com frente e verso
2. A frente deve ter uma pergunta, conceito ou termo
3. O verso deve ter a resposta completa, definição ou explicação
4. Varie o tipo de conteúdo: definições, exemplos, aplicações, fórmulas
5. Mantenha o nível adequado para ${data.schoolYear || 'estudantes do ensino médio'}
6. Foque nos tópicos: ${data.topicos}

FORMATO DE RESPOSTA OBRIGATÓRIO (JSON):
{
  "title": "Flash Cards: [tema]",
  "description": "Descrição dos flash cards",
  "cards": [
    {
      "id": 1,
      "front": "Pergunta ou conceito na frente do card",
      "back": "Resposta completa ou explicação no verso",
      "category": "Categoria do conteúdo",
      "difficulty": "Fácil|Médio|Difícil"
    }
  ],
  "isGeneratedByAI": true
}

Responda APENAS com o JSON válido, sem texto adicional.
    `.trim();
  }

  private processGeminiResponse(
    response: string, 
    data: FlashCardsData, 
    numberOfCards: number
  ): FlashCardsGeneratedContent {
    try {
      // Limpar e extrair JSON da resposta
      let cleanResponse = response.trim();

      // Remover markdown se presente
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsedResponse = JSON.parse(cleanResponse);

      // Validar estrutura da resposta
      if (!parsedResponse.cards || !Array.isArray(parsedResponse.cards)) {
        throw new Error('Resposta inválida: cards não encontrados');
      }

      // Processar e validar cards
      const validCards = parsedResponse.cards
        .filter((card: any) => card.front && card.back)
        .map((card: any, index: number) => ({
          id: index + 1,
          front: card.front.trim(),
          back: card.back.trim(),
          category: card.category || data.subject || 'Geral',
          difficulty: card.difficulty || data.difficultyLevel || 'Médio'
        }));

      if (validCards.length === 0) {
        throw new Error('Nenhum card válido encontrado na resposta');
      }

      // Construir conteúdo final
      return {
        title: parsedResponse.title || `Flash Cards: ${data.theme}`,
        description: parsedResponse.description || `Flash cards sobre ${data.theme}`,
        cards: validCards,
        totalCards: validCards.length,
        theme: data.theme,
        subject: data.subject || 'Geral',
        schoolYear: data.schoolYear || 'Ensino Médio',
        topicos: data.topicos,
        numberOfFlashcards: validCards.length,
        context: data.context || 'Estudos e revisão',
        difficultyLevel: data.difficultyLevel || 'Médio',
        objectives: data.objectives || `Facilitar o aprendizado sobre ${data.theme}`,
        instructions: data.instructions || 'Use os flash cards para estudar e revisar o conteúdo',
        evaluation: data.evaluation || 'Avalie o conhecimento através da prática com os cards',
        generatedByAI: true,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true,
        isFallback: false,
        formDataUsed: data
      };

    } catch (error) {
      console.error('❌ Erro ao processar resposta do Gemini:', error);
      throw new Error(`Falha ao processar resposta da IA: ${error.message}`);
    }
  }

  private generateFallbackContent(data: FlashCardsData): FlashCardsGeneratedContent {
    console.log('🛡️ Gerando conteúdo de fallback para Flash Cards');

    const numberOfCards = parseInt(data.numberOfFlashcards?.toString() || '5');
    const topicos = data.topicos.split('\n').filter(t => t.trim());

    // Gerar cards de exemplo baseados nos tópicos
    const fallbackCards: FlashCard[] = [];

    for (let i = 0; i < Math.min(numberOfCards, topicos.length * 2); i++) {
      const topico = topicos[i % topicos.length];
      const cardNumber = Math.floor(i / topicos.length) + 1;

      fallbackCards.push({
        id: i + 1,
        front: cardNumber === 1 
          ? `O que é ${topico}?`
          : `Qual a importância de ${topico} em ${data.subject}?`,
        back: cardNumber === 1
          ? `${topico} é um conceito fundamental em ${data.subject} para ${data.schoolYear}.`
          : `${topico} é importante porque permite compreender melhor os fundamentos de ${data.subject}.`,
        category: data.subject || 'Geral',
        difficulty: data.difficultyLevel || 'Médio'
      });
    }

    return {
      title: `Flash Cards: ${data.theme} (Modo Demonstração)`,
      description: `Flash cards sobre ${data.theme} gerados em modo demonstração`,
      cards: fallbackCards,
      totalCards: fallbackCards.length,
      theme: data.theme,
      subject: data.subject || 'Geral',
      schoolYear: data.schoolYear || 'Ensino Médio',
      topicos: data.topicos,
      numberOfFlashcards: fallbackCards.length,
      context: data.context || 'Estudos e revisão',
      difficultyLevel: data.difficultyLevel || 'Médio',
      objectives: data.objectives || `Facilitar o aprendizado sobre ${data.theme}`,
      instructions: data.instructions || 'Use os flash cards para estudar e revisar o conteúdo',
      evaluation: data.evaluation || 'Avalie o conhecimento através da prática com os cards',
      generatedByAI: false,
      generatedAt: new Date().toISOString(),
      isGeneratedByAI: false,
      isFallback: true,
      formDataUsed: data
    };
  }
}