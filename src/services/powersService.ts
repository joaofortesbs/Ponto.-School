/**
 * POWERS SERVICE v3.0 ENTERPRISE
 * 
 * Serviço centralizado para gestão de Powers (moeda virtual da plataforma).
 * INTEGRADO COM BANCO DE DADOS NEON - SINCRONIZAÇÃO BIDIRECIONAL ENTERPRISE-GRADE
 * 
 * RESPONSABILIDADES:
 * - Gerenciar saldo de Powers do usuário
 * - Processar cobranças por capacidade executada
 * - Manter extrato de transações
 * - Verificar e renovar Powers diários
 * - Persistir dados no localStorage E sincronizar com banco Neon
 * - Emitir eventos para sincronização da UI
 * - Sistema de retry com backoff exponencial
 * - Fila de transações pendentes para recuperação de falhas
 * 
 * ARQUITETURA:
 * - localStorage para cache local e persistência imediata
 * - API backend para sincronização com banco de dados Neon
 * - Sistema de eventos para atualização reativa da UI
 * - Retry mechanism com exponential backoff (máx 3 tentativas)
 * - Pending transactions queue para durabilidade
 */

import { 
  CapabilityId, 
  POWERS_CONFIG, 
  calculateTotalCost, 
  getCapabilityDisplayInfo,
  getCapabilityPrice 
} from '@/config/powers-pricing';
import { supabase } from '@/lib/supabase';

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
  syncedToDb?: boolean;
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
  dbSynced?: boolean;
}

interface PendingSyncItem {
  id: string;
  amount: number;
  timestamp: string;
  retryCount: number;
}

const STORAGE_KEYS = {
  balance: 'powers_balance',
  transactions: 'powers_transactions',
  lastRenewal: 'powers_last_renewal',
  userEmail: 'powers_user_email',
  pendingSync: 'powers_pending_sync',
} as const;

const POWERS_EVENT = 'powers:updated';

const SYNC_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 500,
  maxDelayMs: 5000,
} as const;

class PowersService {
  private balance: PowersBalance;
  private initialized: boolean = false;
  private userEmail: string | null = null;
  private pendingSync: PendingSyncItem[] = [];
  private syncPollingInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.balance = this.getDefaultBalance();
    this.loadPendingSync();
    this.startSyncPolling();
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

