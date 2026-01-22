/**
 * NARRATIVE REFLECTION SERVICE
 * 
 * Gera reflexões narrativas contextuais após cada objetivo ser concluído.
 * Usa abordagem híbrida: template base + LLM para detalhes específicos.
 * 
 * PROTEÇÃO ANTI-JSON: Inclui sanitização e retry automático para
 * prevenir vazamento de dados técnicos para a UI.
 */

import { executeWithCascadeFallback } from '../services/controle-APIs-gerais-school-power';
import { 
  containsRawJson, 
  sanitizeAiOutput, 
  validateReflectionOutput 
} from './context/output-sanitizer';

export interface CapabilityInsight {
  capabilityName: string;
  displayName: string;
  categoria: string;
  discovered?: string[];
  decided?: string[];
  learned?: string[];
  metrics?: Record<string, number | string>;
  duration?: number;
  success: boolean;
}

export interface ObjectiveInsights {
  objectiveTitle: string;
  objectiveIndex: number;
  capabilities: CapabilityInsight[];
  totalDuration: number;
  allSuccess: boolean;
  context?: string;
}

export interface NarrativeReflection {
  id: string;
  objectiveIndex: number;
  objectiveTitle: string;
  narrative: string;
  tone: 'celebratory' | 'cautious' | 'explanatory' | 'reassuring';
  highlights: string[];
  timestamp: number;
}

const REFLECTION_PROMPT = `
Você é o Agente Jota e acabou de completar um objetivo do plano de ação.
Gere uma REFLEXÃO NARRATIVA curta (2-3 frases) explicando o que você fez e descobriu.

OBJETIVO COMPLETADO: {objective_title}

CAPABILITIES EXECUTADAS:
{capabilities_summary}

DADOS ESPECÍFICOS COLETADOS:
{insights_data}

INSTRUÇÕES:
1. Use primeira pessoa ("Eu fiz...", "Encontrei...", "Decidi...")
2. Mencione NÚMEROS e DADOS ESPECÍFICOS quando disponíveis
3. Explique brevemente a DECISÃO tomada e o POR QUÊ
4. Tom conversacional e amigável
5. Máximo 3 frases curtas

EXEMPLOS BOM:
- "Analisei 47 atividades disponíveis e identifiquei que a turma 7B tem gap em Álgebra. Decidi criar 3 atividades focadas em equações para preencher essa lacuna."
- "Encontrei 12 tipos de atividades compatíveis com seu objetivo. Priorizei Flash Cards e Quiz Gamificado por serem mais engajantes para essa faixa etária."

RETORNE APENAS A REFLEXÃO, sem formatação extra.
`.trim();

class NarrativeReflectionService {
  private insightsByObjective: Map<number, ObjectiveInsights> = new Map();

  addCapabilityInsight(objectiveIndex: number, insight: CapabilityInsight): void {
    if (!this.insightsByObjective.has(objectiveIndex)) {
      this.insightsByObjective.set(objectiveIndex, {
        objectiveTitle: '',
        objectiveIndex,
        capabilities: [],
        totalDuration: 0,
        allSuccess: true,
      });
    }

    const objective = this.insightsByObjective.get(objectiveIndex)!;
    objective.capabilities.push(insight);
    objective.totalDuration += insight.duration || 0;
    if (!insight.success) objective.allSuccess = false;
  }

  setObjectiveTitle(objectiveIndex: number, title: string): void {
    if (this.insightsByObjective.has(objectiveIndex)) {
      this.insightsByObjective.get(objectiveIndex)!.objectiveTitle = title;
    } else {
      this.insightsByObjective.set(objectiveIndex, {
        objectiveTitle: title,
        objectiveIndex,
        capabilities: [],
        totalDuration: 0,
        allSuccess: true,
      });
    }
  }

