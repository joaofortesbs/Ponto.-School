/**
 * DEBUG STORE - Gerenciamento de logs de debug narrativo
 * 
 * Armazena e gerencia logs de debug gerados pela IA durante execução
 */

import { create } from 'zustand';
import type { AIDebugEntry, CapabilityDebugLog, DebugEntryType, DebugSeverity } from './types';

interface DebugStoreState {
  sessionId: string | null;
  logs: Record<string, CapabilityDebugLog>;
  
  initSession: (sessionId: string) => void;
  addEntry: (capabilityId: string, capabilityName: string, entry: {
    entry_type: DebugEntryType;
    narrative: string;
    severity: DebugSeverity;
    technical_data?: Record<string, any>;
  }) => void;
  startCapability: (capabilityId: string, capabilityName: string) => void;
  endCapability: (capabilityId: string) => void;
  getEntriesForCapability: (capabilityId: string) => AIDebugEntry[];
  getAllEntries: () => AIDebugEntry[];
  getCapabilityLog: (capabilityId: string) => CapabilityDebugLog | null;
  exportAsMarkdown: () => string;
  clearSession: () => void;
}

export const useDebugStore = create<DebugStoreState>((set, get) => ({
  sessionId: null,
  logs: {},

  initSession: (sessionId) => {
    set({ sessionId, logs: {} });
  },

  addEntry: (capabilityId, capabilityName, entry) => {
    const state = get();
    const newEntry: AIDebugEntry = {
      id: `debug_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: new Date().toISOString(),
      capability_id: capabilityId,
      ...entry
    };

    set((prev) => {
      const existingLog = prev.logs[capabilityId];
      
      if (existingLog) {
        return {
          logs: {
            ...prev.logs,
            [capabilityId]: {
              ...existingLog,
              entries: [...existingLog.entries, newEntry]
            }
          }
        };
      }

      return {
        logs: {
          ...prev.logs,
          [capabilityId]: {
            capability_id: capabilityId,
            capability_name: capabilityName,
            entries: [newEntry],
            startedAt: Date.now()
          }
        }
      };
    });
  },

  startCapability: (capabilityId, capabilityName) => {
    set((prev) => ({
      logs: {
        ...prev.logs,
        [capabilityId]: {
          capability_id: capabilityId,
          capability_name: capabilityName,
          entries: [],
          startedAt: Date.now()
        }
      }
    }));
  },

  endCapability: (capabilityId) => {
    set((prev) => {
      const existingLog = prev.logs[capabilityId];
      if (!existingLog) return prev;

      return {
        logs: {
          ...prev.logs,
          [capabilityId]: {
            ...existingLog,
            completedAt: Date.now()
          }
        }
      };
    });
  },

  getEntriesForCapability: (capabilityId) => {
    const state = get();
    return state.logs[capabilityId]?.entries || [];
  },

  getAllEntries: () => {
    const state = get();
    const allEntries: AIDebugEntry[] = [];
    
    Object.values(state.logs).forEach(log => {
      allEntries.push(...log.entries);
    });

    return allEntries.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  },

  getCapabilityLog: (capabilityId) => {
    const state = get();
    return state.logs[capabilityId] || null;
  },

  exportAsMarkdown: () => {
    const state = get();
    let markdown = `# Debug de Execução\n\n`;
    markdown += `**Sessão:** ${state.sessionId}\n`;
    markdown += `**Exportado em:** ${new Date().toLocaleString('pt-BR')}\n\n`;
    markdown += `---\n\n`;

    Object.values(state.logs).forEach(log => {
      markdown += `## ${log.capability_name}\n\n`;
      
      log.entries.forEach(entry => {
        const time = new Date(entry.timestamp).toLocaleTimeString('pt-BR');
        const typeEmoji = getTypeEmoji(entry.entry_type);
        
        markdown += `### ${typeEmoji} ${time} - ${entry.entry_type.toUpperCase()}\n\n`;
        markdown += `${entry.narrative}\n\n`;
        
        if (entry.technical_data) {
          markdown += `<details>\n<summary>Dados Técnicos</summary>\n\n`;
          markdown += `\`\`\`json\n${JSON.stringify(entry.technical_data, null, 2)}\n\`\`\`\n\n`;
          markdown += `</details>\n\n`;
        }
      });

      markdown += `---\n\n`;
    });

    return markdown;
  },

  clearSession: () => {
    set({ sessionId: null, logs: {} });
  }
}));

function getTypeEmoji(type: DebugEntryType): string {
  const emojis: Record<DebugEntryType, string> = {
    info: 'ℹ️',
    action: '🔵',
    decision: '🟡',
    discovery: '🟢',
    error: '🔴',
    warning: '🟠',
    reflection: '🧠'
  };
  return emojis[type] || '📝';
}

export function createDebugEntry(
  capabilityId: string,
  capabilityName: string,
  type: DebugEntryType,
  narrative: string,
  severity: DebugSeverity = 'low',
  technicalData?: Record<string, any>
) {
  useDebugStore.getState().addEntry(capabilityId, capabilityName, {
    entry_type: type,
    narrative,
    severity,
    technical_data: technicalData
  });
}
