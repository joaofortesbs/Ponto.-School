/**
 * OUTPUT SANITIZER - Sistema de Proteção contra Vazamento de JSON
 * 
 * Detecta, valida e sanitiza outputs das chamadas de IA para garantir
 * que apenas texto narrativo humanizado chegue à UI, nunca JSON bruto.
 * 
 * 4 Camadas de Proteção:
 * 1. Detecção de JSON bruto em strings
 * 2. Conversão de JSON para texto narrativo
 * 3. Validação de formato de output esperado
 * 4. Fallback inteligente com templates
 */

export interface SanitizationResult {
  original: string;
  sanitized: string;
  wasModified: boolean;
  detectedIssues: string[];
}

const JSON_PATTERNS = [
  /^\s*\[[\s\S]*\]\s*$/,
  /^\s*\{[\s\S]*\}\s*$/,
  /\[\{"id":/,
  /\{"id":/,
  /"title"\s*:\s*"/,
  /"description"\s*:\s*"/,
  /"duration"\s*:\s*"/,
  /"difficulty"\s*:\s*"/,
  /"category"\s*:\s*"/,
  /"type"\s*:\s*"activity"/,
];

const CLEAN_TEXT_INDICATORS = [
  /^(eu |encontrei |analisei |decidi |criei |pronto |concluí |perfeito |entendi )/i,
  /\. (agora |então |assim |portanto |dessa forma )/i,
  /\!$/,
];

export function containsRawJson(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  
  const trimmed = text.trim();
  
  if (trimmed.startsWith('[{') || trimmed.startsWith('{')) {
    try {
      JSON.parse(trimmed);
      return true;
    } catch {
    }
  }
  
  for (const pattern of JSON_PATTERNS) {
    if (pattern.test(trimmed)) {
      return true;
    }
  }
  
  return false;
}

export function isCleanNarrativeText(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  
  const trimmed = text.trim();
  
  if (containsRawJson(trimmed)) {
    return false;
  }
  
  if (trimmed.length < 10) {
    return false;
  }
  
  for (const indicator of CLEAN_TEXT_INDICATORS) {
    if (indicator.test(trimmed)) {
      return true;
    }
  }
  
  const hasNaturalPunctuation = /[.!?]/.test(trimmed);
  const hasNaturalSpacing = trimmed.split(' ').length > 3;
  const noCodePatterns = !/:"|",|{|}|\[|\]/.test(trimmed);
  
  return hasNaturalPunctuation && hasNaturalSpacing && noCodePatterns;
}

export interface ActivityData {
  id?: string;
  title?: string;
  description?: string;
  duration?: string;
  difficulty?: string;
  category?: string;
  type?: string;
}

export function extractActivitiesFromJson(text: string): ActivityData[] {
  try {
    const trimmed = text.trim();
    
    let jsonMatch = trimmed.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    }
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item && typeof item === 'object');
      }
      
      if (typeof parsed === 'object' && parsed !== null) {
        return [parsed];
      }
    }
  } catch {
  }
  
  return [];
}

export function jsonToNarrative(text: string, context?: {
  etapaTitulo?: string;
  capabilityName?: string;
}): string {
  const activities = extractActivitiesFromJson(text);
  
  if (activities.length === 0) {
    return generateGenericFallback(context);
  }
  
  const count = activities.length;
  const tipos = [...new Set(activities.map(a => a.category || a.type || 'atividade').filter(Boolean))];
  const nomes = activities.slice(0, 3).map(a => a.title).filter(Boolean);
  
  let narrative = '';
  
  if (count === 1) {
    const act = activities[0];
    narrative = `Selecionei "${act.title || 'a atividade'}"`;
    if (act.description) {
      narrative += `, que ${act.description.toLowerCase()}`;
    }
    narrative += '. Esta atividade está pronta para ser personalizada.';
  } else if (count <= 3) {
    narrative = `Analisei as opções e selecionei ${count} atividades: ${nomes.join(', ')}.`;
    if (tipos.length > 0) {
      narrative += ` São atividades de ${tipos.join(' e ')}.`;
    }
    narrative += ' Todas estão prontas para personalização.';
  } else {
    narrative = `Identifiquei ${count} atividades ideais para o seu objetivo. `;
    narrative += `Incluem ${nomes.slice(0, 2).join(', ')} e mais ${count - 2} outras. `;
    if (tipos.length > 0) {
      narrative += `As categorias abrangem ${tipos.slice(0, 3).join(', ')}.`;
    }
  }
  
  return narrative;
}