  async generateReflection(objectiveIndex: number): Promise<NarrativeReflection> {
    const insights = this.insightsByObjective.get(objectiveIndex);
    
    if (!insights || insights.capabilities.length === 0) {
      return this.createFallbackReflection(objectiveIndex, insights?.objectiveTitle || 'Objetivo');
    }

    const tone = this.determineTone(insights);
    
    try {
      const narrative = await this.generateWithLLM(insights);
      const highlights = this.extractHighlights(insights);

      return {
        id: `reflection-${objectiveIndex}-${Date.now()}`,
        objectiveIndex,
        objectiveTitle: insights.objectiveTitle,
        narrative,
        tone,
        highlights,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('❌ [ReflectionService] Erro ao gerar reflexão com LLM:', error);
      return this.createTemplateReflection(objectiveIndex, insights);
    }
  }

  private async generateWithLLM(insights: ObjectiveInsights, retryCount = 0): Promise<string> {
    const MAX_RETRIES = 2;
    
    const capabilitiesSummary = insights.capabilities
      .map(c => `- ${c.displayName}: ${c.success ? 'Sucesso' : 'Erro'}`)
      .join('\n');

    const insightsData = insights.capabilities
      .flatMap(c => {
        const items: string[] = [];
        
        (c.discovered || []).filter(d => !containsRawJson(d)).forEach(d => {
          items.push(`Descoberta: ${d}`);
        });
        
        (c.decided || []).filter(d => !containsRawJson(d)).forEach(d => {
          items.push(`Decisão: ${d}`);
        });
        
        (c.learned || []).filter(l => !containsRawJson(l)).forEach(l => {
          items.push(`Aprendizado: ${l}`);
        });
        
        Object.entries(c.metrics || {}).forEach(([k, v]) => {
          const valueStr = String(v);
          if (!containsRawJson(valueStr) && !valueStr.includes('{') && !valueStr.includes('[')) {
            items.push(`${k}: ${valueStr}`);
          }
        });
        
        return items;
      })
      .join('\n') || 'Nenhum dado específico coletado';

    const retryWarning = retryCount > 0 
      ? '\n\nAVISO CRÍTICO: Sua resposta anterior continha JSON. RETORNE APENAS TEXTO NARRATIVO.'
      : '';

    const prompt = REFLECTION_PROMPT
      .replace('{objective_title}', insights.objectiveTitle)
      .replace('{capabilities_summary}', capabilitiesSummary)
      .replace('{insights_data}', insightsData) + retryWarning;

    const result = await executeWithCascadeFallback(prompt, {
      onProgress: (status) => console.log(`📝 [Reflection] ${status}`),
    });

    if (result.success && result.data) {
      const rawNarrative = result.data.trim();
      
      if (containsRawJson(rawNarrative)) {
        console.warn(`⚠️ [ReflectionService] Output contém JSON bruto (tentativa ${retryCount + 1}/${MAX_RETRIES})`);
        
        if (retryCount < MAX_RETRIES) {
          console.log(`🔄 [ReflectionService] Retentando geração de reflexão...`);
          return this.generateWithLLM(insights, retryCount + 1);
        }
        
        console.warn('⚠️ [ReflectionService] Max retries atingido, sanitizando output...');
        const sanitized = sanitizeAiOutput(rawNarrative, {
          etapaTitulo: insights.objectiveTitle,
          capabilityName: insights.capabilities[0]?.capabilityName,
          expectedType: 'narrative',
        });
        return sanitized.sanitized;
      }
      
      const validation = validateReflectionOutput(rawNarrative);
      if (!validation.isValid) {
        console.warn(`⚠️ [ReflectionService] Reflexão inválida: ${validation.issues.join(', ')}`);
        return validation.sanitized || rawNarrative;
      }
      
      return rawNarrative;
    }

    throw new Error('Falha ao gerar reflexão com LLM');
  }

  private createTemplateReflection(objectiveIndex: number, insights: ObjectiveInsights | undefined): NarrativeReflection {
    if (!insights || !insights.capabilities || insights.capabilities.length === 0) {
      return this.createFallbackReflection(objectiveIndex, insights?.objectiveTitle || 'Objetivo');
    }

    const capCount = insights.capabilities.length;
    const successCount = insights.capabilities.filter(c => c.success).length;
    const tone = this.determineTone(insights);

    let narrative: string;
    
    if (insights.allSuccess) {
      narrative = `Completei ${capCount} ações para "${insights.objectiveTitle}". `;
      
      const discoveries = insights.capabilities.flatMap(c => c.discovered || []);
      if (discoveries.length > 0) {
        narrative += discoveries[0] + '. ';
      }
      
      const decisions = insights.capabilities.flatMap(c => c.decided || []);
      if (decisions.length > 0) {
        narrative += decisions[0];
      } else {
        narrative += 'Tudo pronto para a próxima etapa!';
      }
    } else {
      narrative = `Executei ${successCount} de ${capCount} ações. `;
      narrative += 'Alguns itens precisaram de ajustes, mas consegui avançar. ';
      narrative += 'Continuando com o que foi possível concluir.';
    }

    return {
      id: `reflection-${objectiveIndex}-${Date.now()}`,
      objectiveIndex,
      objectiveTitle: insights.objectiveTitle,
      narrative,
      tone,
      highlights: this.extractHighlights(insights),
      timestamp: Date.now(),
    };
  }

  private createFallbackReflection(objectiveIndex: number, title: string): NarrativeReflection {
    return {
      id: `reflection-${objectiveIndex}-${Date.now()}`,
      objectiveIndex,
      objectiveTitle: title,
      narrative: `Concluí "${title}" com sucesso. Todas as ações necessárias foram realizadas. Seguindo para a próxima etapa!`,
      tone: 'celebratory',
      highlights: [],
      timestamp: Date.now(),
    };
  }

  private determineTone(insights: ObjectiveInsights): NarrativeReflection['tone'] {
    const successRate = insights.capabilities.filter(c => c.success).length / insights.capabilities.length;
    
    if (successRate === 1) return 'celebratory';
    if (successRate >= 0.7) return 'cautious';
    if (successRate >= 0.5) return 'explanatory';
    return 'reassuring';
  }

  private extractHighlights(insights: ObjectiveInsights | undefined): string[] {
    if (!insights || !insights.capabilities) {
      return [];
    }

    const highlights: string[] = [];
    
    for (const cap of insights.capabilities) {
      if (cap.metrics) {
        for (const [key, value] of Object.entries(cap.metrics)) {
          const valueStr = String(value);
          if (!containsRawJson(valueStr) && !valueStr.includes('{') && !valueStr.includes('[')) {
            highlights.push(`${key}: ${valueStr}`);
          }
        }
      }
      if (cap.discovered && cap.discovered.length > 0) {
        const firstDiscovery = cap.discovered[0];
        if (!containsRawJson(firstDiscovery)) {
          highlights.push(firstDiscovery);
        }
      }
    }
    
    return highlights.slice(0, 3);
  }

  clearObjective(objectiveIndex: number): void {
    this.insightsByObjective.delete(objectiveIndex);
  }

  clearAll(): void {
    this.insightsByObjective.clear();
  }
}

export const reflectionService = new NarrativeReflectionService();

export default NarrativeReflectionService;
