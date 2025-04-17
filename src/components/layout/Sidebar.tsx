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
            <div className="h-16 flex items-center justify-center w-full overflow-hidden">
              <img
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVQAAACACAYAAABUSpE4AAAAAXNSR0IB2cksfwAAIABJREFUeJzsfXmcHNV17nfOrep9umef0WjfQQJJ7GswxkuM18RGfgEvcbwvIQmLwX7GL504LwHbD68xmCR4i2PHMrHh2WBjMBgHsBEYJBACbWjXjGbt6b2r7jnvj6oeCdAyGiRmxOvv92up9VN31a3bVeeee853vgM00EADDTTQQAMNNNBAAw000EADDTTQQAMNNNBAAw000EADDTTQQAMNNNBAAw000EADDTTQQAMNNNBAAw000EADDTTQQAMNNNBAAw000EADDTTQQAMTTEHQZA+ggWOLb75l3qy8+B2zEtufeOcq2Mk eTwMNvJLBczs7l032IBo4Nvj+ZbNa3Cj/6+JZ8f8uY/qZkz2eBhp4pYNdI2dP9iAaODZIiptKOTKtM0Exttox2eNpoIFX OhhKkckexFSAAqRZ8I9WwmgWrK+AcIixVTFWLKoibNmf7PE00MArHQ6pOpM9iJcTClDf1V2J3nJpel54VrmG+b7K3Nt9bj JbtKk5QdH/uwFFvYxKt4OHXZaNmQhvTCWxI902NDA3i8pkX8MRwSqpp9yInjbQwLGHA9JXvIeqK2GenZvo6i+as+5U/HHG K57XkZI57cZPOQBYFSQECAEKiBAggFrAt4SaBUbyZmjT3uatP3w7P5qJ0C+6m+3jke6R3UuzqE329R0MUiVVFwIoDPk62e NpoIFXOhwResU+aM9lEestpM6+y+MPzYh6r1nY7HUlWKECiE8QHyAhUSEFhZwHBSh8rwwYgKIMThtpnR3XVrV0ar5GH+4b4sLGnW0P/fTtuHl22t53yrdHRib7el8IjirBV0AU1jv+QxgNNDDV4QQm5JWFbf+UaXluUC7ZXpUPzu3yTz/BUTYKqA8RI YUGNpMJDALv/109MJdMAEA0WHxSLijVJKk5SX19oYrXbx0221a9sfVbs9O49cwfDu142S70MIhWST2XQAwY95X3OzfQwFS Dw6xmsgdxtKDfhHv/ttQ7Rqj2v0+fb+exEqwFSGBhQcDzjecR4PnfC0yTMKBNLmhZxs4WQXZ7wfzVbW9o/+qCjspNy79X2 HsULuklwXeESUBQgO0rdyfSQANTBa+YhNTGz0fnP9hnbjxhpvfWtCsQS1Z9gAmkwLFYNHg/T1YIpLMT0tod1ezWoehHf/7GWLZrxsCtp98C7xice9xQMKkCyjrRxaSBBrAuuzQCIAIA5Wmx6ukfeWxS7+upCud4z/6qgh7++/iflCP4xoouv5sEAksg wCgdJqBx9KKKHJ5KogxdlJLusoeb1z7X9tpHV8pVp68a3n7UznQEiBrSii9QX6G2seVv4Mjx5GfOmLlhxPvjP/Tqa2Lx5l nslSi/q7Lr+x879Vfzu9w7z87+fudkj3Eq4bj2UDUL56EvJD61aI73uaQxhi/+BFWwYZZJCD5E0/oe4NAYq58IA2D+hR1dld4bAC4LD85I4apLbc7Ut7W9laYtN+rMczyCAnO4PhtZOc/5498pxCYMfmKq0PffC5/nnQDzLIIIMsgggwwyyCCDDDLIIIMMMsgggwwyyCCDDDLIIIMMMsgggwwyyCCDDDLIIIMMMsgggwwyyCCDDJICcf/B0gGlMim6KvqAAAAAElFTkSuQmCC"
                alt="Logo Ponto School"
                className="h-auto w-auto max-h-12 max-w-full object-contain"
                loading="eager"
                fetchpriority="high"
              />
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