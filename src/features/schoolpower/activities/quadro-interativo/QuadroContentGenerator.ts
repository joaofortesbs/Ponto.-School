
import { geminiClient } from '@/utils/api/geminiClient';

export interface QuadroGenerationData {
  disciplina: string;
  anoSerie: string;
  tema: string;
  objetivo: string;
  contexto?: string;
}

export interface QuadroContent {
  id: string;
  type: 'texto' | 'atividade';
  content: string;
  title: string;
  visualElements?: string[];
}

export class QuadroContentGenerator {
  /**
   * Gera conteúdo para os 3 quadros de sala de aula
   */
  static async generateQuadrosContent(data: QuadroGenerationData): Promise<QuadroContent[]> {
    try {
      console.log('🎯 Gerando conteúdo dos quadros para:', data);

      const prompt = this.buildQuadroPrompt(data);
      const response = await geminiClient.generateContent(prompt);

      if (!response || !response.text) {
        throw new Error('Resposta inválida da API Gemini');
      }

      const quadrosData = this.parseQuadroResponse(response.text);
      
      console.log('✅ Quadros gerados com sucesso:', quadrosData);
      return quadrosData;

    } catch (error) {
      console.error('❌ Erro ao gerar conteúdo dos quadros:', error);
      return this.getFallbackQuadros(data);
    }
  }

  /**
   * Gera conteúdo para um quadro específico
   */
  static async regenerateQuadro(data: QuadroGenerationData, quadroId: string, type: 'texto' | 'atividade'): Promise<QuadroContent> {
    try {
      console.log('🔄 Regenerando quadro:', quadroId, type);

      const prompt = this.buildSingleQuadroPrompt(data, type);
      const response = await geminiClient.generateContent(prompt);

      if (!response || !response.text) {
        throw new Error('Resposta inválida da API Gemini');
      }

      const quadroContent = this.parseSingleQuadroResponse(response.text, quadroId, type);
      
      console.log('✅ Quadro regenerado:', quadroContent);
      return quadroContent;

    } catch (error) {
      console.error('❌ Erro ao regenerar quadro:', error);
      return this.getFallbackSingleQuadro(data, quadroId, type);
    }
  }

  /**
   * Constrói o prompt para gerar todos os quadros
   */
  private static buildQuadroPrompt(data: QuadroGenerationData): string {
    return `
# GERADOR DE QUADROS DE SALA DE AULA - SCHOOL POWER

## CONTEXTO DA AULA
- **Disciplina:** ${data.disciplina}
- **Ano/Série:** ${data.anoSerie}
- **Tema:** ${data.tema}
- **Objetivo:** ${data.objetivo}
- **Contexto Adicional:** ${data.contexto || 'Aula regular'}

## TAREFA
Gere conteúdo para 3 quadros de sala de aula que o professor usará durante a aula:

### QUADRO 1 - CONCEITOS PRINCIPAIS (TEXTO)
Conteúdo escrito que deve ser colocado no quadro para explicar os conceitos principais do tema.
- Use linguagem apropriada para o ano/série
- Inclua definições, fórmulas ou conceitos chave
- Máximo 200 palavras

### QUADRO 2 - ATIVIDADE PRÁTICA (ATIVIDADE)
Descrição de uma atividade prática que o professor pode aplicar em sala.
- Deve ser interativa e engajante
- Relacionada diretamente ao tema
- Instruções claras e objetivas
- Máximo 150 palavras

### QUADRO 3 - RESUMO E CONCLUSÃO (TEXTO)
Síntese dos pontos mais importantes da aula.
- Resumo dos conceitos principais
- Pontos de fixação
- Conexão com próximas aulas
- Máximo 180 palavras

## FORMATO DE RESPOSTA
Retorne EXATAMENTE no formato JSON:

\`\`\`json
{
  "quadro1": {
    "title": "Conceitos Principais",
    "content": "conteúdo do quadro 1...",
    "type": "texto"
  },
  "quadro2": {
    "title": "Atividade Prática",
    "content": "descrição da atividade...",
    "type": "atividade"
  },
  "quadro3": {
    "title": "Resumo e Conclusão",
    "content": "conteúdo do quadro 3...",
    "type": "texto"
  }
}
\`\`\`

IMPORTANTE: Responda APENAS com o JSON, sem explicações adicionais.
`;
  }

