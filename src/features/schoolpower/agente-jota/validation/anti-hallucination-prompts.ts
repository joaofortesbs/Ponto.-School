/**
 * ANTI-HALLUCINATION PROMPTS
 * 
 * Prompts estruturados para forçar LLM a usar APENAS dados validados.
 * Inclui few-shot examples e negative prompting.
 */

import type { UserContextValidation } from './data-validation-service';

export interface StructuredPromptContext {
  validatedData: string;
  userRequest: string;
  capabilityName: string;
  fewShotExamples: string;
  antiHallucinationRules: string;
}

export function buildAntiHallucinationPrompt(
  context: UserContextValidation,
  userRequest: string,
  capabilityName: string
): StructuredPromptContext {
  const validatedData = formatValidatedData(context);
  const fewShotExamples = getFewShotExamples(capabilityName);
  const antiHallucinationRules = getAntiHallucinationRules();

  return {
    validatedData,
    userRequest,
    capabilityName,
    fewShotExamples,
    antiHallucinationRules,
  };
}

function formatValidatedData(context: UserContextValidation): string {
  const sections: string[] = [];

  sections.push('╔══════════════════════════════════════════╗');
  sections.push('║  DADOS VALIDADOS DO BANCO DE DADOS       ║');
  sections.push('╚══════════════════════════════════════════╝');
  sections.push('');

  sections.push(`📊 STATUS GERAL: ${context.hasAnyData ? 'Dados encontrados' : 'NENHUM DADO ENCONTRADO'}`);
  sections.push('');

  sections.push('─── TURMAS ───');
  if (context.turmas.exists && context.turmas.data) {
    sections.push(`Total: ${context.turmas.count} turma(s)`);
    context.turmas.data.forEach((t, i) => {
      let info = `  ${i + 1}. ${t.nome}`;
      if (t.alunos !== undefined) info += ` | ${t.alunos} alunos`;
      if (t.nivel) info += ` | ${t.nivel}`;
      if (t.disciplina) info += ` | ${t.disciplina}`;
      sections.push(info);
    });
  } else {
    sections.push('Total: 0 (NENHUMA TURMA CADASTRADA)');
    sections.push('⚠️ Usuário não tem turmas no sistema');
  }
  sections.push('');

  sections.push('─── ATIVIDADES ───');
  if (context.atividades.exists) {
    sections.push(`Total: ${context.atividades.count} atividade(s) existente(s)`);
  } else {
    sections.push('Total: 0 (NENHUMA ATIVIDADE CRIADA)');
  }
  sections.push('');

  sections.push('─── DISCIPLINAS ───');
  if (context.disciplinas.exists && context.disciplinas.data) {
    sections.push(`Identificadas: ${context.disciplinas.data.join(', ')}`);
  } else {
    sections.push('Identificadas: NENHUMA');
  }

  return sections.join('\n');
}

function getFewShotExamples(capabilityName: string): string {
  const examples: string[] = [
    '╔══════════════════════════════════════════╗',
    '║  EXEMPLOS DE COMPORTAMENTO CORRETO       ║',
    '╚══════════════════════════════════════════╝',
    '',
  ];

  examples.push('EXEMPLO 1 - Dados existem:');
  examples.push('  Input: turmas = [{nome: "7B", alunos: 30}]');
  examples.push('  Output CORRETO: "Encontrei 1 turma cadastrada: 7B com 30 alunos."');
  examples.push('');

  examples.push('EXEMPLO 2 - Dados NÃO existem:');
  examples.push('  Input: turmas = []');
  examples.push('  Output CORRETO: "Não encontrei turmas cadastradas na sua conta.');
  examples.push('  Gostaria de cadastrar uma turma ou criar atividades genéricas?"');
  examples.push('  Output ERRADO: "Vou analisar a turma 7B..." ❌ INVENTOU DADOS');
  examples.push('');

  examples.push('EXEMPLO 3 - Dados parciais:');
  examples.push('  Input: turmas = [{nome: "7B", alunos: null}]');
  examples.push('  Output CORRETO: "Encontrei a turma 7B, mas o número de alunos não está cadastrado."');
  examples.push('  Output ERRADO: "A turma 7B tem 25 alunos..." ❌ INVENTOU NÚMERO');
  examples.push('');

  examples.push('EXEMPLO 4 - Estatísticas não disponíveis:');
  examples.push('  Input: turmas = [{nome: "7B"}], media_notas = null');
  examples.push('  Output CORRETO: "A turma 7B está cadastrada, mas não há histórico de notas."');
  examples.push('  Output ERRADO: "A turma 7B tem média 6.5 em Matemática" ❌ INVENTOU ESTATÍSTICA');

  return examples.join('\n');
}

