
import { geminiClient } from '@/utils/api/geminiClient';
import { getQualityPromptForFlashCards, type QualityContext } from '@/features/schoolpower/agente-jota/prompts/quality-prompt-templates';

export interface FlashCard {
  id: number;
  front: string;
  back: string;
  category?: string;
  difficulty?: string;
}

export interface FlashCardsData {
  title?: string;
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
  contextoUso: string;
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
      if (!data.theme || typeof data.theme !== 'string' || data.theme.trim() === '') {
        throw new Error('Tema é obrigatório para gerar flash cards');
      }

      if (!data.topicos || typeof data.topicos !== 'string' || data.topicos.trim() === '') {
        throw new Error('Tópicos são obrigatórios para gerar flash cards');
      }

      const numberOfCards = parseInt(data.numberOfFlashcards?.toString() || '10');

      if (numberOfCards <= 0 || numberOfCards > 50) {
        throw new Error('Número de cards deve estar entre 1 e 50');
      }
      
      console.log('✅ Validação inicial passou - Tema:', data.theme, '| Tópicos:', data.topicos, '| Quantidade:', numberOfCards);

      // Preparar prompt otimizado para o Gemini
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
    const qualityCtx: QualityContext = {
      tema: data.theme,
      disciplina: data.subject || 'Geral',
      anoSerie: data.schoolYear || 'Ensino Médio',
      objetivo: `Flash Cards sobre ${data.theme}`
    };
    const qualityDirectives = getQualityPromptForFlashCards(qualityCtx);

