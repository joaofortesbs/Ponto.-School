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
      // Verificar a existência da imagem enviada pelo usuário primeiro
      const userLogoPath = "/images/ponto-school-logo.png";
      
      console.log("Tentando carregar a logo do usuário:", userLogoPath);
      
      const userLogoImg = new Image();
      userLogoImg.src = userLogoPath + "?v=" + Date.now(); // Adicionar timestamp para evitar cache
      userLogoImg.fetchPriority = "high";
      userLogoImg.crossOrigin = "anonymous";
      
      userLogoImg.onload = () => {
        console.log("Logo do usuário carregada com sucesso:", userLogoPath);
        
        // Salvar a logo no localStorage
        try {
          localStorage.setItem("logoPreloaded", "true");
          localStorage.setItem("customLogo", userLogoPath);
          localStorage.setItem("sidebarCustomLogo", userLogoPath);
          localStorage.setItem("pontoSchoolLogo", userLogoPath);
          
          // Notificar que a logo foi carregada
          document.dispatchEvent(
            new CustomEvent("logoLoaded", { detail: userLogoPath }),
          );
        } catch (e) {
          console.error("Erro ao salvar logo no localStorage:", e);
        }
      };
      
      userLogoImg.onerror = () => {
        console.warn("Erro ao carregar a logo do usuário, usando função de preload padrão");
        
        // Usar a função utilitária para preload com versionamento como fallback
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
              // Após várias tentativas, usar a logo de fallback do padrão
              console.warn(
                "Using fallback for logo after multiple failed attempts",
              );
              try {
                const fallbackLogo = "/images/ponto-school-logo.png?fallback=true&t=" + Date.now();
                localStorage.setItem("logoPreloaded", "true");
                localStorage.setItem("customLogo", fallbackLogo);
                localStorage.setItem("sidebarCustomLogo", fallbackLogo);
                localStorage.setItem("pontoSchoolLogo", fallbackLogo);

                // Notificar que estamos usando o fallback
                document.dispatchEvent(
                  new CustomEvent("logoLoaded", { detail: fallbackLogo })
                );
              } catch (e) {
                console.error("Failed to set fallback in localStorage", e);
                document.dispatchEvent(new CustomEvent("logoLoadFailed"));
              }
            }
          },
        );
      };
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
