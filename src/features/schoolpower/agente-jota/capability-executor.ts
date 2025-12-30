/**
 * CAPABILITY EXECUTOR
 * 
 * Orquestrador central que executa capabilities em sequência,
 * validando outputs e gerenciando resultados entre capabilities.
 * 
 * ARQUITETURA API-FIRST:
 * - Executa capabilities com input/output padronizado
 * - Armazena resultados para capabilities subsequentes acessarem
 * - Valida que dependencies foram satisfeitas
 * - Propaga dados entre capabilities via previous_results
 */

import type { 
  CapabilityInput, 
  CapabilityOutput, 
  DebugEntry 
} from './capabilities/shared/types';
import { pesquisarAtividadesDisponiveisV2 } from './capabilities/PESQUISAR/implementations/pesquisar-atividades-disponiveis';
import { decidirAtividadesCriarV2 } from './capabilities/DECIDIR/implementations/decidir-atividades-criar';

// Registry de capabilities V2 (API-First)
const capabilityRegistry: Record<string, (input: CapabilityInput) => Promise<CapabilityOutput>> = {
  'pesquisar_atividades_disponiveis': pesquisarAtividadesDisponiveisV2,
  'decidir_atividades_criar': decidirAtividadesCriarV2,
};

export interface ExecutionConfig {
  capabilities: string[];
  context: Record<string, any>;
  dependencies?: Record<string, string[]>;
}

export interface ExecutionResult {
  success: boolean;
  execution_id: string;
  results: Map<string, CapabilityOutput>;
  errors: string[];
  duration_ms: number;
}

export class CapabilityExecutor {
  private results: Map<string, CapabilityOutput> = new Map();
  private executionId: string;

