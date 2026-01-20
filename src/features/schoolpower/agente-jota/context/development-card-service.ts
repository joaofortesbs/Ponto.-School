/**
 * DEVELOPMENT CARD SERVICE - Chamada 2: Card de Desenvolvimento
 * 
 * Janela de contexto ÚNICA para todas as reflexões do card de desenvolvimento.
 * Mantém contexto acumulativo de todas as etapas para coerência narrativa.
 * 
 * Responsabilidades:
 * - Gerar reflexões após cada etapa/objetivo completado
 * - Manter histórico de todas as ações executadas
 * - Criar narrativa coerente ao longo de toda a execução
 */

import { executeWithCascadeFallback } from '../../services/controle-APIs-gerais-school-power';
import { getContextManager, type ResultadoEtapa, type ResultadoCapability } from './context-manager';

const DEVELOPMENT_REFLECTION_PROMPT = `
Você é o Jota, assistente de IA do Ponto School.

CONTEXTO COMPLETO DA CONVERSA:
{context}

ETAPA ATUAL COMPLETADA:
Etapa {step_index}: {step_title}
Capabilities executadas:
{capabilities_summary}

Resultados obtidos:
{results_summary}

SUA TAREFA:
Gere uma REFLEXÃO NARRATIVA curta (2-3 frases) explicando o que você fez e descobriu NESTA ETAPA.

REGRAS IMPORTANTES:
1. Use primeira pessoa ("Eu fiz...", "Encontrei...", "Decidi...")
2. Mencione NÚMEROS e DADOS ESPECÍFICOS quando disponíveis
3. Conecte com o pedido ORIGINAL do usuário
4. Explique brevemente a DECISÃO tomada e o POR QUÊ
5. Tom conversacional e amigável
6. Máximo 3 frases curtas
7. NÃO repita informações das reflexões anteriores
8. Se houver etapas anteriores, faça referência ao progresso

EXEMPLOS BOM:
- "Analisei 47 atividades disponíveis e identifiquei que a turma 7B tem gap em Álgebra. Decidi criar 3 atividades focadas em equações para preencher essa lacuna."
- "Encontrei 12 tipos de atividades compatíveis com seu objetivo. Priorizei Flash Cards e Quiz Gamificado por serem mais engajantes para essa faixa etária."
- "Já defini as atividades, agora estou personalizando o conteúdo. Incluí 15 questões variadas sobre o tema que você pediu."

RETORNE APENAS A REFLEXÃO, sem formatação extra.
`.trim();

export interface DevelopmentReflectionResult {
  reflexao: string;
  etapaIndex: number;
  sucesso: boolean;
  erro?: string;
}

