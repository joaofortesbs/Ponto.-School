/**
 * BNCC REFERENCE MODULE - Referência de Habilidades da BNCC
 * 
 * Módulo centralizado com habilidades REAIS da Base Nacional Comum Curricular (BNCC)
 * organizadas por componente curricular e ano/série.
 * 
 * Cobertura COMPLETA: 9 componentes curriculares do Ensino Fundamental (1º-9º ano)
 * - Matemática, Língua Portuguesa, Ciências, História, Geografia,
 *   Arte, Educação Física, Ensino Religioso, Língua Inglesa
 * ~1.312 habilidades únicas (~2.000+ entradas com duplicação por ano)
 * 
 * Fonte: Base Nacional Comum Curricular (MEC, 2018)
 * http://basenacionalcomum.mec.gov.br/
 */

import {
  BNCC_COMPONENTES,
  getTotalHabilidades,
  getComponentesList,
  getAnosDisponiveis as getAnosFromIndex,
  type BNCCHabilidade,
  type BNCCComponente,
} from './bncc-data/index';

export type { BNCCHabilidade, BNCCComponente };

export const BNCC_HABILIDADES: Record<string, BNCCComponente> = BNCC_COMPONENTES;

export function getBNCCHabilidades(
  componente: string,
  anoSerie: string,
  maxHabilidades?: number
): BNCCHabilidade[] {
  const comp = BNCC_HABILIDADES[componente];
  if (!comp) return [];

  const normalizedAno = normalizeAnoSerie(anoSerie);
  let habilidades = comp.habilidades[normalizedAno];

  if (!habilidades) {
    const closestYear = findClosestYear(Object.keys(comp.habilidades), normalizedAno);
    if (closestYear) {
      habilidades = comp.habilidades[closestYear];
    }
    if (!habilidades) return [];
  }

  return habilidades;
}

export function formatBNCCForPrompt(
  componente: string,
  anoSerie: string
): string {
  const habilidades = getBNCCHabilidades(componente, anoSerie);
  
  if (habilidades.length === 0) {
    return `Alinhe com as habilidades da BNCC para ${componente} no ${anoSerie}`;
  }

  const formatted = habilidades.map(h => 
    `- ${h.codigo}: ${h.descricao} (${h.objetoConhecimento})`
  ).join('\n');

  return `HABILIDADES BNCC para ${componente} - ${anoSerie} (${habilidades.length} habilidades):\n${formatted}`;
}

function normalizeAnoSerie(anoSerie: string): string {
  const match = anoSerie.match(/(\d+)[ºªo°]?\s*(ano|serie|série)?/i);
  if (match) {
    return `${match[1]}º Ano`;
  }
  
  if (anoSerie.toLowerCase().includes('médio') || anoSerie.toLowerCase().includes('medio')) {
    return '9º Ano';
  }
  
  return anoSerie;
}

function findClosestYear(availableYears: string[], target: string): string | null {
  const targetNum = parseInt(target);
  if (isNaN(targetNum)) return availableYears[0] || null;

  let closest: string | null = null;
  let minDiff = Infinity;

  for (const year of availableYears) {
    const yearNum = parseInt(year);
    if (!isNaN(yearNum)) {
      const diff = Math.abs(yearNum - targetNum);
      if (diff < minDiff) {
        minDiff = diff;
        closest = year;
      }
    }
  }

  return closest;
}

export function getAllComponentes(): string[] {
  return getComponentesList();
}

export function getAnosDisponiveis(componente: string): string[] {
  return getAnosFromIndex(componente);
}

export function getBNCCStats(): { componentes: number; totalHabilidades: number; cobertura: string[] } {
  return {
    componentes: Object.keys(BNCC_HABILIDADES).length,
    totalHabilidades: getTotalHabilidades(),
    cobertura: getComponentesList(),
  };
}
