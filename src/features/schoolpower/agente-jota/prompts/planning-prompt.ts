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
Crie um plano de ação estruturado para realizar essa tarefa.
O plano deve ter entre 2 e 6 etapas, cada uma chamando UMA função específica.

RESPONDA APENAS COM UM JSON VÁLIDO no seguinte formato:
{
  "objetivo": "Resumo claro do que será feito (1-2 frases)",
  "etapas": [
    {
      "descricao": "Descrição amigável do que será feito nesta etapa",
      "funcao": "nome_da_funcao",
      "parametros": { "param1": "valor1" },
      "justificativa": "Por que essa etapa é necessária"
    }
  ]
}

REGRAS:
1. Use APENAS funções da lista de capabilities disponíveis
2. Cada etapa deve ser específica e executável
3. Ordene as etapas de forma lógica
4. Use parâmetros corretos para cada função
5. Se não souber qual função usar, use "analisar_solicitacao" ou "criar_atividade"
6. Descrições devem ser em português brasileiro, claras e amigáveis
7. NÃO inclua markdown ou texto fora do JSON

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
