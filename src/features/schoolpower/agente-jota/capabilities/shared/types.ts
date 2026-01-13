/**
 * TIPOS COMPARTILHADOS - Capabilities Core do Agente Jota
 * 
 * Estes tipos formam a estrutura de anti-alucinação e garantem 
 * que os dados fluam corretamente entre as capabilities.
 * 
 * ARQUITETURA API-FIRST: Cada capability recebe CapabilityInput
 * e retorna CapabilityOutput padronizado.
 */

// ============================================
// CONTRATOS API-FIRST (Padrão para todas capabilities)
// ============================================

export interface CapabilityInput {
  capability_id: string;
  execution_id: string;
  context: Record<string, any>;
  previous_results?: Map<string, CapabilityOutput>;
}

export interface CapabilityOutput {
  success: boolean;
  capability_id: string;
  execution_id: string;
  timestamp: string;
  data: any | null;
  error: CapabilityError | null;
  debug_log: DebugEntry[];
  data_confirmation?: DataConfirmation;
  metadata: {
    duration_ms: number;
    retry_count: number;
    data_source: string;
  };
}

export interface CapabilityError {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  recovery_suggestion: string;
}

export interface DebugEntry {
  timestamp: string;
  type: 'action' | 'discovery' | 'decision' | 'error' | 'warning' | 'info' | 'reflection' | 'confirmation';
  narrative: string;
  technical_data?: any;
}

// ============================================
// SISTEMA DE CONFIRMAÇÃO DE DADOS
// Garante que cada capability recebeu/processou dados reais
// ============================================

export interface DataConfirmation {
  confirmed: boolean;
  checks: DataCheck[];
  summary: string;
  blocksNextStep: boolean;
}

export interface DataCheck {
  id: string;
  label: string;
  passed: boolean;
  value?: any;
  expected?: string;
  message: string;
}

export function createDataConfirmation(checks: DataCheck[]): DataConfirmation {
  const allPassed = checks.every(c => c.passed);
  const failedChecks = checks.filter(c => !c.passed);
  
  return {
    confirmed: allPassed,
    checks,
    summary: allPassed 
      ? `✅ Todos os ${checks.length} checks de dados passaram`
      : `❌ ${failedChecks.length}/${checks.length} checks falharam: ${failedChecks.map(c => c.label).join(', ')}`,
    blocksNextStep: !allPassed
  };
}

export function createDataCheck(
  id: string,
  label: string,
  condition: boolean,
  value?: any,
  expected?: string
): DataCheck {
  return {
    id,
    label,
    passed: condition,
    value,
    expected,
    message: condition 
      ? `✅ ${label}: OK` 
      : `❌ ${label}: Falhou${expected ? ` (esperado: ${expected})` : ''}`
  };
}

// ============================================
// CAPABILITY 1: pesquisar_atividades_conta
// ============================================

export interface AtividadeFromDB {
  id: string;
  titulo: string;
  tipo: string;
  disciplina: string;
  conteudo: any;
  campos_preenchidos?: Record<string, any>;
  created_at: Date;
  updated_at?: Date;
  professor_id: string;
  status?: string;
  turma_id?: string;
  turma_nome?: string;
}

export interface AtividadeForAI {
  id: string;
  titulo: string;
  tipo: string;
  metadata: {
    disciplina: string;
    nivel: string;
    tags: string[];
    categoria?: string;
  };
  usage_stats: {
    times_used: number;
    avg_rating: number;
  };
  was_successful: boolean;
  created_at: string;
}

export interface SearchAccountActivitiesResult {
  found: boolean;
  count: number;
  activities: AtividadeForAI[] | null;
  metadata: {
    query_timestamp: string;
    professor_id: string;
    database: "neon_production";
  };
  isEmpty: boolean;
  summary: string;
}

// ============================================
// CAPABILITY 2: pesquisar_atividades_disponiveis
// ============================================

export interface ActivityFromCatalog {
  id: string;
  titulo: string;
  tipo: string;
  categoria: string;
  materia: string;
  nivel_dificuldade: string;
  tags: string[];
  descricao: string;
  icone?: string;
  cor?: string;
  enabled: boolean;
  campos_obrigatorios: string[];
  campos_opcionais?: string[];
  schema_campos: Record<string, FieldSchema>;
}

export interface FieldSchema {
  tipo: 'text' | 'textarea' | 'number' | 'select' | 'array' | 'array_objects' | 'boolean';
  label: string;
  placeholder?: string;
  max_length?: number;
  min?: number;
  max?: number;
  default?: any;
  required: boolean;
  opcoes?: string[];
  min_items?: number;
  max_items?: number;
  rows?: number;
  item_tipo?: string;
  schema?: Record<string, any>;
}

export interface FilterOptions {
  tipo?: string[];
  categoria?: string[];
  disciplina?: string[];
  nivel?: string[];
  tags?: string[];
  search_text?: string;
}

export interface SearchAvailableActivitiesResult {
  found: boolean;
  count: number;
  activities: ActivityFromCatalog[];
  filtered_count?: number;
  filters_applied?: FilterOptions;
  metadata: {
    catalog_version: string;
    query_timestamp: string;
    source: "schoolPowerActivities.json";
  };
  summary: string;
  valid_ids: string[];
}

// ============================================
// CAPABILITY 3: decidir_atividades_criar
// ============================================

