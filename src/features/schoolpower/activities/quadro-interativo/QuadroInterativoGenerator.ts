import { geminiLogger } from '@/utils/geminiDebugLogger';

interface QuadroInterativoData {
  subject: string;
  schoolYear: string;
  theme: string;
  objectives: string;
  difficultyLevel: string;
  quadroInterativoCampoEspecifico: string;
}

interface QuadroInterativoContent {
  title: string;
  description: string;
  cardContent: {
    title: string;
    text: string;
  };
  cardContent2?: {
    title: string;
    text: string;
  };
  generatedAt: string;
  isGeneratedByAI: boolean;
  subject?: string;
  schoolYear?: string;
  theme?: string;
  objectives?: string;
  difficultyLevel?: string;
  quadroInterativoCampoEspecifico?: string;
  customFields?: Record<string, string>;
}

export class QuadroInterativoGenerator {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  async generateQuadroInterativoContent(data: QuadroInterativoData): Promise<QuadroInterativoContent> {
    geminiLogger.logRequest('Gerando conteúdo específico de Quadro Interativo', data);

    try {
      const prompt = this.buildEnhancedPrompt(data);
      console.log('📤 Enviando prompt para Gemini (tema:', data.theme, ')');
      console.log('📝 Prompt preview:', prompt.substring(0, 300) + '...');

      const response = await this.callGeminiAPI(prompt);
      console.log('📥 Resposta bruta recebida do Gemini:', JSON.stringify(response, null, 2));

      const parsedContent = this.parseGeminiResponse(response);
      console.log('✅ Conteúdo FINAL processado pela IA:', parsedContent);
      console.log('📊 Tamanhos - Título:', parsedContent.title?.length, 'Texto:', parsedContent.text?.length, 'Avançado:', parsedContent.advancedText?.length);

      const result: QuadroInterativoContent = {
        title: data.theme || 'Quadro Interativo',
        description: data.objectives || 'Atividade de quadro interativo',
        cardContent: {
          title: parsedContent.title || data.theme || 'Conteúdo do Quadro',
          text: parsedContent.text || 'Conteúdo educativo específico gerado pela IA.'
        },
        cardContent2: parsedContent.advancedText ? {
          title: `${parsedContent.title} - Nível Avançado`,
          text: parsedContent.advancedText
        } : undefined,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true,
        // Campos originais para compatibilidade
        subject: data.subject,
        schoolYear: data.schoolYear,
        theme: data.theme,
        objectives: data.objectives,
        difficultyLevel: data.difficultyLevel,
        quadroInterativoCampoEspecifico: data.quadroInterativoCampoEspecifico,
        // Campos customizados específicos
        customFields: {
          'Disciplina / Área de conhecimento': data.subject,
          'Ano / Série': data.schoolYear,
          'Tema ou Assunto da aula': data.theme,
          'Objetivo de aprendizagem da aula': data.objectives,
          'Nível de Dificuldade': data.difficultyLevel,
          'Atividade mostrada': data.quadroInterativoCampoEspecifico,
          'isAIGenerated': 'true',
          'generatedContent': JSON.stringify({
            cardContent: {
              title: parsedContent.title,
              text: parsedContent.text
            },
            cardContent2: parsedContent.advancedText ? {
              title: `${parsedContent.title} - Nível Avançado`,
              text: parsedContent.advancedText
            } : undefined,
            generatedAt: new Date().toISOString()
          })
        }
      };

      // DEBUG INTENSIVO - VERIFICAR CONTEÚDO FINAL
      console.log('🔥 CONTEÚDO ESPECÍFICO GERADO PELA IA GEMINI:', {
        tema: data.theme,
        tituloGerado: parsedContent.title,
        textoGerado: parsedContent.text.substring(0, 100) + '...',
        temaTituloContém: parsedContent.title?.toLowerCase().includes(data.theme.toLowerCase()),
        temaTextoContém: parsedContent.text?.toLowerCase().includes(data.theme.toLowerCase()),
        tamanhoTexto: parsedContent.text.length,
        cardContentFinal: result.cardContent
      });

      geminiLogger.logResponse(result, Date.now());
      console.log('✅ RESULTADO FINAL ENVIADO PARA O PREVIEW:', result);
      return result;

    } catch (error) {
      console.error('❌ ERRO na geração do conteúdo:', error);
      geminiLogger.logError(error as Error, { data });

      // Se falhar, ainda tenta retornar algo específico baseado no tema
      const specificFallback = this.generateSpecificFallback(data);
      console.log('⚠️ Usando fallback específico para o tema:', specificFallback);
      return specificFallback;
    }
  }

