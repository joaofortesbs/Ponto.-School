import { geminiLogger } from '@/utils/geminiDebugLogger';
import { buildListaExerciciosPrompt, validateListaExerciciosResponse } from '../../prompts/listaExerciciosPrompt';
import { processAIGeneratedContent, generateFallbackQuestions } from '../../services/exerciseListProcessor';

export interface ListaExerciciosData {
  titulo?: string;
  title?: string;
  descricao?: string;
  description?: string;
  disciplina?: string;
  subject?: string;
  tema?: string;
  theme?: string;
  anoEscolaridade?: string;
  schoolYear?: string;
  numeroQuestoes?: string;
  numberOfQuestions?: string;
  nivelDificuldade?: string;
  difficultyLevel?: string;
  modeloQuestoes?: string;
  questionModel?: string;
  objetivos?: string;
  objectives?: string;
  fontes?: string;
  sources?: string;
}

export interface ListaExerciciosQuestion {
  id: string;
  type: 'multipla-escolha' | 'discursiva' | 'verdadeiro-falso';
  enunciado: string;
  alternativas?: string[];
  respostaCorreta?: number | string | boolean;
  explicacao?: string;
  dificuldade?: string;
  tema?: string;
}

interface ListaExerciciosContent {
  titulo: string;
  disciplina: string;
  tema: string;
  tipoQuestoes: string;
  numeroQuestoes: number;
  dificuldade: string;
  objetivos: string;
  conteudoPrograma: string;
  observacoes?: string;
  questoes: ListaExerciciosQuestion[];
  generatedAt: string;
  isGeneratedByAI: boolean;
  isFallback?: boolean;
  anoEscolaridade?: string;
}

export class ListaExerciciosGenerator {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

