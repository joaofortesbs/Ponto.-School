/**
 * POWERS SERVICE
 * 
 * Serviço centralizado para gestão de Powers (moeda virtual da plataforma).
 * 
 * RESPONSABILIDADES:
 * - Gerenciar saldo de Powers do usuário
 * - Processar cobranças por capacidade executada
 * - Manter extrato de transações
 * - Verificar e renovar Powers diários
 * - Persistir dados no localStorage e sincronizar com backend
 * - Emitir eventos para sincronização da UI
 * 
 * ARQUITETURA:
 * - localStorage para cache local e persistência imediata
 * - API backend para sincronização (quando disponível)
 * - Sistema de eventos para atualização reativa da UI
 */

import { 
  CapabilityId, 
  POWERS_CONFIG, 
  calculateTotalCost, 
  getCapabilityDisplayInfo,
  getCapabilityPrice 
} from '@/config/powers-pricing';

export interface PowersTransaction {
  id: string;
  capabilityId: CapabilityId;
  itemCount: number;
  costPerItem: number;
  totalCost: number;
  description: string;
  timestamp: string;
  activityId?: string;
  activityTitle?: string;
}

export interface PowersBalance {
  available: number;
  used: number;
  dailyLimit: number;
  lastRenewal: string;
  transactions: PowersTransaction[];
}

export interface ChargeResult {
  success: boolean;
  charged: number;
  remainingBalance: number;
  transactionId: string;
  error?: string;
}

const STORAGE_KEYS = {
  balance: 'powers_balance',
  transactions: 'powers_transactions',
  lastRenewal: 'powers_last_renewal',
} as const;

const POWERS_EVENT = 'powers:updated';

class PowersService {
  private balance: PowersBalance;
  private initialized: boolean = false;

  constructor() {
    this.balance = this.getDefaultBalance();
  }

  private getDefaultBalance(): PowersBalance {
    return {
      available: POWERS_CONFIG.dailyFreeAllowance,
      used: 0,
      dailyLimit: POWERS_CONFIG.dailyFreeAllowance,
      lastRenewal: new Date().toISOString(),
      transactions: [],
    };
  }

  async initialize(userId?: string): Promise<PowersBalance> {
    if (this.initialized) {
      return this.balance;
    }

    try {
      const storedBalance = localStorage.getItem(STORAGE_KEYS.balance);
      
      if (storedBalance) {
        this.balance = JSON.parse(storedBalance);
        
        if (this.shouldRenewDaily()) {
          await this.renewDailyPowers();
        }
      } else {
        this.balance = this.getDefaultBalance();
        this.persistBalance();
      }

      this.initialized = true;
      console.log('[PowersService] Inicializado:', this.balance);
      
      return this.balance;
    } catch (error) {
      console.error('[PowersService] Erro ao inicializar:', error);
      this.balance = this.getDefaultBalance();
      this.initialized = true;
      return this.balance;
    }
  }

  private shouldRenewDaily(): boolean {
    if (!this.balance.lastRenewal) return true;

    const lastRenewal = new Date(this.balance.lastRenewal);
    const now = new Date();
    
    const renewalHour = POWERS_CONFIG.renewalHour;
    
    const todayRenewal = new Date(now);
    todayRenewal.setHours(renewalHour, 0, 0, 0);
    
    if (now >= todayRenewal && lastRenewal < todayRenewal) {
      return true;
    }
    
    const yesterdayRenewal = new Date(todayRenewal);
    yesterdayRenewal.setDate(yesterdayRenewal.getDate() - 1);
    
    if (now < todayRenewal && lastRenewal < yesterdayRenewal) {
      return true;
    }

    return false;
  }

  async renewDailyPowers(): Promise<void> {
    console.log('[PowersService] Renovando Powers diários...');
    
    this.balance.available = POWERS_CONFIG.dailyFreeAllowance;
    this.balance.used = 0;
    this.balance.lastRenewal = new Date().toISOString();
    
    this.persistBalance();
    this.emitUpdate();
    
    console.log('[PowersService] Powers renovados:', this.balance.available);
  }

