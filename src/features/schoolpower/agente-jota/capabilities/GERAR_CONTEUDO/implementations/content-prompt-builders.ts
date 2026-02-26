/**
 * content-prompt-builders.ts
 * Construtores de prompt, JSON parser robusto e validação de campos gerados.
 */

import type { ActivityFieldsMapping, FieldDefinition } from '../schemas/gerar-conteudo-schema';
import { getQualityEnhancementForType, getBatchProgressionPrompt, type QualityContext } from '../../../prompts/quality-prompt-templates';
import type { ChosenActivity } from '../../../../interface-chat-producao/stores/ChosenActivitiesStore';
import type {
  BnccContextData,
  QuestoesReferenciaData,
  WebSearchContextData,
  JsonParseResult,
} from './content-types';

// ============================================================
// HELPER: Robust JSON Parser com múltiplas estratégias de fallback
// ============================================================
export function robustJsonParse(rawText: string, activityType?: string, fieldsMapping?: ActivityFieldsMapping): JsonParseResult {
  if (!rawText || typeof rawText !== 'string') {
    return { success: false, data: null, method: 'none', error: 'Input inválido ou vazio' };
  }

  try {
    const cleaned = rawText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .replace(/^\s*[\r\n]/gm, '')
      .trim();

    if (cleaned.startsWith('{')) {
      const parsed = JSON.parse(cleaned);
      return { success: true, data: parsed, method: 'direct_clean_parse' };
    }
  } catch (e) { }

  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { success: true, data: parsed, method: 'regex_extraction' };
    }
  } catch (e) { }

  try {
    const generatedFieldsMatch = rawText.match(/"generated_fields"\s*:\s*(\{[\s\S]*?\})/);
    if (generatedFieldsMatch) {
      const parsed = JSON.parse(generatedFieldsMatch[1]);
      return { success: true, data: { generated_fields: parsed }, method: 'generated_fields_extraction' };
    }
  } catch (e) { }

  try {
    let repairedJson = rawText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .replace(/[\r\n]+/g, ' ')
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .trim();

    const jsonMatch = repairedJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { success: true, data: parsed, method: 'json_repair' };
    }
  } catch (e) { }

  try {
    const fields: Record<string, any> = {};

    const stringPatterns = [
      { key: 'theme', pattern: /"theme"\s*:\s*"([^"]+)"/i },
      { key: 'topicos', pattern: /"topicos"\s*:\s*"([^"]+)"/i },
      { key: 'contextoUso', pattern: /"contextoUso"\s*:\s*"([^"]+)"/i },
      { key: 'subject', pattern: /"subject"\s*:\s*"([^"]+)"/i },
      { key: 'schoolYear', pattern: /"schoolYear"\s*:\s*"([^"]+)"/i },
      { key: 'difficultyLevel', pattern: /"difficultyLevel"\s*:\s*"([^"]+)"/i },
      { key: 'objectives', pattern: /"objectives"\s*:\s*"([^"]+)"/i },
      { key: 'context', pattern: /"context"\s*:\s*"([^"]+)"/i },
    ];

    const numberPatterns = [
      { key: 'numberOfFlashcards', pattern: /"numberOfFlashcards"\s*:\s*(\d+)/i },
      { key: 'numberOfQuestions', pattern: /"numberOfQuestions"\s*:\s*(\d+)/i },
    ];

    for (const { key, pattern } of stringPatterns) {
      const match = rawText.match(pattern);
      if (match && match[1]) fields[key] = match[1];
    }

    for (const { key, pattern } of numberPatterns) {
      const match = rawText.match(pattern);
      if (match && match[1]) fields[key] = Number(match[1]);
    }

    const requiredFieldNames = fieldsMapping?.requiredFields.map(f => f.name) || [];
    const extractedRequiredCount = requiredFieldNames.filter(name => fields[name] !== undefined).length;

    if (extractedRequiredCount >= 2 && Object.keys(fields).length >= 2) {
      return { success: true, data: { generated_fields: fields }, method: 'field_extraction' };
    }
  } catch (e) { }

  console.warn(`⚠️ [RobustJsonParse] Todas as 5 estratégias de parsing falharam para ${activityType || 'unknown'}`);
  return {
    success: false,
    data: null,
    method: 'all_methods_failed',
    error: `Todas as 5 estratégias de parsing falharam. Tipo: ${activityType || 'unknown'}`
  };
}

