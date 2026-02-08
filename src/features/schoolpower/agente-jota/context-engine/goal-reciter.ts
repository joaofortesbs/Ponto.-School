/**
 * GOAL RECITER - Recitação do Objetivo Original
 * 
 * Inspirado no Manus AI "todo.md recitation":
 * O objetivo original do professor é SEMPRE incluído nos tokens
 * mais recentes de cada chamada de IA, garantindo que o modelo
 * nunca "esqueça" o que está tentando fazer.
 * 
 * Isso previne context drift em execuções longas com muitas etapas.
 */

import type { CallType } from './context-assembler';

export class GoalReciter {
  recite(originalGoal: string, callType: CallType): string {
    if (!originalGoal || originalGoal.trim().length === 0) {
      return '';
    }

    switch (callType) {
      case 'planner':
        return this.reciteForPlanner(originalGoal);
      case 'mente_maior':
        return this.reciteForMenteMaior(originalGoal);
      case 'capability':
        return this.reciteForCapability(originalGoal);
      case 'final_response':
        return this.reciteForFinalResponse(originalGoal);
      case 'follow_up':
        return this.reciteForFollowUp(originalGoal);
      default:
        return this.reciteDefault(originalGoal);
    }
  }

  private reciteForPlanner(goal: string): string {
    return `═══════════════════════════════════════
PEDIDO ORIGINAL DO PROFESSOR (não esqueça):
"${goal}"
═══════════════════════════════════════`;
  }

  private reciteForMenteMaior(goal: string): string {
    return `═══════════════════════════════════════
🎯 LEMBRE-SE: O PROFESSOR PEDIU:
"${goal}"
Todas as suas decisões devem servir a este objetivo.
═══════════════════════════════════════`;
  }

  private reciteForCapability(goal: string): string {
    return `OBJETIVO DO PROFESSOR: "${goal}"`;
  }

  private reciteForFinalResponse(goal: string): string {
    return `═══════════════════════════════════════
PEDIDO ORIGINAL QUE VOCÊ DEVE RESPONDER:
"${goal}"
Sua resposta final deve conectar diretamente com este pedido.
═══════════════════════════════════════`;
  }

  private reciteForFollowUp(goal: string): string {
    return `CONTEXTO: O professor anteriormente pediu: "${goal}"`;
  }

  private reciteDefault(goal: string): string {
    return `OBJETIVO: "${goal}"`;
  }
}
