
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import {
  Home,
  Calendar,
  BookOpen,
  Users,
  MessageCircle,
  Settings,
  Trophy,
  Briefcase,
  Heart,
  Star,
  CreditCard,
  Bell,
  Gift,
  Map
} from "lucide-react";

interface SidebarMenuProps {
  isCollapsed: boolean;
  currentPath: string;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ isCollapsed, currentPath }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLightMode = theme === "light";

  const menuItems = [
    {
      icon: Home,
      label: "Dashboard",
      path: "/dashboard",
      color: "#FF6B00"
    },
    {
      icon: Calendar,
      label: "Agenda",
      path: "/agenda",
      color: "#4CAF50"
    },
    {
      icon: BookOpen,
      label: "Portal",
      path: "/portal",
      color: "#2196F3"
    },
    {
      icon: Users,
      label: "Turmas",
      path: "/turmas",
      color: "#9C27B0"
    },
    {
      icon: MessageCircle,
      label: "Epictus IA",
      path: "/epictus-ia",
      color: "#FF9800"
    },
    {
      icon: BookOpen,
      label: "Biblioteca",
      path: "/biblioteca",
      color: "#795548"
    },
    {
      icon: Trophy,
      label: "Conquistas",
      path: "/conquistas",
      color: "#FFC107"
    },
    {
      icon: Briefcase,
      label: "Carteira",
      path: "/carteira",
      color: "#4CAF50"
    },
    {
      icon: Heart,
      label: "Comunidades",
      path: "/comunidades",
      color: "#E91E63"
    },
    {
      icon: Star,
      label: "Novidades",
      path: "/novidades",
      color: "#FF5722"
    },
    {
      icon: CreditCard,
      label: "Mercado",
      path: "/mercado",
      color: "#607D8B"
    },
    {
      icon: Bell,
      label: "Lembretes",
      path: "/lembretes",
      color: "#9E9E9E"
    },
    {
      icon: Gift,
      label: "Login Diário",
      path: "/login-diario",
      color: "#E91E63"
    },
    {
      icon: Map,
      label: "Organização",
      path: "/organizacao",
      color: "#3F51B5"
    },
    {
      icon: Settings,
      label: "Configurações",
      path: "/configuracoes",
      color: "#757575"
    }
  ];

  const handleItemClick = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="py-4">
      <ul className="space-y-1">
        {menuItems.map((item) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;
          
          return (
            <li key={item.path}>
              <button
                onClick={() => handleItemClick(item.path)}
                className={`w-full flex items-center px-4 py-3 text-left transition-all duration-200 group ${
                  isCollapsed ? "justify-center" : "justify-start"
                } ${
                  isActive
                    ? isLightMode
                      ? "bg-orange-50 text-orange-600 border-r-2 border-orange-600"
                      : "bg-orange-600/10 text-orange-400 border-r-2 border-orange-400"
                    : isLightMode
                    ? "text-gray-700 hover:bg-gray-100 hover:text-orange-600"
                    : "text-gray-300 hover:bg-white/5 hover:text-orange-400"
                }`}
              >
                <Icon 
                  className={`${isCollapsed ? "w-5 h-5" : "w-5 h-5 mr-3"} transition-colors ${
                    isActive ? "" : "group-hover:text-orange-500"
                  }`}
                  style={{ 
                    color: isActive ? item.color : undefined 
                  }}
                />
                {!isCollapsed && (
                  <span className="font-medium text-sm truncate">
                    {item.label}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default SidebarMenu;
