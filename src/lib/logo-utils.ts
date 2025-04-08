/**
 * Logo utilities for managing logo loading, caching, and versioning
 */

// Define types for logo configuration
export interface LogoConfig {
  defaultLogo: string;
  logoLoaded: boolean;
  logoVersion?: number;
}

// Configuração padrão para a logo
export const DEFAULT_LOGO = "/images/logo-oficial.png";

// Inicializa a configuração global de logo
export function initLogoConfig() {
  window.PONTO_SCHOOL_CONFIG = window.PONTO_SCHOOL_CONFIG || {
    defaultLogo: DEFAULT_LOGO,
    logoLoaded: false,
    logoVersion: 1,
  };
}

// Retorna a URL da logo com versão para evitar cache
export function getVersionedLogoUrl(logoUrl: string, version?: number) {
  const versionParam = version || getLogoVersion() || 1;
  // Adicionar parâmetro de versão para evitar cache
  return `${logoUrl}?v=${versionParam}`;
}

// Salva a logo no localStorage
export function saveLogoToLocalStorage(logoUrl: string, version: number) {
  try {
    localStorage.setItem("pontoSchoolLogo", logoUrl);
    localStorage.setItem("customLogo", logoUrl);
    localStorage.setItem("sidebarCustomLogo", logoUrl);
    localStorage.setItem("logoVersion", version.toString());
    console.log("Logo salva no localStorage com sucesso");
    return true;
  } catch (error) {
    console.error("Erro ao salvar logo no localStorage:", error);
    return false;
  }
}

// Obtém a versão atual da logo
export function getLogoVersion(): number {
  return parseInt(localStorage.getItem("logoVersion") || "1", 10);
}

// Pré-carrega a logo para garantir disponibilidade
export function preloadLogo(logoUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = logoUrl;
    img.onload = () => {
      console.log("Logo pré-carregada com sucesso");
      resolve(true);
    };
    img.onerror = () => {
      console.error("Erro ao pré-carregar logo");
      resolve(false);
    };
  });
}

// Configura o tipo global para o PONTO_SCHOOL_CONFIG
declare global {
  interface Window {
    PONTO_SCHOOL_CONFIG: {
      defaultLogo: string;
      logoLoaded: boolean;
      logoVersion: number;
    };
  }
}