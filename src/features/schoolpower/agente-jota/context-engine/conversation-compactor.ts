/**
 * CONVERSATION COMPACTOR v2.0 - Compactação Semântica com Prioridades
 * 
 * Inspirado no Manus AI Context Compaction e Replit Agent V3 LLM-based compression:
 * - Compactação por PRIORIDADE (não por posição)
 * - Turnos com atividades criadas e decisões importantes preservados
 * - Turnos com narrativas e respostas intermediárias compactados
 * - O objetivo original é SEMPRE preservado integralmente
 * - NUNCA faz truncamento brutal por substring
 * 
 * Prioridades (mais alto = mais preservado):
 * 1. Mensagens do professor (pedidos originais)
 * 2. Resultados com atividades criadas
 * 3. Decisões e preferências do professor
 * 4. Resposta final de execuções
 * 5. Narrativas e atualizações intermediárias (mais compactáveis)
 */

export interface ConversationTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    type?: 'initial_response' | 'plan_message' | 'narrative' | 'final_response' | 'follow_up' | 'execution_update' | 'capability_direta';
    planId?: string;
    stepIndex?: number;
    capability?: string;
  };
}

type TurnPriority = 'critical' | 'high' | 'medium' | 'low';

interface PrioritizedTurn {
  turn: ConversationTurn;
  priority: TurnPriority;
  compactedContent?: string;
}

export class ConversationCompactor {
  compact(
    turns: ConversationTurn[],
    maxChars: number,
    recentFullTurns: number = 4
  ): string {
    if (turns.length === 0) return '';

    const recentCount = Math.min(recentFullTurns * 2, turns.length);
    const recent = turns.slice(-recentCount);
    const older = turns.slice(0, turns.length - recent.length);

    const recentText = recent
      .map(t => this.formatTurn(t, false))
      .join('\n');

    if (older.length === 0) {
      return this.smartTrim(recentText, maxChars);
    }

    const prioritized = older.map(t => this.prioritize(t));
    const olderCompacted = this.compactByPriority(prioritized, maxChars - recentText.length - 200);

    const result = `[Histórico compactado (${older.length} mensagens)]:\n${olderCompacted}\n\n[Mensagens recentes]:\n${recentText}`;
    
    return this.smartTrim(result, maxChars);
  }

  private prioritize(turn: ConversationTurn): PrioritizedTurn {
    if (turn.role === 'user') {
      return { turn, priority: 'critical' };
    }

    const type = turn.metadata?.type;

    if (type === 'final_response') {
      return { turn, priority: 'high' };
    }

    if (type === 'initial_response') {
      return { turn, priority: 'medium' };
    }

    if (type === 'narrative' || type === 'execution_update') {
      // T003: Mesmo mensagens "narrative" podem anunciar criações — promover para HIGH
      const contentLower = turn.content.toLowerCase();
      const CREATION_INDICATORS = [
        'criei', 'criou', 'atividade criada', 'quiz criado', 'sequência didática',
        'flash cards', 'lista de exercícios', 'plano de aula', 'concluíd',
        'gerado com sucesso', 'pronto', 'finaliz', '✅'
      ];
      if (CREATION_INDICATORS.some(ind => contentLower.includes(ind))) {
        console.log(`[Compactor] narrative promovido → HIGH (contém indicador de criação)`);
        return { turn, priority: 'high' };
      }
      return { turn, priority: 'low' };
    }

    const content = turn.content.toLowerCase();
    if (content.includes('atividade criada') || content.includes('criou') || content.includes('concluíd')) {
      return { turn, priority: 'high' };
    }

    return { turn, priority: 'medium' };
  }