  private buildEnhancedPrompt(data: QuadroInterativoData): string {
    return `VOCÊ É UM PROFESSOR ESPECIALISTA BRASILEIRO. CRIE CONTEÚDO EDUCATIVO ULTRA-ESPECÍFICO PARA O TEMA "${data.theme}".

DADOS OBRIGATÓRIOS:
- Disciplina: ${data.subject}
- Ano/Série: ${data.schoolYear}
- Tema EXATO: ${data.theme}
- Objetivos: ${data.objectives}
- Nível: ${data.difficultyLevel}

⚠️ REGRAS CRÍTICAS:
1. NUNCA use textos genéricos como "Para você dominar este conteúdo"
2. SEMPRE mencione "${data.theme}" especificamente no conteúdo
3. SEMPRE forneça exemplos REAIS e CONCRETOS do tema
4. SEMPRE use linguagem DIRETA ao aluno
5. SEMPRE inclua passos ESPECÍFICOS e PRÁTICOS

📝 FORMATO OBRIGATÓRIO - JSON VÁLIDO (sem markdown, sem explicações):
{
  "title": "Como [verbo específico] ${data.theme}",
  "text": "Para você [ação específica com ${data.theme}]: 1) [passo prático específico], 2) [outro passo específico], 3) [passo final]. Exemplo real: [exemplo concreto de ${data.theme}]. Macete: [dica específica]. Cuidado: [erro comum específico de ${data.theme}].",
  "advancedText": "Dominando ${data.theme} avançado: [técnica específica avançada]. Para casos complexos de ${data.theme}: [estratégia específica]. Teste: [exercício específico de ${data.theme}]. Dica pro: [segredo específico do tema]."
}

EXEMPLOS ESPECÍFICOS OBRIGATÓRIOS:

Para tema "Substantivos Próprios e Verbos":
{
  "title": "Como Identificar Substantivos Próprios e Verbos",
  "text": "Para você identificar substantivos próprios, faça: 1) Procure nomes únicos (Maria, Brasil, Google). 2) Verifique se tem letra maiúscula inicial. 3) Teste: só existe um no mundo? É próprio! Para verbos: 1) Procure palavras de ação (correr, estudar, pensar). 2) Teste: 'Eu posso...' funciona? É verbo! Exemplo: 'Maria corre no parque' - Maria = próprio (nome único), corre = verbo (ação). Macete: próprio sempre maiúscula, verbo sempre expressa ação!",
  "advancedText": "Agora domine casos complexos: verbos compostos como 'tinha corrido' = locução verbal. Substantivos próprios que viram comuns: xerox, band-aid. Teste avançado: em 'O João da esquina vendeu bicicletas', identifique: João = próprio, vendeu = verbo, bicicletas = comum. Desafio: crie 5 frases com substantivos próprios de diferentes tipos (pessoa, lugar, marca). Dica pro: verbos mudam conforme tempo (correr/correu/correria)!"
}

Para tema "Equações do 1º Grau":
{
  "title": "Como Resolver Equações do 1º Grau",
  "text": "Para você resolver equações como 2x + 5 = 11, siga: 1) Isole o termo com x passando números para o outro lado: 2x = 11 - 5. 2) Calcule: 2x = 6. 3) Divida ambos os lados: x = 6÷2 = 3. 4) SEMPRE teste: 2(3) + 5 = 11 ✓. Regra de ouro: o que soma passa subtraindo, o que multiplica passa dividindo. Exemplo: 3x - 4 = 8 → 3x = 8 + 4 → 3x = 12 → x = 4. Cuidado: nunca esqueça de testar a resposta!",
  "advancedText": "Agora domine equações complexas: com parênteses como 2(x + 3) = 10. Primeiro distribua: 2x + 6 = 10, depois resolva: 2x = 4, x = 2. Para frações: x/2 + x/3 = 5, encontre MMC(2,3)=6: 3x/6 + 2x/6 = 5, então 5x/6 = 5, logo 5x = 30, x = 6. Desafio: resolva (x-1)/2 + (x+1)/3 = 4. Dica profissional: sempre simplifique frações antes de calcular!"
}

AGORA GERE CONTEÚDO ESPECÍFICO PARA O TEMA "${data.theme}":`;
  }

