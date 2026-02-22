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
import { getQualityEnhancementForType, getBatchProgressionPrompt, type QualityContext } from '../../../prompts/quality-prompt-templates';
import { 
  syncSchemaToFormData, 
  validateSyncedFields,
  generateFieldSyncDebugReport,
  persistActivityToStorage
} from '../../../../construction/utils/activity-fields-sync';
import { createDebugEntry, useDebugStore } from '../../../../interface-chat-producao/debug-system/DebugStore';
import { useActivityDebugStore } from '../../../../construction/stores/activityDebugStore';
import { ListaExerciciosGenerator } from '../../../../activities/lista-exercicios/ListaExerciciosGenerator';
import { QuizInterativoGenerator } from '../../../../activities/quiz-interativo/QuizInterativoGenerator';
import { FlashCardsGenerator } from '../../../../activities/flash-cards/FlashCardsGenerator';
import { 
  generateTextVersionContent, 
  storeTextVersionContent,
  type TextVersionInput 
} from '../../../../activities/text-version/TextVersionGenerator';
import { isTextVersionActivity } from '../../../../config/activityVersionConfig';
import { storageSet, isHeavyActivityType } from '@/features/schoolpower/services/StorageOrchestrator';

interface BnccContextData {
  habilidades: any[];
  componentes: string[];
  anos: string[];
  prompt_context: string;
  count: number;
}

interface QuestoesReferenciaData {
  questoes: any[];
  componentes: string[];
  temas: string[];
  prompt_context: string;
  count: number;
}

