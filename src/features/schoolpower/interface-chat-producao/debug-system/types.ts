/**
 * TIPOS DO SISTEMA DE DEBUG NARRATIVO
 * 
 * Sistema onde a IA explica suas próprias ações em linguagem humana
 */

export type DebugEntryType = 'info' | 'action' | 'decision' | 'discovery' | 'error' | 'warning' | 'reflection';
export type DebugSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AIDebugEntry {
  id: string;
  timestamp: string;
  capability_id: string;
  entry_type: DebugEntryType;
  narrative: string;
  technical_data?: Record<string, any>;
  severity: DebugSeverity;
}

export interface CapabilityDebugLog {
  capability_id: string;
  capability_name: string;
  entries: AIDebugEntry[];
  startedAt: number;
  completedAt?: number;
}

export interface SessionDebugStore {
  sessionId: string;
  logs: Map<string, CapabilityDebugLog>;
  addEntry: (capabilityId: string, entry: Omit<AIDebugEntry, 'id' | 'timestamp'>) => void;
  getEntriesForCapability: (capabilityId: string) => AIDebugEntry[];
  getAllEntries: () => AIDebugEntry[];
  exportAsMarkdown: () => string;
  clear: () => void;
}

export const ENTRY_TYPE_ICONS: Record<DebugEntryType, { icon: string; color: string; label: string }> = {
  info: { icon: 'ℹ️', color: 'blue', label: 'Informação' },
  action: { icon: '🔵', color: 'blue', label: 'Ação' },
  decision: { icon: '🟡', color: 'yellow', label: 'Decisão' },
  discovery: { icon: '🟢', color: 'green', label: 'Descoberta' },
  error: { icon: '🔴', color: 'red', label: 'Erro' },
  warning: { icon: '🟠', color: 'orange', label: 'Aviso' },
  reflection: { icon: '🧠', color: 'purple', label: 'Reflexão' }
};

export const SEVERITY_STYLES: Record<DebugSeverity, { bg: string; border: string; text: string }> = {
  low: { bg: 'bg-gray-500/10', border: 'border-gray-500/20', text: 'text-gray-400' },
  medium: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
  high: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400' },
  critical: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400' }
};
