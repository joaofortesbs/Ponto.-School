/**
 * Context Module - Exportações do sistema de contexto
 * 
 * Arquitetura de 3 Chamadas:
 * 1. InitialResponseService - Resposta inicial ao input do usuário
 * 2. DevelopmentCardService - Reflexões do card de desenvolvimento (janela única)
 * 3. FinalResponseService - Resposta final consolidada
 */

export {
  ContextManager,
  getContextManager,
  getContextoMacro,
  type ContextoMacro,
  type InputOriginal,
  type ResultadoEtapa,
  type ResultadoCapability,
  type ResumoProgressivo,
} from './context-manager';

export {
  generateInitialResponse,
  getInitialResponseOnly,
  type InitialResponseResult,
} from './initial-response-service';

export {
  generateDevelopmentReflection,
  convertCapabilityInsightToResultado,
  registerActivityCreated,
  type DevelopmentReflectionResult,
} from './development-card-service';

export {
  generateFinalResponse,
  generateQuickFinalResponse,
  type FinalResponseResult,
} from './final-response-service';
