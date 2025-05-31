
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Home,
  BookOpen,
  Calendar,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Wallet,
  Bot,
  GraduationCap,
  UserCheck,
  Trophy,
  Clock,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navigationItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: BookOpen, label: "Portal", href: "/portal" },
  { icon: Calendar, label: "Agenda", href: "/agenda" },
  { icon: Users, label: "Estudos", href: "/estudos" },
  { icon: MessageSquare, label: "Conexão Expert", href: "/conexao-expert" },
  { icon: BarChart3, label: "Análises", href: "/analises" },
  { icon: Settings, label: "Configurações", href: "/configuracoes" },
  { icon: Wallet, label: "Carteira", href: "/wallet" },
  { icon: Bot, label: "Epictus IA", href: "/epictus-ia" },
  { icon: GraduationCap, label: "Mentor IA", href: "/mentor-ia-2" },
  { icon: BookOpen, label: "Biblioteca", href: "/biblioteca" },
  { icon: UserCheck, label: "Perfil", href: "/profile" },
];

export function SidebarNav({ 
  className, 
  isCollapsed = false,
  onToggleCollapse,
  ...props 
}: SidebarNavProps) {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (profile) {
            setUserProfile(profile);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleNavigate = (href: string) => {
    navigate(href);
  };

  return (
    <div className={cn("flex flex-col h-full", className)} {...props}>
      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1 p-2">
        {navigationItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            size={isCollapsed ? "icon" : "default"}
            className={cn(
              "w-full justify-start text-left font-normal hover:bg-[#FF6B00]/10 hover:text-[#FF6B00] transition-colors",
              isCollapsed && "px-2"
            )}
            onClick={() => handleNavigate(item.href)}
          >
            <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
            {!isCollapsed && <span>{item.label}</span>}
          </Button>
        ))}
      </nav>

      {/* User Info Section */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        {!isCollapsed && (
          <div className="text-center">
            <div className="text-sm font-medium text-[#001427] dark:text-white mb-1">
              👋 Olá, {userProfile?.full_name || userProfile?.username || 'Usuário'}!
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Nível {userProfile?.level || 37}
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
              <div 
                className="bg-[#FF6B00] h-2 rounded-full transition-all duration-300"
                style={{ width: `${userProfile?.xp_progress || 50}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {userProfile?.current_xp || '1.500'} XP / {userProfile?.next_level_xp || '3.000'} XP
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
