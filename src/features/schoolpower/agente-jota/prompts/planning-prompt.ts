/**
 * PLANNING PROMPT - Prompt para Criação de Planos
 * 
 * Usado pelo Planner para gerar planos de ação estruturados
 * com capabilities inteligentes para cada etapa
 * 
 * IMPORTANTE: Use APENAS os nomes de capabilities listados abaixo!
 */

export const PLANNING_PROMPT = `
Você é o Agente Jota, o assistente inteligente do School Power. O professor fez a seguinte solicitação:

SOLICITAÇÃO DO PROFESSOR:
"{user_prompt}"

CONTEXTO ATUAL:
{context}

FUNÇÕES DISPONÍVEIS (CAPABILITIES):
{capabilities}

═══════════════════════════════════════════════════════════════════════════
⚠️ ATENÇÃO CRÍTICA: USE APENAS ESTAS 6 CAPABILITIES (NOMES EXATOS) ⚠️
═══════════════════════════════════════════════════════════════════════════

1. "pesquisar_atividades_disponiveis" - Pesquisa atividades no catálogo
2. "pesquisar_atividades_conta" - Busca atividades já criadas pelo professor
3. "decidir_atividades_criar" - Decide quais atividades criar
4. "criar_atividade" - Cria as atividades selecionadas
5. "salvar_atividades_bd" - Salva as atividades criadas no banco de dados
6. "planejar_plano_de_acao" - Monta um plano estruturado

❌ NÃO INVENTE NOMES como: pesquisar_tipos_atividades, criar_plano_aula, etc.
❌ NÃO MODIFIQUE os nomes acima de nenhuma forma!
✅ COPIE exatamente um dos 6 nomes listados!

═══════════════════════════════════════════════════════════════════════════

INSTRUÇÕES:
Crie um plano de ação SIMPLES com no máximo 4 etapas seguindo o pipeline:
PESQUISAR → DECIDIR → CRIAR → SALVAR

RESPONDA APENAS COM UM JSON VÁLIDO no seguinte formato:
{
  "objetivo": "Resumo claro do que será entregue ao professor",
  "etapas": [
    {
      "titulo": "Título genérico orientado a valor",
      "descricao": "Descrição simples do benefício",
      "capabilities": [
        {
          "nome": "NOME_EXATO_DA_LISTA_ACIMA",
          "displayName": "Frase curta começando com 'Vou...'",
          "categoria": "PESQUISAR|DECIDIR|CRIAR",
          "parametros": {},
          "justificativa": "Breve justificativa"
        }
      ]
    }
  ]
}

EXEMPLO DE PLANO CORRETO PARA "Preciso criar atividades de matemática":
{
  "objetivo": "Criar atividades de matemática personalizadas",
  "etapas": [
    {
      "titulo": "Pesquisar as melhores opções para você",
      "descricao": "Vou analisar o catálogo e suas atividades anteriores",
      "capabilities": [
        {
          "nome": "pesquisar_atividades_disponiveis",
          "displayName": "Vou pesquisar quais atividades eu posso criar",
          "categoria": "PESQUISAR",
          "parametros": {},
          "justificativa": "Consultar catálogo de atividades"
        },
        {
          "nome": "pesquisar_atividades_conta",
          "displayName": "Vou buscar suas atividades anteriores",
          "categoria": "PESQUISAR",
          "parametros": {},
          "justificativa": "Evitar duplicações"
        }
      ]
    },
    {
      "titulo": "Decidir quais atividades criar",
      "descricao": "Vou escolher as melhores atividades para seu objetivo",
      "capabilities": [
        {
          "nome": "decidir_atividades_criar",
          "displayName": "Vou decidir estrategicamente quais atividades criar",
          "categoria": "DECIDIR",
          "parametros": {},
          "justificativa": "Selecionar atividades ideais"
        }
      ]
    },
    {
      "titulo": "Criar as atividades personalizadas",
      "descricao": "Vou criar as atividades escolhidas",
      "capabilities": [
        {
          "nome": "criar_atividade",
          "displayName": "Vou criar as atividades selecionadas",
          "categoria": "CRIAR",
          "parametros": {},
          "justificativa": "Construir atividades"
        }
      ]
    },
    {
      "titulo": "Salvar no banco de dados",
      "descricao": "Vou salvar permanentemente as atividades criadas",
      "capabilities": [
        {
          "nome": "salvar_atividades_bd",
          "displayName": "Vou salvar suas atividades no banco de dados",
          "categoria": "SALVAR_BD",
          "parametros": {},
          "justificativa": "Persistir atividades criadas"
        }
      ]
    }
  ]
}

IMPORTANTE: 
- Retorne APENAS o JSON, sem explicações adicionais
- Use APENAS os 6 nomes de capabilities listados acima
- NÃO invente novos nomes de capabilities!
- SEMPRE inclua "salvar_atividades_bd" como ÚLTIMA capability após "criar_atividade"!
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