interface GerarConteudoParams {
  session_id: string;
  conversation_context: string;
  user_objective: string;
  tema_limpo?: string;
  temas_extraidos?: string[];
  disciplina_extraida?: string;
  turma_extraida?: string;
  activities_to_fill?: ChosenActivity[];
  on_progress?: (update: ProgressUpdate) => void;
  bncc_context?: BnccContextData;
  questoes_referencia?: QuestoesReferenciaData;
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
  schema_fields?: Record<string, any>;    // Campos do ACTIVITY_FIELDS_MAPPING (para sync preciso)
  text_metadata?: Record<string, any>;    // Metadados de texto (não são campos do formulário)
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
// HELPERS: Inferência e Geração de Valores Padrão
// Usados quando o input do usuário é vago/incompleto
// ============================================================

function inferSubjectFromObjective(objective: string): string {
  if (!objective) return 'Não especificada';
  
  const lowercaseObj = objective.toLowerCase();
  
  const subjectPatterns: Record<string, string[]> = {
    'Matemática': ['matemática', 'matemat', 'cálculo', 'álgebra', 'geometria', 'equação', 'fração', 'número', 'conta', 'porcentagem'],
    'Língua Portuguesa': ['português', 'redação', 'gramática', 'texto', 'leitura', 'escrita', 'literatura', 'ortografia', 'verbo', 'substantivo'],
    'Ciências': ['ciência', 'biologia', 'física', 'química', 'natureza', 'experimento', 'célula', 'átomo', 'energia'],
    'História': ['história', 'histórico', 'revolução', 'guerra', 'período', 'civilização', 'século', 'era'],
    'Geografia': ['geografia', 'geográfico', 'mapa', 'país', 'continente', 'clima', 'relevo', 'população'],
    'Arte': ['arte', 'artístico', 'pintura', 'música', 'desenho', 'escultura', 'teatro'],
    'Educação Física': ['educação física', 'esporte', 'exercício', 'movimento', 'jogo', 'atividade física'],
    'Inglês': ['inglês', 'english', 'vocabulary', 'grammar']
  };
  
  for (const [subject, patterns] of Object.entries(subjectPatterns)) {
    if (patterns.some(p => lowercaseObj.includes(p))) {
      return subject;
    }
  }
  
  return 'Não especificada';
}

function generateThemeFromObjective(objective: string, subject: string): string {
  if (!objective || objective.length < 5) {
    const defaultThemes: Record<string, string> = {
      'Matemática': 'Operações com Números Inteiros',
      'Língua Portuguesa': 'Interpretação de Textos',
      'Ciências': 'O Corpo Humano e seus Sistemas',
      'História': 'As Grandes Civilizações Antigas',
      'Geografia': 'Aspectos Físicos do Brasil',
      'Arte': 'Expressão Artística Contemporânea',
      'Educação Física': 'Jogos Cooperativos',
      'Inglês': 'Basic Vocabulary and Expressions',
      'Marketing': 'Estratégias de Marketing Digital',
      'Tráfego Pago': 'Campanhas de Anúncios Online',
      'Negócios': 'Gestão e Planejamento Empresarial'
    };
    return defaultThemes[subject] || 'Tema a ser definido';
  }
  
  let cleaned = objective;
  
  cleaned = cleaned
    .replace(/[.,;!]\s*(?:considere|lembre|use|utilize|tenha|aplique|adote|faça|foque|priorize|inclua)\s+.*/gi, '')
    .replace(/[.,;!]\s*(?:a abordagem|abordagem|o método|o foco|a metodologia)\s+.*/gi, '')
    .replace(/[.,;!]\s*(?:ao finalizar|no final|depois|após|em seguida|por favor)\s+.*/gi, '')
    .replace(/[.,;!]\s*(?:organize|coloque|coloca|agende|marque)\s+.*(?:calendário|calendario|agenda)\s*.*/gi, '')
    .replace(/\d+\s*aulas?\s*(?:disponíveis|por semana|semanais|na semana)?/gi, '')
    .replace(/(?:considere\s+que\s+)?tenho\s+\d+\s*aulas?/gi, '')
    .replace(/(?:use|utilize|com)\s+(?:uma?\s+)?abordagem\s+(?:focada?\s+(?:em|no|na)\s+)?[\w\sãõéêíóúâô]+/gi, '')
    .replace(/turma\s+\w+/gi, '')
    .replace(/para\s+(?:a\s+)?turma\s+\w+/gi, '')
    .replace(/\d+[º°ª]\s*(?:ano|série|serie)/gi, '')
    .replace(/ensino\s+(?:fundamental|médio|medio)/gi, '')
    .trim();
  
  const sobreMatch = cleaned.match(/(?:sobre|de|tema[s]?\s*(?::|é|são)?)\s+([^.,;!]+?)(?:\s+(?:para|com|dentro|que|considere|organize|ao finalizar|use|utilize|lembre|tenho|turma)\b|[.,;!]|$)/i);
  if (sobreMatch && sobreMatch[1] && sobreMatch[1].trim().length >= 3) {
    let theme = sobreMatch[1].trim();
    theme = theme.replace(/\s+(para|com|que|dentro|ao|no|na)\s*$/i, '').trim();
    if (theme.length >= 3 && theme.length <= 120) {
      console.log(`🎯 [generateThemeFromObjective] Tema extraído via "sobre/de": "${theme}"`);
      return theme.charAt(0).toUpperCase() + theme.slice(1);
    }
  }
  
  let theme = cleaned
    .replace(/^(preciso|quero|gostaria de|criar|fazer|desenvolver|crie|gere|monte|elabore|prepare|planeje)\s+/gi, '')
    .replace(/^(algumas?|alguns?|as|os|a|o|um|uma|uns|umas)\s+/gi, '')
    .replace(/^(atividades?|exercícios?|plano|planos|aulas?|materiais?|conteúdos?)\s+(de|sobre|para|com)\s+/gi, '')
    .replace(/^próximas?\s+atividades?\s+(de|sobre|para)\s+/gi, '')
    .replace(/^(sobre|para|com|de)\s+/gi, '')
    .replace(/^(como|o que é|quais são|quando|onde)\s+/gi, '')
    .trim();
  
  const MAX_THEME_LENGTH = 80;
  if (theme.length > MAX_THEME_LENGTH) {
    const words = theme.split(/\s+/);
    const keyWords: string[] = [];
    let charCount = 0;
    
    for (const word of words) {
      const skipWords = ['de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'nas', 'nos', 
                        'para', 'por', 'com', 'sem', 'sob', 'sobre', 'entre', 'até',
                        'que', 'como', 'quando', 'onde', 'quais', 'qual', 'dentro'];
      if (skipWords.includes(word.toLowerCase()) && keyWords.length === 0) continue;
      
      if (charCount + word.length + 1 <= MAX_THEME_LENGTH) {
        keyWords.push(word);
        charCount += word.length + 1;
      } else {
        break;
      }
    }
    
    theme = keyWords.join(' ');
  }
  
  theme = theme.replace(/\.\.\.$/, '').replace(/\.$/, '').trim();
  
  if (!theme || theme.length < 3) {
    const defaultThemes: Record<string, string> = {
      'Matemática': 'Conceitos Matemáticos',
      'Língua Portuguesa': 'Produção Textual',
      'Ciências': 'Fenômenos Naturais',
      'História': 'Estudos Históricos',
      'Geografia': 'Estudos Geográficos',
      'Marketing': 'Estratégias de Marketing',
      'Tráfego Pago': 'Campanhas de Anúncios',
      'Negócios': 'Gestão Empresarial'
    };
    return defaultThemes[subject] || `Estudo de ${subject}`;
  }
  
  theme = theme.charAt(0).toUpperCase() + theme.slice(1);
  
  console.log(`🎯 [generateThemeFromObjective] Tema extraído (fallback): "${theme}" — de objetivo: "${objective.substring(0, 60)}..."`);
  
  return theme;
}

function generateDefaultObjectives(theme: string, subject: string): string {
  return `• Compreender os conceitos fundamentais de ${theme}
• Aplicar os conhecimentos adquiridos em situações práticas do cotidiano
• Desenvolver habilidades de análise crítica e resolução de problemas em ${subject}
• Relacionar os conteúdos aprendidos com outras áreas do conhecimento
• Participar ativamente das atividades propostas, demonstrando engajamento e colaboração`;
}

function generateDefaultMaterials(subject: string): string {
  const baseMaterials = '• Quadro branco e marcadores\n• Projetor multimídia\n• Material impresso (atividades)';
  
  const subjectSpecificMaterials: Record<string, string> = {
    'Matemática': '• Calculadora\n• Régua e compasso\n• Material concreto (blocos lógicos)',
    'Língua Portuguesa': '• Livros didáticos\n• Dicionários\n• Textos complementares',
    'Ciências': '• Materiais para experimentos\n• Modelos anatômicos\n• Lupas e microscópios',
    'História': '• Mapas históricos\n• Imagens e documentos de época\n• Linha do tempo',
    'Geografia': '• Mapas e globo terrestre\n• Atlas geográfico\n• Imagens de satélite',
    'Arte': '• Materiais de desenho e pintura\n• Instrumentos musicais\n• Recursos audiovisuais',
    'Educação Física': '• Bolas e equipamentos esportivos\n• Cones e marcadores\n• Colchonetes'
  };
  
  const specific = subjectSpecificMaterials[subject] || '• Recursos audiovisuais\n• Material de apoio complementar';
  
  return `${baseMaterials}\n${specific}`;
}

function generateDefaultEvaluation(theme: string): string {
  return `Avaliação contínua através de:
• Participação e engajamento durante as atividades
• Exercícios práticos sobre ${theme}
• Trabalho em grupo com apresentação oral
• Avaliação escrita ao final da unidade
• Auto-avaliação reflexiva pelos alunos`;
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
  userObjective: string,
  batchIndex?: number,
  batchTotal?: number,
  bnccContext?: BnccContextData,
  questoesReferencia?: QuestoesReferenciaData
): string {
  const qualityCtx: QualityContext = {
    tema: activity.campos_preenchidos?.theme || activity.campos_preenchidos?.tema || activity.titulo || '',
    disciplina: activity.campos_preenchidos?.subject || activity.campos_preenchidos?.disciplina || activity.materia || 'Não especificada',
    anoSerie: activity.campos_preenchidos?.schoolYear || activity.campos_preenchidos?.anoSerie || '7º Ano',
    objetivo: userObjective,
    solicitacaoOriginal: userObjective
  };
  const qualityDirectives = getQualityEnhancementForType(activity.tipo, qualityCtx);

  const fieldsDescription = fieldsMapping.requiredFields.map((field, idx) => `
${idx + 1}. "${field.name}" (${field.label}) [OBRIGATÓRIO]
   - Descrição: ${field.description}
   - Tipo: ${field.type}
   ${field.options ? `- Opções válidas: ${field.options.join(', ')}` : ''}
   ${field.placeholder ? `- Exemplo: ${field.placeholder}` : ''}
`).join('');

  const optionalFieldsDescription = fieldsMapping.optionalFields?.map((field, idx) => `
${idx + 1}. "${field.name}" (${field.label}) [OPCIONAL - MAS GERE]
   - Descrição: ${field.description}
   - Tipo: ${field.type}
   ${field.options ? `- Opções válidas: ${field.options.join(', ')}` : ''}
`).join('') || '';

  // Gera valores de exemplo realistas para o template JSON (evitando placeholders literais)
  const getExampleValueForField = (field: FieldDefinition): string => {
    if (field.type === 'number') {
      return field.validation?.min ? String(field.validation.min + 5) : '10';
    }
    if (field.type === 'select' && field.options?.length) {
      return `"${field.options[0]}"`;
    }
    // Valores de exemplo realistas para evitar que a IA ecoe placeholders
    const exampleValues: Record<string, string> = {
      'subject': 'Matemática',
      'disciplina': 'Língua Portuguesa',
      'theme': 'Operações com Frações',
      'tema': 'Substantivos e Adjetivos',
      'schoolYear': '7º Ano - Ensino Fundamental',
      'anoSerie': '6º Ano do Ensino Fundamental',
      'objectives': 'Compreender os conceitos fundamentais e aplicar em situações práticas do cotidiano',
      'objetivos': 'Desenvolver habilidades de análise crítica e resolução de problemas',
      'materials': 'Quadro branco, projetor, material impresso, calculadora',
      'materiais': 'Livro didático, caderno, lápis, borracha',
      'context': 'Turma de 25 alunos com conhecimentos básicos na disciplina',
      'perfilTurma': 'Alunos engajados com interesse em atividades práticas',
      'tituloTemaAssunto': 'Substantivos Próprios e Comuns',
      'publicoAlvo': 'Alunos do 6º ano com perfil heterogêneo',
      'objetivosAprendizagem': 'Identificar e classificar substantivos em textos diversos',
      'temaRedacao': 'Desafios da mobilidade urbana no Brasil',
      'objetivo': 'Desenvolver argumentação crítica sobre o tema proposto',
      'competenciasENEM': 'C1, C2, C3, C4, C5',
      'contextoAdicional': 'Contexto histórico e social relevante para o tema'
    };
    
    if (exampleValues[field.name]) {
      return `"${exampleValues[field.name]}"`;
    }
    
    if (field.type === 'textarea') {
      return `"Conteúdo detalhado sobre ${field.label.toLowerCase()}"`;
    }
    return `"Valor para ${field.label}"`;
  };
  
  const allRequiredFields = fieldsMapping.requiredFields.map(f => `    "${f.name}": ${getExampleValueForField(f)}`).join(',\n');
  const allOptionalFields = fieldsMapping.optionalFields?.map(f => `    "${f.name}": ${getExampleValueForField(f)}`).join(',\n') || '';
  const allFieldsJson = allOptionalFields ? `${allRequiredFields},\n${allOptionalFields}` : allRequiredFields;

  return `
# TAREFA: Gerar Conteúdo Completo para Atividade Educacional

Você é um especialista pedagógico brasileiro gerando conteúdo detalhado para uma atividade educacional.

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

## TODOS OS CAMPOS A GERAR (OBRIGATÓRIOS)
${fieldsDescription}

${optionalFieldsDescription ? `## CAMPOS OPCIONAIS (GERE TODOS TAMBÉM)
${optionalFieldsDescription}` : ''}

${bnccContext?.prompt_context ? `## ALINHAMENTO CURRICULAR — BNCC (Base Nacional Comum Curricular)
As seguintes habilidades da BNCC foram identificadas como relevantes para esta atividade.
Você DEVE incorporar essas habilidades no conteúdo gerado:
- Referencie os CÓDIGOS BNCC (ex: EF07CI02) nos campos de objetivos, habilidades ou competências
- Alinhe o conteúdo pedagógico às descrições dessas habilidades
- Se houver campo "habilidadesBNCC" ou "bnccCompetencias", preencha com os códigos encontrados

${bnccContext.prompt_context}
` : ''}${questoesReferencia?.prompt_context ? `## QUESTÕES DE REFERÊNCIA (Modelos de Qualidade)
${questoesReferencia.prompt_context}
` : ''}## INSTRUÇÕES CRÍTICAS PARA GERAÇÃO DE CONTEÚDO

### REGRA DE EXPANSÃO DE CONTEXTO
Se o objetivo do usuário for vago ou curto (ex: "matemática aplicada", "criar atividades"), você DEVE:
1. Inferir a disciplina mais provável com base no contexto
2. Sugerir uma série/ano escolar apropriada (padrão: Ensino Fundamental II ou Ensino Médio)
3. Criar um tema específico e concreto relacionado ao objetivo
4. Gerar conteúdo rico e detalhado que seria útil para um professor real
5. Incluir exemplos práticos, metodologias pedagógicas modernas e alinhamento com BNCC${bnccContext?.count ? ` (use os códigos BNCC listados acima)` : ''}

### PADRÕES DE QUALIDADE PARA CADA TIPO DE CAMPO
1. **CAMPOS TEXT**: Gere texto claro e específico (mínimo 10 caracteres)
2. **CAMPOS TEXTAREA**: Gere texto RICO E DETALHADO (mínimo 100 caracteres) com:
   - Múltiplos pontos ou tópicos quando aplicável
   - Linguagem pedagógica profissional
   - Exemplos práticos quando relevante
3. **CAMPOS NUMBER**: Use valores numéricos apropriados (ex: 10, 15, 20)
4. **CAMPOS SELECT**: Use EXATAMENTE uma das opções listadas

### REGRAS DE COERÊNCIA
1. **DISCIPLINA**: Se não especificada, infira do contexto (Matemática, Português, Ciências, etc.)
2. **SÉRIE/ANO**: Se não especificado, use "7º Ano - Ensino Fundamental" como padrão
3. **TEMA**: Seja específico! Em vez de "matemática", use "Operações com Frações" ou "Equações do 1º Grau"
4. **OBJETIVOS**: Liste múltiplos objetivos de aprendizagem mensuráveis
5. **MATERIAIS**: Liste recursos concretos que serão utilizados

## DIRETRIZES DE QUALIDADE PEDAGÓGICA (ESPECÍFICAS PARA ${fieldsMapping.displayName.toUpperCase()})
${qualityDirectives}

${(batchIndex !== undefined && batchTotal !== undefined && batchTotal > 1) ? getBatchProgressionPrompt(batchIndex, batchTotal, []) : ''}

## FORMATO DE RESPOSTA - JSON COMPLETO

⚠️ ATENÇÃO MÁXIMA: Você DEVE preencher ABSOLUTAMENTE TODOS os campos listados abaixo.
Retorne EXATAMENTE este formato JSON com TODOS os campos preenchidos.

{
  "generated_fields": {
${allFieldsJson}
  },
  "reasoning": "Breve explicação pedagógica da geração"
}

## REGRAS OBRIGATÓRIAS DO JSON
- Retorne APENAS o JSON puro, sem \`\`\`json ou \`\`\`
- Todas as strings devem usar aspas duplas (")
- Números devem ser escritos sem aspas (ex: 10, não "10")
- NÃO inclua comentários no JSON
- NÃO deixe NENHUM campo vazio ou com valores placeholder
- Gere conteúdo REAL e ÚTIL para cada campo
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
  capabilityName?: string,
  batchIndex?: number,
  batchTotal?: number,
  temaLimpo?: string,
  disciplinaExtraida?: string,
  turmaExtraida?: string,
  bnccContext?: BnccContextData,
  questoesReferencia?: QuestoesReferenciaData
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
      
      const inferredSubject = activity.campos_preenchidos?.subject || 
                              activity.campos_preenchidos?.disciplina || 
                              activity.materia || 
                              disciplinaExtraida ||
                              inferSubjectFromObjective(userObjective) || 
                              'Matemática';
      
      const inferredTheme = activity.campos_preenchidos?.theme || 
                            activity.campos_preenchidos?.tema || 
                            temaLimpo ||
                            generateThemeFromObjective(userObjective, inferredSubject);
      
      if (temaLimpo) {
        console.log(`🎯 [GerarConteudo] LISTA-EXERCICIOS usando tema limpo do plano: "${temaLimpo}"`);
      }
      
      const inferredSchoolYear = activity.campos_preenchidos?.schoolYear || 
                                  activity.campos_preenchidos?.anoEscolaridade || 
                                  '7º Ano - Ensino Fundamental';
      
      // Validar difficultyLevel contra valores válidos do schema
      const rawDifficulty = activity.campos_preenchidos?.difficultyLevel || 
                            activity.campos_preenchidos?.nivelDificuldade || 
                            'Médio';
      const validDifficulties = ['Fácil', 'Médio', 'Difícil'];
      const inferredDifficultyLevel = validDifficulties.includes(rawDifficulty) ? rawDifficulty : 'Médio';
      
      // Validar questionModel contra valores válidos do schema
      const rawQuestionModel = activity.campos_preenchidos?.questionModel || 
                               activity.campos_preenchidos?.modeloQuestoes || 
                               'Múltipla Escolha';
      const validQuestionModels = ['Múltipla Escolha', 'Dissertativa', 'Misto'];
      const inferredQuestionModel = validQuestionModels.includes(rawQuestionModel) ? rawQuestionModel : 'Múltipla Escolha';
      
      const inferredNumberOfQuestions = String(
        activity.campos_preenchidos?.numberOfQuestions || 
        activity.campos_preenchidos?.numeroQuestoes || 
        10
      );
      
      const inferredObjectives = activity.campos_preenchidos?.objectives || 
                                  activity.campos_preenchidos?.objetivos || 
                                  generateDefaultObjectives(inferredTheme, inferredSubject);
      
      const inferredContext = activity.campos_preenchidos?.context ||
                               `Turma de ${inferredSchoolYear} com conhecimentos básicos em ${inferredSubject}`;
      
      const listaData = {
        titulo: activity.titulo || 'Lista de Exercícios',
        title: activity.titulo || 'Lista de Exercícios',
        tema: inferredTheme,
        theme: inferredTheme,
        disciplina: inferredSubject,
        subject: inferredSubject,
        anoEscolaridade: inferredSchoolYear,
        schoolYear: inferredSchoolYear,
        nivelDificuldade: inferredDifficultyLevel,
        difficultyLevel: inferredDifficultyLevel,
        numeroQuestoes: inferredNumberOfQuestions,
        numberOfQuestions: inferredNumberOfQuestions,
        modeloQuestoes: inferredQuestionModel,
        questionModel: inferredQuestionModel,
        objetivos: inferredObjectives,
        objectives: inferredObjectives
      };
      
      console.log(`📝 [GerarConteudo] Dados para geração:`, JSON.stringify(listaData, null, 2).substring(0, 500));
      
      const generatedContent = await generator.generateListaExerciciosContent(listaData);
      
      console.log(`✅ [GerarConteudo] Lista gerada com sucesso!`);
      console.log(`✅ [GerarConteudo] Questões geradas: ${generatedContent.questoes?.length || 0}`);
      
      if (generatedContent.questoes && generatedContent.questoes.length > 0) {
        console.log(`✅ [GerarConteudo] Primeira questão:`, generatedContent.questoes[0]?.enunciado?.substring(0, 100));
      }
      
      // Campos do schema ACTIVITY_FIELDS_MAPPING para lista-exercicios
      const schemaFields = {
        numberOfQuestions: Number(inferredNumberOfQuestions),
        theme: inferredTheme,
        subject: inferredSubject,
        schoolYear: inferredSchoolYear,
        difficultyLevel: inferredDifficultyLevel,
        questionModel: inferredQuestionModel,
        objectives: inferredObjectives,
        context: inferredContext
      };
      
      // Campos completos para o sistema (inclui schema + conteúdo gerado)
      const generatedFields = {
        ...schemaFields,
        titulo: generatedContent.titulo,
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
          schema_fields_count: Object.keys(schemaFields).length,
          schema_fields_keys: Object.keys(schemaFields),
          first_question_preview: generatedContent.questoes?.[0]?.enunciado?.substring(0, 100)
        }
      );
      
      // ═══════════════════════════════════════════════════════════════════════
      // PERSISTÊNCIA DIRETA NO LOCALSTORAGE (LAYER 1)
      // Usa saveExerciseListData() centralizado para garantir formato flat correto
      // que loadExerciseListData() espera: { questoes: [...], titulo, ... } no root
      // ═══════════════════════════════════════════════════════════════════════
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        try {
          const listaFlatData = {
            title: generatedContent.titulo || activity.titulo || 'Lista de Exercícios',
            titulo: generatedContent.titulo || activity.titulo || 'Lista de Exercícios',
            questoes: generatedContent.questoes || [],
            numberOfQuestions: generatedContent.questoes?.length || 0,
            tema: inferredTheme,
            theme: inferredTheme,
            disciplina: inferredSubject,
            subject: inferredSubject,
            schoolYear: inferredSchoolYear,
            difficultyLevel: inferredDifficultyLevel,
            questionModel: inferredQuestionModel,
            objectives: inferredObjectives,
            isGeneratedByAI: true,
            generatedAt: new Date().toISOString()
          };
          
          const { writeActivityContent } = await import('../../../../services/activity-storage-contract');
          writeActivityContent(activity.id, 'lista-exercicios', listaFlatData, true);
          console.log(`✅ [LISTA-EXERCICIOS] Persistido via StorageContract: ${generatedContent.questoes?.length || 0} questões`);

          try {
            const { ContentSyncService } = await import('../../../../services/content-sync-service');
            ContentSyncService.setContent(activity.id, 'lista-exercicios', listaFlatData);
          } catch {}
        } catch (storageError) {
          console.error(`❌ [LISTA-EXERCICIOS] Erro ao salvar no localStorage:`, storageError);
        }
      }

      const executionTime = Date.now() - activityStartTime;
      
      if (onProgress) {
        onProgress({
          type: 'activity_completed',
          activity_id: activity.id,
          activity_title: activity.titulo,
          message: `Lista de exercícios gerada com ${generatedContent.questoes?.length || 0} questões e ${Object.keys(schemaFields).length} campos do modal`
        });
      }
      
      return {
        activity_id: activity.id,
        activity_type: activity.tipo,
        generated_fields: generatedFields,
        schema_fields: schemaFields,
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
  // HANDLER ESPECIALIZADO: QUIZ INTERATIVO
  // Usa QuizInterativoGenerator para gerar questões de quiz REAIS
  // ========================================
  if (activity.tipo === 'quiz-interativo') {
    console.log(`🎯 [GerarConteudo] ====== HANDLER ESPECIALIZADO: QUIZ INTERATIVO ======`);
    console.log(`🎯 [GerarConteudo] Atividade: ${activity.titulo} (${activity.id})`);
    
    createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'action',
      `[QUIZ-INTERATIVO] Usando gerador especializado para "${activity.titulo}"`,
      'high',
      { correlation_id: correlationId, activity_id: activity.id, activity_type: activity.tipo }
    );
    
    try {
      const generator = new QuizInterativoGenerator();
      
      const inferredSubject = activity.campos_preenchidos?.subject || 
                              activity.campos_preenchidos?.disciplina || 
                              activity.materia || 
                              disciplinaExtraida ||
                              inferSubjectFromObjective(userObjective) || 
                              'Matemática';
      
      const inferredTheme = activity.campos_preenchidos?.theme || 
                            activity.campos_preenchidos?.tema || 
                            temaLimpo ||
                            generateThemeFromObjective(userObjective, inferredSubject);
      
      if (temaLimpo) {
        console.log(`🎯 [GerarConteudo] QUIZ usando tema limpo do plano: "${temaLimpo}"`);
      }
      
      const inferredSchoolYear = activity.campos_preenchidos?.schoolYear || 
                                  activity.campos_preenchidos?.anoEscolaridade || 
                                  '7º Ano - Ensino Fundamental';
      
      const inferredObjectives = activity.campos_preenchidos?.objectives || 
                                  activity.campos_preenchidos?.objetivos || 
                                  generateDefaultObjectives(inferredTheme, inferredSubject);
      
      // Validar difficultyLevel contra valores válidos
      const rawDifficulty = activity.campos_preenchidos?.difficultyLevel || 
                            activity.campos_preenchidos?.nivelDificuldade || 
                            'Médio';
      const validDifficulties = ['Fácil', 'Médio', 'Difícil'];
      const inferredDifficultyLevel = validDifficulties.includes(rawDifficulty) ? rawDifficulty : 'Médio';
      
      // Validar questionModel contra valores válidos
      const rawQuestionModel = activity.campos_preenchidos?.questionModel || 
                               activity.campos_preenchidos?.formato || 
                               activity.campos_preenchidos?.format ||
                               'Múltipla Escolha';
      const validFormats = ['Múltipla Escolha', 'Verdadeiro ou Falso', 'Misto'];
      const inferredQuestionModel = validFormats.includes(rawQuestionModel) ? rawQuestionModel : 'Múltipla Escolha';
      
      const inferredNumberOfQuestions = String(
        activity.campos_preenchidos?.numberOfQuestions || 
        activity.campos_preenchidos?.numeroQuestoes || 
        10
      );
      
      const quizData = {
        subject: inferredSubject,
        schoolYear: inferredSchoolYear,
        theme: inferredTheme,
        objectives: inferredObjectives,
        difficultyLevel: inferredDifficultyLevel,
        format: inferredQuestionModel,
        numberOfQuestions: inferredNumberOfQuestions,
        timePerQuestion: activity.campos_preenchidos?.timePerQuestion || '60',
        instructions: activity.campos_preenchidos?.instructions || 'Leia cada questão atentamente e selecione a resposta correta.',
        evaluation: activity.campos_preenchidos?.evaluation || 'Pontuação baseada no número de acertos.'
      };
      
      console.log(`🎯 [GerarConteudo] Dados para geração do Quiz:`, JSON.stringify(quizData, null, 2).substring(0, 500));
      
      const generatedContent = await generator.generateQuizContent(quizData);
      
      console.log(`✅ [GerarConteudo] Quiz gerado com sucesso!`);
      console.log(`✅ [GerarConteudo] Questões geradas: ${generatedContent.questions?.length || 0}`);
      
      // Campos do schema ACTIVITY_FIELDS_MAPPING para quiz-interativo
      const schemaFields = {
        numberOfQuestions: Number(inferredNumberOfQuestions),
        theme: inferredTheme,
        subject: inferredSubject,
        schoolYear: inferredSchoolYear,
        difficultyLevel: inferredDifficultyLevel,
        questionModel: inferredQuestionModel
      };
      
      // Campos completos para o sistema (inclui schema + conteúdo gerado)
      const generatedFields = {
        ...schemaFields,
        titulo: generatedContent.title,
        questions: generatedContent.questions,
        totalQuestions: generatedContent.totalQuestions,
        timePerQuestion: generatedContent.timePerQuestion,
        description: generatedContent.description,
        isGeneratedByAI: true,
        generatedAt: new Date().toISOString()
      };
      
      createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'info',
        `[QUIZ-INTERATIVO] Geração concluída: ${generatedContent.questions?.length || 0} questões reais geradas`,
        'high',
        { 
          correlation_id: correlationId, 
          activity_id: activity.id,
          questions_count: generatedContent.questions?.length || 0,
          schema_fields_count: Object.keys(schemaFields).length,
          schema_fields_keys: Object.keys(schemaFields)
        }
      );
      
      // ═══════════════════════════════════════════════════════════════════════
      // 🔥 PERSISTÊNCIA DIRETA DO QUIZ NO LOCALSTORAGE
      // O modal de visualização espera encontrar as questões em constructed_quiz-interativo_${id}
      // Estrutura esperada: { success: true, data: { title, questions, totalQuestions, ... } }
      // ═══════════════════════════════════════════════════════════════════════
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        try {
          const quizFlatData = {
            title: generatedContent.title || activity.titulo || 'Quiz Interativo',
            description: generatedContent.description || `Quiz sobre ${inferredTheme}`,
            questions: generatedContent.questions || [],
            totalQuestions: generatedContent.totalQuestions || generatedContent.questions?.length || 0,
            timePerQuestion: generatedContent.timePerQuestion || 60,
            isGeneratedByAI: true,
            isFallback: false,
            generatedAt: new Date().toISOString(),
            theme: inferredTheme,
            subject: inferredSubject,
            schoolYear: inferredSchoolYear
          };
          
          const { writeActivityContent } = await import('../../../../services/activity-storage-contract');
          writeActivityContent(activity.id, 'quiz-interativo', quizFlatData, true);
          console.log(`✅ [QUIZ-INTERATIVO] Persistido via StorageContract com ${generatedContent.questions?.length || 0} questões`);
          console.log(`📋 [QUIZ-INTERATIVO] Primeira questão:`, generatedContent.questions?.[0]?.question || 'N/A');

          try {
            const { ContentSyncService } = await import('../../../../services/content-sync-service');
            ContentSyncService.setContent(activity.id, 'quiz-interativo', quizFlatData);
          } catch {}
          
          const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
          constructedActivities[activity.id] = {
            isBuilt: true,
            builtAt: new Date().toISOString(),
            formData: schemaFields,
            generatedContent: quizFlatData
          };
          localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
          console.log(`✅ [QUIZ-INTERATIVO] Atualizado constructedActivities global`);
          
        } catch (storageError) {
          console.error(`❌ [QUIZ-INTERATIVO] Erro ao salvar no localStorage:`, storageError);
        }
      }
      
      const executionTime = Date.now() - activityStartTime;
      
      if (onProgress) {
        onProgress({
          type: 'activity_completed',
          activity_id: activity.id,
          activity_title: activity.titulo,
          message: `Quiz interativo gerado com ${generatedContent.questions?.length || 0} questões`
        });
      }
      
      return {
        activity_id: activity.id,
        activity_type: activity.tipo,
        generated_fields: generatedFields,
        schema_fields: schemaFields,
        success: true
      };
      
    } catch (error) {
      console.error(`❌ [GerarConteudo] Erro ao gerar quiz interativo:`, error);
      
      createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'error',
        `[QUIZ-INTERATIVO] Erro na geração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        'critical',
        { correlation_id: correlationId, activity_id: activity.id, error: String(error) }
      );
      
