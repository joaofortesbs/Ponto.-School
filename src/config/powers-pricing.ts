/**
 * POWERS PRICING CONFIGURATION
 * 
 * Configuração centralizada e escalável para precificação de Powers.
 * 
 * ARQUITETURA:
 * - Cada capacidade tem seu próprio custo por item (sem custos fixos)
 * - Fácil de expandir para novas capacidades no futuro
 * - Tipos fortes para garantir consistência
 * 
 * MODELO DE PRECIFICAÇÃO:
 * - criar_atividade: 70 Powers por atividade criada
 * - Todas as outras capacidades: 0 Powers (gratuitas)
 * 
 * EXPANSIBILIDADE FUTURA:
 * - criar_planejamento: X Powers por planejamento
 * - criar_arquivo: Y Powers por arquivo
 */

export type CapabilityId = 
  | 'pesquisar_atividades_disponiveis'
  | 'decidir_atividades_criar'
  | 'gerar_conteudo_atividades'
  | 'criar_atividade'
  | 'salvar_atividades_bd'
  | 'criar_planejamento'
  | 'criar_arquivo';

export type ChargeCategory = 'PESQUISAR' | 'DECIDIR' | 'GERAR' | 'CRIAR' | 'SALVAR' | 'PLANEJAR';

export interface CapabilityPricing {
  id: CapabilityId;
  displayName: string;
  category: ChargeCategory;
  costPerItem: number;
  itemLabel: string;
  enabled: boolean;
}

export interface PowersConfig {
  /** Quantidade de Powers que novos usuários recebem ao criar conta */
  initialPowersForNewUsers: number;
  /** Quantidade diária gratuita de Powers */
  dailyFreeAllowance: number;
  /** Hora de renovação diária (horário local) */
  renewalHour: number;
  /** Timezone para renovação */
  renewalTimezone: string;
  /** Máximo que pode acumular */
  maxAccumulation: number;
}

/**
 * CONFIGURAÇÃO CENTRALIZADA DE POWERS
 * 
 * Para alterar a quantidade inicial de Powers para novos usuários:
 * - Modifique o valor de `initialPowersForNewUsers` abaixo
 * - O valor será automaticamente usado ao criar novos usuários no banco
 * 
 * IMPORTANTE: Este arquivo é a ÚNICA fonte de verdade para configuração de Powers
 */
export const POWERS_CONFIG: PowersConfig = {
  // ====================================
  // CONFIGURAÇÃO PRINCIPAL - ALTERE AQUI
  // ====================================
  
  /** Powers iniciais para novos usuários (altere este valor conforme necessário) */
  initialPowersForNewUsers: 300,
  
  /** Allowance diária de Powers gratuitos */
  dailyFreeAllowance: 300,
  
  // ====================================
  // CONFIGURAÇÕES DE SISTEMA
  // ====================================
  renewalHour: 19,
  renewalTimezone: 'America/Sao_Paulo',
  maxAccumulation: 300,
};

export const CAPABILITY_PRICING: Record<CapabilityId, CapabilityPricing> = {
  pesquisar_atividades_disponiveis: {
    id: 'pesquisar_atividades_disponiveis',
    displayName: 'Pesquisar atividades',
    category: 'PESQUISAR',
    costPerItem: 0,
    itemLabel: 'pesquisa',
    enabled: true,
  },
  
  decidir_atividades_criar: {
    id: 'decidir_atividades_criar',
    displayName: 'Decidir atividades',
    category: 'DECIDIR',
    costPerItem: 0,
    itemLabel: 'decisão',
    enabled: true,
  },
  
  gerar_conteudo_atividades: {
    id: 'gerar_conteudo_atividades',
    displayName: 'Gerar conteúdo',
    category: 'GERAR',
    costPerItem: 0,
    itemLabel: 'geração',
    enabled: true,
  },
  
  criar_atividade: {
    id: 'criar_atividade',
    displayName: 'Criar atividade',
    category: 'CRIAR',
    costPerItem: 70,
    itemLabel: 'atividade',
    enabled: true,
  },
  
  salvar_atividades_bd: {
    id: 'salvar_atividades_bd',
    displayName: 'Salvar no banco',
    category: 'SALVAR',
    costPerItem: 0,
    itemLabel: 'salvamento',
    enabled: true,
  },

  criar_planejamento: {
    id: 'criar_planejamento',
    displayName: 'Criar planejamento',
    category: 'CRIAR',
    costPerItem: 0,
    itemLabel: 'planejamento',
    enabled: false,
  },
  
  criar_arquivo: {
    id: 'criar_arquivo',
    displayName: 'Criar arquivo',
    category: 'CRIAR',
    costPerItem: 0,
    itemLabel: 'arquivo',
    enabled: false,
  },
};

export function getCapabilityPrice(capabilityId: CapabilityId): number {
  const pricing = CAPABILITY_PRICING[capabilityId];
  if (!pricing || !pricing.enabled) {
    return 0;
  }
  return pricing.costPerItem;
}

export function calculateTotalCost(capabilityId: CapabilityId, itemCount: number): number {
  const pricePerItem = getCapabilityPrice(capabilityId);
  return pricePerItem * itemCount;
}

export function getCapabilityDisplayInfo(capabilityId: CapabilityId): { name: string; itemLabel: string } {
  const pricing = CAPABILITY_PRICING[capabilityId];
  return {
    name: pricing?.displayName || capabilityId,
    itemLabel: pricing?.itemLabel || 'item',
  };
}

export function hasEnoughPowers(
  availablePowers: number, 
  capabilityId: CapabilityId, 
  itemCount: number
): boolean {
  const totalCost = calculateTotalCost(capabilityId, itemCount);
  return availablePowers >= totalCost;
}

export function formatPowersCost(cost: number): string {
  return cost === 0 ? 'Grátis' : `-${cost} Powers`;
}

export function getDailyAllowance(): number {
  return POWERS_CONFIG.dailyFreeAllowance;
}

export default {
  POWERS_CONFIG,
  CAPABILITY_PRICING,
  getCapabilityPrice,
  calculateTotalCost,
  getCapabilityDisplayInfo,
  hasEnoughPowers,
  formatPowersCost,
  getDailyAllowance,
};
