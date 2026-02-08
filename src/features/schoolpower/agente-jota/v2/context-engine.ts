import type { AgentState, ThoughtEntry, ActionEntry, ObservationEntry } from './agent-loop';

export interface ContextBlock {
  id: string;
  type: 'system' | 'user_input' | 'memory' | 'thought' | 'action' | 'observation' | 'result';
  content: string;
  timestamp: number;
  tokens_estimate: number;
  compressible: boolean;
}

export interface ContextWindow {
  blocks: ContextBlock[];
  totalTokensEstimate: number;
  maxTokens: number;
  cachePrefix: string;
}

const MAX_CONTEXT_TOKENS = 32000;
const TOKENS_PER_CHAR = 0.3;
const COMPRESSION_THRESHOLD = 0.7;

function estimateTokens(text: string): number {
  return Math.ceil(text.length * TOKENS_PER_CHAR);
}

function deterministicSerialize(data: any): string {
  if (data === null || data === undefined) return '';
  if (typeof data === 'string') return data;
  if (typeof data !== 'object') return String(data);

  if (Array.isArray(data)) {
    return JSON.stringify(data.map(item =>
      typeof item === 'object' && item !== null
        ? JSON.parse(deterministicSerialize(item))
        : item
    ));
  }

  const sortedKeys = Object.keys(data).sort();
  const sorted: Record<string, any> = {};
  for (const key of sortedKeys) {
    sorted[key] = data[key];
  }
  return JSON.stringify(sorted);
}

const STABLE_SYSTEM_PREFIX = `Você é o Agente Jota, assistente inteligente de IA do Ponto School.
Sua especialidade é ajudar professores a criar atividades educacionais personalizadas.
Você opera com inteligência, empatia e eficiência.

SUAS CAPACIDADES:
- Pesquisar atividades disponíveis no catálogo
- Pesquisar atividades já criadas pelo professor
- Decidir quais atividades criar baseado no contexto
- Gerar conteúdo pedagógico para atividades
- Criar atividades personalizadas
- Salvar atividades no banco de dados
- Gerar documentos complementares (dossiê, resumo, roteiro)

PRINCÍPIOS:
- Sempre interprete o pedido do professor com empatia
- Priorize qualidade pedagógica sobre quantidade
- Adapte o conteúdo à série e disciplina mencionadas
- Seja específico nos dados e resultados apresentados`;

export class ContextEngine {
  private blocks: ContextBlock[] = [];
  private maxTokens: number;
  private sessionId: string;

  constructor(sessionId: string, maxTokens: number = MAX_CONTEXT_TOKENS) {
    this.sessionId = sessionId;
    this.maxTokens = maxTokens;

    this.addBlock({
      id: 'system-prefix',
      type: 'system',
      content: STABLE_SYSTEM_PREFIX,
      timestamp: 0,
      tokens_estimate: estimateTokens(STABLE_SYSTEM_PREFIX),
      compressible: false,
    });
  }

  addBlock(block: ContextBlock): void {
    this.blocks.push(block);
    this.checkAndCompress();
  }

  addUserInput(userPrompt: string, metadata?: Record<string, any>): void {
    const content = metadata
      ? `PEDIDO DO PROFESSOR:\n"${userPrompt}"\n\nMETADADOS:\n${deterministicSerialize(metadata)}`
      : `PEDIDO DO PROFESSOR:\n"${userPrompt}"`;

    this.addBlock({
      id: `user-${Date.now()}`,
      type: 'user_input',
      content,
      timestamp: Date.now(),
      tokens_estimate: estimateTokens(content),
      compressible: false,
    });
  }

  addMemoryContext(memoryContent: string): void {
    if (!memoryContent || memoryContent.trim().length === 0) return;

    this.addBlock({
      id: `memory-${Date.now()}`,
      type: 'memory',
      content: `MEMÓRIA DO PROFESSOR:\n${memoryContent}`,
      timestamp: Date.now(),
      tokens_estimate: estimateTokens(memoryContent),
      compressible: true,
    });
  }

  addThought(thought: ThoughtEntry): void {
    const content = `PENSAMENTO (iteração ${thought.iteration + 1}):\n${thought.reasoning}`;
    this.addBlock({
      id: `thought-${thought.iteration}`,
      type: 'thought',
      content,
      timestamp: thought.timestamp,
      tokens_estimate: estimateTokens(content),
      compressible: true,
    });
  }

