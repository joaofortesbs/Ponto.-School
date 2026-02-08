const API_BASE = '';

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const authToken = localStorage.getItem('auth_token');
    const userId = localStorage.getItem('userId');
    if (authToken) {
      headers['x-auth-token'] = authToken;
    } else if (userId) {
      headers['x-auth-token'] = userId;
    }
  } catch {
  }
  return headers;
}

export interface MemoryItem {
  id?: number;
  user_id: string;
  session_id: string;
  memory_type: 'working' | 'short_term' | 'long_term' | 'preference';
  category: string;
  content: string;
  metadata: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  expires_at?: string | null;
}

export interface SessionRecord {
  id?: number;
  session_id: string;
  user_id: string;
  started_at?: string;
  last_activity?: string;
  status: 'active' | 'completed' | 'expired';
  summary?: string;
  capabilities_used: string[];
  activities_created: string[];
  metadata: Record<string, any>;
}

export interface PersistentMemoryConfig {
  maxWorkingMemory: number;
  maxShortTermMemory: number;
  shortTermTTLMs: number;
  longTermEnabled: boolean;
}

const DEFAULT_CONFIG: PersistentMemoryConfig = {
  maxWorkingMemory: 20,
  maxShortTermMemory: 50,
  shortTermTTLMs: 24 * 60 * 60 * 1000,
  longTermEnabled: true,
};

export class PersistentMemory {
  private userId: string;
  private sessionId: string;
  private config: PersistentMemoryConfig;
  private localCache: Map<string, MemoryItem[]> = new Map();
  private initialized: boolean = false;
  private dbAvailable: boolean = false;

