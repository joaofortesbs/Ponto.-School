
import { useEffect, useState } from "react";
import { getLogoVersion, DEFAULT_LOGO } from "@/lib/logo-utils";
import { PONTO_SCHOOL_LOGO_BASE64 } from "./LogoImageBase64";

export function LogoPreloader() {
  const [retryCount, setRetryCount] = useState(0);
  const currentVersion = getLogoVersion();
  const defaultLogo = DEFAULT_LOGO;

  useEffect(() => {
    console.log("LogoPreloader inicializado");
    
    // Função para pré-carregar a logo com retry
    const preloadLogoWithRetry = () => {
      const preloadImage = new Image();
      preloadImage.src = defaultLogo + "?v=" + currentVersion;
      preloadImage.fetchPriority = "high";
      
      preloadImage.onload = () => {
        console.log("Logo pré-carregada com sucesso");
        
        // Salvar no localStorage
        localStorage.setItem("pontoSchoolLogo", defaultLogo);
        localStorage.setItem("customLogo", defaultLogo);
        localStorage.setItem("sidebarCustomLogo", defaultLogo);
        localStorage.setItem("logoPreloaded", "true");
        localStorage.setItem("logoVersion", currentVersion.toString());
        
        // Configurar objeto global
        window.PONTO_SCHOOL_CONFIG = {
          defaultLogo: defaultLogo,
          logoLoaded: true,
          logoVersion: currentVersion,
        };
        
        // Notificar outros componentes
        document.dispatchEvent(
          new CustomEvent("logoLoaded", { detail: defaultLogo + "?v=" + currentVersion })
        );
      };
      
      preloadImage.onerror = () => {
        console.error("Erro ao pré-carregar logo, tentando novamente...");
        
        // Tentar com base64 fallback se falhar mais de 2 vezes
        if (retryCount >= 2) {
          console.log("Usando logo base64");
          
          // Usar base64 como fallback
          localStorage.setItem("pontoSchoolLogo", PONTO_SCHOOL_LOGO_BASE64);
          localStorage.setItem("customLogo", PONTO_SCHOOL_LOGO_BASE64);
          localStorage.setItem("sidebarCustomLogo", PONTO_SCHOOL_LOGO_BASE64);
          localStorage.setItem("logoPreloaded", "true");
          
          window.PONTO_SCHOOL_CONFIG = {
            defaultLogo: PONTO_SCHOOL_LOGO_BASE64,
            logoLoaded: true,
            logoVersion: currentVersion,
          };
          
          document.dispatchEvent(
            new CustomEvent("logoLoaded", { detail: PONTO_SCHOOL_LOGO_BASE64 })
          );
          
          return;
        }
        
        // Incrementar contador de tentativas e tentar novamente
        setRetryCount(prev => prev + 1);
        
        // Tentar novamente com um timestamp para evitar cache
        setTimeout(() => {
          preloadLogoWithRetry();
        }, 1000);
      };
    };

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
