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
  success: boolean;
}

const MENTE_MAIOR_PROMPT = `
Você é a Mente Orquestradora do Agente Jota (Ponto School).
Você acabou de completar UMA ETAPA ESPECÍFICA do plano e precisa fazer DUAS coisas:

1. GERAR UMA NARRATIVA curta para o professor (o que você fez NESTA ETAPA e o que vai fazer a seguir)
2. AVALIAR SE O PLANO PRECISA MUDAR (baseado nos resultados obtidos)

{context}

═══════════════════════════════════════════════════════════════
⚠️ ETAPA QUE ACABOU DE SER CONCLUÍDA AGORA:
═══════════════════════════════════════════════════════════════
Etapa {step_index}: {step_title}
{step_description}

Capabilities executadas NESTA ETAPA:
{capabilities_summary}

O que aconteceu NESTA ETAPA — use SOMENTE estes dados na narrativa:
{results_summary}

{next_step_section}

═══════════════════════════════════════════════════════════════
INSTRUÇÕES CRÍTICAS PARA A NARRATIVA:
═══════════════════════════════════════════════════════════════

⚠️ REGRA ABSOLUTA: A narrativa deve descrever EXCLUSIVAMENTE o que aconteceu NA ETAPA "{step_title}" acima.
NÃO copie, repita ou mencione narrativas de etapas anteriores.
NÃO repita dados de pesquisa se esta etapa foi de decisão ou geração.
FOQUE apenas nos dados de "O que aconteceu NESTA ETAPA" listados acima.

REGRAS PARA A NARRATIVA:
- Fale na 1ª pessoa ("Decidi criar...", "Gerei o conteúdo de...", "Analisei...", "Escolhi...", "Pronto!")
- Seja ESPECÍFICO sobre o que ESTA ETAPA fez — use números, nomes e dados concretos dos resultados acima
- Se houver próxima etapa, mencione o que vai fazer a seguir
- Se for a última etapa, dê um fechamento positivo e específico
- Máximo 2-3 frases curtas e naturais
- NÃO use markdown, bullets ou listas
- NÃO repita o título da etapa literalmente

GUIA PARA ESTE TIPO DE ETAPA:
{step_type_guidance}

Responda com um JSON válido com EXATAMENTE esta estrutura:
{
  "narrative": "Sua mensagem curta para o professor (2-3 frases, 1ª pessoa, tom amigável)",
  "replan": {
    "needed": false,
    "reason": ""
  }
}

REGRAS PARA O REPLAN:
- needed=false na maioria dos casos (plano está OK)
- needed=true APENAS se os resultados revelaram algo inesperado:
  * Pesquisa não encontrou resultados úteis
  * Já existem atividades similares
  * Resultado revelou necessidade não prevista
  * Etapa se tornou desnecessária
  * Professor pediu calendário mas o plano não inclui criar_compromisso_calendario
- Se needed=true, inclua "reason" com explicação breve
- Se needed=true E etapas precisam mudar, inclua "modifications" com as etapas restantes atualizadas
- Se for a última etapa, SEMPRE needed=false
- 📅 Se o pedido original mencionou calendário/agendar/organizar e o plano NÃO tem criar_compromisso_calendario, faça replan para adicionar!

{previous_narratives_warning}

{capabilities_list}

RESPONDA APENAS COM O JSON. Nada mais.
`.trim();

