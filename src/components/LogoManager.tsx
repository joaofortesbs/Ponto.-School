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

export function LogoManager() {
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    // Initialize logo configuration
    initLogoConfig();

    // Função para garantir que a logo esteja disponível
    const ensureLogoAvailability = async () => {
      // Usar a versão base64 como fallback garantido
      const fallbackLogo = PONTO_SCHOOL_LOGO_BASE64;

      try {
        // Verificar se a logo já está no localStorage
        const savedLogo = localStorage.getItem("pontoSchoolLogo");
        const currentVersion = getLogoVersion();

        if (savedLogo && savedLogo !== "null" && savedLogo !== "undefined") {
          console.log("Logo encontrada no localStorage");
          // Ensure the URL has the current version
          const versionedUrl = getVersionedLogoUrl(savedLogo, currentVersion);

          window.PONTO_SCHOOL_CONFIG = {
            defaultLogo: versionedUrl,
            logoLoaded: true,
            logoVersion: currentVersion,
          };
          setLogoLoaded(true);
          document.dispatchEvent(
            new CustomEvent("logoLoaded", { detail: versionedUrl }),
          );
          return;
        }

        // Tentar buscar a logo do Supabase
        const { data, error } = await supabase
          .from("platform_settings")
          .select("logo_url, logo_version")
          .single();

        if (data && data.logo_url) {
          console.log("Logo encontrada no Supabase");
          const logoVersion = data.logo_version || 1;
          const versionedUrl = getVersionedLogoUrl(data.logo_url, logoVersion);

          // Save to localStorage with version
          saveLogoToLocalStorage(data.logo_url, logoVersion);

          window.PONTO_SCHOOL_CONFIG = {
            defaultLogo: versionedUrl,
            logoLoaded: true,
            logoVersion: logoVersion,
          };
          setLogoLoaded(true);
          document.dispatchEvent(
            new CustomEvent("logoLoaded", { detail: versionedUrl }),
          );
          return;
        }

        // Se não encontrou no Supabase, usar a logo padrão
        console.log("Usando logo padrão");
        saveLogoToLocalStorage(DEFAULT_LOGO, 1);

        window.PONTO_SCHOOL_CONFIG = {
          defaultLogo: DEFAULT_LOGO,
          logoLoaded: true,
          logoVersion: 1,
        };
        setLogoLoaded(true);
        document.dispatchEvent(
          new CustomEvent("logoLoaded", { detail: DEFAULT_LOGO }),
        );

        // Salvar a logo padrão no Supabase para uso futuro
        await supabase
          .from("platform_settings")
          .upsert(
            { id: 1, logo_url: DEFAULT_LOGO, logo_version: 1 },
            { onConflict: "id" },
          );
      } catch (e) {
        console.error("Erro ao carregar logo:", e);
        // Em caso de erro, usar a versão base64 como fallback garantido
        saveLogoToLocalStorage(fallbackLogo, 1);

        window.PONTO_SCHOOL_CONFIG = {
          defaultLogo: fallbackLogo,
          logoLoaded: true,
          logoVersion: 1,
        };
        setLogoLoaded(true);
        document.dispatchEvent(
          new CustomEvent("logoLoaded", { detail: fallbackLogo }),
        );
      }
    };

    // Executar imediatamente
    ensureLogoAvailability();

    // Adicionar listener para o evento de carregamento da página
    window.addEventListener("load", ensureLogoAvailability);

    // Adicionar listener para o evento de erro de carregamento da logo
    const handleLogoError = () => {
      console.log("Erro ao carregar logo, tentando novamente");
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
