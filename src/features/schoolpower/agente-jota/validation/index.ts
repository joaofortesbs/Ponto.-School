/**
 * VALIDATION SYSTEM - ANTI-HALLUCINATION
 * 
 * Exportações do sistema de validação de dados e prevenção de alucinações.
 */

export { 
  dataValidationService,
  type ValidationResult,
  type UserContextValidation,
  type TurmaValidation,
  type AtividadeValidation,
} from './data-validation-service';

export {
  buildAntiHallucinationPrompt,
  wrapPromptWithAntiHallucination,
  createCapabilityValidationPrompt,
  checkForHallucinations,
  type StructuredPromptContext,
  type HallucinationCheck,
} from './anti-hallucination-prompts';

export {
  hallucinationLogger,
  type DataAuditEntry,
  type HallucinationLogEntry,
} from './hallucination-logger';