    return `
Você é um especialista em educação e técnicas de memorização ativa. Gere exatamente ${numberOfCards} flash cards educativos de ALTA QUALIDADE sobre o tema: "${data.theme}"

CONTEXTO EDUCACIONAL:
- Disciplina: ${data.subject || 'Geral'}
- Ano de Escolaridade: ${data.schoolYear || 'Ensino Médio'}
- Tópicos Principais: ${data.topicos}
- Contexto de Uso: ${data.context || 'Estudos e revisão'}
- Nível de Dificuldade: ${data.difficultyLevel || 'Médio'}

${qualityDirectives}

DIRETRIZES PARA CRIAÇÃO:
1. Crie exatamente ${numberOfCards} flash cards únicos e distintos
2. Para cada card:
   - FRENTE: Uma pergunta clara e direta, conceito-chave ou situação-problema
   - VERSO: Resposta completa com explicação detalhada, exemplo prático e dica mnemônica quando aplicável
3. Varie os tipos de conteúdo:
   - Definições conceituais com exemplos
   - Aplicações práticas do cotidiano
   - Comparações e contrastes entre conceitos
   - Fórmulas com explicação do significado (se aplicável)
   - Conexões interdisciplinares
4. Mantenha linguagem adequada para ${data.schoolYear || 'estudantes do ensino médio'}
5. Foque especificamente nos tópicos listados: ${data.topicos}
6. Garanta progressão lógica de dificuldade
7. Cada card deve ter campo "difficulty" indicando "Fácil", "Médio" ou "Difícil"

FORMATO DE RESPOSTA OBRIGATÓRIO (JSON válido):
{
  "title": "Flash Cards: ${data.theme}",
  "description": "Flash cards educativos sobre ${data.theme} para ${data.schoolYear || 'ensino médio'}",
  "instrucoes_uso": "Orientações de como usar estes flash cards para máximo aproveitamento (técnica de revisão espaçada, dicas de estudo).",
  "cards": [
    {
      "id": 1,
      "front": "Pergunta ou conceito específico aqui",
      "back": "Resposta completa: [definição]. Exemplo: [exemplo prático]. Dica: [mnemônico ou associação].",
      "category": "${data.subject || 'Geral'}",
      "difficulty": "Fácil|Médio|Difícil"
    }
  ],
  "isGeneratedByAI": true
}

IMPORTANTE: 
- Responda APENAS com o JSON válido, sem texto adicional
- Garanta que todos os ${numberOfCards} cards sejam únicos e educativos
- Use aspas duplas para strings JSON
- Evite caracteres especiais que quebrem o JSON
- PROGRESSÃO: Primeiros cards mais simples, últimos mais complexos
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
      cleanResponse = cleanResponse.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
      
      // Remover possíveis textos antes/depois do JSON
      const jsonStart = cleanResponse.indexOf('{');
      const jsonEnd = cleanResponse.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanResponse = cleanResponse.substring(jsonStart, jsonEnd + 1);
      }

      console.log('🧹 Resposta limpa:', cleanResponse);

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(cleanResponse);
      } catch (parseError) {
        console.error('❌ Erro ao parsear JSON:', parseError);
        throw new Error(`JSON inválido recebido da API: ${parseError.message}`);
      }

      // Validar estrutura da resposta
      if (!parsedResponse.cards || !Array.isArray(parsedResponse.cards)) {
        throw new Error('Resposta inválida: propriedade "cards" não encontrada ou não é array');
      }

      if (parsedResponse.cards.length === 0) {
        throw new Error('Nenhum card encontrado na resposta da API');
      }

      // Processar e validar cards com mais rigor
      const validCards: FlashCard[] = [];
      
      for (let i = 0; i < parsedResponse.cards.length; i++) {
        const card = parsedResponse.cards[i];
        
        if (!card || typeof card !== 'object') {
          console.warn(`⚠️ Card ${i + 1} não é um objeto válido:`, card);
          continue;
        }

        if (!card.front || typeof card.front !== 'string' || card.front.trim() === '') {
          console.warn(`⚠️ Card ${i + 1} sem frente válida:`, card);
          continue;
        }

        if (!card.back || typeof card.back !== 'string' || card.back.trim() === '') {
          console.warn(`⚠️ Card ${i + 1} sem verso válido:`, card);
          continue;
        }

        // Card válido, adicionar à lista
        validCards.push({
          id: validCards.length + 1,
          front: card.front.trim(),
          back: card.back.trim(),
          category: card.category || data.subject || 'Geral',
          difficulty: card.difficulty || data.difficultyLevel || 'Médio'
        });
      }

      if (validCards.length === 0) {
        throw new Error('Nenhum card válido encontrado após processamento');
      }

      // Construir conteúdo final
      const result = {
        title: parsedResponse.title || data.title || `Flash Cards: ${data.theme}`,
        description: parsedResponse.description || `Flash cards sobre ${data.theme} para ${data.schoolYear || 'ensino médio'}`,
        cards: validCards,
        totalCards: validCards.length,
        theme: data.theme,
        subject: data.subject || 'Geral',
        schoolYear: data.schoolYear || 'Ensino Médio',
        topicos: data.topicos,
        numberOfFlashcards: validCards.length,
        contextoUso: data.context || 'Estudos e revisão',
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

      console.log('✅ Conteúdo final gerado:', result);
      return result;

    } catch (error) {
      console.error('❌ Erro ao processar resposta do Gemini:', error);
      throw new Error(`Falha ao processar resposta da IA: ${error.message}`);
    }
  }

  private generateFallbackContent(data: FlashCardsData): FlashCardsGeneratedContent {
    console.log('🛡️ Gerando conteúdo de fallback para Flash Cards');

    const numberOfCards = Math.min(parseInt(data.numberOfFlashcards?.toString() || '5'), 20);
    const topicosList = data.topicos.split('\n').filter(t => t.trim());

    console.log(`📝 Processando fallback: ${numberOfCards} cards de ${topicosList.length} tópicos`);

    const fallbackCards: FlashCard[] = [];

    // Se temos tópicos, usar eles (repetindo se necessário)
    if (topicosList.length > 0) {
      for (let i = 0; i < numberOfCards; i++) {
        const topicoIndex = i % topicosList.length;
        const topico = topicosList[topicoIndex].trim();
        const cardType = i % 4; // Variar tipos de pergunta
        
        let front: string;
        let back: string;

        switch (cardType) {
          case 0:
            front = `O que é ${topico}?`;
            back = `${topico} é um conceito fundamental em ${data.subject || 'Geral'} que deve ser compreendido por estudantes do ${data.schoolYear || 'ensino médio'}. É importante para o desenvolvimento acadêmico nesta disciplina.`;
            break;
          case 1:
            front = `Qual a importância de ${topico}?`;
            back = `${topico} é importante porque permite compreender melhor os fundamentos de ${data.subject || 'Geral'} e aplicar esse conhecimento na prática, contribuindo para o aprendizado integral do estudante.`;
            break;
          case 2:
            front = `Como aplicar ${topico} na prática?`;
            back = `${topico} pode ser aplicado através do estudo sistemático, prática de exercícios e compreensão dos conceitos relacionados em ${data.subject || 'Geral'}, sempre considerando o contexto do ${data.schoolYear || 'ensino médio'}.`;
            break;
          default:
            front = `Defina ${topico}`;
            back = `${topico}: Conceito estudado em ${data.subject || 'Geral'}, relevante para estudantes do ${data.schoolYear || 'ensino médio'}, que requer compreensão teórica e aplicação prática para domínio completo.`;
        }

        fallbackCards.push({
          id: i + 1,
          front,
          back,
          category: data.subject || 'Geral',
          difficulty: data.difficultyLevel || 'Médio'
        });
      }
    } else {
      // Se não temos tópicos, criar cards genéricos baseados no tema
      console.warn('⚠️ Nenhum tópico fornecido, gerando cards genéricos');
      for (let i = 0; i < Math.max(numberOfCards, 3); i++) {
        fallbackCards.push({
          id: i + 1,
          front: `Conceito ${i + 1} sobre ${data.theme}`,
          back: `Este é um conceito importante relacionado a ${data.theme} em ${data.subject || 'Geral'}, adequado para estudantes do ${data.schoolYear || 'ensino médio'}.`,
          category: data.subject || 'Geral',
          difficulty: data.difficultyLevel || 'Médio'
        });
      }
    }
    
    console.log(`✅ Fallback gerou ${fallbackCards.length} cards válidos`);

    return {
      title: data.title || `Flash Cards: ${data.theme} (Modo Demonstração)`,
      description: `Flash cards sobre ${data.theme} gerados em modo demonstração para ${data.schoolYear || 'ensino médio'}`,
      cards: fallbackCards,
      totalCards: fallbackCards.length,
      theme: data.theme,
      subject: data.subject || 'Geral',
      schoolYear: data.schoolYear || 'Ensino Médio',
      topicos: data.topicos,
      numberOfFlashcards: fallbackCards.length,
      contextoUso: data.context || 'Estudos e revisão',
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