export interface DecisionContext {
  user_objective: string;
  user_context: {
    disciplina?: string;
    turma?: {
      nome: string;
      nivel: string;
      alunos_count?: number;
    };
    tempo_disponivel?: string;
    objetivo_pedagogico?: string;
  };
  available_activities: ActivityFromCatalog[];
  previous_activities: AtividadeForAI[];
  constraints: {
    max_activities: number;
    preferred_types?: string[];
    avoid_types?: string[];
  };
}

export interface ChosenActivity {
  id: string;
  titulo: string;
  tipo: string;
  categoria?: string;
  materia: string;
  nivel_dificuldade: string;
  tags: string[];
  campos_obrigatorios: string[];
  campos_opcionais: string[];
  schema_campos: Record<string, FieldSchema>;
  campos_preenchidos: Record<string, any>;
  justificativa: string;
  ordem_sugerida: number;
  status_construcao: 'aguardando' | 'construindo' | 'concluida' | 'erro';
  progresso: number;
}

export interface DecisionValidation {
  all_ids_valid: boolean;
  count_within_limit: boolean;
  has_justification: boolean;
  no_duplicates: boolean;
  fields_complete: boolean;
  errors: string[];
}

export interface DecisionResult {
  success: boolean;
  validation: DecisionValidation;
  chosen_activities: ChosenActivity[];
  estrategia_pedagogica: string;
  total_escolhidas: number;
  metadata: {
    decision_timestamp: string;
    attempt_number: number;
    model_used?: string;
  };
  // Dados de raciocínio da IA para debug
  raciocinio?: {
    catalogo_consultado: boolean;
    atividades_disponiveis: number;
    atividades_anteriores: number;
    ids_analisados?: string[];
    criterios_usados?: string[];
    erro?: string;
  };
}

// ============================================
// CAPABILITY 4: criar_atividade
// ============================================

export interface ConstructionProgress {
  total: number;
  completed: number;
  failed: number;
  current: string | null;
  percentage: number;
}

export interface BuiltActivity {
  id: string;
  original_id: string;
  titulo: string;
  tipo: string;
  categoria?: string;
  materia: string;
  nivel_dificuldade: string;
  campos_preenchidos: Record<string, any>;
  conteudo_gerado?: string;
  status: 'pending' | 'building' | 'completed' | 'failed';
  error_message?: string;
  created_at: string;
  saved_to_db: boolean;
  db_id?: string;
}

export interface CreateActivityResult {
  success: boolean;
  activities_built: BuiltActivity[];
  progress: ConstructionProgress;
  errors: string[];
  summary: string;
  metadata: {
    build_timestamp: string;
    total_time_ms: number;
    saved_to_database: boolean;
  };
}

// ============================================
// ESTADO GLOBAL DAS CAPABILITIES
// ============================================

export interface CapabilityState {
  pesquisar_conta: {
    status: 'idle' | 'executing' | 'completed' | 'error';
    result: SearchAccountActivitiesResult | null;
    timestamp: string | null;
    error?: string;
  };
  pesquisar_disponiveis: {
    status: 'idle' | 'executing' | 'completed' | 'error';
    result: SearchAvailableActivitiesResult | null;
    timestamp: string | null;
    error?: string;
  };
  decidir: {
    status: 'idle' | 'executing' | 'completed' | 'error';
    result: DecisionResult | null;
    timestamp: string | null;
    error?: string;
  };
  criar: {
    status: 'idle' | 'executing' | 'completed' | 'error';
    result: CreateActivityResult | null;
    timestamp: string | null;
    error?: string;
  };
}

// ============================================
// ANTI-HALLUCINATION HELPERS
// ============================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
  action?: 'reject_and_retry' | 'use_validated_data' | 'abort';
  invalid_items?: string[];
}

export function validateAIChoices(
  aiChosenIds: string[],
  validCatalog: ActivityFromCatalog[]
): ValidationResult {
  const validIds = new Set(validCatalog.map(a => a.id));
  const invalidIds = aiChosenIds.filter(id => !validIds.has(id));
  
  if (invalidIds.length > 0) {
    return {
      valid: false,
      error: `IA escolheu IDs inválidos: ${invalidIds.join(', ')}`,
      action: 'reject_and_retry',
      invalid_items: invalidIds
    };
  }
  
  return { valid: true };
}

export function transformDBtoAI(dbActivities: AtividadeFromDB[]): AtividadeForAI[] {
  return dbActivities.map(activity => ({
    id: activity.id,
    titulo: activity.titulo,
    tipo: activity.tipo,
    metadata: {
      disciplina: activity.disciplina || 'geral',
      nivel: 'intermediario',
      tags: [],
      categoria: activity.tipo
    },
    usage_stats: {
      times_used: 1,
      avg_rating: 0
    },
    was_successful: true,
    created_at: activity.created_at instanceof Date 
      ? activity.created_at.toISOString() 
      : String(activity.created_at)
  }));
}

export function buildAntiHallucinationPrompt(validIds: string[]): string {
  return `
⚠️ REGRA ABSOLUTA DE ANTI-ALUCINAÇÃO:
Você DEVE escolher APENAS atividades desta lista de IDs válidos:
${validIds.join(', ')}

Se você mencionar um ID que não está nesta lista, o sistema REJEITARÁ.
Se você criar um tipo de atividade que não existe aqui, o sistema REJEITARÁ.
NUNCA invente IDs ou atividades que não existem no catálogo.
  `.trim();
}
