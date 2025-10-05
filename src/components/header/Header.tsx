
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  MessageCircle,
  Bell,
  User,
  Menu,
} from "lucide-react";

export function Header() {
  const [userName, setUserName] = useState<string>("Usuário");

  useEffect(() => {
    // Buscar primeiro nome do Neon DB
    const neonUser = localStorage.getItem("neon_user");
    if (neonUser) {
      try {
        const userData = JSON.parse(neonUser);
        const fullName = userData.nome_completo || userData.nome_usuario || userData.email;
        if (fullName) {
          const firstName = fullName.split(" ")[0].split("@")[0];
          setUserName(firstName);
        }
      } catch (error) {
        console.error("Erro ao buscar nome do Neon:", error);
      }
    }

    // Fallback para outros métodos
    if (userName === "Usuário") {
      const storedFirstName = localStorage.getItem("userFirstName");
      if (storedFirstName && storedFirstName !== "Usuário") {
        setUserName(storedFirstName);
      }
    }
  }, []);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white dark:bg-[#001427] px-4 md:px-6">
      <div className="flex md:hidden">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
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
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <User className="h-4 w-4" />
          <span>{userName}</span>
        </div>
      </div>
    </header>
  );
}