  async chargeForCapability(
    capabilityId: CapabilityId,
    itemCount: number,
    metadata?: {
      activityId?: string;
      activityTitle?: string;
    }
  ): Promise<ChargeResult> {
    await this.initialize();

    const costPerItem = getCapabilityPrice(capabilityId);
    const totalCost = calculateTotalCost(capabilityId, itemCount);
    const displayInfo = getCapabilityDisplayInfo(capabilityId);

    if (totalCost === 0) {
      console.log(`[PowersService] ${capabilityId} é gratuito, sem cobrança`);
      return {
        success: true,
        charged: 0,
        remainingBalance: this.balance.available,
        transactionId: '',
      };
    }

    if (this.balance.available < totalCost) {
      console.warn(`[PowersService] Saldo insuficiente: ${this.balance.available} < ${totalCost}`);
      return {
        success: false,
        charged: 0,
        remainingBalance: this.balance.available,
        transactionId: '',
        error: `Saldo insuficiente. Você tem ${this.balance.available} Powers, mas precisa de ${totalCost} Powers.`,
      };
    }

    const transaction: PowersTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      capabilityId,
      itemCount,
      costPerItem,
      totalCost,
      description: this.buildTransactionDescription(displayInfo, itemCount, metadata),
      timestamp: new Date().toISOString(),
      activityId: metadata?.activityId,
      activityTitle: metadata?.activityTitle,
    };

    this.balance.available -= totalCost;
    this.balance.used += totalCost;
    this.balance.transactions.unshift(transaction);

    if (this.balance.transactions.length > 100) {
      this.balance.transactions = this.balance.transactions.slice(0, 100);
    }

    this.persistBalance();
    this.emitUpdate();

    console.log(`[PowersService] Cobrado ${totalCost} Powers por ${capabilityId}. Saldo: ${this.balance.available}`);

    return {
      success: true,
      charged: totalCost,
      remainingBalance: this.balance.available,
      transactionId: transaction.id,
    };
  }

  private buildTransactionDescription(
    displayInfo: { name: string; itemLabel: string },
    itemCount: number,
    metadata?: { activityTitle?: string }
  ): string {
    if (metadata?.activityTitle) {
      return `${displayInfo.name}: ${metadata.activityTitle}`;
    }
    
    if (itemCount === 1) {
      return `${displayInfo.name} (1 ${displayInfo.itemLabel})`;
    }
    
    return `${displayInfo.name} (${itemCount} ${displayInfo.itemLabel}s)`;
  }

  getBalance(): PowersBalance {
    if (!this.initialized) {
      const storedBalance = localStorage.getItem(STORAGE_KEYS.balance);
      if (storedBalance) {
        try {
          this.balance = JSON.parse(storedBalance);
        } catch {
          this.balance = this.getDefaultBalance();
        }
      }
    }
    return this.balance;
  }

  getAvailablePowers(): number {
    return this.getBalance().available;
  }

  getUsedPowers(): number {
    return this.getBalance().used;
  }

  getDailyLimit(): number {
    return POWERS_CONFIG.dailyFreeAllowance;
  }

  getTransactions(limit?: number): PowersTransaction[] {
    const transactions = this.getBalance().transactions;
    return limit ? transactions.slice(0, limit) : transactions;
  }

  getTransactionsForExtrato(): Array<{
    id: string;
    title: string;
    date: string;
    creditChange: number;
  }> {
    return this.getTransactions().map(tx => ({
      id: tx.id,
      title: tx.description,
      date: tx.timestamp,
      creditChange: -tx.totalCost,
    }));
  }

  canAfford(capabilityId: CapabilityId, itemCount: number = 1): boolean {
    const totalCost = calculateTotalCost(capabilityId, itemCount);
    return this.balance.available >= totalCost;
  }

  getEstimatedCost(capabilityId: CapabilityId, itemCount: number = 1): number {
    return calculateTotalCost(capabilityId, itemCount);
  }

  private persistBalance(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.balance, JSON.stringify(this.balance));
    } catch (error) {
      console.error('[PowersService] Erro ao persistir saldo:', error);
    }
  }

  private emitUpdate(): void {
    const event = new CustomEvent(POWERS_EVENT, {
      detail: {
        balance: this.balance,
        timestamp: new Date().toISOString(),
      },
    });
    window.dispatchEvent(event);
  }

  onUpdate(callback: (balance: PowersBalance) => void): () => void {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ balance: PowersBalance }>;
      callback(customEvent.detail.balance);
    };
    
    window.addEventListener(POWERS_EVENT, handler);
    
    return () => {
      window.removeEventListener(POWERS_EVENT, handler);
    };
  }

  async reset(): Promise<void> {
    this.balance = this.getDefaultBalance();
    this.persistBalance();
    this.emitUpdate();
    console.log('[PowersService] Saldo resetado');
  }

  formatBalance(): string {
    return `${this.balance.available}/${this.balance.dailyLimit}`;
  }
}

export const powersService = new PowersService();
export default powersService;
