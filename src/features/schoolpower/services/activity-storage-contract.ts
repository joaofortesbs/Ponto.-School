import { saveExerciseListData, loadExerciseListData } from '../activities/lista-exercicios/contracts';

export const CONTENT_INDICATORS: string[] = ['questoes', 'questions', 'cards', 'etapas', 'sections', 'perguntas'];

export function hasRealContent(data: Record<string, any> | null): boolean {
  if (!data) {
    return false;
  }

  return CONTENT_INDICATORS.some(indicator => {
    const value = data[indicator];
    return Array.isArray(value) && value.length > 0;
  });
}

export function writeActivityContent(
  activityId: string,
  tipo: string,
  data: Record<string, any>,
  force: boolean = false
): boolean {
  try {
    const constructedKey = `constructed_${tipo}_${activityId}`;
    const activityKey = `activity_${activityId}`;

    if (!force) {
      const existing = localStorage.getItem(constructedKey);
      if (existing) {
        try {
          const parsedExisting = JSON.parse(existing);
          const existingData = parsedExisting?.data || parsedExisting;
          if (hasRealContent(existingData)) {
            console.log(`📦 [StorageContract] Guardando escrita — dados existentes têm conteúdo real em ${constructedKey}`);
            return false;
          }
        } catch (e) {
          console.warn(`📦 [StorageContract] Erro ao verificar dados existentes em ${constructedKey}:`, e);
        }
      }
    }

    if (tipo === 'quiz-interativo') {
      const wrapper = {
        success: true,
        data: data,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(constructedKey, JSON.stringify(wrapper));
      console.log(`📦 [StorageContract] Escrito quiz-interativo em ${constructedKey} (com wrapper)`);
    } else if (tipo === 'lista-exercicios') {
      saveExerciseListData(activityId, data);
      console.log(`📦 [StorageContract] Escrito lista-exercicios em namespace protegido via saveExerciseListData`);
    } else if (tipo === 'flash-cards') {
      localStorage.setItem(constructedKey, JSON.stringify(data));
      console.log(`📦 [StorageContract] Escrito flash-cards em ${constructedKey} (flat JSON)`);
    } else {
      localStorage.setItem(constructedKey, JSON.stringify(data));
      console.log(`📦 [StorageContract] Escrito ${tipo} em ${constructedKey} (flat JSON)`);
    }

    localStorage.setItem(activityKey, JSON.stringify(data));
    console.log(`📦 [StorageContract] Escrito flat data em ${activityKey}`);

    return true;
  } catch (e) {
    console.error(`📦 [StorageContract] Erro ao escrever conteúdo:`, e);
    return false;
  }
}

export function readActivityContent(activityId: string, tipo: string): Record<string, any> | null {
  try {
    const constructedKey = `constructed_${tipo}_${activityId}`;
    const activityKey = `activity_${activityId}`;

    if (tipo === 'lista-exercicios') {
      const loaded = loadExerciseListData(activityId);
      if (loaded) {
        console.log(`📦 [StorageContract] Lido lista-exercicios via loadExerciseListData`);
        return loaded as Record<string, any>;
      }
    }

    const constructedRaw = localStorage.getItem(constructedKey);
    if (constructedRaw) {
      try {
        const parsed = JSON.parse(constructedRaw);
        if (parsed?.data && typeof parsed.data === 'object') {
          console.log(`📦 [StorageContract] Lido ${tipo} de ${constructedKey} (desempacotado wrapper)`);
          return parsed.data;
        }
        console.log(`📦 [StorageContract] Lido ${tipo} de ${constructedKey} (flat JSON)`);
        return parsed;
      } catch (e) {
        console.warn(`📦 [StorageContract] Erro ao fazer parse de ${constructedKey}:`, e);
      }
    }

    const activityRaw = localStorage.getItem(activityKey);
    if (activityRaw) {
      try {
        const parsed = JSON.parse(activityRaw);
        console.log(`📦 [StorageContract] Lido ${tipo} de fallback ${activityKey}`);
        return parsed;
      } catch (e) {
        console.warn(`📦 [StorageContract] Erro ao fazer parse de ${activityKey}:`, e);
      }
    }

    console.log(`📦 [StorageContract] Nenhum conteúdo encontrado para ${activityId} tipo ${tipo}`);
    return null;
  } catch (e) {
    console.error(`📦 [StorageContract] Erro ao ler conteúdo:`, e);
    return null;
  }
}