  addAction(action: ActionEntry): void {
    const duration = action.endTime ? `${action.endTime - action.startTime}ms` : 'em andamento';
    const resultSummary = action.result
      ? this.summarizeResult(action.result)
      : 'Sem resultado';

    const content = `AÇÃO: ${action.capabilityName} (${action.success ? '✓' : '✗'}, ${duration})\nRESULTADO: ${resultSummary}${action.error ? `\nERRO: ${action.error}` : ''}`;

    this.addBlock({
      id: `action-${action.iteration}-${action.capabilityName}`,
      type: 'action',
      content,
      timestamp: action.startTime,
      tokens_estimate: estimateTokens(content),
      compressible: true,
    });
  }

  addObservation(observation: ObservationEntry): void {
    const content = `OBSERVAÇÃO (iteração ${observation.iteration + 1}):\n${observation.summary}\n${observation.dataDiscovered.length > 0 ? `Dados: ${observation.dataDiscovered.join(', ')}` : ''}`;

    this.addBlock({
      id: `obs-${observation.iteration}`,
      type: 'observation',
      content,
      timestamp: observation.timestamp,
      tokens_estimate: estimateTokens(content),
      compressible: true,
    });
  }

  buildPrompt(additionalInstruction?: string): string {
    const parts: string[] = [];

    for (const block of this.blocks) {
      parts.push(block.content);
    }

    if (additionalInstruction) {
      parts.push(additionalInstruction);
    }

    return parts.join('\n\n');
  }

  getStablePrefix(): string {
    return STABLE_SYSTEM_PREFIX;
  }

  getTotalTokens(): number {
    return this.blocks.reduce((sum, b) => sum + b.tokens_estimate, 0);
  }

  private summarizeResult(result: any): string {
    if (typeof result === 'string') {
      return result.substring(0, 300);
    }

    if (typeof result === 'object' && result !== null) {
      const summary: string[] = [];

      if (result.success !== undefined) summary.push(`success: ${result.success}`);
      if (result.count !== undefined) summary.push(`count: ${result.count}`);
      if (result.total !== undefined) summary.push(`total: ${result.total}`);
      if (result.atividades && Array.isArray(result.atividades)) {
        summary.push(`${result.atividades.length} atividades`);
      }
      if (result.activities && Array.isArray(result.activities)) {
        summary.push(`${result.activities.length} activities`);
      }
      if (result.message) summary.push(result.message);
      if (result.error) summary.push(`erro: ${result.error}`);

      if (summary.length > 0) return summary.join(' | ');

      return deterministicSerialize(result).substring(0, 300);
    }

    return String(result).substring(0, 200);
  }

  private checkAndCompress(): void {
    const totalTokens = this.getTotalTokens();

    if (totalTokens <= this.maxTokens * COMPRESSION_THRESHOLD) return;

    console.log(`🗜️ [ContextEngine] Comprimindo contexto: ${totalTokens} tokens > ${Math.floor(this.maxTokens * COMPRESSION_THRESHOLD)} threshold`);

    const compressible = this.blocks.filter(b => b.compressible);

    const nonCompressible = this.blocks.filter(b => !b.compressible);
    const recentCount = Math.min(3, compressible.length);
    const recent = compressible.slice(-recentCount);
    const toCompress = compressible.slice(0, -recentCount);

    if (toCompress.length === 0) return;

    const compressedContent = toCompress
      .map(b => {
        if (b.type === 'thought') return `[Pensamento ${b.id}: resumido]`;
        if (b.type === 'action') return b.content.split('\n')[0];
        if (b.type === 'observation') return b.content.split('\n')[0];
        return b.content.substring(0, 100) + '...';
      })
      .join('\n');

    const summaryBlock: ContextBlock = {
      id: `compressed-${Date.now()}`,
      type: 'result',
      content: `HISTÓRICO RESUMIDO:\n${compressedContent}`,
      timestamp: Date.now(),
      tokens_estimate: estimateTokens(compressedContent),
      compressible: true,
    };

    this.blocks = [...nonCompressible, summaryBlock, ...recent];

    console.log(`✅ [ContextEngine] Contexto comprimido: ${totalTokens} → ${this.getTotalTokens()} tokens`);
  }

  clear(): void {
    const systemBlock = this.blocks.find(b => b.id === 'system-prefix');
    this.blocks = systemBlock ? [systemBlock] : [];
  }
}
