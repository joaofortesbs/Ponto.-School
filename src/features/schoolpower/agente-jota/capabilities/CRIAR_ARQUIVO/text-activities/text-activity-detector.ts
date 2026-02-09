import { TextActivityRegistry } from './text-activity-registry';
import { INTERACTIVE_ACTIVITY_TYPES } from './text-activity-types';
import type { TextActivityTemplate, AutoEvolvedTemplate } from './text-activity-types';

export interface DetectionResult {
  tipo: 'interativa' | 'template_textual' | 'auto_geravel' | 'nenhum';
  template: TextActivityTemplate | AutoEvolvedTemplate | null;
  interativaId: string | null;
  confianca: 'alta' | 'media' | 'baixa';
  motivo: string;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function isRequestingActivityCreation(text: string): boolean {
  const lower = normalizeText(text);
  const creationPatterns = [
    'crie', 'cria', 'criar', 'gere', 'gerar', 'faca', 'faça', 'faz',
    'monte', 'montar', 'elabore', 'elaborar', 'prepare', 'preparar',
    'produza', 'produzir', 'desenvolva', 'desenvolver', 'construa',
    'quero', 'preciso', 'me da', 'me de', 'me faz', 'me cria',
  ];
  return creationPatterns.some(p => lower.includes(p));
}

export function detectActivityType(userPrompt: string): DetectionResult {
  const lower = normalizeText(userPrompt);

  for (const interactive of INTERACTIVE_ACTIVITY_TYPES) {
    for (const keyword of interactive.keywords) {
      const normalizedKeyword = normalizeText(keyword);
      if (lower.includes(normalizedKeyword)) {
        if (interactive.id === 'lista-exercicios') {
          const textOnlyPatterns = ['prova', 'simulado', 'dissertativ', 'cloze', 'lacuna', 'associa', 'ordena'];
          if (textOnlyPatterns.some(p => lower.includes(p))) continue;
        }
        return {
          tipo: 'interativa',
          template: null,
          interativaId: interactive.id,
          confianca: 'alta',
          motivo: `Atividade interativa detectada: ${interactive.id} (keyword: "${keyword}")`,
        };
      }
    }
  }

  const textTemplates = TextActivityRegistry.searchByText(userPrompt);
  if (textTemplates.length > 0) {
    const best = textTemplates[0];
    const confianca = textTemplates.length === 1 ? 'alta' : 'media';
    return {
      tipo: 'template_textual',
      template: best,
      interativaId: null,
      confianca,
      motivo: `Template textual encontrado: ${best.nome} (id: ${best.id})`,
    };
  }

  const evolvedMatch = TextActivityRegistry.getEvolvedByKeyword(userPrompt);
  if (evolvedMatch) {
    return {
      tipo: 'template_textual',
      template: evolvedMatch,
      interativaId: null,
      confianca: 'media',
      motivo: `Template auto-gerado reutilizado: ${evolvedMatch.nome} (usos: ${evolvedMatch.usosCount})`,
    };
  }

  if (isRequestingActivityCreation(userPrompt)) {
    return {
      tipo: 'auto_geravel',
      template: null,
      interativaId: null,
      confianca: 'baixa',
      motivo: 'Nenhum template encontrado, mas parece ser pedido de criação — auto-evolução possível',
    };
  }

  return {
    tipo: 'nenhum',
    template: null,
    interativaId: null,
    confianca: 'baixa',
    motivo: 'Não parece ser um pedido de criação de atividade',
  };
}

export function getActivitySuggestions(userPrompt: string, limit = 5): TextActivityTemplate[] {
  return TextActivityRegistry.searchByText(userPrompt).slice(0, limit);
}
