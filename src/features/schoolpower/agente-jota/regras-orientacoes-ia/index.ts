/**
 * REGRAS E ORIENTAÇÕES IA - AGENTE JOTA
 * 
 * Sistema de regras hierárquico que define como o agente deve
 * pensar, decidir e executar capabilities.
 */

import capabilityDependencies from './capability-dependencies.json';
import executionRules from './execution-rules.json';
import commonSequences from './common-sequences.json';

export interface CapabilityDependency {
  id: string;
  category: string;
  depends_on: string[];
  required_before?: string[];
  outputs: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  failure_handling: string;
  estimated_duration_ms: number;
  optional?: boolean;
  required_data?: string[];
  required_inputs?: string[];
  optional_inputs?: string[];
  max_retries?: number;
}

export interface ExecutionRule {
  id: string;
  type: 'mandatory' | 'conditional' | 'validation' | 'optimization';
  priority: number;
  rule: string;
  rationale: string;
  condition?: string;
  validation?: string;
  action_on_violation?: string;
  action_on_fail?: string;
  then_action?: string;
  else_action?: string;
  error_message?: string;
  user_notification?: string;
  limit?: number;
}

export interface SequenceStep {
  step: number;
  capability: string;
  required: boolean;
  description?: string;
  skip_if?: string;
  fail_if?: string;
  fail_message?: string;
  inputs_from?: number[];
  loop?: boolean;
  loop_over?: string;
  filter_by?: string;
  prioritize?: string;
}

export interface CommonSequence {
  id: string;
  description: string;
  estimated_duration_ms: number;
  sequence: SequenceStep[];
}

class RulesEngine {
  private dependencies: Record<string, CapabilityDependency>;
  private rules: ExecutionRule[];
  private sequences: Record<string, CommonSequence>;
  private categoryOrder: string[];

  constructor() {
    this.dependencies = capabilityDependencies.capability_dependencies as Record<string, CapabilityDependency>;
    this.rules = executionRules.execution_rules as ExecutionRule[];
    this.sequences = commonSequences.common_sequences as Record<string, CommonSequence>;
    this.categoryOrder = capabilityDependencies.category_order.order;
  }

  getCapabilityDependencies(capabilityName: string): string[] {
    const cap = this.dependencies[capabilityName];
    return cap?.depends_on || [];
  }

  getRequiredBefore(capabilityName: string): string[] {
    const cap = this.dependencies[capabilityName];
    return cap?.required_before || [];
  }

  canExecute(capabilityName: string, executedCapabilities: Set<string>): { 
    canExecute: boolean; 
    missingDependencies: string[];
    violatedRules: string[];
  } {
    const missingDependencies: string[] = [];
    const violatedRules: string[] = [];

    const cap = this.dependencies[capabilityName];
    if (cap) {
      for (const dep of cap.depends_on) {
        if (!executedCapabilities.has(dep)) {
          missingDependencies.push(dep);
        }
      }
    }

    const mandatoryRules = this.rules.filter(r => r.type === 'mandatory');
    for (const rule of mandatoryRules) {
      if (rule.validation) {
        violatedRules.push(rule.id);
      }
    }

    return {
      canExecute: missingDependencies.length === 0,
      missingDependencies,
      violatedRules
    };
  }

  getMandatoryRules(): ExecutionRule[] {
    return this.rules.filter(r => r.type === 'mandatory');
  }

  getConditionalRules(): ExecutionRule[] {
    return this.rules.filter(r => r.type === 'conditional');
  }

  getValidationRules(): ExecutionRule[] {
    return this.rules.filter(r => r.type === 'validation');
  }

  selectSequence(userPrompt: string): CommonSequence | null {
    const patterns = commonSequences.sequence_selection_rules.patterns;
    const promptLower = userPrompt.toLowerCase();

    for (const pattern of patterns) {
      for (const keyword of pattern.keywords) {
        if (promptLower.includes(keyword.toLowerCase())) {
          return this.sequences[pattern.sequence] || null;
        }
      }
    }

    return null;
  }

  getSequence(sequenceId: string): CommonSequence | null {
    return this.sequences[sequenceId] || null;
  }

  getAllSequences(): Record<string, CommonSequence> {
    return this.sequences;
  }

  getCategoryOrder(): string[] {
    return this.categoryOrder;
  }

  formatRulesForLLM(): string {
    const lines: string[] = [
      '## REGRAS OBRIGATÓRIAS DO AGENTE JOTA',
      '',
      '### Regras Mandatórias (NUNCA violar):',
    ];

    const mandatory = this.getMandatoryRules();
    mandatory.forEach((rule, idx) => {
      lines.push(`${idx + 1}. ${rule.rule}`);
      lines.push(`   - Razão: ${rule.rationale}`);
    });

    lines.push('');
    lines.push('### Regras de Validação:');
    const validation = this.getValidationRules();
    validation.forEach((rule, idx) => {
      lines.push(`${idx + 1}. ${rule.rule}`);
    });

    lines.push('');
    lines.push('### Ordem de Categorias:');
    lines.push(`   ${this.categoryOrder.join(' → ')}`);
    lines.push('   (Sempre seguir esta ordem: pesquisar antes de analisar, analisar antes de decidir, decidir antes de criar)');

    return lines.join('\n');
  }
}

export const rulesEngine = new RulesEngine();
export default rulesEngine;
