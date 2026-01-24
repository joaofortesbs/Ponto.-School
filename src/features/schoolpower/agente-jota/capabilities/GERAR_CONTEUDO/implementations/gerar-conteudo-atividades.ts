/**
 * CAPABILITY: gerar_conteudo_atividades
 * 
 * Responsabilidade: Gerar conteúdo para preencher automaticamente os campos
 * de cada atividade decidida, mantendo contexto completo da conversa.
 * 
 * Fluxo:
 * 1. Consome atividades do ChosenActivitiesStore
 * 2. Para cada atividade, gera conteúdo baseado no tipo e contexto
 * 3. Atualiza o store com os campos preenchidos
 * 4. Emite eventos para sincronização com UI
 * 5. Registra debug entries detalhadas para visualização no DebugModal
 */

import { executeWithCascadeFallback } from '../../../../services/controle-APIs-gerais-school-power';
import { useChosenActivitiesStore, type ChosenActivity } from '../../../../interface-chat-producao/stores/ChosenActivitiesStore';
import { 
  ACTIVITY_FIELDS_MAPPING, 
  getFieldsForActivityType,
  type ActivityFieldsMapping,
  type FieldDefinition 
} from '../schemas/gerar-conteudo-schema';
import { 
  syncSchemaToFormData, 
  validateSyncedFields,
  generateFieldSyncDebugReport,
  persistActivityToStorage
} from '../../../../construction/utils/activity-fields-sync';
import { createDebugEntry, useDebugStore } from '../../../../interface-chat-producao/debug-system/DebugStore';
import { useActivityDebugStore } from '../../../../construction/stores/activityDebugStore';
import { ListaExerciciosGenerator } from '../../../../activities/lista-exercicios/ListaExerciciosGenerator';
import { 
  generateTextVersionContent, 
  storeTextVersionContent,
  type TextVersionInput 
} from '../../../../activities/text-version/TextVersionGenerator';
import { isTextVersionActivity } from '../../../../config/activityVersionConfig';

interface GerarConteudoParams {
  session_id: string;
  conversation_context: string;
  user_objective: string;
  activities_to_fill?: ChosenActivity[];
  on_progress?: (update: ProgressUpdate) => void;
}

interface ProgressUpdate {
  type: 'activity_started' | 'field_generated' | 'activity_completed' | 'activity_error' | 'all_completed';
  activity_id?: string;
  activity_title?: string;
  field_name?: string;
  field_value?: string;
  progress?: number;
  total_activities?: number;
  current_activity?: number;
  error?: string;
  message?: string;
}

interface GeneratedFieldsResult {
  activity_id: string;
  activity_type: string;
  generated_fields: Record<string, any>;
  success: boolean;
  error?: string;
}

interface DebugLogEntry {
  timestamp: string;
  type: 'action' | 'discovery' | 'decision' | 'error' | 'warning' | 'info';
  narrative: string;
  technical_data?: any;
}

interface GerarConteudoOutput {
  success: boolean;
  capability_id: string;
  data: any;
  error: string | null;
  debug_log: DebugLogEntry[];
  execution_time_ms: number;
  message?: string;
}

const MAX_RETRIES = 2;
const EXPONENTIAL_BACKOFF_BASE_MS = 1000;

// ============================================================
// HELPER: Truncamento Inteligente para Debug
// ============================================================
function truncateForDebug(value: any, maxLength: number = 150): string {
  if (value === null || value === undefined) return 'null';
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + `... [+${str.length - maxLength} chars]`;
}

// ============================================================
// HELPER: Gerar Correlation ID único
// ============================================================
function generateCorrelationId(): string {
  return `corr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ============================================================
// HELPER: Sleep com exponential backoff
// ============================================================
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================
// HELPER: Robust JSON Parser com múltiplas estratégias de fallback
// ============================================================
interface JsonParseResult {
  success: boolean;
  data: any;
  method: string;
  error?: string;
}

function robustJsonParse(rawText: string, activityType?: string, fieldsMapping?: ActivityFieldsMapping): JsonParseResult {
  if (!rawText || typeof rawText !== 'string') {
    return { success: false, data: null, method: 'none', error: 'Input inválido ou vazio' };
  }

  // MÉTODO 1: Limpeza básica e parse direto
  try {
    const cleaned = rawText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .replace(/^\s*[\r\n]/gm, '')
      .trim();
    
    // Tentar parse direto se começa com {
    if (cleaned.startsWith('{')) {
      const parsed = JSON.parse(cleaned);
      return { success: true, data: parsed, method: 'direct_clean_parse' };
    }
  } catch (e) {
    // Continuar para próximo método
  }

  // MÉTODO 2: Extração de JSON com regex aprimorada
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      return { success: true, data: parsed, method: 'regex_extraction' };
    }
  } catch (e) {
    // Continuar para próximo método
  }

  // MÉTODO 3: Busca específica por generated_fields
  try {
    const generatedFieldsMatch = rawText.match(/"generated_fields"\s*:\s*(\{[\s\S]*?\})/);
    if (generatedFieldsMatch) {
      const fieldsJson = generatedFieldsMatch[1];
      const parsed = JSON.parse(fieldsJson);
      return { 
        success: true, 
        data: { generated_fields: parsed }, 
        method: 'generated_fields_extraction' 
      };
    }
  } catch (e) {
    // Continuar para próximo método
  }

  // MÉTODO 4: Reparação de JSON com correções seguras (sem substituições agressivas)
  try {
    let repairedJson = rawText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .replace(/[\r\n]+/g, ' ')
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .trim();
    
    const jsonMatch = repairedJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { success: true, data: parsed, method: 'json_repair' };
    }
  } catch (e) {
    // Continuar para próximo método
  }

  // MÉTODO 5: Extração de campos individuais via regex
  // NOTA: Este método só é usado se os métodos anteriores falharam
  // Requer pelo menos 2 campos obrigatórios para considerar sucesso
  try {
    const fields: Record<string, any> = {};
    
    // Padrões para campos comuns (separando strings de números)
    const stringPatterns = [
      { key: 'theme', pattern: /"theme"\s*:\s*"([^"]+)"/i },
      { key: 'topicos', pattern: /"topicos"\s*:\s*"([^"]+)"/i },
      { key: 'contextoUso', pattern: /"contextoUso"\s*:\s*"([^"]+)"/i },
      { key: 'subject', pattern: /"subject"\s*:\s*"([^"]+)"/i },
      { key: 'schoolYear', pattern: /"schoolYear"\s*:\s*"([^"]+)"/i },
      { key: 'difficultyLevel', pattern: /"difficultyLevel"\s*:\s*"([^"]+)"/i },
      { key: 'objectives', pattern: /"objectives"\s*:\s*"([^"]+)"/i },
      { key: 'context', pattern: /"context"\s*:\s*"([^"]+)"/i },
    ];
    
    const numberPatterns = [
      { key: 'numberOfFlashcards', pattern: /"numberOfFlashcards"\s*:\s*(\d+)/i },
      { key: 'numberOfQuestions', pattern: /"numberOfQuestions"\s*:\s*(\d+)/i },
    ];
    
    for (const { key, pattern } of stringPatterns) {
      const match = rawText.match(pattern);
      if (match && match[1]) {
        fields[key] = match[1];
      }
    }
    
    for (const { key, pattern } of numberPatterns) {
      const match = rawText.match(pattern);
      if (match && match[1]) {
        fields[key] = Number(match[1]);
      }
    }
    
    // Verificar se temos campos suficientes para considerar sucesso
    // Requer pelo menos 2 campos obrigatórios extraídos
    const requiredFieldNames = fieldsMapping?.requiredFields.map(f => f.name) || [];
    const extractedRequiredCount = requiredFieldNames.filter(name => fields[name] !== undefined).length;
    
    if (extractedRequiredCount >= 2 && Object.keys(fields).length >= 2) {
      console.log(`📊 [RobustJsonParse] Método 5: Extraídos ${extractedRequiredCount}/${requiredFieldNames.length} campos obrigatórios`);
      return { 
        success: true, 
        data: { generated_fields: fields }, 
        method: 'field_extraction' 
      };
    }
  } catch (e) {
    // Continuar para próximo método
  }

  // MÉTODO 6: NÃO usar fallback com valores padrão - isso mascara erros reais
  // Em vez disso, retornar falha para permitir retry pelo sistema de tentativas
  // Os valores padrão serão usados apenas se TODAS as tentativas falharem,
  // e isso será tratado no nível superior (após MAX_RETRIES)
  
  console.warn(`⚠️ [RobustJsonParse] Todas as 5 estratégias de parsing falharam para ${activityType || 'unknown'}`);

  return { 
    success: false, 
    data: null, 
    method: 'all_methods_failed', 
    error: `Todas as 5 estratégias de parsing falharam. Tipo: ${activityType || 'unknown'}` 
  };
}

function buildContentGenerationPrompt(
  activity: ChosenActivity,
  fieldsMapping: ActivityFieldsMapping,
  conversationContext: string,
  userObjective: string
): string {
  const fieldsDescription = fieldsMapping.requiredFields.map((field, idx) => `
${idx + 1}. "${field.name}" (${field.label})
   - Descrição: ${field.description}
   - Tipo: ${field.type}
   ${field.options ? `- Opções válidas: ${field.options.join(', ')}` : ''}
   ${field.placeholder ? `- Exemplo: ${field.placeholder}` : ''}
`).join('');

  const optionalFieldsDescription = fieldsMapping.optionalFields?.map((field, idx) => `
${idx + 1}. "${field.name}" (${field.label})
   - Descrição: ${field.description}
   - Tipo: ${field.type}
   ${field.options ? `- Opções válidas: ${field.options.join(', ')}` : ''}
`).join('') || '';

  return `
# TAREFA: Gerar Conteúdo para Atividade Educacional

Você é um especialista pedagógico gerando conteúdo detalhado para uma atividade educacional.

## CONTEXTO COMPLETO DA CONVERSA
${conversationContext}

## OBJETIVO ORIGINAL DO USUÁRIO
${userObjective}

## ATIVIDADE A PREENCHER
- **Tipo**: ${fieldsMapping.displayName} (${activity.tipo})
- **Título**: ${activity.titulo}
- **Justificativa da escolha**: ${activity.justificativa}
- **Categoria**: ${activity.categoria || 'Não especificada'}
- **Matéria**: ${activity.materia || 'Não especificada'}

## CAMPOS OBRIGATÓRIOS A GERAR
${fieldsDescription}

${optionalFieldsDescription ? `## CAMPOS OPCIONAIS (gere se relevante)
${optionalFieldsDescription}` : ''}

## INSTRUÇÕES CRÍTICAS

1. **MANTENHA COERÊNCIA**: Todo conteúdo deve estar alinhado com o objetivo original do usuário
2. **SEJA ESPECÍFICO**: Gere conteúdo detalhado e pronto para uso, não genérico
3. **RESPEITE O CONTEXTO**: Use informações da conversa (disciplina, série, tema) 
4. **QUALIDADE PEDAGÓGICA**: Conteúdo deve ser educacionalmente válido
5. **CAMPOS SELECT**: Use APENAS as opções listadas
6. **CAMPOS TEXTAREA**: Gere texto rico e detalhado (mínimo 50 caracteres)
7. **CAMPOS NUMBER**: Use valores numéricos apropriados (ex: 10, 15, 20)

## FORMATO DE RESPOSTA - JSON ESTRITO

ATENÇÃO: Você DEVE retornar EXATAMENTE este formato JSON. NÃO inclua markdown, comentários, ou texto antes/depois.
NÃO use aspas simples. Use APENAS aspas duplas para strings.
NÃO inclua vírgulas após o último campo de um objeto.

{
  "generated_fields": {
    "${fieldsMapping.requiredFields[0]?.name || 'campo1'}": "valor gerado aqui",
    "${fieldsMapping.requiredFields[1]?.name || 'campo2'}": "valor gerado aqui"${fieldsMapping.requiredFields.length > 2 ? `,
    "${fieldsMapping.requiredFields[2]?.name || 'campo3'}": "valor gerado aqui"` : ''}
  },
  "reasoning": "Breve explicação pedagógica"
}

⚠️ REGRAS OBRIGATÓRIAS:
- Retorne APENAS o JSON puro, sem \`\`\`json ou \`\`\` 
- Todas as strings devem usar aspas duplas (")
- Números devem ser escritos sem aspas (ex: 10, não "10")
- NÃO inclua comentários no JSON
`.trim();
}

