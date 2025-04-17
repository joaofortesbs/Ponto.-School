import { cn } from "@/lib/utils";
import { SidebarNav } from "@/components/sidebar/SidebarNav";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { profileService } from "@/services/profileService";
import { UserProfile } from "@/types/user-profile";
import { Brain, MessageSquare } from "lucide-react"; // Import missing icons

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  className,
  isCollapsed = false,
  onToggleCollapse,
  ...props
}: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isCollapsed);
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Obter a imagem padrão da configuração global ou usar o valor padrão
    const defaultLogo =
      window.PONTO_SCHOOL_CONFIG?.defaultLogo ||
      "/images/ponto-school-logo.png";

    // Definir logo imediatamente para evitar atraso na renderização
    setCustomLogo(defaultLogo);

    // Função para carregar e configurar a logo
    const loadAndConfigureLogo = (logoUrl = null) => {
      try {
        // Se recebemos uma URL específica do evento, usá-la
        if (logoUrl) {
          setCustomLogo(logoUrl);
          return;
        }

        // Verificar primeiro a logo específica da Ponto School
        const pontoSchoolLogo = localStorage.getItem("pontoSchoolLogo");
        if (
          pontoSchoolLogo &&
          pontoSchoolLogo !== "null" &&
          pontoSchoolLogo !== "undefined"
        ) {
          setCustomLogo(pontoSchoolLogo);
          if (window.PONTO_SCHOOL_CONFIG) {
            window.PONTO_SCHOOL_CONFIG.logoLoaded = true;
            window.PONTO_SCHOOL_CONFIG.defaultLogo = pontoSchoolLogo;
          }
          return;
        }

        // Verificar se já existe uma logo personalizada no localStorage
        const savedLogo = localStorage.getItem("sidebarCustomLogo");
        if (savedLogo && savedLogo !== "null" && savedLogo !== "undefined") {
          setCustomLogo(savedLogo);
          if (window.PONTO_SCHOOL_CONFIG) {
            window.PONTO_SCHOOL_CONFIG.logoLoaded = true;
          }
        } else {
          // Se não existir, usar a logo padrão e salvar no localStorage
          setCustomLogo(defaultLogo);
          localStorage.setItem("sidebarCustomLogo", defaultLogo);
          localStorage.setItem("pontoSchoolLogo", defaultLogo);
          localStorage.setItem("logoPreloaded", "true");
        }
      } catch (e) {
        console.warn("Erro ao acessar localStorage no Sidebar", e);
        // Usar a logo padrão mesmo se não conseguir acessar o localStorage
        setCustomLogo(defaultLogo);
      }
    };

    // Pré-carregar a imagem com alta prioridade para garantir que esteja disponível
    const preloadImg = new Image();
    preloadImg.src = defaultLogo;
    preloadImg.fetchPriority = "high";
    preloadImg.crossOrigin = "anonymous";

    preloadImg.onload = () => {
      console.log("Logo carregada com sucesso no Sidebar");
      loadAndConfigureLogo();
      document.dispatchEvent(
        new CustomEvent("logoLoaded", { detail: defaultLogo }),
      );
    };

    // Garantir que a imagem seja carregada mesmo se houver erro
    preloadImg.onerror = () => {
      console.error("Erro ao carregar logo no Sidebar, tentando novamente...");

      // Tentar novamente com um timestamp para evitar cache
      setTimeout(() => {
        const retryImg = new Image();
        retryImg.src = defaultLogo + "?retry=" + Date.now();
        retryImg.fetchPriority = "high";

        retryImg.onload = () => {
          console.log("Logo carregada com sucesso após retry no Sidebar");
          setCustomLogo(retryImg.src);
          localStorage.setItem("sidebarCustomLogo", retryImg.src);
          localStorage.setItem("pontoSchoolLogo", retryImg.src);
          localStorage.setItem("logoPreloaded", "true");
          document.dispatchEvent(
            new CustomEvent("logoLoaded", { detail: retryImg.src }),
          );
        };

        retryImg.onerror = () => {
          console.error("Falha definitiva ao carregar logo no Sidebar");
          // Usar texto como fallback (null indica para usar o texto)
          setCustomLogo(null);
          document.dispatchEvent(new CustomEvent("logoLoadFailed"));
        };
      }, 1000);
    };

    // Verificar se a logo já foi carregada por outro componente
    if (window.PONTO_SCHOOL_CONFIG?.logoLoaded) {
      loadAndConfigureLogo(window.PONTO_SCHOOL_CONFIG.defaultLogo);
    }

    // Adicionar listeners para eventos de carregamento da logo
    const handleLogoLoaded = (event) => {
      console.log("Logo loaded event received in Sidebar", event.detail);
      loadAndConfigureLogo(event.detail);
    };

    const handleLogoLoadFailed = () => {
      console.log("Logo load failed event received in Sidebar");
      setCustomLogo(null);
    };

    document.addEventListener("logoLoaded", handleLogoLoaded);
    document.addEventListener("logoLoadFailed", handleLogoLoadFailed);

    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Carregar perfil do usuário
    const loadUserProfile = async () => {
      const profile = await profileService.getCurrentUserProfile();
      if (profile) {
        setUserProfile(profile);
      }
    };

    loadUserProfile();

    return () => {
      document.removeEventListener("logoLoaded", handleLogoLoaded);
      document.removeEventListener("logoLoadFailed", handleLogoLoadFailed);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    if (onToggleCollapse) {
      onToggleCollapse();
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-40 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden",
          isMobileOpen ? "block" : "hidden",
        )}
        onClick={() => setIsMobileOpen(false)}
      />

      <aside
        className={cn(
          "fixed top-0 left-0 z-30 h-full bg-white dark:bg-[#001427]/90 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out md:relative",
          sidebarCollapsed ? "w-[70px]" : "w-[240px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className,
        )}
        key="sidebar-container" // Added key prop here
        {...props}
      >
        <div className="flex h-[72px] items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 relative">
          <div
            className={cn(
              "flex items-center gap-2 transition-all duration-300",
              sidebarCollapsed ? "opacity-0 w-0" : "opacity-100",
            )}
          >
            {customLogo ? (
              <div className="h-16 flex items-center justify-center w-full">
                <img
                  src={customLogo + "?v=" + Date.now()}
                  alt="Logo Ponto School"
                  className="h-12 w-auto object-contain"
                  loading="eager"
                  fetchpriority="high"
                  onError={(e) => {
                    console.error("Erro ao renderizar logo no Sidebar");
                    // Tentar carregar a logo diretamente do caminho padrão
                    e.currentTarget.src = "/images/ponto-school-logo.png?retry=" + Date.now();
                    
                    // Se ainda falhar, remover a imagem e mostrar o texto
                    e.currentTarget.onerror = () => {
                      // Verificar se o elemento ainda existe antes de acessar style
                      if (e.currentTarget && e.currentTarget.style) {
                        e.currentTarget.style.display = "none";
                      }
                      setCustomLogo(null);
                      document.dispatchEvent(new CustomEvent("logoLoadFailed"));
                    };
                  }}
                />
              </div>
            ) : (
              <>
                <span className="font-bold text-lg text-[#001427] dark:text-white logo-fallback">
                  Ponto<span className="orange">.</span>
                  <span className="blue">School</span>
                </span>
              </>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleToggleCollapse}
            className={cn(
              "h-8 w-8 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20 border-[#FF6B00]/30 transition-all duration-300 absolute shadow-sm hover:shadow-md",
              sidebarCollapsed ? "right-2" : "right-2",
            )}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>
        <SidebarNav
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
          className="p-2"
        />
        {userProfile && (
          <div className="text-sm font-medium mt-4 ml-4">
            {userProfile?.display_name || userProfile?.username || "Usuário"}
          </div>
        )}
      </aside>
    </>
  );
}