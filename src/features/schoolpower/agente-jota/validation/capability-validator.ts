/**
 * CAPABILITY VALIDATOR
 * 
 * Sistema anti-alucinação para capabilities.
 * Garante que a IA não crie/acione capabilities inexistentes.
 * 
 * Funções:
 * - validateCapabilityName: Valida se o nome é exatamente válido
 * - normalizeCapabilityName: Tenta corrigir nomes similares
 * - getValidCapabilityNames: Retorna lista de nomes válidos
 * - buildCapabilityWhitelist: Gera prompt com whitelist para LLM
 */

import { CAPABILITIES, findCapability, CapabilityConfig } from '../capabilities';

export interface CapabilityValidation {
  valid: boolean;
  originalName: string;
  normalizedName: string | null;
  suggestion: string | null;
  errorMessage: string | null;
}

export interface CapabilityWhitelist {
  names: string[];
  byCategory: Record<string, string[]>;
  displayNames: Record<string, string>;
  prompt: string;
}

const CAPABILITY_ALIASES: Record<string, string> = {
  'pesquisar_tipos_atividades': 'pesquisar_atividades_disponiveis',
  'buscar_atividades': 'pesquisar_atividades_disponiveis',
  'pesquisar_catalogo': 'pesquisar_atividades_disponiveis',
  'consultar_atividades': 'pesquisar_atividades_disponiveis',
  
  'pesquisar_minhas_atividades': 'pesquisar_atividades_conta',
  'buscar_atividades_anteriores': 'pesquisar_atividades_conta',
  'minhas_atividades': 'pesquisar_atividades_conta',
  
  'decidir_atividades': 'decidir_atividades_criar',
  'escolher_atividades': 'decidir_atividades_criar',
  'selecionar_atividades': 'decidir_atividades_criar',
  
  'gerar_conteudo': 'gerar_conteudo_atividades',
  'gerar_conteudos': 'gerar_conteudo_atividades',
  'preencher_campos': 'gerar_conteudo_atividades',
  'gerar_campos_atividades': 'gerar_conteudo_atividades',
  
  'criar': 'criar_atividade',
  'gerar_atividade': 'criar_atividade',
  'nova_atividade': 'criar_atividade',
  'criar_atividades': 'criar_atividade',
  'construir_atividade': 'criar_atividade',
  'construir_atividades': 'criar_atividade',
  
  'salvar_atividades': 'salvar_atividades_bd',
  'salvar_banco': 'salvar_atividades_bd',
  'persistir_atividades': 'salvar_atividades_bd',
  'gravar_atividades': 'salvar_atividades_bd',
};

export function getValidCapabilityNames(): string[] {
  const names: string[] = [];
  
  for (const [_categoria, funcoes] of Object.entries(CAPABILITIES)) {
    const typedFuncoes = funcoes as Record<string, CapabilityConfig>;
    for (const nome of Object.keys(typedFuncoes)) {
      names.push(nome);
    }
  }
  
  return names;
}

export function getCapabilityWhitelist(): CapabilityWhitelist {
  const names: string[] = [];
  const byCategory: Record<string, string[]> = {};
  const displayNames: Record<string, string> = {};
  
  for (const [categoria, funcoes] of Object.entries(CAPABILITIES)) {
    const typedFuncoes = funcoes as Record<string, CapabilityConfig>;
    byCategory[categoria] = [];
    
    for (const [nome, config] of Object.entries(typedFuncoes)) {
      names.push(nome);
      byCategory[categoria].push(nome);
      displayNames[nome] = config.displayName;
    }
  }
  
  const prompt = buildCapabilityWhitelistPrompt(names, byCategory, displayNames);
  
  return { names, byCategory, displayNames, prompt };
}

function buildCapabilityWhitelistPrompt(
  names: string[],
  byCategory: Record<string, string[]>,
  displayNames: Record<string, string>
): string {
  let prompt = `
═══════════════════════════════════════════════════════════════════════════
⚠️ WHITELIST DE CAPABILITIES - ATENÇÃO: USE APENAS OS NOMES ABAIXO ⚠️
═══════════════════════════════════════════════════════════════════════════

NOMES VÁLIDOS (copie exatamente como estão):
`;

  for (const [categoria, funcNames] of Object.entries(byCategory)) {
    prompt += `\n📂 ${categoria}:\n`;
    for (const funcName of funcNames) {
      prompt += `   - "${funcName}" → ${displayNames[funcName]}\n`;
    }
  }

  prompt += `
═══════════════════════════════════════════════════════════════════════════
🚫 REGRAS OBRIGATÓRIAS:
═══════════════════════════════════════════════════════════════════════════

1. ❌ NÃO INVENTE nomes de capabilities
2. ❌ NÃO USE variações como "pesquisar_tipos_atividades" (inválido!)
3. ❌ NÃO USE nomes em inglês (ex: "search_activities")
4. ✅ COPIE exatamente o nome da lista acima
5. ✅ Use apenas: ${names.join(', ')}

Se precisar de uma funcionalidade não listada, NÃO CRIE uma capability falsa.
Informe ao usuário que a funcionalidade não está disponível.
═══════════════════════════════════════════════════════════════════════════
`;

  return prompt.trim();
}