function validateGeneratedFields(
  fields: Record<string, any>,
  mapping: ActivityFieldsMapping
): { valid: boolean; errors: string[]; correctedFields: Record<string, any> } {
  const errors: string[] = [];
  const correctedFields = { ...fields };

  for (const fieldDef of mapping.requiredFields) {
    const value = fields[fieldDef.name];
    
    if (value === undefined || value === null || value === '') {
      errors.push(`Campo obrigatório "${fieldDef.label}" não foi preenchido`);
      continue;
    }

    if (fieldDef.type === 'select' && fieldDef.options) {
      const normalizedValue = String(value).toLowerCase();
      const validOption = fieldDef.options.find(opt => 
        opt.toLowerCase() === normalizedValue
      );
      if (!validOption) {
        const closestOption = fieldDef.options[0];
        correctedFields[fieldDef.name] = closestOption;
        errors.push(`Campo "${fieldDef.label}" corrigido de "${value}" para "${closestOption}"`);
      } else {
        correctedFields[fieldDef.name] = validOption;
      }
    }

    if (fieldDef.type === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        correctedFields[fieldDef.name] = 10;
        errors.push(`Campo "${fieldDef.label}" não é numérico, usando valor padrão`);
      } else {
        correctedFields[fieldDef.name] = numValue;
      }
    }

    if (fieldDef.type === 'textarea') {
      const textValue = String(value);
      if (textValue.length < 20) {
        errors.push(`Campo "${fieldDef.label}" tem conteúdo muito curto`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    correctedFields
  };
}

async function generateContentForActivity(
  activity: ChosenActivity,
  conversationContext: string,
  userObjective: string,
  onProgress?: (update: ProgressUpdate) => void,
  capabilityId?: string,
  capabilityName?: string
): Promise<GeneratedFieldsResult> {
  const correlationId = generateCorrelationId();
  const activityStartTime = Date.now();
  const CAPABILITY_ID = capabilityId || 'gerar_conteudo_atividades';
  const CAPABILITY_NAME = capabilityName || 'Gerando conteúdo para as atividades';
  
  const fieldsMapping = getFieldsForActivityType(activity.tipo);
  
  if (!fieldsMapping) {
    console.warn(`⚠️ [GerarConteudo] Tipo de atividade não mapeado: ${activity.tipo}`);
    
    createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'error',
      `Tipo de atividade "${activity.tipo}" não possui mapeamento de campos definido.`,
      'high',
      { correlation_id: correlationId, activity_id: activity.id, activity_type: activity.tipo }
    );
    
    return {
      activity_id: activity.id,
      activity_type: activity.tipo,
      generated_fields: {},
      success: false,
      error: `Tipo de atividade "${activity.tipo}" não possui mapeamento de campos`
    };
  }

  // ========================================
  // HANDLER ESPECIALIZADO: LISTA DE EXERCÍCIOS
  // Usa ListaExerciciosGenerator para gerar questões REAIS
  // ========================================
  if (activity.tipo === 'lista-exercicios') {
    console.log(`📝 [GerarConteudo] ====== HANDLER ESPECIALIZADO: LISTA DE EXERCÍCIOS ======`);
    console.log(`📝 [GerarConteudo] Atividade: ${activity.titulo} (${activity.id})`);
    
    createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'action',
      `[LISTA-EXERCICIOS] Usando gerador especializado para "${activity.titulo}"`,
      'high',
      { correlation_id: correlationId, activity_id: activity.id, activity_type: activity.tipo }
    );
    
    try {
      const generator = new ListaExerciciosGenerator();
      
      const listaData = {
        titulo: activity.titulo || 'Lista de Exercícios',
        title: activity.titulo || 'Lista de Exercícios',
        tema: activity.campos_preenchidos?.theme || activity.campos_preenchidos?.tema || userObjective || 'Matemática',
        theme: activity.campos_preenchidos?.theme || activity.campos_preenchidos?.tema || userObjective || 'Matemática',
        disciplina: activity.campos_preenchidos?.subject || activity.campos_preenchidos?.disciplina || 'Matemática',
        subject: activity.campos_preenchidos?.subject || activity.campos_preenchidos?.disciplina || 'Matemática',
        anoEscolaridade: activity.campos_preenchidos?.schoolYear || activity.campos_preenchidos?.anoEscolaridade || '7º Ano',
        schoolYear: activity.campos_preenchidos?.schoolYear || activity.campos_preenchidos?.anoEscolaridade || '7º Ano',
        nivelDificuldade: activity.campos_preenchidos?.difficultyLevel || activity.campos_preenchidos?.nivelDificuldade || 'Médio',
        difficultyLevel: activity.campos_preenchidos?.difficultyLevel || activity.campos_preenchidos?.nivelDificuldade || 'Médio',
        numeroQuestoes: String(activity.campos_preenchidos?.numberOfQuestions || activity.campos_preenchidos?.numeroQuestoes || 10),
        numberOfQuestions: String(activity.campos_preenchidos?.numberOfQuestions || activity.campos_preenchidos?.numeroQuestoes || 10),
        modeloQuestoes: activity.campos_preenchidos?.questionModel || activity.campos_preenchidos?.modeloQuestoes || 'Múltipla Escolha',
        questionModel: activity.campos_preenchidos?.questionModel || activity.campos_preenchidos?.modeloQuestoes || 'Múltipla Escolha',
        objetivos: activity.campos_preenchidos?.objectives || activity.campos_preenchidos?.objetivos || `Avaliar conhecimentos sobre ${userObjective}`,
        objectives: activity.campos_preenchidos?.objectives || activity.campos_preenchidos?.objetivos || `Avaliar conhecimentos sobre ${userObjective}`
      };
      
      console.log(`📝 [GerarConteudo] Dados para geração:`, JSON.stringify(listaData, null, 2).substring(0, 500));
      
      const generatedContent = await generator.generateListaExerciciosContent(listaData);
      
      console.log(`✅ [GerarConteudo] Lista gerada com sucesso!`);
      console.log(`✅ [GerarConteudo] Questões geradas: ${generatedContent.questoes?.length || 0}`);
      
      if (generatedContent.questoes && generatedContent.questoes.length > 0) {
        console.log(`✅ [GerarConteudo] Primeira questão:`, generatedContent.questoes[0]?.enunciado?.substring(0, 100));
      }
      
      const generatedFields = {
        titulo: generatedContent.titulo,
        theme: generatedContent.tema,
        tema: generatedContent.tema,
        subject: generatedContent.disciplina,
        disciplina: generatedContent.disciplina,
        schoolYear: generatedContent.anoEscolaridade,
        anoEscolar: generatedContent.anoEscolaridade,
        difficultyLevel: generatedContent.dificuldade,
        nivelDificuldade: generatedContent.dificuldade,
        numberOfQuestions: generatedContent.questoes?.length || 10,
        quantidadeQuestoes: generatedContent.questoes?.length || 10,
        questionModel: generatedContent.tipoQuestoes,
        modeloQuestao: generatedContent.tipoQuestoes,
        objectives: generatedContent.objetivos,
        objetivos: generatedContent.objetivos,
        questoes: generatedContent.questoes,
        isGeneratedByAI: true,
        generatedAt: new Date().toISOString()
      };
      
      createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'info',
        `[LISTA-EXERCICIOS] Geração concluída: ${generatedContent.questoes?.length || 0} questões reais geradas pela IA`,
        'high',
        { 
          correlation_id: correlationId, 
          activity_id: activity.id,
          questions_count: generatedContent.questoes?.length || 0,
          first_question_preview: generatedContent.questoes?.[0]?.enunciado?.substring(0, 100)
        }
      );
      
      const executionTime = Date.now() - activityStartTime;
      
      if (onProgress) {
        onProgress({
          type: 'activity_completed',
          activity_id: activity.id,
          activity_title: activity.titulo,
          message: `Lista de exercícios gerada com ${generatedContent.questoes?.length || 0} questões reais`
        });
      }
      
      return {
        activity_id: activity.id,
        activity_type: activity.tipo,
        generated_fields: generatedFields,
        success: true
      };
      
    } catch (error) {
      console.error(`❌ [GerarConteudo] Erro ao gerar lista de exercícios:`, error);
      
      createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'error',
        `[LISTA-EXERCICIOS] Erro na geração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        'critical',
        { correlation_id: correlationId, activity_id: activity.id, error: String(error) }
      );
      
      return {
        activity_id: activity.id,
        activity_type: activity.tipo,
        generated_fields: {},
        success: false,
        error: `Erro ao gerar lista de exercícios: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  // ========================================
  // HANDLER ESPECIALIZADO: ATIVIDADES VERSÃO TEXTO
  // Usa TextVersionGenerator para gerar conteúdo em formato texto
  // Atividades: plano-aula, sequencia-didatica, tese-redacao
  // ========================================
  if (isTextVersionActivity(activity.tipo)) {
    console.log(`📄 [GerarConteudo] ====== HANDLER ESPECIALIZADO: ATIVIDADE VERSÃO TEXTO ======`);
    console.log(`📄 [GerarConteudo] Tipo: ${activity.tipo} - "${activity.titulo}" (${activity.id})`);
    
    createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'action',
      `[VERSÃO-TEXTO] Usando gerador de texto para "${activity.titulo}" (${activity.tipo})`,
      'high',
      { correlation_id: correlationId, activity_id: activity.id, activity_type: activity.tipo }
    );
    
    try {
      const textInput: TextVersionInput = {
        activityType: activity.tipo,
        activityId: activity.id,
        context: {
          tema: activity.campos_preenchidos?.theme || activity.campos_preenchidos?.tema || userObjective,
          disciplina: activity.campos_preenchidos?.subject || activity.campos_preenchidos?.disciplina,
          serie: activity.campos_preenchidos?.schoolYear || activity.campos_preenchidos?.serie,
          objetivos: activity.campos_preenchidos?.objectives || activity.campos_preenchidos?.objetivos,
          metodologia: activity.campos_preenchidos?.tipoAula || activity.campos_preenchidos?.metodologia,
          duracao: activity.campos_preenchidos?.tempoLimite || activity.campos_preenchidos?.duracao,
          description: activity.campos_preenchidos?.description || activity.campos_preenchidos?.descricao,
          ...activity.campos_preenchidos
        },
        conversationContext,
        userObjective
      };
      
      console.log(`📄 [GerarConteudo] Input para geração de texto:`, JSON.stringify(textInput.context, null, 2).substring(0, 500));
      
      const textVersionResult = await generateTextVersionContent(textInput);
      
      if (textVersionResult.success) {
        console.log(`✅ [GerarConteudo] Conteúdo texto gerado com sucesso!`);
        console.log(`✅ [GerarConteudo] Seções geradas: ${textVersionResult.sections?.length || 0}`);
        
        storeTextVersionContent(activity.id, activity.tipo, textVersionResult);
        
        const generatedFields = {
          titulo: activity.titulo || textVersionResult.rawData?.titulo || 'Atividade Gerada',
          theme: textInput.context.tema,
          tema: textInput.context.tema,
          subject: textInput.context.disciplina,
          disciplina: textInput.context.disciplina,
          schoolYear: textInput.context.serie,
          serie: textInput.context.serie,
          objectives: textInput.context.objetivos,
          objetivos: textInput.context.objetivos,
          textContent: textVersionResult.textContent,
          sections: textVersionResult.sections,
          versionType: 'text',
          isTextVersion: true,
          isGeneratedByAI: true,
          generatedAt: textVersionResult.generatedAt
        };
        
        createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'info',
          `[VERSÃO-TEXTO] Geração concluída: ${textVersionResult.sections?.length || 0} seções geradas`,
          'high',
          { 
            correlation_id: correlationId, 
            activity_id: activity.id,
            sections_count: textVersionResult.sections?.length || 0,
            text_preview: textVersionResult.textContent?.substring(0, 200)
          }
        );
        
        const executionTime = Date.now() - activityStartTime;
        
        if (onProgress) {
          onProgress({
            type: 'activity_completed',
            activity_id: activity.id,
            activity_title: activity.titulo,
            message: `Conteúdo em texto gerado com ${textVersionResult.sections?.length || 0} seções`
          });
        }
        
        return {
          activity_id: activity.id,
          activity_type: activity.tipo,
          generated_fields: generatedFields,
          success: true
        };
      } else {
        throw new Error(textVersionResult.error || 'Falha na geração de conteúdo texto');
      }
      
    } catch (error) {
      console.error(`❌ [GerarConteudo] Erro ao gerar conteúdo texto:`, error);
      
      createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'error',
        `[VERSÃO-TEXTO] Erro na geração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        'critical',
        { correlation_id: correlationId, activity_id: activity.id, error: String(error) }
      );
      
      return {
        activity_id: activity.id,
        activity_type: activity.tipo,
        generated_fields: {
          versionType: 'text',
          isTextVersion: true,
          error: String(error)
        },
        success: false,
        error: `Erro ao gerar conteúdo texto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  // ========================================
  // ESTÁGIO 1: PRE-GENERATION (Schema Mapping)
  // ========================================
  const requiredFieldNames = fieldsMapping.requiredFields.map(f => f.name);
  const optionalFieldNames = fieldsMapping.optionalFields?.map(f => f.name) || [];
  
  createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'info',
    `[PRE-GEN] Mapeando schema para "${activity.titulo}" (${fieldsMapping.displayName}):\n` +
    `- Campos obrigatórios: ${requiredFieldNames.join(', ')}\n` +
    `- Campos opcionais: ${optionalFieldNames.length > 0 ? optionalFieldNames.join(', ') : 'nenhum'}`,
    'low',
    { 
      correlation_id: correlationId,
      stage: 'pre_generation',
      activity_id: activity.id,
      activity_type: activity.tipo,
      schema: {
        required_fields: requiredFieldNames,
        optional_fields: optionalFieldNames,
        total_fields: requiredFieldNames.length + optionalFieldNames.length
      }
    }
  );

  const prompt = buildContentGenerationPrompt(
    activity,
    fieldsMapping,
    conversationContext,
    userObjective
  );

  let lastError: string = '';
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const attemptStartTime = Date.now();
    
    // Exponential backoff para retries
    if (attempt > 0) {
      const backoffMs = EXPONENTIAL_BACKOFF_BASE_MS * Math.pow(2, attempt - 1);
      console.log(`⏳ [GerarConteudo] Aguardando ${backoffMs}ms antes da tentativa ${attempt + 1}`);
      
      createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'warning',
        `[GEN] Retry ${attempt + 1}/${MAX_RETRIES + 1} após ${backoffMs}ms de backoff. Erro anterior: ${truncateForDebug(lastError, 100)}`,
        'medium',
        { correlation_id: correlationId, attempt, backoff_ms: backoffMs, previous_error: lastError }
      );
      
      await sleep(backoffMs);
    }
    
    try {
      console.log(`🎯 [GerarConteudo] Gerando conteúdo para "${activity.titulo}" (tentativa ${attempt + 1})`);
      
      // ========================================
      // ESTÁGIO 2: GENERATION (API Call)
      // ========================================
      createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'action',
        `[GEN] Chamando API LLM para "${activity.titulo}" (tentativa ${attempt + 1}/${MAX_RETRIES + 1})`,
        'low',
        { 
          correlation_id: correlationId,
          stage: 'generation',
          attempt: attempt + 1,
          prompt_length: prompt.length,
          prompt_preview: truncateForDebug(prompt, 200)
        }
      );
      
      const response = await executeWithCascadeFallback(prompt);
      const apiResponseTime = Date.now() - attemptStartTime;

      if (!response.success || !response.data) {
        lastError = response.errors?.[0]?.error || 'Resposta vazia da IA';
        
        createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'warning',
          `[GEN] API retornou erro: ${truncateForDebug(lastError, 100)}`,
          'medium',
          { 
            correlation_id: correlationId, 
            stage: 'generation',
            error: lastError, 
            response_time_ms: apiResponseTime,
            model_used: response.modelUsed || 'unknown'
          }
        );
        
        continue;
      }

      // ========================================
      // ESTÁGIO 3: POST-GENERATION (Validation & Formatting)
      // ========================================
      // USANDO NOVO PARSER ROBUSTO com múltiplas estratégias de fallback
      const parseResult = robustJsonParse(response.data, activity.tipo, fieldsMapping);
      
      if (!parseResult.success) {
        lastError = parseResult.error || 'Falha ao parsear JSON com todas as estratégias';
        
        createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'warning',
          `[POST-GEN] Falha no parsing robusto: ${parseResult.method}`,
          'medium',
          { 
            correlation_id: correlationId, 
            stage: 'post_generation',
            parse_method: parseResult.method,
            error: parseResult.error,
            raw_response_preview: truncateForDebug(response.data, 300)
          }
        );
        
        continue;
      }
      
      const parsed = parseResult.data;
      
      // Log de sucesso do parsing
      createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'info',
        `[POST-GEN] JSON parseado com sucesso via método: ${parseResult.method}`,
        'low',
        { 
          correlation_id: correlationId, 
          stage: 'post_generation',
          parse_method: parseResult.method,
          has_generated_fields: !!parsed.generated_fields
        }
      );

      if (!parsed.generated_fields || typeof parsed.generated_fields !== 'object') {
        lastError = 'Resposta não contém generated_fields';
        
        createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'warning',
          `[POST-GEN] JSON válido mas sem generated_fields. Keys: ${Object.keys(parsed).join(', ')}`,
          'medium',
          { correlation_id: correlationId, stage: 'post_generation', parsed_keys: Object.keys(parsed) }
        );
        
        continue;
      }

      const validation = validateGeneratedFields(parsed.generated_fields, fieldsMapping);
      
      // Log de validação detalhado
      createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'discovery',
        `[POST-GEN] Validação de schema concluída:\n` +
        `- Campos validados: ${Object.keys(validation.correctedFields).length}\n` +
        `- Correções aplicadas: ${validation.errors.length}` +
        (validation.errors.length > 0 ? `\n- Detalhes: ${validation.errors.join('; ')}` : ''),
        validation.errors.length > 0 ? 'medium' : 'low',
        { 
          correlation_id: correlationId,
          stage: 'post_generation',
          validation_passed: validation.valid,
          corrections_count: validation.errors.length,
          corrections: validation.errors
        }
      );
      
      if (validation.errors.length > 0) {
        console.log(`⚠️ [GerarConteudo] Correções aplicadas: ${validation.errors.join(', ')}`);
      }

      for (const [fieldName, fieldValue] of Object.entries(validation.correctedFields)) {
        onProgress?.({
          type: 'field_generated',
          activity_id: activity.id,
          activity_title: activity.titulo,
          field_name: fieldName,
          field_value: String(fieldValue).substring(0, 50) + '...'
        });
      }

      // Log final de sucesso com todos os campos gerados
      const fieldsGeneratedSummary = Object.entries(validation.correctedFields)
        .map(([key, value]) => `• ${key}: "${truncateForDebug(value, 80)}"`)
        .join('\n');
      
      createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'action',
        `[POST-GEN] Geração concluída para "${activity.titulo}":\n${fieldsGeneratedSummary}`,
        'low',
        { 
          correlation_id: correlationId,
          stage: 'post_generation',
          activity_id: activity.id,
          total_execution_time_ms: Date.now() - activityStartTime,
          api_response_time_ms: apiResponseTime,
          fields_count: Object.keys(validation.correctedFields).length,
          generated_fields: validation.correctedFields
        }
      );

      return {
        activity_id: activity.id,
        activity_type: activity.tipo,
        generated_fields: validation.correctedFields,
        success: true
      };

    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`❌ [GerarConteudo] Erro na tentativa ${attempt + 1}:`, lastError);
      
      createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'error',
        `[GEN] Exceção na tentativa ${attempt + 1}: ${truncateForDebug(lastError, 150)}`,
        'high',
        { 
          correlation_id: correlationId, 
          stage: 'generation',
          attempt: attempt + 1,
          error: lastError,
          stack_trace: error instanceof Error ? error.stack?.substring(0, 500) : undefined
        }
      );
    }
  }

  // Falha após todas as tentativas
  createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'error',
    `Falha ao gerar conteúdo para "${activity.titulo}" após ${MAX_RETRIES + 1} tentativas. Último erro: ${truncateForDebug(lastError, 150)}`,
    'high',
    { 
      correlation_id: correlationId,
      activity_id: activity.id,
      total_attempts: MAX_RETRIES + 1,
      final_error: lastError,
      total_time_ms: Date.now() - activityStartTime
    }
  );

  return {
    activity_id: activity.id,
    activity_type: activity.tipo,
    generated_fields: {},
    success: false,
    error: lastError
  };
}