  private compactByPriority(prioritized: PrioritizedTurn[], budget: number): string {
    if (prioritized.length === 0) return '';

    const critical = prioritized.filter(p => p.priority === 'critical');
    const high = prioritized.filter(p => p.priority === 'high');
    const medium = prioritized.filter(p => p.priority === 'medium');
    const low = prioritized.filter(p => p.priority === 'low');

    const parts: string[] = [];
    let remaining = Math.max(budget, 500);

    if (critical.length > 0) {
      // T001: CRITICAL (mensagens do professor) preservados com 400 chars (era 200)
      const criticalText = critical
        .map(p => {
          const summarized = this.semanticSummarize(p.turn.content, 400);
          console.log(`[Compactor] CRITICAL: ${p.turn.content.length} chars → ${summarized.length} chars preservados`);
          return `Professor: ${summarized}`;
        })
        .join('\n');
      parts.push(criticalText);
      remaining -= criticalText.length;
    }

    if (high.length > 0 && remaining > 200) {
      // T003: HIGH items (criações de atividades) garantem mínimo de 300 chars
      const perItem = Math.max(300, Math.floor(remaining / (high.length + 1)));
      const highText = high
        .map(p => {
          const label = p.turn.metadata?.type || 'resposta';
          const summarized = this.semanticSummarize(p.turn.content, perItem);
          console.log(`[Compactor] HIGH "${label}": ${p.turn.content.length} → ${summarized.length} chars`);
          return `[${label}] ${summarized}`;
        })
        .join('\n');
      parts.push(highText);
      remaining -= highText.length;
    }

    if (medium.length > 0 && remaining > 150) {
      const perItem = Math.max(60, Math.floor(remaining / (medium.length + 1)));
      const mediumText = medium
        .map(p => {
          const label = p.turn.metadata?.type || 'mensagem';
          return `[${label}] ${this.semanticSummarize(p.turn.content, perItem)}`;
        })
        .join('\n');
      parts.push(mediumText);
      remaining -= mediumText.length;
    }

    if (low.length > 0 && remaining > 100) {
      parts.push(`[${low.length} atualizações intermediárias omitidas]`);
    }

    return parts.join('\n');
  }

  private semanticSummarize(content: string, maxLen: number): string {
    const cleaned = content
      .replace(/═+/g, '')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (cleaned.length <= maxLen) return cleaned;

    const sentences = cleaned.match(/[^.!?]+[.!?]+/g);
    if (sentences && sentences.length > 0) {
      let result = '';
      for (const sentence of sentences) {
        if ((result + sentence).length <= maxLen - 3) {
          result += sentence;
        } else {
          break;
        }
      }
      if (result.length > 0) return result.trim();
    }

    const keyPhrases = this.extractKeyPhrases(cleaned);
    if (keyPhrases.length > 0) {
      const joined = keyPhrases.join('; ');
      if (joined.length <= maxLen) return joined;
    }

    return cleaned.substring(0, maxLen - 3) + '...';
  }

  private extractKeyPhrases(text: string): string[] {
    const patterns = [
      /criei?\s+(?:a\s+)?(?:atividade|atividades)\s+["']?([^"'.]+)/gi,
      /(?:plano|plan[oe])\s+(?:de\s+)?["']?([^"'.]+)/gi,
      /(?:professor|você)\s+pediu?\s+["']?([^"'.]+)/gi,
      /(?:resultado|resultado final|concluído)[:.]?\s*([^.]+)/gi,
    ];

    const phrases: string[] = [];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        phrases.push(match[0].substring(0, 80));
      }
    }

    return phrases;
  }

  private formatTurn(turn: ConversationTurn, compact: boolean): string {
    const prefix = turn.role === 'user' ? 'Professor' : 'Jota';
    const content = compact 
      ? this.semanticSummarize(turn.content, 150) 
      : turn.content;
    return `${prefix}: ${content}`;
  }

  private smartTrim(text: string, maxChars: number): string {
    if (text.length <= maxChars) return text;

    const lines = text.split('\n');
    let result = '';
    const keepFromEnd = Math.min(lines.length, 20);
    const endLines = lines.slice(-keepFromEnd).join('\n');
    const startBudget = maxChars - endLines.length - 60;

    if (startBudget > 200) {
      for (const line of lines.slice(0, -keepFromEnd)) {
        if ((result + line + '\n').length > startBudget) break;
        result += line + '\n';
      }
      result += '\n[...contexto intermediário compactado]\n\n' + endLines;
    } else {
      result = endLines;
      if (result.length > maxChars) {
        result = result.substring(result.length - maxChars);
      }
    }

    return result;
  }
}
