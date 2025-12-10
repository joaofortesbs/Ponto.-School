import { cn } from "@/lib/utils";
import { SidebarNav } from "@/components/sidebar/SidebarNav";
import { CardSelecaoPerfilTopoMenu } from "@/components/sidebar/card-selecao-perfil-topo-menu";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";

const SIDEBAR_WIDTH_EXPANDED = 260;
const SIDEBAR_WIDTH_COLLAPSED = 72;
const SIDEBAR_MARGIN_Y = 16;
const SIDEBAR_BORDER_RADIUS = 20;

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
    const defaultLogo =
      window.PONTO_SCHOOL_CONFIG?.defaultLogo ||
      "/images/ponto-school-logo.webp";

    setCustomLogo(defaultLogo);

    const loadAndConfigureLogo = (logoUrl: string | null = null) => {
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

    const handleLogoLoaded = (event: CustomEvent) => {
      console.log("Logo loaded event received in Sidebar", event.detail);
      loadAndConfigureLogo(event.detail);
    };

    const handleLogoLoadFailed = () => {
      console.log("Logo load failed event received in Sidebar");
      setCustomLogo(null);
    };

    document.addEventListener("logoLoaded", handleLogoLoaded as EventListener);
    document.addEventListener("logoLoadFailed", handleLogoLoadFailed);

    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("logoLoaded", handleLogoLoaded as EventListener);
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

      {/* Mobile Sidebar Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden",
          isMobileOpen ? "block" : "hidden",
        )}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Sidebar Container - Container vertical que envolve todo o menu */}
      <div
        className={cn(
          "fixed top-0 left-0 z-30 h-full flex flex-col transition-all duration-300 ease-in-out md:relative",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className,
        )}
        style={{
          width: sidebarCollapsed ? `${SIDEBAR_WIDTH_COLLAPSED}px` : `${SIDEBAR_WIDTH_EXPANDED}px`,
          paddingTop: `${SIDEBAR_MARGIN_Y}px`,
          paddingBottom: `${SIDEBAR_MARGIN_Y}px`,
        }}
        {...props}
      >
        {/* Card do Logo flutuante no topo */}
        <div
          className={cn(
            "flex-shrink-0 transition-all duration-300",
            sidebarCollapsed ? "mb-3" : "mb-4"
          )}
          style={{
            marginLeft: sidebarCollapsed ? '4px' : '0px',
            marginRight: sidebarCollapsed ? '4px' : '8px',
          }}
        >
          <CardSelecaoPerfilTopoMenu
            isCollapsed={sidebarCollapsed}
            customLogo={customLogo}
          />
        </div>

        {/* Card principal do menu lateral */}
        <aside
          className={cn(
            "flex-1 flex flex-col bg-white dark:bg-[#001427]/95 border border-gray-200 dark:border-gray-800/50 transition-all duration-300 ease-in-out overflow-hidden backdrop-blur-sm shadow-lg"
          )}
          style={{
            borderTopRightRadius: `${SIDEBAR_BORDER_RADIUS}px`,
            borderBottomRightRadius: `${SIDEBAR_BORDER_RADIUS}px`,
            borderTopLeftRadius: '0px',
            borderBottomLeftRadius: '0px',
            borderLeft: 'none',
            marginLeft: '0px',
          }}
          key="sidebar-container"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative flex-1 flex flex-col overflow-hidden">
            <SidebarNav
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={handleToggleCollapse}
              className={cn(
                "p-2 flex-1 overflow-y-auto",
                sidebarCollapsed ? "pt-4" : "pt-4"
              )}
            />

            {/* Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleCollapse}
              className={cn(
                "h-6 w-6 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20 border-[#FF6B00]/30 transition-all duration-300 shadow-sm hover:shadow-md z-10 mx-auto",
                sidebarCollapsed
                  ? cn("mb-4", isHovered ? "opacity-100" : "opacity-0")
                  : cn("absolute top-4 right-2", isHovered ? "opacity-100" : "opacity-0")
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
      </div>
    </>
  );
}
