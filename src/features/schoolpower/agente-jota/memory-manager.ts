/**
 * MEMORY MANAGER - Gerenciador de Memória do Agente Jota
 * 
 * Gerencia 3 camadas de memória:
 * 1. Working Memory (sessão atual)
 * 2. Short-term Memory (últimas interações)
 * 3. Long-term Memory (persistente)
 */

import type { WorkingMemoryItem, ExecutionPlan } from '../interface-chat-producao/types';

const STORAGE_PREFIX = 'agente_jota_';
const SESSION_EXPIRY = 60 * 60 * 1000;

// ============================================================================
// OTIMIZAÇÃO DE CONTEXT WINDOW - Performance Engineering
// ============================================================================
const CONTEXT_LIMITS = {
  MAX_SHORT_TERM_ITEMS: 10,
  MAX_WORKING_MEMORY_ITEMS: 20,
  MAX_CONTEXT_CHARS: 8000,
  MAX_PLANS_IN_CONTEXT: 2,
  MAX_DISCOVERIES: 5,
  MAX_ACTIONS: 5,
};

export interface MemoryState {
  sessionId: string;
  userId: string;
  workingMemory: WorkingMemoryItem[];
  shortTermMemory: ShortTermItem[];
  plans: ExecutionPlan[];
  createdAt: number;
  updatedAt: number;
}

export interface ShortTermItem {
  id: string;
  type: 'interaction' | 'result' | 'preference';
  content: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

export function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export class MemoryManager {
  private sessionId: string;
  private userId: string;
  private state: MemoryState;

  constructor(sessionId: string, userId: string) {
    this.sessionId = sessionId;
    this.userId = userId;
    this.state = this.loadOrCreateState();
  }

  private getStorageKey(): string {
    return `${STORAGE_PREFIX}${this.sessionId}`;
  }

  private loadOrCreateState(): MemoryState {
    try {
      const stored = localStorage.getItem(this.getStorageKey());
      if (stored) {
        const parsed = JSON.parse(stored) as MemoryState;
        if (Date.now() - parsed.createdAt < SESSION_EXPIRY) {
          console.log('📥 [MemoryManager] Estado carregado da sessão:', this.sessionId);
          return parsed;
        }
        console.log('⏰ [MemoryManager] Sessão expirada, criando nova');
        localStorage.removeItem(this.getStorageKey());
      }
    } catch (error) {
      console.error('❌ [MemoryManager] Erro ao carregar estado:', error);
    }

    return {
      sessionId: this.sessionId,
      userId: this.userId,
      workingMemory: [],
      shortTermMemory: [],
      plans: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  private saveState(): void {
    try {
      this.state.updatedAt = Date.now();
      localStorage.setItem(this.getStorageKey(), JSON.stringify(this.state));
      console.log('💾 [MemoryManager] Estado salvo');
    } catch (error) {
      console.error('❌ [MemoryManager] Erro ao salvar estado:', error);
    }
  }

  async saveToWorkingMemory(item: Omit<WorkingMemoryItem, 'id' | 'timestamp'>): Promise<WorkingMemoryItem> {
    const newItem: WorkingMemoryItem = {
      ...item,
      id: `wm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    this.state.workingMemory.push(newItem);
    this.saveState();

    console.log('🧠 [MemoryManager] Item adicionado à memória de trabalho:', newItem.tipo);
    return newItem;
  }

  async getWorkingMemory(): Promise<WorkingMemoryItem[]> {
    return this.state.workingMemory;
  }

  async clearWorkingMemory(): Promise<void> {
    this.state.workingMemory = [];
    this.saveState();
    console.log('🧹 [MemoryManager] Memória de trabalho limpa');
  }

  async addToShortTermMemory(item: Omit<ShortTermItem, 'id' | 'timestamp'>): Promise<ShortTermItem> {
    const newItem: ShortTermItem = {
      ...item,
      id: `stm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    this.state.shortTermMemory.push(newItem);

    if (this.state.shortTermMemory.length > CONTEXT_LIMITS.MAX_SHORT_TERM_ITEMS) {
      this.state.shortTermMemory = this.state.shortTermMemory.slice(-CONTEXT_LIMITS.MAX_SHORT_TERM_ITEMS);
    }

    this.saveState();
    return newItem;
  }

  async getShortTermMemory(): Promise<ShortTermItem[]> {
    return this.state.shortTermMemory;
  }

  async savePlan(plan: ExecutionPlan): Promise<void> {
    const existingIndex = this.state.plans.findIndex(p => p.planId === plan.planId);
    if (existingIndex >= 0) {
      this.state.plans[existingIndex] = plan;
    } else {
      this.state.plans.push(plan);
    }
    this.saveState();
    console.log('📋 [MemoryManager] Plano salvo:', plan.planId);
  }

  async getPlan(planId: string): Promise<ExecutionPlan | null> {
    return this.state.plans.find(p => p.planId === planId) || null;
  }

  async getFullContext(): Promise<{
    workingMemory: WorkingMemoryItem[];
    shortTermMemory: ShortTermItem[];
    recentPlans: ExecutionPlan[];
  }> {
    return {
      workingMemory: this.state.workingMemory,
      shortTermMemory: this.state.shortTermMemory.slice(-10),
      recentPlans: this.state.plans.slice(-3),
    };
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  formatContextForPrompt(): string {
    const objectives = this.state.workingMemory
      .filter(item => item.tipo === 'objetivo')
      .slice(-3)
      .map(item => `- ${this.truncateText(item.conteudo, 200)}`)
      .join('\n');

    const discoveries = this.state.workingMemory
      .filter(item => item.tipo === 'descoberta')
      .slice(-CONTEXT_LIMITS.MAX_DISCOVERIES)
      .map(item => `- ${this.truncateText(item.conteudo, 150)}`)
      .join('\n');

    const actions = this.state.workingMemory
      .filter(item => item.tipo === 'acao')
      .slice(-CONTEXT_LIMITS.MAX_ACTIONS)
      .map(item => `- ${this.truncateText(item.conteudo, 150)}`)
      .join('\n');

    let context = `
OBJETIVOS ATUAIS:
${objectives || 'Nenhum objetivo definido'}

DESCOBERTAS RECENTES:
${discoveries || 'Nenhuma descoberta ainda'}

AÇÕES REALIZADAS:
${actions || 'Nenhuma ação realizada'}
    `.trim();

    if (context.length > CONTEXT_LIMITS.MAX_CONTEXT_CHARS) {
      context = context.substring(0, CONTEXT_LIMITS.MAX_CONTEXT_CHARS - 50) + '\n[...contexto truncado para otimização]';
    }

    return context;
  }

  async clearSession(): Promise<void> {
    localStorage.removeItem(this.getStorageKey());
    this.state = {
      sessionId: this.sessionId,
      userId: this.userId,
      workingMemory: [],
      shortTermMemory: [],
      plans: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    console.log('🧹 [MemoryManager] Sessão limpa');
  }
}

export function createMemoryManager(sessionId: string, userId: string): MemoryManager {
  return new MemoryManager(sessionId, userId);
}

export default MemoryManager;