export async function gerarConteudoAtividades(
  params: GerarConteudoParams
): Promise<GerarConteudoOutput> {
  const startTime = Date.now();
  const debugLog: DebugLogEntry[] = [];
  const CAPABILITY_ID = 'gerar_conteudo_atividades';
  const CAPABILITY_NAME = 'Gerando conteúdo para as atividades';
  
  // ═══════════════════════════════════════════════════════════════════════
  // 🔥 LOGGING INVASIVO - DIAGNÓSTICO DE PARÂMETROS RECEBIDOS
  // ═══════════════════════════════════════════════════════════════════════
  const diagnosticMessage = `
═══════════════════════════════════════════════════════════════════════
🚀 STARTING: gerar_conteudo_atividades
═══════════════════════════════════════════════════════════════════════
Received params keys: ${Object.keys(params).join(', ')}
activities_to_fill exists: ${!!params.activities_to_fill}
activities_to_fill length: ${params.activities_to_fill?.length || 0}
session_id: ${params.session_id || 'NOT PROVIDED'}
user_objective: ${params.user_objective?.substring(0, 50) || 'NOT PROVIDED'}
═══════════════════════════════════════════════════════════════════════`;
  
  console.error(diagnosticMessage);
  
  // Inicializar DebugStore
  useDebugStore.getState().startCapability(CAPABILITY_ID, CAPABILITY_NAME);
  
  // Entry com diagnóstico completo
  createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'action', 
    `Iniciando execução da capability "${CAPABILITY_NAME}". Objetivo: processar dados conforme parâmetros recebidos.`,
    'low',
    { 
      session_id: params.session_id, 
      objetivo: params.user_objective?.substring(0, 100),
      params_keys: Object.keys(params),
      activities_to_fill_count: params.activities_to_fill?.length || 0
    }
  );
  
  debugLog.push({
    timestamp: new Date().toISOString(),
    type: 'action',
    narrative: '🚀 Iniciando geração de conteúdo para atividades',
    technical_data: { session_id: params.session_id }
  });

  // BUSCA DE ATIVIDADES COM MÚLTIPLAS FONTES (FALLBACK ROBUSTO)
  const store = useChosenActivitiesStore.getState();
  
  // Fonte 1: Parâmetro activities_to_fill (preferencial - vem do executor)
  let activities = params.activities_to_fill;
  let activitySource = 'params.activities_to_fill';
  
  // Fonte 2: Fallback para store
  if (!activities || activities.length === 0) {
    activities = store.getChosenActivities();
    activitySource = 'store.getChosenActivities()';
    console.error(`📦 [GerarConteudo] Fallback para store: ${activities?.length || 0} atividades`);
  }
  
  // Log detalhado das fontes de dados
  console.error(`
📊 [GerarConteudo] FONTES DE DADOS:
   - params.activities_to_fill: ${params.activities_to_fill?.length || 0} atividades
   - store.getChosenActivities(): ${store.getChosenActivities()?.length || 0} atividades
   - store.isDecisionComplete: ${store.isDecisionComplete}
   - store.sessionId: ${store.sessionId}
   - FONTE USADA: ${activitySource}
   - TOTAL FINAL: ${activities?.length || 0} atividades
  `);

  if (!activities || activities.length === 0) {
    const errorDetail = `
❌ CRITICAL ERROR: No activities received!
   - params.activities_to_fill: ${params.activities_to_fill?.length || 'undefined'}
   - store.getChosenActivities(): ${store.getChosenActivities()?.length || 0}
   - store.isDecisionComplete: ${store.isDecisionComplete}
   - Possible cause: gerar_conteudo_atividades executed BEFORE decidir_atividades_criar saved data
    `;
    console.error(errorDetail);
    
    createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'error',
      'Nenhuma atividade encontrada para preencher. Verifique se a capability "decidir_atividades_criar" foi executada e salvou os dados.',
      'high',
      {
        params_activities_count: params.activities_to_fill?.length || 0,
        store_activities_count: store.getChosenActivities()?.length || 0,
        store_is_decision_complete: store.isDecisionComplete,
        diagnostic: 'TIMING ISSUE - capability executed before data persistence'
      }
    );
    
    // CRÍTICO: Encerrar capability antes de retornar
    useDebugStore.getState().endCapability(CAPABILITY_ID);
    
    return {
      success: false,
      capability_id: CAPABILITY_ID,
      error: 'Nenhuma atividade encontrada para preencher. A capability decidir_atividades_criar pode não ter salvado os dados corretamente.',
      data: null,
      debug_log: debugLog,
      execution_time_ms: Date.now() - startTime
    };
  }
  
  // LOG DE SUCESSO - ATIVIDADES ENCONTRADAS
  console.error(`🔥 GENERATING CONTENT FOR ${activities.length} ACTIVITIES (source: ${activitySource})`);
  activities.forEach((act, idx) => {
    console.error(`  Activity ${idx + 1}: ID=${act.id}, Type=${act.tipo}, Title=${act.titulo}`);
  });

  // Entry informativa sobre capabilities encontradas
  createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'info',
    `Capability "${CAPABILITY_ID}" encontrada no registro. Iniciando execução com os parâmetros configurados.`,
    'low'
  );
  
  // Entry com descoberta das atividades
  const activitySummary = activities.map(a => `• ${a.titulo} (${a.tipo})`).join('\n');
  createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'discovery',
    `Encontradas ${activities.length} atividades para gerar conteúdo:\n${activitySummary}`,
    'low',
    { 
      quantidade: activities.length,
      atividades: activities.map(a => ({ id: a.id, titulo: a.titulo, tipo: a.tipo }))
    }
  );
  
  debugLog.push({
    timestamp: new Date().toISOString(),
    type: 'discovery',
    narrative: `📋 ${activities.length} atividades para preencher`,
    technical_data: { activity_ids: activities.map(a => a.id) }
  });
  
  // MOSTRAR CAMPOS QUE PRECISAM SER GERADOS PARA CADA ATIVIDADE
  for (const activity of activities) {
    const fieldsMapping = getFieldsForActivityType(activity.tipo);
    
    if (fieldsMapping) {
      const requiredFieldsList = fieldsMapping.requiredFields.map(f => `• ${f.label}: ${f.description}`).join('\n');
      const optionalFieldsList = fieldsMapping.optionalFields?.map(f => `• ${f.label}: ${f.description}`).join('\n') || '';
      
      createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'discovery',
        `📋 Campos para "${activity.titulo}" (${fieldsMapping.displayName}):\n\n` +
        `CAMPOS OBRIGATÓRIOS:\n${requiredFieldsList}` +
        (optionalFieldsList ? `\n\nCAMPOS OPCIONAIS:\n${optionalFieldsList}` : ''),
        'low',
        {
          activity_id: activity.id,
          activity_type: activity.tipo,
          required_fields: fieldsMapping.requiredFields.map(f => f.name),
          optional_fields: fieldsMapping.optionalFields?.map(f => f.name) || []
        }
      );
    } else {
      createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'warning',
        `Tipo de atividade "${activity.tipo}" não possui mapeamento de campos definido.`,
        'medium'
      );
    }
  }

  const results: GeneratedFieldsResult[] = [];
  const totalActivities = activities.length;

  // Obter referência do ActivityDebugStore para logs detalhados por atividade
  const activityDebugStore = useActivityDebugStore.getState();

  for (let i = 0; i < activities.length; i++) {
    const activity = activities[i];
    
    // ═══════════════════════════════════════════════════════════════════════
    // INICIALIZAR DEBUG DA ATIVIDADE - Logs aparecerão no ActivityDebugModal
    // ═══════════════════════════════════════════════════════════════════════
    activityDebugStore.initActivity(activity.id, activity.titulo, activity.tipo);
    activityDebugStore.setStatus(activity.id, 'building');
    activityDebugStore.setProgress(activity.id, 0, 'Iniciando geração de conteúdo');
    
    activityDebugStore.log(
      activity.id, 'action', 'GerarConteudo',
      `Iniciando geração de conteúdo para "${activity.titulo}"`,
      { 
        activity_type: activity.tipo, 
        index: i + 1, 
        total: totalActivities,
        fields_to_generate: getFieldsForActivityType(activity.tipo)?.requiredFields?.map(f => f.name) || []
      }
    );
    
    params.on_progress?.({
      type: 'activity_started',
      activity_id: activity.id,
      activity_title: activity.titulo,
      current_activity: i + 1,
      total_activities: totalActivities,
      progress: Math.round((i / totalActivities) * 100),
      message: `Gerando conteúdo para: ${activity.titulo}`
    });

    store.updateActivityStatus(activity.id, 'construindo', Math.round((i / totalActivities) * 100));
    
    activityDebugStore.setProgress(activity.id, 10, 'Preparando chamada à API de IA');
    activityDebugStore.log(
      activity.id, 'api', 'GerarConteudo',
      'Chamando API de IA (Groq/Gemini) para gerar campos...',
      { model_cascade: ['llama3.3-70b', 'llama3.1-8b', 'gemini-1.5-flash'] }
    );

    const result = await generateContentForActivity(
      activity,
      params.conversation_context,
      params.user_objective,
      params.on_progress,
      CAPABILITY_ID,
      CAPABILITY_NAME
    );

    // A função generateContentForActivity já registra debug entries detalhadas
    // Aqui só atualizamos o store e emitimos eventos

    results.push(result);
    
    // ═══════════════════════════════════════════════════════════════════════
    // LOGS DE DEBUG PÓS-GERAÇÃO - Mostrar resultado da API
    // ═══════════════════════════════════════════════════════════════════════
    activityDebugStore.setProgress(activity.id, 50, 'Processando resposta da IA');
    
    if (result.success) {
      activityDebugStore.log(
        activity.id, 'success', 'API-Response',
        `API retornou ${Object.keys(result.generated_fields).length} campos gerados`,
        { 
          fields_generated: Object.keys(result.generated_fields),
          sample_values: Object.fromEntries(
            Object.entries(result.generated_fields).slice(0, 3).map(([k, v]) => 
              [k, typeof v === 'string' ? v.substring(0, 100) + (v.length > 100 ? '...' : '') : v]
            )
          )
        }
      );
    } else {
      activityDebugStore.log(
        activity.id, 'error', 'API-Response',
        `Falha na geração: ${result.error}`,
        { error: result.error }
      );
    }

    if (result.success) {
      // CORREÇÃO: Primeiro salvamos os campos, DEPOIS atualizamos o status para 'concluida'
      // Isso garante que o contador de campos esteja correto quando o status mudar
      
      activityDebugStore.setProgress(activity.id, 60, 'Sincronizando campos com formulário');
      const syncedFields = syncSchemaToFormData(activity.tipo, result.generated_fields);
      
      console.log('%c📊 [GerarConteudo] Relatório de sincronização:', 
        'background: #9C27B0; color: white; padding: 2px 5px; border-radius: 3px;');
      console.log(generateFieldSyncDebugReport(activity.tipo, syncedFields));
      
      const validation = validateSyncedFields(activity.tipo, syncedFields);
      console.log(`%c📋 [GerarConteudo] Validação: ${validation.filledFields.length} campos preenchidos, ${validation.missingFields.length} faltando`,
        validation.valid ? 'color: green;' : 'color: orange;');
      
      activityDebugStore.setProgress(activity.id, 70, 'Validando campos gerados');
      activityDebugStore.log(
        activity.id, 'info', 'Validation',
        `Validação: ${validation.filledFields.length} campos preenchidos, ${validation.missingFields.length} faltando`,
        { 
          filled_fields: validation.filledFields,
          missing_fields: validation.missingFields,
          is_valid: validation.valid
        }
      );
      
      store.setActivityGeneratedFields(activity.id, syncedFields);
      
      const updatedActivity = store.getActivityById(activity.id);
      if (updatedActivity) {
        store.setActivityBuiltData(activity.id, {
          ...updatedActivity.dados_construidos,
          generated_fields: syncedFields,
          original_generated_fields: result.generated_fields,
          generation_timestamp: new Date().toISOString(),
          sync_validation: validation
        });
      }

      // ═══════════════════════════════════════════════════════════════════════
      // PERSISTÊNCIA IMEDIATA NO LOCALSTORAGE
      // Esta é a correção crítica: salvar no localStorage AGORA, não depender
      // do autoBuildService/ModalBridge que pode ter race conditions
      // ═══════════════════════════════════════════════════════════════════════
      activityDebugStore.setProgress(activity.id, 80, 'Salvando no localStorage');
      activityDebugStore.log(
        activity.id, 'action', 'LocalStorage',
        'Persistindo dados no localStorage...',
        { keys_to_save: ['activity_*', 'constructed_*', 'generated_content_*'] }
      );
      
      const savedKeys = persistActivityToStorage(
        activity.id,
        activity.tipo,
        activity.titulo,
        syncedFields,
        {
          description: (activity as any).descricao || activity.titulo,
          isPreGenerated: true,
          source: 'gerar_conteudo_atividades'
        }
      );
      
      console.log(`%c💾 [GerarConteudo] Atividade persistida em ${savedKeys.length} chaves do localStorage`,
        'background: #FF5722; color: white; padding: 2px 5px; border-radius: 3px;');
      
      activityDebugStore.log(
        activity.id, 'success', 'LocalStorage',
        `Dados persistidos em ${savedKeys.length} chaves do localStorage`,
        { saved_keys: savedKeys }
      );

      // CORREÇÃO CRÍTICA: Usar contagens diretamente do syncedFields que acabamos de criar
      // NÃO depender do store pois pode não ter atualizado ainda
      const actualFieldsCount = validation.filledFields.length; // Contagem exata do validation
      const totalRequiredFields = activity.campos_obrigatorios?.length || validation.filledFields.length + validation.missingFields.length;
      
      console.log(`%c✅ [GerarConteudo] Campos gerados para ${activity.id}: ${actualFieldsCount}/${totalRequiredFields} campos. Atualizando status para 'concluida'`,
        'background: #4CAF50; color: white; padding: 2px 5px; border-radius: 3px;');
      
      // Aguardar próximo tick para garantir que o store foi atualizado
      await Promise.resolve();
      
      // Status 'concluida' só é definido DEPOIS que os campos foram salvos
      store.updateActivityStatus(activity.id, 'concluida', 100);
      
      // ═══════════════════════════════════════════════════════════════════════
      // MARCAR DEBUG COMO CONCLUÍDO - ActivityDebugModal mostrará status verde
      // ═══════════════════════════════════════════════════════════════════════
      activityDebugStore.setProgress(activity.id, 100, 'Atividade construída com sucesso');
      activityDebugStore.markCompleted(activity.id);

      console.log('📤 [GerarConteudo] Emitindo evento agente-jota-fields-generated para:', activity.id);
      window.dispatchEvent(new CustomEvent('agente-jota-fields-generated', {
        detail: {
          activity_id: activity.id,
          activity_type: activity.tipo,
          fields: syncedFields,
          original_fields: result.generated_fields,
          validation: validation,
          // CORREÇÃO: Usar contagens diretamente do syncedFields/validation, não do store
          fields_completed: actualFieldsCount,
          fields_total: totalRequiredFields
        }
      }));

      params.on_progress?.({
        type: 'activity_completed',
        activity_id: activity.id,
        activity_title: activity.titulo,
        current_activity: i + 1,
        total_activities: totalActivities,
        progress: Math.round(((i + 1) / totalActivities) * 100),
        message: `Conteúdo gerado para: ${activity.titulo}`
      });

      debugLog.push({
        timestamp: new Date().toISOString(),
        type: 'action',
        narrative: `✅ Conteúdo gerado para "${activity.titulo}"`,
        technical_data: { 
          activity_id: activity.id,
          fields_count: Object.keys(result.generated_fields).length,
          generated_fields: result.generated_fields
        }
      });

    } else {
      // ═══════════════════════════════════════════════════════════════════════
      // MARCAR DEBUG COMO ERRO - ActivityDebugModal mostrará status vermelho
      // ═══════════════════════════════════════════════════════════════════════
      activityDebugStore.setError(activity.id, result.error || 'Erro desconhecido na geração');
      
      store.updateActivityStatus(activity.id, 'erro', 0, result.error);
      
      params.on_progress?.({
        type: 'activity_error',
        activity_id: activity.id,
        activity_title: activity.titulo,
        error: result.error,
        message: `Erro ao gerar conteúdo para: ${activity.titulo}`
      });

      debugLog.push({
        timestamp: new Date().toISOString(),
        type: 'error',
        narrative: `❌ Erro em "${activity.titulo}": ${result.error}`,
        technical_data: { activity_id: activity.id, error: result.error }
      });
    }
  }

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  const executionTime = Date.now() - startTime;

  const totalFieldsGenerated = results.reduce((acc, r) => 
    acc + (r.success ? Object.keys(r.generated_fields || {}).length : 0), 0
  );
  
  createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'action',
    `Capability "${CAPABILITY_NAME}" concluída em ${executionTime}ms.\n` +
    `Atividades processadas: ${successCount}/${totalActivities}\n` +
    `Total de campos gerados: ${totalFieldsGenerated}`,
    failCount > 0 ? 'medium' : 'low',
    {
      success_count: successCount,
      fail_count: failCount,
      total_fields_generated: totalFieldsGenerated,
      execution_time_ms: executionTime
    }
  );
  
  useDebugStore.getState().endCapability(CAPABILITY_ID);

  params.on_progress?.({
    type: 'all_completed',
    total_activities: totalActivities,
    progress: 100,
    message: `Geração concluída: ${successCount} sucesso, ${failCount} erros`
  });

  window.dispatchEvent(new CustomEvent('agente-jota-content-generation-complete', {
    detail: {
      session_id: params.session_id,
      success_count: successCount,
      fail_count: failCount,
      results
    }
  }));

  debugLog.push({
    timestamp: new Date().toISOString(),
    type: 'action',
    narrative: `🏁 Geração de conteúdo finalizada: ${successCount}/${totalActivities} atividades`,
    technical_data: { success_count: successCount, fail_count: failCount }
  });

  // PARTIAL SUCCESS: Se pelo menos 1 atividade foi gerada, consideramos sucesso
  const isPartialOrFullSuccess = successCount > 0;
  const successfulResults = results.filter(r => r.success);
  
  if (failCount > 0 && successCount > 0) {
    console.log(`📊 [GerarConteudo] PARTIAL SUCCESS: ${successCount} succeeded, ${failCount} failed. Pipeline continues.`);
  }
  
  // CORREÇÃO: Criar generated_fields para compatibilidade com criar_atividade
  // Isso garante que a próxima capability receba os dados no formato esperado
  const generated_fields = successfulResults.map(r => ({
    activity_id: r.activity_id,
    activity_type: r.activity_type,
    fields: r.generated_fields || {},
    generated_fields: r.generated_fields || {},
    validation: {
      required_count: 0,
      filled_count: Object.keys(r.generated_fields || {}).length,
      is_complete: Object.keys(r.generated_fields || {}).length > 0
    }
  }));
  
  console.log(`📊 [GerarConteudo] Returning ${generated_fields.length} activities in generated_fields format`);
  
  return {
    success: isPartialOrFullSuccess, // ← MUDANÇA: sucesso se pelo menos 1 atividade gerada
    capability_id: CAPABILITY_ID,
    data: {
      session_id: params.session_id,
      total_activities: totalActivities,
      success_count: successCount,
      fail_count: failCount,
      results,
      successful_results: successfulResults, // ← NOVO: apenas atividades bem-sucedidas
      generated_fields, // ← NOVO: formato compatível com criar_atividade
      partial_success: failCount > 0 && successCount > 0,
      generated_at: new Date().toISOString()
    },
    error: failCount > 0 && successCount === 0 
      ? `Todas as ${failCount} atividades falharam` 
      : (failCount > 0 ? `${failCount} falharam, ${successCount} bem-sucedidas` : null),
    debug_log: debugLog,
    execution_time_ms: executionTime,
    message: `Conteúdo gerado para ${successCount} de ${totalActivities} atividades`
  };
}

