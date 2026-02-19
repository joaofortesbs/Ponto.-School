/**
 * CAPABILITIES - Registro Global de Funcionalidades
 * 
 * Centraliza todas as capabilities disponíveis para o Agente Jota
 * School Power 2.0
 */

import { PLANEJAR_CAPABILITIES } from './PLANEJAR/registry';
import { PESQUISAR_CAPABILITIES } from './PESQUISAR/registry';
import { DECIDIR_CAPABILITIES } from './DECIDIR/registry';
import { GERAR_CONTEUDO_CAPABILITIES } from './GERAR_CONTEUDO/registry';
import { CRIAR_ATIVIDADES_CAPABILITIES } from './CRIAR_ATIVIDADES/registry';
import { CRIAR_ARQUIVO_CAPABILITIES } from './CRIAR_ARQUIVO/registry';
import { SALVAR_BD_CAPABILITIES } from './SALVAR_BD/registry';
import { criarCompromissoCalendario } from './CRIAR/criar-compromisso-calendario';

import type { Capability } from '../prompts/planning-prompt';

export interface CapabilityConfig {
  name: string;
  funcao: string;
  displayName: string;
  categoria: string;
  description: string;
  descricao: string;
  parameters: Record<string, {
    type: string;
    required: boolean;
    description?: string;
    default?: any;
  }>;
  execute: (params: Record<string, any>, onProgress?: (update: any) => void) => Promise<any>;
  schema?: any;
  requiresPreviousCapability?: string;
  isSequential?: boolean;
  showProgress?: boolean;
  renderComponent?: string;
  streamProgress?: boolean;
  canCallAnytime?: boolean;
  requiresUserApproval?: boolean;
  prepareForNext?: string;
  cacheResults?: boolean;
  cacheTTL?: number;
}

const CALENDARIO_CAPABILITIES: Record<string, CapabilityConfig> = {
  criar_compromisso_calendario: {
    name: 'criar_compromisso_calendario',
    funcao: 'criar_compromisso_calendario',
    displayName: 'Criar Compromisso no Calendário',
    categoria: 'CRIAR',
    description: 'Cria um compromisso/evento/aula no calendário do professor diretamente do chat, sem interação manual.',
    descricao: 'Cria compromissos no calendário do professor diretamente do chat. Perfeito para organizar aulas, reuniões, provas e eventos.',
    parameters: {
      titulo: { type: 'string', required: true, description: 'Título do compromisso' },
      data: { type: 'string', required: true, description: 'Data no formato YYYY-MM-DD' },
      hora_inicio: { type: 'string', required: false, description: 'Hora início HH:MM' },
      hora_fim: { type: 'string', required: false, description: 'Hora fim HH:MM' },
      dia_todo: { type: 'boolean', required: false, description: 'Se é dia todo', default: false },
      repeticao: { type: 'string', required: false, description: 'none/daily/weekly/monthly/yearly', default: 'none' },
      icone: { type: 'string', required: false, description: 'pencil/check/camera/star' },
      labels: { type: 'array', required: false, description: 'Etiquetas' },
      professor_id: { type: 'string', required: true, description: 'ID UUID do professor' },
    },
    canCallAnytime: true,
    execute: criarCompromissoCalendario,
  },
};

export const CAPABILITIES = {
  PLANEJAR: PLANEJAR_CAPABILITIES,
  PESQUISAR: PESQUISAR_CAPABILITIES,
  DECIDIR: DECIDIR_CAPABILITIES,
  GERAR_CONTEUDO: GERAR_CONTEUDO_CAPABILITIES,
  CRIAR: { ...CRIAR_ATIVIDADES_CAPABILITIES, ...CRIAR_ARQUIVO_CAPABILITIES, ...CALENDARIO_CAPABILITIES },
  SALVAR: SALVAR_BD_CAPABILITIES,
};

export const CRIAR_CAPABILITIES = CRIAR_ATIVIDADES_CAPABILITIES;
export const CRIAR_ARQUIVO = CRIAR_ARQUIVO_CAPABILITIES;
export const ANALISAR_CAPABILITIES = {};

export function getAllCapabilities(): Capability[] {
  const allCapabilities: Capability[] = [];

  for (const [_categoria, funcoes] of Object.entries(CAPABILITIES)) {
    for (const [nome, config] of Object.entries(funcoes)) {
      const typedConfig = config as CapabilityConfig;
      allCapabilities.push({
        name: nome,
        description: typedConfig.description || typedConfig.descricao,
        parameters: typedConfig.parameters,
      });
    }
  }

  return allCapabilities;
}

export function findCapability(functionName: string): CapabilityConfig | null {
  for (const [_categoria, funcoes] of Object.entries(CAPABILITIES)) {
    const typedFuncoes = funcoes as Record<string, CapabilityConfig>;
    if (typedFuncoes[functionName]) {
      return typedFuncoes[functionName];
    }
  }
  return null;
}

export async function executeCapability(
  functionName: string,
  params: Record<string, any>,
  onProgress?: (update: any) => void
): Promise<any> {
  const capability = findCapability(functionName);

  if (!capability) {
    console.warn(`⚠️ [Capabilities] Função não encontrada: ${functionName}`);
    return {
      success: false,
      error: `Função ${functionName} não encontrada`,
    };
  }

  console.log(`▶️ [Capabilities] Executando: ${functionName}`, params);

  try {
    const result = await capability.execute(params, onProgress);
    console.log(`✅ [Capabilities] ${functionName} executado com sucesso`);
    return result;
  } catch (error) {
    console.error(`❌ [Capabilities] Erro em ${functionName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function formatCapabilitiesForLLM(): string {
  const capabilities = getAllCapabilities();

  return capabilities.map(cap => {
    const params = Object.entries(cap.parameters)
      .map(([key, val]) => `    ${key}: ${val.type}${val.required ? ' (obrigatório)' : ' (opcional)'}`)
      .join('\n');

    return `${cap.name}:
  ${cap.description}
  Parâmetros:
${params || '    Nenhum'}`;
  }).join('\n\n');
}

export function getCapabilityDisplayName(functionName: string): string {
  const capability = findCapability(functionName);
  return capability?.displayName || functionName;
}

export function getCapabilityCategory(functionName: string): string {
  const capability = findCapability(functionName);
  return capability?.categoria || 'GERAL';
}

export default CAPABILITIES;
