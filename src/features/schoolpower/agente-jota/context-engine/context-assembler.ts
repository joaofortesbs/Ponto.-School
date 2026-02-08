/**
 * CONTEXT ASSEMBLER - Montador de Contexto por Tipo de Chamada
 * 
 * Inspirado na arquitetura do Manus AI:
 * - Camada 1: Contexto Estático (identidade, regras, capabilities)
 * - Camada 2: Contexto da Sessão (histórico compactado, goal recitation)
 * - Camada 3: Contexto Dinâmico (dados específicos da chamada)
 * 
 * Cada tipo de chamada recebe um "pacote de contexto" otimizado,
 * com o goal original SEMPRE nos tokens recentes (Manus-style).
 */

import { ConversationCompactor, type ConversationTurn } from './conversation-compactor';
import { GoalReciter } from './goal-reciter';

export type CallType = 
  | 'planner'
  | 'initial_response'
  | 'interpretation'
  | 'mente_maior'
  | 'capability'
  | 'final_response'
  | 'follow_up';

export interface SessionContext {
  sessionId: string;
  userId: string;
  originalGoal: string;
  conversationHistory: ConversationTurn[];
  currentPlan?: {
    planId: string;
    objetivo: string;
    totalEtapas: number;
    etapasCompletas: number;
    etapas: Array<{
      ordem: number;
      titulo: string;
      descricao: string;
      status: 'pendente' | 'em_execucao' | 'concluida' | 'erro';
      capabilities: string[];
    }>;
  };
  stepResults: Array<{
    stepIndex: number;
    stepTitle: string;
    capabilityResults: Array<{
      name: string;
      displayName: string;
      success: boolean;
      summary: string;
      metrics?: Record<string, number | string>;
      discoveries?: string[];
      decisions?: string[];
    }>;
    narrativeGenerated?: string;
    timestamp: number;
  }>;
  activitiesCreated: string[];
  previousInteractions: Array<{
    userInput: string;
    summary: string;
    timestamp: number;
  }>;
}

const MAX_CONTEXT_CHARS: Record<CallType, number> = {
  planner: 6000,
  initial_response: 2000,
  interpretation: 1500,
  mente_maior: 8000,
  capability: 4000,
  final_response: 6000,
  follow_up: 5000,
};

export class ContextAssembler {
  private compactor: ConversationCompactor;
  private goalReciter: GoalReciter;

  constructor() {
    this.compactor = new ConversationCompactor();
    this.goalReciter = new GoalReciter();
  }

  assemble(callType: CallType, session: SessionContext, dynamicContext?: Record<string, any>): string {
    const maxChars = MAX_CONTEXT_CHARS[callType];
    
    const layers: string[] = [];

    const layer2 = this.buildSessionLayer(callType, session, maxChars);
    if (layer2) layers.push(layer2);

    if (dynamicContext) {
      const layer3 = this.buildDynamicLayer(callType, dynamicContext, maxChars - layers.join('').length);
      if (layer3) layers.push(layer3);
    }

    const goalBlock = this.goalReciter.recite(session.originalGoal, callType);
    layers.push(goalBlock);

    return layers.join('\n\n');
  }

  private buildSessionLayer(callType: CallType, session: SessionContext, budget: number): string {
    const parts: string[] = [];

    if (session.previousInteractions.length > 0 && callType !== 'interpretation') {
      const historyBudget = Math.floor(budget * 0.3);
      const compacted = this.compactor.compact(
        session.conversationHistory,
        historyBudget,
        callType === 'mente_maior' ? 3 : 2
      );
      if (compacted) {
        parts.push(`HISTÓRICO DA CONVERSA:\n${compacted}`);
      }
    }

    if (session.currentPlan && ['mente_maior', 'final_response', 'follow_up'].includes(callType)) {
      const planSummary = this.buildPlanSummary(session);
      parts.push(planSummary);
    }

    if (session.stepResults.length > 0 && ['mente_maior', 'final_response', 'capability'].includes(callType)) {
      const resultsBudget = Math.floor(budget * 0.4);
      const resultsText = this.buildStepResultsSummary(session, callType, resultsBudget);
      if (resultsText) {
        parts.push(resultsText);
      }
    }

    if (session.activitiesCreated.length > 0) {
      parts.push(`ATIVIDADES JÁ CRIADAS NESTA SESSÃO:\n${session.activitiesCreated.map(a => `- ${a}`).join('\n')}`);
    }

    return parts.join('\n\n');
  }

