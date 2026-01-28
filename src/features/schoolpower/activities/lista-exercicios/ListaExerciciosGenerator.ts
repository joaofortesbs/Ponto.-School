import { geminiLogger } from '@/utils/geminiDebugLogger';
import { geminiClient } from '@/utils/api/geminiClient';
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
  constructor() {
    console.log('📝 [ListaExerciciosGenerator] Usando geminiClient centralizado (Groq API)');
  }

  async generateListaExerciciosContent(data: ListaExerciciosData): Promise<ListaExerciciosContent> {
    console.log('📝 [ListaExerciciosGenerator] ====== INICIANDO GERAÇÃO COM IA ======');
    console.log('📝 [ListaExerciciosGenerator] Dados recebidos:', JSON.stringify(data, null, 2).substring(0, 500));

    const normalizedData = this.normalizeData(data);
    console.log('📝 [ListaExerciciosGenerator] Dados normalizados:', normalizedData);

    try {
      const prompt = buildListaExerciciosPrompt(normalizedData);
      console.log('📝 [ListaExerciciosGenerator] Prompt gerado com', prompt.length, 'caracteres');
      console.log('📝 [ListaExerciciosGenerator] Prompt (primeiros 500 chars):', prompt.substring(0, 500));

      const startTime = Date.now();
      
      console.log('🤖 [ListaExerciciosGenerator] Chamando geminiClient.generateContent()...');
      const response = await geminiClient.generateContent(prompt);
      const executionTime = Date.now() - startTime;

      console.log('📡 [ListaExerciciosGenerator] ✅ Resposta recebida em', executionTime, 'ms');
      console.log('📡 [ListaExerciciosGenerator] Resposta bruta (primeiros 800 chars):', response?.substring(0, 800));

      const parsedContent = ListaExerciciosGenerator.parseGeminiResponse(response, normalizedData);
      console.log('✅ [ListaExerciciosGenerator] Conteúdo parseado:', {
        titulo: parsedContent.titulo,
        questoesCount: parsedContent.questoes?.length || 0,
        primeiraQuestao: parsedContent.questoes?.[0]?.enunciado?.substring(0, 100)
      });

      const isValid = validateListaExerciciosResponse(parsedContent);
      if (!isValid) {
        console.error('❌ [ListaExerciciosGenerator] Estrutura inválida, usando fallback');
        return this.createFallbackContent(normalizedData);
      }

      const finalContent = this.ensureDataCompatibility(parsedContent, normalizedData);
      console.log('🎉 [ListaExerciciosGenerator] ====== LISTA GERADA COM SUCESSO ======');
      console.log('🎉 [ListaExerciciosGenerator] Questões:', finalContent.questoes.length);
      console.log('🎉 [ListaExerciciosGenerator] isGeneratedByAI:', finalContent.isGeneratedByAI);
      
      if (finalContent.questoes.length > 0) {
        console.log('🎉 [ListaExerciciosGenerator] Primeira questão:', finalContent.questoes[0].enunciado?.substring(0, 150));
      }

      return finalContent;
    } catch (error) {
      console.error('❌ [ListaExerciciosGenerator] Erro na geração:', error);
      console.log('⚠️ [ListaExerciciosGenerator] Usando conteúdo fallback...');
      return this.createFallbackContent(normalizedData);
    }
  }

  /**
   * Extrai bloco JSON válido que contenha o schema esperado (questoes)
   */
  private static extractFirstValidJSON(text: string): { json: string; isArray: boolean } | null {
    // Buscar TODOS os blocos JSON possíveis e selecionar o que contém questoes
    const allObjects = ListaExerciciosGenerator.findAllMatchingBrackets(text, '{', '}');
    const allArrays = ListaExerciciosGenerator.findAllMatchingBrackets(text, '[', ']');
    
    // Primeiro: tentar encontrar objeto com "questoes"
    for (const obj of allObjects) {
      if (obj.content.includes('"questoes"') || obj.content.includes('"questions"')) {
        console.log('🎯 [extractFirstValidJSON] Encontrado objeto com "questoes"');
        return { json: obj.content, isArray: false };
      }
    }
    
    // Segundo: tentar encontrar objeto com "enunciado" (provavelmente questões)
    for (const obj of allObjects) {
      if (obj.content.includes('"enunciado"') || obj.content.includes('"question"')) {
        console.log('🎯 [extractFirstValidJSON] Encontrado objeto com "enunciado"');
        return { json: obj.content, isArray: false };
      }
    }
    
    // Terceiro: tentar encontrar array com objetos de questões
    for (const arr of allArrays) {
      if (arr.content.includes('"enunciado"') || arr.content.includes('"question"')) {
        console.log('🎯 [extractFirstValidJSON] Encontrado array com questões');
        return { json: arr.content, isArray: true };
      }
    }
    
    // Fallback: primeiro bloco encontrado
    if (allObjects.length > 0) {
      console.log('⚠️ [extractFirstValidJSON] Usando primeiro objeto encontrado');
      return { json: allObjects[0].content, isArray: false };
    }
    
    if (allArrays.length > 0) {
      console.log('⚠️ [extractFirstValidJSON] Usando primeiro array encontrado');
      return { json: allArrays[0].content, isArray: true };
    }
    
    return null;
  }
  
  /**
   * Encontra TODOS os blocos balanceados no texto
   */
  private static findAllMatchingBrackets(text: string, open: string, close: string): { start: number; content: string }[] {
    const results: { start: number; content: string }[] = [];
    let searchStart = 0;
    
    while (searchStart < text.length) {
      const match = ListaExerciciosGenerator.findMatchingBracketsFrom(text, open, close, searchStart);
      if (!match) break;
      results.push(match);
      searchStart = match.start + match.content.length;
    }
    
    return results;
  }
  
  /**
   * Encontra primeiro par balanceado a partir de uma posição
   */
  private static findMatchingBracketsFrom(text: string, open: string, close: string, fromIndex: number): { start: number; content: string } | null {
    const start = text.indexOf(open, fromIndex);
    if (start === -1) return null;
    
    let depth = 0;
    let inString = false;
    let escapeNext = false;
    
    for (let i = start; i < text.length; i++) {
      const char = text[i];
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      if (char === '"') {
        inString = !inString;
        continue;
      }
      
      if (inString) continue;
      
      if (char === open) {
        depth++;
      } else if (char === close) {
        depth--;
        if (depth === 0) {
          return { start, content: text.substring(start, i + 1) };
        }
      }
    }
    
    return null;
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

  private static parseGeminiResponse(response: string, data: any): any {
    try {
      console.log('🔍 [parseGeminiResponse] Resposta bruta recebida (primeiros 1000 chars):', response?.substring(0, 1000));
      
      let cleanedResponse = response.trim();
      
      // PASSO 1: Remover blocos de código markdown (múltiplos formatos)
      cleanedResponse = cleanedResponse
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .replace(/```json/gi, '')
        .replace(/```/g, '');
      
      // PASSO 2: Extrair primeiro bloco JSON válido usando bracket matching
      let isArray = false;
      const extracted = ListaExerciciosGenerator.extractFirstValidJSON(cleanedResponse);
      
      if (extracted) {
        cleanedResponse = extracted.json;
        isArray = extracted.isArray;
        console.log(`🧹 [parseGeminiResponse] ${isArray ? 'Array' : 'Objeto'} JSON extraído, tamanho:`, cleanedResponse.length);
      } else {
        console.error('❌ [parseGeminiResponse] Nenhum JSON válido encontrado');
        console.error('❌ [parseGeminiResponse] Resposta:', response?.substring(0, 500));
        throw new Error('JSON não encontrado na resposta');
      }

      // PASSO 3: Limpar caracteres problemáticos que quebram o JSON
      cleanedResponse = cleanedResponse
        .replace(/[\x00-\x1F\x7F]/g, ' ')  // Remove caracteres de controle
        .replace(/\n\s*\n/g, ' ')          // Remove linhas em branco múltiplas
        .replace(/,\s*}/g, '}')            // Remove vírgulas antes de }
        .replace(/,\s*]/g, ']')            // Remove vírgulas antes de ]
        .replace(/"\s*:\s*undefined/g, '": null')  // Substitui undefined por null
        .replace(/"\s*:\s*NaN/g, '": 0');  // Substitui NaN por 0

      console.log('📝 [parseGeminiResponse] JSON limpo (primeiros 500 chars):', cleanedResponse.substring(0, 500));

      let parsed = JSON.parse(cleanedResponse);
      console.log('✅ [ListaExerciciosGenerator] JSON parseado com sucesso!');
      
      // PASSO 4: Tratar array na raiz (quando IA retorna array direto de questões)
      if (Array.isArray(parsed) || isArray) {
        console.log('🔄 [parseGeminiResponse] Resposta é array, convertendo para objeto...');
        parsed = {
          titulo: data.titulo || 'Lista de Exercícios',
          disciplina: data.disciplina,
          tema: data.tema,
          questoes: Array.isArray(parsed) ? parsed : []
        };
      }
      
      // PASSO 5: Normalizar campo de questões (questions -> questoes)
      if (!parsed.questoes && parsed.questions) {
        console.log('🔄 [parseGeminiResponse] Normalizando questions -> questoes');
        parsed.questoes = parsed.questions;
      }
      
      console.log('✅ [parseGeminiResponse] Questões encontradas:', parsed.questoes?.length || 0);

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
          
          const respostaCorreta = ListaExerciciosGenerator.normalizeRespostaCorreta(
            q.respostaCorreta || q.correctAnswer || q.correct_answer || q.gabarito || q.resposta, 
            q.type || data.modeloQuestoes
          );
          
          // Validar se tem enunciado E resposta correta (campos obrigatórios)
          const hasValidEnunciado = Boolean(enunciadoEncontrado && enunciadoEncontrado.length >= 5);
          const hasValidResposta = respostaCorreta !== undefined && respostaCorreta !== null;
          
          const questaoNormalizada = {
            id: q.id || `questao-${index + 1}`,
            type: ListaExerciciosGenerator.normalizeQuestionType(q.type || data.modeloQuestoes),
            enunciado: enunciadoEncontrado,
            alternativas: ListaExerciciosGenerator.normalizeAlternativas(q.alternativas || q.options || q.alternatives, q.type || data.modeloQuestoes),
            respostaCorreta: respostaCorreta,
            explicacao: q.explicacao || q.explanation || q.justificativa || '',
            dificuldade: q.dificuldade || q.difficulty || data.nivelDificuldade,
            tema: q.tema || q.topic || data.tema,
            _validated: hasValidEnunciado && hasValidResposta
          };
          
          console.log(`📝 [parseGeminiResponse] Questão ${index + 1}: válida=${questaoNormalizada._validated}, enunciado=${hasValidEnunciado}, resposta=${hasValidResposta}`);
          
          return questaoNormalizada;
        });
        
        // PASSO 6: Filtrar questões inválidas
        const questoesValidas = parsed.questoes.filter((q: any) => q._validated);
        console.log(`🔍 [parseGeminiResponse] Questões válidas: ${questoesValidas.length}/${parsed.questoes.length}`);
        
        if (questoesValidas.length > 0) {
          parsed.questoes = questoesValidas;
        } else {
          console.warn('⚠️ [parseGeminiResponse] Nenhuma questão válida encontrada');
          throw new Error('Nenhuma questão válida na resposta da IA');
        }
      }
      
      // PASSO 7: Verificação de esquema obrigatório
      if (!parsed.questoes || !Array.isArray(parsed.questoes) || parsed.questoes.length === 0) {
        console.error('❌ [parseGeminiResponse] Esquema inválido: questoes ausente ou vazio');
        throw new Error('JSON não contém array de questões válido');
      }
      
      // Verificar campos obrigatórios em cada questão para múltipla escolha
      for (let i = 0; i < parsed.questoes.length; i++) {
        const q = parsed.questoes[i];
        if (!q.enunciado || q.enunciado.length < 5) {
          console.warn(`⚠️ [parseGeminiResponse] Questão ${i + 1} sem enunciado válido`);
        }
        if (q.type === 'multipla-escolha' && (!q.alternativas || q.alternativas.length < 2)) {
          console.warn(`⚠️ [parseGeminiResponse] Questão ${i + 1} multipla-escolha sem alternativas suficientes`);
          // Gerar alternativas padrão se não existirem
          q.alternativas = q.alternativas || ['Opção A', 'Opção B', 'Opção C', 'Opção D'];
        }
      }
      
      console.log('✅ [parseGeminiResponse] Esquema validado com sucesso!');

      return parsed;
    } catch (error) {
      console.error('❌ [ListaExerciciosGenerator] Erro ao parsear JSON:', error);
      console.log('📝 [ListaExerciciosGenerator] Tentando extração de texto...');
      
      const processedData = processAIGeneratedContent(response, data);
      return processedData;
    }
  }

  private static normalizeQuestionType(type: string): 'multipla-escolha' | 'discursiva' | 'verdadeiro-falso' {
    const typeLower = (type || '').toLowerCase();
    
    if (typeLower.includes('discursiva') || typeLower.includes('dissertativa') || typeLower.includes('aberta')) {
      return 'discursiva';
    }
    if (typeLower.includes('verdadeiro') || typeLower.includes('falso') || typeLower.includes('v/f') || typeLower.includes('v ou f')) {
      return 'verdadeiro-falso';
    }
    return 'multipla-escolha';
  }

  private static normalizeAlternativas(alternativas: any, type: string): string[] | undefined {
    const questionType = ListaExerciciosGenerator.normalizeQuestionType(type);
    
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

  private static normalizeRespostaCorreta(resposta: any, type: string): number | string | boolean {
    const questionType = ListaExerciciosGenerator.normalizeQuestionType(type);
    
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
      type: ListaExerciciosGenerator.normalizeQuestionType(q.type || data.modeloQuestoes),
      enunciado: q.enunciado || `Questão ${index + 1} sobre ${data.tema}`,
      alternativas: ListaExerciciosGenerator.normalizeAlternativas(q.alternativas, q.type || data.modeloQuestoes),
      respostaCorreta: ListaExerciciosGenerator.normalizeRespostaCorreta(q.respostaCorreta, q.type),
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
