
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

      geminiLogger.logResponse(result, Date.now());
      console.log('✅ Conteúdo COMPLETO do Quadro Interativo gerado:', result);
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
    return `VOCÊ É UM PROFESSOR ESPECIALISTA BRASILEIRO QUE CRIA CONTEÚDO EDUCATIVO ESPECÍFICO.

DADOS ESPECÍFICOS:
- Disciplina: ${data.subject}
- Ano/Série: ${data.schoolYear}
- Tema ESPECÍFICO: ${data.theme}
- Objetivos: ${data.objectives}
- Nível: ${data.difficultyLevel}
- Atividade: ${data.quadroInterativoCampoEspecifico}

MISSÃO: Crie conteúdo ESPECÍFICO para ensinar "${data.theme}" para alunos do ${data.schoolYear}. Seja EXTREMAMENTE ESPECÍFICO ao tema, não genérico.

RESPONDA APENAS COM JSON VÁLIDO (sem texto antes ou depois):
{
  "title": "Como [ação específica sobre ${data.theme}]",
  "text": "Para você dominar ${data.theme.toLowerCase()}, siga estes passos específicos: 1) [passo específico do tema], 2) [outro passo específico], 3) [passo final específico]. Exemplo específico: [exemplo real do tema]. Dica específica: [dica sobre ${data.theme}]. Cuidado: [erro comum em ${data.theme}]. Macete: [truque para ${data.theme}].",
  "advancedText": "Agora que você domina o básico de ${data.theme.toLowerCase()}, para casos avançados: [estratégia específica avançada]. Quando encontrar [situação complexa específica do tema], use [técnica específica]. Desafio: [exercício específico de ${data.theme}]. Conexão: ${data.theme} se liga com [temas relacionados]. Dica profissional: [segredo específico de ${data.theme}]."
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
      geminiLogger.logResponse(data, executionTime);
      
      return data;
      
    } catch (error) {
      console.error('❌ Erro na chamada da API Gemini:', error);
      geminiLogger.logError(error as Error, { prompt: prompt.substring(0, 200) });
      throw error;
    }
  }

  private parseGeminiResponse(response: any): { title: string; text: string; advancedText?: string } {
    try {
      const responseText = response?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!responseText) {
        console.error('❌ Resposta vazia da API Gemini');
        throw new Error('Resposta vazia da API Gemini');
      }

      console.log('🔍 Texto bruto da resposta:', responseText);

      // Limpar a resposta - remover markdown e textos extras
      let cleanedResponse = responseText.trim();
      
      // Remover blocos de código markdown
      cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Remover quebras de linha extras
      cleanedResponse = cleanedResponse.replace(/^\s*[\r\n]/gm, '').trim();

      // Tentar extrair apenas o JSON
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }

      console.log('🧹 JSON limpo extraído:', cleanedResponse);

      // Parse do JSON
      const parsedContent = JSON.parse(cleanedResponse);
      
      // Validar estrutura obrigatória
      if (!parsedContent.title || !parsedContent.text) {
        console.error('❌ Estrutura JSON inválida - faltam campos obrigatórios:', {
          hasTitle: !!parsedContent.title,
          hasText: !!parsedContent.text,
          content: parsedContent
        });
        throw new Error(`Estrutura JSON inválida - Título: ${!!parsedContent.title}, Texto: ${!!parsedContent.text}`);
      }

      // Verificar se o conteúdo não é genérico
      if (parsedContent.text.includes('Texto direto ao aluno conforme solicitado') || 
          parsedContent.text.length < 50) {
        console.error('❌ Conteúdo muito genérico detectado:', parsedContent.text);
        throw new Error('Conteúdo gerado pela IA é muito genérico');
      }

      // Processar e limitar tamanhos
      let title = parsedContent.title.toString().trim();
      let text = parsedContent.text.toString().trim();
      let advancedText = parsedContent.advancedText ? parsedContent.advancedText.toString().trim() : undefined;

      // Remover prefixos desnecessários do título
      title = title.replace(/^Quadro Interativo:\s*/i, '');
      title = title.replace(/^Atividade de\s*/i, '');

      // Limitar tamanhos
      title = title.substring(0, 80);
      text = text.substring(0, 500);
      if (advancedText) {
        advancedText = advancedText.substring(0, 500);
      }

      const finalResult = { title, text, advancedText };
      console.log('✅ Conteúdo final processado:', finalResult);

      geminiLogger.logValidation(finalResult, true);
      
      return finalResult;
      
    } catch (error) {
      console.error('❌ ERRO no parsing da resposta da IA:', error);
      console.error('📝 Resposta original:', response);
      geminiLogger.logValidation(response, false, [error.message]);
      
      throw error; // Re-throw para usar fallback específico
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
