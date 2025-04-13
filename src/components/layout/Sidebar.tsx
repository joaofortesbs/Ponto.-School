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
    // Definir o caminho da imagem enviada pelo usuário
    const fixedLogoPath = "/images/ponto-school-logo.png";
    
    // Fazer uma pré-carga da imagem para garantir disponibilidade
    const preloadImg = new Image();
    preloadImg.src = fixedLogoPath;
    preloadImg.fetchPriority = "high";
    preloadImg.crossOrigin = "anonymous";
    
    // Atualizar a configuração global
    if (window.PONTO_SCHOOL_CONFIG) {
      window.PONTO_SCHOOL_CONFIG.defaultLogo = fixedLogoPath;
      window.PONTO_SCHOOL_CONFIG.logoLoaded = true;
    }
    
    // Atualizar o localStorage
    try {
      localStorage.setItem("sidebarCustomLogo", fixedLogoPath);
      localStorage.setItem("pontoSchoolLogo", fixedLogoPath);
      localStorage.setItem("customLogo", fixedLogoPath);
      localStorage.setItem("logoPreloaded", "true");
    } catch (e) {
      console.warn("Erro ao acessar localStorage no Sidebar", e);
    }
    
    // Notificar outros componentes
    document.dispatchEvent(
      new CustomEvent("logoLoaded", { detail: fixedLogoPath })
    );

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
    
    // Definir funções de callback para eventos de logo
    const handleLogoLoaded = (event: any) => {
      console.log("Logo loaded event received in Sidebar", event.detail);
      setCustomLogo(event.detail);
    };
    
    const handleLogoLoadFailed = () => {
      console.log("Logo load failed event received in Sidebar");
      setCustomLogo(null);
    };
    
    // Adicionar os listeners
    document.addEventListener("logoLoaded", handleLogoLoaded);
    document.addEventListener("logoLoadFailed", handleLogoLoadFailed);

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
            <div className="h-16 flex items-center justify-center w-full">
              {customLogo ? (
                <img
                  src={customLogo}
                  alt="Logo Ponto School"
                  className="h-12 w-auto object-contain"
                  loading="eager"
                  fetchpriority="high"
                  onError={(e) => {
                    console.error("Erro ao renderizar logo no Sidebar");
                    // Tentar novamente com um timestamp para evitar cache
                    const fallbackSrc = "/images/ponto-school-logo.png?retry=" + Date.now();
                    e.currentTarget.src = fallbackSrc;
                    setCustomLogo(fallbackSrc);
                  }}
                />
              ) : (
                <img
                  src="/images/ponto-school-logo.png"
                  alt="Logo Ponto School"
                  className="h-12 w-auto object-contain"
                  loading="eager"
                  fetchpriority="high"
                  onError={(e) => {
                    console.error("Erro ao renderizar logo no Sidebar");
                    // Tentar novamente com um timestamp para evitar cache
                    e.currentTarget.src = "/images/ponto-school-logo.png?retry=" + Date.now();
                  }}
                />
              )}
            </div>
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