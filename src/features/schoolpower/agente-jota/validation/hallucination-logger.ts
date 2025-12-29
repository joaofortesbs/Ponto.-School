/**
 * HALLUCINATION LOGGER
 * 
 * Sistema de logging para auditoria de dados e detecção de alucinações.
 * Transparência total para debugging.
 */

import type { UserContextValidation, ValidationResult } from './data-validation-service';
import type { HallucinationCheck } from './anti-hallucination-prompts';

export interface DataAuditEntry {
  timestamp: number;
  capability: string;
  phase: 'pre_validation' | 'llm_context' | 'llm_response' | 'post_verification';
  data: Record<string, any>;
  status: 'passed' | 'failed' | 'warning';
  message: string;
}

export interface HallucinationLogEntry {
  timestamp: number;
  capability: string;
  llmOutput: string;
  suspiciousEntities: string[];
  confidence: number;
  action: 'approved' | 'rejected' | 'retried';
  retryCount?: number;
}

class HallucinationLogger {
  private auditLog: DataAuditEntry[] = [];
  private hallucinationLog: HallucinationLogEntry[] = [];
  private isDebugMode: boolean = true;
  private readonly MAX_LOG_SIZE = 100;

  logPreValidation(capability: string, validation: UserContextValidation): void {
    const entry: DataAuditEntry = {
      timestamp: Date.now(),
      capability,
      phase: 'pre_validation',
      data: {
        turmas_count: validation.turmas.count,
        turmas_exists: validation.turmas.exists,
        atividades_count: validation.atividades.count,
        hasAnyData: validation.hasAnyData,
        missingData: validation.missingData,
      },
      status: validation.hasAnyData ? 'passed' : 'warning',
      message: validation.hasAnyData 
        ? `Dados validados: ${validation.turmas.count} turmas, ${validation.atividades.count} atividades`
        : 'ATENÇÃO: Nenhum dado encontrado para o usuário',
    };

    this.addAuditEntry(entry);
    this.logToConsole(entry);
  }

  logLLMContext(capability: string, contextSent: string): void {
    const entry: DataAuditEntry = {
      timestamp: Date.now(),
      capability,
      phase: 'llm_context',
      data: {
        contextLength: contextSent.length,
        preview: contextSent.substring(0, 200) + '...',
      },
      status: 'passed',
      message: `Contexto enviado ao LLM: ${contextSent.length} caracteres`,
    };

    this.addAuditEntry(entry);
    this.logToConsole(entry);
  }

  logLLMResponse(capability: string, response: string): void {
    const entry: DataAuditEntry = {
      timestamp: Date.now(),
      capability,
      phase: 'llm_response',
      data: {
        responseLength: response.length,
        preview: response.substring(0, 200) + '...',
      },
      status: 'passed',
      message: `Resposta do LLM: ${response.length} caracteres`,
    };

    this.addAuditEntry(entry);
    this.logToConsole(entry);
  }

  logPostVerification(
    capability: string, 
    hallucinationCheck: HallucinationCheck,
    action: 'approved' | 'rejected' | 'retried'
  ): void {
    const entry: DataAuditEntry = {
      timestamp: Date.now(),
      capability,
      phase: 'post_verification',
      data: {
        isHallucination: hallucinationCheck.isHallucination,
        suspiciousEntities: hallucinationCheck.suspiciousEntities,
        confidence: hallucinationCheck.confidence,
        action,
      },
      status: hallucinationCheck.isHallucination ? 'failed' : 'passed',
      message: hallucinationCheck.isHallucination
        ? `ALUCINAÇÃO DETECTADA: ${hallucinationCheck.suspiciousEntities.join(', ')}`
        : 'Verificação passou: nenhuma alucinação detectada',
    };

    this.addAuditEntry(entry);
    this.logToConsole(entry);

    if (hallucinationCheck.isHallucination) {
      this.hallucinationLog.push({
        timestamp: Date.now(),
        capability,
        llmOutput: hallucinationCheck.details,
        suspiciousEntities: hallucinationCheck.suspiciousEntities,
        confidence: hallucinationCheck.confidence,
        action,
      });
    }
  }

  getAuditTrail(capability?: string): DataAuditEntry[] {
    if (capability) {
      return this.auditLog.filter(e => e.capability === capability);
    }
    return [...this.auditLog];
  }

  getHallucinationHistory(): HallucinationLogEntry[] {
    return [...this.hallucinationLog];
  }

  formatAuditTrailForDisplay(capability: string): string {
    const entries = this.getAuditTrail(capability);
    if (entries.length === 0) {
      return `[Capability: ${capability}]\n└─ Nenhum registro de auditoria`;
    }

    const lines: string[] = [`[Capability: ${capability}]`];
    
    entries.forEach((entry, idx) => {
      const isLast = idx === entries.length - 1;
      const prefix = isLast ? '└─' : '├─';
      const statusIcon = entry.status === 'passed' ? '✓' : entry.status === 'warning' ? '⚠️' : '✗';
      
      lines.push(`${prefix} ${entry.phase}: ${statusIcon} ${entry.message}`);
      
      if (entry.phase === 'pre_validation') {
        lines.push(`   ├─ Turmas: ${entry.data.turmas_count}`);
        lines.push(`   ├─ Atividades: ${entry.data.atividades_count}`);
        lines.push(`   └─ Dados disponíveis: ${entry.data.hasAnyData ? 'SIM' : 'NÃO'}`);
      }
      
      if (entry.phase === 'post_verification' && entry.data.isHallucination) {
        lines.push(`   ├─ Entidades suspeitas: ${entry.data.suspiciousEntities.join(', ')}`);
        lines.push(`   ├─ Confiança: ${(entry.data.confidence * 100).toFixed(0)}%`);
        lines.push(`   └─ Ação: ${entry.data.action}`);
      }
    });

    return lines.join('\n');
  }

  private addAuditEntry(entry: DataAuditEntry): void {
    this.auditLog.push(entry);
    if (this.auditLog.length > this.MAX_LOG_SIZE) {
      this.auditLog.shift();
    }
  }

  private logToConsole(entry: DataAuditEntry): void {
    if (!this.isDebugMode) return;

    const statusEmoji = entry.status === 'passed' ? '✅' : entry.status === 'warning' ? '⚠️' : '❌';
    
    console.log(`${statusEmoji} [HallucinationLogger] [${entry.capability}] [${entry.phase}]`);
    console.log(`   ${entry.message}`);
    
    if (entry.status === 'failed' || entry.status === 'warning') {
      console.log(`   Data:`, entry.data);
    }
  }

  setDebugMode(enabled: boolean): void {
    this.isDebugMode = enabled;
  }

  clear(): void {
    this.auditLog = [];
    this.hallucinationLog = [];
  }
}

export const hallucinationLogger = new HallucinationLogger();
export default HallucinationLogger;