  constructor(userId: string, sessionId: string, config: Partial<PersistentMemoryConfig> = {}) {
    this.userId = userId;
    this.sessionId = sessionId;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.ensureTablesExist();
      await this.registerSession();
      this.dbAvailable = true;
      this.initialized = true;
      console.log('✅ [PersistentMemory] Inicializada com PostgreSQL para sessão:', this.sessionId);
    } catch (error) {
      console.warn('⚠️ [PersistentMemory] DB indisponível, usando cache local:', error);
      this.dbAvailable = false;
      this.initialized = true;
      this.loadFromLocalStorage();
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const key = `agent_memory_${this.userId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, MemoryItem[]>;
        for (const [type, items] of Object.entries(parsed)) {
          this.localCache.set(type, items);
        }
        console.log('📦 [PersistentMemory] Cache local carregado');
      }
    } catch {
      console.warn('⚠️ [PersistentMemory] Falha ao carregar localStorage');
    }
  }

  private persistToLocalStorage(): void {
    try {
      const key = `agent_memory_${this.userId}`;
      const data: Record<string, MemoryItem[]> = {};
      for (const [type, items] of this.localCache.entries()) {
        data[type] = items;
      }
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
    }
  }

  private async ensureTablesExist(): Promise<void> {
    try {
      await fetch(`${API_BASE}/api/agent-memory/init`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId: this.userId }),
      });
    } catch (error) {
      console.warn('⚠️ [PersistentMemory] API não disponível para inicialização:', error);
    }
  }

  private async registerSession(): Promise<void> {
    try {
      await fetch(`${API_BASE}/api/agent-memory/sessions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          session_id: this.sessionId,
          user_id: this.userId,
          status: 'active',
          capabilities_used: [],
          activities_created: [],
          metadata: {},
        }),
      });
    } catch (error) {
      console.warn('⚠️ [PersistentMemory] Falha ao registrar sessão:', error);
    }
  }

  async saveMemory(item: Omit<MemoryItem, 'id' | 'user_id' | 'session_id' | 'created_at' | 'updated_at'>): Promise<MemoryItem> {
    const fullItem: MemoryItem = {
      ...item,
      user_id: this.userId,
      session_id: this.sessionId,
    };

    this.addToLocalCache(fullItem);

    try {
      const response = await fetch(`${API_BASE}/api/agent-memory/items`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(fullItem),
      });

      if (response.ok) {
        const saved = await response.json();
        return saved;
      }
    } catch (error) {
      console.warn('⚠️ [PersistentMemory] Falha ao salvar no DB:', error);
    }

    return fullItem;
  }

  async saveWorkingMemory(category: string, content: string, metadata: Record<string, any> = {}): Promise<void> {
    await this.saveMemory({
      memory_type: 'working',
      category,
      content,
      metadata,
    });
  }

  async savePreference(key: string, value: string, metadata: Record<string, any> = {}): Promise<void> {
    await this.saveMemory({
      memory_type: 'preference',
      category: key,
      content: value,
      metadata,
      expires_at: null,
    });
  }

  async getPreferences(): Promise<MemoryItem[]> {
    try {
      const response = await fetch(
        `${API_BASE}/api/agent-memory/items?memory_type=preference`,
        { headers: getAuthHeaders() }
      );

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('⚠️ [PersistentMemory] Falha ao buscar preferências:', error);
    }

    return this.getFromLocalCache('preference');
  }

  async getRecentSessions(limit: number = 5): Promise<SessionRecord[]> {
    try {
      const response = await fetch(
        `${API_BASE}/api/agent-memory/sessions?limit=${limit}`,
        { headers: getAuthHeaders() }
      );

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('⚠️ [PersistentMemory] Falha ao buscar sessões:', error);
    }

    return [];
  }

  async getMemoryContext(): Promise<string> {
    const preferences = await this.getPreferences();
    const recentSessions = await this.getRecentSessions(3);

    const parts: string[] = [];

    if (preferences.length > 0) {
      parts.push('PREFERÊNCIAS DO PROFESSOR:');
      for (const pref of preferences) {
        parts.push(`- ${pref.category}: ${pref.content}`);
      }
    }

    if (recentSessions.length > 0) {
      parts.push('\nSESSÕES RECENTES:');
      for (const session of recentSessions) {
        const activities = session.activities_created.join(', ') || 'Nenhuma';
        parts.push(`- ${session.started_at}: ${session.summary || 'Sem resumo'} (Atividades: ${activities})`);
      }
    }

    return parts.join('\n');
  }

  async updateSessionSummary(summary: string, capabilitiesUsed: string[], activitiesCreated: string[]): Promise<void> {
    try {
      await fetch(`${API_BASE}/api/agent-memory/sessions/${this.sessionId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          summary,
          capabilities_used: capabilitiesUsed,
          activities_created: activitiesCreated,
          status: 'completed',
          last_activity: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.warn('⚠️ [PersistentMemory] Falha ao atualizar sessão:', error);
    }
  }

  async learnFromInteraction(userPrompt: string, result: any): Promise<void> {
    if (!this.config.longTermEnabled) return;

    const patterns: Record<string, string> = {};

    const disciplinaMatch = userPrompt.match(/(matem[aá]tica|portugu[eê]s|ci[eê]ncias|hist[oó]ria|geografia|ingl[eê]s|artes|educa[çc][aã]o f[ií]sica)/i);
    if (disciplinaMatch) {
      patterns['disciplina_frequente'] = disciplinaMatch[1].toLowerCase();
    }

    const serieMatch = userPrompt.match(/(\d+)[º°]?\s*(ano|s[eé]rie)/i);
    if (serieMatch) {
      patterns['serie_frequente'] = `${serieMatch[1]}º ${serieMatch[2]}`;
    }

    for (const [key, value] of Object.entries(patterns)) {
      await this.savePreference(key, value, {
        source: 'auto_learn',
        prompt: userPrompt.substring(0, 200),
        learned_at: Date.now(),
      });
    }
  }

  private addToLocalCache(item: MemoryItem): void {
    const key = item.memory_type;
    if (!this.localCache.has(key)) {
      this.localCache.set(key, []);
    }

    const items = this.localCache.get(key)!;
    items.push(item);

    const max = key === 'working' ? this.config.maxWorkingMemory : this.config.maxShortTermMemory;
    if (items.length > max) {
      this.localCache.set(key, items.slice(-max));
    }

    if (!this.dbAvailable) {
      this.persistToLocalStorage();
    }
  }

  private getFromLocalCache(type: string): MemoryItem[] {
    return this.localCache.get(type) || [];
  }

  formatForPrompt(): string {
    const parts: string[] = [];

    const working = this.getFromLocalCache('working');
    if (working.length > 0) {
      parts.push('MEMÓRIA DE TRABALHO:');
      for (const item of working.slice(-5)) {
        parts.push(`- [${item.category}] ${item.content}`);
      }
    }

    return parts.join('\n');
  }
}
