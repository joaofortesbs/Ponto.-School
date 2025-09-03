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
  title?: string;
  theme?: string;
  topicos?: string;
  context?: string;
  generatedAt?: string;
}

export class FlashCardsGenerator {
  private apiKey: string;

  constructor() {
    // Usar a API key centralizada do sistema
    this.apiKey = 'AIzaSyD-Sso0SdyYKoA4M3tQhcWjQ1AoddB7Wo4';
    console.log('🔑 FlashCardsGenerator inicializado com API key:', this.apiKey ? 'Presente' : 'Ausente');
  }

  async generateFlashCardsContent(data: FlashCardData): Promise<FlashCardsResponse> {
    console.log('🚀 Iniciando geração de Flash Cards:', data);
    
    try {
      // Validar entrada
      if (!data.theme || !data.topicos) {
        console.warn('⚠️ Dados incompletos, criando fallback');
        return this.createFallbackContent(data);
      }

      if (!this.apiKey) {
        console.warn('⚠️ API key não encontrada, usando fallback');
        return this.createFallbackContent(data);
      }

      console.log('✅ Dados validados, prosseguindo com API Gemini');

      // Preparar prompt para o Gemini
      const prompt = this.buildPrompt(data);

      // Fazer chamada para a API Gemini com timeout
      console.log('📡 Enviando requisição para API Gemini...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
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
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

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

  private parseGeneratedContent(responseText: string, data: FlashCardData): FlashCardsResponse {
    try {
      console.log('🔍 Parseando resposta da API:', responseText.substring(0, 200) + '...');

      // Limpar resposta JSON
      let cleanedResponse = responseText.trim();

      // Remover markdown se presente
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      // Encontrar início e fim do JSON
      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
      }

      const parsedContent = JSON.parse(cleanedResponse);
      console.log('📋 Conteúdo parseado:', parsedContent);

      // Validar estrutura
      if (!parsedContent.cards || !Array.isArray(parsedContent.cards)) {
        throw new Error('Resposta não contém array de cards válido');
      }

      // Processar cards com validação rigorosa
      const processedCards = parsedContent.cards
        .filter((card: any) => card && card.question && card.answer)
        .map((card: any, index: number) => ({
          id: card.id || index + 1,
          question: String(card.question).trim(),
          answer: String(card.answer).trim(),
          category: card.category || data.theme || 'Geral'
        }));

      console.log(`✅ ${processedCards.length} cards processados com sucesso`);

      const result = {
        cards: processedCards,
        description: parsedContent.description || `Flash cards sobre ${data.theme}`,
        totalCards: processedCards.length,
        isGeneratedByAI: true,
        title: data.title,
        theme: data.theme,
        topicos: data.topicos,
        context: data.context,
        generatedAt: new Date().toISOString()
      };

      console.log('🎯 Resultado final da geração:', result);
      return result;

    } catch (error) {
      console.error('❌ Erro ao parsear conteúdo gerado:', error);
      console.error('📄 Texto original:', responseText);
      throw new Error(`Erro no parsing: ${error.message}`);
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

    const finalResult = {
      title: data.title || `Flash Cards - ${data.theme}`,
      description: data.description || `Flash Cards sobre ${data.theme}`,
      theme: data.theme,
      topicos: data.topicos,
      context: data.context,
      cards,
      totalCards: numberOfCards,
      numberOfFlashcards: numberOfCards,
      isGeneratedByAI: false,
      isFallback: true,
      generatedAt: new Date().toISOString()
    };

    // Notificar o sistema centralizado
    setTimeout(() => {
      try {
        const eventDetail = { 
          data: finalResult, 
          source: 'FlashCardsGenerator',
          timestamp: Date.now()
        };

        const eventTypes = [
          'flash-cards-generated',
          'flash-cards-content-ready'
        ];

        eventTypes.forEach(eventType => {
          window.dispatchEvent(new CustomEvent(eventType, { detail: eventDetail }));
        });

        console.log('📡 FlashCardsGenerator: Eventos disparados', eventTypes);
      } catch (error) {
        console.warn('❌ FlashCardsGenerator: Erro ao disparar eventos:', error);
      }
    }, 100);

    return finalResult;
  }
}

export default FlashCardsGenerator;