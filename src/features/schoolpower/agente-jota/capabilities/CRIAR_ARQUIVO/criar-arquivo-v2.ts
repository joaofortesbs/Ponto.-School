import type { CapabilityInput, CapabilityOutput, DebugEntry } from '../shared/types';
import { generateArtifact, shouldGenerateArtifact } from './artifact-generator';
import type { ArtifactData, ArtifactType } from './types';

export async function criarArquivoV2(input: CapabilityInput): Promise<CapabilityOutput> {
  const startTime = Date.now();
  const debugLog: DebugEntry[] = [];

  const sessionId = input.context.session_id || input.context.sessionId || input.execution_id;
  const tipoForce = input.context.tipo_artefato as ArtifactType | undefined;

  debugLog.push({
    timestamp: new Date().toISOString(),
    type: 'action',
    narrative: `Iniciando geração de artefato para sessão ${sessionId}${tipoForce ? ` (tipo forçado: ${tipoForce})` : ' (tipo automático)'}`,
    technical_data: { sessionId, tipoForce }
  });

  if (!sessionId) {
    return {
      success: false,
      capability_id: input.capability_id,
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: null,
      error: {
        code: 'MISSING_SESSION_ID',
        message: 'session_id é obrigatório para gerar artefato',
        severity: 'critical',
        recoverable: false,
        recovery_suggestion: 'Fornecer session_id no contexto da capability'
      },
      debug_log: debugLog,
      metadata: {
        duration_ms: Date.now() - startTime,
        retry_count: 0,
        data_source: 'none'
      }
    };
  }

  const canGenerate = shouldGenerateArtifact(sessionId);

  debugLog.push({
    timestamp: new Date().toISOString(),
    type: 'info',
    narrative: `Verificação de pré-condições: ${canGenerate ? 'OK - contexto disponível' : 'AVISO - contexto insuficiente, tentando mesmo assim'}`,
    technical_data: { canGenerate }
  });

  try {
    const artifact: ArtifactData | null = await generateArtifact(sessionId, tipoForce);

    if (!artifact) {
      debugLog.push({
        timestamp: new Date().toISOString(),
        type: 'warning',
        narrative: 'Gerador retornou null - contexto insuficiente para gerar artefato'
      });

      return {
        success: false,
        capability_id: input.capability_id,
        execution_id: input.execution_id,
        timestamp: new Date().toISOString(),
        data: null,
        error: {
          code: 'ARTIFACT_GENERATION_FAILED',
          message: 'Não foi possível gerar o artefato - contexto insuficiente',
          severity: 'medium',
          recoverable: false,
          recovery_suggestion: 'Verificar se há etapas completas na sessão antes de gerar artefato'
        },
        debug_log: debugLog,
        metadata: {
          duration_ms: Date.now() - startTime,
          retry_count: 0,
          data_source: 'context_manager'
        }
      };
    }

    debugLog.push({
      timestamp: new Date().toISOString(),
      type: 'discovery',
      narrative: `Artefato gerado com sucesso: "${artifact.metadata.titulo}" (${artifact.secoes.length} seções, ${artifact.metadata.estatisticas?.palavras || 0} palavras)`,
      technical_data: {
        artifact_id: artifact.id,
        tipo: artifact.metadata.tipo,
        titulo: artifact.metadata.titulo,
        secoes: artifact.secoes.length,
        palavras: artifact.metadata.estatisticas?.palavras
      }
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('artifact:generated', {
        detail: artifact
      }));

      debugLog.push({
        timestamp: new Date().toISOString(),
        type: 'action',
        narrative: 'Evento artifact:generated disparado para renderização no chat'
      });
    }

    return {
      success: true,
      capability_id: input.capability_id,
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: {
        artifact,
        artifact_id: artifact.id,
        tipo: artifact.metadata.tipo,
        titulo: artifact.metadata.titulo,
        secoes_count: artifact.secoes.length,
        palavras: artifact.metadata.estatisticas?.palavras || 0
      },
      error: null,
      debug_log: debugLog,
      metadata: {
        duration_ms: Date.now() - startTime,
        retry_count: 0,
        data_source: 'llm_cascade'
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    debugLog.push({
      timestamp: new Date().toISOString(),
      type: 'error',
      narrative: `Erro durante geração do artefato: ${errorMessage}`,
      technical_data: { error: errorMessage }
    });

    return {
      success: false,
      capability_id: input.capability_id,
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: null,
      error: {
        code: 'ARTIFACT_EXCEPTION',
        message: errorMessage,
        severity: 'medium',
        recoverable: false,
        recovery_suggestion: 'Tentar novamente ou verificar configuração de APIs de IA'
      },
      debug_log: debugLog,
      metadata: {
        duration_ms: Date.now() - startTime,
        retry_count: 0,
        data_source: 'none'
      }
    };
  }
}
