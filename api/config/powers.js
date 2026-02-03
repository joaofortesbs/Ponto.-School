/**
 * POWERS CONFIGURATION - BACKEND (ES Module)
 * 
 * Configuração centralizada e profissional para o sistema de Powers.
 * 
 * ========================================
 * PARA ALTERAR VALORES:
 * ========================================
 * - Para mudar Powers iniciais: altere INITIAL_POWERS_FOR_NEW_USERS
 * - Para mudar allowance diária: altere DAILY_FREE_ALLOWANCE
 * - Para mudar acumulação máxima: altere MAX_ACCUMULATION
 * 
 * IMPORTANTE: Mantenha os valores sincronizados com src/config/powers-pricing.ts
 * ========================================
 */

export const POWERS_CONFIG = {
  /**
   * Powers iniciais para novos usuários
   * Este valor é usado quando um novo usuário se cadastra na plataforma
   */
  INITIAL_POWERS_FOR_NEW_USERS: 300,

  /**
   * Allowance diária de Powers gratuitos
   * Usuários recebem esta quantidade diariamente
   */
  DAILY_FREE_ALLOWANCE: 300,

  /**
   * Máximo de Powers que podem ser acumulados
   */
  MAX_ACCUMULATION: 300,

  /**
   * Hora de renovação diária (formato 24h, horário de Brasília)
   */
  RENEWAL_HOUR: 19,

  /**
   * Timezone para renovação
   */
  RENEWAL_TIMEZONE: 'America/Sao_Paulo',
};

/**
 * Obter Powers iniciais para novos usuários
 * @returns {number}
 */
export function getInitialPowersForNewUsers() {
  return POWERS_CONFIG.INITIAL_POWERS_FOR_NEW_USERS;
}

/**
 * Obter allowance diária
 * @returns {number}
 */
export function getDailyAllowance() {
  return POWERS_CONFIG.DAILY_FREE_ALLOWANCE;
}

/**
 * Obter máximo de acumulação
 * @returns {number}
 */
export function getMaxAccumulation() {
  return POWERS_CONFIG.MAX_ACCUMULATION;
}

export default {
  POWERS_CONFIG,
  getInitialPowersForNewUsers,
  getDailyAllowance,
  getMaxAccumulation,
};
