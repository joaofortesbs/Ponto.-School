import {
  BNCC_HABILIDADES,
  getBNCCHabilidades,
  type BNCCHabilidade,
} from '../../../prompts/bncc-reference';
import type {
  CapabilityInput,
  CapabilityOutput,
  DebugEntry,
} from '../../shared/types';
import { createDataConfirmation, createDataCheck } from '../../shared/types';

interface PesquisarBnccParams {
  componente?: string;
  ano_serie?: string;
  busca_texto?: string;
  codigo?: string;
  max_resultados?: number;
  disciplina_extraida?: string;
  turma_extraida?: string;
  tema_limpo?: string;
}

export async function pesquisarBnccV2(
  input: CapabilityInput
): Promise<CapabilityOutput> {
  const debug_log: DebugEntry[] = [];
  const startTime = Date.now();
  const params = (input.context || {}) as PesquisarBnccParams;

  if (!params.componente && params.disciplina_extraida) {
    params.componente = params.disciplina_extraida;
    console.log(`📚 [pesquisar_bncc] Usando disciplina_extraida como componente: "${params.componente}"`);
  }
  if (!params.ano_serie && params.turma_extraida) {
    params.ano_serie = params.turma_extraida;
    console.log(`📚 [pesquisar_bncc] Usando turma_extraida como ano_serie: "${params.ano_serie}"`);
  }
  if (!params.busca_texto && params.tema_limpo) {
    params.busca_texto = params.tema_limpo;
    console.log(`📚 [pesquisar_bncc] Usando tema_limpo como busca_texto: "${params.busca_texto}"`);
  }

  try {
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: '📚 ETAPA 1: Iniciando pesquisa na base BNCC completa (9 componentes, ~1.312 habilidades)...',
      technical_data: {
        componente: params.componente || 'todos',
        ano_serie: params.ano_serie || 'todos',
        busca_texto: params.busca_texto || 'nenhuma',
        codigo: params.codigo || 'nenhum',
        cobertura: Object.keys(BNCC_HABILIDADES),
      },
    });

    let resultados: Array<BNCCHabilidade & { componente: string; ano: string }> = [];

    if (params.codigo) {
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'action',
        narrative: `🔍 ETAPA 2: Buscando habilidade específica pelo código: ${params.codigo}`,
        technical_data: { modo: 'busca_por_codigo', codigo: params.codigo },
      });

      const codigoUpper = params.codigo.toUpperCase();
      for (const [compName, compData] of Object.entries(BNCC_HABILIDADES)) {
        for (const [ano, habilidades] of Object.entries(compData.habilidades)) {
          for (const hab of habilidades) {
            if (hab.codigo.toUpperCase() === codigoUpper) {
              resultados.push({ ...hab, componente: compName, ano });
            }
          }
        }
      }
    } else if (params.componente && params.ano_serie) {
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'action',
        narrative: `🔍 ETAPA 2: Buscando TODAS as habilidades de ${params.componente} para ${params.ano_serie}`,
        technical_data: { modo: 'busca_componente_ano', componente: params.componente, ano_serie: params.ano_serie },
      });

      const resolvedComp = findComponent(params.componente);
      if (resolvedComp) {
        const habs = getBNCCHabilidades(resolvedComp, params.ano_serie);
        resultados = habs.map(h => ({ ...h, componente: resolvedComp, ano: params.ano_serie! }));
      }
    } else if (params.componente) {
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'action',
        narrative: `🔍 ETAPA 2: Listando TODAS as habilidades de ${params.componente} para todos os anos`,
        technical_data: { modo: 'busca_componente', componente: params.componente },
      });

      const comp = findComponent(params.componente);
      if (comp) {
        for (const [ano, habs] of Object.entries(BNCC_HABILIDADES[comp].habilidades)) {
          for (const hab of habs) {
            resultados.push({ ...hab, componente: comp, ano });
          }
        }
      }
    } else if (params.ano_serie) {
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'action',
        narrative: `🔍 ETAPA 2: Listando habilidades de TODOS os componentes para ${params.ano_serie}`,
        technical_data: { modo: 'busca_ano', ano_serie: params.ano_serie },
      });

      for (const [compName, _compData] of Object.entries(BNCC_HABILIDADES)) {
        const habs = getBNCCHabilidades(compName, params.ano_serie);
        for (const hab of habs) {
          resultados.push({ ...hab, componente: compName, ano: params.ano_serie });
        }
      }
    } else {
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'action',
        narrative: '🔍 ETAPA 2: Nenhum filtro específico — listando TODAS as habilidades da base BNCC',
        technical_data: { modo: 'busca_geral' },
      });

      for (const [compName, compData] of Object.entries(BNCC_HABILIDADES)) {
        for (const [ano, habs] of Object.entries(compData.habilidades)) {
          for (const hab of habs) {
            resultados.push({ ...hab, componente: compName, ano });
          }
        }
      }
    }

    if (params.busca_texto && params.busca_texto.trim().length > 0) {
      const searchTerms = params.busca_texto.toLowerCase().split(/\s+/).filter(t => t.length > 2);
      const beforeFilter = resultados.length;

      resultados = resultados.filter(r => {
        const text = `${r.descricao} ${r.objetoConhecimento} ${r.codigo}`.toLowerCase();
        return searchTerms.some(term => text.includes(term));
      });

      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'action',
        narrative: `🔎 ETAPA 3: Filtro textual "${params.busca_texto}" aplicado: ${beforeFilter} → ${resultados.length} habilidades`,
        technical_data: {
          busca_texto: params.busca_texto,
          termos_busca: searchTerms,
          antes_filtro: beforeFilter,
          depois_filtro: resultados.length,
        },
      });

      if (resultados.length === 0 && searchTerms.length > 1) {
        debug_log.push({
          timestamp: new Date().toISOString(),
          type: 'action',
          narrative: `🔄 ETAPA 3b: Backtracking — relaxando filtro textual para busca individual por termo...`,
          technical_data: { modo: 'backtracking_individual_terms' },
        });

        const allCandidates = getAllResultsForScope(params);
        resultados = allCandidates.filter(r => {
          const text = `${r.descricao} ${r.objetoConhecimento} ${r.codigo}`.toLowerCase();
          return searchTerms.some(term => text.includes(term));
        });

        debug_log.push({
          timestamp: new Date().toISOString(),
          type: 'discovery',
          narrative: `🔄 Backtracking recuperou ${resultados.length} habilidade(s) usando termos individuais`,
          technical_data: { resultados_recuperados: resultados.length },
        });
      }
    }

    const componentesEncontrados = Array.from(new Set(resultados.map(r => r.componente)));
    const anosEncontrados = Array.from(new Set(resultados.map(r => r.ano)));

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'discovery',
      narrative: `📋 ETAPA 4: Encontradas ${resultados.length} habilidade(s) BNCC de ${componentesEncontrados.length} componente(s) curricular(es)`,
      technical_data: {
        total_encontrado: resultados.length,
        componentes: componentesEncontrados,
        anos: anosEncontrados,
        habilidades: resultados.map(r => ({
          codigo: r.codigo,
          componente: r.componente,
          ano: r.ano,
          objetoConhecimento: r.objetoConhecimento,
        })),
      },
    });

    const elapsedTime = Date.now() - startTime;

    const dataConfirmation = createDataConfirmation([
      createDataCheck('bncc_loaded', 'Base BNCC carregada', Object.keys(BNCC_HABILIDADES).length > 0, Object.keys(BNCC_HABILIDADES).length, '> 0 componentes'),
      createDataCheck('results_found', 'Habilidades encontradas', resultados.length > 0, resultados.length, '> 0'),
      createDataCheck('has_codes', 'Códigos BNCC válidos', resultados.every(r => r.codigo && r.codigo.length > 0), resultados.length, 'todos com código'),
    ]);

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'confirmation',
      narrative: `✅ ETAPA 5: Pesquisa BNCC concluída em ${elapsedTime}ms — ${resultados.length} habilidade(s) encontrada(s) (sem limites)`,
      technical_data: {
        duracao_ms: elapsedTime,
        total_resultados: resultados.length,
        resumo: dataConfirmation.summary,
      },
    });

    const formattedForPrompt = formatBnccResultsForPrompt(resultados);

    return {
      success: true,
      capability_id: 'pesquisar_bncc',
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: {
        habilidades: resultados,
        count: resultados.length,
        componentes: componentesEncontrados,
        anos: anosEncontrados,
        prompt_context: formattedForPrompt,
        summary: `Encontradas ${resultados.length} habilidade(s) BNCC${params.componente ? ` de ${params.componente}` : ''}${params.ano_serie ? ` para ${params.ano_serie}` : ''}`,
      },
      error: null,
      debug_log,
      data_confirmation: dataConfirmation,
      metadata: {
        duration_ms: elapsedTime,
        retry_count: 0,
        data_source: 'BNCC Reference Module - Cobertura Completa (9 componentes)',
      },
    };
  } catch (error) {
    const elapsedTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'error',
      narrative: `❌ ERRO: Falha na pesquisa BNCC — ${errorMessage}`,
      technical_data: {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        duration_ms: elapsedTime,
      },
    });

    console.error('❌ [Capability:PESQUISAR_BNCC] ERRO:', errorMessage);

    return {
      success: false,
      capability_id: 'pesquisar_bncc',
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: null,
      error: {
        code: 'BNCC_SEARCH_FAILED',
        message: errorMessage,
        severity: 'medium',
        recoverable: true,
        recovery_suggestion: 'Verifique os parâmetros de busca (componente, ano_serie) e tente novamente',
      },
      debug_log,
      metadata: {
        duration_ms: elapsedTime,
        retry_count: 0,
        data_source: 'BNCC Reference Module',
      },
    };
  }
}