function buildStepTypeGuidance(capabilityResults: MenteMaiorInput['completedStep']['capabilityResults']): string {
  const capNames = capabilityResults.map(c => c.name.toLowerCase());

  const isPesquisa = capNames.some(n =>
    n.includes('pesquisar_catalog') || n.includes('buscar_atividades') ||
    n.includes('questoes_referencia') || n.includes('busca_web') ||
    n.includes('search') || n.includes('catalog')
  );
  const isDecisao = capNames.some(n => n.includes('decidir_atividades'));
  const isGeracao = capNames.some(n => n.includes('gerar_conteudo'));
  const isConstrucao = capNames.some(n =>
    n.includes('criar_atividade') || n.includes('salvar_atividades')
  );

  if (isDecisao && isGeracao) {
    return `Esta é uma etapa de DECISÃO + GERAÇÃO. Mencione QUANTAS atividades foram decididas e seus NOMES, e confirme que o conteúdo foi gerado. NÃO mencione dados de pesquisa (BNCC, catálogo, questões) — esses ficaram na etapa anterior.
Exemplo: "Decidi criar 4 atividades: Flash Cards, Quiz Interativo, Lista de Exercícios e Mapa Mental. Gerei o conteúdo completo para todas elas. Agora vou construí-las e salvá-las."`;
  }

  if (isDecisao) {
    return `Esta é uma etapa de DECISÃO. Mencione OS NOMES específicos das atividades que foram escolhidas e por que essa combinação foi selecionada. NÃO mencione dados de pesquisa (BNCC, catálogo) — esses ficaram na etapa anterior.
Exemplo: "Decidi criar 3 atividades: Flash Cards sobre fotossíntese, Quiz de múltipla escolha e Lista de exercícios práticos. Agora vou gerar o conteúdo personalizado para cada uma."`;
  }

  if (isGeracao) {
    return `Esta é uma etapa de GERAÇÃO DE CONTEÚDO. Mencione QUANTAS atividades tiveram conteúdo gerado e o que foi produzido. Use tom conclusivo/positivo. NÃO repita a decisão da etapa anterior.
Exemplo: "Pronto! Gerei o conteúdo completo para as 4 atividades com questões e exercícios específicos sobre o tema. Agora vou construí-las e salvá-las na sua conta."`;
  }

  if (isConstrucao) {
    return `Esta é uma etapa de CONSTRUÇÃO E SALVAMENTO. Confirme que as atividades foram montadas e salvas. Use tom de entrega/conclusão.
Exemplo: "Suas atividades foram construídas e salvas com sucesso! Tudo pronto para usar em sala de aula."`;
  }

  if (isPesquisa) {
    return `Esta é uma etapa de PESQUISA. Mencione NÚMEROS concretos: quantas atividades/recursos/habilidades foram encontrados. Anuncie o que virá a seguir.
Exemplo: "Analisei o catálogo e encontrei 47 tipos de atividades disponíveis, além de 2074 habilidades BNCC relevantes para o tema. Agora vou decidir quais criar para a turma."`;
  }

  return `Descreva em 2-3 frases o que foi feito nesta etapa usando os dados específicos dos resultados acima. Mencione o que vem a seguir se houver próxima etapa.`;
}

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
    .join('\n') || 'Sem dados específicos desta etapa';

  let nextStepSection: string;
  if (input.isLastStep) {
    nextStepSection = 'Esta é a ÚLTIMA ETAPA. O plano está concluído.';
  } else if (input.nextStep) {
    nextStepSection = `PRÓXIMA ETAPA:\nEtapa ${input.nextStep.index}: ${input.nextStep.title}\nCapabilities: ${input.nextStep.capabilities.join(', ')}`;

    if (input.remainingSteps.length > 1) {
      const remaining = input.remainingSteps.slice(1)
        .map(s => `  - Etapa ${s.index}: ${s.title}`)
        .join('\n');
      nextStepSection += `\n\nETAPAS RESTANTES DEPOIS:\n${remaining}`;
    }
  } else {
    nextStepSection = 'Nenhuma etapa seguinte definida.';
  }

  const capabilitiesList = input.availableCapabilities.length > 0
    ? `CAPABILITIES DISPONÍVEIS (para replan):\n${input.availableCapabilities.join(', ')}`
    : '';

  const recentNarratives = (input.session.stepResults || [])
    .filter(sr => sr.narrativeGenerated)
    .slice(-3);

  const previousNarrativesWarning = recentNarratives.length > 0
    ? `═══════════════════════════════════════════════════════════════
⛔ NARRATIVAS JÁ GERADAS NAS ETAPAS ANTERIORES — NÃO REPITA ESTAS:
═══════════════════════════════════════════════════════════════
${recentNarratives
    .map(sr => `Etapa ${sr.stepIndex} ("${sr.stepTitle}"): "${sr.narrativeGenerated!.substring(0, 200)}"`)
    .join('\n')}
A sua narrativa para ESTA etapa deve ser COMPLETAMENTE DIFERENTE das acima.`
    : '';

  const stepTypeGuidance = buildStepTypeGuidance(input.completedStep.capabilityResults);

  console.log(`🧠 [MenteMaior Input] Etapa ${input.completedStep.index} — "${input.completedStep.title}":`);
  input.completedStep.capabilityResults.forEach(c => {
    console.log(`  📦 ${c.name}: summary="${c.summary?.substring(0, 150)}" | disc=${c.discoveries?.length || 0} | dec=${c.decisions?.length || 0}`);
  });

  const prompt = MENTE_MAIOR_PROMPT
    .replace('{context}', context)
    .replace(/{step_index}/g, String(input.completedStep.index))
    .replace(/{step_title}/g, input.completedStep.title)
    .replace('{step_description}', input.completedStep.description)
    .replace('{capabilities_summary}', capabilitiesSummary)
    .replace('{results_summary}', resultsSummary)
    .replace('{next_step_section}', nextStepSection)
    .replace('{step_type_guidance}', stepTypeGuidance)
    .replace('{previous_narratives_warning}', previousNarrativesWarning)
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

    console.log(`🧠 [MenteMaior] Narrativa gerada: "${narrative.substring(0, 250)}"`);

    return {
      narrative,
      replan: {
        needed: Boolean(replan.needed),
        reason: replan.reason || undefined,
        modifications: replan.needed ? replan.modifications : undefined,
      },
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
    success: false,
  };
}

