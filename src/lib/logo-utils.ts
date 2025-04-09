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
  const versionedUrl = getVersionedLogoUrl(logoUrl, version);

  const preloadImage = new Image();
  preloadImage.src = versionedUrl;
  preloadImage.fetchPriority = "high";
  preloadImage.crossOrigin = "anonymous";

  preloadImage.onload = () => {
    console.log("Logo preloaded successfully");
    saveLogoToLocalStorage(logoUrl, version);
    if (onSuccess) onSuccess(versionedUrl);
  };

  preloadImage.onerror = () => {
    console.error(`Failed to preload logo with version ${version}`);
    if (onError) onError();
  };
}
