type ContentListener = (activityId: string, tipo: string, data: Record<string, any>) => void;

const CONTENT_INDICATORS = ['questoes', 'questions', 'cards', 'etapas', 'sections', 'perguntas'];

class ContentSyncServiceImpl {
  private contentMap = new Map<string, Record<string, any>>();
  private listeners = new Set<ContentListener>();
  private typeMap = new Map<string, string>();

  private makeKey(activityId: string, tipo?: string): string {
    return tipo ? `${tipo}::${activityId}` : activityId;
  }

  setContent(activityId: string, tipo: string, data: Record<string, any>): void {
    if (!activityId || !data) return;

    const key = this.makeKey(activityId, tipo);
    const existing = this.contentMap.get(key);

    const newHasArrays = CONTENT_INDICATORS.some(k => Array.isArray(data[k]) && data[k].length > 0);
    const existingHasArrays = existing
      ? CONTENT_INDICATORS.some(k => Array.isArray(existing[k]) && existing[k].length > 0)
      : false;

    if (existingHasArrays && !newHasArrays) {
      console.log(`🔒 [ContentSync] Bloqueando sobrescrita de ${key} — existente tem arrays, novo não`);
      return;
    }

    this.contentMap.set(key, { ...data });
    this.typeMap.set(activityId, tipo);

    const keyById = this.makeKey(activityId);
    if (keyById !== key) {
      if (!this.contentMap.has(keyById) || newHasArrays) {
        this.contentMap.set(keyById, { ...data });
      }
    }

    console.log(`📡 [ContentSync] Conteúdo armazenado: ${key} (${Object.keys(data).length} campos)`);

    if (newHasArrays) {
      this.persistToLocalStorage(activityId, tipo, data);
    }

    for (const listener of this.listeners) {
      try {
        listener(activityId, tipo, data);
      } catch (e) {
        console.warn('⚠️ [ContentSync] Erro em listener:', e);
      }
    }

    try {
      window.dispatchEvent(new CustomEvent('content-sync-update', {
        detail: { activityId, tipo, data, timestamp: Date.now() }
      }));
    } catch {}
  }

  private persistToLocalStorage(activityId: string, tipo: string, data: Record<string, any>): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;

    try {
      const { writeActivityContent } = require('./activity-storage-contract');
      writeActivityContent(activityId, tipo, data);
    } catch (e) {
      console.warn('⚠️ [ContentSync→LS] Erro ao persistir:', e);
    }
  }

  getContent(activityId: string, tipo?: string): Record<string, any> | null {
    if (!activityId) return null;

    if (tipo) {
      const byKey = this.contentMap.get(this.makeKey(activityId, tipo));
      if (byKey) return { ...byKey };
    }

    const byId = this.contentMap.get(this.makeKey(activityId));
    if (byId) return { ...byId };

    const storedTipo = this.typeMap.get(activityId);
    if (storedTipo && storedTipo !== tipo) {
      const byStoredType = this.contentMap.get(this.makeKey(activityId, storedTipo));
      if (byStoredType) return { ...byStoredType };
    }

    return null;
  }

  hasContent(activityId: string, tipo?: string): boolean {
    return this.getContent(activityId, tipo) !== null;
  }

  hasRealContent(activityId: string, tipo?: string): boolean {
    const data = this.getContent(activityId, tipo);
    if (!data) return false;
    return CONTENT_INDICATORS.some(k => Array.isArray(data[k]) && data[k].length > 0);
  }

  subscribe(listener: ContentListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getStoredType(activityId: string): string | undefined {
    return this.typeMap.get(activityId);
  }

  clear(): void {
    this.contentMap.clear();
    this.typeMap.clear();
    this.listeners.clear();
  }
}

export const ContentSyncService = new ContentSyncServiceImpl();