export async function generateDevelopmentReflection(
  sessionId: string,
  etapaIndex: number,
  titulo: string,
  capabilities: ResultadoCapability[]
): Promise<DevelopmentReflectionResult> {
  console.log(`💭 [DevelopmentCard] Gerando reflexão para etapa ${etapaIndex}: ${titulo}`);

  const contextManager = getContextManager(sessionId);
  const contexto = contextManager.obterContexto();

  if (!contexto) {
    console.error(`❌ [DevelopmentCard] Contexto não encontrado para sessão: ${sessionId}`);
    return {
      reflexao: `Concluí a etapa "${titulo}" com sucesso. Seguindo para a próxima!`,
      etapaIndex,
      sucesso: false,
      erro: 'Contexto não encontrado',
    };
  }

  const resultadoEtapa: ResultadoEtapa = {
    etapaIndex,
    titulo,
    descricao: titulo,
    capabilities,
    timestamp: Date.now(),
    sucesso: capabilities.every(c => c.sucesso),
  };
  contextManager.salvarResultadoEtapa(resultadoEtapa);

  const contextText = contextManager.gerarContextoParaChamada('desenvolvimento');
  
  const capabilitiesSummary = capabilities
    .map(c => `- ${c.displayName}: ${c.sucesso ? 'Sucesso' : 'Erro'}`)
    .join('\n');

  const resultsSummary = capabilities
    .flatMap(c => {
      const items: string[] = [];
      if (c.descobertas) {
        items.push(...c.descobertas.map(d => `Descoberta: ${d}`));
      }
      if (c.decisoes) {
        items.push(...c.decisoes.map(d => `Decisão: ${d}`));
      }
      if (c.metricas) {
        items.push(...Object.entries(c.metricas).map(([k, v]) => `${k}: ${v}`));
      }
      if (c.dados) {
        const dadosStr = formatDadosForPrompt(c.dados);
        if (dadosStr) {
          items.push(`Dados: ${dadosStr}`);
        }
      }
      return items;
    })
    .join('\n') || 'Nenhum dado específico coletado';

  const prompt = DEVELOPMENT_REFLECTION_PROMPT
    .replace('{context}', contextText)
    .replace('{step_index}', String(etapaIndex))
    .replace('{step_title}', titulo)
    .replace('{capabilities_summary}', capabilitiesSummary)
    .replace('{results_summary}', resultsSummary);

  try {
    const result = await executeWithCascadeFallback(prompt, {
      onProgress: (status) => console.log(`📝 [DevelopmentCard] ${status}`),
    });

    let reflexao = `Concluí "${titulo}" com sucesso. Todas as ações necessárias foram realizadas.`;

    if (result.success && result.data) {
      reflexao = result.data.trim();
    }

    contextManager.salvarReflexaoEtapa(etapaIndex, reflexao);

    console.log(`✅ [DevelopmentCard] Reflexão gerada: "${reflexao.substring(0, 100)}..."`);

    return {
      reflexao,
      etapaIndex,
      sucesso: true,
    };
  } catch (error) {
    console.error('❌ [DevelopmentCard] Erro ao gerar reflexão:', error);
    
    const fallbackReflexao = `Concluí a etapa "${titulo}". Seguindo para a próxima fase do processo.`;
    contextManager.salvarReflexaoEtapa(etapaIndex, fallbackReflexao);

    return {
      reflexao: fallbackReflexao,
      etapaIndex,
      sucesso: false,
      erro: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

export function convertCapabilityInsightToResultado(
  insight: {
    capabilityName: string;
    displayName: string;
    categoria: string;
    discovered?: string[];
    decided?: string[];
    learned?: string[];
    metrics?: Record<string, number | string>;
    duration?: number;
    success: boolean;
  },
  rawData?: any
): ResultadoCapability {
  const resultado: ResultadoCapability = {
    capabilityName: insight.capabilityName,
    displayName: insight.displayName,
    categoria: insight.categoria,
    sucesso: insight.success,
    descobertas: insight.discovered,
    decisoes: insight.decided,
    metricas: insight.metrics,
    duracao: insight.duration,
  };

  if (rawData) {
    resultado.dados = extractRelevantData(rawData);
  }

  return resultado;
}

function extractRelevantData(rawData: any): any {
  if (!rawData) return undefined;
  
  const relevantFields = [
    'atividades_disponiveis',
    'atividades_selecionadas',
    'tipos_atividade',
    'quantidade',
    'total',
    'campos_gerados',
    'conteudo',
    'resultado',
    'message',
    'summary',
  ];

  const extracted: Record<string, any> = {};
  
  if (rawData.data && typeof rawData.data === 'object') {
    for (const field of relevantFields) {
      if (rawData.data[field] !== undefined) {
        extracted[field] = summarizeField(rawData.data[field]);
      }
    }
  }
  
  for (const field of relevantFields) {
    if (rawData[field] !== undefined && !extracted[field]) {
      extracted[field] = summarizeField(rawData[field]);
    }
  }

  return Object.keys(extracted).length > 0 ? extracted : undefined;
}

function summarizeField(value: any): any {
  if (Array.isArray(value)) {
    if (value.length > 5) {
      return {
        total: value.length,
        primeiros: value.slice(0, 3),
        resumo: `${value.length} itens`,
      };
    }
    return value;
  }
  
  if (typeof value === 'string' && value.length > 500) {
    return value.substring(0, 500) + '...';
  }
  
  return value;
}

function formatDadosForPrompt(dados: any): string {
  if (!dados) return '';
  
  const parts: string[] = [];
  
  if (dados.total !== undefined) {
    parts.push(`Total: ${dados.total}`);
  }
  if (dados.quantidade !== undefined) {
    parts.push(`Quantidade: ${dados.quantidade}`);
  }
  if (dados.atividades_selecionadas) {
    const count = Array.isArray(dados.atividades_selecionadas) 
      ? dados.atividades_selecionadas.length 
      : dados.atividades_selecionadas.total || 0;
    parts.push(`Atividades selecionadas: ${count}`);
  }
  if (dados.tipos_atividade) {
    const tipos = Array.isArray(dados.tipos_atividade) 
      ? dados.tipos_atividade.slice(0, 3).join(', ')
      : String(dados.tipos_atividade);
    parts.push(`Tipos: ${tipos}`);
  }
  if (dados.campos_gerados) {
    const campos = typeof dados.campos_gerados === 'object'
      ? Object.keys(dados.campos_gerados).slice(0, 5).join(', ')
      : String(dados.campos_gerados);
    parts.push(`Campos gerados: ${campos}`);
  }
  if (dados.resumo) {
    parts.push(String(dados.resumo));
  }
  
  return parts.join('; ');
}

export function registerActivityCreated(
  sessionId: string,
  activityName: string,
  activityType: string
): void {
  const contextManager = getContextManager(sessionId);
  contextManager.registrarAtividadeCriada(activityName, activityType);
}
