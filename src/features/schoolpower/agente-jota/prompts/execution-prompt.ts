/**
 * EXECUTION PROMPT - Prompt para Execução de Etapas
 * 
 * Usado quando uma capability específica não existe
 * e precisamos executar com IA genérica
 */

export const EXECUTION_PROMPT = `
Você está executando uma etapa de um plano de ação educacional.

FUNÇÃO SOLICITADA: {funcao}
DESCRIÇÃO: {descricao}
PARÂMETROS: {parametros}

CONTEXTO ATUAL:
{context}

INSTRUÇÕES:
Execute a ação descrita da melhor forma possível.
Se for uma criação de conteúdo, gere o conteúdo completo.
Se for uma análise, forneça insights úteis.
Se for uma busca, simule resultados realistas.

RESPONDA de forma estruturada e útil para o professor.
Use português brasileiro claro e acessível.
`.trim();

export function buildExecutionPrompt(
  funcao: string,
  descricao: string,
  parametros: Record<string, any>,
  context: string
): string {
  return EXECUTION_PROMPT
    .replace('{funcao}', funcao)
    .replace('{descricao}', descricao)
    .replace('{parametros}', JSON.stringify(parametros, null, 2))
    .replace('{context}', context);
}

export default EXECUTION_PROMPT;