  private async callGeminiAPI(prompt: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('API Key do Gemini não configurada');
    }

    const startTime = Date.now();

    try {
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
            temperature: 0.3, // Mais determinístico para respostas específicas
            topK: 20,
            topP: 0.8,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro HTTP da API Gemini:', response.status, errorText);
        throw new Error(`Erro na API Gemini: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const executionTime = Date.now() - startTime;

      console.log('📊 Tempo de execução da API:', executionTime + 'ms');
      console.log('📥 Resposta completa da API Gemini:', JSON.stringify(data, null, 2));
      
      // Extrair texto da resposta estruturada da API Gemini
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log('📄 Texto extraído da resposta:', generatedText);
      
      geminiLogger.logResponse(data, executionTime);

      return generatedText;

    } catch (error) {
      console.error('❌ Erro na chamada da API Gemini:', error);
      geminiLogger.logError(error as Error, { prompt: prompt.substring(0, 200) });
      throw error;
    }
  }

  private parseGeminiResponse(response: any): { title: string; text: string; advancedText?: string } {
    console.log('🔄 Fazendo parse da resposta do Gemini...');
    console.log('📄 Resposta COMPLETA recebida:', response);

    try {
      // Limpar resposta removendo caracteres indesejados
      let cleanedResponse = response.trim();

      // Remover markdown se presente
      if (cleanedResponse.includes('```json')) {
        const jsonMatch = cleanedResponse.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          cleanedResponse = jsonMatch[1];
        }
      } else if (cleanedResponse.includes('```')) {
        cleanedResponse = cleanedResponse.replace(/```[^{]*/, '').replace(/```$/, '');
      }

