import React, { useState, useEffect, useRef } from "react";
import { Bell, Moon, Sun, Search, User, LogOut, Settings, MessageSquare, Wallet, Book, Calendar, HelpCircle, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Link } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { supabase } from "@/lib/supabase";
import { profileService } from "@/services/profileService";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [displayName, setDisplayName] = useState("Usuário");
  const [userInitials, setUserInitials] = useState("U");
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerTextRef = useRef<HTMLDivElement>(null);
  const logoTimeout = useRef<any>(null);

  // Search suggestions
  const searchSuggestions = [
    "Como usar a IA da plataforma?",
    "Como adicionar amigos?",
    "Como ganhar School Points?",
    "Como posso começar os meus estudos de hoje?",
  ];

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    const loadLogo = async () => {
      try {
        // Primeiro, tente carregar do localStorage
        const cachedLogo = localStorage.getItem("schoolLogo");
        if (cachedLogo) {
          console.log("Logo salva no localStorage com sucesso");
          setLogoSrc(cachedLogo);
          setLogoLoaded(true);
          return;
        }

        // Se não encontrou no localStorage, continue com fallback
        setLogoError(true);
        console.log("Erro ao carregar a logo, tentando novamente...");
      } catch (error) {
        console.error("Erro ao carregar logo:", error);
        setLogoError(true);
      }
    };

    loadLogo();

    // Define um timeout para forçar a renderização após um certo tempo
    logoTimeout.current = setTimeout(() => {
      if (!logoLoaded) {
        console.log("Timeout de carregamento atingido. Forçando renderização.");
        setLogoLoaded(true);
      }
    }, 3000);

    return () => {
      if (logoTimeout.current) {
        clearTimeout(logoTimeout.current);
      }
    };
  }, []);

  // Efeito para carregar dados do perfil do usuário
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const displayName = await profileService.getUserDisplayName();
        setDisplayName(displayName);

        // Define as iniciais baseado no nome de exibição
        const nameParts = displayName.split(" ");
        if (nameParts.length > 1) {
          setUserInitials(`${nameParts[0][0]}${nameParts[1][0]}`);
        } else if (nameParts.length === 1 && nameParts[0].length > 0) {
          setUserInitials(nameParts[0][0]);
        } else {
          setUserInitials("U");
        }
      } catch (error) {
        console.error("Erro ao carregar perfil do usuário:", error);
      }
    };

    loadUserProfile();
  }, []);

  useEffect(() => {
    // Manipulador de eventos para logo
    const handleLogoError = () => {
      console.log("Logo load failed event received in Header");
      setLogoError(true);
    };

    window.addEventListener("logo-load-error", handleLogoError);

    return () => {
      window.removeEventListener("logo-load-error", handleLogoError);
    };
  }, []);

  // Efeito de rotação 3D suave no header
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!headerRef.current || !headerTextRef.current) return;

      const { clientX, clientY } = event;
      const { left, top, width, height } = headerRef.current.getBoundingClientRect();

      const x = (clientX - left) / width;
      const y = (clientY - top) / height;

      const rotateX = 2 * (0.5 - y);
      const rotateY = 2 * (x - 0.5);

      headerRef.current.style.transform = `perspective(1000px) rotateX(${rotateX * 0.2}deg) rotateY(${rotateY * 0.2}deg)`;

      if (headerTextRef.current) {
        headerTextRef.current.style.transform = `translateZ(15px) rotateX(${rotateX * 0.8}deg) rotateY(${rotateY * 0.8}deg)`;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleLogout = () => {
    // Implement logout logic here
    console.log("Logging out...");
  }

  return (
    <header className="w-full h-[72px] px-6 bg-white dark:bg-[#0A2540] border-b border-brand-border dark:border-white/10 flex items-center justify-between">
      {/* Hidden audio element for notification sounds */}
      {/* Modern Platform Avatar */}
      <div className="flex items-center">
        <div className="flex items-center mr-4 sm:mr-8">
          <div
            className="hidden sm:flex items-center h-10 profile-3d-container"
            ref={headerRef}
          >
            <span
              className="text-3d text-xl font-semibold tracking-tight profile-3d-element"
              ref={headerTextRef}
            >
              School
              <span className="text-[#FF6B00]">IA</span>
            </span>
          </div>
          <div className="sm:hidden">
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="hidden md:flex relative max-w-md flex-1 mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar na plataforma..."
            className="w-full rounded-full bg-muted/30 dark:bg-white/10 pl-10 pr-4 py-2 text-sm ring-1 ring-inset ring-muted/20 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            onClick={() => setOpen(true)}
            readOnly
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput
            placeholder="Digite o que você procura..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            <CommandGroup heading="Sugestões">
              {searchSuggestions.map((suggestion) => (
                <CommandItem
                  key={suggestion}
                  onSelect={() => {
                    setSearchValue(suggestion);
                    // Implement actual search action
                    setOpen(false);
                  }}
                >
                  <Search className="mr-2 h-4 w-4" />
                  {suggestion}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Ir para">
              <CommandItem
                onSelect={() => {
                  // Navigate to dashboard
                  setOpen(false);
                }}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Dashboard
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  // Navigate to messages
                  setOpen(false);
                }}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Mensagens
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  // Navigate to wallet
                  setOpen(false);
                }}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Carteira
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  // Navigate to library
                  setOpen(false);
                }}
              >
                <Book className="mr-2 h-4 w-4" />
                Biblioteca
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>

      {/* Right Section: Theme, Notifications, Profile */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle Theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="relative"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Help */}
        <Button variant="ghost" size="icon" className="relative">
          <HelpCircle className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#FF6B00]"></span>
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full"
            >
              <Avatar className="h-9 w-9 transition-opacity hover:opacity-80">
                <AvatarImage
                  src="/avatar.png"
                  alt={displayName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-[#FF6B00]/10 text-[#FF6B00] text-sm">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  usuário@exemplo.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/wallet" className="cursor-pointer">
                <Wallet className="mr-2 h-4 w-4" />
                <span>Carteira</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/configuracoes" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-500 hover:text-red-500 focus:text-red-500"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}