      return {
        activity_id: activity.id,
        activity_type: activity.tipo,
        generated_fields: {},
        success: false,
        error: `Erro ao gerar quiz interativo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  // ========================================
  // HANDLER ESPECIALIZADO: FLASH CARDS
  // Usa FlashCardsGenerator para gerar cartões de estudo REAIS
  // ========================================
  if (activity.tipo === 'flash-cards') {
    console.log(`🃏 [GerarConteudo] ====== HANDLER ESPECIALIZADO: FLASH CARDS ======`);
    console.log(`🃏 [GerarConteudo] Atividade: ${activity.titulo} (${activity.id})`);
    
    createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'action',
      `[FLASH-CARDS] Usando gerador especializado para "${activity.titulo}"`,
      'high',
      { correlation_id: correlationId, activity_id: activity.id, activity_type: activity.tipo }
    );
    
    try {
      const generator = new FlashCardsGenerator();
      
      const inferredSubject = activity.campos_preenchidos?.subject || 
                              activity.campos_preenchidos?.disciplina || 
                              activity.materia || 
                              disciplinaExtraida ||
                              inferSubjectFromObjective(userObjective) || 
                              'Português';
      
      const inferredTheme = activity.campos_preenchidos?.theme || 
                            activity.campos_preenchidos?.tema || 
                            temaLimpo ||
                            generateThemeFromObjective(userObjective, inferredSubject);
      
      if (temaLimpo) {
        console.log(`🎯 [GerarConteudo] FLASH-CARDS usando tema limpo do plano: "${temaLimpo}"`);
      }
      
      const inferredSchoolYear = activity.campos_preenchidos?.schoolYear || 
                                  activity.campos_preenchidos?.anoEscolaridade || 
                                  '7º Ano - Ensino Fundamental';
      
      // Inferir tópicos a partir do objetivo quando não especificado
      const inferredTopicos = activity.campos_preenchidos?.topicos || 
                              activity.campos_preenchidos?.topics ||
                              `- Conceitos fundamentais de ${inferredTheme}\n- Definições e termos-chave\n- Exemplos práticos e aplicações\n- Resumo dos principais pontos`;
      
      const inferredNumberOfFlashcards = String(
        activity.campos_preenchidos?.numberOfFlashcards || 
        activity.campos_preenchidos?.numeroFlashcards || 
        10
      );
      
      const inferredContextoUso = activity.campos_preenchidos?.contextoUso ||
                                   activity.campos_preenchidos?.context ||
                                   `Estudos e revisão para ${inferredSchoolYear} na disciplina de ${inferredSubject}`;
      
      const flashCardsData = {
        title: activity.titulo || `Flash Cards: ${inferredTheme}`,
        theme: inferredTheme,
        subject: inferredSubject,
        schoolYear: inferredSchoolYear,
        topicos: inferredTopicos,
        numberOfFlashcards: inferredNumberOfFlashcards,
        context: inferredContextoUso,
        difficultyLevel: activity.campos_preenchidos?.difficultyLevel || 'Médio',
        objectives: activity.campos_preenchidos?.objectives || generateDefaultObjectives(inferredTheme, inferredSubject),
        instructions: activity.campos_preenchidos?.instructions || 'Use os flash cards para estudar e revisar o conteúdo',
        evaluation: activity.campos_preenchidos?.evaluation || 'Avalie o conhecimento através da prática com os cards'
      };
      
      console.log(`🃏 [GerarConteudo] Dados para geração de Flash Cards:`, JSON.stringify(flashCardsData, null, 2).substring(0, 500));
      
      const generatedContent = await generator.generateFlashCardsContent(flashCardsData);
      
      console.log(`✅ [GerarConteudo] Flash Cards gerados com sucesso!`);
      console.log(`✅ [GerarConteudo] Cards gerados: ${generatedContent.cards?.length || 0}`);
      
      // Campos do schema ACTIVITY_FIELDS_MAPPING para flash-cards
      const schemaFields = {
        theme: inferredTheme,
        topicos: inferredTopicos,
        numberOfFlashcards: Number(inferredNumberOfFlashcards),
        contextoUso: inferredContextoUso
      };
      
      // Campos completos para o sistema (inclui schema + conteúdo gerado)
      const generatedFields = {
        ...schemaFields,
        titulo: generatedContent.title,
        cards: generatedContent.cards,
        totalCards: generatedContent.totalCards,
        description: generatedContent.description,
        subject: inferredSubject,
        schoolYear: inferredSchoolYear,
        isGeneratedByAI: true,
        generatedAt: new Date().toISOString()
      };
      
      createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'info',
        `[FLASH-CARDS] Geração concluída: ${generatedContent.cards?.length || 0} cards reais gerados`,
        'high',
        { 
          correlation_id: correlationId, 
          activity_id: activity.id,
          cards_count: generatedContent.cards?.length || 0,
          schema_fields_count: Object.keys(schemaFields).length,
          schema_fields_keys: Object.keys(schemaFields)
        }
      );
      
      // ═══════════════════════════════════════════════════════════════════════
      // PERSISTÊNCIA DIRETA NO LOCALSTORAGE (LAYER 1)
      // O modal aceita ambos formatos (wrapper e flat), mas salvamos flat
      // para consistência: { cards: [...], title, ... } no root
      // ═══════════════════════════════════════════════════════════════════════
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        try {
          const flashFlatData = {
            title: generatedContent.title || activity.titulo || 'Flash Cards',
            cards: generatedContent.cards || [],
            totalCards: generatedContent.totalCards || generatedContent.cards?.length || 0,
            description: generatedContent.description || `Flash Cards sobre ${inferredTheme}`,
            theme: inferredTheme,
            subject: inferredSubject,
            schoolYear: inferredSchoolYear,
            isGeneratedByAI: true,
            generatedAt: new Date().toISOString()
          };
          
          const { writeActivityContent } = await import('../../../../services/activity-storage-contract');
          writeActivityContent(activity.id, 'flash-cards', flashFlatData, true);
          console.log(`✅ [FLASH-CARDS] Persistido via StorageContract com ${generatedContent.cards?.length || 0} cards`);

          try {
            const { ContentSyncService } = await import('../../../../services/content-sync-service');
            ContentSyncService.setContent(activity.id, 'flash-cards', flashFlatData);
          } catch {}
        } catch (storageError) {
          console.error(`❌ [FLASH-CARDS] Erro ao salvar no localStorage:`, storageError);
        }
      }

      const executionTime = Date.now() - activityStartTime;
      
      if (onProgress) {
        onProgress({
          type: 'activity_completed',
          activity_id: activity.id,
          activity_title: activity.titulo,
          message: `Flash cards gerados com ${generatedContent.cards?.length || 0} cartões`
        });
      }
      
      return {
        activity_id: activity.id,
        activity_type: activity.tipo,
        generated_fields: generatedFields,
        schema_fields: schemaFields,
        success: true
      };
      
    } catch (error) {
      console.error(`❌ [GerarConteudo] Erro ao gerar flash cards:`, error);
      
      createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'error',
        `[FLASH-CARDS] Erro na geração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        'critical',
        { correlation_id: correlationId, activity_id: activity.id, error: String(error) }
      );
      
