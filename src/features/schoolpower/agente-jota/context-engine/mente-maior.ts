/**
 * MENTE MAIOR - Inner Monologue Unificado (ReAct Pattern)
 * 
 * Substitui as 2 chamadas separadas entre etapas:
 * - generateNarrativeForStep (narrative-prompt.ts)
 * - checkReplanning (replanning-prompt.ts)
 * 
 * Por uma ÚNICA chamada que retorna:
 * { narrative, replan: { needed, reason?, modifications? } }
 * 
 * Inspirado no padrão ReAct (Reason + Act) do Manus AI:
 * O agente raciocina sobre o que aconteceu, gera uma narrativa
 * para o professor, e decide se precisa alterar o plano — tudo
 * num único "pensamento".
 */

import { executeWithCascadeFallback } from '../../services/controle-APIs-gerais-school-power';
import { contextAssembler, type SessionContext } from './context-assembler';
import { containsRawJson, sanitizeAiOutput } from '../context/output-sanitizer';

export interface MenteMaiorInput {
  session: SessionContext;
  completedStep: {
    index: number;
    title: string;
    description: string;
    capabilityResults: Array<{
      name: string;
      displayName: string;
      success: boolean;
      summary: string;
      discoveries?: string[];
      decisions?: string[];
      metrics?: Record<string, number | string>;
    }>;
  };
  nextStep: {
    index: number;
    title: string;
    description: string;
    capabilities: string[];
  } | null;
  remainingSteps: Array<{
    index: number;
    title: string;
    capabilities: string[];
  }>;
  isLastStep: boolean;
  availableCapabilities: string[];
}

export type StepAction = 'keep' | 'skip' | 'adapt';

export interface StepDecision {
  stepIndex: number;
  action: StepAction;
  reason?: string;
  adaptedParams?: Record<string, any>;
  adaptedCapabilities?: Array<{
    nome: string;
    displayName: string;
    categoria: string;
    parametros: Record<string, any>;
  }>;
}

export interface MenteMaiorOutput {
  narrative: string;
  replan: {
    needed: boolean;
    reason?: string;
    modifications?: Array<{
      titulo: string;
      descricao: string;
      capabilities: Array<{
        nome: string;
        displayName: string;
        categoria: string;
        parametros: Record<string, any>;
      }>;
    }>;
  };
  stepDecisions: StepDecision[];
  success: boolean;
}

const MENTE_MAIOR_PROMPT = `
Você é a Mente Orquestradora do Agente Jota (Ponto School).
Você acabou de completar uma etapa do plano e precisa fazer TRÊS coisas:

1. GERAR UMA NARRATIVA curta para o professor (o que fez e vai fazer)
2. DECIDIR SOBRE CADA PRÓXIMA ETAPA: manter, pular ou adaptar
3. AVALIAR SE PRECISA REPLANEJAR (adicionar etapas novas)

{context}

═══════════════════════════════════════════════════════════════
ETAPA QUE ACABOU DE SER CONCLUÍDA:
═══════════════════════════════════════════════════════════════
Etapa {step_index}: {step_title}
{step_description}

Capabilities executadas:
{capabilities_summary}

Resultados:
{results_summary}

{next_step_section}

═══════════════════════════════════════════════════════════════
INSTRUÇÕES:
═══════════════════════════════════════════════════════════════

Responda com um JSON válido com esta estrutura:
{
  "narrative": "Mensagem curta para o professor (2-3 frases, 1ª pessoa)",
  "step_decisions": [
    {
      "stepIndex": 3,
      "action": "keep",
      "reason": "Etapa necessária conforme planejado"
    }
  ],
  "replan": {
    "needed": false,
    "reason": ""
  }
}

REGRAS PARA A NARRATIVA:
- Fale na 1ª pessoa ("Encontrei...", "Vou agora...", "Pronto!")
- Seja específico sobre resultados (ex: "Encontrei 5 tipos de atividades")
- Se houver próxima etapa, mencione o que vai fazer
- Se for a última, dê um fechamento positivo
- Máximo 2-3 frases curtas e naturais
- NÃO use markdown, bullets ou listas
- NÃO repita o título da etapa

REGRAS PARA STEP_DECISIONS (MICRO-DECISÕES):
Para CADA etapa restante, decida UMA ação:
- "keep" → Manter a etapa como está (padrão, use na maioria dos casos)
- "skip" → Pular a etapa (SOMENTE se os resultados mostraram que é desnecessária)
  Exemplos: pesquisa já retornou tudo necessário, etapa duplicada
- "adapt" → Adaptar parâmetros da etapa com base nos resultados
  Exemplos: ajustar quantidade de atividades, mudar tema baseado no que a pesquisa encontrou

ATENÇÃO:
- Use "keep" na GRANDE MAIORIA dos casos (80%+)
- "skip" só quando a etapa se tornou CLARAMENTE desnecessária
- "adapt" quando os resultados desta etapa influenciam diretamente a próxima
- Se não há etapas restantes, retorne step_decisions como array vazio []
- NUNCA pule etapas críticas como criar_atividade, salvar_atividades_bd
- Se for a última etapa, step_decisions deve ser []

REGRAS PARA REPLAN:
- needed=false na maioria dos casos
- needed=true APENAS se precisa ADICIONAR etapas completamente novas:
  * Professor pediu calendário mas plano não tem gerenciar_calendario
  * Resultado revelou necessidade não prevista no plano original
- Se needed=true, inclua "modifications" com as etapas NOVAS a adicionar
- Se for a última etapa, SEMPRE needed=false

{capabilities_list}

RESPONDA APENAS COM O JSON. Nada mais.
`.trim();