  /**
   * Constrói prompt para um quadro específico
   */
  private static buildSingleQuadroPrompt(data: QuadroGenerationData, type: 'texto' | 'atividade'): string {
    const typeInstructions = type === 'texto' 
      ? 'Gere conteúdo educativo em texto para ser escrito no quadro'
      : 'Gere uma atividade prática interativa para sala de aula';

    return `
# GERAÇÃO DE QUADRO INDIVIDUAL - SCHOOL POWER

## CONTEXTO
- **Disciplina:** ${data.disciplina}
- **Ano/Série:** ${data.anoSerie}
- **Tema:** ${data.tema}
- **Objetivo:** ${data.objetivo}

## TAREFA
${typeInstructions}

**Tipo:** ${type === 'texto' ? 'Conteúdo Textual' : 'Atividade Prática'}

## FORMATO DE RESPOSTA
Retorne EXATAMENTE no formato JSON:

\`\`\`json
{
  "title": "Título do quadro",
  "content": "conteúdo detalhado...",
  "type": "${type}"
}
\`\`\`

IMPORTANTE: Responda APENAS com o JSON, sem explicações adicionais.
`;
  }

  /**
   * Faz parse da resposta da API para todos os quadros
   */
  private static parseQuadroResponse(responseText: string): QuadroContent[] {
    try {
      // Extrair JSON da resposta
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : responseText;
      
      const parsedData = JSON.parse(jsonText);
      
      return [
        {
          id: 'quadro-1',
          type: 'texto',
          title: parsedData.quadro1?.title || 'Conceitos Principais',
          content: parsedData.quadro1?.content || 'Conteúdo não disponível'
        },
        {
          id: 'quadro-2',
          type: 'atividade',
          title: parsedData.quadro2?.title || 'Atividade Prática',
          content: parsedData.quadro2?.content || 'Atividade não disponível'
        },
        {
          id: 'quadro-3',
          type: 'texto',
          title: parsedData.quadro3?.title || 'Resumo e Conclusão',
          content: parsedData.quadro3?.content || 'Conteúdo não disponível'
        }
      ];
    } catch (error) {
      console.error('Erro ao fazer parse da resposta:', error);
      throw error;
    }
  }

  /**
   * Parse para um quadro específico
   */
  private static parseSingleQuadroResponse(responseText: string, quadroId: string, type: 'texto' | 'atividade'): QuadroContent {
    try {
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : responseText;
      
      const parsedData = JSON.parse(jsonText);
      
      return {
        id: quadroId,
        type: type,
        title: parsedData.title || 'Quadro Regenerado',
        content: parsedData.content || 'Conteúdo não disponível'
      };
    } catch (error) {
      console.error('Erro ao fazer parse do quadro:', error);
      throw error;
    }
  }

  /**
   * Retorna quadros fallback em caso de erro
   */
  private static getFallbackQuadros(data: QuadroGenerationData): QuadroContent[] {
    return [
      {
        id: 'quadro-1',
        type: 'texto',
        title: 'Conceitos Principais',
        content: `Tema: ${data.tema}\n\nObjetivo: ${data.objetivo}\n\nDisciplina: ${data.disciplina} - ${data.anoSerie}`
      },
      {
        id: 'quadro-2',
        type: 'atividade',
        title: 'Atividade Prática',
        content: `Atividade relacionada ao tema "${data.tema}" será desenvolvida durante a aula com participação dos alunos.`
      },
      {
        id: 'quadro-3',
        type: 'texto',
        title: 'Resumo e Conclusão',
        content: `Pontos principais da aula sobre ${data.tema} serão revisados e fixados ao final da sessão.`
      }
    ];
  }

  /**
   * Retorna um quadro fallback individual
   */
  private static getFallbackSingleQuadro(data: QuadroGenerationData, quadroId: string, type: 'texto' | 'atividade'): QuadroContent {
    const content = type === 'texto' 
      ? `Conteúdo sobre ${data.tema} para ${data.disciplina} - ${data.anoSerie}`
      : `Atividade prática sobre ${data.tema} para engajar os alunos`;

    return {
      id: quadroId,
      type: type,
      title: type === 'texto' ? 'Conteúdo Educativo' : 'Atividade Prática',
      content: content
    };
  }
}