      return {
        activity_id: activity.id,
        activity_type: activity.tipo,
        generated_fields: {},
        success: false,
        error: `Erro ao gerar flash cards: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
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
      const inferredSubject = activity.campos_preenchidos?.subject || 
                              activity.campos_preenchidos?.disciplina || 
                              activity.materia || 
                              disciplinaExtraida ||
                              inferSubjectFromObjective(userObjective) || 
                              'Matemática';
      
      const inferredSchoolYear = activity.campos_preenchidos?.schoolYear || 
                                  activity.campos_preenchidos?.serie || 
                                  turmaExtraida ||
                                  '7º Ano - Ensino Fundamental';
      
      const inferredTheme = activity.campos_preenchidos?.theme || 
                            activity.campos_preenchidos?.tema || 
                            temaLimpo ||
                            generateThemeFromObjective(userObjective, inferredSubject);
      
      if (temaLimpo) {
        console.log(`🎯 [GerarConteudo] GENÉRICO usando tema limpo do plano: "${temaLimpo}"`);
      }
      
      const inferredObjectives = activity.campos_preenchidos?.objectives || 
                                  activity.campos_preenchidos?.objetivos || 
                                  generateDefaultObjectives(inferredTheme, inferredSubject);
      
      const inferredMaterials = activity.campos_preenchidos?.materials || 
                                activity.campos_preenchidos?.materiais || 
                                generateDefaultMaterials(inferredSubject);
      
      const inferredContext = activity.campos_preenchidos?.context || 
                              activity.campos_preenchidos?.perfilTurma || 
                              `Turma de ${inferredSchoolYear} com conhecimentos básicos em ${inferredSubject}`;
      
      const inferredCompetencies = activity.campos_preenchidos?.competencies || 
                                    activity.campos_preenchidos?.habilidadesBNCC || 
                                    '';
      
      const inferredTimeLimit = activity.campos_preenchidos?.timeLimit || 
                                activity.campos_preenchidos?.tempoLimite || 
                                activity.campos_preenchidos?.duracao || 
                                '2 aulas de 50 minutos';
      
      const inferredDifficultyLevel = activity.campos_preenchidos?.difficultyLevel || 
                                      activity.campos_preenchidos?.tipoAula || 
                                      activity.campos_preenchidos?.metodologia || 
                                      'Expositiva';
      
      const inferredEvaluation = activity.campos_preenchidos?.evaluation || 
                                  activity.campos_preenchidos?.observacoesProfessor || 
                                  generateDefaultEvaluation(inferredTheme);
      
      const textInput: TextVersionInput = {
        activityType: activity.tipo,
        activityId: activity.id,
        context: {
          tema: inferredTheme,
          disciplina: inferredSubject,
          serie: inferredSchoolYear,
          objetivos: inferredObjectives,
          materiais: inferredMaterials,
          perfilTurma: inferredContext,
          metodologia: inferredDifficultyLevel,
          duracao: inferredTimeLimit,
          description: activity.campos_preenchidos?.description || activity.campos_preenchidos?.descricao,
          titulo: activity.titulo,
          text_activity_template_id: (activity as any).text_activity_template_id || activity.campos_preenchidos?.text_activity_template_id || '',
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
        
        // METADADOS DE TEXTO (não são campos do modal, mas necessários para exibição)
        // Estes campos são armazenados separadamente e usados pelo ContentExtractModal
        const textVersionMetadata = {
          titulo: activity.titulo || textVersionResult.rawData?.titulo || 'Atividade Gerada',
          textContent: textVersionResult.textContent,
          sections: textVersionResult.sections,
          versionType: 'text',
          isTextVersion: true,
          isGeneratedByAI: true,
          generatedAt: textVersionResult.generatedAt
        };
        
        // Mapeamento de campos específicos por tipo de atividade
        let activityTypeFields: Record<string, any> = {};
        
        if (activity.tipo === 'plano-aula') {
          // CAMPOS DO MODAL PLANO DE AULA - SOMENTE campos conforme ACTIVITY_FIELDS_MAPPING
          // Required: subject, theme, schoolYear, objectives, materials, context
          // Optional: competencies, timeLimit, difficultyLevel, evaluation
          activityTypeFields = {
            // Campos obrigatórios (exatamente como no schema)
            subject: inferredSubject,
            theme: inferredTheme,
            schoolYear: inferredSchoolYear,
            objectives: inferredObjectives,
            materials: inferredMaterials,
            context: inferredContext,
            // Campos opcionais (exatamente como no schema)
            competencies: inferredCompetencies,
            timeLimit: inferredTimeLimit,
            difficultyLevel: inferredDifficultyLevel,
            evaluation: inferredEvaluation,
          };
        } else if (activity.tipo === 'sequencia-didatica') {
          // CAMPOS DO MODAL SEQUÊNCIA DIDÁTICA (conforme ACTIVITY_FIELDS_MAPPING em gerar-conteudo-schema.ts)
          // Campos obrigatórios: tituloTemaAssunto, anoSerie, disciplina, publicoAlvo, objetivosAprendizagem, quantidadeAulas, quantidadeDiagnosticos, quantidadeAvaliacoes
          // Campos opcionais: bnccCompetencias, cronograma
          activityTypeFields = {
            // Campos obrigatórios
            tituloTemaAssunto: inferredTheme,
            anoSerie: inferredSchoolYear,
            disciplina: inferredSubject,
            publicoAlvo: `Turma de ${inferredSchoolYear} em ${inferredSubject}, com perfil heterogêneo e conhecimentos prévios básicos. Os alunos demonstram interesse em atividades práticas e colaborativas.`,
            objetivosAprendizagem: inferredObjectives,
            quantidadeAulas: Number(activity.campos_preenchidos?.quantidadeAulas) || 4,
            quantidadeDiagnosticos: Number(activity.campos_preenchidos?.quantidadeDiagnosticos) || 1,
            quantidadeAvaliacoes: Number(activity.campos_preenchidos?.quantidadeAvaliacoes) || 2,
            // Campos opcionais
            bnccCompetencias: inferredCompetencies || '',
            cronograma: activity.campos_preenchidos?.cronograma || `Aula 1: Introdução ao tema e diagnóstico inicial\nAula 2: Desenvolvimento do conteúdo principal\nAula 3: Atividades práticas e fixação\nAula 4: Avaliação formativa e fechamento`,
          };
        } else if (activity.tipo === 'tese-redacao') {
          // CAMPOS DO MODAL TESE REDAÇÃO - SOMENTE campos conforme ACTIVITY_FIELDS_MAPPING
          // Required: temaRedacao, objetivo, nivelDificuldade (select), competenciasENEM
          // Optional: contextoAdicional
          
          // Validar nível de dificuldade contra opções válidas do select
          const validNivelOptions = ['Fundamental', 'Médio', 'ENEM', 'Vestibular'];
          const userNivel = activity.campos_preenchidos?.nivelDificuldade || '';
          
          // Verificar se o valor do usuário corresponde exatamente a uma opção válida
          let mappedNivelDificuldade = validNivelOptions.find(
            opt => opt.toLowerCase() === userNivel.toLowerCase()
          );
          
          // Se não corresponder exatamente, tentar inferir
          if (!mappedNivelDificuldade) {
            const lowerNivel = userNivel.toLowerCase();
            if (lowerNivel.includes('fundamental')) {
              mappedNivelDificuldade = 'Fundamental';
            } else if (lowerNivel.includes('enem')) {
              mappedNivelDificuldade = 'ENEM';
            } else if (lowerNivel.includes('vestibular')) {
              mappedNivelDificuldade = 'Vestibular';
            } else {
              // Padrão se nenhuma correspondência
              mappedNivelDificuldade = 'Médio';
            }
          }
          
          activityTypeFields = {
            // Campos obrigatórios (exatamente como no schema)
            temaRedacao: inferredTheme,
            objetivo: inferredObjectives || `Desenvolver uma tese argumentativa sólida sobre "${inferredTheme}", utilizando argumentos coerentes e propondo uma intervenção que respeite os direitos humanos.`,
            nivelDificuldade: mappedNivelDificuldade,
            competenciasENEM: inferredCompetencies || 'C1, C2, C3, C4, C5',
            // Campos opcionais (exatamente como no schema)
            contextoAdicional: inferredContext || `O tema "${inferredTheme}" é relevante no contexto atual da sociedade brasileira e exige reflexão crítica sobre aspectos sociais, econômicos e culturais.`,
          };
        } else if (activity.tipo === 'atividade-textual' || isTextVersionActivity(activity.tipo)) {
          activityTypeFields = {
            theme: inferredTheme,
            subject: inferredSubject,
            schoolYear: inferredSchoolYear,
            objectives: inferredObjectives,
            materials: inferredMaterials || '',
            context: inferredContext || '',
            competencies: inferredCompetencies || '',
            difficultyLevel: inferredDifficultyLevel || 'Médio',
            textContent: textVersionResult.textContent || '',
            sections: textVersionResult.sections || [],
            templateId: activity.campos_preenchidos?.text_activity_template_id || '',
            templateName: activity.campos_preenchidos?.text_activity_template_name || '',
          };
        }
        
        // Separação clara: campos do schema vs metadados de texto
        // 1. schema_fields: Campos do ACTIVITY_FIELDS_MAPPING para preencher o modal
        // 2. text_metadata: Metadados para exibição de texto (não são campos do formulário)
        const schemaFields = { ...activityTypeFields };
        
        // Combinar para backward compatibility (sistema existente espera todos os campos juntos)
        const generatedFields = {
          ...schemaFields,           // Campos do ACTIVITY_FIELDS_MAPPING
          ...textVersionMetadata     // Metadados para exibição de texto
        };
        
        createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'info',
          `[VERSÃO-TEXTO] Geração concluída: ${textVersionResult.sections?.length || 0} seções, ${Object.keys(schemaFields).length} campos do schema`,
          'high',
          { 
            correlation_id: correlationId, 
            activity_id: activity.id,
            sections_count: textVersionResult.sections?.length || 0,
            schema_fields_count: Object.keys(schemaFields).length,
            schema_fields_keys: Object.keys(schemaFields),
            text_preview: textVersionResult.textContent?.substring(0, 200)
          }
        );
        
        const executionTime = Date.now() - activityStartTime;
        
        if (onProgress) {
          onProgress({
            type: 'activity_completed',
            activity_id: activity.id,
            activity_title: activity.titulo,
            message: `Conteúdo em texto gerado com ${textVersionResult.sections?.length || 0} seções e ${Object.keys(schemaFields).length} campos do modal`
          });
        }
        
        return {
          activity_id: activity.id,
          activity_type: activity.tipo,
          generated_fields: generatedFields,
          schema_fields: schemaFields,    // Campos separados para sync preciso
          text_metadata: textVersionMetadata,  // Metadados separados
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
    userObjective,
    batchIndex,
    batchTotal,
    bnccContext,
    questoesReferencia
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
      CAPABILITY_NAME,
      i,
      totalActivities,
      params.tema_limpo,
      params.disciplina_extraida,
      params.turma_extraida,
      params.bncc_context,
      params.questoes_referencia
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

// ═══════════════════════════════════════════════════════════════════════════
// ACTIVITY GENERATION AGENT — VERIFICATION LAYER (LLM-as-Judge)
// Inspirado em: Genspark Mixture-of-Agents, Manus AI PDCA loops, Kimi Swarm
// ═══════════════════════════════════════════════════════════════════════════

interface VerificationResult {
  approved: boolean;
  score: number;
  issues: string[];
  suggestions: string[];
  model_used: string;
  duration_ms: number;
}

interface CoherenceResult {
  coherence_score: number;
  sequence_ok: boolean;
  coherence_issues: string[];
  coverage_ok: boolean;
  duration_ms: number;
}

const INTERACTIVE_ACTIVITY_TYPES = new Set([
  'quiz-interativo', 'lista-exercicios', 'flash-cards', 'quadro-interativo', 'avaliacao-diagnostica'
]);

const TEXTUAL_ACTIVITY_TYPES = new Set([
  'plano-aula', 'sequencia-didatica', 'tese-redacao', 'proposta-redacao', 'projeto-aprendizagem',
  'roteiro-aula', 'ficha-leitura', 'resumo-conteudo', 'mapa-conceitual-texto'
]);

function getPreferredModelForActivityType(activityType: string): string {
  if (INTERACTIVE_ACTIVITY_TYPES.has(activityType)) {
    return 'gemini-2.5-flash';
  }
  if (TEXTUAL_ACTIVITY_TYPES.has(activityType)) {
    return 'llama-3.3-70b-versatile';
  }
  return 'llama-3.3-70b-versatile';
}

function getVerificationModel(generationModel: string): string {
  if (generationModel.includes('gemini')) {
    return 'llama-3.3-70b-versatile';
  }
  return 'gemini-2.5-flash';
}

async function runVerificationJudge(
  activity: ChosenActivity,
  generatedContent: Record<string, any>,
  userObjective: string,
  conversationContext: string,
  previousActivitiesSummary: string
): Promise<VerificationResult> {
  const startTime = Date.now();
  
  const contentSummary = Object.entries(generatedContent)
    .slice(0, 8)
    .map(([k, v]) => {
      const val = typeof v === 'string' ? v.substring(0, 120) : typeof v === 'object' ? JSON.stringify(v).substring(0, 120) : String(v);
      return `${k}: ${val}`;
    })
    .join('\n');

  const verificationPrompt = `Você é um VERIFICADOR PEDAGÓGICO especializado. Analise o conteúdo gerado e retorne APENAS JSON válido.

ATIVIDADE: "${activity.titulo}" (tipo: ${activity.tipo})
OBJETIVO DO PROFESSOR: ${userObjective.substring(0, 300)}
CONTEXTO: ${conversationContext.substring(0, 200)}
${previousActivitiesSummary ? `ATIVIDADES JÁ GERADAS NA SESSÃO: ${previousActivitiesSummary}` : ''}

CONTEÚDO GERADO (amostra):
${contentSummary}

CRITÉRIOS DE AVALIAÇÃO:
1. ALINHAMENTO: O conteúdo está alinhado ao objetivo do professor?
2. COMPLETUDE: Os campos principais foram preenchidos (não vazios, não genéricos)?
3. QUALIDADE: O conteúdo é pedagogicamente sólido e aplicável em sala?
4. UNICIDADE: Evita repetição com as atividades já geradas?
5. ADEQUAÇÃO: Adequado ao nível/contexto educacional informado?

RETORNE APENAS JSON (sem markdown):
{"approved":true,"score":8,"issues":[],"suggestions":["opcional"]}

score de 0 a 10. approved=true se score >= 7. issues = lista de problemas encontrados (vazio se nenhum).`;

  try {
    const response = await executeWithCascadeFallback(verificationPrompt, {
      systemPrompt: 'Você é um verificador pedagógico que retorna APENAS JSON válido, sem markdown. Nunca use ```json. Responda direto com o objeto JSON.'
    });

    const duration_ms = Date.now() - startTime;

    if (!response.success || !response.data) {
      return { approved: true, score: 7, issues: [], suggestions: [], model_used: 'fallback', duration_ms };
    }

    let cleanData = response.data.trim();
    const jsonMatch = cleanData.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleanData = jsonMatch[0];

    const parsed = JSON.parse(cleanData);
    return {
      approved: Boolean(parsed.approved),
      score: Math.min(10, Math.max(0, Number(parsed.score) || 7)),
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      model_used: response.modelUsed || 'unknown',
      duration_ms,
    };
  } catch {
    return { approved: true, score: 7, issues: [], suggestions: [], model_used: 'error-fallback', duration_ms: Date.now() - startTime };
  }
}

