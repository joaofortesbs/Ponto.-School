
import activityFieldDefinitions from '../data/activityFieldDefinitions.json';

export interface ActivityFieldDefinition {
  id: string;
  label: string;
  camposNecessarios: string[];
  camposLegiveisMap: Record<string, string>;
}

export interface ActivityFieldData {
  [key: string]: string;
}

/**
 * Busca definição de campos por ID da atividade
 */
export function getActivityFieldDefinition(activityId: string): ActivityFieldDefinition | null {
  const definition = activityFieldDefinitions.find(def => def.id === activityId);
  return definition || null;
}

/**
 * Gera prompt dinâmico para a IA com base nos campos necessários
 */
export function generateActivityPrompt(
  activityId: string,
  contextualizationData: any
): string {
  const definition = getActivityFieldDefinition(activityId);
  
  if (!definition) {
    return `Gere uma sugestão de atividade com ID "${activityId}" baseada no contexto fornecido.`;
  }

  const camposTexto = definition.camposNecessarios.map(campo => 
    `- ${definition.camposLegiveisMap[campo] || campo}`
  ).join('\n');

  const contexto = `
Contexto do usuário:
- Matérias: ${contextualizationData?.materias || 'Não especificado'}
- Público-alvo: ${contextualizationData?.publicoAlvo || 'Não especificado'}
- Restrições: ${contextualizationData?.restricoes || 'Não especificado'}
- Datas importantes: ${contextualizationData?.datasImportantes || 'Não especificado'}
- Observações: ${contextualizationData?.observacoes || 'Não especificado'}
  `.trim();

  const prompt = `
Você é um assistente pedagógico especializado. Quero que você gere uma sugestão de atividade do tipo "${definition.label}", com os seguintes campos preenchidos:

${camposTexto}

${contexto}

Esses campos devem ser preenchidos com base no contexto pedagógico fornecido, seguindo diretrizes da BNCC quando aplicável. A sugestão será apresentada ao professor para validação, então utilize uma linguagem clara, didática e profissional.

IMPORTANTE: Responda APENAS no formato JSON válido, sem texto adicional antes ou depois:

{
  "id": "${activityId}",
  ${definition.camposNecessarios.map(campo => 
    `"${campo}": "..."`
  ).join(',\n  ')}
}
  `.trim();

  return prompt;
}

/**
 * Valida se a resposta da IA contém todos os campos necessários
 */
export function validateActivityResponse(
  activityId: string, 
  response: ActivityFieldData
): { isValid: boolean; missingFields: string[] } {
  const definition = getActivityFieldDefinition(activityId);
  
  if (!definition) {
    return { isValid: false, missingFields: [] };
  }

  const missingFields = definition.camposNecessarios.filter(campo => 
    !response[campo] || response[campo].trim() === ''
  );

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

/**
 * Formata os campos para exibição no componente
 */
export function formatActivityFieldsForDisplay(
  activityId: string,
  fieldData: ActivityFieldData
): Array<{ label: string; value: string; key: string }> {
  const definition = getActivityFieldDefinition(activityId);
  
  if (!definition) {
    return [];
  }

  return definition.camposNecessarios
    .filter(campo => fieldData[campo] && fieldData[campo].trim() !== '')
    .map(campo => ({
      key: campo,
      label: definition.camposLegiveisMap[campo] || campo,
      value: fieldData[campo]
    }));
}

/**
 * Lista todas as atividades disponíveis
 */
export function getAllActivityDefinitions(): ActivityFieldDefinition[] {
  return activityFieldDefinitions;
}