// ============================================================
// Gerador de valores de exemplo para campos (evita placeholders literais)
// ============================================================
function getExampleValueForField(field: FieldDefinition): string {
  if (field.type === 'number') {
    return field.validation?.min ? String(field.validation.min + 5) : '10';
  }
  if (field.type === 'select' && field.options?.length) {
    return `"${field.options[0]}"`;
  }
  const exampleValues: Record<string, string> = {
    'subject': 'Matemática',
    'disciplina': 'Língua Portuguesa',
    'theme': 'Operações com Frações',
    'tema': 'Substantivos e Adjetivos',
    'schoolYear': '7º Ano - Ensino Fundamental',
    'anoSerie': '6º Ano do Ensino Fundamental',
    'objectives': 'Compreender os conceitos fundamentais e aplicar em situações práticas do cotidiano',
    'objetivos': 'Desenvolver habilidades de análise crítica e resolução de problemas',
    'materials': 'Quadro branco, projetor, material impresso, calculadora',
    'materiais': 'Livro didático, caderno, lápis, borracha',
    'context': 'Turma de 25 alunos com conhecimentos básicos na disciplina',
    'perfilTurma': 'Alunos engajados com interesse em atividades práticas',
    'tituloTemaAssunto': 'Substantivos Próprios e Comuns',
    'publicoAlvo': 'Alunos do 6º ano com perfil heterogêneo',
    'objetivosAprendizagem': 'Identificar e classificar substantivos em textos diversos',
    'temaRedacao': 'Desafios da mobilidade urbana no Brasil',
    'objetivo': 'Desenvolver argumentação crítica sobre o tema proposto',
    'competenciasENEM': 'C1, C2, C3, C4, C5',
    'contextoAdicional': 'Contexto histórico e social relevante para o tema'
  };

  if (exampleValues[field.name]) return `"${exampleValues[field.name]}"`;
  if (field.type === 'textarea') return `"Conteúdo detalhado sobre ${field.label.toLowerCase()}"`;
  return `"Valor para ${field.label}"`;
}

