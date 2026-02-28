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
    'schoolYear': '[série/turma especificada pelo professor]',
    'anoSerie': '[ano/série especificado]',
    'objectives': 'Compreender os conceitos fundamentais e aplicar em situações práticas do cotidiano',
    'objetivos': 'Desenvolver habilidades de análise crítica e resolução de problemas',
    'materials': 'Quadro branco, projetor, material impresso, calculadora',
    'materiais': 'Livro didático, caderno, lápis, borracha',
    'context': 'Turma de 25 alunos com conhecimentos básicos na disciplina',
    'perfilTurma': 'Alunos engajados com interesse em atividades práticas',
    'tituloTemaAssunto': 'Substantivos Próprios e Comuns',
    'publicoAlvo': '[alunos da turma especificada pelo professor]',
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
function extractPedagogicalContextFromConversation(conversationContext: string): {
  grauExtraido: string;
  disciplinaExtraida: string;
  temaExtraido: string;
} {
  const ctx = conversationContext || '';

  const grauMatch = ctx.match(/(\d+)[ºª°]?\s*ano/i);
  const grauExtraido = grauMatch ? `${grauMatch[1]}º Ano` : '';

  const DISCIPLINAS = [
    'Português', 'Língua Portuguesa', 'Matemática', 'Ciências', 'História',
    'Geografia', 'Inglês', 'Educação Física', 'Arte', 'Artes', 'Biologia',
    'Química', 'Física', 'Sociologia', 'Filosofia', 'Literatura', 'Redação',
    'Ed. Física', 'Educação Financeira', 'Espanhol'
  ];
  let disciplinaExtraida = '';
  for (const d of DISCIPLINAS) {
    if (new RegExp(`\\b${d}\\b`, 'i').test(ctx)) {
      disciplinaExtraida = d;
      break;
    }
  }

  let temaExtraido = '';
  const temaPatterns = [
    /\bsobre\s+([^.,\n!?]{5,60})/i,
    /\btema[:\s]+([^.,\n!?]{5,60})/i,
    /\btrabalhando\s+(?:com\s+)?([^.,\n!?]{5,60})/i,
    /\bestudando\s+(?:sobre\s+)?([^.,\n!?]{5,60})/i,
    /\bconteúdo[:\s]+([^.,\n!?]{5,60})/i,
    /\bassunto[:\s]+([^.,\n!?]{5,60})/i,
  ];
  const FORBIDDEN_TEMA_WORDS = /\b(ajuda|urgente|urgência|preciso|manhã|tarde|noite|semana|aula|atividade|criar|material|professor|professora|turma|alunos|obrigad|valeu|oi|olá|bom\s+dia|boa\s+tarde)\b/i;
  for (const pattern of temaPatterns) {
    const m = ctx.match(pattern);
    if (m && m[1] && !FORBIDDEN_TEMA_WORDS.test(m[1].trim())) {
      temaExtraido = m[1].trim().replace(/\s+/g, ' ');
      break;
    }
  }

  return { grauExtraido, disciplinaExtraida, temaExtraido };
}

