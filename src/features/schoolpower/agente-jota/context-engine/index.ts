/**
 * CONTEXT ENGINE - Motor de Contexto Supremo
 * 
 * Sistema unificado de gestão de contexto inspirado em:
 * - Manus AI: context compaction, goal recitation, filesystem-as-memory
 * - Replit Agent: LLM-based compression, checkpoints
 * - Devin: knowledge base persistente, context anxiety mitigation
 * 
 * Substitui: MemoryManager + ContextManager fragmentados
 * Oferece: Contexto otimizado por tipo de chamada, compactação inteligente,
 *          goal recitation, e memória de sessão completa.
 */

export { ContextAssembler, contextAssembler, type CallType, type SessionContext } from './context-assembler';
export { ConversationCompactor, type ConversationTurn } from './conversation-compactor';
export { GoalReciter } from './goal-reciter';
export { 
  getSession, 
  createSession, 
  prepareForNewPlan, 
  addConversationTurn, 
  setPlan, 
  addStepResult, 
  registerActivity, 
  clearSession 
} from './session-store';

export { 
  executeMenteMaior, 
  type MenteMaiorInput, 
  type MenteMaiorOutput 
} from './mente-maior';
