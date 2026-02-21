import { MATEMATICA_HABILIDADES } from './matematica';
import { CIENCIAS_HABILIDADES } from './ciencias';
import { HISTORIA_HABILIDADES } from './historia';
import { GEOGRAFIA_HABILIDADES } from './geografia';
import { LINGUA_PORTUGUESA_HABILIDADES } from './lingua-portuguesa';
import { ARTE_HABILIDADES } from './arte';
import { EDUCACAO_FISICA_HABILIDADES } from './educacao-fisica';
import { ENSINO_RELIGIOSO_HABILIDADES } from './ensino-religioso';
import { LINGUA_INGLESA_HABILIDADES } from './lingua-inglesa';

export interface BNCCHabilidade {
  codigo: string;
  descricao: string;
  objetoConhecimento: string;
}

export interface BNCCComponente {
  nome: string;
  habilidades: Record<string, BNCCHabilidade[]>;
}

export const BNCC_COMPONENTES: Record<string, BNCCComponente> = {
  'Matemática': {
    nome: 'Matemática',
    habilidades: MATEMATICA_HABILIDADES,
  },
  'Língua Portuguesa': {
    nome: 'Língua Portuguesa',
    habilidades: LINGUA_PORTUGUESA_HABILIDADES,
  },
  'Ciências': {
    nome: 'Ciências',
    habilidades: CIENCIAS_HABILIDADES,
  },
  'História': {
    nome: 'História',
    habilidades: HISTORIA_HABILIDADES,
  },
  'Geografia': {
    nome: 'Geografia',
    habilidades: GEOGRAFIA_HABILIDADES,
  },
  'Arte': {
    nome: 'Arte',
    habilidades: ARTE_HABILIDADES,
  },
  'Educação Física': {
    nome: 'Educação Física',
    habilidades: EDUCACAO_FISICA_HABILIDADES,
  },
  'Ensino Religioso': {
    nome: 'Ensino Religioso',
    habilidades: ENSINO_RELIGIOSO_HABILIDADES,
  },
  'Língua Inglesa': {
    nome: 'Língua Inglesa',
    habilidades: LINGUA_INGLESA_HABILIDADES,
  },
};

export function getTotalHabilidades(): number {
  let total = 0;
  for (const comp of Object.values(BNCC_COMPONENTES)) {
    for (const habs of Object.values(comp.habilidades)) {
      total += habs.length;
    }
  }
  return total;
}

export function getComponentesList(): string[] {
  return Object.keys(BNCC_COMPONENTES);
}

export function getAnosDisponiveis(componente: string): string[] {
  const comp = BNCC_COMPONENTES[componente];
  return comp ? Object.keys(comp.habilidades) : [];
}