function buildFallbackNarrative(input: MenteMaiorInput): string {
  const step = input.completedStep;
  const capNames = step.capabilityResults.map(c => c.name.toLowerCase());
  const successCount = step.capabilityResults.filter(c => c.success).length;
  const totalCount = step.capabilityResults.length;

  const isDecisao = capNames.some(n => n.includes('decidir_atividades'));
  const isGeracao = capNames.some(n => n.includes('gerar_conteudo'));
  const isConstrucao = capNames.some(n => n.includes('criar_atividade') || n.includes('salvar_atividades'));

  const allDiscoveries = step.capabilityResults.flatMap(c => c.discoveries || []);
  const allDecisions = step.capabilityResults.flatMap(c => c.decisions || []);

  if (input.isLastStep) {
    if (isConstrucao && successCount === totalCount) {
      return `Suas atividades foram construídas e salvas com sucesso! Tudo pronto para usar em sala de aula.`;
    }
    return `Concluí todas as etapas do plano com sucesso. Suas atividades estão prontas!`;
  }

  if (isDecisao && allDecisions.length > 0) {
    const mainDecision = allDecisions[0].substring(0, 150);
    return `${mainDecision}${input.nextStep ? ` Agora vou ${input.nextStep.title.toLowerCase()}.` : ''}`;
  }

  if (isGeracao) {
    const genDisc = allDiscoveries.find(d => d.includes('atividade') || d.includes('Conteúdo'));
    return genDisc
      ? `${genDisc}${input.nextStep ? ` Agora vou para: ${input.nextStep.title}.` : ' Pronto!'}`
      : `Gerei o conteúdo das atividades com sucesso.${input.nextStep ? ` Agora vou para: ${input.nextStep.title}.` : ''}`;
  }

  if (allDiscoveries.length > 0) {
    return `${allDiscoveries[0].substring(0, 150)}${input.nextStep ? ` Agora vou para: ${input.nextStep.title}.` : ''}`;
  }

  if (successCount === totalCount && input.nextStep) {
    return `Concluí esta etapa com sucesso. Agora vou para: ${input.nextStep.title}.`;
  }

  if (successCount < totalCount) {
    return `Finalizei esta etapa com ${successCount} de ${totalCount} operações bem-sucedidas. Seguindo em frente.`;
  }

  return `Etapa concluída. Continuando o plano.`;
}