      // Buscar JSON na resposta
      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}') + 1;

      if (jsonStart === -1 || jsonEnd === 0) {
        console.error('❌ JSON não encontrado na resposta');
        throw new Error('JSON não encontrado na resposta');
      }

      const jsonString = cleanedResponse.substring(jsonStart, jsonEnd);
      console.log('🔄 JSON EXTRAÍDO:', jsonString);

      const parsedContent = JSON.parse(jsonString);
      console.log('✅ CONTEÚDO PARSEADO:', parsedContent);

      const result = {
        title: parsedContent.titulo || parsedContent.title || 'Conteúdo Educativo',
        text: parsedContent.conteudo || parsedContent.content || parsedContent.text || 'Conteúdo gerado pela IA.',
        advancedText: parsedContent.conteudoAvancado || parsedContent.advancedContent || parsedContent.advancedText
      };

      console.log('🎯 RESULTADO FINAL PARSEADO:', result);
      return result;

    } catch (error) {
      console.error('❌ Erro ao fazer parse da resposta:', error);
      console.log('📄 Resposta problemática completa:', response);

      // Tentar extrair conteúdo manualmente se JSON falhar
      const manualContent = this.extractContentManually(response);
      if (manualContent) {
        console.log('✅ Conteúdo extraído manualmente:', manualContent);
        return manualContent;
      }

      // Fallback final
      console.log('⚠️ Usando fallback final');
      return {
        title: 'Erro no processamento',
        text: 'Houve um problema ao processar o conteúdo gerado pela IA. Resposta original: ' + response.substring(0, 200),
        advancedText: 'Tente novamente ou contate o suporte.'
      };
    }
  }

  private extractContentManually(response: string): { title: string; text: string; advancedText?: string } | null {
    try {
      console.log('🔧 Tentando extração manual do conteúdo...');

      // Tentar encontrar padrões de conteúdo educativo
      const lines = response.split('\n').filter(line => line.trim());

      let title = '';
      let text = '';
      let advancedText = '';

      // Procurar por títulos
      for (const line of lines) {
        if (line.includes('título') || line.includes('Title') || line.includes('#')) {
          title = line.replace(/[#*"']/g, '').replace(/título:?/i, '').trim();
          break;
        }
      }

      // Se não encontrou título, usar primeira linha significativa
      if (!title && lines.length > 0) {
        title = lines[0].replace(/[#*"']/g, '').trim();
      }

      // Procurar por conteúdo
      const contentLines = lines.filter(line => 
        line.length > 50 && 
        !line.includes('título') && 
        !line.includes('Title') &&
        !line.includes('```')
      );

      if (contentLines.length > 0) {
        text = contentLines[0];
        if (contentLines.length > 1) {
          advancedText = contentLines[1];
        }
      }

      if (title || text) {
        const result = {
          title: title || 'Conteúdo Educativo',
          text: text || response.substring(0, 300),
          advancedText: advancedText || undefined
        };

        console.log('✅ Extração manual bem-sucedida:', result);
        return result;
      }

      return null;
    } catch (error) {
      console.error('❌ Erro na extração manual:', error);
      return null;
    }
  }

  private generateSpecificFallback(data: QuadroInterativoData): QuadroInterativoContent {
    const theme = data.theme || 'este conteúdo';

    // Título específico baseado no tema
    let specificTitle = `Como Dominar ${theme}`;
    if (theme.toLowerCase().includes('substantivo')) {
      specificTitle = `Como Identificar ${theme}`;
    } else if (theme.toLowerCase().includes('verbo')) {
      specificTitle = `Como Reconhecer ${theme}`;
    } else if (theme.toLowerCase().includes('equação') || theme.toLowerCase().includes('função')) {
      specificTitle = `Como Resolver ${theme}`;
    } else if (theme.toLowerCase().includes('matemática') || theme.toLowerCase().includes('cálculo')) {
      specificTitle = `Como Calcular ${theme}`;
    }

    // Texto específico para o tema
    const specificText = `Para você dominar ${theme.toLowerCase()}, siga estes passos essenciais: 1) Identifique os conceitos-chave de ${theme}. 2) Pratique com exemplos específicos de ${theme}. 3) Aplique o conhecimento em exercícios de ${theme}. Exemplo: observe como ${theme} aparece em situações reais. Dica importante: foque nos detalhes específicos de ${theme}. Cuidado: não confunda ${theme} com conceitos similares. Lembre-se: dominar ${theme} requer prática constante!`;

    const advancedText = `Agora que você entende o básico de ${theme.toLowerCase()}, explore aspectos avançados: analise casos complexos de ${theme}. Quando encontrar dificuldades em ${theme}, volte aos fundamentos. Teste: explique ${theme} para um colega. Conexão: veja como ${theme} se relaciona com outros temas de ${data.subject}. Dica profissional: crie mapas mentais específicos para ${theme}!`;

    return {
      title: data.theme || 'Conteúdo Educativo',
      description: data.objectives || 'Atividade educativa interativa',
      cardContent: {
        title: specificTitle.substring(0, 80),
        text: specificText.substring(0, 500)
      },
      cardContent2: {
        title: `${specificTitle} - Nível Avançado`.substring(0, 80),
        text: advancedText.substring(0, 500)
      },
      generatedAt: new Date().toISOString(),
      isGeneratedByAI: false,
      subject: data.subject,
      schoolYear: data.schoolYear,
      theme: data.theme,
      objectives: data.objectives,
      difficultyLevel: data.difficultyLevel,
      quadroInterativoCampoEspecifico: data.quadroInterativoCampoEspecifico
    };
  }
}

export default QuadroInterativoGenerator;