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

  useEffect(() => {
    // Sistema de preload da logo com alta prioridade
    const preloadLogo = () => {
      console.log("LogoPreloader: Iniciando preload de logo");

      // Usar logo específica enviada pelo usuário (caminho conhecido)
      const logoPath = "/images/ponto-school-logo.png";
      const version = (getLogoVersion() || 1) + 1;
      const timestamp = Date.now();
      const versionedLogoUrl = `${logoPath}?v=${version}&t=${timestamp}`;

      console.log("LogoPreloader: Preload direto com:", versionedLogoUrl);

      // Salvar imediatamente nos locais de armazenamento
      try {
        localStorage.setItem("logoPreloaded", "true");
        localStorage.setItem("customLogo", versionedLogoUrl);
        localStorage.setItem("sidebarCustomLogo", versionedLogoUrl);
        localStorage.setItem("pontoSchoolLogo", versionedLogoUrl);
        localStorage.setItem("logoVersion", version.toString());
        console.log("LogoPreloader: Logo salva no localStorage com sucesso");
      } catch (e) {
        console.error("LogoPreloader: Erro ao salvar logo no localStorage:", e);
      }

      // Configuração global
      if (window.PONTO_SCHOOL_CONFIG) {
        window.PONTO_SCHOOL_CONFIG.defaultLogo = versionedLogoUrl;
        window.PONTO_SCHOOL_CONFIG.logoLoaded = true;
        window.PONTO_SCHOOL_CONFIG.logoVersion = version;
      } else {
        window.PONTO_SCHOOL_CONFIG = {
          defaultLogo: versionedLogoUrl,
          logoLoaded: true,
          logoVersion: version
        };
      }

      // Notificar componentes
      document.dispatchEvent(
        new CustomEvent("logoLoaded", { detail: versionedLogoUrl })
      );

      // Realizar preload via Image para garantir cache no navegador
      const img = new Image();
      img.src = versionedLogoUrl;
      img.fetchPriority = "high";
      img.crossOrigin = "anonymous";

      img.onload = () => {
        console.log("LogoPreloader: Logo carregada com sucesso:", versionedLogoUrl);
      };

      img.onerror = () => {
        console.warn("LogoPreloader: Erro ao carregar logo, tentando novamente");
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 500);
        }
      };
    };

    // Executar imediatamente ao montar o componente
    preloadLogo();

    // Adicionar um listener para eventos de carregamento da página
    window.addEventListener("load", preloadLogo);

    return () => {
      window.removeEventListener("load", preloadLogo);
    };
  }, [retryCount]);

  return null;
}