
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ShoppingCart,
  MessageCircle,
  Bell,
  User,
  Menu,
} from "lucide-react";
import HeaderActions from "./HeaderActions";

export function Header() {
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
        {/* Botões de Adicionar Parceiros e Login Diário */}
        <HeaderActions />
        
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
      </div>
    </header>
  );
}
