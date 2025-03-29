import { useEffect, useState } from "react";
import {
  DEFAULT_LOGO,
  getVersionedLogoUrl,
  saveLogoToLocalStorage,
  getLogoVersion,
  preloadLogo as preloadLogoUtil,
} from "@/lib/logo-utils";

export function LogoPreloader() {
  const [retryCount, setRetryCount] = useState(0);
  const defaultLogo = window.PONTO_SCHOOL_CONFIG?.defaultLogo || DEFAULT_LOGO;
  const currentVersion =
    window.PONTO_SCHOOL_CONFIG?.logoVersion || getLogoVersion();

  useEffect(() => {
    // Sistema avançado de preload da logo com redundância
    const preloadLogoWithRetry = () => {
      // Use the utility function to preload with versioning
      preloadLogoUtil(
        defaultLogo,
        currentVersion + (retryCount > 0 ? retryCount : 0),
        (versionedUrl) => {
          console.log("Logo preloaded successfully in LogoPreloader component");
          // Logo is already saved to localStorage in the utility function

          // Notificar que a logo foi carregada
          document.dispatchEvent(
            new CustomEvent("logoLoaded", { detail: versionedUrl }),
          );
        },
        () => {
          console.error(`Failed to preload logo (attempt ${retryCount + 1})`);
          if (retryCount < 3) {
            // Tentar novamente após um pequeno atraso com incremento na versão
            setTimeout(() => {
              setRetryCount((prev) => prev + 1);
            }, 1000);
          } else {
            // Após várias tentativas, usar um fallback
            console.warn(
              "Using fallback for logo after multiple failed attempts",
            );
            try {
              // Usar null para indicar que devemos mostrar o texto como fallback
              localStorage.setItem("logoPreloaded", "false");
              localStorage.setItem("customLogo", "null");
              localStorage.setItem("sidebarCustomLogo", "null");

              // Notificar que a logo falhou ao carregar
              document.dispatchEvent(new CustomEvent("logoLoadFailed"));
            } catch (e) {
              console.error("Failed to set fallback in localStorage", e);
            }
          }
        },
      );
    };

    // Executar o preload
    preloadLogoWithRetry();

    // Verificar se a logo já foi carregada por outro componente
    const checkExistingLogo = () => {
      try {
        const logoPreloaded = localStorage.getItem("logoPreloaded");
        const customLogo = localStorage.getItem("customLogo");
        const storedVersion = getLogoVersion();

        if (
          logoPreloaded === "true" &&
          customLogo &&
          customLogo !== "null" &&
          customLogo !== "undefined"
        ) {
          console.log("Logo already preloaded by another component");
          return true;
        }
        return false;
      } catch (e) {
        console.warn("Error checking localStorage for logo", e);
        return false;
      }
    };

    // Se a logo ainda não foi carregada, tentar novamente quando o componente for montado
    if (!checkExistingLogo()) {
      preloadLogoWithRetry();
    }

    // Adicionar listener para eventos de carregamento da logo
    const handleLogoLoaded = (event) => {
      console.log("Logo loaded event received in LogoPreloader", event.detail);
    };

    document.addEventListener("logoLoaded", handleLogoLoaded);

    return () => {
      document.removeEventListener("logoLoaded", handleLogoLoaded);
    };
  }, [retryCount, defaultLogo, currentVersion]);

  return null;
}