// ============================================================
// buildContentGenerationPrompt — prompt principal para geração de campos
// ============================================================
export function buildContentGenerationPrompt(
  activity: ChosenActivity,
  fieldsMapping: ActivityFieldsMapping,
  conversationContext: string,
  userObjective: string,
  batchIndex?: number,
  batchTotal?: number,
  bnccContext?: BnccContextData,
  questoesReferencia?: QuestoesReferenciaData,
  webSearchContext?: WebSearchContextData,
  fileContext?: string
): string {
  const qualityCtx: QualityContext = {
    tema: activity.campos_preenchidos?.theme || activity.campos_preenchidos?.tema || activity.titulo || '',
    disciplina: activity.campos_preenchidos?.subject || activity.campos_preenchidos?.disciplina || activity.materia || 'Não especificada',
    anoSerie: activity.campos_preenchidos?.schoolYear || activity.campos_preenchidos?.anoSerie || '7º Ano',
    objetivo: userObjective,
    solicitacaoOriginal: userObjective
  };
  const qualityDirectives = getQualityEnhancementForType(activity.tipo, qualityCtx);

  const fieldsDescription = fieldsMapping.requiredFields.map((field, idx) => `
${idx + 1}. "${field.name}" (${field.label}) [OBRIGATÓRIO]
   - Descrição: ${field.description}
   - Tipo: ${field.type}
   ${field.options ? `- Opções válidas: ${field.options.join(', ')}` : ''}
   ${field.placeholder ? `- Exemplo: ${field.placeholder}` : ''}
`).join('');

  const optionalFieldsDescription = fieldsMapping.optionalFields?.map((field, idx) => `
${idx + 1}. "${field.name}" (${field.label}) [OPCIONAL - MAS GERE]
   - Descrição: ${field.description}
   - Tipo: ${field.type}
   ${field.options ? `- Opções válidas: ${field.options.join(', ')}` : ''}
`).join('') || '';

  const allRequiredFields = fieldsMapping.requiredFields.map(f => `    "${f.name}": ${getExampleValueForField(f)}`).join(',\n');
  const allOptionalFields = fieldsMapping.optionalFields?.map(f => `    "${f.name}": ${getExampleValueForField(f)}`).join(',\n') || '';
  const allFieldsJson = allOptionalFields ? `${allRequiredFields},\n${allOptionalFields}` : allRequiredFields;

  return `
# TAREFA: Gerar Conteúdo Completo para Atividade Educacional

Você é um especialista pedagógico brasileiro gerando conteúdo detalhado para uma atividade educacional.

## CONTEXTO COMPLETO DA CONVERSA
${conversationContext}

${fileContext ? `## 📎 MATERIAL DO PROFESSOR — USE COMO MATÉRIA-PRIMA PEDAGÓGICA
⚓ REGRAS DE USO DO ARQUIVO (leia antes de gerar qualquer campo):
• Se o professor pediu um TIPO ESPECÍFICO de atividade → use o arquivo para PREENCHER o conteúdo desse tipo
• Se o pedido foi vago ("crie atividades") → use o arquivo como TEMA E FONTE de todo o conteúdo gerado
• Extraia do arquivo: vocabulário específico, exemplos reais, trechos para exercícios, contexto temático
• NUNCA ignore o arquivo quando ele está presente — é o diferencial que o professor enviou
• NUNCA substitua o TIPO de atividade pedido pelo conteúdo do arquivo

${fileContext}

` : ''}## OBJETIVO ORIGINAL DO USUÁRIO
${userObjective}

## ATIVIDADE A PREENCHER
- **Tipo**: ${fieldsMapping.displayName} (${activity.tipo})
- **Título**: ${activity.titulo}
- **Justificativa da escolha**: ${activity.justificativa}
- **Categoria**: ${activity.categoria || 'Não especificada'}
- **Matéria**: ${activity.materia || 'Não especificada'}

## TODOS OS CAMPOS A GERAR (OBRIGATÓRIOS)
${fieldsDescription}

${optionalFieldsDescription ? `## CAMPOS OPCIONAIS (GERE TODOS TAMBÉM)
${optionalFieldsDescription}` : ''}

${bnccContext?.prompt_context ? `## ALINHAMENTO CURRICULAR — BNCC (Base Nacional Comum Curricular)
As seguintes habilidades da BNCC foram identificadas como relevantes para esta atividade.
Você DEVE incorporar essas habilidades no conteúdo gerado:
- Referencie os CÓDIGOS BNCC (ex: EF07CI02) nos campos de objetivos, habilidades ou competências
- Alinhe o conteúdo pedagógico às descrições dessas habilidades
- Se houver campo "habilidadesBNCC" ou "bnccCompetencias", preencha com os códigos encontrados

${bnccContext.prompt_context}
` : ''}${questoesReferencia?.prompt_context ? `## QUESTÕES DE REFERÊNCIA (Modelos de Qualidade)
${questoesReferencia.prompt_context}
` : ''}${webSearchContext?.prompt_context && webSearchContext.count > 0 ? `## FONTES EDUCACIONAIS REAIS — Pesquisa Web do Jota
O Jota pesquisou ${webSearchContext.count} fontes educacionais brasileiras reais sobre "${webSearchContext.query}".

⚠️ REGRAS OBRIGATÓRIAS DE USO DAS FONTES (leia antes de usar qualquer fonte):
1. RELEVÂNCIA: Só incorpore informações de uma fonte se ela tratar DIRETAMENTE de "${activity.titulo || webSearchContext.query}"
2. REJEIÇÃO: Se uma fonte parecer tratar de assunto DIFERENTE do tema principal, IGNORE-A completamente — não force conexões artificiais
3. HONESTIDADE: Só cite uma URL em "fontes_consultadas" se você REALMENTE utilizou informação concreta dela
4. PRIORIDADE: A ⭐ FONTE PRINCIPAL (marcada no contexto abaixo) deve ser priorizada sobre as demais
5. VERIFICAÇÃO FINAL: Antes de retornar o JSON, confirme que cada URL citada está relacionada ao tema da atividade

${webSearchContext.prompt_context}
` : ''}## INSTRUÇÕES CRÍTICAS PARA GERAÇÃO DE CONTEÚDO

### REGRA DE EXPANSÃO DE CONTEXTO
Se o objetivo do usuário for vago ou curto (ex: "matemática aplicada", "criar atividades"), você DEVE:
1. Inferir a disciplina mais provável com base no contexto
2. Sugerir uma série/ano escolar apropriada (padrão: Ensino Fundamental II ou Ensino Médio)
3. Criar um tema específico e concreto relacionado ao objetivo
4. Gerar conteúdo rico e detalhado que seria útil para um professor real
5. Incluir exemplos práticos, metodologias pedagógicas modernas e alinhamento com BNCC${bnccContext?.count ? ` (use os códigos BNCC listados acima)` : ''}

### PADRÕES DE QUALIDADE PARA CADA TIPO DE CAMPO
1. **CAMPOS TEXT**: Gere texto claro e específico (mínimo 10 caracteres)
2. **CAMPOS TEXTAREA**: Gere texto RICO E DETALHADO (mínimo 100 caracteres) com:
   - Múltiplos pontos ou tópicos quando aplicável
   - Linguagem pedagógica profissional
   - Exemplos práticos quando relevante
3. **CAMPOS NUMBER**: Use valores numéricos apropriados (ex: 10, 15, 20)
4. **CAMPOS SELECT**: Use EXATAMENTE uma das opções listadas

### REGRAS DE COERÊNCIA
1. **DISCIPLINA**: Se não especificada, infira do contexto (Matemática, Português, Ciências, etc.)
2. **SÉRIE/ANO**: Se não especificado, use "7º Ano - Ensino Fundamental" como padrão
3. **TEMA**: Seja específico! Em vez de "matemática", use "Operações com Frações" ou "Equações do 1º Grau"
4. **OBJETIVOS**: Liste múltiplos objetivos de aprendizagem mensuráveis
5. **MATERIAIS**: Liste recursos concretos que serão utilizados

## DIRETRIZES DE QUALIDADE PEDAGÓGICA (ESPECÍFICAS PARA ${fieldsMapping.displayName.toUpperCase()})
${qualityDirectives}

${(batchIndex !== undefined && batchTotal !== undefined && batchTotal > 1) ? getBatchProgressionPrompt(batchIndex, batchTotal, []) : ''}

## FORMATO DE RESPOSTA - JSON COMPLETO

⚠️ ATENÇÃO MÁXIMA: Você DEVE preencher ABSOLUTAMENTE TODOS os campos listados abaixo.
Retorne EXATAMENTE este formato JSON com TODOS os campos preenchidos.

{
  "generated_fields": {
${allFieldsJson}
  },
  "reasoning": "Breve explicação pedagógica da geração"
}

## REGRAS OBRIGATÓRIAS DO JSON
- Retorne APENAS o JSON puro, sem \`\`\`json ou \`\`\`
- Todas as strings devem usar aspas duplas (")
- Números devem ser escritos sem aspas (ex: 10, não "10")
- NÃO inclua comentários no JSON
- NÃO deixe NENHUM campo vazio ou com valores placeholder
- Gere conteúdo REAL e ÚTIL para cada campo
`.trim();
}

