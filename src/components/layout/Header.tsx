
import React, { useState, useEffect } from "react";
import { Bell, Search, Menu, User, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { LogoManager } from "@/components/LogoManager";

export default function Header() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    // Simulação de notificações não lidas
    setUnreadNotifications(3);
  }, []);

  return (
    <header className={`w-full py-2 px-4 border-b ${theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} flex items-center justify-between`}>
      <div className="flex items-center">
        <LogoManager location="Header" className="h-8 w-auto mr-4" />
        <div className="hidden md:flex items-center gap-1">
          {!isSearchOpen ? (
            <Button variant="ghost" size="sm" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <Input 
                className="w-64" 
                placeholder="Pesquisar..." 
                autoFocus 
              />
              <Button variant="ghost" size="sm" onClick={() => setIsSearchOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" className="relative" size="sm">
          <Bell className="h-5 w-5" />
          {unreadNotifications > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
              {unreadNotifications}
            </Badge>
          )}
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