export default gerarConteudoAtividades;

// ═══════════════════════════════════════════════════════════════════════════
// VERSÃO V2 - API-FIRST CAPABILITY (Seguindo padrão de decidirAtividadesCriarV2)
// ═══════════════════════════════════════════════════════════════════════════

import type { 
  CapabilityInput, 
  CapabilityOutput, 
  CapabilityError,
  ChosenActivity as ChosenActivityFromTypes
} from '../../shared/types';

// Helper para criar erro estruturado compatível com CapabilityOutput
function createCapabilityError(message: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'high'): CapabilityError {
  return {
    code: 'GENERATION_ERROR',
    message,
    severity,
    recoverable: severity !== 'critical',
    recovery_suggestion: severity === 'critical' 
      ? 'Reinicie o fluxo de criação de atividades'
      : 'Tente novamente ou verifique os parâmetros de entrada'
  };
}

export async function gerarConteudoAtividadesV2(
  input: CapabilityInput
): Promise<CapabilityOutput> {
  const debug_log: DebugLogEntry[] = [];
  const startTime = Date.now();
  const CAPABILITY_ID = 'gerar_conteudo_atividades';
  
  try {
    // ═══════════════════════════════════════════════════════════════════════
    // 1. OBTER RESULTADO DA CAPABILITY ANTERIOR (decidir_atividades_criar)
    // ═══════════════════════════════════════════════════════════════════════
    console.error(`
═══════════════════════════════════════════════════════════════════════
🚀 [V2] STARTING: gerarConteudoAtividadesV2
═══════════════════════════════════════════════════════════════════════
input.execution_id: ${input.execution_id}
input.previous_results keys: ${input.previous_results ? Array.from(input.previous_results.keys()).join(', ') : 'NONE'}
═══════════════════════════════════════════════════════════════════════`);

    // Tentar obter atividades da capability anterior
    const decisionResult = input.previous_results?.get('decidir_atividades_criar');
    
    // ═══════════════════════════════════════════════════════════════════════
    // DIAGNÓSTICO COMPLETO DO decisionResult
    // ═══════════════════════════════════════════════════════════════════════
    console.error(`
🔍 [V2] DIAGNOSTIC: decisionResult FULL ANALYSIS
═══════════════════════════════════════════════════════════════════════
decisionResult exists: ${!!decisionResult}
decisionResult type: ${typeof decisionResult}
decisionResult keys: ${decisionResult ? Object.keys(decisionResult).join(', ') : 'NONE'}
decisionResult.success: ${decisionResult?.success}
decisionResult.data exists: ${!!(decisionResult as any)?.data}
decisionResult.data type: ${typeof (decisionResult as any)?.data}
decisionResult.data keys: ${(decisionResult as any)?.data ? Object.keys((decisionResult as any).data).join(', ') : 'NONE'}
decisionResult.chosen_activities exists: ${!!(decisionResult as any)?.chosen_activities}
decisionResult.chosen_activities length: ${(decisionResult as any)?.chosen_activities?.length || 0}
decisionResult.data?.chosen_activities exists: ${!!(decisionResult as any)?.data?.chosen_activities}
decisionResult.data?.chosen_activities length: ${(decisionResult as any)?.data?.chosen_activities?.length || 0}
═══════════════════════════════════════════════════════════════════════`);
    
    if (!decisionResult) {
      throw new Error('Dependency não encontrada: decidir_atividades_criar. Execute a capability de decisão primeiro.');
    }
    
    if (!decisionResult.success) {
      throw new Error(`Dependency falhou: decidir_atividades_criar retornou success=false. Erro: ${decisionResult.error}`);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // NORMALIZAÇÃO ROBUSTA: Suportar TODOS os formatos possíveis
    // ═══════════════════════════════════════════════════════════════════════
    const resultAsAny = decisionResult as any;
    
    // Tentar múltiplos caminhos para encontrar as atividades
    let chosenActivities: ChosenActivity[] = [];
    let activitySource = 'none';
    
    // Caminho 1: V2 format - data.chosen_activities
    if (resultAsAny.data?.chosen_activities?.length > 0) {
      chosenActivities = resultAsAny.data.chosen_activities;
      activitySource = 'data.chosen_activities (V2)';
    }
    // Caminho 2: Legacy format - chosen_activities direto
    else if (resultAsAny.chosen_activities?.length > 0) {
      chosenActivities = resultAsAny.chosen_activities;
      activitySource = 'chosen_activities (legacy)';
    }
    // Caminho 3: Outro formato possível - activities
    else if (resultAsAny.activities?.length > 0) {
      chosenActivities = resultAsAny.activities;
      activitySource = 'activities (alt)';
    }
    // Caminho 4: Outro formato - data.activities
    else if (resultAsAny.data?.activities?.length > 0) {
      chosenActivities = resultAsAny.data.activities;
      activitySource = 'data.activities (alt)';
    }
    // Caminho 5: Fallback para store
    else {
      const store = useChosenActivitiesStore.getState();
      chosenActivities = store.getChosenActivities();
      activitySource = 'store fallback';
    }
    
    console.error(`📊 [V2] chosenActivities source: ${activitySource}`);
    console.error(`📊 [V2] chosenActivities count: ${chosenActivities.length}`);
    
    if (chosenActivities.length === 0) {
      throw new Error('Nenhuma atividade escolhida encontrada no resultado de decidir_atividades_criar');
    }
    
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'info',
      narrative: `Recebido ${chosenActivities.length} atividades da capability decidir_atividades_criar. Iniciando geração de conteúdo.`,
      technical_data: { 
        activities_count: chosenActivities.length,
        activity_ids: chosenActivities.map(a => a.id)
      }
    });
    
    // ═══════════════════════════════════════════════════════════════════════
    // 2. EXTRAIR CONTEXTO
    // ═══════════════════════════════════════════════════════════════════════
    const conversationContext = input.context.conversation_context || 
                                input.context.conversa || 
                                'Contexto educacional';
    const userObjective = input.context.user_objective || 
                          input.context.objetivo || 
                          'Criar atividades educacionais';
    const sessionId = input.context.session_id || input.execution_id;
    
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: `Contexto extraído. Objetivo: "${userObjective.substring(0, 100)}...". Processando ${chosenActivities.length} atividades.`,
      technical_data: { 
        objective_length: userObjective.length,
        context_length: conversationContext.length,
        session_id: sessionId
      }
    });
    
    // ═══════════════════════════════════════════════════════════════════════
    // 3. PROCESSAR CADA ATIVIDADE
    // ═══════════════════════════════════════════════════════════════════════
    const results: GeneratedFieldsResult[] = [];
    const store = useChosenActivitiesStore.getState();
    
    // Inicializar DebugStore
    useDebugStore.getState().startCapability(CAPABILITY_ID, 'Gerando conteúdo V2');
    
    // ═══════════════════════════════════════════════════════════════════════
    // OBTER REFERÊNCIA DO ACTIVITY DEBUG STORE PARA LOGS POR ATIVIDADE
    // Este é o store que alimenta o modal de debug individual de cada atividade
    // ═══════════════════════════════════════════════════════════════════════
    const activityDebugStore = useActivityDebugStore.getState();
    
    for (let i = 0; i < chosenActivities.length; i++) {
      const activity = chosenActivities[i];
      
      console.error(`🔄 [V2] Processing activity ${i + 1}/${chosenActivities.length}: ${activity.titulo}`);
      
      // ═══════════════════════════════════════════════════════════════════════
      // INICIALIZAR DEBUG DA ATIVIDADE - Logs aparecerão no ActivityDebugModal
      // ═══════════════════════════════════════════════════════════════════════
      activityDebugStore.initActivity(activity.id, activity.titulo, activity.tipo);
      activityDebugStore.setStatus(activity.id, 'building');
      activityDebugStore.setProgress(activity.id, 0, 'Iniciando geração de conteúdo');
      
      activityDebugStore.log(
        activity.id, 'action', 'GerarConteudoV2',
        `[${i + 1}/${chosenActivities.length}] Iniciando geração para "${activity.titulo}"`,
        { 
          activity_type: activity.tipo, 
          index: i + 1, 
          total: chosenActivities.length,
          timestamp: new Date().toISOString()
        }
      );
      
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'action',
        narrative: `[${i + 1}/${chosenActivities.length}] Gerando conteúdo para "${activity.titulo}" (${activity.tipo})`,
        technical_data: { 
          activity_id: activity.id,
          activity_type: activity.tipo,
          progress: Math.round((i / chosenActivities.length) * 100)
        }
      });
      
      // Atualizar status no store
      store.updateActivityStatus(activity.id, 'construindo', Math.round((i / chosenActivities.length) * 100));
      
      // Log de preparação da chamada à API
      activityDebugStore.setProgress(activity.id, 10, 'Preparando chamada à API de IA');
      activityDebugStore.log(
        activity.id, 'api', 'GerarConteudoV2',
        'Chamando API de IA (Groq/Gemini) para gerar campos...',
        { model_cascade: ['llama3.3-70b', 'llama3.1-8b', 'gemini-1.5-flash'] }
      );
      
      // Gerar conteúdo usando a função existente
      const result = await generateContentForActivity(
        activity,
        conversationContext,
        userObjective,
        undefined, // on_progress
        CAPABILITY_ID,
        'Gerando conteúdo V2'
      );
      
      results.push(result);
      
      // ═══════════════════════════════════════════════════════════════════════
      // LOGS DE DEBUG PÓS-GERAÇÃO - Mostrar resultado da API
      // ═══════════════════════════════════════════════════════════════════════
      activityDebugStore.setProgress(activity.id, 50, 'Processando resposta da IA');
      
      if (result.success) {
        // Log de sucesso da API
        activityDebugStore.log(
          activity.id, 'success', 'API-Response',
          `API retornou ${Object.keys(result.generated_fields).length} campos gerados`,
          { 
            fields_generated: Object.keys(result.generated_fields),
            sample_values: Object.fromEntries(
              Object.entries(result.generated_fields).slice(0, 3).map(([k, v]) => 
                [k, typeof v === 'string' ? v.substring(0, 100) + (v.length > 100 ? '...' : '') : v]
              )
            )
          }
        );
        
        // Sincronizar campos e atualizar store
        activityDebugStore.setProgress(activity.id, 60, 'Sincronizando campos com formulário');
        const syncedFields = syncSchemaToFormData(activity.tipo, result.generated_fields);
        const validation = validateSyncedFields(activity.tipo, syncedFields);
        
        // Log de validação
        activityDebugStore.setProgress(activity.id, 70, 'Validando campos gerados');
        activityDebugStore.log(
          activity.id, 'info', 'Validation',
          `Validação: ${validation.filledFields.length} campos preenchidos, ${validation.missingFields.length} faltando`,
          { 
            filled_fields: validation.filledFields,
            missing_fields: validation.missingFields,
            is_valid: validation.valid
          }
        );
        
        // Status 'aguardando' indica que conteúdo foi gerado, mas construção visual ainda não iniciou
        store.updateActivityStatus(activity.id, 'aguardando', 80);
        store.setActivityGeneratedFields(activity.id, syncedFields);
        
        // 🔥 SALVAR NO LOCALSTORAGE PARA INTERFACE DE CONSTRUÇÃO
        // A interface verifica localStorage para preencher campos automaticamente
        activityDebugStore.setProgress(activity.id, 80, 'Salvando no localStorage');
        activityDebugStore.log(
          activity.id, 'action', 'LocalStorage',
          'Persistindo dados no localStorage...',
          { keys_to_save: ['generated_content_*', 'activity_*', 'constructed_*'] }
        );
        
        let savedKeys: string[] = [];
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          try {
            const storageKey = `generated_content_${activity.id}`;
            const storageData = {
              activity_id: activity.id,
              activity_type: activity.tipo,
              fields: syncedFields,
              original_fields: result.generated_fields,
              validation: validation,
              timestamp: new Date().toISOString()
            };
            localStorage.setItem(storageKey, JSON.stringify(storageData));
            savedKeys.push(storageKey);
            
            // Também usar persistActivityToStorage para chaves adicionais
            const additionalKeys = persistActivityToStorage(
              activity.id,
              activity.tipo,
              activity.titulo,
              syncedFields,
              {
                description: activity.titulo,
                isPreGenerated: true,
                source: 'gerar_conteudo_atividades_v2'
              }
            );
            savedKeys = [...savedKeys, ...additionalKeys];
            
            console.log(`💾 [V2] Saved to localStorage: ${savedKeys.join(', ')}`);
          } catch (e) {
            console.warn(`⚠️ [V2] Failed to save to localStorage:`, e);
            activityDebugStore.log(
              activity.id, 'warning', 'LocalStorage',
              `Erro ao salvar no localStorage: ${e}`,
              { error: String(e) }
            );
          }
        }
        
        // Log de sucesso do localStorage
        activityDebugStore.log(
          activity.id, 'success', 'LocalStorage',
          `Dados persistidos em ${savedKeys.length} chaves do localStorage`,
          { saved_keys: savedKeys }
        );
        
        // Emitir evento para UI
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('agente-jota-fields-generated', {
            detail: {
              activity_id: activity.id,
              activity_type: activity.tipo,
              fields: syncedFields,
              original_fields: result.generated_fields,
              validation: validation
            }
          }));
        }
        
        // 📋 CRIAR LOG DETALHADO COM CADA CAMPO E SEU VALOR
        const fieldDetails = Object.entries(syncedFields).map(([key, value]) => {
          const displayValue = typeof value === 'string' 
            ? (value.length > 100 ? value.substring(0, 100) + '...' : value)
            : JSON.stringify(value);
          return `• ${key}: ${displayValue}`;
        }).join('\n');
        
        debug_log.push({
          timestamp: new Date().toISOString(),
          type: 'discovery',
          narrative: `✅ Conteúdo gerado para "${activity.titulo}": ${Object.keys(result.generated_fields).length} campos preenchidos\n\n📋 CAMPOS GERADOS:\n${fieldDetails}`,
          technical_data: { 
            activity_id: activity.id,
            activity_type: activity.tipo,
            fields_count: Object.keys(result.generated_fields).length,
            generated_fields: result.generated_fields,
            synced_fields: syncedFields,
            validation_result: validation
          }
        });
        
        // ═══════════════════════════════════════════════════════════════════════
        // MARCAR ATIVIDADE COMO "AGUARDANDO CONSTRUÇÃO" (NÃO CONCLUÍDA)
        // A capability criar_atividade será responsável por marcar como concluída
        // após a animação visual de construção progressiva
        // ═══════════════════════════════════════════════════════════════════════
        activityDebugStore.setProgress(activity.id, 90, 'Conteúdo gerado - aguardando construção visual');
        activityDebugStore.log(
          activity.id, 'success', 'GerarConteudoV2',
          `Geração concluída! Aguardando etapa de construção visual...`,
          { fields_count: Object.keys(syncedFields).length, status: 'content_ready' }
        );
        // NÃO chamar markCompleted aqui - deixar para criar_atividade
        
      } else {
        // Log de erro da API
        activityDebugStore.log(
          activity.id, 'error', 'API-Response',
          `Falha na geração: ${result.error}`,
          { error: result.error }
        );
        activityDebugStore.setError(activity.id, result.error || 'Erro desconhecido na geração');
        
        store.updateActivityStatus(activity.id, 'erro', 0, result.error);
        
        debug_log.push({
          timestamp: new Date().toISOString(),
          type: 'error',
          narrative: `❌ Falha ao gerar conteúdo para "${activity.titulo}": ${result.error}`,
          technical_data: { 
            activity_id: activity.id,
            error: result.error
          }
        });
      }
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 4. CALCULAR RESULTADOS E RETORNAR
    // ═══════════════════════════════════════════════════════════════════════
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    const elapsedTime = Date.now() - startTime;
    
    const totalFieldsGenerated = results.reduce((acc, r) => 
      acc + (r.success ? Object.keys(r.generated_fields || {}).length : 0), 0
    );
    
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: `🏁 Geração concluída: ${successCount}/${chosenActivities.length} atividades processadas com sucesso. Total de campos: ${totalFieldsGenerated}`,
      technical_data: { 
        success_count: successCount,
        fail_count: failCount,
        total_fields: totalFieldsGenerated,
        duration_ms: elapsedTime
      }
    });
    
    // Encerrar capability no DebugStore
    useDebugStore.getState().endCapability(CAPABILITY_ID);
    
    // Emitir evento de conclusão
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('agente-jota-content-generation-complete', {
        detail: {
          session_id: sessionId,
          success_count: successCount,
          fail_count: failCount,
          results
        }
      }));
    }
    
    console.error(`✅ [V2] COMPLETED: ${successCount}/${chosenActivities.length} activities, ${totalFieldsGenerated} fields in ${elapsedTime}ms`);
    
    // ═══════════════════════════════════════════════════════════════════════
    // PARTIAL SUCCESS: Se QUALQUER atividade foi gerada com sucesso, 
    // consideramos a capability como bem-sucedida e passamos para a próxima etapa.
    // Apenas se TODAS falharem é que consideramos falha total.
    // ═══════════════════════════════════════════════════════════════════════
    const isPartialOrFullSuccess = successCount > 0;
    const successfulResults = results.filter(r => r.success);
    
    // Log do status de sucesso parcial
    if (failCount > 0 && successCount > 0) {
      console.error(`📊 [V2] PARTIAL SUCCESS: ${successCount} succeeded, ${failCount} failed. Pipeline will CONTINUE with successful activities.`);
      
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'warning',
        narrative: `⚠️ SUCESSO PARCIAL: ${failCount} atividades falharam, mas ${successCount} foram geradas com sucesso. O pipeline continuará com as atividades bem-sucedidas.`,
        technical_data: { 
          success_count: successCount,
          fail_count: failCount,
          failed_activities: results.filter(r => !r.success).map(r => ({ id: r.activity_id, error: r.error })),
          successful_activities: successfulResults.map(r => r.activity_id)
        }
      });
    }
    
    return {
      success: isPartialOrFullSuccess, // ← MUDANÇA CRÍTICA: sucesso se pelo menos 1 atividade foi gerada
      capability_id: CAPABILITY_ID,
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: {
        generated_content: results,
        successful_content: successfulResults, // ← NOVO: apenas atividades bem-sucedidas para próxima etapa
        total_activities: chosenActivities.length,
        success_count: successCount,
        fail_count: failCount,
        total_fields_generated: totalFieldsGenerated,
        partial_success: failCount > 0 && successCount > 0 // ← NOVO: flag de sucesso parcial
      },
      error: failCount > 0 && successCount === 0 
        ? createCapabilityError(`Todas as ${failCount} atividades falharam na geração de conteúdo`, 'critical') 
        : (failCount > 0 
            ? createCapabilityError(`${failCount} de ${chosenActivities.length} atividades falharam (${successCount} bem-sucedidas)`, 'low')
            : null),
      debug_log,
      metadata: {
        duration_ms: elapsedTime,
        retry_count: 0,
        data_source: 'ai_content_generation'
      }
    };
    
  } catch (error) {
    const elapsedTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error(`❌ [V2] ERROR: ${errorMessage}`);
    
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'error',
      narrative: `❌ ERRO CRÍTICO: ${errorMessage}`,
      technical_data: { 
        error: errorMessage,
        stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined
      }
    });
    
    // Encerrar capability no DebugStore
    useDebugStore.getState().endCapability(CAPABILITY_ID);
    
    return {
      success: false,
      capability_id: CAPABILITY_ID,
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: null,
      error: createCapabilityError(errorMessage, 'critical'),
      debug_log,
      metadata: {
        duration_ms: elapsedTime,
        retry_count: 0,
        data_source: 'error'
      }
    };
  }
}