function findComponent(input: string): string | null {
  const inputLower = input.toLowerCase().trim();

  const aliases: Record<string, string> = {
    'matematica': 'Matemática',
    'matemática': 'Matemática',
    'mat': 'Matemática',
    'lingua portuguesa': 'Língua Portuguesa',
    'língua portuguesa': 'Língua Portuguesa',
    'portugues': 'Língua Portuguesa',
    'português': 'Língua Portuguesa',
    'lp': 'Língua Portuguesa',
    'port': 'Língua Portuguesa',
    'ciencias': 'Ciências',
    'ciências': 'Ciências',
    'cie': 'Ciências',
    'historia': 'História',
    'história': 'História',
    'hist': 'História',
    'his': 'História',
    'geografia': 'Geografia',
    'geo': 'Geografia',
    'arte': 'Arte',
    'artes': 'Arte',
    'educacao fisica': 'Educação Física',
    'educação física': 'Educação Física',
    'ed fisica': 'Educação Física',
    'ed. física': 'Educação Física',
    'ed. fisica': 'Educação Física',
    'edfis': 'Educação Física',
    'ef': 'Educação Física',
    'ensino religioso': 'Ensino Religioso',
    'religiao': 'Ensino Religioso',
    'religião': 'Ensino Religioso',
    'er': 'Ensino Religioso',
    'lingua inglesa': 'Língua Inglesa',
    'língua inglesa': 'Língua Inglesa',
    'ingles': 'Língua Inglesa',
    'inglês': 'Língua Inglesa',
    'english': 'Língua Inglesa',
    'li': 'Língua Inglesa',
  };

  if (aliases[inputLower]) return aliases[inputLower];

  for (const compName of Object.keys(BNCC_HABILIDADES)) {
    if (compName.toLowerCase().includes(inputLower)) return compName;
  }

  return null;
}

