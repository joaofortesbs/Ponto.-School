import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Caminho para a logo oficial
const LOGO_OFICIAL_PATH = "/images/logo-oficial.png";

export function LogoManager() {
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    // Função simplificada para garantir que a logo esteja disponível
    const ensureLogoAvailability = () => {
      console.log("Definindo logo oficial");

      // Definir logo no localStorage
      localStorage.setItem("pontoSchoolLogo", LOGO_OFICIAL_PATH);
      localStorage.setItem("customLogo", LOGO_OFICIAL_PATH);
      localStorage.setItem("sidebarCustomLogo", LOGO_OFICIAL_PATH);
      localStorage.setItem("logoVersion", "1");

      // Definir configuração global
      window.PONTO_SCHOOL_CONFIG = {
        defaultLogo: LOGO_OFICIAL_PATH,
        logoLoaded: true,
        logoVersion: 1,
      };

      setLogoLoaded(true);

      // Notificar outros componentes
      document.dispatchEvent(
        new CustomEvent("logoLoaded", { detail: LOGO_OFICIAL_PATH })
      );

      // Tentar salvar no Supabase sem bloquear a interface
      try {
        supabase
          .from("platform_settings")
          .upsert(
            { id: 1, logo_url: LOGO_OFICIAL_PATH, logo_version: 1 },
            { onConflict: "id" }
          )
          .then(() => console.log("Logo salva no Supabase com sucesso"))
          .catch(err => console.log("Erro ao salvar logo no Supabase:", err));
      } catch (error) {
        console.error("Erro ao atualizar configurações de logo:", error);
      }
    };

    // Executar imediatamente
    ensureLogoAvailability();

    // Pré-carregar a imagem para garantir disponibilidade
    const preloadImage = new Image();
    preloadImage.src = LOGO_OFICIAL_PATH;
    preloadImage.onload = () => console.log("Logo pré-carregada com sucesso");
    preloadImage.onerror = () => console.error("Erro ao pré-carregar logo");

    return () => {
      // Cleanup se necessário
    };
  }, []);

  return null;
}