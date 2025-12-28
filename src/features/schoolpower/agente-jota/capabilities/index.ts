/**
 * CAPABILITIES - Registro Global de Funcionalidades
 * 
 * Centraliza todas as capabilities disponíveis para o Agente Jota
 */

import { CRIAR_CAPABILITIES } from './CRIAR';
import { PESQUISAR_CAPABILITIES } from './PESQUISAR';
import { ANALISAR_CAPABILITIES } from './ANALISAR';
import type { Capability } from '../prompts/planning-prompt';

export interface CapabilityConfig {
  name: string;
  description: string;
  parameters: Record<string, {
    type: string;
    required: boolean;
    description?: string;
    default?: any;
  }>;
  execute: (params: Record<string, any>) => Promise<any>;
}

export const CAPABILITIES = {
  CRIAR: CRIAR_CAPABILITIES,
  PESQUISAR: PESQUISAR_CAPABILITIES,
  ANALISAR: ANALISAR_CAPABILITIES,
};

export function getAllCapabilities(): Capability[] {
  const allCapabilities: Capability[] = [];

  for (const [_categoria, funcoes] of Object.entries(CAPABILITIES)) {
    for (const [nome, config] of Object.entries(funcoes)) {
      allCapabilities.push({
        name: nome,
        description: config.description,
        parameters: config.parameters,
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
  params: Record<string, any>
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
    const result = await capability.execute(params);
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

export default CAPABILITIES;
