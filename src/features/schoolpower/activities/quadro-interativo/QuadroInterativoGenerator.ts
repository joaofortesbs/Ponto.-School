
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
  generatedAt: string;
  isGeneratedByAI: boolean;
}

export class QuadroInterativoGenerator {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  async generateQuadroInterativoContent(data: QuadroInterativoData): Promise<QuadroInterativoContent> {
    geminiLogger.logRequest('Gerando conteúdo COMPLETO de Quadro Interativo', data);
    
    try {
      const prompt = this.buildEnhancedPrompt(data);
      const response = await this.callGeminiAPI(prompt);
      const parsedContent = this.parseGeminiResponse(response);
      
      const result: QuadroInterativoContent = {
        title: data.theme || 'Quadro Interativo',
        description: data.objectives || 'Atividade de quadro interativo',
        cardContent: {
          title: parsedContent.title || data.theme || 'Conteúdo do Quadro',
          text: parsedContent.text || data.objectives || 'Conteúdo educativo gerado pela IA.'
        },
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
          'Atividade mostrada': data.quadroInterativoCampoEspecifico
        }
      };

      geminiLogger.logResponse(result, Date.now());
      console.log('✅ Conteúdo COMPLETO do Quadro Interativo gerado:', result);
      return result;
    } catch (error) {
      geminiLogger.logError(error as Error, { data });
      
      // Fallback com conteúdo educativo melhorado
      const educationalTitle = this.generateEducationalTitle(data);
      const educationalText = this.generateEducationalText(data);
      
      const fallbackResult: QuadroInterativoContent = {
        title: data.theme || 'Conteúdo Educativo',
        description: data.objectives || 'Atividade educativa interativa',
        cardContent: {
          title: educationalTitle,
          text: educationalText
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
      
      console.log('⚠️ Usando conteúdo fallback EDUCATIVO para Quadro Interativo:', fallbackResult);
      return fallbackResult;
    }
  }

  private buildEnhancedPrompt(data: QuadroInterativoData): string {
    return `
VOCÊ É UM PROFESSOR ESPECIALISTA BRASILEIRO QUE ENSINA DIRETAMENTE AO ALUNO COMO DOMINAR O CONTEÚDO.

DADOS DA AULA:
- Disciplina: ${data.subject}
- Ano/Série: ${data.schoolYear}
- Tema: ${data.theme}
- Objetivos: ${data.objectives}
- Nível: ${data.difficultyLevel}
- Atividade: ${data.quadroInterativoCampoEspecifico}

MISSÃO ABSOLUTA: Você está falando DIRETAMENTE com um aluno de ${data.schoolYear}. Ensine COMO ele deve pensar, resolver e dominar o tema ${data.theme}. NUNCA fale SOBRE o tema - sempre fale COM o aluno ensinando COMO fazer.

FORMATO OBRIGATÓRIO (JSON):
{
  "title": "Como [fazer algo relacionado ao tema] - máximo 80 caracteres, SEM 'Quadro Interativo'",
  "text": "INSTRUÇÕES DIRETAS AO ALUNO: 'Para você [dominar/resolver/identificar] ${data.theme}, siga estes passos: 1) [ação específica], 2) [próxima ação], 3) [ação final]. Exemplo prático: [caso concreto]. Dica que funciona: [estratégia]. Cuidado: [erro comum]. Macete: [truque para lembrar].' (máximo 500 caracteres)",
  "advancedText": "NÍVEL AVANÇADO DIRETO: 'Agora que você sabe o básico, para casos difíceis faça: [estratégia avançada]. Quando encontrar [situação complexa], use [técnica]. Desafio: [exercício mental]. Conexão: isso se liga com [outro tema]. Dica profissional: [segredo avançado].' (máximo 500 caracteres)"
}

REGRAS ABSOLUTAS PARA TÍTULO:
- SEMPRE comece com "Como" + verbo de ação
- Exemplos CORRETOS: "Como Identificar Substantivos Próprios", "Como Resolver Funções do 1º Grau", "Como Reconhecer Relevo Brasileiro"
- PROIBIDO: títulos descritivos como "Substantivos Próprios", "Relevo Brasileiro"

REGRAS ABSOLUTAS PARA TEXTO:
- PRIMEIRA PALAVRA deve ser "Para" 
- ESTRUTURA OBRIGATÓRIA: "Para você [verbo] [tema], siga: 1) [ação], 2) [ação], 3) [ação]. Exemplo: [caso]. Dica: [truque]. Cuidado: [erro]. Macete: [lembrete]."
- VERBOS OBRIGATÓRIOS: "Para você identificar...", "Para você resolver...", "Para você calcular...", "Para você classificar..."
- FALE SEMPRE na 2ª pessoa: "você deve", "você faz", "você verifica"
- DÊ COMANDOS DIRETOS: "Observe...", "Compare...", "Teste...", "Verifique..."

REGRAS PARA TEXTO AVANÇADO:
- COMECE com "Agora que você domina o básico"
- CONTINUE ensinando AÇÕES: "faça...", "use...", "aplique..."
- DÊ DESAFIOS PRÁTICOS: "Teste: tente...", "Desafio: explique..."
- CONECTE conhecimentos: "Isso se liga com... que você aprendeu"

EXEMPLOS PERFEITOS OBRIGATÓRIOS:

Para "Substantivos Próprios e Verbos":
{
  "title": "Como Identificar Substantivos Próprios e Verbos",
  "text": "Para você identificar substantivos próprios, faça: 1) Procure nomes únicos (Maria, Brasil). 2) Verifique se tem maiúscula. 3) Teste: só existe um no mundo? É próprio! Para verbos: 1) Procure palavras de ação (correr, pensar). 2) Teste: 'Eu posso...' funciona? É verbo! Exemplo: 'Maria corre' - Maria = próprio (única), corre = verbo (ação). Macete: próprio sempre maiúscula, verbo sempre ação!",
  "advancedText": "Agora que você domina o básico, identifique verbos compostos: 'tinha corrido' = verbo composto. Para substantivos: alguns próprios viram comuns (xerox). Teste avançado: analise frases completas identificando todos. Desafio: crie frases usando 3 substantivos próprios e 3 verbos diferentes. Dica pro: verbos mudam com tempo e pessoa!"
}

Para "Equações do 1º Grau":
{
  "title": "Como Resolver Equações do 1º Grau",
  "text": "Para você resolver equações como 2x + 5 = 11, siga: 1) Isole o termo com x: 2x = 11 - 5. 2) Calcule: 2x = 6. 3) Divida: x = 6/2 = 3. 4) Teste: 2(3) + 5 = 11 ✓. Regra de ouro: o que soma vira subtração do outro lado, o que multiplica vira divisão. Exemplo: 3x - 4 = 8 → 3x = 12 → x = 4. Cuidado: sempre teste a resposta!",
  "advancedText": "Agora domine equações com parênteses: 2(x + 3) = 10. Primeiro distribua: 2x + 6 = 10, depois resolva normal. Para frações: 2x/3 = 4, multiplique por 3: 2x = 12, logo x = 6. Desafio: resolva x/2 + x/3 = 5. Dica profissional: sempre simplifique antes de resolver, economiza tempo e evita erros!"
}

AGORA GERE O CONTEÚDO EDUCATIVO COMPLETO E DETALHADO:`;
  }

  private generateEducationalTitle(data: QuadroInterativoData): string {
    let theme = data.theme || 'Conteúdo Educativo';
    
    // Remover prefixos desnecessários
    theme = theme.replace(/^Quadro Interativo:\s*/i, '');
    theme = theme.replace(/^Atividade de\s*/i, '');
    theme = theme.replace(/^Atividade sobre\s*/i, '');
    
    // Criar título direto com "Como"
    let directTitle;
    if (theme.toLowerCase().includes('substantivo')) {
      directTitle = `Como Identificar ${theme}`;
    } else if (theme.toLowerCase().includes('verbo')) {
      directTitle = `Como Reconhecer ${theme}`;
    } else if (theme.toLowerCase().includes('equação') || theme.toLowerCase().includes('função')) {
      directTitle = `Como Resolver ${theme}`;
    } else if (theme.toLowerCase().includes('relevo') || theme.toLowerCase().includes('geografia')) {
      directTitle = `Como Identificar ${theme}`;
    } else {
      directTitle = `Como Entender ${theme}`;
    }
    
    return directTitle.substring(0, 80).trim();
  }

  private generateEducationalText(data: QuadroInterativoData): string {
    const theme = data.theme || 'este tema';
    const subject = data.subject || 'a matéria';
    
    // Texto direto ao aluno conforme solicitado
    const directText = `Para você dominar ${theme.toLowerCase()}, siga estes passos essenciais: 1) Identifique as características principais do conceito. 2) Compare com exemplos práticos que você conhece. 3) Aplique o conhecimento em exercícios simples. Exemplo: observe situações do dia a dia relacionadas ao tema. Dica importante: pratique regularmente para fixar o aprendizado. Cuidado: não confunda conceitos similares. Lembre-se: a prática leva à perfeição!`;
    
    return directText.substring(0, 500);
  }

  private async callGeminiAPI(prompt: string): Promise<any> {
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
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API Gemini: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const executionTime = Date.now() - startTime;
      
      geminiLogger.logResponse(data, executionTime);
      
      return data;
    } catch (error) {
      geminiLogger.logError(error as Error, { prompt: prompt.substring(0, 200) });
      throw error;
    }
  }

