import type { TextActivityTemplate, TextActivityCategory, TextActivityCategoryId, AutoEvolvedTemplate } from './text-activity-types';
import { AVALIACOES_CATEGORY } from './categories/avaliacoes';
import { JOGOS_EDUCATIVOS_CATEGORY } from './categories/jogos-educativos';
import { ORGANIZADORES_CATEGORY } from './categories/organizadores';
import { ESCRITA_PRODUCAO_CATEGORY } from './categories/escrita-producao';
import { PLANEJAMENTO_CATEGORY } from './categories/planejamento';
import { COMUNICACAO_CATEGORY } from './categories/comunicacao';
import { DIFERENCIACAO_CATEGORY } from './categories/diferenciacao';
import { ENGAJAMENTO_CATEGORY } from './categories/engajamento';

const ALL_CATEGORIES: TextActivityCategory[] = [
  AVALIACOES_CATEGORY,
  JOGOS_EDUCATIVOS_CATEGORY,
  ORGANIZADORES_CATEGORY,
  ESCRITA_PRODUCAO_CATEGORY,
  PLANEJAMENTO_CATEGORY,
  COMUNICACAO_CATEGORY,
  DIFERENCIACAO_CATEGORY,
  ENGAJAMENTO_CATEGORY,
];

const templateIndex = new Map<string, TextActivityTemplate>();
const keywordIndex = new Map<string, TextActivityTemplate>();

for (const category of ALL_CATEGORIES) {
  for (const template of category.templates) {
    templateIndex.set(template.id, template);
    for (const keyword of template.keywords) {
      keywordIndex.set(keyword.toLowerCase(), template);
    }
  }
}

const evolvedTemplates = new Map<string, AutoEvolvedTemplate>();

function loadEvolvedFromStorage(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('ponto_evolved_text_activities');
      if (stored) {
        const parsed: AutoEvolvedTemplate[] = JSON.parse(stored);
        for (const t of parsed) {
          evolvedTemplates.set(t.id, t);
        }
        console.log(`[TextActivityRegistry] 📦 ${parsed.length} templates auto-gerados carregados do storage`);
      }
    }
  } catch {
    // ignore
  }
}

loadEvolvedFromStorage();

export const TextActivityRegistry = {
  getByType(typeId: string): TextActivityTemplate | null {
    return templateIndex.get(typeId) || null;
  },

  getByKeyword(text: string): TextActivityTemplate | null {
    const lower = text.toLowerCase().trim();
    if (keywordIndex.has(lower)) return keywordIndex.get(lower)!;
    for (const [keyword, template] of keywordIndex.entries()) {
      if (lower.includes(keyword)) return template;
    }
    return null;
  },

  searchByText(text: string): TextActivityTemplate[] {
    const lower = text.toLowerCase();
    const results: { template: TextActivityTemplate; score: number }[] = [];

    for (const [keyword, template] of keywordIndex.entries()) {
      if (lower.includes(keyword)) {
        const existingIdx = results.findIndex(r => r.template.id === template.id);
        const score = keyword.length;
        if (existingIdx >= 0) {
          results[existingIdx].score = Math.max(results[existingIdx].score, score);
        } else {
          results.push({ template, score });
        }
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .map(r => r.template);
  },

  getAllCategories(): TextActivityCategory[] {
    return ALL_CATEGORIES;
  },

  getCategory(id: TextActivityCategoryId): TextActivityCategory | null {
    return ALL_CATEGORIES.find(c => c.id === id) || null;
  },

  listAll(): TextActivityTemplate[] {
    return Array.from(templateIndex.values());
  },

  count(): number {
    return templateIndex.size;
  },

  registerEvolved(template: AutoEvolvedTemplate): void {
    evolvedTemplates.set(template.id, template);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const all = Array.from(evolvedTemplates.values());
        localStorage.setItem('ponto_evolved_text_activities', JSON.stringify(all));
      }
    } catch {
      // ignore
    }
    console.log(`[TextActivityRegistry] 🧬 Template auto-gerado registrado: ${template.nome} (${template.id})`);
  },

  getEvolvedByKeyword(text: string): AutoEvolvedTemplate | null {
    const lower = text.toLowerCase();
    for (const template of evolvedTemplates.values()) {
      for (const keyword of template.keywords) {
        if (lower.includes(keyword.toLowerCase())) {
          template.usosCount++;
          return template;
        }
      }
    }
    return null;
  },

  getAllEvolved(): AutoEvolvedTemplate[] {
    return Array.from(evolvedTemplates.values());
  },

  getStats() {
    return {
      totalTemplates: templateIndex.size,
      totalCategories: ALL_CATEGORIES.length,
      totalEvolved: evolvedTemplates.size,
      categorias: ALL_CATEGORIES.map(c => ({
        id: c.id,
        nome: c.nome,
        quantidade: c.templates.length,
      })),
    };
  },
};

export default TextActivityRegistry;
