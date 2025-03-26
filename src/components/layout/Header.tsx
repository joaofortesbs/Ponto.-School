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

    // Carregar logo personalizado do localStorage, se existir
    const savedLogo = localStorage.getItem("customLogo");
    if (savedLogo) {
      setCustomLogo(savedLogo);
    }
  }, []);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCustomLogo(result);
        localStorage.setItem("customLogo", result);
        setIsLogoDialogOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const resetLogo = () => {
    setCustomLogo(null);
    localStorage.removeItem("customLogo");
    setIsLogoDialogOpen(false);
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
                    alt="Logo personalizado"
                    className="h-8 object-contain"
                  />
                </div>
              ) : (
                <span className="text-2xl font-bold text-brand-black dark:text-white text-glow tracking-wider">
                  Ponto
                  <span className="text-[#FF6B00] text-3xl">.</span>
                  <span className="text-[#0D00F5] dark:text-white">School</span>
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
