/**
 * REPLANNING PROMPT - Prompt para re-avaliar o plano ao vivo
 * 
 * Após cada etapa concluída, o Jota avalia se o plano original ainda
 * faz sentido ou se precisa ser ajustado baseado nos resultados obtidos.
 * 
 * Isso permite que o agente se adapte dinamicamente durante a execução.
 */

export const REPLANNING_PROMPT = `
Você é o Agente Jota, a Mente Orquestradora do School Power.
Você está no meio da execução de um plano e precisa avaliar se o plano precisa ser ajustado.

═══════════════════════════════════════════════════════════════════════════
PLANO ORIGINAL:
═══════════════════════════════════════════════════════════════════════════
Objetivo: "{plan_objective}"
Total de etapas: {total_steps}

ETAPAS JÁ CONCLUÍDAS:
{completed_steps}

ETAPA QUE ACABOU DE TERMINAR:
Título: "{current_step_title}"
Resultado: {current_step_result}

ETAPAS RESTANTES NO PLANO ORIGINAL:
{remaining_steps}

═══════════════════════════════════════════════════════════════════════════
CAPABILITIES DISPONÍVEIS:
═══════════════════════════════════════════════════════════════════════════
{available_capabilities}

═══════════════════════════════════════════════════════════════════════════
SUA TAREFA:
═══════════════════════════════════════════════════════════════════════════

Analise os resultados obtidos até agora e decida se o plano precisa ser modificado.

SITUAÇÕES QUE PEDEM MUDANÇA:
1. A pesquisa não encontrou resultados úteis → pode pular etapa de decisão
2. O professor já tem atividades similares → ajustar para não duplicar
3. O resultado de uma etapa revelou uma necessidade não prevista → adicionar etapa
4. Uma etapa se tornou desnecessária após os resultados → remover
5. A ordem das etapas restantes não faz mais sentido → reordenar

SITUAÇÕES QUE NÃO PEDEM MUDANÇA:
1. Tudo está indo conforme o planejado
2. Os resultados estão dentro do esperado
3. As etapas restantes ainda fazem sentido

RESPONDA COM UM JSON VÁLIDO:
{
  "needs_replan": true/false,
  "reason": "Breve explicação do por que mudar ou manter",
  "updated_remaining_steps": [
    {
      "titulo": "Título da etapa",
      "descricao": "Descrição da etapa",
      "capabilities": [
        {
          "nome": "NOME_EXATO_DA_CAPABILITY",
          "displayName": "Frase curta com Vou...",
          "categoria": "CATEGORIA",
          "parametros": {},
          "justificativa": "Por que esta capability"
        }
      ]
    }
  ]
}

REGRAS:
- Se needs_replan é false, updated_remaining_steps deve ser VAZIO []
- Se needs_replan é true, updated_remaining_steps deve conter TODAS as etapas restantes (não apenas as novas)
- Use APENAS capabilities da lista fornecida
- NÃO invente nomes de capabilities
- Se incluir "criar_atividade", SEMPRE inclua "salvar_atividades_bd" depois
- Minimize mudanças — só altere o que REALMENTE precisa mudar
- RESPONDA APENAS COM O JSON, sem explicações adicionais
`.trim();

export function buildReplanningPrompt(params: {
  planObjective: string;
  totalSteps: number;
  completedSteps: string;
  currentStepTitle: string;
  currentStepResult: string;
  remainingSteps: string;
  availableCapabilities: string;
}): string {
  return REPLANNING_PROMPT
    .replace('{plan_objective}', params.planObjective)
    .replace('{total_steps}', String(params.totalSteps))
    .replace('{completed_steps}', params.completedSteps)
    .replace('{current_step_title}', params.currentStepTitle)
    .replace('{current_step_result}', params.currentStepResult)
    .replace('{remaining_steps}', params.remainingSteps)
    .replace('{available_capabilities}', params.availableCapabilities);
}

export default REPLANNING_PROMPT;