  private buildPlanSummary(session: SessionContext): string {
    const plan = session.currentPlan!;
    const lines = [
      `PLANO ATUAL:`,
      `Objetivo: ${plan.objetivo}`,
      `Progresso: ${plan.etapasCompletas}/${plan.totalEtapas} etapas`,
    ];

    for (const etapa of plan.etapas) {
      const statusIcon = etapa.status === 'concluida' ? '✓' : etapa.status === 'em_execucao' ? '→' : etapa.status === 'erro' ? '✗' : '○';
      lines.push(`  ${statusIcon} Etapa ${etapa.ordem}: ${etapa.titulo}`);
    }

    return lines.join('\n');
  }

  private buildStepResultsSummary(session: SessionContext, callType: CallType, budget: number): string {
    const results = session.stepResults;
    if (results.length === 0) return '';

    const recentCount = callType === 'mente_maior' ? results.length : Math.min(results.length, 3);
    const recentResults = results.slice(-recentCount);
    const olderResults = results.slice(0, results.length - recentCount);

    const parts: string[] = ['RESULTADOS DAS ETAPAS:'];

    if (olderResults.length > 0) {
      const olderSummary = olderResults.map(r => {
        const capNames = r.capabilityResults.map(c => c.displayName).join(', ');
        return `  Etapa ${r.stepIndex}: ${r.stepTitle} → ${capNames} [concluída]`;
      }).join('\n');
      parts.push(`Etapas anteriores (resumo):\n${olderSummary}`);
    }

    for (const result of recentResults) {
      const detailLines = [`  Etapa ${result.stepIndex}: ${result.stepTitle}`];
      
      for (const cap of result.capabilityResults) {
        detailLines.push(`    - ${cap.displayName}: ${cap.success ? 'Sucesso' : 'Erro'}`);
        if (cap.summary) {
          detailLines.push(`      ${cap.summary.substring(0, 200)}`);
        }
        if (cap.discoveries && cap.discoveries.length > 0) {
          detailLines.push(`      Descobertas: ${cap.discoveries.slice(0, 3).join('; ')}`);
        }
        if (cap.decisions && cap.decisions.length > 0) {
          detailLines.push(`      Decisões: ${cap.decisions.slice(0, 2).join('; ')}`);
        }
      }
      
      if (result.narrativeGenerated) {
        detailLines.push(`    Narrativa: "${result.narrativeGenerated}"`);
      }
      
      parts.push(detailLines.join('\n'));
    }

    let text = parts.join('\n\n');
    if (text.length > budget) {
      text = text.substring(0, budget - 50) + '\n[...resultados anteriores compactados]';
    }
    return text;
  }

  private buildDynamicLayer(callType: CallType, dynamic: Record<string, any>, budget: number): string {
    const parts: string[] = [];

    for (const [key, value] of Object.entries(dynamic)) {
      if (value === undefined || value === null) continue;
      
      let text: string;
      if (typeof value === 'string') {
        text = `${key.toUpperCase()}:\n${value}`;
      } else if (Array.isArray(value)) {
        text = `${key.toUpperCase()}:\n${value.map(v => typeof v === 'string' ? `- ${v}` : `- ${JSON.stringify(v)}`).join('\n')}`;
      } else if (typeof value === 'object') {
        text = `${key.toUpperCase()}:\n${JSON.stringify(value, null, 2)}`;
      } else {
        text = `${key.toUpperCase()}: ${String(value)}`;
      }
      
      parts.push(text);
    }

    let result = parts.join('\n\n');
    if (result.length > budget) {
      result = result.substring(0, budget - 50) + '\n[...dados dinâmicos truncados]';
    }
    return result;
  }
}

export const contextAssembler = new ContextAssembler();
