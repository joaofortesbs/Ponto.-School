import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  MessageCircle,
  Bell,
  Search,
  ChevronDown,
  Settings,
  LogOut,
  User,
  HelpCircle,
  Diamond,
  ChevronLeft,
  ChevronRight,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { profileService } from "@/services/profileService";
import { UserProfile } from "@/types/user-profile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await profileService.getCurrentUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();

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
          setIsLoading(false);
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
          setIsLoading(false);
          if (window.PONTO_SCHOOL_CONFIG) {
            window.PONTO_SCHOOL_CONFIG.logoLoaded = true;
            window.PONTO_SCHOOL_CONFIG.defaultLogo = pontoSchoolLogo;
          }
          return;
        }

        // Verificar se já existe uma logo personalizada no localStorage
        const savedLogo = localStorage.getItem("customLogo");
        if (savedLogo && savedLogo !== "null" && savedLogo !== "undefined") {
          setCustomLogo(savedLogo);
          setIsLoading(false);
          if (window.PONTO_SCHOOL_CONFIG) {
            window.PONTO_SCHOOL_CONFIG.logoLoaded = true;
          }
        } else {
          // Se não existir, usar a logo padrão e salvar no localStorage
          setCustomLogo(defaultLogo);
          localStorage.setItem("customLogo", defaultLogo);
          localStorage.setItem("pontoSchoolLogo", defaultLogo);
          localStorage.setItem("logoPreloaded", "true");
          setIsLoading(false);
        }
      } catch (e) {
        console.warn("Erro ao acessar localStorage no Header", e);
        // Usar a logo padrão mesmo se não conseguir acessar o localStorage
        setCustomLogo(defaultLogo);
        setIsLoading(false);
      }
    };

    // Pré-carregar a imagem com alta prioridade para garantir que esteja disponível
    const preloadImg = new Image();
    preloadImg.src = defaultLogo;
    preloadImg.fetchPriority = "high";
    preloadImg.crossOrigin = "anonymous";

    preloadImg.onload = () => {
      // Garantir que a imagem está carregada antes de usar
      console.log("Logo carregada com sucesso no Header");
      loadAndConfigureLogo();
      document.dispatchEvent(
        new CustomEvent("logoLoaded", { detail: defaultLogo }),
      );
    };

    // Garantir que a imagem seja carregada mesmo se houver erro
    preloadImg.onerror = () => {
      console.error("Erro ao carregar logo no Header, tentando novamente...");

      // Tentar novamente com um timestamp para evitar cache
      setTimeout(() => {
        const retryImg = new Image();
        retryImg.src = defaultLogo + "?retry=" + Date.now();
        retryImg.fetchPriority = "high";

        retryImg.onload = () => {
          console.log("Logo carregada com sucesso após retry no Header");
          setCustomLogo(retryImg.src);
          localStorage.setItem("customLogo", retryImg.src);
          localStorage.setItem("pontoSchoolLogo", retryImg.src);
          localStorage.setItem("logoPreloaded", "true");
          setIsLoading(false);
          document.dispatchEvent(
            new CustomEvent("logoLoaded", { detail: retryImg.src }),
          );
        };

        retryImg.onerror = () => {
          console.error("Falha definitiva ao carregar logo no Header");
          // Usar texto como fallback (null indica para usar o texto)
          setCustomLogo(null);
          setIsLoading(false);
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
      console.log("Logo loaded event received in Header", event.detail);
      loadAndConfigureLogo(event.detail);
    };

    const handleLogoLoadFailed = () => {
      console.log("Logo load failed event received in Header");
      setCustomLogo(null);
      setIsLoading(false);
    };

    document.addEventListener("logoLoaded", handleLogoLoaded);
    document.addEventListener("logoLoadFailed", handleLogoLoadFailed);

    return () => {
      document.removeEventListener("logoLoaded", handleLogoLoaded);
      document.removeEventListener("logoLoadFailed", handleLogoLoadFailed);
    };
  }, []);

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;

        try {
          // Get current version from Supabase
          const { data, error } = await supabase
            .from("platform_settings")
            .select("logo_version")
            .single();

          // Increment version
          const newVersion = (data?.logo_version || 1) + 1;

          // Update logo in Supabase with new version
          await supabase.from("platform_settings").upsert(
            {
              id: 1,
              logo_url: result,
              logo_version: newVersion,
            },
            { onConflict: "id" },
          );

          // Import dynamically to avoid circular dependencies
          const { getVersionedLogoUrl, saveLogoToLocalStorage } = await import(
            "@/lib/logo-utils"
          );

          // Save to localStorage with new version
          saveLogoToLocalStorage(result, newVersion);

          // Update UI
          const versionedUrl = getVersionedLogoUrl(result, newVersion);
          setCustomLogo(versionedUrl);

          // Notify other components
          document.dispatchEvent(
            new CustomEvent("logoLoaded", { detail: versionedUrl }),
          );

          setIsLogoDialogOpen(false);
        } catch (error) {
          console.error("Error updating logo:", error);
          // Still update locally even if Supabase update fails
          setCustomLogo(result);
          localStorage.setItem("customLogo", result);
          setIsLogoDialogOpen(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const resetLogo = async () => {
    try {
      // Import dynamically to avoid circular dependencies
      const { DEFAULT_LOGO } = await import("@/lib/logo-utils");

      // Get current version from Supabase
      const { data, error } = await supabase
        .from("platform_settings")
        .select("logo_version")
        .single();

      // Increment version
      const newVersion = (data?.logo_version || 1) + 1;

      // Update logo in Supabase with default logo and new version
      await supabase.from("platform_settings").upsert(
        {
          id: 1,
          logo_url: DEFAULT_LOGO,
          logo_version: newVersion,
        },
        { onConflict: "id" },
      );

      // Clear localStorage
      localStorage.removeItem("customLogo");
      localStorage.removeItem("pontoSchoolLogo");
      localStorage.removeItem("sidebarCustomLogo");
      localStorage.setItem("logoVersion", newVersion.toString());

      // Update UI
      setCustomLogo(null);

      // Notify other components
      document.dispatchEvent(
        new CustomEvent("logoLoaded", { detail: DEFAULT_LOGO }),
      );

      setIsLogoDialogOpen(false);
    } catch (error) {
      console.error("Error resetting logo:", error);
      // Still reset locally even if Supabase update fails
      setCustomLogo(null);
      localStorage.removeItem("customLogo");
      setIsLogoDialogOpen(false);
    }
  };

  return (
    <header className="w-full h-[72px] px-6 bg-white dark:bg-[#0A2540] border-b border-brand-border dark:border-white/10 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center">
        <Dialog open={isLogoDialogOpen} onOpenChange={setIsLogoDialogOpen}>
          <DialogTrigger asChild>
            <div className="flex items-baseline cursor-pointer group relative">
              {customLogo ? (
                <div className="h-10 flex items-center">
                  <img
                    src={customLogo}
                    alt="Logo Ponto School"
                    className="h-8 object-contain"
                    loading="eager"
                    fetchpriority="high"
                    onError={(e) => {
                      console.error("Erro ao renderizar logo no Header");
                      // Tentar carregar a logo do localStorage
                      const savedLogo = localStorage.getItem("pontoSchoolLogo");
                      if (
                        savedLogo &&
                        savedLogo !== "null" &&
                        savedLogo !== "undefined"
                      ) {
                        e.currentTarget.src =
                          savedLogo + "?retry=" + Date.now();
                      } else {
                        // Tentar carregar a logo padrão com timestamp para evitar cache
                        e.currentTarget.src =
                          "/images/ponto-school-logo.png?retry=" + Date.now();
                      }
                      // Se ainda falhar, remover a imagem e mostrar o texto
                      e.currentTarget.onerror = () => {
                        // Verificar se o elemento ainda existe antes de acessar style
                        if (e.currentTarget && e.currentTarget.style) {
                          e.currentTarget.style.display = "none";
                        }
                        setCustomLogo(null);
                        document.dispatchEvent(
                          new CustomEvent("logoLoadFailed"),
                        );
                      };
                    }}
                  />
                </div>
              ) : (
                <span className="text-2xl font-bold text-brand-black dark:text-white text-glow tracking-wider logo-fallback">
                  Ponto
                  <span className="text-[#FF6B00] text-3xl orange">.</span>
                  <span className="text-[#0D00F5] dark:text-white blue">
                    School
                  </span>
                </span>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 rounded transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <ImageIcon className="w-4 h-4 text-brand-black/70 dark:text-white/70" />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Alterar Logo</DialogTitle>
              <DialogDescription>
                Faça upload de uma imagem para substituir a logo atual.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center gap-4 py-4">
              {customLogo && (
                <div className="border rounded-md p-2 w-full max-w-[300px] flex justify-center">
                  <img
                    src={customLogo}
                    alt="Logo atual"
                    className="h-16 object-contain"
                  />
                </div>
              )}
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                />
                <Button
                  type="button"
                  onClick={triggerFileInput}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Escolher Imagem
                </Button>
              </div>
            </div>
            <DialogFooter className="sm:justify-between">
              {customLogo && (
                <Button variant="destructive" type="button" onClick={resetLogo}>
                  Restaurar Logo Original
                </Button>
              )}
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Fechar
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-muted dark:text-white/40 h-5 w-5" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="w-full pl-10 pr-4 glass-input border-brand-border dark:border-white/10 text-brand-black dark:text-white placeholder:text-brand-muted dark:placeholder:text-white/40 focus:bg-white dark:focus:bg-white/10 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg focus:shadow-brand-primary/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-6 ml-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-brand-card dark:hover:bg-white/5"
                aria-label="Shopping Cart"
                onClick={() => navigate("/mercado")}
              >
                <ShoppingCart className="h-5 w-5 text-brand-black dark:text-white" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#FF6B00] text-white text-xs rounded-full">
                  3
                </Badge>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Carrinho</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-brand-card dark:hover:bg-white/5"
                aria-label="Messages"
              >
                <MessageCircle className="h-5 w-5 text-brand-black dark:text-white" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#FF6B00] text-white text-xs rounded-full">
                  5
                </Badge>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Mensagens</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-brand-card dark:hover:bg-white/5"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-brand-black dark:text-white" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#FF6B00] text-white text-xs rounded-full">
                  2
                </Badge>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notificações</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <ThemeToggle />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-12 hover:bg-brand-card dark:hover:bg-white/5 flex items-center gap-3 px-3 group transition-all duration-300"
                  >
                    <Avatar className="h-9 w-9 border-2 border-transparent group-hover:border-[#FF6B00] transition-all duration-300">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.username || "user"}`}
                        alt={
                          userProfile?.display_name ||
                          userProfile?.full_name ||
                          userProfile?.username ||
                          "Usuário"
                        }
                      />
                      <AvatarFallback>
                        {userProfile?.display_name?.substring(0, 2) ||
                          userProfile?.full_name?.substring(0, 2) ||
                          userProfile?.username?.substring(0, 2) ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold text-brand-black dark:text-white">
                        {isLoading
                          ? "Carregando..."
                          : userProfile?.display_name ||
                            userProfile?.username ||
                            userProfile?.full_name ||
                            "Usuário"}
                      </span>
                      <div className="flex items-center gap-1">
                        <Diamond className="h-3 w-3 text-[#FF6B00]" />
                        <span className="text-xs text-[#FF6B00]">Premium</span>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-brand-muted dark:text-white/40 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/configuracoes")}
                    className="cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Ajuda
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate("/login")}
                    className="text-red-600 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                Conta Premium
                <br />
                Acesso a todos os recursos
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
}
