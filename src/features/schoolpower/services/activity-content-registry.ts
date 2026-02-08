import { useChosenActivitiesStore } from '../interface-chat-producao/stores/ChosenActivitiesStore';

export interface ActivityContentData {
  id: string;
  tipo: string;
  titulo: string;
  customFields: Record<string, any>;
  originalData: Record<string, any>;
  source: string;
  found: boolean;
}

const EMPTY_RESULT = (id: string, tipo: string): ActivityContentData => ({
  id,
  tipo,
  titulo: '',
  customFields: {},
  originalData: {},
  source: 'none',
  found: false,
});

function tryParseJSON(raw: string | null): any {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function readConstructedFromLocalStorage(id: string, tipo: string): Record<string, any> | null {
  const primaryKey = `constructed_${tipo}_${id}`;
  const parsed = tryParseJSON(localStorage.getItem(primaryKey));
  
  if (parsed) {
    const innerData = parsed.data || parsed;
    const metadataKeys = ['success', 'hasFullDataInStore', 'activityId', 'activityType', 'generatedAt', 'apiCallDuration', 'persistedAt', 'syncedAt', 'fieldsCount', 'titulo'];
    const meaningfulKeys = Object.keys(innerData).filter(k => !metadataKeys.includes(k));
    
    if (parsed.hasFullDataInStore === true && meaningfulKeys.length <= 2) {
      console.log(`📦 [ContentRegistry] ${primaryKey}: apenas metadados leves (hasFullDataInStore), ${meaningfulKeys.length} campos úteis`);
      return null;
    }
    
    if (meaningfulKeys.length > 0) {
      console.log(`✅ [ContentRegistry] Dados encontrados em ${primaryKey}: ${meaningfulKeys.length} campos úteis`);
      return innerData;
    }
  }
  
  const legacyKey = `constructed_${id}`;
  const legacyParsed = tryParseJSON(localStorage.getItem(legacyKey));
  if (legacyParsed) {
    const data = legacyParsed.data || legacyParsed;
    console.log(`✅ [ContentRegistry] Dados encontrados em ${legacyKey} (legacy)`);
    return data;
  }
  
  return null;
}

function readFromChosenActivitiesStore(id: string): { fields: Record<string, any>; storeActivity: any } | null {
  try {
    const store = useChosenActivitiesStore.getState();
    const activity = store.getActivityById(id);
    
    if (!activity) return null;
    
    const generatedFields = activity.dados_construidos?.generated_fields || {};
    const camposPreenchidos = activity.campos_preenchidos || {};
    const consolidated = { ...camposPreenchidos, ...generatedFields };
    
    if (Object.keys(consolidated).length > 0) {
      console.log(`✅ [ContentRegistry] Dados encontrados na store para ${id}: ${Object.keys(consolidated).length} campos`);
      return { fields: consolidated, storeActivity: activity };
    }
    
    return { fields: {}, storeActivity: activity };
  } catch {
    return null;
  }
}

export function getActivityContent(id: string, tipo: string, titulo?: string): ActivityContentData {
  if (!id) {
    console.warn('⚠️ [ContentRegistry] ID da atividade não fornecido');
    return EMPTY_RESULT('unknown', tipo);
  }
  
  console.log(`🔍 [ContentRegistry] Buscando conteúdo para atividade ${id} (${tipo})`);
  
  const result = EMPTY_RESULT(id, tipo);
  result.titulo = titulo || '';
  
  const storeResult = readFromChosenActivitiesStore(id);
  
  const localStorageData = readConstructedFromLocalStorage(id, tipo);
  
  if (localStorageData && Object.keys(localStorageData).length > 0) {
    result.customFields = { ...result.customFields, ...localStorageData };
    result.originalData = {
      type: tipo,
      campos: localStorageData,
      ...localStorageData,
    };
    result.source = `localStorage:constructed_${tipo}_${id}`;
    result.found = true;
    result.titulo = localStorageData.titulo || localStorageData.title || result.titulo;
  }
  
  if (storeResult) {
    const { fields, storeActivity } = storeResult;
    
    if (Object.keys(fields).length > 0) {
      result.customFields = { ...result.customFields, ...fields };
      result.originalData = {
        ...result.originalData,
        type: tipo,
        campos: { ...result.originalData.campos, ...fields },
        ...fields,
      };
      if (!result.found) {
        result.source = 'ChosenActivitiesStore';
      } else {
        result.source += ' + ChosenActivitiesStore';
      }
      result.found = true;
    }
    
    result.titulo = result.titulo || storeActivity.titulo || '';
    if (storeActivity.tags) result.originalData.tags = storeActivity.tags;
    if (storeActivity.nivel_dificuldade) result.originalData.nivel_dificuldade = storeActivity.nivel_dificuldade;
  }
  
  if (!result.found) {
    const alternativeKeys = [
      `activity_${id}`,
      `activity_${id}_fields`,
      `generated_content_${id}`,
    ];
    
    for (const key of alternativeKeys) {
      const parsed = tryParseJSON(localStorage.getItem(key));
      if (parsed && Object.keys(parsed).length > 0) {
        result.customFields = { ...result.customFields, ...parsed };
        result.originalData = { ...result.originalData, ...parsed, type: tipo };
        result.source = `localStorage:${key}`;
        result.found = true;
        console.log(`✅ [ContentRegistry] Fallback encontrado em ${key}`);
        break;
      }
    }
  }
  
  console.log(`📊 [ContentRegistry] Resultado para ${id}: found=${result.found}, source=${result.source}, fields=${Object.keys(result.customFields).length}`);
  
  return result;
}

export function persistActivityContentSnapshot(
  id: string, 
  tipo: string, 
  content: Record<string, any>
): boolean {
  if (!id || !tipo || !content) return false;
  
  const primaryKey = `constructed_${tipo}_${id}`;
  
  try {
    const existing = tryParseJSON(localStorage.getItem(primaryKey));
    
    if (existing && !existing.hasFullDataInStore && Object.keys(existing).length > Object.keys(content).length) {
      console.log(`📦 [ContentRegistry] ${primaryKey} já possui dados mais completos — preservando`);
      return true;
    }
    
    const dataToStore = {
      ...content,
      success: true,
      activityId: id,
      activityType: tipo,
      persistedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(primaryKey, JSON.stringify(dataToStore));
    console.log(`✅ [ContentRegistry] Snapshot persistido em ${primaryKey}: ${Object.keys(content).length} campos`);
    return true;
  } catch (e: any) {
    console.warn(`⚠️ [ContentRegistry] Erro ao persistir snapshot: ${e.message}`);
    return false;
  }
}

export function syncActivityContentFromStore(id: string, tipo: string): boolean {
  const storeResult = readFromChosenActivitiesStore(id);
  if (!storeResult || Object.keys(storeResult.fields).length === 0) return false;
  
  return persistActivityContentSnapshot(id, tipo, storeResult.fields);
}