    if (!this.apiKey) {
      console.warn('⚠️ API Key do Gemini não configurada para Lista de Exercícios');
    }
  }

  async generateListaExerciciosContent(data: ListaExerciciosData): Promise<ListaExerciciosContent> {
    console.log('📝 [ListaExerciciosGenerator] Iniciando geração da Lista de Exercícios com dados:', data);

    const normalizedData = this.normalizeData(data);
    console.log('📝 [ListaExerciciosGenerator] Dados normalizados:', normalizedData);

    if (!this.apiKey) {
      console.warn('🔑 [ListaExerciciosGenerator] API Key não disponível, usando fallback');
      return this.createFallbackContent(normalizedData);
    }

    try {
      const prompt = buildListaExerciciosPrompt(normalizedData);
      console.log('📝 [ListaExerciciosGenerator] Prompt gerado com', prompt.length, 'caracteres');

      const startTime = Date.now();
      const response = await this.callGeminiAPI(prompt);
      const executionTime = Date.now() - startTime;

      console.log('📡 [ListaExerciciosGenerator] Resposta recebida em', executionTime, 'ms');
      console.log('📡 [ListaExerciciosGenerator] Resposta bruta (primeiros 500 chars):', response?.substring(0, 500));

      const parsedContent = this.parseGeminiResponse(response, normalizedData);
      console.log('✅ [ListaExerciciosGenerator] Conteúdo parseado:', {
        titulo: parsedContent.titulo,
        questoesCount: parsedContent.questoes?.length || 0
      });

      const isValid = validateListaExerciciosResponse(parsedContent);
      if (!isValid) {
        console.error('❌ [ListaExerciciosGenerator] Estrutura inválida, usando fallback');
        return this.createFallbackContent(normalizedData);
      }

      const finalContent = this.ensureDataCompatibility(parsedContent, normalizedData);
      console.log('🎉 [ListaExerciciosGenerator] Lista gerada com sucesso:', {
        questoesCount: finalContent.questoes.length,
        isGeneratedByAI: finalContent.isGeneratedByAI
      });

      return finalContent;
    } catch (error) {
      console.error('❌ [ListaExerciciosGenerator] Erro na geração:', error);
      return this.createFallbackContent(normalizedData);
    }
  }

  private normalizeData(data: ListaExerciciosData): any {
    return {
      titulo: data.titulo || data.title || 'Lista de Exercícios',
      descricao: data.descricao || data.description || '',
      disciplina: data.disciplina || data.subject || 'Português',
      tema: data.tema || data.theme || 'Conteúdo Geral',
      anoEscolaridade: data.anoEscolaridade || data.schoolYear || '6º ano',
      numeroQuestoes: data.numeroQuestoes || data.numberOfQuestions || '10',
      nivelDificuldade: data.nivelDificuldade || data.difficultyLevel || 'Médio',
      modeloQuestoes: data.modeloQuestoes || data.questionModel || 'multipla-escolha',
      objetivos: data.objetivos || data.objectives || '',
      fontes: data.fontes || data.sources || ''
    };
  }

  private async callGeminiAPI(prompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: "application/json"
      }
    };

    console.log('📡 [ListaExerciciosGenerator] Chamando Gemini API...');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [ListaExerciciosGenerator] Erro na API:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text) {
      throw new Error('Resposta vazia da API Gemini');
    }

    return text;
  }

  private parseGeminiResponse(response: string, data: any): any {
    try {
      let cleanedResponse = response.trim();
      
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(cleanedResponse);
      console.log('✅ [ListaExerciciosGenerator] JSON parseado com sucesso');

      if (parsed.questoes && Array.isArray(parsed.questoes)) {
        console.log('🔍 [parseGeminiResponse] Processando', parsed.questoes.length, 'questões');
        
        parsed.questoes = parsed.questoes.map((q: any, index: number) => {
          // IMPORTANTE: Buscar enunciado em TODOS os campos possíveis (ordem de prioridade)
          const enunciadoEncontrado = 
            q.enunciado ||           // Formato padrão português
            q.pergunta ||            // Alternativa português
            q.question ||            // Formato inglês
            q.statement ||           // Statement em inglês
            q.texto ||               // Texto da questão
            q.text ||                // Text em inglês
            q.content ||             // Conteúdo
            q.title ||               // Título
            q.descricao ||           // Descrição
            q.description ||         // Description em inglês
            '';
          
          console.log(`📝 [parseGeminiResponse] Questão ${index + 1}: enunciado encontrado =`, enunciadoEncontrado?.substring(0, 80));
          
          return {
            id: q.id || `questao-${index + 1}`,
            type: this.normalizeQuestionType(q.type || data.modeloQuestoes),
            enunciado: enunciadoEncontrado,
            alternativas: this.normalizeAlternativas(q.alternativas || q.options || q.alternatives, q.type || data.modeloQuestoes),
            respostaCorreta: this.normalizeRespostaCorreta(q.respostaCorreta || q.correctAnswer || q.correct_answer || q.gabarito, q.type),
            explicacao: q.explicacao || q.explanation || q.justificativa || '',
            dificuldade: q.dificuldade || q.difficulty || data.nivelDificuldade,
            tema: q.tema || q.topic || data.tema,
            // Preservar objeto original para debug
            _original: q
          };
        });
      }

      return parsed;
    } catch (error) {
      console.error('❌ [ListaExerciciosGenerator] Erro ao parsear JSON:', error);
      console.log('📝 [ListaExerciciosGenerator] Tentando extração de texto...');
      
      const processedData = processAIGeneratedContent(response, data);
      return processedData;
    }
  }

  private normalizeQuestionType(type: string): 'multipla-escolha' | 'discursiva' | 'verdadeiro-falso' {
    const typeLower = (type || '').toLowerCase();
    
    if (typeLower.includes('discursiva') || typeLower.includes('dissertativa') || typeLower.includes('aberta')) {
      return 'discursiva';
    }
    if (typeLower.includes('verdadeiro') || typeLower.includes('falso') || typeLower.includes('v/f') || typeLower.includes('v ou f')) {
      return 'verdadeiro-falso';
    }
    return 'multipla-escolha';
  }

  private normalizeAlternativas(alternativas: any, type: string): string[] | undefined {
    const questionType = this.normalizeQuestionType(type);
    
    if (questionType === 'discursiva') {
      return undefined;
    }
    
    if (questionType === 'verdadeiro-falso') {
      return ['Verdadeiro', 'Falso'];
    }
    
    if (Array.isArray(alternativas) && alternativas.length >= 2) {
      return alternativas.slice(0, 5).map((alt: any) => String(alt).trim());
    }
    
    return ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D'];
  }

  private normalizeRespostaCorreta(resposta: any, type: string): number | string | boolean {
    const questionType = this.normalizeQuestionType(type);
    
    if (questionType === 'verdadeiro-falso') {
      if (typeof resposta === 'boolean') return resposta;
      if (typeof resposta === 'string') {
        const lower = resposta.toLowerCase();
        return lower === 'true' || lower === 'verdadeiro' || lower === 'v';
      }
      if (typeof resposta === 'number') return resposta === 0;
      return true;
    }
    
    if (questionType === 'discursiva') {
      return String(resposta || '');
    }
    
    if (typeof resposta === 'number') return resposta;
    if (typeof resposta === 'string') {
      const parsed = parseInt(resposta);
      if (!isNaN(parsed)) return parsed;
      
      const letterMap: Record<string, number> = { 'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4 };
      const letter = resposta.toLowerCase().charAt(0);
      if (letterMap[letter] !== undefined) return letterMap[letter];
    }
    return 0;
  }

  private ensureDataCompatibility(parsedContent: any, data: any): ListaExerciciosContent {
    const numeroQuestoes = parseInt(data.numeroQuestoes) || 10;
    let questoes = parsedContent.questoes || [];

    if (questoes.length === 0) {
      console.warn('⚠️ [ListaExerciciosGenerator] Sem questões, gerando fallback');
      questoes = generateFallbackQuestions(data);
    }

    questoes = questoes.map((q: any, index: number) => ({
      ...q,
      id: q.id || `questao-${index + 1}`,
      type: this.normalizeQuestionType(q.type || data.modeloQuestoes),
      enunciado: q.enunciado || `Questão ${index + 1} sobre ${data.tema}`,
      alternativas: this.normalizeAlternativas(q.alternativas, q.type || data.modeloQuestoes),
      respostaCorreta: this.normalizeRespostaCorreta(q.respostaCorreta, q.type),
      explicacao: q.explicacao || '',
      dificuldade: q.dificuldade || data.nivelDificuldade?.toLowerCase() || 'medio',
      tema: q.tema || data.tema
    }));

    return {
      titulo: parsedContent.titulo || data.titulo || 'Lista de Exercícios',
      disciplina: parsedContent.disciplina || data.disciplina,
      tema: parsedContent.tema || data.tema,
      tipoQuestoes: data.modeloQuestoes,
      numeroQuestoes: questoes.length,
      dificuldade: data.nivelDificuldade || 'Médio',
      objetivos: parsedContent.objetivos || data.objetivos || '',
      conteudoPrograma: parsedContent.conteudoPrograma || '',
      observacoes: parsedContent.observacoes || '',
      questoes: questoes,
      generatedAt: new Date().toISOString(),
      isGeneratedByAI: true,
      isFallback: false,
      anoEscolaridade: data.anoEscolaridade
    };
  }

  private createFallbackContent(data: any): ListaExerciciosContent {
    console.log('🔄 [ListaExerciciosGenerator] Criando conteúdo fallback');

    const questoes = generateFallbackQuestions(data);

    return {
      titulo: data.titulo || 'Lista de Exercícios',
      disciplina: data.disciplina || 'Disciplina',
      tema: data.tema || 'Tema',
      tipoQuestoes: data.modeloQuestoes || 'multipla-escolha',
      numeroQuestoes: questoes.length,
      dificuldade: data.nivelDificuldade || 'Médio',
      objetivos: data.objetivos || '',
      conteudoPrograma: '',
      observacoes: 'Este conteúdo foi gerado como fallback. Por favor, regenere para obter questões personalizadas.',
      questoes: questoes,
      generatedAt: new Date().toISOString(),
      isGeneratedByAI: false,
      isFallback: true,
      anoEscolaridade: data.anoEscolaridade
    };
  }
}

export const listaExerciciosGenerator = new ListaExerciciosGenerator();

export async function generateListaExerciciosContent(data: ListaExerciciosData): Promise<ListaExerciciosContent> {
  return listaExerciciosGenerator.generateListaExerciciosContent(data);
}