// ============================================================
// validateGeneratedFields — valida e corrige campos obrigatórios
// ============================================================
export function validateGeneratedFields(
  fields: Record<string, any>,
  mapping: ActivityFieldsMapping
): { valid: boolean; errors: string[]; correctedFields: Record<string, any> } {
  const errors: string[] = [];
  const correctedFields = { ...fields };

  for (const fieldDef of mapping.requiredFields) {
    const value = fields[fieldDef.name];

    if (value === undefined || value === null || value === '') {
      errors.push(`Campo obrigatório "${fieldDef.label}" não foi preenchido`);
      continue;
    }

    if (fieldDef.type === 'select' && fieldDef.options) {
      const normalizedValue = String(value).toLowerCase();
      const validOption = fieldDef.options.find(opt => opt.toLowerCase() === normalizedValue);
      if (!validOption) {
        correctedFields[fieldDef.name] = fieldDef.options[0];
        errors.push(`Campo "${fieldDef.label}" corrigido de "${value}" para "${fieldDef.options[0]}"`);
      } else {
        correctedFields[fieldDef.name] = validOption;
      }
    }

    if (fieldDef.type === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        correctedFields[fieldDef.name] = 10;
        errors.push(`Campo "${fieldDef.label}" não é numérico, usando valor padrão`);
      } else {
        correctedFields[fieldDef.name] = numValue;
      }
    }

    if (fieldDef.type === 'textarea') {
      const textValue = String(value);
      if (textValue.length < 20) {
        errors.push(`Campo "${fieldDef.label}" tem conteúdo muito curto`);
      }
    }
  }

  return { valid: errors.length === 0, errors, correctedFields };
}