function getAllResultsForScope(params: PesquisarBnccParams): Array<BNCCHabilidade & { componente: string; ano: string }> {
  const results: Array<BNCCHabilidade & { componente: string; ano: string }> = [];

  if (params.componente) {
    const comp = findComponent(params.componente);
    if (comp && BNCC_HABILIDADES[comp]) {
      for (const [ano, habs] of Object.entries(BNCC_HABILIDADES[comp].habilidades)) {
        for (const hab of habs) {
          results.push({ ...hab, componente: comp, ano });
        }
      }
    }
  } else {
    for (const [compName, compData] of Object.entries(BNCC_HABILIDADES)) {
      for (const [ano, habs] of Object.entries(compData.habilidades)) {
        for (const hab of habs) {
          results.push({ ...hab, componente: compName, ano });
        }
      }
    }
  }

  return results;
}

function formatBnccResultsForPrompt(
  resultados: Array<BNCCHabilidade & { componente: string; ano: string }>
): string {
  if (resultados.length === 0) {
    return 'Nenhuma habilidade BNCC encontrada para os filtros especificados.';
  }

  const grouped = new Map<string, typeof resultados>();
  for (const r of resultados) {
    const key = `${r.componente} — ${r.ano}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(r);
  }

  const parts: string[] = ['HABILIDADES BNCC ENCONTRADAS:'];
  for (const [group, habs] of Array.from(grouped)) {
    parts.push(`\n📘 ${group}:`);
    for (const h of habs) {
      parts.push(`  - ${h.codigo}: ${h.descricao}`);
      parts.push(`    Objeto de conhecimento: ${h.objetoConhecimento}`);
    }
  }

  return parts.join('\n');
}