  private parseGeminiResponse(response: any): { title: string; text: string; advancedText?: string } {
    try {
      const responseText = response?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!responseText) {
        throw new Error('Resposta vazia da API Gemini');
      }

      console.log('🔍 Resposta bruta da API Gemini:', responseText);

      // Limpar a resposta removendo markdown e extraindo JSON
      let cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^\s*[\r\n]/gm, '')
        .trim();

      // Tentar extrair JSON se houver texto antes/depois
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }

      console.log('🧹 Resposta limpa:', cleanedResponse);

      // Tentar fazer parse do JSON
      const parsedContent = JSON.parse(cleanedResponse);
      
      // Validar estrutura
      if (!parsedContent.title || !parsedContent.text) {
        throw new Error('Estrutura JSON inválida na resposta');
      }

      // Processar título - remover prefixos indesejados
      let title = parsedContent.title.toString().trim();
      title = title.replace(/^Quadro Interativo:\s*/i, '');
      title = title.replace(/^Atividade de\s*/i, '');
      title = title.replace(/^Atividade sobre\s*/i, '');
      
      // Processar texto inicial
      let text = parsedContent.text.toString().trim();
      
      // Processar texto avançado (opcional)
      let advancedText = parsedContent.advancedText ? parsedContent.advancedText.toString().trim() : null;

      // Limitar tamanhos
      title = title.substring(0, 80);
      text = text.substring(0, 500);
      if (advancedText) {
        advancedText = advancedText.substring(0, 500);
      }

      const finalResult = { title, text, advancedText };
      console.log('✅ Conteúdo processado final:', finalResult);

      geminiLogger.logValidation(finalResult, true);
      
      return finalResult;
      
    } catch (error) {
      console.error('❌ Erro ao processar resposta da IA:', error);
      geminiLogger.logValidation(response, false, [error.message]);
      
      // Fallback com formato direto ao aluno
      const fallbackTitle = 'Como Dominar Este Conteúdo';
      const fallbackText = 'Para você entender este tema, siga: 1) Leia com atenção os conceitos principais. 2) Faça conexões com o que você já sabe. 3) Pratique com exercícios simples. Exemplo: relacione o tema com situações do seu cotidiano. Dica: estude um pouco todo dia, não tudo de uma vez. Cuidado: não decore, entenda! Macete: ensine para alguém, assim você fixa melhor.';
      const fallbackAdvancedText = 'Agora que você entende o básico, desafie-se: aplique o conhecimento em situações complexas. Quando encontrar dificuldades, volte aos fundamentos. Teste: explique o tema para um colega. Conexão: veja como se relaciona com outros assuntos. Dica profissional: crie mapas mentais conectando tudo que aprendeu!';
      
      return {
        title: fallbackTitle.substring(0, 80),
        text: fallbackText.substring(0, 500),
        advancedText: fallbackAdvancedText.substring(0, 500)
      };
    }
  }
}

export default QuadroInterativoGenerator;