export async function executeMenteMaior(input: MenteMaiorInput): Promise<MenteMaiorOutput> {
  console.log(`🧠 [MenteMaior] Processando etapa ${input.completedStep.index}: ${input.completedStep.title}`);

  const context = contextAssembler.assemble('mente_maior', input.session);

  const capabilitiesSummary = input.completedStep.capabilityResults
    .map(c => `- ${c.displayName}: ${c.success ? 'Sucesso' : 'Erro'}`)
    .join('\n');

  const resultsSummary = input.completedStep.capabilityResults
    .flatMap(c => {
      const items: string[] = [];
      if (c.summary) items.push(c.summary.substring(0, 200));
      if (c.discoveries) items.push(...c.discoveries.slice(0, 3).map(d => `Descoberta: ${d}`));
      if (c.decisions) items.push(...c.decisions.slice(0, 2).map(d => `Decisão: ${d}`));
      if (c.metrics) {
        items.push(...Object.entries(c.metrics).slice(0, 3).map(([k, v]) => `${k}: ${v}`));
      }
      return items;
    })
    .join('\n') || 'Sem dados específicos';

  let nextStepSection: string;
  if (input.isLastStep) {
    nextStepSection = 'Esta é a ÚLTIMA ETAPA. O plano está concluído. step_decisions deve ser [].';
  } else if (input.nextStep) {
    const allRemaining = input.remainingSteps
      .map(s => `  - Etapa ${s.index} (stepIndex: ${s.index}): ${s.title} [${s.capabilities.join(', ')}]`)
      .join('\n');
    nextStepSection = `ETAPAS RESTANTES (forneça step_decisions para CADA uma):\n${allRemaining}`;
  } else {
    nextStepSection = 'Nenhuma etapa seguinte definida.';
  }

  const capabilitiesList = input.availableCapabilities.length > 0
    ? `CAPABILITIES DISPONÍVEIS (para replan):\n${input.availableCapabilities.join(', ')}`
    : '';

  const recentNarratives = (input.session.stepResults || [])
    .filter(sr => sr.narrativeGenerated)
    .slice(-3);
  const previousNarrativesSection = recentNarratives.length > 0
    ? `\n⚠️ NARRATIVAS JÁ GERADAS (NÃO REPITA):\n${
        recentNarratives
          .map(sr => `- Etapa ${sr.stepIndex}: "${sr.narrativeGenerated!.substring(0, 150)}"`)
          .join('\n')
      }\nGere uma narrativa DIFERENTE e ESPECÍFICA para esta etapa.\n`
    : '';

  const prompt = MENTE_MAIOR_PROMPT
    .replace('{context}', context)
    .replace('{step_index}', String(input.completedStep.index))
    .replace('{step_title}', input.completedStep.title)
    .replace('{step_description}', input.completedStep.description)
    .replace('{capabilities_summary}', capabilitiesSummary)
    .replace('{results_summary}', resultsSummary + previousNarrativesSection)
    .replace('{next_step_section}', nextStepSection)
    .replace('{capabilities_list}', capabilitiesList);

  try {
    const result = await executeWithCascadeFallback(prompt, {
      onProgress: (status) => console.log(`🧠 [MenteMaior] ${status}`),
    });

    if (result.success && result.data) {
      return parseMenteMaiorResponse(result.data, input);
    }

    return buildFallbackResponse(input);
  } catch (error) {
    console.error('❌ [MenteMaior] Erro:', error);
    return buildFallbackResponse(input);
  }
}

