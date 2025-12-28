/**
 * EXECUTOR - Executador de Planos
 * 
 * Executa cada etapa do plano de forma sequencial,
 * chamando as capabilities correspondentes
 */

import { executeWithCascadeFallback } from '../services/controle-APIs-gerais-school-power';
import { findCapability, executeCapability } from './capabilities';
import { MemoryManager } from './memory-manager';
import { EXECUTION_PROMPT } from './prompts/execution-prompt';
import type { ExecutionPlan, ExecutionStep, ProgressUpdate } from '../interface-chat-producao/types';

export type ProgressCallback = (update: ProgressUpdate) => void;

export class AgentExecutor {
  private sessionId: string;
  private memory: MemoryManager;
  private onProgress: ProgressCallback | null = null;

  constructor(sessionId: string, memory: MemoryManager) {
    this.sessionId = sessionId;
    this.memory = memory;
  }

  setProgressCallback(callback: ProgressCallback): void {
    this.onProgress = callback;
  }

  private emitProgress(update: ProgressUpdate): void {
    console.log('📊 [Executor] Progresso:', update);
    if (this.onProgress) {
      this.onProgress(update);
    }
  }

  async executePlan(plan: ExecutionPlan): Promise<string> {
    console.log('▶️ [Executor] Iniciando execução do plano:', plan.planId);

    await this.memory.saveToWorkingMemory({
      tipo: 'objetivo',
      conteudo: plan.objetivo,
    });

    this.emitProgress({
      sessionId: this.sessionId,
      status: 'iniciando',
      descricao: `Iniciando execução: ${plan.objetivo}`,
    });

    const results: Array<{ etapa: number; resultado: any }> = [];

    for (const etapa of plan.etapas) {
      try {
        this.emitProgress({
          sessionId: this.sessionId,
          status: 'executando',
          etapaAtual: etapa.ordem,
          descricao: etapa.descricao,
        });

        console.log(`🔄 [Executor] Executando etapa ${etapa.ordem}: ${etapa.descricao}`);

        const capability = findCapability(etapa.funcao);
        let resultado: any;

        if (capability) {
          resultado = await executeCapability(etapa.funcao, etapa.parametros);
        } else {
          console.warn(`⚠️ [Executor] Capability não encontrada: ${etapa.funcao}`);
          resultado = await this.executeWithAI(etapa);
        }

        results.push({ etapa: etapa.ordem, resultado });

        await this.memory.saveToWorkingMemory({
          tipo: 'descoberta',
          conteudo: this.formatResultSummary(resultado),
          etapa: etapa.ordem,
          funcao: etapa.funcao,
          resultado,
        });

        this.emitProgress({
          sessionId: this.sessionId,
          status: 'etapa_concluida',
          etapaAtual: etapa.ordem,
          resultado: this.formatResultSummary(resultado),
        });

        await this.delay(500);

      } catch (error) {
        console.error(`❌ [Executor] Erro na etapa ${etapa.ordem}:`, error);

        await this.memory.saveToWorkingMemory({
          tipo: 'erro',
          conteudo: `Erro na etapa ${etapa.ordem}: ${error instanceof Error ? error.message : String(error)}`,
          etapa: etapa.ordem,
          funcao: etapa.funcao,
        });

        this.emitProgress({
          sessionId: this.sessionId,
          status: 'erro',
          etapaAtual: etapa.ordem,
          erro: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const relatorio = await this.generateFinalReport(plan, results);

    this.emitProgress({
      sessionId: this.sessionId,
      status: 'concluido',
      descricao: 'Plano executado com sucesso!',
    });

    return relatorio;
  }

  private async executeWithAI(etapa: ExecutionStep): Promise<any> {
    console.log(`🤖 [Executor] Executando com IA: ${etapa.funcao}`);

    const context = this.memory.formatContextForPrompt();

    const prompt = EXECUTION_PROMPT
      .replace('{funcao}', etapa.funcao)
      .replace('{descricao}', etapa.descricao)
      .replace('{parametros}', JSON.stringify(etapa.parametros, null, 2))
      .replace('{context}', context);

    const result = await executeWithCascadeFallback(prompt);

    if (result.success && result.data) {
      return {
        tipo: 'ai_response',
        conteudo: result.data,
        funcao: etapa.funcao,
      };
    }

    return {
      tipo: 'fallback',
      conteudo: `Etapa "${etapa.descricao}" processada`,
      funcao: etapa.funcao,
    };
  }

  private formatResultSummary(resultado: any): string {
    if (typeof resultado === 'string') {
      return resultado.length > 200 ? resultado.substring(0, 200) + '...' : resultado;
    }

    if (resultado && typeof resultado === 'object') {
      if (resultado.conteudo) return String(resultado.conteudo);
      if (resultado.mensagem) return String(resultado.mensagem);
      if (resultado.summary) return String(resultado.summary);
      
      const keys = Object.keys(resultado);
      return `Resultado com ${keys.length} campos: ${keys.slice(0, 3).join(', ')}...`;
    }

    return String(resultado);
  }

  private async generateFinalReport(
    plan: ExecutionPlan,
    results: Array<{ etapa: number; resultado: any }>
  ): Promise<string> {
    console.log('📝 [Executor] Gerando relatório final');

    const context = await this.memory.getWorkingMemory();

    const reportPrompt = `
Você acabou de executar o seguinte plano de ação:

OBJETIVO: ${plan.objetivo}

ETAPAS EXECUTADAS:
${plan.etapas.map(e => `${e.ordem}. ${e.descricao}`).join('\n')}

RESULTADOS DE CADA ETAPA:
${results.map(r => `Etapa ${r.etapa}: ${this.formatResultSummary(r.resultado)}`).join('\n\n')}

CONTEXTO ACUMULADO:
${context.map(c => `- [${c.tipo}] ${c.conteudo}`).join('\n')}

Gere um relatório amigável e completo para o professor, explicando:
1. O que foi feito
2. Os resultados obtidos
3. Próximos passos sugeridos (se houver)

Seja claro, objetivo e use uma linguagem acessível.
    `.trim();

    const result = await executeWithCascadeFallback(reportPrompt);

    if (result.success && result.data) {
      return result.data;
    }

    return `Plano "${plan.objetivo}" executado com sucesso!\n\nForam concluídas ${plan.etapas.length} etapas. Todas as atividades solicitadas foram processadas.`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export function createExecutor(sessionId: string, memory: MemoryManager): AgentExecutor {
  return new AgentExecutor(sessionId, memory);
}

export default AgentExecutor;
