
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
VOCÊ É UMA IA ESPECIALIZADA EM EDUCAÇÃO BRASILEIRA QUE CRIA CONTEÚDO DIDÁTICO COMPLETO E PROFUNDO.

DADOS DA AULA:
- Disciplina: ${data.subject}
- Ano/Série: ${data.schoolYear}
- Tema: ${data.theme}
- Objetivos: ${data.objectives}
- Nível: ${data.difficultyLevel}
- Atividade: ${data.quadroInterativoCampoEspecifico}

MISSÃO CRÍTICA: Criar um conteúdo que ENSINE o aluno COMO ENTENDER, RESOLVER e APLICAR o conceito. Você está falando DIRETAMENTE com o aluno, ensinando passo a passo como ele deve pensar e resolver.

FORMATO DE RESPOSTA OBRIGATÓRIO (JSON):
{
  "title": "Título educativo direto sobre o conceito (SEM 'Quadro Interativo:', máximo 80 caracteres)",
  "text": "Explicação DIRETA ao aluno sobre COMO resolver/entender o conceito: 'Para resolver [tema], você deve: 1) [passo], 2) [passo], 3) [passo]. Exemplo: [situação prática]. Dica importante: [estratégia de resolução]. Lembre-se: [ponto-chave para não errar].' (máximo 500 caracteres)",
  "advancedText": "Orientação AVANÇADA ao aluno: 'Agora que você domina o básico, para situações mais complexas: [estratégias avançadas]. Quando encontrar [situação], faça [ação]. Cuidado com [armadilhas comuns]. Teste seu conhecimento: [desafio prático].' (máximo 500 caracteres)"
}

DIRETRIZES OBRIGATÓRIAS PARA TÍTULO:
- NUNCA use "Quadro Interativo:" no início
- Seja DIRETO sobre o conceito educativo
- Use terminologia adequada para ${data.schoolYear}
- Exemplos corretos: "Relevo Brasileiro", "Substantivos Próprios e Comuns", "Função do 1º Grau"
- PROIBIDO: "Quadro Interativo: [tema]", "Atividade de [tema]"

DIRETRIZES OBRIGATÓRIAS PARA TEXTO:
- FALE DIRETAMENTE com o aluno: "Para você resolver...", "Quando você encontrar...", "Faça assim..."
- ENSINE o PASSO A PASSO: "Primeiro faça..., depois..., por último..."
- DÊ EXEMPLOS PRÁTICOS: "Por exemplo, se você tem..., então..."
- FORNEÇA DICAS DE RESOLUÇÃO: "Dica: sempre comece por...", "Lembre-se de..."
- ALERTE para ERROS COMUNS: "Cuidado para não...", "Evite..."
- Use linguagem DIRETA e PRÁTICA para ${data.schoolYear}
- ENSINE como PENSAR e RESOLVER, não apenas o que é o conceito

DIRETRIZES OBRIGATÓRIAS PARA TEXTO AVANÇADO:
- CONTINUE falando DIRETAMENTE com o aluno
- ENSINE estratégias AVANÇADAS: "Para casos mais complexos, faça..."
- APRESENTE DESAFIOS: "Agora teste: tente resolver..."
- CONECTE com outros temas: "Isso se relaciona com... que você já viu"
- DÊ DICAS AVANÇADAS: "Truque profissional: quando..., use..."
- ESTIMULE raciocínio: "Pense: por que isso acontece quando...?"
- MANTENHA tom de ORIENTAÇÃO DIRETA ao aluno

EXEMPLOS DE QUALIDADE MÁXIMA:

Para "Relevo Brasileiro":
{
  "title": "Como Identificar Formas de Relevo",
  "text": "Para você identificar o relevo, siga estes passos: 1) Observe a altitude - baixa (planície) ou alta (planalto/serra). 2) Veja se é plano ou montanhoso. 3) Compare: Pantanal = baixo e plano (planície), Planalto Central = alto e plano, Serra do Mar = alto e montanhoso. Dica: se for plano e baixo, é planície; plano e alto, é planalto; montanhoso, é serra. Memorize: planície = plana e baixa!",
  "advancedText": "Agora que você sabe identificar, entenda COMO se formaram: processos antigos moldaram o Brasil. Para análises complexas, relacione: relevo baixo = rios lentos e navegáveis; relevo alto = rios rápidos e energia. Desafio: explique por que São Paulo (planalto) tem clima diferente do Pantanal (planície). Dica avançada: altitude influencia temperatura e chuvas!"
}

Para "Substantivos Próprios":
{
  "title": "Como Identificar Substantivos Próprios",
  "text": "Para você identificar substantivos próprios, faça assim: 1) Veja se nomeia algo específico (Maria, não menina). 2) Verifique se tem letra maiúscula. 3) Teste: se é único no mundo, é próprio. Exemplos: Brasil (país específico) vs país (qualquer país). Dica infalível: substantivo próprio sempre tem maiúscula e nomeia algo único. Macete: se você pode colocar 'o/a' antes sem soar estranho, é comum (a menina ✓, a Maria ✗).",
  "advancedText": "Agora domine casos complexos: alguns nomes viram comuns (xerox, gilette). Para você acertar sempre: substantivos geográficos que viram comuns mantêm minúscula (champanhe da região Champagne). Desafio: analise textos e veja como próprios dão precisão. Dica profissional: em redações, use próprios para dar credibilidade e especificidade aos seus argumentos!"
}

AGORA GERE O CONTEÚDO EDUCATIVO COMPLETO E DETALHADO:`;
  }

  private generateEducationalTitle(data: QuadroInterativoData): string {
    // Remover "Quadro Interativo:" se existir e criar título educativo
    let title = data.theme || 'Conteúdo Educativo';
    
    // Remover prefixos desnecessários
    title = title.replace(/^Quadro Interativo:\s*/i, '');
    title = title.replace(/^Atividade de\s*/i, '');
    title = title.replace(/^Atividade sobre\s*/i, '');
    
    // Limitar caracteres
    return title.substring(0, 80).trim();
  }

  private generateEducationalText(data: QuadroInterativoData): string {
    const theme = data.theme || 'o tema proposto';
    const subject = data.subject || 'a disciplina';
    const schoolYear = data.schoolYear || 'esta série';
    
    const educationalText = `Este conteúdo sobre ${theme.toLowerCase()} apresenta os conceitos fundamentais de ${subject} para ${schoolYear}. Através de explicações claras, exemplos práticos e dicas de aplicação, você compreenderá as características principais do tema e saberá identificar e aplicar esses conhecimentos em diferentes contextos educacionais e práticos.`;
    
    return educationalText.substring(0, 500);
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
      
      // Fallback melhorado
      const fallbackTitle = 'Conteúdo Educativo';
      const fallbackText = 'Conteúdo educativo desenvolvido para facilitar a compreensão e aplicação dos conceitos fundamentais da disciplina através de atividades interativas e didáticas.';
      const fallbackAdvancedText = 'Aprofundamento do tema com análises mais complexas, aplicações práticas avançadas e conexões interdisciplinares para expandir o conhecimento e desenvolver pensamento crítico.';
      
      return {
        title: fallbackTitle.substring(0, 80),
        text: fallbackText.substring(0, 500),
        advancedText: fallbackAdvancedText.substring(0, 500)
      };
    }
  }
}

export default QuadroInterativoGenerator;
