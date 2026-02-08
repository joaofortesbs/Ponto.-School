export { runAgentLoop, getAgentLoopSummary } from './agent-loop';
export type { AgentState, ThoughtEntry, ActionEntry, ObservationEntry, AgentLoopConfig } from './agent-loop';

export { ContextEngine } from './context-engine';
export type { ContextBlock, ContextWindow } from './context-engine';

export {
  buildExecutionPlan,
  executeParallelLayer,
  executeFullPipeline,
  createTasksFromCapabilities,
  getCapabilityDependencies,
} from './parallel-executor';
export type { ParallelTask, ParallelResult } from './parallel-executor';

export { PersistentMemory } from './persistent-memory';
export type { MemoryItem, SessionRecord, PersistentMemoryConfig } from './persistent-memory';

export { verifyAgentResult, shouldRetry, formatVerificationForUser } from './verifier';
export type { VerificationResult, VerificationCheck } from './verifier';

export {
  processUserPromptV2,
  executeAgentPlanV2,
  getSessionContextV2,
  clearSessionV2,
} from './orchestrator-v2';
export type { ProcessPromptResultV2, ExecutePlanResultV2 } from './orchestrator-v2';

export { isV2Enabled, enableV2, disableV2, toggleV2 } from './feature-flag';

export {
  processUserPromptAdapted,
  executeAgentPlanAdapted,
  getSessionContextAdapted,
  clearSessionAdapted,
  sendFollowUpMessageAdapted,
} from './adapter';

export {
  processUserPrompt,
  executeAgentPlan,
  getSessionContext,
  clearSession,
  sendFollowUpMessage,
} from './orchestrator-switch';