function extractPedagogicalInstructions(userObjective: string): string {
  const obj = userObjective || '';
  const instructions: string[] = [];

  const contextPatterns = [
    /contexto\s+de\s+([^.,!?\n]{3,50})/i,
    /usando\s+(?:o\s+contexto\s+de\s+|contexto\s+de\s+)?([^.,!?\n]{3,50})\s+(?:como\s+exemplo|nos\s+exemplos|em\s+todos)/i,
    /exemplos?\s+(?:devem?\s+usar?|com|usando?|de)\s+([^.,!?\n]{3,50})/i,
  ];
  for (const p of contextPatterns) {
    const m = obj.match(p);
    if (m && m[1]) { instructions.push(`use contexto de ${m[1].trim()} em todos os exemplos`); break; }
  }

  if (/linguagem\s+simples|língua\s+simples|vocabulário\s+simples/i.test(obj)) {
    instructions.push('use linguagem simples e acessível');
  }
  if (/dificuldade\s+de\s+leitura|dificuldade\s+para\s+ler|leitura\s+difícil/i.test(obj)) {
    instructions.push('textos curtos e diretos, adequados para alunos com dificuldade de leitura');
  }
  if (/exemplos?\s+do\s+dia\s+a\s+dia|cotidiano|vida\s+real/i.test(obj)) {
    instructions.push('use exemplos do dia a dia e situações do cotidiano');
  }
  if (/abordagem\s+lúdica|jogos?|gamifica/i.test(obj)) {
    instructions.push('abordagem lúdica e gamificada');
  }

  return instructions.slice(0, 3).join('; ');
}

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
  fileContext?: string,
  turmaExtraida?: string,
  temaLimpo?: string,
  disciplinaExtraida?: string
): string {
  const { grauExtraido, disciplinaExtraida: disciplinaFromCtx, temaExtraido } = extractPedagogicalContextFromConversation(conversationContext);

  const resolvedGrade = turmaExtraida || grauExtraido || activity.campos_preenchidos?.schoolYear || activity.campos_preenchidos?.anoSerie || '';
  const resolvedTema = temaLimpo || temaExtraido || activity.campos_preenchidos?.theme || activity.campos_preenchidos?.tema || '';
  const resolvedDisciplina = disciplinaExtraida || disciplinaFromCtx || activity.campos_preenchidos?.subject || activity.campos_preenchidos?.disciplina || activity.materia || 'Não especificada';

  const qualityCtx: QualityContext = {
    tema: resolvedTema,
    disciplina: resolvedDisciplina,
    anoSerie: resolvedGrade,
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
${(turmaExtraida || resolvedTema || (resolvedDisciplina && resolvedDisciplina !== 'Não especificada')) ? `
## ⚡ DADOS CONFIRMADOS PELO PROFESSOR — PRIORIDADE MÁXIMA
${turmaExtraida ? `**TURMA/SÉRIE: ${turmaExtraida}**` : ''}
${resolvedTema ? `**TEMA/ASSUNTO: ${resolvedTema}**` : ''}
${resolvedDisciplina && resolvedDisciplina !== 'Não especificada' ? `**DISCIPLINA: ${resolvedDisciplina}**` : ''}
→ USE EXATAMENTE estes valores nos campos correspondentes.
→ NÃO substitua turma por "7º Ano", tema por "Atividades", disciplina por "geral".
→ NÃO tente "normalizar" ou "padronizar" nenhum desses valores.
` : ''}
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

## INTENÇÃO PEDAGÓGICA DA ATIVIDADE
${activity.justificativa && activity.justificativa.length > 10
  ? `Esta atividade foi especificamente escolhida porque: "${activity.justificativa}"\n→ Gere o conteúdo com ESTE objetivo pedagógico em mente — a justificativa revela o que o professor precisa.`
  : `Atividade do tipo ${fieldsMapping.displayName} para atender ao objetivo do professor descrito acima.`
}

## ATIVIDADE A PREENCHER
- **Tipo**: ${fieldsMapping.displayName} (${activity.tipo})
- **Título**: ${activity.titulo}
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

### ⚠️ EXTRAÇÃO OBRIGATÓRIA DO CONTEXTO — LEIA ANTES DE GERAR QUALQUER CAMPO

**PASSO 1 — IDENTIFIQUE O TEMA PEDAGÓGICO REAL:**
O TEMA desta atividade é o ASSUNTO ESCOLAR ensinado, NÃO palavras de urgência ou contexto do professor.

✅ TEMA CORRETO (assunto escolar): "Fotossíntese", "Sistema Solar", "Tipos de narrador", "Operações com frações", "Biomas brasileiros", "Substantivos próprios e comuns", "Revolução Industrial"
❌ TEMA PROIBIDO (contexto/urgência): "ajuda urgente", "preciso de material", "manhã", "urgente", "criar atividade", "turma difícil", "semana que vem"
${resolvedTema ? `→ ⚡ CONFIRMADO: O assunto específico é "${resolvedTema}" — USE ESTE TEMA em tituloTemaAssunto, theme, tema e todos os campos de assunto. NÃO substitua por "Atividades" ou qualquer genérico.` : '→ Leia o bloco "CONTEXTO COMPLETO DA CONVERSA" e "OBJETIVO ORIGINAL DO USUÁRIO" acima.\n→ Extraia o ASSUNTO ESCOLAR mencionado pelo professor.'}
→ Se não houver assunto claro, combine DISCIPLINA + SÉRIE para criar um tema específico e concreto.
→ NUNCA use palavras de urgência, contexto administrativo ou frases do professor como tema.

**PASSO 2 — IDENTIFIQUE A SÉRIE/ANO:**
${turmaExtraida ? `→ ⚡ CONFIRMADO: O professor especificou EXATAMENTE "${turmaExtraida}" — USE ESTE VALOR EM TODOS OS CAMPOS DE SÉRIE/ANO/TURMA. Não mude, não normalize, não substitua.` : '→ Leia o contexto acima e encontre o ano/série mencionado pelo professor (ex: "8º ano", "turma do 6o ano").'}
→ Use EXATAMENTE o que o professor disse — não substitua por um padrão.
→ Somente se o ano não estiver mencionado em NENHUM lugar, use o ano mais comum para a disciplina identificada.

**PASSO 3 — IDENTIFIQUE A DISCIPLINA:**
${resolvedDisciplina && resolvedDisciplina !== 'Não especificada' ? `→ ⚡ CONFIRMADO: A disciplina é "${resolvedDisciplina}" — USE EXATAMENTE este valor nos campos subject, disciplina e correlatos. NÃO use "geral".` : '→ Leia o contexto acima e encontre a disciplina mencionada pelo professor.'}
→ Use EXATAMENTE o que o professor disse — não substitua por "geral" ou "Não especificada".
→ Somente se a disciplina não estiver mencionada, infira pelo tema (ex: fotossíntese → Ciências/Biologia).

**PASSO 4 — RESPEITE RESTRIÇÕES PEDAGÓGICAS ESPECÍFICAS:**
→ Se o professor mencionou restrições (ex: alunos com TEA, turma com dificuldades, preferência por jogos), aplique-as em TODOS os campos gerados.
→ NUNCA invente dados da turma (quantidade de alunos, nome da turma, perfil) que não foram mencionados.
${extractPedagogicalInstructions(userObjective) ? `→ ⚡ INSTRUÇÃO ESPECIAL DO PROFESSOR: "${extractPedagogicalInstructions(userObjective)}" — aplique em TODO o conteúdo gerado.` : ''}

### REGRA DE EXPANSÃO DE CONTEXTO
Aplique SOMENTE se o objetivo do usuário for vago E o contexto da conversa não contiver informações suficientes:
1. Use a disciplina e série já identificadas no PASSO 1–3 acima
2. Crie um tema específico e concreto compatível com a série identificada
3. Gerar conteúdo rico e detalhado que seria útil para um professor real
4. Incluir exemplos práticos, metodologias pedagógicas modernas e alinhamento com BNCC${bnccContext?.count ? ` (use os códigos BNCC listados acima)` : ''}

### PADRÕES DE QUALIDADE PARA CADA TIPO DE CAMPO
1. **CAMPOS TEXT**: Gere texto claro e específico (mínimo 10 caracteres)
2. **CAMPOS TEXTAREA**: Gere texto RICO E DETALHADO (mínimo 100 caracteres) com:
   - Múltiplos pontos ou tópicos quando aplicável
   - Linguagem pedagógica profissional
   - Exemplos práticos quando relevante
3. **CAMPOS NUMBER**: Use valores numéricos apropriados (ex: 10, 15, 20)
4. **CAMPOS SELECT**: Use EXATAMENTE uma das opções listadas

### REGRAS DE COERÊNCIA
1. **DISCIPLINA**: Extraia do contexto da conversa (PASSO 3 acima). Se não encontrar, infira pelo tema.
2. **SÉRIE/ANO**: Extraia do contexto da conversa (PASSO 2 acima). Se não encontrar, use o mais adequado para a disciplina.
3. **TEMA**: Use o assunto escolar identificado no PASSO 1 — específico e pedagógico.
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
