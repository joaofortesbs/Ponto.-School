/**
 * EXECUTOR - Executador de Planos com Capabilities
 * 
 * Executa cada etapa do plano de forma sequencial,
 * processando as capabilities de cada etapa em ordem.
 * 
 * INTEGRAÇÃO COM ARQUITETURA DE 3 CHAMADAS:
 * - Usa DevelopmentCardService (Chamada 2) para reflexões com contexto acumulativo
 * - Alimenta o ContextManager após cada capability executada
 */

import { executeWithCascadeFallback } from '../services/controle-APIs-gerais-school-power';
import { findCapability, executeCapability } from './capabilities';
import { MemoryManager } from './memory-manager';
import { EXECUTION_PROMPT } from './prompts/execution-prompt';
import { SYSTEM_PROMPT_SHORT } from './prompts/system-prompt';
import { reflectionService, type CapabilityInsight } from './reflection-service';
import type { ExecutionPlan, ExecutionStep, CapabilityCall, ProgressUpdate } from '../interface-chat-producao/types';
import { createDebugEntry } from '../interface-chat-producao/debug-system/DebugStore';
import { useDebugStore } from '../interface-chat-producao/debug-system/DebugStore';
import { useChosenActivitiesStore, saveChosenActivitiesFromDecision } from '../interface-chat-producao/stores/ChosenActivitiesStore';
import { gerarConteudoAtividadesV2 } from './capabilities/GERAR_CONTEUDO/implementations/gerar-conteudo-atividades';
import { decidirAtividadesCriarV2 } from './capabilities/DECIDIR/implementations/decidir-atividades-criar';
import { pesquisarAtividadesDisponiveisV2 } from './capabilities/PESQUISAR/implementations/pesquisar-atividades-disponiveis';
import { pesquisarBnccV2 } from './capabilities/PESQUISAR/implementations/pesquisar-bncc';
import { criarAtividadeV2 } from './capabilities/CRIAR_ATIVIDADES/implementations/criar-atividade-v2';
import { salvarAtividadesBdV2 } from './capabilities/SALVAR_BD/implementations/salvar-atividades-bd';
import { criarArquivoV2 } from './capabilities/CRIAR_ARQUIVO/criar-arquivo-v2';
import { criarCompromissoCalendarioV2 } from './capabilities/CRIAR/criar-compromisso-calendario-v2';
import { gerenciarCalendarioV2 } from './capabilities/CRIAR/calendario/gerenciar-calendario';
import type { ArtifactData } from './capabilities/CRIAR_ARQUIVO/types';
import type { CapabilityInput, CapabilityOutput } from './capabilities/shared/types';
import { 
  convertCapabilityInsightToResultado,
  registerActivityCreated,
  type ResultadoCapability,
} from './context';
import { 
  executeMenteMaior, 
  type MenteMaiorInput, 
  type MenteMaiorOutput 
} from './context-engine';
import { 
  getSession, 
  addStepResult, 
  type SessionContext 
} from './context-engine';

export interface ActivitySummary {
  id: string;
  titulo: string;
  tipo: string;
  descricao?: string;
  db_id?: number;
  _contentSnapshot?: Record<string, any>;
}

export type ProgressCallback = (update: ProgressUpdate) => void;

export interface CapabilityProgressUpdate extends ProgressUpdate {
  capabilityId?: string;
  capabilityName?: string;
  capabilityStatus?: 'pending' | 'executing' | 'completed' | 'failed';
  capabilityResult?: any;
  capabilityDuration?: number;
}

export class AgentExecutor {
  private sessionId: string;
  private memory: MemoryManager;
  private onProgress: ProgressCallback | null = null;
  private conversationContext: string = '';
  private currentEtapaCapabilities: ResultadoCapability[] = [];
  private currentPlanObjective: string = '';
  private currentPlanTemas: string[] = [];
  private currentPlanDisciplina: string = '';
  private currentPlanTurma: string = '';

  constructor(sessionId: string, memory: MemoryManager) {
    this.sessionId = sessionId;
    this.memory = memory;
    
    // 🔥 HANDLER GLOBAL: Capturar unhandled promise rejections
    if (typeof window !== 'undefined' && !AgentExecutor.globalHandlerRegistered) {
      window.addEventListener('unhandledrejection', (event) => {
        console.error(`
╔════════════════════════════════════════════════════════════════════════╗
║ 🚨 UNHANDLED PROMISE REJECTION - CAPTURED BY GLOBAL HANDLER
║════════════════════════════════════════════════════════════════════════║
║ reason: ${event.reason}
║ reason type: ${typeof event.reason}
║ reason.message: ${event.reason?.message || 'N/A'}
║ reason.stack: ${event.reason?.stack?.substring(0, 300) || 'N/A'}
║════════════════════════════════════════════════════════════════════════║
        `);
        // NÃO previne o erro padrão - deixar o browser logar também
      });
      AgentExecutor.globalHandlerRegistered = true;
      console.log('✅ [Executor] Global unhandledrejection handler registered');
    }
  }

  setProgressCallback(callback: ProgressCallback): void {
    this.onProgress = callback;
  }
  
  setConversationContext(context: string): void {
    this.conversationContext = context;
    console.log(`📝 [Executor] Contexto da conversa definido (${context.length} chars)`);
  }

  /**
   * Reseta o estado do executor para permitir nova execução na mesma sessão
   * Chamado pelo orchestrator antes de cada nova execução
   */
  resetForNewExecution(): void {
    console.log('🔄 [Executor] Resetando estado para nova execução');
    this.capabilityResultsMap.clear();
    this.currentEtapaCapabilities = [];
    this.conversationContext = '';
    this.currentPlanObjective = '';
    this.currentPlanTemas = [];
    this.currentPlanDisciplina = '';
    this.currentPlanTurma = '';
    this.onProgress = null;
    console.log('✅ [Executor] Estado limpo para nova execução');
  }

