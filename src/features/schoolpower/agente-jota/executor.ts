/**
 * EXECUTOR - Executador de Planos com Capabilities
 * 
 * Executa cada etapa do plano de forma sequencial,
 * processando as capabilities de cada etapa em ordem
 */

import { executeWithCascadeFallback } from '../services/controle-APIs-gerais-school-power';
import { findCapability, executeCapability } from './capabilities';
import { MemoryManager } from './memory-manager';
import { EXECUTION_PROMPT } from './prompts/execution-prompt';
import { reflectionService, type CapabilityInsight, type NarrativeReflection } from './reflection-service';
import type { ExecutionPlan, ExecutionStep, CapabilityCall, ProgressUpdate } from '../interface-chat-producao/types';

export type ProgressCallback = (update: ProgressUpdate) => void;

export interface CapabilityProgressUpdate extends ProgressUpdate {
  capabilityId?: string;
  capabilityName?: string;
  capabilityStatus?: 'pending' | 'executing' | 'completed' | 'failed';
  capabilityResult?: any;
  capabilityDuration?: number;
}

export interface ReflectionProgressUpdate extends ProgressUpdate {
  reflection?: NarrativeReflection;
  reflectionLoading?: boolean;
}

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

  private emitProgress(update: ProgressUpdate | CapabilityProgressUpdate): void {
    console.log('📊 [Executor] Progresso:', update);
    if (this.onProgress) {
      this.onProgress(update as ProgressUpdate);
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
          descricao: etapa.titulo || etapa.descricao,
        });

        console.log(`🔄 [Executor] Executando etapa ${etapa.ordem}: ${etapa.titulo || etapa.descricao}`);

        let etapaResultados: any[] = [];

        if (etapa.capabilities && etapa.capabilities.length > 0) {
          etapaResultados = await this.executeCapabilities(etapa);
        } else {
          const resultado = await this.executeSingleFunction(etapa);
          etapaResultados = [resultado];
        }

        const combinedResult = {
          etapa: etapa.ordem,
          titulo: etapa.titulo,
          resultados: etapaResultados,
        };

        results.push({ etapa: etapa.ordem, resultado: combinedResult });

        await this.memory.saveToWorkingMemory({
          tipo: 'descoberta',
          conteudo: this.formatResultSummary(combinedResult),
          etapa: etapa.ordem,
          funcao: etapa.funcao,
          resultado: combinedResult,
        });

        this.emitProgress({
          sessionId: this.sessionId,
          status: 'etapa_concluida',
          etapaAtual: etapa.ordem,
          resultado: this.formatResultSummary(combinedResult),
        });

        this.emitProgress({
          sessionId: this.sessionId,
          status: 'executando',
          etapaAtual: etapa.ordem,
          descricao: 'Gerando reflexão...',
          reflectionLoading: true,
        } as ReflectionProgressUpdate);

        try {
          const reflection = await reflectionService.generateReflection(etapa.ordem - 1);
          
          this.emitProgress({
            sessionId: this.sessionId,
            status: 'executando',
            etapaAtual: etapa.ordem,
            descricao: 'Reflexão gerada',
            reflection,
            reflectionLoading: false,
          } as ReflectionProgressUpdate);
          
          console.log('💡 [Executor] Reflexão gerada:', reflection.narrative.substring(0, 100) + '...');
        } catch (reflectionError) {
          console.warn('⚠️ [Executor] Erro ao gerar reflexão:', reflectionError);
        }

        await this.delay(300);

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

  private async executeCapabilities(etapa: ExecutionStep): Promise<any[]> {
    const capabilities = etapa.capabilities || [];
    const results: any[] = [];
    const objectiveIndex = etapa.ordem - 1;

    reflectionService.setObjectiveTitle(objectiveIndex, etapa.titulo || etapa.descricao);

    console.log(`📦 [Executor] Executando ${capabilities.length} capabilities na etapa ${etapa.ordem}`);

    for (const capability of capabilities) {
      const startTime = Date.now();

      this.emitProgress({
        sessionId: this.sessionId,
        status: 'executando',
        etapaAtual: etapa.ordem,
        descricao: capability.displayName || capability.nome,
        capabilityId: capability.id,
        capabilityName: capability.nome,
        capabilityStatus: 'executing',
      } as CapabilityProgressUpdate);

      console.log(`  ⚡ [Executor] Capability: ${capability.displayName}`);

      try {
        const capFunc = findCapability(capability.nome);
        let resultado: any;

        if (capFunc) {
          resultado = await executeCapability(capability.nome, capability.parametros);
        } else {
          console.warn(`  ⚠️ [Executor] Capability não encontrada: ${capability.nome}`);
          resultado = await this.executeCapabilityWithAI(capability, etapa);
        }

        const duration = Date.now() - startTime;

        this.emitProgress({
          sessionId: this.sessionId,
          status: 'executando',
          etapaAtual: etapa.ordem,
          descricao: `${capability.displayName} - Concluído`,
          capabilityId: capability.id,
          capabilityName: capability.nome,
          capabilityStatus: 'completed',
          capabilityResult: resultado,
          capabilityDuration: duration,
        } as CapabilityProgressUpdate);

        results.push({
          capability: capability.nome,
          displayName: capability.displayName,
          resultado,
          duration,
        });

        const insight: CapabilityInsight = {
          capabilityName: capability.nome,
          displayName: capability.displayName,
          categoria: capability.categoria,
          duration,
          success: true,
          discovered: this.extractDiscoveries(resultado),
          decided: this.extractDecisions(resultado),
          metrics: this.extractMetrics(resultado),
        };
        reflectionService.addCapabilityInsight(objectiveIndex, insight);

        await this.delay(200);

      } catch (error) {
        const duration = Date.now() - startTime;

        this.emitProgress({
          sessionId: this.sessionId,
          status: 'executando',
          etapaAtual: etapa.ordem,
          descricao: `${capability.displayName} - Erro`,
          capabilityId: capability.id,
          capabilityName: capability.nome,
          capabilityStatus: 'failed',
          capabilityDuration: duration,
        } as CapabilityProgressUpdate);

        console.error(`  ❌ [Executor] Erro na capability ${capability.nome}:`, error);
        
        results.push({
          capability: capability.nome,
          displayName: capability.displayName,
          erro: error instanceof Error ? error.message : String(error),
          duration,
        });

        const insight: CapabilityInsight = {
          capabilityName: capability.nome,
          displayName: capability.displayName,
          categoria: capability.categoria,
          duration,
          success: false,
        };
        reflectionService.addCapabilityInsight(objectiveIndex, insight);
      }
    }

    return results;
  }

  private extractDiscoveries(resultado: any): string[] {
    const discoveries: string[] = [];
    
    if (!resultado) return discoveries;
    
    if (typeof resultado === 'object') {
      if (resultado.total !== undefined) {
        discoveries.push(`Encontrei ${resultado.total} itens`);
      }
      if (resultado.count !== undefined) {
        discoveries.push(`Total de ${resultado.count} resultados`);
      }
      if (resultado.atividades && Array.isArray(resultado.atividades)) {
        discoveries.push(`${resultado.atividades.length} atividades disponíveis`);
      }
      if (resultado.tipos && Array.isArray(resultado.tipos)) {
        discoveries.push(`${resultado.tipos.length} tipos identificados`);
      }
      if (resultado.turma) {
        discoveries.push(`Turma: ${resultado.turma}`);
      }
      if (resultado.conteudo && typeof resultado.conteudo === 'string') {
        const match = resultado.conteudo.match(/(\d+)\s*(atividades?|exercícios?|questões?)/i);
        if (match) {
          discoveries.push(`${match[1]} ${match[2]} encontrados`);
        }
      }
    }
    
    return discoveries.slice(0, 2);
  }

  private extractDecisions(resultado: any): string[] {
    const decisions: string[] = [];
    
    if (!resultado) return decisions;
    
    if (typeof resultado === 'object') {
      if (resultado.decisao) {
        decisions.push(String(resultado.decisao));
      }
      if (resultado.escolha) {
        decisions.push(`Escolhi: ${resultado.escolha}`);
      }
      if (resultado.tipo && resultado.nome) {
        decisions.push(`Criando ${resultado.tipo}: ${resultado.nome}`);
      }
    }
    
    return decisions.slice(0, 2);
  }

  private extractMetrics(resultado: any): Record<string, number | string> {
    const metrics: Record<string, number | string> = {};
    
    if (!resultado) return metrics;
    
    if (typeof resultado === 'object') {
      if (resultado.total !== undefined) metrics['Total'] = resultado.total;
      if (resultado.count !== undefined) metrics['Quantidade'] = resultado.count;
      if (resultado.media !== undefined) metrics['Média'] = resultado.media;
      if (resultado.duracao !== undefined) metrics['Duração'] = resultado.duracao;
    }
    
    return metrics;
  }

  private async executeSingleFunction(etapa: ExecutionStep): Promise<any> {
    const capability = findCapability(etapa.funcao);

    if (capability) {
      return await executeCapability(etapa.funcao, etapa.parametros);
    }

    console.warn(`⚠️ [Executor] Capability não encontrada: ${etapa.funcao}`);
    return await this.executeWithAI(etapa);
  }

  private async executeCapabilityWithAI(capability: CapabilityCall, etapa: ExecutionStep): Promise<any> {
    console.log(`🤖 [Executor] Executando capability com IA: ${capability.nome}`);

    const context = this.memory.formatContextForPrompt();

    const prompt = `
Você é o Agente Jota executando uma capability específica.

CAPABILITY: ${capability.nome}
DISPLAY NAME: ${capability.displayName}
CATEGORIA: ${capability.categoria}
PARÂMETROS: ${JSON.stringify(capability.parametros, null, 2)}

CONTEXTO DA ETAPA: ${etapa.descricao}
CONTEXTO GERAL: ${context}

Execute esta capability e retorne um resultado útil e realista.
Seja específico e forneça dados que ajudem o professor.
    `.trim();

    const result = await executeWithCascadeFallback(prompt);

    if (result.success && result.data) {
      return {
        tipo: 'ai_response',
        conteudo: result.data,
        capability: capability.nome,
      };
    }

    return {
      tipo: 'fallback',
      conteudo: `Capability "${capability.displayName}" processada`,
      capability: capability.nome,
    };
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
      if (resultado.resultados && Array.isArray(resultado.resultados)) {
        return `${resultado.resultados.length} capabilities executadas com sucesso`;
      }
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
${plan.etapas.map(e => `${e.ordem}. ${e.titulo || e.descricao}`).join('\n')}

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
