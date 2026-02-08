/**
 * CONVERSATION COMPACTOR - Compactação Inteligente do Histórico
 * 
 * Inspirado no Manus AI Context Compaction:
 * - Turnos antigos são resumidos (compactados)
 * - Turnos recentes são mantidos completos
 * - O objetivo original é SEMPRE preservado integralmente
 * 
 * Diferente do MemoryManager que faz truncamento brutal a 8000 chars,
 * este sistema faz compactação semântica: mantém o significado enquanto
 * reduz o tamanho.
 */

export interface ConversationTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    type?: 'initial_response' | 'plan_message' | 'narrative' | 'final_response' | 'follow_up' | 'execution_update';
    planId?: string;
    stepIndex?: number;
  };
}

export class ConversationCompactor {
  compact(
    turns: ConversationTurn[],
    maxChars: number,
    recentFullTurns: number = 3
  ): string {
    if (turns.length === 0) return '';

    const recent = turns.slice(-recentFullTurns * 2);
    const older = turns.slice(0, turns.length - recent.length);

    const recentText = recent
      .map(t => this.formatTurn(t, false))
      .join('\n');

    if (older.length === 0) {
      return this.trimToLimit(recentText, maxChars);
    }

    const olderCompacted = this.compactOlderTurns(older);

    const result = `[Resumo de ${older.length} mensagens anteriores]:\n${olderCompacted}\n\n[Mensagens recentes]:\n${recentText}`;
    
    return this.trimToLimit(result, maxChars);
  }

  private compactOlderTurns(turns: ConversationTurn[]): string {
    const userMessages: string[] = [];
    const assistantSummaries: string[] = [];

    for (const turn of turns) {
      if (turn.role === 'user') {
        userMessages.push(this.summarizeTurn(turn.content, 100));
      } else if (turn.role === 'assistant') {
        const type = turn.metadata?.type || 'response';
        assistantSummaries.push(`[${type}] ${this.summarizeTurn(turn.content, 80)}`);
      }
    }

    const parts: string[] = [];
    if (userMessages.length > 0) {
      parts.push(`Pedidos do professor: ${userMessages.join(' → ')}`);
    }
    if (assistantSummaries.length > 0) {
      parts.push(`Respostas do Jota: ${assistantSummaries.join(' | ')}`);
    }

    return parts.join('\n');
  }

  private summarizeTurn(content: string, maxLen: number): string {
    const cleaned = content
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (cleaned.length <= maxLen) return cleaned;

    const firstSentence = cleaned.match(/^[^.!?]+[.!?]/);
    if (firstSentence && firstSentence[0].length <= maxLen) {
      return firstSentence[0];
    }

    return cleaned.substring(0, maxLen - 3) + '...';
  }

  private formatTurn(turn: ConversationTurn, compact: boolean): string {
    const prefix = turn.role === 'user' ? 'Professor' : 'Jota';
    const content = compact 
      ? this.summarizeTurn(turn.content, 150) 
      : turn.content;
    return `${prefix}: ${content}`;
  }

  private trimToLimit(text: string, maxChars: number): string {
    if (text.length <= maxChars) return text;
    return text.substring(0, maxChars - 40) + '\n[...histórico compactado]';
  }
}