function getAntiHallucinationRules(): string {
  return `
╔══════════════════════════════════════════╗
║  REGRAS ANTI-ALUCINAÇÃO (OBRIGATÓRIAS)   ║
╚══════════════════════════════════════════╝

🚫 PROIBIDO (violação = resposta inválida):
  • Inventar nomes de turmas não listados nos dados
  • Mencionar números de alunos não fornecidos
  • Criar médias, notas ou estatísticas fictícias
  • Assumir existência de dados não validados
  • Dizer "vou analisar" algo que não existe

✅ OBRIGATÓRIO:
  • Usar APENAS dados da seção "DADOS VALIDADOS"
  • Se dado não existe, informar EXPLICITAMENTE
  • Sugerir ações quando dados estão ausentes
  • Ser honesto sobre limitações

📋 FORMATO DE RESPOSTA QUANDO DADOS FALTAM:
  1. Informar o que NÃO foi encontrado
  2. Explicar por que isso limita a ação
  3. Sugerir alternativas (cadastrar dados ou criar genérico)

📋 FORMATO DE RESPOSTA QUANDO DADOS EXISTEM:
  1. Mencionar EXATAMENTE o que foi encontrado
  2. Usar os números EXATOS dos dados validados
  3. Prosseguir com a ação baseada em dados reais
`.trim();
}

export function wrapPromptWithAntiHallucination(
  basePrompt: string,
  context: UserContextValidation,
  userRequest: string
): string {
  const structuredContext = buildAntiHallucinationPrompt(context, userRequest, 'capability');

  return `
${structuredContext.validatedData}

${structuredContext.fewShotExamples}

${structuredContext.antiHallucinationRules}

═══════════════════════════════════════════
SOLICITAÇÃO DO USUÁRIO:
${userRequest}
═══════════════════════════════════════════

${basePrompt}

LEMBRE-SE: Use APENAS os dados validados acima. NÃO invente nada.
`.trim();
}

export function createCapabilityValidationPrompt(
  capabilityName: string,
  params: Record<string, any>,
  context: UserContextValidation
): string {
  const sections: string[] = [];

  sections.push(`[Capability: ${capabilityName}]`);
  sections.push('');
  sections.push('PRÉ-VALIDAÇÃO:');
  
  sections.push(`  ├─ Turmas disponíveis: ${context.turmas.count}`);
  sections.push(`  ├─ Atividades existentes: ${context.atividades.count}`);
  sections.push(`  └─ Dados suficientes: ${context.hasAnyData ? 'SIM' : 'NÃO'}`);
  sections.push('');

  if (params.turma) {
    const turmaExiste = context.turmas.data?.some(t => 
      t.nome.toLowerCase() === params.turma.toLowerCase() ||
      t.id === params.turma
    );
    sections.push(`VALIDAÇÃO TURMA "${params.turma}": ${turmaExiste ? '✓ EXISTE' : '✗ NÃO EXISTE'}`);
    
    if (!turmaExiste) {
      sections.push('⚠️ TURMA SOLICITADA NÃO FOI ENCONTRADA NO BANCO');
      sections.push('   Ação: Informar usuário e sugerir alternativas');
    }
  }

  return sections.join('\n');
}

export interface HallucinationCheck {
  isHallucination: boolean;
  suspiciousEntities: string[];
  confidence: number;
  details: string;
}

export function checkForHallucinations(
  llmOutput: string,
  context: UserContextValidation
): HallucinationCheck {
  const suspiciousEntities: string[] = [];
  let confidence = 1.0;

  const turmaPattern = /turma\s+(\d+[A-Z]?|[A-Z]\d*)/gi;
  const turmaMatches = llmOutput.match(turmaPattern) || [];
  
  for (const match of turmaMatches) {
    const turmaNome = match.replace(/turma\s+/i, '').trim();
    const turmaExiste = context.turmas.data?.some(t => 
      t.nome.toLowerCase().includes(turmaNome.toLowerCase())
    );
    
    if (!turmaExiste && context.turmas.count === 0) {
      suspiciousEntities.push(`Turma "${turmaNome}" mencionada mas nenhuma turma existe`);
      confidence -= 0.3;
    }
  }

  const numberPattern = /(\d+)\s*(alunos?|estudantes?)/gi;
  const numberMatches = llmOutput.match(numberPattern) || [];
  
  if (numberMatches.length > 0 && context.turmas.isEmpty) {
    suspiciousEntities.push('Números de alunos mencionados sem turmas cadastradas');
    confidence -= 0.3;
  }

  const statsPattern = /(média|desempenho|nota)\s*:?\s*\d+[.,]?\d*/gi;
  const statsMatches = llmOutput.match(statsPattern) || [];
  
  if (statsMatches.length > 0) {
    suspiciousEntities.push('Estatísticas mencionadas sem dados de desempenho');
    confidence -= 0.4;
  }

  return {
    isHallucination: suspiciousEntities.length > 0,
    suspiciousEntities,
    confidence: Math.max(0, confidence),
    details: suspiciousEntities.length > 0 
      ? `Detectadas ${suspiciousEntities.length} possíveis alucinações`
      : 'Nenhuma alucinação detectada',
  };
}
