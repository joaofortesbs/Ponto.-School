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
Crie um plano de ação SIMPLES e ORIENTADO A VALOR com no máximo 3 etapas genéricas.
As etapas devem ser AMPLAS e focadas no RESULTADO para o professor, não em detalhes técnicos.

RESPONDA APENAS COM UM JSON VÁLIDO no seguinte formato:
{
  "objetivo": "Resumo claro do que será entregue ao professor",
  "etapas": [
    {
      "titulo": "Título genérico orientado a valor (começa com verbo)",
      "descricao": "Descrição simples do benefício desta etapa",
      "capabilities": [
        {
          "nome": "nome_da_funcao",
          "displayName": "Frase curta começando com 'Vou...'",
          "categoria": "CATEGORIA",
          "parametros": {},
          "justificativa": "Breve justificativa"
        }
      ]
    }
  ]
}

REGRAS CRÍTICAS:
1. MÁXIMO 3 ETAPAS - etapas devem ser amplas e genéricas, não específicas
2. TÍTULOS DAS ETAPAS devem ser orientados a valor, ex:
   - "Escolher as melhores atividades para sua turma"
   - "Criar atividades personalizadas"
   - "Organizar tudo em uma aula pronta"
3. NÃO use títulos técnicos como "Pesquisar banco de dados" ou "Executar query"
4. DISPLAY NAMES das capabilities devem começar com "Vou..." em tom amigável
5. Foque no RESULTADO FUTURO - o que o professor vai ganhar com cada etapa
6. Categorias válidas: PESQUISAR, CRIAR, ANALISAR, ADICIONAR, EDITAR
7. Use APENAS funções da lista de capabilities disponíveis
8. NÃO crie etapas de "análise prévia" ou "entendimento" - vá direto às ações que entregam valor

EXEMPLOS DE TÍTULOS BOM vs RUIM:
- BOM: "Escolher as melhores atividades para sua turma" 
- RUIM: "Pesquisar atividades no banco de dados"

- BOM: "Criar atividades personalizadas"
- RUIM: "Executar criação de atividades via API"

- BOM: "Transformar tudo em aulas prontas"
- RUIM: "Gerar plano de aula com template padrão"

EXEMPLO DE PLANO IDEAL PARA "Preciso criar a próxima aula para a turma 7A":
{
  "objetivo": "Criar uma aula completa e personalizada para a turma 7A",
  "etapas": [
    {
      "titulo": "Escolher as melhores atividades para a turma 7A",
      "descricao": "Vou analisar sua turma e selecionar as atividades que mais combinam",
      "capabilities": [
        {
          "nome": "pesquisar_tipos_atividades",
          "displayName": "Vou verificar quais tipos de atividades funcionam melhor",
          "categoria": "PESQUISAR",
          "parametros": {},
          "justificativa": "Encontrar atividades ideais para a turma"
        },
        {
          "nome": "pesquisar_atividades_conta",
          "displayName": "Vou ver quais atividades já estão disponíveis",
          "categoria": "PESQUISAR",
          "parametros": {},
          "justificativa": "Aproveitar atividades existentes"
        }
      ]
    },
    {
      "titulo": "Criar as atividades personalizadas",
      "descricao": "Vou criar atividades sob medida para sua turma",
      "capabilities": [
        {
          "nome": "criar_atividade",
          "displayName": "Vou criar atividades engajantes para seus alunos",
          "categoria": "CRIAR",
          "parametros": {"contexto": "turma 7A"},
          "justificativa": "Criar conteúdo personalizado"
        }
      ]
    },
    {
      "titulo": "Transformar tudo em uma aula pronta",
      "descricao": "Vou organizar as atividades em um plano de aula completo",
      "capabilities": [
        {
          "nome": "criar_plano_aula",
          "displayName": "Vou montar a aula completa para você usar",
          "categoria": "CRIAR",
          "parametros": {"tema": "aula personalizada"},
          "justificativa": "Entregar aula pronta para uso"
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
