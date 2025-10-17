
/**
 * Serviço de pré-carregamento de ícones
 * Carrega e armazena ícones no localStorage como Base64
 */

const ICONS_STORAGE_PREFIX = "ponto_school_icons_";
const ICONS_VERSION = 1;

interface IconData {
  base64: string;
  version: number;
  timestamp: number;
}

/**
 * Converte uma imagem para Base64
 */
async function imageToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert image to Base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Erro ao converter imagem ${url} para Base64:`, error);
    throw error;
  }
}

/**
 * Salva um ícone no localStorage
 */
function saveIconToStorage(iconName: string, base64Data: string): void {
  try {
    const iconData: IconData = {
      base64: base64Data,
      version: ICONS_VERSION,
      timestamp: Date.now()
    };
    
    localStorage.setItem(
      `${ICONS_STORAGE_PREFIX}${iconName}`,
      JSON.stringify(iconData)
    );
    
    console.log(`✅ Ícone ${iconName} salvo no localStorage`);
  } catch (error) {
    console.error(`❌ Erro ao salvar ícone ${iconName}:`, error);
  }
}

/**
 * Recupera um ícone do localStorage
 */
export function getIconFromStorage(iconName: string): string | null {
  try {
    const stored = localStorage.getItem(`${ICONS_STORAGE_PREFIX}${iconName}`);
    
    if (!stored) {
      return null;
    }
    
    const iconData: IconData = JSON.parse(stored);
    
    // Verifica se a versão está atualizada
    if (iconData.version !== ICONS_VERSION) {
      console.log(`⚠️ Versão antiga do ícone ${iconName}, será recarregado`);
      return null;
    }
    
    return iconData.base64;
  } catch (error) {
    console.error(`❌ Erro ao recuperar ícone ${iconName}:`, error);
    return null;
  }
}

/**
 * Pré-carrega e armazena os ícones principais
 */
export async function preloadIcons(): Promise<void> {
  const icons = [
    { name: 'sparks', url: '/lovable-uploads/icone-sparks.png' },
    { name: 'powers', url: '/lovable-uploads/icone-powers.png' }
  ];
  
  console.log('🎨 Iniciando pré-carregamento de ícones...');
  
  const loadPromises = icons.map(async (icon) => {
    try {
      // Verifica se já existe no storage
      const existing = getIconFromStorage(icon.name);
      
      if (existing) {
        console.log(`✅ Ícone ${icon.name} já está em cache`);
        return;
      }
      
      // Converte para Base64
      console.log(`📥 Carregando ícone ${icon.name} de ${icon.url}...`);
      const base64 = await imageToBase64(icon.url);
      
      // Salva no localStorage
      saveIconToStorage(icon.name, base64);
      
      console.log(`✅ Ícone ${icon.name} pré-carregado com sucesso`);
    } catch (error) {
      console.error(`❌ Erro ao pré-carregar ícone ${icon.name}:`, error);
      // Não interrompe o carregamento de outros ícones
    }
  });
  
  await Promise.allSettled(loadPromises);
  
  console.log('🎨 Pré-carregamento de ícones concluído');
}

/**
 * Limpa ícones antigos do cache
 */
export function clearIconsCache(): void {
  try {
    const keys = Object.keys(localStorage);
    const iconKeys = keys.filter(key => key.startsWith(ICONS_STORAGE_PREFIX));
    
    iconKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('🗑️ Cache de ícones limpo');
  } catch (error) {
    console.error('❌ Erro ao limpar cache de ícones:', error);
  }
}

/**
 * Hook React para usar ícones do cache
 */
export function useIconFromCache(iconName: string, fallbackUrl: string): string {
  const cached = getIconFromStorage(iconName);
  return cached || fallbackUrl;
}