export function generateGenericFallback(context?: {
  etapaTitulo?: string;
  capabilityName?: string;
}): string {
  const etapa = context?.etapaTitulo || 'esta etapa';
  const capability = context?.capabilityName?.toLowerCase() || '';
  
  if (capability.includes('pesquisar')) {
    return `Realizei a pesquisa e encontrei várias opções disponíveis. Analisando os resultados para selecionar as melhores alternativas.`;
  }
  
  if (capability.includes('decidir')) {
    return `Analisei as opções e tomei decisões estratégicas baseadas no seu objetivo. As atividades foram selecionadas com critérios pedagógicos.`;
  }
  
  if (capability.includes('gerar')) {
    return `Gerei o conteúdo personalizado para as atividades selecionadas. Todo o material está pronto para revisão.`;
  }
  
  if (capability.includes('criar')) {
    return `Criei as atividades conforme planejado. Elas estão prontas para uso em sala de aula.`;
  }
  
  if (capability.includes('salvar')) {
    return `Salvei todas as atividades no banco de dados. Você pode acessá-las a qualquer momento no seu painel.`;
  }
  
  return `Concluí ${etapa} com sucesso. O processamento foi realizado conforme planejado e tudo está pronto para a próxima fase.`;
}

export function sanitizeAiOutput(
  rawOutput: string,
  context?: {
    etapaTitulo?: string;
    capabilityName?: string;
    expectedType?: 'narrative' | 'json' | 'any';
  }
): SanitizationResult {
  const detectedIssues: string[] = [];
  
  if (!rawOutput || typeof rawOutput !== 'string') {
    detectedIssues.push('Output vazio ou inválido');
    return {
      original: rawOutput || '',
      sanitized: generateGenericFallback(context),
      wasModified: true,
      detectedIssues,
    };
  }
  
  const trimmed = rawOutput.trim();
  
  if (context?.expectedType === 'json') {
    return {
      original: rawOutput,
      sanitized: rawOutput,
      wasModified: false,
      detectedIssues: [],
    };
  }
  
  if (containsRawJson(trimmed)) {
    detectedIssues.push('JSON bruto detectado no output');
    
    const narrative = jsonToNarrative(trimmed, context);
    
    return {
      original: rawOutput,
      sanitized: narrative,
      wasModified: true,
      detectedIssues,
    };
  }
  
  if (isCleanNarrativeText(trimmed)) {
    return {
      original: rawOutput,
      sanitized: trimmed,
      wasModified: false,
      detectedIssues: [],
    };
  }
  
  if (trimmed.length < 20 && !trimmed.match(/[.!?]/)) {
    detectedIssues.push('Output muito curto ou sem pontuação');
  }
  
  if (/^```|```$/.test(trimmed)) {
    detectedIssues.push('Markdown code block detectado');
    const cleaned = trimmed.replace(/^```(\w+)?\n?|\n?```$/g, '').trim();
    
    if (containsRawJson(cleaned)) {
      return {
        original: rawOutput,
        sanitized: jsonToNarrative(cleaned, context),
        wasModified: true,
        detectedIssues,
      };
    }
    
    return {
      original: rawOutput,
      sanitized: cleaned,
      wasModified: true,
      detectedIssues,
    };
  }
  
  return {
    original: rawOutput,
    sanitized: trimmed,
    wasModified: detectedIssues.length > 0,
    detectedIssues,
  };
}

