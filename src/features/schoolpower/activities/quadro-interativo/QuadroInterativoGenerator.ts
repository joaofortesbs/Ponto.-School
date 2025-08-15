
import { GeminiClient } from '@/utils/api/geminiClient';

interface QuadroInterativoData {
  subject?: string;
  schoolYear?: string;
  theme?: string;
  objectives?: string;
  difficultyLevel?: string;
  quadroInterativoCampoEspecifico?: string;
  [key: string]: any;
}

interface GeneratedContent {
  card1: {
    titulo: string;
    conteudo: string;
  };
  card2: {
    titulo: string;
    conteudo: string;
  };
}

class QuadroInterativoGenerator {
  static async generateContent(data: QuadroInterativoData): Promise<GeneratedContent> {
    try {
      console.log('🎯 QuadroInterativoGenerator - Iniciando geração com dados:', data);

      const geminiClient = new GeminiClient();

      // Extrair dados dos campos personalizados
      const disciplina = data.subject || data['Disciplina / Área de conhecimento'] || '';
      const anoSerie = data.schoolYear || data['Ano / Série'] || '';
      const tema = data.theme || data['Tema ou Assunto da aula'] || '';
      const objetivo = data.objectives || data['Objetivo de aprendizagem da aula'] || '';
      const dificuldade = data.difficultyLevel || data['Nível de Dificuldade'] || '';
      const atividade = data.quadroInterativoCampoEspecifico || data['Atividade mostrada'] || '';

      console.log('📋 Dados extraídos:', {
        disciplina,
        anoSerie,
        tema,
        objetivo,
        dificuldade,
        atividade
      });

      const prompt = this.buildPrompt({
        disciplina,
        anoSerie,
        tema,
        objetivo,
        dificuldade,
        atividade
      });

      console.log('📝 Prompt construído:', prompt.substring(0, 300) + '...');

      const response = await geminiClient.generate({
        prompt,
        temperature: 0.7,
        maxTokens: 2000,
        topP: 0.9,
        topK: 40
      });

      if (!response.success) {
        throw new Error(`Erro na API Gemini: ${response.error}`);
      }

      console.log('✅ Resposta recebida do Gemini:', response.result.substring(0, 200) + '...');

      const generatedContent = this.parseResponse(response.result);
      console.log('🎯 Conteúdo parseado:', generatedContent);

      return generatedContent;

    } catch (error) {
      console.error('❌ Erro no QuadroInterativoGenerator:', error);
      
      // Fallback com conteúdo baseado nos dados fornecidos
      return this.createFallbackContent(data);
    }
  }

  private static buildPrompt(dados: {
    disciplina: string;
    anoSerie: string;
    tema: string;
    objetivo: string;
    dificuldade: string;
    atividade: string;
  }): string {
    return `
Você é um especialista em educação e deve criar conteúdo educacional para um Quadro Interativo com 2 cards.

CONTEXTO EDUCACIONAL:
- Disciplina: ${dados.disciplina}
- Ano/Série: ${dados.anoSerie}
- Tema da Aula: ${dados.tema}
- Objetivo: ${dados.objetivo}
- Nível de Dificuldade: ${dados.dificuldade}
- Atividade Relacionada: ${dados.atividade}

INSTRUÇÕES PARA CRIAÇÃO DOS CARDS:

CARD 1 - "Introdução":
- Título: Relacionado ao tema principal
- Conteúdo: Introdução clara e envolvente sobre o tema, adequada para o ano/série
- Deve despertar o interesse e curiosidade dos alunos
- Inclua conceitos fundamentais de forma didática

CARD 2 - "Desenvolvimento":
- Título: Focado no desenvolvimento do conteúdo
- Conteúdo: Aprofundamento do tema com exemplos práticos
- Deve conectar teoria e prática
- Inclua aplicações reais do conhecimento

REQUISITOS:
- Linguagem adequada para o ano/série especificado
- Conteúdo educativo e engajador
- Textos entre 80-150 palavras por card
- Relacionado diretamente com a disciplina e tema

FORMATO DE RESPOSTA (JSON):
{
  "card1": {
    "titulo": "Título do Card 1",
    "conteudo": "Conteúdo educativo do card 1..."
  },
  "card2": {
    "titulo": "Título do Card 2",
    "conteudo": "Conteúdo educativo do card 2..."
  }
}

Responda APENAS com o JSON válido, sem comentários adicionais.`;
  }

  private static parseResponse(response: string): GeneratedContent {
    try {
      // Limpar resposta
      let cleanResponse = response.trim();
      
      // Remover markdown code blocks se existirem
      cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      
      // Extrair JSON da resposta
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }

      console.log('🔍 Tentando parsear:', cleanResponse.substring(0, 200) + '...');

      const parsed = JSON.parse(cleanResponse);

      // Validar estrutura
      if (parsed.card1 && parsed.card2 && 
          parsed.card1.titulo && parsed.card1.conteudo &&
          parsed.card2.titulo && parsed.card2.conteudo) {
        return parsed;
      } else {
        throw new Error('Estrutura JSON inválida');
      }

    } catch (error) {
      console.error('❌ Erro ao parsear resposta:', error);
      console.log('📝 Resposta original:', response);
      
      // Tentar extrair conteúdo de forma mais flexível
      return this.extractContentFlexibly(response);
    }
  }

  private static extractContentFlexibly(response: string): GeneratedContent {
    // Implementar extração mais flexível
    const defaultContent = {
      card1: {
        titulo: "Introdução ao Tema",
        conteudo: "Conteúdo introdutório gerado automaticamente com base nas informações fornecidas."
      },
      card2: {
        titulo: "Desenvolvimento",
        conteudo: "Desenvolvimento do conteúdo educacional personalizado para a atividade."
      }
    };

    // Tentar extrair títulos e conteúdos usando regex
    const tituloPattern = /(?:título?|title)[\s"':]*([^"\n]+)/gi;
    const conteudoPattern = /(?:conteúdo?|content)[\s"':]*([^"]+)/gi;

    const titulos = [];
    const conteudos = [];
    
    let match;
    while ((match = tituloPattern.exec(response)) !== null) {
      titulos.push(match[1].trim());
    }
    
    while ((match = conteudoPattern.exec(response)) !== null) {
      conteudos.push(match[1].trim());
    }

    if (titulos.length >= 2 && conteudos.length >= 2) {
      return {
        card1: {
          titulo: titulos[0],
          conteudo: conteudos[0]
        },
        card2: {
          titulo: titulos[1],
          conteudo: conteudos[1]
        }
      };
    }

    return defaultContent;
  }

  private static createFallbackContent(data: QuadroInterativoData): GeneratedContent {
    const tema = data.theme || data['Tema ou Assunto da aula'] || 'Tema da Aula';
    const disciplina = data.subject || data['Disciplina / Área de conhecimento'] || 'Disciplina';

    return {
      card1: {
        titulo: `Introdução: ${tema}`,
        conteudo: `Bem-vindos ao estudo de ${tema} em ${disciplina}. Este conteúdo foi desenvolvido especialmente para proporcionar uma experiência de aprendizagem envolvente e significativa. Vamos explorar os conceitos fundamentais e suas aplicações práticas.`
      },
      card2: {
        titulo: `Desenvolvimento: ${tema}`,
        conteudo: `Agora vamos aprofundar nosso conhecimento sobre ${tema}. É importante compreender como estes conceitos se conectam com situações reais e como podemos aplicá-los em nosso dia a dia. Vamos descobrir juntos as possibilidades de aprendizagem.`
      }
    };
  }
}

export default QuadroInterativoGenerator;