  private loadPendingSync(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.pendingSync);
      if (stored) {
        this.pendingSync = JSON.parse(stored);
        console.log('[PowersService] 📋 Carregadas', this.pendingSync.length, 'transações pendentes');
      }
    } catch (error) {
      console.error('[PowersService] Erro ao carregar transações pendentes:', error);
      this.pendingSync = [];
    }
  }

  private savePendingSync(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.pendingSync, JSON.stringify(this.pendingSync));
    } catch (error) {
      console.error('[PowersService] Erro ao salvar transações pendentes:', error);
    }
  }

  private startSyncPolling(): void {
    if (this.syncPollingInterval) {
      clearInterval(this.syncPollingInterval);
    }
    this.syncPollingInterval = setInterval(() => {
      this.processPendingSync();
    }, 30000);
    console.log('[PowersService] 🔄 Polling de sincronização iniciado (30s)');
  }

  private async processPendingSync(): Promise<void> {
    console.log('[PowersService] 🔄 === POLLING BIDIRECTIONAL SYNC ===');
    
    if (this.pendingSync.length > 0) {
      console.log('[PowersService] 🔄 Processando', this.pendingSync.length, 'transações pendentes...');
      
      const toProcess = [...this.pendingSync];
      this.pendingSync = [];
      this.savePendingSync();
      
      for (const item of toProcess) {
        const success = await this.syncSingleDeduction(item.amount, item.retryCount);
        if (!success && item.retryCount < SYNC_CONFIG.maxRetries) {
          this.pendingSync.push({
            ...item,
            retryCount: item.retryCount + 1,
          });
          console.log('[PowersService] ⚠️ Transação falhou, será retentada. TX:', item.id, 'Retry:', item.retryCount + 1);
        } else if (!success) {
          console.log('[PowersService] ❌ Transação excedeu máximo de retries e será descartada. TX:', item.id);
        }
      }
      
      this.savePendingSync();
    }
    
    console.log('[PowersService] 🔄 Iniciando sincronização DB → App (pull remoto)...');
    const powersFromDB = await this.fetchPowersFromDatabase();
    if (powersFromDB !== null) {
      const localBalance = this.balance.available;
      if (localBalance !== powersFromDB) {
        console.log('[PowersService] 🔄 Sincronizando: Local =', localBalance, '| DB =', powersFromDB);
        this.balance.available = powersFromDB;
        this.balance.used = Math.max(0, POWERS_CONFIG.dailyFreeAllowance - powersFromDB);
        this.persistBalance();
        this.emitUpdate();
        console.log('[PowersService] ✅ Saldo sincronizado do banco de dados');
      } else {
        console.log('[PowersService] ✅ Saldo já está sincronizado com banco de dados');
      }
    } else {
      console.log('[PowersService] ⚠️ Não foi possível buscar saldo do DB');
    }
    console.log('[PowersService] 🔄 === POLLING CONCLUÍDO ===');
  }

  private async syncSingleDeduction(amount: number, retryCount: number = 0): Promise<boolean> {
    const delay = Math.min(
      SYNC_CONFIG.baseDelayMs * Math.pow(2, retryCount),
      SYNC_CONFIG.maxDelayMs
    );
    
    if (retryCount > 0) {
      console.log(`[PowersService] ⏳ Aguardando ${delay}ms antes de retry #${retryCount}...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    try {
      const email = await this.getUserEmail();
      if (!email) {
        console.warn('[PowersService] ⚠️ Email não encontrado para sincronização');
        return false;
      }

      console.log(`[PowersService] 🔄 Enviando dedução de ${amount} Powers para o banco (retry: ${retryCount})...`);
      console.log('[PowersService] 📧 Email:', email);
      console.log('[PowersService] 📤 Payload:', JSON.stringify({ email, operation: 'deduct', amount }));

      const response = await fetch('/api/perfis/powers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          operation: 'deduct',
          amount,
        }),
      });

      console.log('[PowersService] 📥 Response status:', response.status);

      if (!response.ok) {
        console.error('[PowersService] ❌ Resposta HTTP não-ok:', response.status, response.statusText);
        return false;
      }

      const result = await response.json();
      console.log('[PowersService] 📥 Response body:', JSON.stringify(result));

      if (result.success) {
        console.log('[PowersService] ✅ SUCESSO! Powers deduzidos no banco. Novo saldo DB:', result.data?.powers_carteira);
        return true;
      } else {
        console.error('[PowersService] ❌ Falha na API:', result.error);
        return false;
      }
    } catch (error) {
      console.error('[PowersService] ❌ Erro de rede/fetch:', error);
      return false;
    }
  }

  private async getUserEmail(): Promise<string | null> {
    if (this.userEmail) {
      console.log('[PowersService] 📧 Email em cache de instância:', this.userEmail);
      return this.userEmail;
    }

    try {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user?.email) {
        this.userEmail = session.session.user.email;
        localStorage.setItem(STORAGE_KEYS.userEmail, this.userEmail);
        console.log('[PowersService] 📧 Email obtido da sessão Supabase:', this.userEmail);
        return this.userEmail;
      } else {
        console.log('[PowersService] ⚠️ Sessão Supabase não contém email');
      }
    } catch (error) {
      console.error('[PowersService] ❌ Erro ao obter email do usuário:', error);
    }

    const cachedEmail = localStorage.getItem(STORAGE_KEYS.userEmail);
    if (cachedEmail) {
      this.userEmail = cachedEmail;
      console.log('[PowersService] 📧 Email obtido do localStorage:', cachedEmail);
      return cachedEmail;
    }

    const profileEmail = localStorage.getItem('userProfileEmail');
    if (profileEmail) {
      this.userEmail = profileEmail;
      localStorage.setItem(STORAGE_KEYS.userEmail, profileEmail);
      console.log('[PowersService] 📧 Email obtido do perfil em cache:', profileEmail);
      return profileEmail;
    }

    console.warn('[PowersService] ⚠️ Email não encontrado em nenhuma fonte');
    return null;
  }

  async initialize(userId?: string): Promise<PowersBalance> {
    if (this.initialized) {
      return this.balance;
    }

    try {
      const storedBalance = localStorage.getItem(STORAGE_KEYS.balance);
      
      if (storedBalance) {
        try {
          this.balance = JSON.parse(storedBalance);
        } catch {
          this.balance = this.getDefaultBalance();
        }
      }

      const powersFromDB = await this.fetchPowersFromDatabase();
      
      if (powersFromDB !== null) {
        this.balance.available = powersFromDB;
        this.balance.used = Math.max(0, POWERS_CONFIG.dailyFreeAllowance - powersFromDB);
        this.persistBalance();
        console.log('[PowersService] ✅ Saldo carregado do banco de dados:', powersFromDB, '| Usado:', this.balance.used);
      } else if (!storedBalance) {
        this.balance = this.getDefaultBalance();
        this.persistBalance();
        console.log('[PowersService] ⚠️ Usando saldo padrão (banco não disponível)');
      }

      if (this.shouldRenewDaily()) {
        await this.renewDailyPowers();
      }

      this.initialized = true;
      console.log('[PowersService] ✅ Inicializado - Disponível:', this.balance.available, '| Usado:', this.balance.used);
      
      return this.balance;
    } catch (error) {
      console.error('[PowersService] ❌ Erro ao inicializar:', error);
      this.balance = this.getDefaultBalance();
      this.initialized = true;
      return this.balance;
    }
  }

  private async fetchPowersFromDatabase(): Promise<number | null> {
    try {
      const email = await this.getUserEmail();
      if (!email) {
        console.log('[PowersService] Email não encontrado, usando localStorage');
        return null;
      }

      const response = await fetch(`/api/perfis/powers?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        return result.data.powers_carteira ?? POWERS_CONFIG.dailyFreeAllowance;
      }

      return null;
    } catch (error) {
      console.error('[PowersService] Erro ao buscar powers do banco:', error);
      return null;
    }
  }

  private async deductPowersInDatabase(amount: number, transactionId: string): Promise<boolean> {
    console.log('[PowersService] 🔄 === INICIANDO SINCRONIZAÇÃO ENTERPRISE ===');
    console.log('[PowersService] 🔄 Dedução:', amount, 'Powers | TX:', transactionId);
    
    const success = await this.syncSingleDeduction(amount, 0);
    
    if (success) {
      console.log('[PowersService] ✅ === SINCRONIZAÇÃO CONCLUÍDA COM SUCESSO ===');
      return true;
    }
    
    console.log('[PowersService] ⚠️ Sincronização inicial falhou. Adicionando à fila de pendentes...');
    this.pendingSync.push({
      id: transactionId,
      amount,
      timestamp: new Date().toISOString(),
      retryCount: 1,
    });
    this.savePendingSync();
    console.log('[PowersService] 📋 Transação adicionada à fila. Total pendente:', this.pendingSync.length);
    
    return false;
  }

  private async resetPowersInDatabase(): Promise<boolean> {
    try {
      const email = await this.getUserEmail();
      
      if (!email) {
        console.log('[PowersService] Email não encontrado, salvando apenas localmente');
        return false;
      }

      const response = await fetch('/api/perfis/powers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          operation: 'reset',
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('[PowersService] Powers resetados no banco');
        return true;
      } else {
        console.error('[PowersService] Erro ao resetar no banco:', result.error);
        return false;
      }
    } catch (error) {
      console.error('[PowersService] Erro ao resetar no banco:', error);
      return false;
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
    
    await this.resetPowersInDatabase();
    
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
    
    console.log('[PowersService] 💰 === COBRANÇA INICIADA ===');
    console.log('[PowersService] 💰 Capacidade:', capabilityId);
    console.log('[PowersService] 💰 Custo total:', totalCost, 'Powers');
    console.log('[PowersService] 💰 Saldo após cobrança local:', this.balance.available);
    console.log('[PowersService] 💰 TX ID:', transaction.id);
    
    const dbSynced = await this.deductPowersInDatabase(totalCost, transaction.id);
    
    if (dbSynced) {
      transaction.syncedToDb = true;
      this.persistBalance();
      console.log('[PowersService] ✅ === COBRANÇA SINCRONIZADA COM BANCO ===');
    } else {
      console.log('[PowersService] ⚠️ Cobrança local OK, sincronização DB pendente');
    }

    this.emitUpdate();

    console.log(`[PowersService] 💰 Cobrado ${totalCost} Powers por ${capabilityId}. Saldo: ${this.balance.available} | DB Synced: ${dbSynced}`);

    return {
      success: true,
      charged: totalCost,
      remainingBalance: this.balance.available,
      transactionId: transaction.id,
      dbSynced,
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
    console.log('[PowersService] 📡 Emitindo eventos de atualização. Saldo:', this.balance.available);
    
    const event = new CustomEvent(POWERS_EVENT, {
      detail: {
        balance: this.balance,
        timestamp: new Date().toISOString(),
      },
    });
    window.dispatchEvent(event);
    
    document.dispatchEvent(new CustomEvent('schoolPointsUpdated', {
      detail: { points: this.balance.available }
    }));
    
    window.dispatchEvent(new CustomEvent('powers:balance:changed', {
      detail: { 
        available: this.balance.available,
        used: this.balance.used,
        timestamp: new Date().toISOString(),
      }
    }));
    
    console.log('[PowersService] ✅ Eventos emitidos: powers:updated, schoolPointsUpdated, powers:balance:changed');
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
    await this.resetPowersInDatabase();
    this.persistBalance();
    this.emitUpdate();
    console.log('[PowersService] Saldo resetado');
  }

  async syncWithDatabase(): Promise<void> {
    console.log('[PowersService] 🔄 Iniciando sincronização com banco de dados...');
    const powersFromDB = await this.fetchPowersFromDatabase();
    if (powersFromDB !== null) {
      this.balance.available = powersFromDB;
      this.balance.used = Math.max(0, POWERS_CONFIG.dailyFreeAllowance - powersFromDB);
      this.persistBalance();
      this.emitUpdate();
      console.log('[PowersService] ✅ Sincronizado - Disponível:', powersFromDB, '| Usado:', this.balance.used);
    } else {
      console.warn('[PowersService] ⚠️ Não foi possível sincronizar com banco de dados');
    }
  }

  async forceRefreshFromDatabase(): Promise<PowersBalance> {
    console.log('[PowersService] 🔄 Forçando atualização do banco de dados...');
    const powersFromDB = await this.fetchPowersFromDatabase();
    if (powersFromDB !== null) {
      this.balance.available = powersFromDB;
      this.balance.used = Math.max(0, POWERS_CONFIG.dailyFreeAllowance - powersFromDB);
      this.persistBalance();
      this.emitUpdate();
      console.log('[PowersService] ✅ Atualizado do banco - Disponível:', powersFromDB, '| Usado:', this.balance.used);
    }
    return this.balance;
  }

  formatBalance(): string {
    return `${this.balance.available}/${this.balance.dailyLimit}`;
  }
}

export const powersService = new PowersService();
export default powersService;
