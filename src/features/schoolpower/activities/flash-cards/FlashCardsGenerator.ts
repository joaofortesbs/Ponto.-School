
interface FlashCardData {
  title: string;
  description: string;
  theme: string;
  topicos: string;
  numberOfFlashcards: string;
  context: string;
}

interface FlashCard {
  id: number;
  question: string;
  answer: string;
  category: string;
}

interface FlashCardsResponse {
  cards: FlashCard[];
  description: string;
  totalCards: number;
  isGeneratedByAI: boolean;
}

export class FlashCardsGenerator {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  async generateFlashCardsContent(data: FlashCardData): Promise<FlashCardsResponse> {
    try {
      // Validar entrada
      if (!data.theme || !data.topicos) {
        throw new Error('Tema e tópicos são obrigatórios para gerar flash cards');
      }

      if (!this.apiKey) {
        return this.createFallbackContent(data);
      }

      // Preparar prompt para o Gemini
      const prompt = this.buildPrompt(data);

      // Fazer chamada para a API Gemini
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`, {
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
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API Gemini: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
        throw new Error('Resposta inválida da API Gemini');
      }

      const generatedText = result.candidates[0].content.parts[0].text;

      // Tentar parsear o JSON
      const parsedContent = this.parseGeneratedContent(generatedText, data);

      return parsedContent;

    } catch (error) {
      console.error('❌ Erro na geração com Gemini:', error);
      console.log('🛡️ Usando conteúdo de fallback');
      return this.createFallbackContent(data);
    }
  }

  private buildPrompt(data: FlashCardData): string {
    const numberOfCards = parseInt(data.numberOfFlashcards) || 10;
    
    return `
Você é um especialista em educação e precisa criar ${numberOfCards} flash cards sobre o tema "${data.theme}".

Tópicos principais a abordar: ${data.topicos}
Contexto de uso: ${data.context}

FORMATO DE SAÍDA OBRIGATÓRIO (JSON):
{
  "cards": [
    {
      "id": 1,
      "question": "pergunta clara e objetiva",
      "answer": "resposta completa e educativa",
      "category": "categoria do card"
    }
  ],
  "description": "descrição geral dos flash cards",
  "totalCards": ${numberOfCards}
}

REGRAS:
1. Crie exatamente ${numberOfCards} flash cards
2. Cada pergunta deve ser clara e específica sobre ${data.theme}
3. Cada resposta deve ser completa e educativa
4. Use linguagem adequada para estudantes
5. Varie o tipo de perguntas: conceitos, aplicações, exemplos
6. Retorne APENAS o JSON, sem texto adicional

Tópicos para os flash cards: ${data.topicos}
`;
  }

  private parseGeneratedContent(generatedText: string, data: FlashCardData): FlashCardsResponse {
    try {
      // Limpar o texto e tentar extrair JSON
      let jsonText = generatedText.trim();
      
      // Remover markdown se presente
      jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Tentar encontrar o JSON no texto
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonText);
      console.log('📋 JSON parseado:', parsed);

      // Validar estrutura
      if (!parsed.cards || !Array.isArray(parsed.cards)) {
        throw new Error('Estrutura inválida: cards não é um array');
      }

      // Validar cada card
      const validCards = parsed.cards.map((card: any, index: number) => {
        if (!card.question || !card.answer) {
          console.warn(`⚠️ Card ${index + 1} inválido, usando fallback`);
          const topics = data.topicos.split(',').map(t => t.trim());
          const topic = topics[index % topics.length];
          
          return {
            id: index + 1,
            question: card.question || `O que você sabe sobre ${topic}?`,
            answer: card.answer || `${topic} é um conceito importante em ${data.theme}.`,
            category: card.category || data.theme
          };
        }

        return {
          id: card.id || index + 1,
          question: card.question,
          answer: card.answer,
          category: card.category || data.theme
        };
      });

      return {
        cards: validCards,
        description: parsed.description || `Flash Cards sobre ${data.theme}`,
        totalCards: validCards.length,
        isGeneratedByAI: true
      };

    } catch (error) {
      console.error('❌ Erro ao parsear conteúdo da IA:', error);
      console.log('🔄 Retornando para fallback após falha no parsing');
      throw error;
    }
  }

  private createFallbackContent(data: FlashCardData): FlashCardsResponse {
    const numberOfCards = parseInt(data.numberOfFlashcards) || 5;
    const topicsList = data.topicos ? data.topicos.split(',').map(t => t.trim()) : ['Conceitos básicos'];

    const cards = Array.from({ length: numberOfCards }, (_, index) => {
      const topic = topicsList[index % topicsList.length];
      return {
        id: index + 1,
        question: `O que você sabe sobre ${topic} em ${data.theme}?`,
        answer: `${topic} é um conceito importante em ${data.theme}. ${data.context ? `No contexto: ${data.context}` : 'É fundamental para o entendimento do tema.'}`,
        category: data.theme || 'Geral'
      };
    });

    return {
      cards,
      description: `Flash Cards sobre ${data.theme} (Conteúdo de demonstração)`,
      totalCards: numberOfCards,
      isGeneratedByAI: false
    };
  }
}

export default FlashCardsGenerator;
