/**
 * PLANNING PROMPT - Prompt para Criação de Planos
 * 
 * Usado pelo Planner para gerar planos de ação estruturados
 * com capabilities inteligentes para cada etapa
 */

export const PLANNING_PROMPT = `
Você é o Agente Jota, o assistente inteligente do School Power. O professor fez a seguinte solicitação:

SOLICITAÇÃO DO PROFESSOR:
"{user_prompt}"

CONTEXTO ATUAL:
{context}

FUNÇÕES DISPONÍVEIS (CAPABILITIES):
{capabilities}

INSTRUÇÕES:
Crie um plano de ação INTELIGENTE e ESTRATÉGICO com etapas claras.
Para CADA ETAPA, você deve selecionar as CAPABILITIES mais apropriadas que serão executadas.

RESPONDA APENAS COM UM JSON VÁLIDO no seguinte formato:
{
  "objetivo": "Resumo claro e específico do que será criado/feito",
  "etapas": [
    {
      "titulo": "Nome curto e claro da etapa (ex: Escolher as melhores atividades)",
      "descricao": "Descrição detalhada do que esta etapa faz",
      "capabilities": [
        {
          "nome": "nome_da_funcao",
          "displayName": "Vou pesquisar o desempenho da turma",
          "categoria": "PESQUISAR",
          "parametros": { "param1": "valor1" },
          "justificativa": "Por que esta capability é necessária"
        }
      ]
    }
  ]
}

REGRAS CRÍTICAS:
1. Cada ETAPA representa um objetivo maior (ex: "Escolher atividades", "Criar conteúdo")
2. Cada etapa deve ter 1 a 4 CAPABILITIES que são as ações específicas para atingir o objetivo
3. As capabilities devem ser executadas em ordem dentro da etapa
4. Use displayName em português conversacional (ex: "Vou pesquisar...", "Vou criar...")
5. Categorias válidas: PESQUISAR, CRIAR, ANALISAR, ADICIONAR, EDITAR
6. NÃO crie etapas de "análise" ou "entendimento" - vá direto para ações práticas
7. Use APENAS funções da lista de capabilities disponíveis
8. Se o professor quer atividades, pesquise desempenho e atividades disponíveis primeiro

EXEMPLO DE PLANO BOM:
{
  "objetivo": "Criar 3 atividades de matemática para turma 7A",
  "etapas": [
    {
      "titulo": "Escolher as melhores atividades para sua turma",
      "descricao": "Vou analisar sua turma e escolher as atividades ideais",
      "capabilities": [
        {
          "nome": "pesquisar_tipos_atividades",
          "displayName": "Vou pesquisar o desempenho da turma X",
          "categoria": "PESQUISAR",
          "parametros": {},
          "justificativa": "Entender as necessidades da turma"
        },
        {
          "nome": "pesquisar_atividades_conta",
          "displayName": "Vou pesquisar quais atividades eu posso criar",
          "categoria": "PESQUISAR",
          "parametros": {},
          "justificativa": "Ver atividades disponíveis"
        }
      ]
    },
    {
      "titulo": "Criar todas as atividades",
      "descricao": "Vou criar cada atividade personalizada",
      "capabilities": [
        {
          "nome": "criar_atividade",
          "displayName": "Vou criar a primeira atividade",
          "categoria": "CRIAR",
          "parametros": {"tipo": "exercício", "tema": "matemática"},
          "justificativa": "Criar atividade 1"
        },
        {
          "nome": "criar_atividade",
          "displayName": "Vou criar a segunda atividade",
          "categoria": "CRIAR",
          "parametros": {"tipo": "exercício", "tema": "matemática"},
          "justificativa": "Criar atividade 2"
        }
      ]
    }
  ]
}

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