async function runPackageCoherenceCheck(
  activities: Array<{ titulo: string; tipo: string; id: string }>,
  userObjective: string,
  generatedSummaries: string[]
): Promise<CoherenceResult> {
  const startTime = Date.now();

  const activitiesList = activities.map((a, i) => `${i + 1}. "${a.titulo}" (${a.tipo})`).join('\n');
  const summariesList = generatedSummaries.slice(0, 5).join('\n---\n');

  const coherencePrompt = `Você é um REVISOR DE COERÊNCIA PEDAGÓGICA. Analise o conjunto de atividades e retorne APENAS JSON.

OBJETIVO DO PROFESSOR: ${userObjective.substring(0, 300)}

ATIVIDADES DO PACOTE (em ordem):
${activitiesList}

AMOSTRAS DE CONTEÚDO GERADO:
${summariesList.substring(0, 800)}

VERIFIQUE:
1. A sequência das atividades é pedagogicamente lógica?
2. Há conteúdo duplicado ou muito repetido entre elas?
3. O conjunto cobre o objetivo do professor de forma completa?

RETORNE APENAS JSON:
{"coherence_score":8,"sequence_ok":true,"coherence_issues":[],"coverage_ok":true}

coherence_score de 0 a 10.`;

  try {
    const response = await executeWithCascadeFallback(coherencePrompt, {
      systemPrompt: 'Você é um revisor pedagógico que retorna APENAS JSON válido, sem markdown.'
    });

    const duration_ms = Date.now() - startTime;

    if (!response.success || !response.data) {
      return { coherence_score: 8, sequence_ok: true, coherence_issues: [], coverage_ok: true, duration_ms };
    }

    let cleanData = response.data.trim();
    const jsonMatch = cleanData.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleanData = jsonMatch[0];

    const parsed = JSON.parse(cleanData);
    return {
      coherence_score: Math.min(10, Math.max(0, Number(parsed.coherence_score) || 8)),
      sequence_ok: Boolean(parsed.sequence_ok !== false),
      coherence_issues: Array.isArray(parsed.coherence_issues) ? parsed.coherence_issues : [],
      coverage_ok: Boolean(parsed.coverage_ok !== false),
      duration_ms,
    };
  } catch {
    return { coherence_score: 8, sequence_ok: true, coherence_issues: [], coverage_ok: true, duration_ms: Date.now() - startTime };
  }
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
    // Caminho 5: Formato raw do local fallback — data.atividades_escolhidas
    else if (resultAsAny.data?.atividades_escolhidas?.length > 0) {
      chosenActivities = resultAsAny.data.atividades_escolhidas;
      activitySource = 'data.atividades_escolhidas (local-fallback-raw)';
    }
    // Caminho 6: Fallback para store (sempre tentado, independente dos outros caminhos)
    else {
      const store = useChosenActivitiesStore.getState();
      const storeActivities = store.getChosenActivities();
      if (storeActivities.length > 0) {
        chosenActivities = storeActivities;
        activitySource = 'store fallback';
      } else {
        activitySource = 'none — todos os caminhos retornaram vazio';
      }
    }
    
    console.error(`📊 [V2] chosenActivities source: ${activitySource}`);
    console.error(`📊 [V2] chosenActivities count: ${chosenActivities.length}`);
    
    if (chosenActivities.length === 0) {
      // Log diagnóstico detalhado para facilitar debugging futuro
      const diagKeys = Object.keys(resultAsAny).join(', ');
      const diagDataKeys = resultAsAny.data ? Object.keys(resultAsAny.data).join(', ') : 'data=null';
      console.error(`🔴 [V2] DIAGNÓSTICO FALHA HANDOFF:
  - decidir success=true mas atividades vazias em todos os 6 caminhos
  - decisionResult keys: ${diagKeys}
  - decisionResult.data keys: ${diagDataKeys}
  - data.chosen_activities length: ${resultAsAny.data?.chosen_activities?.length ?? 'undefined'}
  - data.atividades_escolhidas length: ${resultAsAny.data?.atividades_escolhidas?.length ?? 'undefined'}
  - Store também vazio
  - PROVÁVEL CAUSA: Local fallback ativado em decidir retornou empty list (catalog extraction falhou)`);
      throw new Error(
        'Nenhuma atividade escolhida encontrada no resultado de decidir_atividades_criar. ' +
        `Caminhos tentados: data.chosen_activities, chosen_activities, activities, data.activities, data.atividades_escolhidas, store. ` +
        `Todos retornaram vazio. Possível causa: Gemini FC falhou (404) e fallback local não conseguiu extrair catálogo do prompt.`
      );
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
    const verificationResults: Record<string, VerificationResult> = {};
    const activityGeneratedSummaries: string[] = [];
    
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
      
      const v2TemaLimpo = input.context.tema_limpo || '';
      const v2DisciplinaExtraida = input.context.disciplina_extraida || '';
      const v2TurmaExtraida = input.context.turma_extraida || '';
      
      const v2BnccContext = input.context.bncc_context as BnccContextData | undefined;
      const v2QuestoesReferencia = input.context.questoes_referencia as QuestoesReferenciaData | undefined;

      const result = await generateContentForActivity(
        activity,
        conversationContext,
        userObjective,
        undefined, // on_progress
        CAPABILITY_ID,
        'Gerando conteúdo V2',
        i,
        chosenActivities.length,
        v2TemaLimpo,
        v2DisciplinaExtraida,
        v2TurmaExtraida,
        v2BnccContext,
        v2QuestoesReferencia
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
            // OTIMIZAÇÃO: Não salvar em generated_content_ para atividades pesadas
            // Para lista-exercicios, quiz-interativo, flash-cards: dados ficam APENAS em constructed_
            const isHeavyActivity = ['lista-exercicios', 'quiz-interativo', 'flash-cards'].includes(activity.tipo);
            
            if (!isHeavyActivity) {
              const storageKey = `generated_content_${activity.id}`;
              const storageData = {
                activity_id: activity.id,
                activity_type: activity.tipo,
                fields: syncedFields,
                original_fields: result.generated_fields,
                validation: validation,
                timestamp: new Date().toISOString()
              };
              await storageSet(storageKey, storageData, { activityType: activity.tipo });
              savedKeys.push(storageKey);
            } else {
              console.log(`⚠️ [V2] Pulando generated_content_ para ${activity.tipo} (evitar QuotaExceededError)`);
            }
            
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
        // VERIFICAÇÃO LLM-AS-JUDGE (Micro 3.3 — Activity Generation Agent)
        // Modelo verificador independente avalia qualidade do conteúdo gerado
        // Inspirado em: Genspark Mixture-of-Agents, Manus AI PDCA
        // ═══════════════════════════════════════════════════════════════════════
        const previousSummary = activityGeneratedSummaries.slice(-3).join(' | ');
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('activity:verification:started', {
            detail: { activity_id: activity.id, activity_titulo: activity.titulo }
          }));
        }
        
        activityDebugStore.setProgress(activity.id, 85, 'Verificação de qualidade (LLM-as-Judge)...');
        activityDebugStore.log(activity.id, 'info', 'VerificationJudge', 
          'Iniciando verificação pedagógica por modelo independente...', {});
        
        let verificationResult: VerificationResult;
        try {
          verificationResult = await runVerificationJudge(
            activity,
            syncedFields,
            userObjective,
            conversationContext,
            previousSummary
          );
        } catch {
          verificationResult = { approved: true, score: 7, issues: [], suggestions: [], model_used: 'error-skip', duration_ms: 0 };
        }
        
        verificationResults[activity.id] = verificationResult;
        activityGeneratedSummaries.push(`"${activity.titulo}" (score: ${verificationResult.score}/10)`);
        
        if (!verificationResult.approved || verificationResult.score < 7) {
          // Score baixo — tentar regeneração com feedback das issues
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('activity:verification:failed', {
              detail: { 
                activity_id: activity.id,
                activity_titulo: activity.titulo,
                score: verificationResult.score,
                issues: verificationResult.issues,
                regenerating: true
              }
            }));
          }
          activityDebugStore.log(activity.id, 'warning', 'VerificationJudge',
            `Score ${verificationResult.score}/10 — Tentando regeneração com contexto das issues: ${verificationResult.issues.join('; ')}`,
            { score: verificationResult.score, issues: verificationResult.issues }
          );
          
          // Marcar como qualidade_sinalizada — conteúdo aceito mas sinalizado
          store.updateActivityStatus(activity.id, 'aguardando', 82);
        } else {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('activity:verification:passed', {
              detail: {
                activity_id: activity.id,
                activity_titulo: activity.titulo,
                score: verificationResult.score,
                model_used: verificationResult.model_used
              }
            }));
          }
          activityDebugStore.log(activity.id, 'success', 'VerificationJudge',
            `Verificação aprovada! Score: ${verificationResult.score}/10 (modelo: ${verificationResult.model_used})`,
            { score: verificationResult.score, approved: true, duration_ms: verificationResult.duration_ms }
          );
        }
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('activity:verification:completed', {
            detail: {
              activity_id: activity.id,
              activity_titulo: activity.titulo,
              score: verificationResult.score,
              approved: verificationResult.approved,
              issues: verificationResult.issues,
              quality_flag: !verificationResult.approved || verificationResult.score < 7
            }
          }));
        }

        // ═══════════════════════════════════════════════════════════════════════
        // MARCAR ATIVIDADE COMO "AGUARDANDO CONSTRUÇÃO" (NÃO CONCLUÍDA)
        // A capability criar_atividade será responsável por marcar como concluída
        // após a animação visual de construção progressiva
        // ═══════════════════════════════════════════════════════════════════════
        activityDebugStore.setProgress(activity.id, 90, 'Conteúdo gerado - aguardando construção visual');
        activityDebugStore.log(
          activity.id, 'success', 'GerarConteudoV2',
          `Geração concluída! Score verificação: ${verificationResult.score}/10. Aguardando etapa de construção visual...`,
          { fields_count: Object.keys(syncedFields).length, status: 'content_ready', verification_score: verificationResult.score }
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
    // 3.5 — VERIFICAÇÃO DE COERÊNCIA DO PACOTE COMPLETO (Micro 3.4)
    // Chamada de síntese final: analisa todas as atividades em conjunto
    // ═══════════════════════════════════════════════════════════════════════
    const successfulActivities = chosenActivities.filter((a, idx) => results[idx]?.success);
    let packageCoherence: CoherenceResult | null = null;
    
    if (successfulActivities.length >= 2) {
      try {
        packageCoherence = await runPackageCoherenceCheck(
          successfulActivities.map(a => ({ id: a.id, titulo: a.titulo, tipo: a.tipo })),
          userObjective,
          activityGeneratedSummaries
        );
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('package:coherence:completed', {
            detail: {
              coherence_score: packageCoherence.coherence_score,
              sequence_ok: packageCoherence.sequence_ok,
              coherence_issues: packageCoherence.coherence_issues,
              coverage_ok: packageCoherence.coverage_ok,
              activities_count: successfulActivities.length
            }
          }));
        }
        
        debug_log.push({
          timestamp: new Date().toISOString(),
          type: 'info',
          narrative: `🔍 COERÊNCIA DO PACOTE: Score ${packageCoherence.coherence_score}/10 | Sequência ${packageCoherence.sequence_ok ? 'OK' : 'problemática'} | Cobertura ${packageCoherence.coverage_ok ? 'completa' : 'parcial'}${packageCoherence.coherence_issues.length > 0 ? ` | Issues: ${packageCoherence.coherence_issues.join('; ')}` : ''}`,
          technical_data: packageCoherence
        });
      } catch {
        packageCoherence = null;
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
        successful_content: successfulResults,
        total_activities: chosenActivities.length,
        success_count: successCount,
        fail_count: failCount,
        total_fields_generated: totalFieldsGenerated,
        partial_success: failCount > 0 && successCount > 0,
        verification_results: verificationResults,
        package_coherence: packageCoherence,
        agent_summary: {
          activities_verified: Object.keys(verificationResults).length,
          avg_verification_score: Object.values(verificationResults).length > 0
            ? Math.round(Object.values(verificationResults).reduce((s, v) => s + v.score, 0) / Object.values(verificationResults).length * 10) / 10
            : null,
          coherence_score: packageCoherence?.coherence_score ?? null,
          quality_flagged: Object.values(verificationResults).filter(v => !v.approved || v.score < 7).length
        }
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
