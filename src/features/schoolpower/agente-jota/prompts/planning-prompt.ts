/**
 * PLANNING PROMPT - Prompt para Criação de Planos
 * 
 * Usado pelo Planner para gerar planos de ação estruturados
 */

export const PLANNING_PROMPT = `
Você é o assistente School Power. O professor fez a seguinte solicitação:

SOLICITAÇÃO DO PROFESSOR:
"{user_prompt}"

CONTEXTO ATUAL:
{context}

FUNÇÕES DISPONÍVEIS:
{capabilities}

INSTRUÇÕES:
Analise a solicitação do professor de forma IMEDIATA e CONCRETA.
NÃO crie etapas de "análise" ou "entendimento" - você já entendeu a solicitação.
Crie um plano de ação DIRETO e EXECUTÁVEL com 1 a 5 etapas práticas.

RESPONDA APENAS COM UM JSON VÁLIDO no seguinte formato:
{
  "objetivo": "Resumo claro e específico do que será criado/feito",
  "etapas": [
    {
      "descricao": "Ação concreta que será executada",
      "funcao": "nome_da_funcao",
      "parametros": { "param1": "valor1" },
      "justificativa": "Resultado esperado desta ação"
    }
  ]
}

REGRAS CRÍTICAS:
1. NUNCA use "analisar_solicitacao" como primeira etapa - você já analisou
2. Vá DIRETO para ações práticas: criar, pesquisar, gerar
3. Use APENAS funções da lista de capabilities disponíveis
4. Cada etapa deve produzir um resultado tangível
5. Use parâmetros corretos e específicos para cada função
6. Descrições devem ser em português brasileiro, claras e diretas
7. NÃO inclua markdown ou texto fora do JSON
8. Se o professor quer uma atividade, use "criar_atividade" diretamente
9. Se o professor quer um plano de aula, use "criar_plano_aula" diretamente

IMPORTANTE: Retorne APENAS o JSON, sem explicações adicionais.
`.trim();

export interface Capability {
  name: string;
  description: string;
  parameters: Record<string, {
    type: string;
    required: boolean;
    description?: string;
    default?: any;
  }>;
}

export function formatCapabilitiesForPrompt(capabilities: Capability[]): string {
  return capabilities.map(cap => {
    const params = Object.entries(cap.parameters)
      .map(([key, val]) => `  - ${key} (${val.type}${val.required ? ', obrigatório' : ', opcional'})`)
      .join('\n');

    return `
${cap.name}:
  Descrição: ${cap.description}
  Parâmetros:
${params || '  Nenhum parâmetro'}
    `.trim();
  }).join('\n\n');
}

export default PLANNING_PROMPT;
