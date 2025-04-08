import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PONTO_SCHOOL_LOGO_BASE64 } from "./LogoImageBase64";
import {
  DEFAULT_LOGO,
  getVersionedLogoUrl,
  saveLogoToLocalStorage,
  getLogoVersion,
  preloadLogo,
  initLogoConfig,
} from "@/lib/logo-utils";

// Caminho para a nova logo oficial
const LOGO_OFICIAL_PATH = "/images/logo-oficial.png";

export function LogoManager() {
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    // Initialize logo configuration
    initLogoConfig();

    // Função simplificada para garantir que a logo esteja disponível
    const ensureLogoAvailability = () => {
      // Definir a logo oficial como padrão
      const officialLogo = LOGO_OFICIAL_PATH;
      
      console.log("Usando logo oficial diretamente");
      saveLogoToLocalStorage(officialLogo, 1);

      window.PONTO_SCHOOL_CONFIG = {
        defaultLogo: officialLogo,
        logoLoaded: true,
        logoVersion: 1,
      };
      
      setLogoLoaded(true);
      
      // Despachar o evento logo após definir a configuração
      document.dispatchEvent(
        new CustomEvent("logoLoaded", { detail: officialLogo })
      );
      
      // Tentar salvar no Supabase sem bloquear a interface
      supabase
        .from("platform_settings")
        .upsert(
          { id: 1, logo_url: officialLogo, logo_version: 1 },
          { onConflict: "id" }
        )
        .then(() => console.log("Logo salva no Supabase com sucesso"))
        .catch(err => console.log("Erro ao salvar logo no Supabase:", err));
    };

    // Executar imediatamente
    ensureLogoAvailability();

    // Adicionar listener para o evento de carregamento da página
    window.addEventListener("load", ensureLogoAvailability);

    // Adicionar listener para o evento de erro de carregamento da logo
    const handleLogoError = () => {
      console.log("Erro ao carregar logo, usando a oficial diretamente");
      ensureLogoAvailability();
    };

    document.addEventListener("logoLoadFailed", handleLogoError);

    return () => {
      window.removeEventListener("load", ensureLogoAvailability);
      document.removeEventListener("logoLoadFailed", handleLogoError);
    };
  }, []);

  return null;
}
