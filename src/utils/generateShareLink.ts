
import { nanoid } from 'nanoid';

/**
 * Interface para dados da atividade compartilhada
 */
interface SharedActivityData {
  id: string;
  uniqueCode: string;
  title: string;
  description?: string;
  content: any;
  createdAt: string;
  activityType: string;
  isPublic: boolean;
}

/**
 * Gera um código único para uma atividade
 */
function generateUniqueCode(): string {
  // Gera um código de 8 caracteres único
  return nanoid(8);
}

/**
 * Salva dados da atividade compartilhada no localStorage
 */
function saveSharedActivity(activityId: string, activityData: any): string {
  const uniqueCode = generateUniqueCode();
  
  const sharedActivityData: SharedActivityData = {
    id: activityId,
    uniqueCode,
    title: activityData.title || activityData.personalizedTitle || 'Atividade',
    description: activityData.description || activityData.personalizedDescription,
    content: activityData.content || activityData,
    createdAt: new Date().toISOString(),
    activityType: activityData.type || activityData.categoryId || 'atividade-geral',
    isPublic: true
  };
  
  // Salvar com o código único como chave
  localStorage.setItem(`shared_activity_${uniqueCode}`, JSON.stringify(sharedActivityData));
  
  // Salvar mapeamento activityId -> uniqueCode
  const mappingKey = `activity_mapping_${activityId}`;
  localStorage.setItem(mappingKey, uniqueCode);
  
  console.log(`🔗 Código único gerado para atividade ${activityId}: ${uniqueCode}`);
  return uniqueCode;
}

/**
 * Recupera ou cria código único para uma atividade
 */
function getOrCreateUniqueCode(activityId: string): string {
  // Verificar se já existe um código para esta atividade
  const existingCode = localStorage.getItem(`activity_mapping_${activityId}`);
  
  if (existingCode) {
    console.log(`🔄 Código único existente encontrado para ${activityId}: ${existingCode}`);
    return existingCode;
  }
  
  // Buscar dados da atividade
  const activityData = getActivityData(activityId);
  
  // Criar novo código único
  const newCode = saveSharedActivity(activityId, activityData);
  console.log(`✨ Novo código único criado para ${activityId}: ${newCode}`);
  
  return newCode;
}

/**
 * Busca dados da atividade em diferentes locais do localStorage
 */
function getActivityData(activityId: string): any {
  // Tentar diferentes chaves de armazenamento
  const possibleKeys = [
    `activity_${activityId}`,
    `constructed_${activityId}`,
    `schoolpower_${activityId}_content`,
    `constructed_${activityId.replace('-', '_')}_${activityId}`,
    `activity_fields_${activityId}`
  ];
  
  for (const key of possibleKeys) {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        if (parsedData && (parsedData.title || parsedData.content || parsedData.questoes)) {
          console.log(`📦 Dados da atividade encontrados em: ${key}`);
          return parsedData;
        }
      } catch (error) {
        console.warn(`⚠️ Erro ao parsear dados de ${key}:`, error);
      }
    }
  }
  
  // Se não encontrar dados específicos, criar dados básicos
  console.log(`⚠️ Dados específicos não encontrados para ${activityId}, usando dados básicos`);
  return {
    id: activityId,
    title: `Atividade ${activityId}`,
    description: 'Atividade educacional',
    content: 'Conteúdo da atividade será carregado...',
    type: activityId
  };
}

/**
 * Gera um link único para compartilhamento público de atividade
 */
export function gerarLinkCompartilhamento(activityId: string): string {
  if (!activityId || activityId.trim() === '') {
    console.error('❌ ID da atividade inválido para geração de link:', activityId);
    return '';
  }

  try {
    // Obter ou criar código único
    const uniqueCode = getOrCreateUniqueCode(activityId);
    
    const baseUrl = window.location.origin;
    const cleanId = activityId.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    const link = `${baseUrl}/atividade/${cleanId}/${uniqueCode}`;
    
    console.log('🔗 Link de compartilhamento gerado com código único:', link);
    return link;
  } catch (error) {
    console.error('❌ Erro ao gerar link de compartilhamento:', error);
    return '';
  }
}

/**
 * Recupera dados da atividade pelo código único
 */
export function getSharedActivityByCode(uniqueCode: string): SharedActivityData | null {
  try {
    const data = localStorage.getItem(`shared_activity_${uniqueCode}`);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('❌ Erro ao buscar atividade por código único:', error);
    return null;
  }
}

/**
 * Copia o link de compartilhamento para a área de transferência
 */
export async function copiarLinkCompartilhamento(activityId: string): Promise<boolean> {
  try {
    const link = gerarLinkCompartilhamento(activityId);
    if (!link) {
      console.error('❌ Link de compartilhamento vazio');
      return false;
    }
    
    await navigator.clipboard.writeText(link);
    console.log('✅ Link copiado para área de transferência:', link);
    return true;
  } catch (error) {
    console.error('❌ Erro ao copiar link:', error);
    return false;
  }
}

/**
 * Abre o modal de compartilhamento nativo do navegador (se disponível)
 */
export async function compartilharAtividade(
  activityId: string, 
  title: string, 
  description?: string
): Promise<boolean> {
  try {
    const link = gerarLinkCompartilhamento(activityId);
    
    if (!link) {
      console.error('❌ Não foi possível gerar link para compartilhamento');
      return false;
    }
    
    if (navigator.share) {
      await navigator.share({
        title: title,
        text: description || 'Confira esta atividade educacional',
        url: link
      });
      return true;
    } else {
      // Fallback: copiar para área de transferência
      return await copiarLinkCompartilhamento(activityId);
    }
  } catch (error) {
    console.error('❌ Erro ao compartilhar:', error);
    return false;
  }
}

/**
 * Valida se um código único é válido
 */
export function validarCodigoUnico(code: string): boolean {
  return code && code.length === 8 && /^[a-zA-Z0-9_-]+$/.test(code);
}

/**
 * Valida se um ID de atividade é válido
 */
export function validarIdAtividade(id: string): boolean {
  return id && id.length > 0 && /^[a-zA-Z0-9_-]+$/.test(id);
}

/**
 * Lista todas as atividades compartilhadas (para debug)
 */
export function listarAtividadesCompartilhadas(): SharedActivityData[] {
  const activities: SharedActivityData[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('shared_activity_')) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          activities.push(JSON.parse(data));
        }
      } catch (error) {
        console.warn('⚠️ Erro ao parsear atividade compartilhada:', key);
      }
    }
  }
  
  return activities;
}