  constructor() {
    this.executionId = this.generateExecutionId();
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Executa uma única capability
   */
  async execute(
    capabilityId: string,
    context: Record<string, any> = {}
  ): Promise<CapabilityOutput> {
    console.log(`\n🚀 [Executor] Executando capability: ${capabilityId}`);

    // 1. Verificar se capability existe
    const capabilityFn = capabilityRegistry[capabilityId];
    
    if (!capabilityFn) {
      console.error(`❌ [Executor] Capability não encontrada no registry V2: ${capabilityId}`);
      
      return {
        success: false,
        capability_id: capabilityId,
        execution_id: this.executionId,
        timestamp: new Date().toISOString(),
        data: null,
        error: {
          code: 'CAPABILITY_NOT_FOUND',
          message: `Capability "${capabilityId}" não está registrada no CapabilityExecutor`,
          severity: 'critical',
          recoverable: false,
          recovery_suggestion: 'Registrar capability em capabilityRegistry ou usar executor legacy'
        },
        debug_log: [{
          timestamp: new Date().toISOString(),
          type: 'error',
          narrative: `Capability "${capabilityId}" não encontrada no registry.`
        }],
        metadata: {
          duration_ms: 0,
          retry_count: 0,
          data_source: 'none'
        }
      };
    }

    // 2. Preparar input
    const input: CapabilityInput = {
      capability_id: capabilityId,
      execution_id: this.executionId,
      context,
      previous_results: this.results
    };

    // 3. Executar
    const startTime = Date.now();
    const output = await capabilityFn(input);
    const duration = Date.now() - startTime;

    // 4. Validar output
    this.validateOutput(output);

    // 5. Armazenar resultado
    this.results.set(capabilityId, output);

    // 6. Log
    console.log(`${output.success ? '✅' : '❌'} [Executor] ${capabilityId}: ${output.success ? 'SUCESSO' : 'FALHA'} (${duration}ms)`);
    
    if (output.debug_log && output.debug_log.length > 0) {
      console.log(`📝 [Executor] Debug log (${output.debug_log.length} entries):`);
      output.debug_log.forEach((entry, i) => {
        console.log(`   ${i + 1}. [${entry.type.toUpperCase()}] ${entry.narrative.substring(0, 100)}...`);
      });
    }

    return output;
  }

  /**
   * Executa múltiplas capabilities em sequência
   * 
   * IMPORTANTE: Reseta estado automaticamente no início para garantir
   * isolamento entre execuções e dados frescos.
   */
  async executeSequence(config: ExecutionConfig): Promise<ExecutionResult> {
    // CORREÇÃO: Reset automático para garantir isolamento entre execuções
    this.clearResults();
    
    console.log(`\n═════════════════════════════════════════════════════`);
    console.log(`🎯 [Executor] Iniciando sequência: ${config.capabilities.length} capabilities`);
    console.log(`📍 [Executor] Novo execution_id: ${this.executionId}`);
    console.log(`═════════════════════════════════════════════════════`);

    const startTime = Date.now();
    const errors: string[] = [];

    for (const capabilityId of config.capabilities) {
      // Verificar dependencies
      if (config.dependencies?.[capabilityId]) {
        const depsOk = this.checkDependencies(capabilityId, config.dependencies[capabilityId]);
        
        if (!depsOk.success) {
          errors.push(`Dependencies não satisfeitas para ${capabilityId}: ${depsOk.missing.join(', ')}`);
          console.error(`❌ [Executor] Pulando ${capabilityId}: dependencies faltando`);
          continue;
        }
      }

      // Enriquecer contexto com dados de capabilities anteriores
      const enrichedContext = this.enrichContext(config.context, capabilityId);

      // Executar
      try {
        const result = await this.execute(capabilityId, enrichedContext);

        if (!result.success && result.error?.severity === 'critical') {
          errors.push(`Capability ${capabilityId} falhou: ${result.error.message}`);
          
          if (!result.error.recoverable) {
            console.error(`❌ [Executor] Erro crítico não-recuperável. Abortando sequência.`);
            break;
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`Exception em ${capabilityId}: ${errorMessage}`);
        console.error(`💥 [Executor] Exception:`, error);
      }
    }

    const duration = Date.now() - startTime;

    console.log(`\n═════════════════════════════════════════════════════`);
    console.log(`${errors.length === 0 ? '✅' : '⚠️'} [Executor] Sequência concluída em ${duration}ms`);
    console.log(`   Capabilities executadas: ${this.results.size}/${config.capabilities.length}`);
    console.log(`   Erros: ${errors.length}`);
    console.log(`═════════════════════════════════════════════════════\n`);

    return {
      success: errors.length === 0,
      execution_id: this.executionId,
      results: this.results,
      errors,
      duration_ms: duration
    };
  }

  /**
   * Enriquece o contexto com dados de capabilities anteriores
   */
  private enrichContext(
    baseContext: Record<string, any>,
    currentCapability: string
  ): Record<string, any> {
    const enriched = { ...baseContext };

    // Se está executando decidir_atividades_criar, injetar catálogo
    if (currentCapability === 'decidir_atividades_criar') {
      const catalogResult = this.results.get('pesquisar_atividades_disponiveis');
      
      if (catalogResult?.success && catalogResult.data) {
        enriched.catalog = catalogResult.data.catalog;
        enriched.valid_ids = catalogResult.data.valid_ids;
        enriched.catalog_types = catalogResult.data.types;
        enriched.catalog_categories = catalogResult.data.categories;
        
        console.log(`📦 [Executor] Injetando catálogo no contexto: ${catalogResult.data.count} atividades`);
      } else {
        console.warn(`⚠️ [Executor] Catálogo não disponível para ${currentCapability}`);
      }
    }

    return enriched;
  }

  /**
   * Verifica se dependencies de uma capability foram satisfeitas
   */
  private checkDependencies(
    capabilityId: string,
    dependencies: string[]
  ): { success: boolean; missing: string[] } {
    const missing: string[] = [];

    for (const depId of dependencies) {
      const depResult = this.results.get(depId);

      if (!depResult) {
        missing.push(`${depId} (não executada)`);
      } else if (!depResult.success) {
        missing.push(`${depId} (falhou)`);
      }
    }

    return {
      success: missing.length === 0,
      missing
    };
  }

  /**
   * Valida estrutura do output
   */
  private validateOutput(output: CapabilityOutput): void {
    if (!output.capability_id) {
      console.warn('⚠️ [Executor] Output inválido: capability_id ausente');
    }

    if (output.success && !output.data) {
      console.warn('⚠️ [Executor] Output suspeito: success=true mas data=null');
    }

    if (!output.success && !output.error) {
      console.warn('⚠️ [Executor] Output inválido: success=false mas error=null');
    }

    if (!output.debug_log || output.debug_log.length === 0) {
      console.warn('⚠️ [Executor] Capability sem debug_log');
    }
  }

  /**
   * Obtém resultado de uma capability específica
   */
  getResult(capabilityId: string): CapabilityOutput | undefined {
    return this.results.get(capabilityId);
  }

  /**
   * Obtém todos os resultados
   */
  getAllResults(): Map<string, CapabilityOutput> {
    return this.results;
  }

  /**
   * Limpa resultados para nova execução
   */
  clearResults(): void {
    this.results.clear();
    this.executionId = this.generateExecutionId();
    console.log('🗑️ [Executor] Resultados limpos, novo execution_id:', this.executionId);
  }

  /**
   * Obtém execution ID atual
   */
  getExecutionId(): string {
    return this.executionId;
  }
}

// Singleton para uso global
export const capabilityExecutor = new CapabilityExecutor();
export default capabilityExecutor;
