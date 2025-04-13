/**
 * Logo utilities for managing logo loading, caching, and versioning
 */

// Define types for logo configuration
export interface LogoConfig {
  defaultLogo: string;
  logoLoaded: boolean;
  logoVersion?: number;
}

// Default logo path
export const DEFAULT_LOGO = "/images/ponto-school-logo.png";

/**
 * Função para tratar erros de carregamento de logo
 */
export const handleLogoError = () => {
  console.log("Erro ao carregar logo, usando fallback");
  return DEFAULT_LOGO;
};

/**
 * Verifica se a URL da logo é válida
 */
export const isValidLogoUrl = (url: string | null): boolean => {
  return !!url && url !== "null" && url !== "undefined";
};

/**
 * Add version parameter to logo URL to prevent caching
 * @param logoUrl The original logo URL
 * @param version The version number to append
 * @returns The versioned logo URL
 */
export function getVersionedLogoUrl(
  logoUrl: string,
  version: number = 1,
): string {
  if (!logoUrl) return DEFAULT_LOGO;

  // If URL already has parameters, append the version
  if (logoUrl.includes("?")) {
    return `${logoUrl}&v=${version}`;
  }

  // Otherwise add the version as a new parameter
  return `${logoUrl}?v=${version}`;
}

/**
 * Initialize the global logo configuration
 */
export function initLogoConfig(): void {
  if (!window.PONTO_SCHOOL_CONFIG) {
    window.PONTO_SCHOOL_CONFIG = {
      defaultLogo: DEFAULT_LOGO,
      logoLoaded: false,
      logoVersion: 1,
    };
  } else if (!window.PONTO_SCHOOL_CONFIG.logoVersion) {
    window.PONTO_SCHOOL_CONFIG.logoVersion = 1;
  }
}

/**
 * Save logo information to localStorage
 * @param logoUrl The logo URL to save
 * @param version The version number
 */
export function saveLogoToLocalStorage(
  logoUrl: string,
  version: number = 1,
): void {
  try {
    const versionedUrl = getVersionedLogoUrl(logoUrl, version);
    localStorage.setItem("pontoSchoolLogo", versionedUrl);
    localStorage.setItem("customLogo", versionedUrl);
    localStorage.setItem("sidebarCustomLogo", versionedUrl);
    localStorage.setItem("logoPreloaded", "true");
    localStorage.setItem("logoVersion", version.toString());

    if (window.PONTO_SCHOOL_CONFIG) {
      window.PONTO_SCHOOL_CONFIG.defaultLogo = versionedUrl;
      window.PONTO_SCHOOL_CONFIG.logoLoaded = true;
      window.PONTO_SCHOOL_CONFIG.logoVersion = version;
    }

    // Notify that the logo was loaded
    document.dispatchEvent(
      new CustomEvent("logoLoaded", { detail: versionedUrl }),
    );
  } catch (e) {
    console.warn("Não foi possível salvar a logo no localStorage", e);
  }
}

/**
 * Get the current logo version from localStorage
 * @returns The current logo version number
 */
export function getLogoVersion(): number {
  try {
    const version = localStorage.getItem("logoVersion");
    return version ? parseInt(version, 10) : 1;
  } catch (e) {
    console.warn("Erro ao obter versão da logo", e);
    return 1;
  }
}

/**
 * Preload the logo image with high priority
 * @param logoUrl The logo URL to preload
 * @param version The version number
 * @param onSuccess Callback for successful load
 * @param onError Callback for load error
 */
export function preloadLogo(
  logoUrl: string,
  version: number = 1,
  onSuccess?: (url: string) => void,
  onError?: () => void,
): void {
  // Verificar se a URL é válida ou usar o padrão
  const targetLogoUrl = logoUrl || DEFAULT_LOGO;
  // Adicionar timestamp para evitar cache
  const timestamp = Date.now();
  const versionedUrl = getVersionedLogoUrl(targetLogoUrl, version) + "&t=" + timestamp;
  
  console.log("Preloading logo:", versionedUrl);

  // Salvar no localStorage imediatamente para garantir disponibilidade
  saveLogoToLocalStorage(targetLogoUrl, version);
  
  // Notificar outros componentes que a logo está disponível
  document.dispatchEvent(
    new CustomEvent("logoLoaded", { detail: versionedUrl })
  );
  
  // Também fazemos o preload via Image para garantir
  const preloadImage = new Image();
  preloadImage.src = versionedUrl;
  preloadImage.fetchPriority = "high";
  preloadImage.crossOrigin = "anonymous";

  preloadImage.onload = () => {
    console.log("Logo preloaded successfully:", versionedUrl);
    if (onSuccess) onSuccess(versionedUrl);
  };

  preloadImage.onerror = () => {
    console.error(`Failed to preload logo with version ${version}`);
    
    // Em caso de erro, tentar com o caminho absoluto da logo padrão com um novo timestamp
    const fallbackUrl = DEFAULT_LOGO + "?fallback=true&t=" + Date.now();
    console.log("Trying fallback logo:", fallbackUrl);
    
    // Salvar o fallback no localStorage
    saveLogoToLocalStorage(fallbackUrl, version);
    
    // Notificar que estamos usando o fallback
    document.dispatchEvent(
      new CustomEvent("logoLoaded", { detail: fallbackUrl })
    );
    
    const fallbackImage = new Image();
    fallbackImage.src = fallbackUrl;
    fallbackImage.fetchPriority = "high";
    
    fallbackImage.onload = () => {
      console.log("Fallback logo loaded successfully");
      if (onSuccess) onSuccess(fallbackUrl);
    };
    
    fallbackImage.onerror = () => {
      console.error("Even fallback logo failed to load");
      if (onError) onError();
    };
  };
}
