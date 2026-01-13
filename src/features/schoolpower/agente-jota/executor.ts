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
import { createDebugEntry } from '../interface-chat-producao/debug-system/DebugStore';
import { useDebugStore } from '../interface-chat-producao/debug-system/DebugStore';
import { useChosenActivitiesStore, saveChosenActivitiesFromDecision } from '../interface-chat-producao/stores/ChosenActivitiesStore';

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

    // Limpar mapa de resultados de execuções anteriores
    this.capabilityResultsMap.clear();
    console.log('🧹 [Executor] Mapa de resultados limpo para nova execução');

    // Inicializar sessão de debug
    useDebugStore.getState().initSession(this.sessionId);
    
    // Inicializar sessão do ChosenActivitiesStore para sincronização
    useChosenActivitiesStore.getState().initSession(this.sessionId);

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

  // Mapa para armazenar resultados de capabilities entre etapas
  private capabilityResultsMap: Map<string, any> = new Map();

  private async executeCapabilities(etapa: ExecutionStep): Promise<any[]> {
    const capabilities = etapa.capabilities || [];
    const results: any[] = [];
    const objectiveIndex = etapa.ordem - 1;

    reflectionService.setObjectiveTitle(objectiveIndex, etapa.titulo || etapa.descricao);

    console.log(`📦 [Executor] Executando ${capabilities.length} capabilities na etapa ${etapa.ordem}`);
    console.log(`📦 [Executor] Resultados anteriores disponíveis:`, Array.from(this.capabilityResultsMap.keys()));

    for (const capability of capabilities) {
      const startTime = Date.now();
      const capId = capability.id;
      const capName = capability.nome;
      const capDisplayName = capability.displayName || capability.nome;

      // Iniciar debug para esta capability
      useDebugStore.getState().startCapability(capId, capDisplayName);
      
      // Debug: Iniciando capability
      createDebugEntry(
        capId,
        capDisplayName,
        'action',
        `Iniciando execução da capability "${capDisplayName}". Objetivo: processar dados conforme parâmetros recebidos.`,
        'low',
        { parametros: capability.parametros, categoria: capability.categoria }
      );

      this.emitProgress({
        sessionId: this.sessionId,
        status: 'executando',
        etapaAtual: etapa.ordem,
        descricao: capDisplayName,
        capabilityId: capId,
        capabilityName: capName,
        capabilityStatus: 'executing',
      } as CapabilityProgressUpdate);

      console.log(`  ⚡ [Executor] Capability: ${capDisplayName}`);

      try {
        const capFunc = findCapability(capName);
        let resultado: any;

        if (capFunc) {
          // Debug: Capability encontrada
          createDebugEntry(
            capId,
            capDisplayName,
            'info',
            `Capability "${capName}" encontrada no registro. Iniciando execução com os parâmetros configurados.`,
            'low'
          );
          
          // Injetar resultados de capabilities anteriores quando necessário
          const enrichedParams = this.enrichCapabilityParams(capName, capability.parametros);
          
          resultado = await executeCapability(capName, enrichedParams);
          
          // Armazenar resultado para uso em capabilities subsequentes
          this.capabilityResultsMap.set(capName, resultado);
          console.log(`💾 [Executor] Resultado de "${capName}" armazenado para uso futuro`);
          
          // Salvar atividades decididas no store para sincronização com criar_atividade
          if (capName.includes('decidir_atividades_criar') || capName.includes('decidir_atividades')) {
            const saved = saveChosenActivitiesFromDecision(resultado);
            if (saved) {
              console.log(`🎯 [Executor] Atividades decididas salvas no ChosenActivitiesStore`);
              
              // Emitir evento para UI atualizar
              const chosenActivities = useChosenActivitiesStore.getState().getActivitiesForConstruction();
              window.dispatchEvent(new CustomEvent('agente-jota-activities-decided', {
                detail: {
                  activities: chosenActivities,
                  total: chosenActivities.length,
                  estrategia: resultado?.estrategia_pedagogica || ''
                }
              }));
              
              // Agendar execução automática da capability gerar_conteudo_atividades
              // Isso faz o sub-card aparecer separado no mesmo tópico
              console.log(`⏳ [Executor] Agendando execução de gerar_conteudo_atividades...`);
              setTimeout(() => {
                this.executeAutoContentGeneration(resultado);
              }, 500);
            }
          }
          
          // Debug: Resultado obtido com dados técnicos detalhados
          createDebugEntry(
            capId,
            capDisplayName,
            'discovery',
            this.formatDebugNarrative(capName, resultado),
            'low',
            this.formatTechnicalDataForDebug(capName, resultado)
          );
        } else {
          console.warn(`  ⚠️ [Executor] Capability não encontrada: ${capName}`);
          
          // Debug: Usando fallback IA
          createDebugEntry(
            capId,
            capDisplayName,
            'warning',
            `Capability "${capName}" não encontrada no registro. Utilizando fallback com IA para processar a solicitação.`,
            'medium'
          );
          
          resultado = await this.executeCapabilityWithAI(capability, etapa);
        }

        const duration = Date.now() - startTime;

        // Debug: Capability concluída
        createDebugEntry(
          capId,
          capDisplayName,
          'action',
          `Capability "${capDisplayName}" concluída com sucesso em ${duration}ms. Todos os dados foram processados corretamente.`,
          'low',
          { duration_ms: duration, success: true }
        );

        // Emitir eventos especiais para capability criar_atividade
        if (capName.includes('criar_atividade') || capName.includes('criar-atividade')) {
          this.emitConstructionEvents(resultado, capId);
        }

        this.emitProgress({
          sessionId: this.sessionId,
          status: 'executando',
          etapaAtual: etapa.ordem,
          descricao: `${capDisplayName} - Concluído`,
          capabilityId: capId,
          capabilityName: capName,
          capabilityStatus: 'completed',
          capabilityResult: resultado,
          capabilityDuration: duration,
        } as CapabilityProgressUpdate);

        results.push({
          capability: capName,
          displayName: capDisplayName,
          resultado,
          duration,
        });

        const insight: CapabilityInsight = {
          capabilityName: capName,
          displayName: capDisplayName,
          categoria: capability.categoria,
          duration,
          success: true,
          discovered: this.extractDiscoveries(resultado),
          decided: this.extractDecisions(resultado),
          metrics: this.extractMetrics(resultado),
        };
        reflectionService.addCapabilityInsight(objectiveIndex, insight);

        // Finalizar debug para esta capability
        useDebugStore.getState().endCapability(capId);

        await this.delay(200);

      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Debug: Erro na capability
        createDebugEntry(
          capId,
          capDisplayName,
          'error',
          `Erro ao executar "${capDisplayName}": ${errorMessage}. A execução foi interrompida para esta capability.`,
          'high',
          { error: errorMessage, duration_ms: duration, stack: error instanceof Error ? error.stack : undefined }
        );

        this.emitProgress({
          sessionId: this.sessionId,
          status: 'executando',
          etapaAtual: etapa.ordem,
          descricao: `${capDisplayName} - Erro`,
          capabilityId: capId,
          capabilityName: capName,
          capabilityStatus: 'failed',
          capabilityDuration: duration,
        } as CapabilityProgressUpdate);

        console.error(`  ❌ [Executor] Erro na capability ${capName}:`, error);
        
        results.push({
          capability: capName,
          displayName: capDisplayName,
          erro: errorMessage,
          duration,
        });

        const insight: CapabilityInsight = {
          capabilityName: capName,
          displayName: capDisplayName,
          categoria: capability.categoria,
          duration,
          success: false,
        };
        reflectionService.addCapabilityInsight(objectiveIndex, insight);

        // Finalizar debug mesmo com erro
        useDebugStore.getState().endCapability(capId);
      }
    }

    return results;
  }

  private formatDebugNarrative(capName: string, resultado: any): string {
    if (capName.includes('pesquisar_atividades_conta')) {
      const count = resultado?.atividades?.length || resultado?.total || resultado?.count || 0;
      return `Pesquisei as atividades já criadas na conta do professor. Encontrei ${count} atividade(s) registrada(s) no banco de dados.`;
    }
    if (capName.includes('pesquisar_atividades_disponiveis')) {
      // Estrutura correta do resultado: { catalog: [], count: X, types: [], categories: [], summary: [], valid_ids: [] }
      const count = resultado?.count || resultado?.catalog?.length || resultado?.activities?.length || resultado?.total || 0;
      const types = resultado?.types?.length || 0;
      const ids = resultado?.valid_ids?.length || count;
      return `Consultei o catálogo de atividades. Encontrei ${count} atividade(s) disponível(is) com ${types} tipo(s). IDs válidos: ${ids}.`;
    }
    if (capName.includes('decidir_atividades')) {
      const chosen = resultado?.chosen_activities || resultado?.activities_to_create || resultado?.decisoes || [];
      const chosenCount = chosen.length;
      const raciocinio = resultado?.raciocinio || {};
      const catalogCount = raciocinio.atividades_disponiveis || 0;
      const idsAnalisados = raciocinio.ids_analisados || [];
      const estrategia = resultado?.estrategia_pedagogica || '';
      
      if (chosenCount > 0) {
        const chosenIds = chosen.map((a: any) => a.id).join(', ');
        return `Analisei ${catalogCount} atividade(s) do catálogo (IDs: ${idsAnalisados.join(', ')}). Decidi criar ${chosenCount} atividade(s): ${chosenIds}. Estratégia: ${estrategia || 'diversidade pedagógica'}.`;
      } else {
        return `Analisei o contexto pedagógico mas não selecionei nenhuma atividade. Catálogo tinha ${catalogCount} opções disponíveis.`;
      }
    }
    if (capName.includes('criar_atividade')) {
      const built = resultado?.activities_built?.length || resultado?.progress?.completed || 0;
      return `Construí ${built} atividade(s) com todos os campos preenchidos pela IA e salvei no banco de dados.`;
    }
    
    // Narrativa genérica
    const summary = this.formatResultSummary(resultado);
    return `Processamento concluído. Resultado: ${summary}`;
  }

  private emitConstructionEvents(resultado: any, capabilityId: string): void {
    // Verificar se temos atividades para construir
    if (resultado?.activities_built && Array.isArray(resultado.activities_built)) {
      const activities = resultado.activities_built.map((a: any) => ({
        id: a.id || a.original_id,
        titulo: a.titulo,
        tipo: a.tipo,
        status: a.status === 'completed' ? 'completed' : a.status === 'failed' ? 'error' : 'waiting',
        progress: a.status === 'completed' ? 100 : 0,
        built_data: a.campos_preenchidos,
        error_message: a.error_message
      }));

      // Emitir evento de atividades prontas
      this.emitProgress({
        sessionId: this.sessionId,
        type: 'construction:activities_ready',
        activities,
        capabilityId
      } as any);

      // Se já temos atividades construídas, emitir conclusão
      const completedCount = activities.filter((a: any) => a.status === 'completed').length;
      if (completedCount > 0) {
        this.emitProgress({
          sessionId: this.sessionId,
          type: 'construction:all_completed',
          activities,
          summary: `${completedCount} atividade(s) construída(s) com sucesso`
        } as any);
      }
    }

    // Verificar se temos progresso incremental
    if (resultado?.progress) {
      createDebugEntry(
        capabilityId,
        'Criar atividades',
        'info',
        `Progresso da construção: ${resultado.progress.completed}/${resultado.progress.total} atividades concluídas (${resultado.progress.percentage}%)`,
        'low',
        { progress: resultado.progress }
      );
    }
  }

  private async executeAutoContentGeneration(decisionResult: any): Promise<void> {
    console.log(`🚀 [Executor] Iniciando execução automática de gerar_conteudo_atividades`);
    
    const chosenActivities = decisionResult?.chosen_activities || [];
    if (chosenActivities.length === 0) {
      console.log(`⚠️ [Executor] Nenhuma atividade decidida para gerar conteúdo`);
      return;
    }

    const capId = `auto-gerar-conteudo-${Date.now()}`;
    const capDisplayName = 'Gerar conteúdo das atividades';

    // Emitir evento de capability iniciando (para UI mostrar o card)
    this.emitProgress({
      sessionId: this.sessionId,
      status: 'executando',
      descricao: `${capDisplayName} - Iniciando`,
      capabilityId: capId,
      capabilityName: 'gerar_conteudo_atividades',
      capabilityStatus: 'executing',
    } as CapabilityProgressUpdate);

    // Disparar evento customizado para a UI renderizar o ContentGenerationCard
    window.dispatchEvent(new CustomEvent('agente-jota-capability-started', {
      detail: {
        capabilityId: capId,
        capabilityName: 'gerar_conteudo_atividades',
        displayName: capDisplayName,
        status: 'executing',
        activities: chosenActivities.map((a: any) => ({
          id: a.id || a.activity_id,
          titulo: a.titulo || a.name,
          tipo: a.tipo || a.type
        }))
      }
    }));

    console.log(`📦 [Executor] Evento gerar_conteudo_atividades emitido para UI`);
  }

  private extractDiscoveries(resultado: any): string[] {
    const discoveries: string[] = [];
    
    if (!resultado) return discoveries;
    
    if (typeof resultado === 'string') {
      const numMatch = resultado.match(/(\d+)\s*(atividades?|exercícios?|questões?|itens?|tipos?|resultados?)/i);
      if (numMatch) {
        discoveries.push(`${numMatch[1]} ${numMatch[2]} encontrados`);
      }
      if (resultado.length > 10 && resultado.length < 100) {
        discoveries.push(resultado);
      }
      return discoveries.slice(0, 2);
    }
    
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
      if (resultado.items && Array.isArray(resultado.items)) {
        discoveries.push(`${resultado.items.length} itens processados`);
      }
      if (resultado.data && typeof resultado.data === 'object') {
        const nested = this.extractDiscoveries(resultado.data);
        discoveries.push(...nested);
      }
      if (resultado.resultado && typeof resultado.resultado === 'object') {
        const nested = this.extractDiscoveries(resultado.resultado);
        discoveries.push(...nested);
      }
      if (resultado.message && typeof resultado.message === 'string') {
        discoveries.push(resultado.message);
      }
      if (resultado.summary && typeof resultado.summary === 'string') {
        discoveries.push(resultado.summary);
      }
      if (resultado.conteudo && typeof resultado.conteudo === 'string') {
        const match = resultado.conteudo.match(/(\d+)\s*(atividades?|exercícios?|questões?)/i);
        if (match) {
          discoveries.push(`${match[1]} ${match[2]} encontrados`);
        }
      }
    }
    
    return discoveries.slice(0, 3);
  }

  private extractDecisions(resultado: any): string[] {
    const decisions: string[] = [];
    
    if (!resultado) return decisions;
    
    if (typeof resultado === 'string') {
      if (resultado.toLowerCase().includes('criado') || resultado.toLowerCase().includes('gerado')) {
        decisions.push(resultado);
      }
      return decisions.slice(0, 2);
    }
    
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
      if (resultado.action) {
        decisions.push(`Ação: ${resultado.action}`);
      }
      if (resultado.created) {
        decisions.push(`Criado: ${typeof resultado.created === 'string' ? resultado.created : 'Item'}`);
      }
      if (resultado.selected && Array.isArray(resultado.selected)) {
        decisions.push(`Selecionados: ${resultado.selected.length} itens`);
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
      if (resultado.length !== undefined && typeof resultado.length === 'number') {
        metrics['Items'] = resultado.length;
      }
      if (resultado.items && Array.isArray(resultado.items)) {
        metrics['Processados'] = resultado.items.length;
      }
      if (resultado.atividades && Array.isArray(resultado.atividades)) {
        metrics['Atividades'] = resultado.atividades.length;
      }
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

  /**
   * Enriquece os parâmetros de uma capability com resultados de capabilities anteriores
   * Isso permite que decidir_atividades_criar acesse os dados de pesquisar_atividades_disponiveis
   */
  private enrichCapabilityParams(capName: string, params: any): any {
    const enrichedParams = { ...params };

    // Para decidir_atividades_criar, injetar dados das pesquisas anteriores
    if (capName === 'decidir_atividades_criar') {
      // Buscar resultado de pesquisar_atividades_disponiveis
      const catalogResult = this.capabilityResultsMap.get('pesquisar_atividades_disponiveis');
      if (catalogResult) {
        console.log(`🔗 [Executor] Injetando catálogo de atividades em decidir_atividades_criar`);
        enrichedParams.available_activities = {
          activities: catalogResult.activities || catalogResult.catalog || [],
          valid_ids: catalogResult.valid_ids || [],
          types: catalogResult.types || [],
          categories: catalogResult.categories || []
        };
        console.log(`   📦 ${enrichedParams.available_activities.activities.length} atividades disponíveis injetadas`);
      } else {
        console.warn(`⚠️ [Executor] Resultado de pesquisar_atividades_disponiveis não encontrado`);
      }

      // Buscar resultado de pesquisar_atividades_conta
      const accountResult = this.capabilityResultsMap.get('pesquisar_atividades_conta');
      if (accountResult) {
        console.log(`🔗 [Executor] Injetando atividades da conta em decidir_atividades_criar`);
        enrichedParams.account_activities = {
          activities: accountResult.atividades || accountResult.activities || [],
          total: accountResult.total || 0
        };
        console.log(`   📦 ${enrichedParams.account_activities.activities.length} atividades da conta injetadas`);
      } else {
        console.log(`📝 [Executor] Sem atividades anteriores da conta (professor novo)`);
        enrichedParams.account_activities = { activities: [], total: 0 };
      }
    }

    // Para criar_atividade, injetar decisões
    if (capName === 'criar_atividade') {
      const decisionResult = this.capabilityResultsMap.get('decidir_atividades_criar');
      if (decisionResult) {
        console.log(`🔗 [Executor] Injetando decisões em criar_atividade`);
        enrichedParams.activities_to_create = decisionResult.chosen_activities || [];
        enrichedParams.estrategia = decisionResult.estrategia_pedagogica || decisionResult.estrategia || '';
      }
    }

    return enrichedParams;
  }

  private formatTechnicalDataForDebug(capName: string, resultado: any): Record<string, any> {
    // Dados técnicos específicos para pesquisar_atividades_disponiveis
    if (capName.includes('pesquisar_atividades_disponiveis')) {
      // O registry converte catalog → activities, então priorizar activities
      const catalog = resultado?.activities || resultado?.catalog || [];
      const validIds = resultado?.valid_ids || catalog.map((a: any) => a.id);
      const types = resultado?.types || [...new Set(catalog.map((a: any) => a.tipo))];
      const categories = resultado?.categories || [...new Set(catalog.map((a: any) => a.categoria))];
      
      console.log(`📊 [Executor:formatTechnicalData] Resultado recebido:`, {
        hasActivities: !!resultado?.activities,
        hasCatalog: !!resultado?.catalog,
        hasValidIds: !!resultado?.valid_ids,
        catalogLength: catalog.length,
        validIdsLength: validIds.length
      });
      
      return {
        resultado_resumo: `Encontradas ${catalog.length} atividade(s) disponível(is) no catálogo`,
        ids_validos: validIds,
        tipos_encontrados: types,
        categorias: categories,
        atividades: catalog.map((a: any) => ({
          id: a.id,
          titulo: a.titulo,
          tipo: a.tipo,
          categoria: a.categoria
        }))
      };
    }
    
    // Dados técnicos específicos para pesquisar_atividades_conta
    if (capName.includes('pesquisar_atividades_conta')) {
      const atividades = resultado?.atividades || resultado?.activities || [];
      return {
        resultado_resumo: `Encontradas ${atividades.length} atividade(s) na conta do professor`,
        total_atividades: atividades.length,
        atividades: atividades.map((a: any) => ({
          id: a.id,
          titulo: a.titulo || a.nome,
          tipo: a.tipo,
          data_criacao: a.created_at || a.data_criacao
        }))
      };
    }
    
    // Dados técnicos específicos para decidir_atividades_criar
    if (capName.includes('decidir_atividades')) {
      const chosen = resultado?.chosen_activities || resultado?.activities_to_create || resultado?.decisoes || [];
      const raciocinio = resultado?.raciocinio || {};
      const estrategia = resultado?.estrategia_pedagogica || resultado?.estrategia || '';
      
      return {
        resultado_resumo: `Decidido criar ${chosen.length} atividade(s)`,
        atividades_escolhidas: chosen.map((a: any) => ({
          id: a.id || a.activity_id,
          titulo: a.titulo || a.name,
          tipo: a.tipo || a.type,
          justificativa: a.justificativa || a.reason
        })),
        estrategia_pedagogica: estrategia,
        raciocinio_ia: {
          catalogo_consultado: raciocinio.catalogo_consultado ?? 'não informado',
          atividades_disponiveis: raciocinio.atividades_disponiveis ?? 0,
          atividades_anteriores_professor: raciocinio.atividades_anteriores ?? 0,
          ids_analisados: raciocinio.ids_analisados || [],
          criterios_usados: raciocinio.criterios_usados || [],
          erro_se_houver: raciocinio.erro || null
        }
      };
    }
    
    // Dados técnicos específicos para criar_atividade
    if (capName.includes('criar_atividade')) {
      const built = resultado?.activities_built || resultado?.created || [];
      const progress = resultado?.progress;
      return {
        resultado_resumo: `Construídas ${built.length} atividade(s)`,
        progresso: progress ? `${progress.completed}/${progress.total} (${progress.percentage}%)` : null,
        atividades_criadas: built.map((a: any) => ({
          id: a.id,
          titulo: a.titulo,
          tipo: a.tipo,
          status: a.status,
          campos_preenchidos: a.campos_preenchidos ? Object.keys(a.campos_preenchidos) : []
        }))
      };
    }
    
    // Fallback genérico
    return {
      resultado_resumo: this.formatResultSummary(resultado)
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
