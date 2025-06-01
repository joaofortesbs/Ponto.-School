import { cn } from "@/lib/utils";
import { SidebarNav } from "@/components/sidebar/SidebarNav";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Obter a imagem padrão da configuração global ou usar o valor padrão
    const defaultLogo =
      window.PONTO_SCHOOL_CONFIG?.defaultLogo ||
      "/images/ponto-school-logo.png";

    setCustomLogo(defaultLogo);

    const loadAndConfigureLogo = (logoUrl = null) => {
      try {
        if (logoUrl) {
          setCustomLogo(logoUrl);
          return;
        }

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

        const savedLogo = localStorage.getItem("sidebarCustomLogo");
        if (savedLogo && savedLogo !== "null" && savedLogo !== "undefined") {
          setCustomLogo(savedLogo);
          if (window.PONTO_SCHOOL_CONFIG) {
            window.PONTO_SCHOOL_CONFIG.logoLoaded = true;
          }
        } else {
          setCustomLogo(defaultLogo);
          localStorage.setItem("sidebarCustomLogo", defaultLogo);
          localStorage.setItem("pontoSchoolLogo", defaultLogo);
          localStorage.setItem("logoPreloaded", "true");
        }
      } catch (e) {
        console.warn("Erro ao acessar localStorage no Sidebar", e);
        setCustomLogo(defaultLogo);
      }
    };

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

    preloadImg.onerror = () => {
      console.error("Erro ao carregar logo no Sidebar, tentando novamente...");

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
          setCustomLogo(null);
          document.dispatchEvent(new CustomEvent("logoLoadFailed"));
        };
      }, 1000);
    };

    if (window.PONTO_SCHOOL_CONFIG?.logoLoaded) {
      loadAndConfigureLogo(window.PONTO_SCHOOL_CONFIG.defaultLogo);
    }

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
        key="sidebar-container"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* Header Section with Logo */}
        <div className="flex h-[72px] items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 relative">
          <div
            className={cn(
              "flex items-center justify-center w-full transition-all duration-300",
              sidebarCollapsed ? "opacity-100" : "opacity-100",
            )}
          >
            <div className="h-16 flex items-center justify-center w-full">
              <img
                src={sidebarCollapsed ? "/lovable-uploads/6c3ba385-d8cf-41ec-a21d-6b59107a234b.png" : "/lovable-uploads/9db37eca-4284-4678-97fd-984c12eb0f30.png"}
                alt="Logo Ponto School"
                className={cn(
                  "object-contain mx-auto transition-all duration-300",
                  sidebarCollapsed ? "h-14 w-14" : "h-16 w-auto"
                )}
                loading="eager"
                fetchpriority="high"
                onError={(e) => {
                  console.error("Erro ao renderizar logo no Sidebar");
                  // Fallback para o texto caso a imagem falhe
                  e.currentTarget.style.display = "none";
                  const fallbackText = document.createElement("span");
                  fallbackText.className = "font-bold text-lg text-[#001427] dark:text-white logo-fallback mx-auto";
                  fallbackText.innerHTML = 'Ponto<span class="text-[#FF6B00]">.</span><span class="text-[#29335C]">School</span>';
                  e.currentTarget.parentNode?.appendChild(fallbackText);
                }}
              />
            </div>
          </div>
        </div>

        {/* Seção de Perfil e Progresso */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {(userProfile?.display_name || localStorage.getItem('userFirstName') || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {userProfile?.display_name || localStorage.getItem('userFirstName') || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {userProfile?.plan_type || 'Plano Básico'}
              </p>
            </div></div>
          </div>

          {/* Nível e XP */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Nível {userProfile?.level || 1}
              </span>
              <span className="text-xs text-[#FF6B00] font-medium">
                {(() => {
                  const currentXP = userProfile?.experience_points || 0;
                  const currentLevel = userProfile?.level || 1;
                  const xpForCurrentLevel = currentLevel * 100; // 100 XP por nível
                  return `${currentXP}/${xpForCurrentLevel} XP`;
                })()}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] h-2 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${(() => {
                    const currentXP = userProfile?.experience_points || 0;
                    const currentLevel = userProfile?.level || 1;
                    const xpForCurrentLevel = currentLevel * 100; // 100 XP por nível
                    const previousLevelXP = (currentLevel - 1) * 100;
                    const xpInCurrentLevel = currentXP - previousLevelXP;
                    const xpNeededForLevel = xpForCurrentLevel - previousLevelXP;

                    // Para novos usuários (nível 1 com 0 XP), mostrar 0%
                    if (currentLevel === 1 && currentXP === 0) return 0;

                    return xpNeededForLevel > 0 ? Math.min(Math.round((xpInCurrentLevel / xpNeededForLevel) * 100), 100) : 0;
                  })()}%` 
                }}
              ></div>
            </div>
            {/* Texto motivacional para novos usuários */}
            {(userProfile?.level || 1) === 1 && (userProfile?.experience_points || 0) === 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                Complete atividades para ganhar XP!
              </p>
            )}
          </div>
        </div>

        <div className="relative">
          <SidebarNav
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={handleToggleCollapse}
            className={cn(
              "p-2",
              sidebarCollapsed ? "pt-8" : "pt-4"
            )}
          />

          {/* Toggle Button - positioned next to profile image area but more to the corner */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleToggleCollapse}
            className={cn(
              "h-6 w-6 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20 border-[#FF6B00]/30 transition-all duration-300 absolute top-[80px] right-1 shadow-sm hover:shadow-md z-10",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}