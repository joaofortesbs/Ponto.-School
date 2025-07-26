
import { lazy, LazyExoticComponent, FC } from 'react';

export interface ActivityComponentSet {
  editor: LazyExoticComponent<FC<any>>;
  preview: LazyExoticComponent<FC<any>>;
}

export const activityRegistry: Record<string, ActivityComponentSet> = {
  "prova-funcao-1grau": {
    editor: lazy(() => import("./prova-funcao-1grau/EditActivity")),
    preview: lazy(() => import("./prova-funcao-1grau/ActivityPreview")),
  },
  "lista-exercicios-funcao-1grau": {
    editor: lazy(() => import("./lista-exercicios-funcao-1grau/EditActivity").catch(() => import("./default/EditActivity"))),
    preview: lazy(() => import("./lista-exercicios-funcao-1grau/ActivityPreview").catch(() => import("./default/ActivityPreview"))),
  },
  "jogo-educacional-funcao-1grau": {
    editor: lazy(() => import("./jogo-educacional-funcao-1grau/EditActivity").catch(() => import("./default/EditActivity"))),
    preview: lazy(() => import("./jogo-educacional-funcao-1grau/ActivityPreview").catch(() => import("./default/ActivityPreview"))),
  },
  "funcoes-primeiro-grau": {
    editor: lazy(() => import("./funcoes-primeiro-grau/EditActivity").catch(() => import("./default/EditActivity"))),
    preview: lazy(() => import("./funcoes-primeiro-grau/ActivityPreview").catch(() => import("./default/ActivityPreview"))),
  },
  "atividade-contextualizada-funcao-1grau": {
    editor: lazy(() => import("./atividade-contextualizada-funcao-1grau/EditActivity").catch(() => import("./default/EditActivity"))),
    preview: lazy(() => import("./atividade-contextualizada-funcao-1grau/ActivityPreview").catch(() => import("./default/ActivityPreview"))),
  }
};

export function getActivityComponents(activityId: string): ActivityComponentSet | null {
  return activityRegistry[activityId] || null;
}

export function isActivitySupported(activityId: string): boolean {
  return activityId in activityRegistry;
}