function parseMenteMaiorResponse(raw: string, input: MenteMaiorInput): MenteMaiorOutput {
  try {
    const cleaned = raw
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      if (!containsRawJson(cleaned) && cleaned.length > 10 && cleaned.length < 500) {
        return {
          narrative: cleaned,
          replan: { needed: false },
          stepDecisions: [],
          success: true,
        };
      }
      return buildFallbackResponse(input);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    let narrative = parsed.narrative || '';
    if (!narrative || narrative.length < 5) {
      narrative = buildFallbackNarrative(input);
    } else if (containsRawJson(narrative)) {
      const sanitized = sanitizeAiOutput(narrative, {
        etapaTitulo: input.completedStep.title,
        expectedType: 'narrative',
      });
      narrative = sanitized.sanitized;
    }

    const replan = parsed.replan || { needed: false };

    if (input.isLastStep) {
      replan.needed = false;
    }

    const rawDecisions = parsed.step_decisions || [];
    const stepDecisions: StepDecision[] = rawDecisions
      .filter((d: any) => d && d.stepIndex && d.action)
      .map((d: any) => ({
        stepIndex: d.stepIndex,
        action: (['keep', 'skip', 'adapt'].includes(d.action) ? d.action : 'keep') as StepAction,
        reason: d.reason || undefined,
        adaptedParams: d.action === 'adapt' ? d.adaptedParams : undefined,
        adaptedCapabilities: d.action === 'adapt' ? d.adaptedCapabilities : undefined,
      }));

    return {
      narrative,
      replan: {
        needed: Boolean(replan.needed),
        reason: replan.reason || undefined,
        modifications: replan.needed ? replan.modifications : undefined,
      },
      stepDecisions,
      success: true,
    };
  } catch (parseError) {
    console.warn('⚠️ [MenteMaior] Erro ao parsear resposta:', parseError);

    const cleanText = raw
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^\s*\{[\s\S]*\}\s*$/g, '')
      .trim();

    if (cleanText.length > 10 && cleanText.length < 500 && !containsRawJson(cleanText)) {
      return {
        narrative: cleanText,
        replan: { needed: false },
        stepDecisions: [],
        success: true,
      };
    }

    return buildFallbackResponse(input);
  }
}

function buildFallbackResponse(input: MenteMaiorInput): MenteMaiorOutput {
  return {
    narrative: buildFallbackNarrative(input),
    replan: { needed: false },
    stepDecisions: [],
    success: false,
  };
}

function buildFallbackNarrative(input: MenteMaiorInput): string {
  const step = input.completedStep;
  const successCount = step.capabilityResults.filter(c => c.success).length;
  const totalCount = step.capabilityResults.length;

  if (input.isLastStep) {
    return `Concluí a última etapa "${step.title}" com sucesso. Tudo pronto!`;
  }

  if (successCount === totalCount && input.nextStep) {
    return `Concluí "${step.title}" com sucesso. Agora vou para: ${input.nextStep.title}.`;
  }

  if (successCount < totalCount) {
    return `Finalizei "${step.title}" com ${successCount} de ${totalCount} operações bem-sucedidas. Seguindo em frente.`;
  }

  return `Etapa "${step.title}" concluída. Continuando o plano.`;
}