  getCollectedItems(): { activities: ActivitySummary[]; artifacts: ArtifactData[] } {
    const activities: ActivitySummary[] = [];
    const artifacts: ArtifactData[] = [];

    console.error(`
═══════════════════════════════════════════════════════════════════════
🔍 [Executor] getCollectedItems() — Coletando itens criados
   Map keys: ${Array.from(this.capabilityResultsMap.keys()).join(', ') || 'NENHUMA'}
   Map size: ${this.capabilityResultsMap.size}
═══════════════════════════════════════════════════════════════════════`);

    const criarAtividadeResult = this.capabilityResultsMap.get('criar_atividade');
    if (criarAtividadeResult?.success) {
      const builtActivities = criarAtividadeResult.data?.activities_built || criarAtividadeResult.data?.atividades_criadas || [];
      
      const salvarResult = this.capabilityResultsMap.get('salvar_atividades_bd');
      const savedMap = new Map<string, number>();
      const salvarResultsArray = salvarResult?.data?.results || salvarResult?.data?.saved_activities || [];
      if (salvarResult?.success && salvarResultsArray.length > 0) {
        for (const saved of salvarResultsArray) {
          const origId = saved.original_id || saved.id;
          const dbId = saved.db_id || saved.activity_id;
          if (origId && dbId) {
            savedMap.set(origId, dbId);
          }
        }
      }

      for (const act of builtActivities) {
        const actId = act.id || act.original_id || act.activity_id || `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const actTipo = act.tipo || act.activity_type || act.type || 'atividade';
        
        let contentSnapshot: Record<string, any> | undefined;
        const metaKeysToSkip = ['success', 'activityId', 'activityType', 'generatedAt', 'apiCallDuration', 'persistedAt', 'syncedAt', 'hasFullDataInStore', 'fieldsCount'];
        try {
          const constructedKey = `constructed_${actTipo}_${actId}`;
          const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(constructedKey) : null;
          if (raw) {
            const parsed = JSON.parse(raw);
            const innerData = parsed?.data || parsed;
            if (innerData) {
              const snapshotKeys = Object.keys(innerData).filter(k => !metaKeysToSkip.includes(k));
              if (snapshotKeys.length > 2) {
                contentSnapshot = {};
                for (const k of snapshotKeys) {
                  contentSnapshot[k] = innerData[k];
                }
                console.error(`📸 [getCollectedItems] Snapshot localStorage para ${actId}: ${snapshotKeys.length} campos`);
              }
            }
          }
        } catch (e) {
          console.warn(`⚠️ [getCollectedItems] Erro snapshot localStorage para ${actId}:`, e);
        }
        
        if (!contentSnapshot || Object.keys(contentSnapshot).length <= 2) {
          try {
            if (typeof window !== 'undefined' && (window as any).__ContentSyncService) {
              const syncData = (window as any).__ContentSyncService.getContent(actId, actTipo);
              if (syncData && Object.keys(syncData).length > 2) {
                contentSnapshot = { ...(contentSnapshot || {}), ...syncData };
                console.error(`📸 [getCollectedItems] Snapshot ContentSync para ${actId}: ${Object.keys(syncData).length} campos`);
              }
            }
          } catch (e) {
            console.warn(`⚠️ [getCollectedItems] Erro snapshot ContentSync para ${actId}:`, e);
          }
        }

        if (!contentSnapshot || Object.keys(contentSnapshot).length <= 2) {
          try {
            const storeActivity = useChosenActivitiesStore.getState().getActivityById(actId);
            if (storeActivity) {
              const genFields = storeActivity.dados_construidos?.generated_fields || {};
              const campos = storeActivity.campos_preenchidos || {};
              const consolidated = { ...campos, ...genFields };
              const storeKeys = Object.keys(consolidated);
              if (storeKeys.length > 0) {
                contentSnapshot = { ...contentSnapshot, ...consolidated };
                console.error(`📸 [getCollectedItems] Snapshot store para ${actId}: ${storeKeys.length} campos`);
              }
            }
          } catch (e) {
            console.warn(`⚠️ [getCollectedItems] Erro snapshot store para ${actId}:`, e);
          }
        }
        
        if (!contentSnapshot?.textContent) {
          try {
            const keysToTry = [
              `text_content_${actTipo}_${actId}`,
              `text_content_atividade-textual_${actId}`,
            ];
            let textParsed: any = null;
            for (const key of keysToTry) {
              const textRaw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
              if (textRaw) {
                textParsed = JSON.parse(textRaw);
                if (textParsed?.textContent) {
                  console.error(`📸 [getCollectedItems] TextVersion found via key: ${key}`);
                  break;
                }
                textParsed = null;
              }
            }
            if (!textParsed && typeof localStorage !== 'undefined') {
              const allKeys = Object.keys(localStorage);
              const matchingKey = allKeys.find(k => k.startsWith('text_content_') && k.includes(actId));
              if (matchingKey) {
                const raw = localStorage.getItem(matchingKey);
                if (raw) textParsed = JSON.parse(raw);
                console.error(`📸 [getCollectedItems] TextVersion found via scan: ${matchingKey}`);
              }
            }
            if (textParsed?.textContent) {
              contentSnapshot = {
                ...(contentSnapshot || {}),
                textContent: textParsed.textContent,
                sections: textParsed.sections || [],
                versionType: 'text',
                isTextVersion: true,
              };
              console.error(`📸 [getCollectedItems] TextVersion content para ${actId}: textContent=${textParsed.textContent.length} chars, sections=${textParsed.sections?.length || 0}`);
            }
          } catch (e) {
            console.warn(`⚠️ [getCollectedItems] Erro text_content lookup para ${actId}:`, e);
          }
        }

        const actDescricao = act.descricao || act.description || act.objetivo || 
          contentSnapshot?.descricao || contentSnapshot?.description || 
          contentSnapshot?.objetivo || contentSnapshot?.tema || '';

        activities.push({
          id: actId,
          titulo: act.titulo || act.name || act.title || 'Atividade',
          tipo: actTipo,
          descricao: actDescricao,
          db_id: act.db_id || savedMap.get(actId),
          _contentSnapshot: contentSnapshot,
        });
      }

      console.error(`✅ [getCollectedItems] Atividades coletadas: ${activities.length}`);
      activities.forEach((a, i) => console.error(`   ${i + 1}. ${a.titulo} (${a.tipo}) db_id=${a.db_id || 'N/A'}`));
    } else {
      console.error(`⚠️ [getCollectedItems] criar_atividade não encontrado ou falhou`);
      if (criarAtividadeResult) {
        console.error(`   success=${criarAtividadeResult.success}, data keys: ${criarAtividadeResult.data ? Object.keys(criarAtividadeResult.data).join(', ') : 'N/A'}`);
      }
    }

    for (const [key, value] of this.capabilityResultsMap.entries()) {
      if (key.startsWith('criar_arquivo') && value?.success && value?.data?.artifact) {
        artifacts.push(value.data.artifact);
        console.error(`✅ [getCollectedItems] Artifact coletado de '${key}': ${value.data.artifact?.metadata?.titulo || 'sem título'}`);
      }
    }

    console.error(`📊 [getCollectedItems] TOTAL: ${activities.length} atividades, ${artifacts.length} artifacts`);

    return { activities, artifacts };
  }

  /**
   * FALLBACK: Constrói uma sessão mínima quando o SessionStore não tem dados.
   * Em condições normais, o orchestrator sempre cria a sessão via createSession()
   * ANTES da execução — este método só é ativado em edge cases.
   * 
   * BRIDGE NOTE: Durante a migração do MemoryManager legado para o ContextEngine,
   * ambos os sistemas coexistem. O SessionStore é o novo source-of-truth mas
   * o MemoryManager ainda é mantido para backward compatibility até remoção completa.
   */
  private buildMinimalSession(plan: ExecutionPlan): SessionContext {
    console.warn('⚠️ [Executor] buildMinimalSession ativado — SessionStore vazio para sessão', this.sessionId);
    console.warn('⚠️ [Executor] Isso indica que o orchestrator não criou a sessão antes da execução');
    return {
      sessionId: this.sessionId,
      userId: '',
      originalGoal: plan.objetivo,
      conversationHistory: [],
      currentPlan: {
        planId: plan.planId,
        objetivo: plan.objetivo,
        totalEtapas: plan.etapas.length,
        etapasCompletas: 0,
        etapas: plan.etapas.map(e => ({
          ordem: e.ordem,
          titulo: e.titulo || e.descricao,
          descricao: e.descricao,
          status: (e.status === 'concluida' ? 'concluida' : 'pendente') as any,
          capabilities: e.capabilities?.map(c => c.nome) || [e.funcao],
        })),
      },
      stepResults: [],
      activitiesCreated: [],
      previousInteractions: [],
      interactionLedger: [],
    };
  }

  /**
   * Obtém o user_id autenticado do localStorage
   * Retorna null se o usuário não estiver autenticado
   */
  private getAuthenticatedUserId(): string | null {
    if (typeof localStorage === 'undefined') {
      console.warn('⚠️ [Executor] localStorage não disponível');
      return null;
    }

    const userId = localStorage.getItem('user_id');
    if (userId) {
      return userId;
    }

    const neonUser = localStorage.getItem('neon_user');
    if (neonUser) {
      try {
        const parsed = JSON.parse(neonUser);
        if (parsed?.id) {
          return parsed.id;
        }
      } catch (e) {
      }
    }

    console.warn('⚠️ [Executor] Usuário não autenticado - user_id não encontrado');
    return null;
  }

  private emitProgress(update: ProgressUpdate | CapabilityProgressUpdate): void {
    console.log('📊 [Executor] Progresso:', update);
    if (this.onProgress) {
      this.onProgress(update as ProgressUpdate);
    }
  }

  async executePlan(plan: ExecutionPlan): Promise<string> {
    console.log('▶️ [Executor] Iniciando execução do plano:', plan.planId);
    console.error(`
╔════════════════════════════════════════════════════════════════════════╗
║ 🎯 EXECUTOR.executePlan() ENTRY POINT - SESSION: ${this.sessionId}
║════════════════════════════════════════════════════════════════════════║
║ planId: ${plan.planId}
║ objetivo: ${plan.objetivo.substring(0, 80)}...
║ etapas: ${plan.etapas.length}
║════════════════════════════════════════════════════════════════════════║
    `);

    this.currentPlanObjective = plan.objetivo || '';
    this.currentPlanTemas = plan.temas_extraidos || [];
    this.currentPlanDisciplina = plan.disciplina_extraida || '';
    this.currentPlanTurma = plan.turma_extraida || '';
    
    console.log(`🎯 [Executor] Temas do plano: [${this.currentPlanTemas.join(', ')}]`);
    console.log(`🎯 [Executor] Disciplina do plano: ${this.currentPlanDisciplina}`);
    console.log(`🎯 [Executor] Turma do plano: ${this.currentPlanTurma}`);
    
    this.capabilityResultsMap.clear();
    console.log('🧹 [Executor] Mapa de resultados limpo para nova execução');

    // Inicializar sessão de debug
    useDebugStore.getState().initSession(this.sessionId);
    
    // Inicializar sessão do ChosenActivitiesStore para sincronização
    useChosenActivitiesStore.getState().initSession(this.sessionId);
    
    console.error('✅ [Executor] Stores initialized');

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
    let criticalFailure = false;
    let criticalErrorMessage = '';

    for (const etapa of plan.etapas) {
      // Se houve falha crítica, não executar mais etapas
      if (criticalFailure) {
        console.error(`🛑 [Executor] Skipping etapa ${etapa.ordem} due to critical failure in previous step`);
        break;
      }
      
      // Limpar array de capabilities da etapa anterior para contexto limpo
      this.currentEtapaCapabilities = [];
      
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

        // ═══════════════════════════════════════════════════════════════
        // HARD ENFORCEMENT: gerar_conteudo_atividades MUST be followed by criar_atividade
        // Se esta etapa executou gerar_conteudo e não há criar_atividade nas próximas etapas,
        // injeta dinamicamente criar_atividade + salvar_atividades_bd no plano
        // ═══════════════════════════════════════════════════════════════
        const etapaCapNames = (etapa.capabilities || []).map(c => c.nome);
        const justRanGerarConteudo = etapaCapNames.includes('gerar_conteudo_atividades');
        
        if (justRanGerarConteudo) {
          const remainingEtapas = plan.etapas.filter(e => e.ordem > etapa.ordem);
          const remainingCapNames = remainingEtapas.flatMap(e => (e.capabilities || []).map(c => c.nome));
          const hasCriarAtividadeAhead = remainingCapNames.includes('criar_atividade');
          
          if (!hasCriarAtividadeAhead) {
            console.log('🔴 [Executor] HARD ENFORCEMENT: gerar_conteudo_atividades executado sem criar_atividade nas próximas etapas — injetando!');
            const ts = Date.now();
            const hasSalvarAhead = remainingCapNames.includes('salvar_atividades_bd');
            
            const injectedCaps: CapabilityCall[] = [
              {
                id: `cap-injected-criar-${ts}`,
                nome: 'criar_atividade',
                displayName: 'Vou construir as atividades com o conteúdo gerado',
                categoria: 'CRIAR' as CapabilityCall['categoria'],
                parametros: {},
                status: 'pending' as const,
                ordem: 1,
              },
            ];
            if (!hasSalvarAhead) {
              injectedCaps.push({
                id: `cap-injected-salvar-${ts}`,
                nome: 'salvar_atividades_bd',
                displayName: 'Vou salvar suas atividades no banco de dados',
                categoria: 'SALVAR_BD' as CapabilityCall['categoria'],
                parametros: {},
                status: 'pending' as const,
                ordem: 2,
              });
            }
            
            const injectedEtapa: ExecutionStep = {
              ordem: etapa.ordem + 1,
              titulo: 'Construir e salvar suas atividades',
              descricao: 'Vou montar as atividades com o conteúdo gerado e salvar no banco de dados',
              funcao: 'criar_atividade',
              parametros: {},
              status: 'pendente' as const,
              capabilities: injectedCaps,
            };
            
            const insertIndex = plan.etapas.indexOf(etapa) + 1;
            plan.etapas.splice(insertIndex, 0, injectedEtapa);
            
            for (let i = insertIndex; i < plan.etapas.length; i++) {
              plan.etapas[i].ordem = i + 1;
            }
            
            console.log(`✅ [Executor] Etapa injetada na posição ${insertIndex + 1} do plano. Total etapas agora: ${plan.etapas.length}`);
          }
        }

        // ═══════════════════════════════════════════════════════════════
        // MENTE MAIOR: Chamada UNIFICADA de narrativa + replanning
        // Substitui as 2 chamadas separadas (generateNarrativeForStep + checkReplanning)
        // por uma única chamada ReAct que gera ambos simultaneamente
        // ═══════════════════════════════════════════════════════════════
        const nextEtapa = plan.etapas.find(e => e.ordem === etapa.ordem + 1);
        const isLastStep = !nextEtapa || plan.etapas.indexOf(etapa) >= plan.etapas.length - 1;
        
        try {
          const session = getSession(this.sessionId);
          
          const menteMaiorInput: MenteMaiorInput = {
            session: session || this.buildMinimalSession(plan),
            completedStep: {
              index: etapa.ordem,
              title: etapa.titulo || etapa.descricao,
              description: etapa.descricao,
              capabilityResults: this.currentEtapaCapabilities.map((c, capIdx) => ({
                name: c.capabilityName,
                displayName: c.displayName,
                success: c.sucesso,
                summary: this.formatResultSummary(etapaResultados[capIdx] ?? c.dados ?? c).substring(0, 300),
                discoveries: c.descobertas,
                decisions: c.decisoes,
                metrics: c.metricas,
              })),
            },
            nextStep: nextEtapa ? {
              index: nextEtapa.ordem,
              title: nextEtapa.titulo || nextEtapa.descricao,
              description: nextEtapa.descricao,
              capabilities: nextEtapa.capabilities?.map(c => c.displayName || c.nome) || [nextEtapa.funcao],
            } : null,
            remainingSteps: plan.etapas
              .filter(e => e.ordem > etapa.ordem)
              .map(e => ({
                index: e.ordem,
                title: e.titulo || e.descricao,
                capabilities: e.capabilities?.map(c => c.nome) || [e.funcao],
              })),
            isLastStep,
            availableCapabilities: Array.from(AgentExecutor.V2_REGISTRY.keys()),
          };

          const menteMaiorResult = await executeMenteMaior(menteMaiorInput);
          
          // Registrar resultado da etapa no SessionStore
          if (session) {
            addStepResult(this.sessionId, {
              stepIndex: etapa.ordem,
              stepTitle: etapa.titulo || etapa.descricao,
              capabilityResults: menteMaiorInput.completedStep.capabilityResults,
              narrativeGenerated: menteMaiorResult.narrative,
              timestamp: Date.now(),
            });
          }

          // Emitir narrativa
          if (menteMaiorResult.narrative) {
            this.emitProgress({
              sessionId: this.sessionId,
              status: 'narrative',
              etapaAtual: etapa.ordem,
              descricao: menteMaiorResult.narrative,
            } as any);
            console.log(`🧠 [MenteMaior] Narrativa: ${menteMaiorResult.narrative.substring(0, 80)}...`);
          }

          // Emitir replan (se necessário)
          if (menteMaiorResult.replan.needed && menteMaiorResult.replan.reason) {
            console.log(`🔄 [MenteMaior] Replanning: ${menteMaiorResult.replan.reason}`);
            
            this.emitProgress({
              sessionId: this.sessionId,
              status: 'replan',
              etapaAtual: etapa.ordem,
              descricao: menteMaiorResult.replan.reason,
            } as any);
          }
        } catch (menteMaiorError) {
          console.warn('⚠️ [Executor] Erro na Mente Maior (não crítico):', menteMaiorError);
        }

        await this.delay(300);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : 'No stack trace';
        
        console.error(`
╔════════════════════════════════════════════════════════════════════════╗
║ ❌ EXECUTOR.executePlan() CAUGHT ERROR IN ETAPA ${etapa.ordem}
║════════════════════════════════════════════════════════════════════════║
║ message: ${errorMessage}
║ type: ${error instanceof Error ? error.constructor.name : typeof error}
║════════════════════════════════════════════════════════════════════════║
        `);
        
        console.error(`❌ [Executor] Erro na etapa ${etapa.ordem}:`, error);

        await this.memory.saveToWorkingMemory({
          tipo: 'erro',
          conteudo: `Erro na etapa ${etapa.ordem}: ${errorMessage}`,
          etapa: etapa.ordem,
          funcao: etapa.funcao,
        });

        this.emitProgress({
          sessionId: this.sessionId,
          status: 'erro',
          etapaAtual: etapa.ordem,
          erro: errorMessage,
        });
        
        // Verificar se é uma falha crítica (de capability V2)
        if (errorMessage.includes('Capability crítica') || errorMessage.includes('CRITICAL V2')) {
          criticalFailure = true;
          criticalErrorMessage = errorMessage;
          console.error(`🛑 [Executor] CRITICAL FAILURE detected - halting plan execution`);
        }
      }
    }

    const relatorio = await this.generateFinalReport(plan, results);

    // Emitir status final baseado no resultado real
    if (criticalFailure) {
      this.emitProgress({
        sessionId: this.sessionId,
        status: 'erro',
        descricao: `Plano interrompido devido a erro crítico: ${criticalErrorMessage}`,
      });
    } else {
      this.emitProgress({
        sessionId: this.sessionId,
        status: 'concluido',
        descricao: 'Plano executado com sucesso!',
      });
    }

    return relatorio;
  }

  // Mapa para armazenar resultados de capabilities entre etapas
  private capabilityResultsMap: Map<string, any> = new Map();

  private static readonly V2_REGISTRY: Map<string, (input: CapabilityInput) => Promise<CapabilityOutput>> = new Map([
    ['pesquisar_atividades_disponiveis', pesquisarAtividadesDisponiveisV2],
    ['pesquisar_bncc', pesquisarBnccV2],
    ['decidir_atividades_criar', decidirAtividadesCriarV2],
    ['gerar_conteudo_atividades', gerarConteudoAtividadesV2],
    ['criar_atividade', criarAtividadeV2],
    ['salvar_atividades_bd', salvarAtividadesBdV2],
    ['criar_arquivo', criarArquivoV2],
    ['gerenciar_calendario', gerenciarCalendarioV2],
    ['criar_compromisso_calendario', gerenciarCalendarioV2],
  ]);
  
  // Flag para registrar o handler global apenas uma vez
  private static globalHandlerRegistered: boolean = false;

  private async executeCapabilities(etapa: ExecutionStep): Promise<any[]> {
    const capabilities = etapa.capabilities || [];
    const results: any[] = [];
    const objectiveIndex = etapa.ordem - 1;

    reflectionService.setObjectiveTitle(objectiveIndex, etapa.titulo || etapa.descricao);

    console.log(`📦 [Executor] Executando ${capabilities.length} capabilities na etapa ${etapa.ordem}`);
    console.log(`📦 [Executor] Resultados anteriores disponíveis:`, Array.from(this.capabilityResultsMap.keys()));
    
    // 🔥 GUARD LOG: Confirmar entrada de executeCapabilities
    console.error(`
╔════════════════════════════════════════════════════════════════════════╗
║ 🚀 ENTER executeCapabilities() - ETAPA ${etapa.ordem}
║════════════════════════════════════════════════════════════════════════║
║ Etapa: ${etapa.titulo || etapa.descricao}
║ Número de capabilities: ${capabilities.length}
║ Nomes das capabilities: ${capabilities.map(c => c.nome).join(', ') || 'NENHUMA'}
║ Map status: ${this.capabilityResultsMap.size} resultados anteriores
║════════════════════════════════════════════════════════════════════════║
    `);
    
    if (capabilities.length === 0) {
      console.warn('⚠️ [Executor] AVISO: Esta etapa não tem capabilities! Retornando array vazio.');
      return [];
    }

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
          
          // ═══════════════════════════════════════════════════════════════════════
          // VERSÃO V2: Usar API-First pattern para capabilities críticas
          // ═══════════════════════════════════════════════════════════════════════
          if (AgentExecutor.V2_REGISTRY.has(capName)) {
            console.error(`
═══════════════════════════════════════════════════════════════════════
🚀 [Executor] USING V2 API-FIRST for ${capName}
═══════════════════════════════════════════════════════════════════════
📦 Map Status ANTES de executar ${capName}:
   - Tamanho: ${this.capabilityResultsMap.size}
   - Chaves: ${Array.from(this.capabilityResultsMap.keys()).join(', ') || 'NENHUMA'}
═══════════════════════════════════════════════════════════════════════`);
            
            // Log detalhado de cada entrada no Map
            if (this.capabilityResultsMap.size > 0) {
              for (const [key, value] of this.capabilityResultsMap.entries()) {
                console.error(`   📄 [${key}]: success=${value?.success}, hasData=${!!value?.data}, dataKeys=${value?.data ? Object.keys(value.data).join(',') : 'N/A'}`);
              }
            }
            
            // Obter user_id do localStorage (onde o sistema de autenticação salva)
            const authenticatedUserId = this.getAuthenticatedUserId();
            
            const userPromptFromPlan = this.currentPlanObjective || '';
            const temaLimpo = this.currentPlanTemas.length > 0 
              ? this.currentPlanTemas.join(', ') 
              : '';
            
            const capabilityInput: CapabilityInput = {
              capability_id: capName,
              execution_id: `exec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              context: {
                ...capability.parametros,
                user_id: authenticatedUserId,
                professor_id: authenticatedUserId,
                conversation_context: this.conversationContext || capability.parametros?.conversation_context || capability.parametros?.contexto || '',
                user_objective: capability.parametros?.user_objective || capability.parametros?.contexto || userPromptFromPlan || '',
                user_prompt: capability.parametros?.solicitacao || capability.parametros?.contexto || userPromptFromPlan || '',
                session_id: this.sessionId,
                tema_limpo: temaLimpo,
                temas_extraidos: this.currentPlanTemas,
                disciplina_extraida: this.currentPlanDisciplina,
                turma_extraida: this.currentPlanTurma,
              },
              previous_results: this.capabilityResultsMap
            };
            
            if (temaLimpo) {
              console.log(`🎯 [Executor] Tema limpo injetado para ${capName}: "${temaLimpo}"`);
            }
            
            console.error(`🔐 [Executor] user_id para ${capName}: ${authenticatedUserId || 'NÃO AUTENTICADO'}`);
            
            console.log(`📝 [Executor] conversation_context length: ${capabilityInput.context.conversation_context?.length || 0}`);
            
            console.error(`📊 [Executor] CapabilityInput built with ${this.capabilityResultsMap.size} previous results:
   Keys: ${Array.from(this.capabilityResultsMap.keys()).join(', ')}`);
            
            // Executar a capability V2 correspondente
            let v2Result: CapabilityOutput | null = null;
            
            const v2Handler = AgentExecutor.V2_REGISTRY.get(capName);
            if (v2Handler) {
              v2Result = await v2Handler(capabilityInput);
            }
            
            // Validar que temos um resultado
            if (!v2Result) {
              throw new Error(`Capability V2 "${capName}" retornou resultado nulo ou indefinido`);
            }
            
            resultado = v2Result;
            
            // Log detalhado do resultado V2
            console.error(`
═══════════════════════════════════════════════════════════════════════
${v2Result.success ? '✅' : '❌'} [Executor] V2 RESULT for ${capName}
═══════════════════════════════════════════════════════════════════════
success: ${v2Result.success}
has data: ${!!v2Result.data}
data keys: ${v2Result.data ? Object.keys(v2Result.data).join(', ') : 'NONE'}
error: ${v2Result.error ? JSON.stringify(v2Result.error) : 'NONE'}
═══════════════════════════════════════════════════════════════════════`);
            
            // Se a V2 retornou success=false, tratar como erro (crítico ou não dependendo da capability)
            if (!v2Result.success) {
              const errorMsg = v2Result.error 
                ? (typeof v2Result.error === 'string' ? v2Result.error : v2Result.error.message || 'Erro desconhecido')
                : 'Capability V2 retornou success=false sem mensagem de erro';
              
              console.error(`❌ [Executor] V2 capability ${capName} FAILED: ${errorMsg}`);
              
              createDebugEntry(
                capId,
                capDisplayName,
                'error',
                `Capability "${capDisplayName}" falhou: ${errorMsg}`,
                'high',
                { error: v2Result.error, v2_result: v2Result }
              );
              
              if (capName === 'criar_atividade') {
                console.error(`⚠️ [Executor] criar_atividade failed but NOT throwing - cards will remain visible`);
                
                this.emitProgress({
                  sessionId: this.sessionId,
                  type: 'construction:pipeline_error',
                  error: errorMsg,
                  keepCardsVisible: true
                } as any);
                
              } else if (capName === 'criar_arquivo') {
                console.error(`⚠️ [Executor] criar_arquivo failed but NOT throwing - artifact generation is non-critical`);
                
              } else if (capName === 'criar_compromisso_calendario') {
                console.error(`⚠️ [Executor] criar_compromisso_calendario failed but NOT throwing - calendar is non-critical`);
                
              } else {
                throw new Error(`Capability crítica "${capName}" falhou: ${errorMsg}`);
              }
            }
          } else {
            // Injetar resultados de capabilities anteriores quando necessário
            const enrichedParams = this.enrichCapabilityParams(capName, capability.parametros);
            
            resultado = await executeCapability(capName, enrichedParams);
          }
          
          // Armazenar resultado para uso em capabilities subsequentes
          this.capabilityResultsMap.set(capName, resultado);
          
          // LOG DETALHADO após salvar no Map
          console.error(`
═══════════════════════════════════════════════════════════════════════
💾 [Executor] SALVO NO MAP: ${capName}
═══════════════════════════════════════════════════════════════════════
   - Map tamanho APÓS: ${this.capabilityResultsMap.size}
   - Chaves no Map: ${Array.from(this.capabilityResultsMap.keys()).join(', ')}
   - Resultado salvo: success=${resultado?.success}, hasData=${!!resultado?.data}
   - Data keys: ${resultado?.data ? Object.keys(resultado.data).join(', ') : 'N/A'}
═══════════════════════════════════════════════════════════════════════`);
          
          // Salvar atividades decididas no store para sincronização com criar_atividade
          if (capName.includes('decidir_atividades_criar') || capName.includes('decidir_atividades')) {
            console.error(`
═══════════════════════════════════════════════════════════════════════
🎯 [Executor] SAVING CHOSEN ACTIVITIES FROM decidir_atividades_criar
═══════════════════════════════════════════════════════════════════════`);
            
            const saved = saveChosenActivitiesFromDecision(resultado);
            
            if (saved) {
              console.log(`🎯 [Executor] Atividades decididas salvas no ChosenActivitiesStore`);
              
              // 🔥 VERIFICAÇÃO CRÍTICA: Confirmar que dados foram persistidos
              const storeState = useChosenActivitiesStore.getState();
              const verificationActivities = storeState.getChosenActivities();
              
              console.error(`
✅ [Executor] POST-SAVE VERIFICATION:
   - Store.getChosenActivities(): ${verificationActivities.length} atividades
   - Store.isDecisionComplete: ${storeState.isDecisionComplete}
   - Store.sessionId: ${storeState.sessionId}
              `);
              
              if (verificationActivities.length === 0) {
                console.error('❌ CRITICAL: Activities NOT persisted to store after save!');
              } else {
                console.error(`✅ CONFIRMED: ${verificationActivities.length} activities ready for gerar_conteudo_atividades`);
              }
              
              // Emitir evento para UI atualizar
              const chosenActivities = storeState.getActivitiesForConstruction();
              window.dispatchEvent(new CustomEvent('agente-jota-activities-decided', {
                detail: {
                  activities: chosenActivities,
                  total: chosenActivities.length,
                  estrategia: resultado?.estrategia_pedagogica || ''
                }
              }));
              
              // 🔥 EMITIR construction:activities_ready IMEDIATAMENTE após decidir
              // Isso garante que a ConstructionInterface receba as atividades
              // independente do resultado da capability criar_atividade
              console.log(`🏗️ [Executor] Emitindo construction:activities_ready com ${chosenActivities.length} atividades`);
              this.emitProgress({
                sessionId: this.sessionId,
                type: 'construction:activities_ready',
                activities: chosenActivities,
                capabilityId: capId
              } as any);
              
              // 🔥 DELAY para garantir que o estado do store seja propagado
              await new Promise(resolve => setTimeout(resolve, 100));
              console.error('⏱️ [Executor] 100ms delay after save to ensure store sync');
              
            } else {
              console.error('❌ [Executor] FAILED to save chosen activities!');
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
          
          // 🔥 PROCESSAR debug_log RETORNADO PELAS CAPABILITIES V2
          // Isso garante que todos os logs detalhados gerados internamente
          // pela capability (incluindo campos gerados, validações, etc.)
          // sejam exibidos no painel de debug
          if (resultado?.debug_log && Array.isArray(resultado.debug_log)) {
            console.log(`📝 [Executor] Processing ${resultado.debug_log.length} debug entries from V2 capability`);
            
            for (const entry of resultado.debug_log) {
              // Mapear tipos do debug_log para DebugEntryType
              const entryType = this.mapDebugLogType(entry.type);
              
              createDebugEntry(
                capId,
                capDisplayName,
                entryType,
                entry.narrative || entry.message || 'Log entry',
                entry.severity || 'low',
                entry.technical_data || entry.data || undefined
              );
            }
          }
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
        
        // Verificar se a capability retornou sucesso (para V2 capabilities)
        const capabilitySuccess = resultado?.success !== false;

        // Debug: Capability concluída (com status correto)
        createDebugEntry(
          capId,
          capDisplayName,
          capabilitySuccess ? 'action' : 'error',
          capabilitySuccess 
            ? `Capability "${capDisplayName}" concluída com sucesso em ${duration}ms. Todos os dados foram processados corretamente.`
            : `Capability "${capDisplayName}" falhou em ${duration}ms. Verifique os logs para mais detalhes.`,
          capabilitySuccess ? 'low' : 'high',
          { duration_ms: duration, success: capabilitySuccess }
        );

        // Emitir eventos especiais para capability criar_atividade
        if (capName.includes('criar_atividade') || capName.includes('criar-atividade')) {
          this.emitConstructionEvents(resultado, capId);
        }

        this.emitProgress({
          sessionId: this.sessionId,
          status: 'executando',
          etapaAtual: etapa.ordem,
          descricao: `${capDisplayName} - ${capabilitySuccess ? 'Concluído' : 'Falhou'}`,
          capabilityId: capId,
          capabilityName: capName,
          capabilityStatus: capabilitySuccess ? 'completed' : 'failed',
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
          success: capabilitySuccess,
          discovered: this.extractDiscoveries(resultado),
          decided: this.extractDecisions(resultado),
          metrics: this.extractMetrics(resultado),
        };
        reflectionService.addCapabilityInsight(objectiveIndex, insight);

        const resultadoCapability: ResultadoCapability = convertCapabilityInsightToResultado(insight, resultado);
        this.currentEtapaCapabilities.push(resultadoCapability);
        console.log(`📦 [Executor] Capability ${capName} adicionada ao contexto da etapa (${this.currentEtapaCapabilities.length} total)`);

        // Finalizar debug para esta capability
        useDebugStore.getState().endCapability(capId);

        await this.delay(200);

      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : '';

        console.error(`
╔════════════════════════════════════════════════════════════════════════╗
║ ❌ CAPABILITY "${capName}" - EXCEPTION CAUGHT
║════════════════════════════════════════════════════════════════════════║
║ capId: ${capId}
║ capName: ${capName}
║ capDisplayName: ${capDisplayName}
║ errorMessage: ${errorMessage}
║ errorType: ${error instanceof Error ? error.constructor.name : typeof error}
║ duration: ${duration}ms
║ etapa: ${etapa.ordem}
║════════════════════════════════════════════════════════════════════════║
        `);

        // Debug: Erro na capability
        createDebugEntry(
          capId,
          capDisplayName,
          'error',
          `Erro ao executar "${capDisplayName}": ${errorMessage}. A execução foi interrompida para esta capability.`,
          'high',
          { error: errorMessage, duration_ms: duration, stack: errorStack }
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

        const resultadoCapability: ResultadoCapability = convertCapabilityInsightToResultado(insight);
        this.currentEtapaCapabilities.push(resultadoCapability);
        console.log(`📦 [Executor] Capability ${capName} (ERRO) adicionada ao contexto da etapa`);

        // Finalizar debug mesmo com erro
        useDebugStore.getState().endCapability(capId);
        
        // Para capabilities V2 críticas (exceto criar_atividade), propagar o erro para interromper todo o fluxo
        // criar_atividade NÃO é crítica - os cards de construção devem permanecer visíveis mesmo após falha
        if (AgentExecutor.V2_REGISTRY.has(capName) && capName !== 'criar_atividade') {
          console.error(`🛑 [Executor] CRITICAL V2 capability "${capName}" failed - halting pipeline execution`);
          throw error; // Re-lançar para interromper executeCapabilitiesForEtapa
        }
        
        // Para criar_atividade, emitir evento de erro mas manter cards visíveis
        if (capName === 'criar_atividade') {
          console.error(`⚠️ [Executor] criar_atividade failed but continuing - cards will remain visible with error status`);
          
          // Emitir evento para marcar atividades com erro mas mantê-las visíveis
          this.emitProgress({
            sessionId: this.sessionId,
            type: 'construction:pipeline_error',
            error: errorMessage,
            keepCardsVisible: true
          } as any);
        }
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
      const data = resultado?.data || resultado || {};
      const count = data.count || data.catalog?.length || resultado?.count || resultado?.catalog?.length || resultado?.activities?.length || resultado?.total || 0;
      const types = data.types?.length || resultado?.types?.length || 0;
      const ids = data.valid_ids?.length || resultado?.valid_ids?.length || count;
      const catalogIds = (data.catalog || resultado?.catalog || []).map((a: any) => a?.id).filter(Boolean).join(', ');
      return `Consultei o catálogo de atividades. Encontrei ${count} atividade(s) disponível(is) com ${types} tipo(s). IDs: ${catalogIds || 'N/A'}.`;
    }
    if (capName === 'pesquisar_bncc') {
      const data = resultado?.data || resultado || {};
      const count = data.count || resultado?.count || 0;
      const componentes = data.componentes || resultado?.componentes || [];
      const habs = data.habilidades || resultado?.habilidades || [];
      const codigos = habs.map((h: any) => h?.codigo).filter(Boolean).join(', ');
      return `Consultei a BNCC (Base Nacional Comum Curricular). Encontrei ${count} habilidade(s) curricular(es) de ${componentes.join(', ') || 'componente não especificado'}. Códigos: ${codigos || 'N/A'}.`;
    }
    if (capName.includes('decidir_atividades')) {
      // Suporte para formato V2 (data.chosen_activities) e legado (chosen_activities)
      const data = resultado?.data || resultado || {};
      const chosen = data.chosen_activities || resultado?.chosen_activities || resultado?.activities_to_create || resultado?.decisoes || [];
      const chosenCount = chosen.length;
      
      // Para V2, catalogCount vem do data_confirmation ou do context
      const catalogCount = data.catalog_count || resultado?.metadata?.catalog_count || 
                           (resultado?.data_confirmation?.checks?.find((c: any) => c.id === 'catalog_has_activities')?.value) || 
                           'N/A';
      
      const estrategia = data.estrategia || resultado?.estrategia_pedagogica || '';
      const isFallback = data.is_fallback || false;
      
      if (chosenCount > 0) {
        const chosenIds = chosen.map((a: any) => a.id).join(', ');
        const fallbackNote = isFallback ? ' (seleção automática)' : '';
        return `Decidi criar ${chosenCount} atividade(s): ${chosenIds}${fallbackNote}. Estratégia: ${estrategia || 'diversidade pedagógica'}.`;
      } else {
        const success = resultado?.success;
        if (success === false) {
          const errorMsg = resultado?.error?.message || 'erro desconhecido';
          return `Não consegui decidir atividades: ${errorMsg}`;
        }
        return `Analisei o contexto pedagógico mas não selecionei nenhuma atividade para criar.`;
      }
    }
    if (capName.includes('gerar_conteudo')) {
      // Suporte para formato V2 (data.generated_content) e legado (activities_with_content)
      const data = resultado?.data || resultado || {};
      const generatedCount = data.success_count || data.generated_count || data.generated_content?.length || data.activities_with_content?.length || 0;
      const fieldsFilled = data.total_fields_generated || data.total_fields_filled || 0;
      const success = resultado?.success;
      
      if (success === false) {
        const errorMsg = resultado?.error?.message || 'erro desconhecido';
        return `Falha ao gerar conteúdo: ${errorMsg}`;
      }
      
      if (generatedCount > 0) {
        return `Gerei conteúdo para ${generatedCount} atividade(s) com ${fieldsFilled} campo(s) preenchido(s) no total.`;
      }
      return `Processamento de geração de conteúdo concluído.`;
    }
    if (capName.includes('criar_atividade')) {
      const data = resultado?.data || resultado || {};
      const built = data.activities_built?.length || resultado?.activities_built?.length || resultado?.progress?.completed || 0;
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

  private mapDebugLogType(type: string): 'info' | 'action' | 'decision' | 'discovery' | 'error' | 'warning' | 'reflection' | 'confirmation' {
    const typeMap: Record<string, 'info' | 'action' | 'decision' | 'discovery' | 'error' | 'warning' | 'reflection' | 'confirmation'> = {
      'info': 'info',
      'action': 'action',
      'decision': 'decision',
      'discovery': 'discovery',
      'error': 'error',
      'warning': 'warning',
      'reflection': 'reflection',
      'confirmation': 'confirmation',
      'success': 'discovery',
      'start': 'action',
      'end': 'action',
      'progress': 'info',
      'validation': 'confirmation'
    };
    return typeMap[type?.toLowerCase()] || 'info';
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

  // ═══════════════════════════════════════════════════════════════════
  // DEPRECATED: generateNarrativeForStep e checkReplanning
  // Substituídos pela Mente Maior (chamada unificada) no executePlan loop
  // Os métodos foram removidos — toda lógica agora está em context-engine/mente-maior.ts
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Enriquece os parâmetros de uma capability com resultados de capabilities anteriores
   * Isso permite que decidir_atividades_criar acesse os dados de pesquisar_atividades_disponiveis
   */
  private enrichCapabilityParams(capName: string, params: any): any {
    // 🔥 DIAGNÓSTICO: Log de TODA capability que passa por aqui
    console.error(`
═══════════════════════════════════════════════════════════════════════
🔍 [enrichCapabilityParams] CAPABILITY: "${capName}"
   params keys: ${Object.keys(params || {}).join(', ')}
   capabilityResultsMap keys: ${Array.from(this.capabilityResultsMap.keys()).join(', ')}
═══════════════════════════════════════════════════════════════════════`);
    
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

      // Buscar resultado de pesquisar_bncc
      const bnccResult = this.capabilityResultsMap.get('pesquisar_bncc');
      if (bnccResult) {
        console.log(`🔗 [Executor] Injetando habilidades BNCC em decidir_atividades_criar`);
        enrichedParams.bncc_habilidades = {
          habilidades: bnccResult.habilidades || [],
          componentes: bnccResult.componentes || [],
          anos: bnccResult.anos || [],
          prompt_context: bnccResult.prompt_context || '',
          count: bnccResult.count || 0
        };
        console.log(`   📚 ${enrichedParams.bncc_habilidades.count} habilidades BNCC injetadas`);
      } else {
        console.log(`📝 [Executor] Sem dados BNCC disponíveis (pesquisar_bncc não executado)`);
      }
    }

    // Para gerar_conteudo_atividades, injetar atividades decididas e contexto
    if (capName === 'gerar_conteudo_atividades') {
      console.error(`
═══════════════════════════════════════════════════════════════════════
🔗 [Executor] ENRICHING PARAMS FOR gerar_conteudo_atividades
═══════════════════════════════════════════════════════════════════════`);
      
      // FONTE PRIMÁRIA: Resultado armazenado da capability anterior (mais confiável)
      // Tentar múltiplos nomes possíveis da capability de decisão
      const possibleDecisionNames = ['decidir_atividades_criar', 'decidir_atividades'];
      let decisionResult: any = null;
      let usedCapName = '';
      
      for (const name of possibleDecisionNames) {
        const result = this.capabilityResultsMap.get(name);
        
        // CORREÇÃO CRÍTICA: Suportar AMBAS as estruturas de retorno
        // - Versão legacy: result.chosen_activities
        // - Versão V2: result.data.chosen_activities
        const chosenActivities = result?.chosen_activities || result?.data?.chosen_activities;
        
        if (chosenActivities?.length > 0) {
          // Normalizar para sempre ter chosen_activities no nível raiz
          decisionResult = {
            ...result,
            chosen_activities: chosenActivities,
            estrategia_pedagogica: result?.estrategia_pedagogica || result?.data?.estrategia || ''
          };
          usedCapName = name;
          console.error(`✅ [Executor] Found activities in '${name}' (source: ${result?.chosen_activities ? 'legacy' : 'V2'})`);
          break;
        }
      }
      
      // FONTE SECUNDÁRIA: Store (apenas como fallback)
      const storeState = useChosenActivitiesStore.getState();
      const storeActivities = storeState.getChosenActivities();
      
      console.error(`📊 [Executor] DATA SOURCES:
   - capabilityResultsMap keys: ${Array.from(this.capabilityResultsMap.keys()).join(', ')}
   - Found decision result from: '${usedCapName || 'NONE'}'
   - decisionResult.chosen_activities: ${decisionResult?.chosen_activities?.length || 0}
   - Store.getChosenActivities(): ${storeActivities.length} atividades
   - Store.isDecisionComplete: ${storeState.isDecisionComplete}
      `);
      
      // PRIORIDADE: capabilityResultsMap > Store
      if (decisionResult?.chosen_activities?.length > 0) {
        const chosenFromDecision = decisionResult.chosen_activities;
        console.error(`✅ [Executor] Using ${chosenFromDecision.length} activities from capabilityResultsMap['${usedCapName}']`);
        // Converter para formato ChosenActivity
        enrichedParams.activities_to_fill = chosenFromDecision.map((a: any) => ({
          id: a.id || a.activity_id,
          titulo: a.titulo || a.name,
          tipo: a.tipo || a.type,
          categoria: a.categoria || '',
          materia: a.materia || '',
          nivel_dificuldade: a.nivel_dificuldade || 'medio',
          tags: a.tags || [],
          campos_obrigatorios: a.campos_obrigatorios || [],
          campos_opcionais: a.campos_opcionais || [],
          schema_campos: a.schema_campos || {},
          campos_preenchidos: a.campos_preenchidos || {},
          justificativa: a.justificativa || a.reason || '',
          ordem_sugerida: a.ordem_sugerida || 0,
          status_construcao: 'aguardando' as const,
          progresso: 0
        }));
        enrichedParams.session_id = this.sessionId;
        enrichedParams.user_objective = decisionResult.estrategia_pedagogica || params.contexto || '';
        enrichedParams.conversation_context = decisionResult.estrategia_pedagogica || '';
        enrichedParams.tema_limpo = this.currentPlanTemas.length > 0 ? this.currentPlanTemas.join(', ') : '';
        enrichedParams.temas_extraidos = this.currentPlanTemas;
        enrichedParams.disciplina_extraida = this.currentPlanDisciplina;
        enrichedParams.turma_extraida = this.currentPlanTurma;
        
        console.error(`   📦 Atividades: ${enrichedParams.activities_to_fill.map((a: any) => a.titulo).join(', ')}`);
        console.error(`   🎯 Tema limpo para conteúdo: "${enrichedParams.tema_limpo}"`);
      } else if (storeActivities.length > 0) {
        console.error(`⚠️ [Executor] Fallback: Using ${storeActivities.length} activities from ChosenActivitiesStore`);
        enrichedParams.activities_to_fill = storeActivities;
        enrichedParams.session_id = storeState.sessionId || this.sessionId;
        enrichedParams.user_objective = storeState.estrategiaPedagogica || params.contexto || '';
        enrichedParams.conversation_context = storeState.estrategiaPedagogica || '';
        enrichedParams.tema_limpo = this.currentPlanTemas.length > 0 ? this.currentPlanTemas.join(', ') : '';
        enrichedParams.temas_extraidos = this.currentPlanTemas;
        enrichedParams.disciplina_extraida = this.currentPlanDisciplina;
        enrichedParams.turma_extraida = this.currentPlanTurma;
      } else {
        console.error(`❌ [Executor] CRITICAL: No activities found from ANY source!`);
        console.error(`   capabilityResultsMap contents:`);
        this.capabilityResultsMap.forEach((value, key) => {
          console.error(`     - ${key}: ${value?.chosen_activities?.length || 'no chosen_activities'}`);
        });
        enrichedParams.activities_to_fill = [];
        enrichedParams.session_id = this.sessionId;
      }
      
      console.error(`📦 [Executor] FINAL enrichedParams.activities_to_fill: ${enrichedParams.activities_to_fill?.length || 0} activities`);
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

    if (capName === 'criar_compromisso_calendario') {
      const authenticatedUserId = this.getAuthenticatedUserId();
      if (authenticatedUserId && !enrichedParams.professor_id) {
        enrichedParams.professor_id = authenticatedUserId;
        console.log(`🔗 [Executor] Injetando professor_id em criar_compromisso_calendario: ${authenticatedUserId}`);
      }

      const criarResult = this.capabilityResultsMap.get('criar_atividade');
      const salvarResult = this.capabilityResultsMap.get('salvar_atividades_bd');

      const criarActivities = criarResult?.data?.activities_built || criarResult?.data?.activities || [];
      const activitiesFromCriar = criarResult?.success && criarActivities.length > 0
        ? criarActivities.map((a: any) => ({
            id: a.id || a.db_id || a.activity_id,
            tipo: a.tipo || a.type || a.activity_type || '',
            titulo: a.titulo || a.title || a.name || '',
          })).filter((a: any) => a.id)
        : [];

      const salvarResults = salvarResult?.data?.results || salvarResult?.data?.saved_activities || [];
      const activitiesFromSalvar = salvarResult?.success && salvarResults.length > 0
        ? salvarResults
            .filter((r: any) => r.success !== false)
            .map((r: any) => ({
              id: r.activity_id || r.db_id || r.id,
              tipo: r.tipo || r.type || '',
              titulo: r.titulo || r.title || '',
            })).filter((a: any) => a.id)
        : [];

      let activities: any[];
      if (activitiesFromCriar.length > 0) {
        activities = activitiesFromCriar;
        if (activitiesFromSalvar.length > 0) {
          const dbIdMap = new Map(activitiesFromSalvar.map((a: any) => [a.id, a.id]));
          activities = activities.map((a: any) => ({
            ...a,
            id: dbIdMap.get(a.id) || a.id,
          }));
        }
      } else {
        activities = activitiesFromSalvar;
      }

      if (activities.length > 0) {
        if (!enrichedParams.linked_activity_ids) {
          enrichedParams.linked_activity_ids = activities;
        }

        if (enrichedParams.vincular_atividades) {
          enrichedParams._injected_activities = activities;
          console.log(`🔗 [Executor] Injetando ${activities.length} atividades para auto-geração de calendário batch`);
        } else {
          console.log(`🔗 [Executor] Injetando ${activities.length} atividades vinculadas ao compromisso`);
        }
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
    
    if (capName === 'pesquisar_bncc') {
      const habilidades = resultado?.habilidades || resultado?.data?.habilidades || [];
      return {
        resultado_resumo: `Encontradas ${habilidades.length} habilidade(s) BNCC`,
        total_habilidades: habilidades.length,
        componentes: resultado?.componentes || [],
        anos: resultado?.anos || [],
        habilidades: habilidades.map((h: any) => ({
          codigo: h.codigo,
          descricao: h.descricao?.substring(0, 100),
          objetoConhecimento: h.objetoConhecimento,
          componente: h.componente,
          ano: h.ano
        }))
      };
    }

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