export function validateCapabilityName(name: string): CapabilityValidation {
  const validNames = getValidCapabilityNames();
  
  if (validNames.includes(name)) {
    return {
      valid: true,
      originalName: name,
      normalizedName: name,
      suggestion: null,
      errorMessage: null
    };
  }
  
  if (CAPABILITY_ALIASES[name]) {
    const normalized = CAPABILITY_ALIASES[name];
    return {
      valid: true,
      originalName: name,
      normalizedName: normalized,
      suggestion: `Corrigido "${name}" para "${normalized}"`,
      errorMessage: null
    };
  }
  
  const closestMatch = findClosestCapability(name, validNames);
  
  return {
    valid: false,
    originalName: name,
    normalizedName: null,
    suggestion: closestMatch ? `Você quis dizer "${closestMatch}"?` : null,
    errorMessage: `Capability "${name}" não existe. Válidas: ${validNames.join(', ')}`
  };
}

export function normalizeCapabilityName(name: string): string | null {
  const validation = validateCapabilityName(name);
  return validation.normalizedName;
}

function findClosestCapability(name: string, validNames: string[]): string | null {
  const nameLower = name.toLowerCase().replace(/[-_]/g, '');
  
  let bestMatch: string | null = null;
  let bestScore = 0;
  
  for (const validName of validNames) {
    const validLower = validName.toLowerCase().replace(/[-_]/g, '');
    
    const score = similarityScore(nameLower, validLower);
    
    if (score > bestScore && score > 0.4) {
      bestScore = score;
      bestMatch = validName;
    }
  }
  
  return bestMatch;
}

function similarityScore(a: string, b: string): number {
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

export function validatePlanCapabilities(plan: any): {
  valid: boolean;
  errors: string[];
  correctedPlan: any;
} {
  const errors: string[] = [];
  const correctedPlan = JSON.parse(JSON.stringify(plan));
  const whitelist = getCapabilityWhitelist();
  
  if (!correctedPlan.etapas || !Array.isArray(correctedPlan.etapas)) {
    return { valid: false, errors: ['Plano não contém etapas válidas'], correctedPlan };
  }
  
  for (let i = 0; i < correctedPlan.etapas.length; i++) {
    const etapa = correctedPlan.etapas[i];
    
    if (!etapa.capabilities || !Array.isArray(etapa.capabilities)) {
      continue;
    }
    
    // Filtrar capabilities inválidas e corrigir as válidas
    const validCapabilities: any[] = [];
    
    for (let j = 0; j < etapa.capabilities.length; j++) {
      const cap = etapa.capabilities[j];
      const validation = validateCapabilityName(cap.nome);
      
      if (!validation.valid && !validation.normalizedName) {
        // Tentar encontrar a capability mais próxima
        const closestMatch = findClosestCapabilityPublic(cap.nome);
        
        if (closestMatch) {
          console.warn(`⚠️ [CapabilityValidator] Corrigindo "${cap.nome}" → "${closestMatch}"`);
          cap.nome = closestMatch;
        } else {
          errors.push(`Etapa ${i + 1}, Capability ${j + 1}: "${cap.nome}" não existe e será removida`);
          console.error(`❌ [CapabilityValidator] Removendo capability inválida: "${cap.nome}"`);
          continue; // Não adiciona à lista de válidas
        }
      } else if (validation.normalizedName && validation.normalizedName !== cap.nome) {
        console.log(`🔄 [CapabilityValidator] Normalizando "${cap.nome}" → "${validation.normalizedName}"`);
        cap.nome = validation.normalizedName;
      }
      
      // Sobrescrever displayName e categoria com valores canônicos do registro
      const canonicalName = cap.nome;
      if (whitelist.displayNames[canonicalName]) {
        console.log(`📝 [CapabilityValidator] Sobrescrevendo displayName: "${cap.displayName}" → "${whitelist.displayNames[canonicalName]}"`);
        cap.displayName = whitelist.displayNames[canonicalName];
      }
      
      // Determinar categoria canônica baseada no nome
      const canonicalCategory = getCanonicalCategory(canonicalName);
      if (canonicalCategory && cap.categoria !== canonicalCategory) {
        console.log(`📝 [CapabilityValidator] Sobrescrevendo categoria: "${cap.categoria}" → "${canonicalCategory}"`);
        cap.categoria = canonicalCategory;
      }
      
      validCapabilities.push(cap);
    }
    
    // Atualizar etapa apenas com capabilities válidas
    correctedPlan.etapas[i].capabilities = validCapabilities;
  }
  
  // Remover etapas sem capabilities
  correctedPlan.etapas = correctedPlan.etapas.filter((etapa: any) => 
    etapa.capabilities && etapa.capabilities.length > 0
  );
  
  return {
    valid: errors.length === 0,
    errors,
    correctedPlan
  };
}

function findClosestCapabilityPublic(name: string): string | null {
  const validNames = getValidCapabilityNames();
  return findClosestCapability(name, validNames);
}

function getCanonicalCategory(capabilityName: string): string | null {
  const categoryMap: Record<string, string> = {
    'pesquisar_atividades_disponiveis': 'PESQUISAR',
    'pesquisar_atividades_conta': 'PESQUISAR',
    'decidir_atividades_criar': 'ANALISAR',
    'gerar_conteudo_atividades': 'GERAR_CONTEUDO',
    'criar_atividade': 'CRIAR',
    'salvar_atividades_bd': 'SALVAR_BD',
    'planejar_plano_de_acao': 'PLANEJAR'
  };
  return categoryMap[capabilityName] || null;
}

export default {
  validateCapabilityName,
  normalizeCapabilityName,
  getValidCapabilityNames,
  getCapabilityWhitelist,
  validatePlanCapabilities
};
