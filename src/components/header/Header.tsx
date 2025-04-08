import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ShoppingCart,
  MessageCircle,
  Bell,
  User,
  Menu,
} from "lucide-react";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function Header() {
  // Atualizar a logo no Supabase ao inicializar o componente
  useEffect(() => {
    const updateLogoInSupabase = async () => {
      try {
        // Verificar se a logo já existe no Supabase
        const { data, error } = await supabase
          .from("platform_settings")
          .select("logo_url, logo_version")
          .single();
        
        // Se não existir ou for diferente, atualizar para a nova logo
        if (!data || data.logo_url !== '/images/logo-oficial.png') {
          const newVersion = (data?.logo_version || 1) + 1;
          // Atualizar logo no Supabase
          await supabase.from("platform_settings").upsert(
            {
              id: 1,
              logo_url: '/images/logo-oficial.png',
              logo_version: newVersion,
            },
            { onConflict: "id" },
          );
          
          // Atualizar logo no localStorage
          localStorage.setItem("pontoSchoolLogo", '/images/logo-oficial.png');
          localStorage.setItem("customLogo", '/images/logo-oficial.png');
          localStorage.setItem("sidebarCustomLogo", '/images/logo-oficial.png');
          localStorage.setItem("logoVersion", newVersion.toString());
          
          // Notificar outros componentes da alteração
          document.dispatchEvent(
            new CustomEvent("logoLoaded", { detail: '/images/logo-oficial.png' }),
          );
        }
      } catch (error) {
        console.error("Erro ao atualizar logo:", error);
      }
    };
    
    updateLogoInSupabase();
  }, []);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white dark:bg-[#001427] px-4 md:px-6">
      <div className="flex md:hidden">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Logo Oficial */}
      <div className="hidden md:flex items-center mr-4">
        <img 
          src="/images/logo-oficial.png" 
          alt="Logo Oficial" 
          className="h-10 w-10"
          onError={(e) => {
            // Fallback em caso de erro no carregamento da imagem
            e.currentTarget.src = "/images/logo-oficial.png?retry=" + Date.now();
          }}
        />
      </div>
      
      <div className="relative hidden md:flex md:flex-1 md:max-w-md lg:max-w-lg">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          className="pl-9 pr-4 focus-visible:ring-[#001427]"
        />
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative hidden md:flex">
          <ShoppingCart className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#001427] p-0 text-xs text-white">
            3
          </Badge>
        </Button>
        <Button variant="ghost" size="icon" className="relative hidden md:flex">
          <MessageCircle className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#001427] p-0 text-xs text-white">
            5
          </Badge>
        </Button>
        <Button variant="ghost" size="icon" className="relative hidden md:flex">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#001427] p-0 text-xs text-white">
            2
          </Badge>
        </Button>
        <Avatar className="h-9 w-9 cursor-pointer">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" />
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