export function sanitizeContextForPrompt(contextText: string): string {
  if (!contextText) return '';
  
  let text = contextText;
  
  const multiLineJsonPattern = /\[\s*\{[\s\S]*?\}\s*\]/g;
  const multiLineMatches = text.match(multiLineJsonPattern);
  
  if (multiLineMatches) {
    for (const match of multiLineMatches) {
      const activities = extractActivitiesFromJson(match);
      if (activities.length > 0) {
        const count = activities.length;
        const tipos = activities.slice(0, 2).map(a => a.title).filter(Boolean).join(', ');
        const replacement = `[${count} atividades processadas: ${tipos || 'diversos tipos'}]`;
        text = text.replace(match, replacement);
      }
    }
  }
  
  const singleObjectPattern = /\{\s*"id"\s*:[\s\S]*?\}/g;
  const objectMatches = text.match(singleObjectPattern);
  
  if (objectMatches) {
    for (const match of objectMatches) {
      const activities = extractActivitiesFromJson(match);
      if (activities.length > 0 && activities[0].title) {
        const replacement = `[Atividade: ${activities[0].title}]`;
        text = text.replace(match, replacement);
      }
    }
  }
  
  const lines = text.split('\n');
  const sanitizedLines: string[] = [];
  
  for (const line of lines) {
    if (containsRawJson(line)) {
      const narrative = jsonToNarrative(line);
      if (narrative !== line && !narrative.includes('[{') && !narrative.includes('{"')) {
        sanitizedLines.push(`[Dados: ${narrative.substring(0, 150)}]`);
        continue;
      }
      
      const keyValueMatch = line.match(/"([a-z_]+)"\s*:\s*"([^"]{1,50})"/gi);
      if (keyValueMatch && keyValueMatch.length > 0) {
        const summary = keyValueMatch
          .slice(0, 2)
          .map(m => m.replace(/"/g, '').replace(':', ': '))
          .join(', ');
        sanitizedLines.push(`[Info: ${summary}]`);
        continue;
      }
      
      sanitizedLines.push('[Dados técnicos processados]');
      continue;
    }
    
    let cleanedLine = line
      .replace(/"[a-z_]+"\s*:\s*"[^"]*"/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    
    if (cleanedLine.match(/^\s*[\[\]{},:"]+\s*$/)) {
      continue;
    }
    
    if (cleanedLine.length > 0) {
      sanitizedLines.push(line);
    }
  }
  
  return sanitizedLines.join('\n');
}

export function validateReflectionOutput(reflection: string): {
  isValid: boolean;
  issues: string[];
  sanitized: string;
} {
  const issues: string[] = [];
  
  if (!reflection || typeof reflection !== 'string') {
    return {
      isValid: false,
      issues: ['Reflexão vazia ou inválida'],
      sanitized: '',
    };
  }
  
  const trimmed = reflection.trim();
  
  if (containsRawJson(trimmed)) {
    issues.push('Reflexão contém JSON bruto');
    return {
      isValid: false,
      issues,
      sanitized: jsonToNarrative(trimmed),
    };
  }
  
  if (trimmed.length < 15) {
    issues.push('Reflexão muito curta');
    return {
      isValid: false,
      issues,
      sanitized: trimmed,
    };
  }
  
  if (trimmed.length > 800) {
    issues.push('Reflexão muito longa, truncando');
    const truncated = trimmed.substring(0, 750) + '...';
    return {
      isValid: true,
      issues,
      sanitized: truncated,
    };
  }
  
  return {
    isValid: true,
    issues: [],
    sanitized: trimmed,
  };
}

export default {
  containsRawJson,
  isCleanNarrativeText,
  extractActivitiesFromJson,
  jsonToNarrative,
  generateGenericFallback,
  sanitizeAiOutput,
  sanitizeContextForPrompt,
  validateReflectionOutput,
};
