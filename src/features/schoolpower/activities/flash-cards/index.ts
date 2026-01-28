/**
 * FLASH CARDS - Módulo Principal (Bounded Context)
 * 
 * Este módulo exporta todos os componentes, contratos e utilitários
 * necessários para a atividade de Flash Cards.
 * 
 * ⚠️ ATENÇÃO: Consulte FLASH_CARDS_RULES.md antes de modificar este módulo.
 * 
 * @version 2.0
 * @date Janeiro 2026
 */

// Componentes
export { FlashCardsPreview } from './FlashCardsPreview';
export { FlashCardsGenerator } from './FlashCardsGenerator';

// Tipos do Generator (para compatibilidade)
export type { FlashCard, FlashCardsData, FlashCardsGeneratedContent } from './FlashCardsGenerator';

// Contratos imutáveis (Bounded Context Protection)
export {
  FLASH_CARDS_CONFIG,
  FlashCardsSanitizer,
  generateFlashCardsCacheKey,
  validateFlashCardsInput,
  saveFlashCardsToStorage,
  loadFlashCardsFromStorage,
  hasFlashCardsInStorage
} from './contracts';

export type {
  FlashCardContract,
  FlashCardsInputContract,
  FlashCardsOutputContract,
  FlashCardsResponseContract
} from './contracts';
