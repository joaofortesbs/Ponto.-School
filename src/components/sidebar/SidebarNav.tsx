import { useEffect, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  BookMarked,
  CalendarDays,
  Users,
  LayoutDashboard,
  Home,
  Briefcase,
  Lightbulb,
  BookOpen,
  Library,
  Bot,
  MessageSquare,
  Award,
  NotebookPen,
  FolderKanban,
  BrainCircuit,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { profileService } from "@/services/profileService";

const menuItems = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    to: "/dashboard",
  },
  {
    label: "Agenda",
    icon: <CalendarDays className="h-5 w-5" />,
    to: "/agenda",
  },
  // outros itens de menu
];

interface SidebarNavProps {
  className?: string;
}

export function SidebarNav({ className }: SidebarNavProps) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("Usuário");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Handler para eventos de atualização
  const handleAvatarUpdate = (event: CustomEvent) => {
    if (event.detail && event.detail.url) {
      setAvatarUrl(event.detail.url);
    }
  };

  const handleNameUpdate = (event: CustomEvent) => {
    if (event.detail && event.detail.firstName) {
      setFirstName(event.detail.firstName);
      console.log("Nome atualizado via evento:", event.detail.firstName);
    }
  };

  useEffect(() => {
    // Verificar imediatamente se já temos o nome no localStorage (para carregamento instantâneo)
    const storedFirstName = localStorage.getItem('userFirstName');
    if (storedFirstName) {
      setFirstName(storedFirstName);
      console.log("Nome do usuário carregado do localStorage:", storedFirstName);
    }

    // Carregar avatar se disponível
    const storedAvatarUrl = localStorage.getItem('userAvatarUrl');
    if (storedAvatarUrl) {
      setAvatarUrl(storedAvatarUrl);
    }

    // Adicionar os listeners
    document.addEventListener('userAvatarUpdated', handleAvatarUpdate as EventListener);
    document.addEventListener('userFirstNameUpdated', handleNameUpdate as EventListener);

    // Remover os listeners quando o componente for desmontado
    return () => {
      document.removeEventListener('userAvatarUpdated', handleAvatarUpdate as EventListener);
      document.removeEventListener('userFirstNameUpdated', handleNameUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Tentar obter perfil por ID do usuário
          let { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

          // Se não encontrar por ID, buscar por email
          if (error || !data) {
            const { data: profileByEmail, error: emailError } = await supabase
              .from("profiles")
              .select("*")
              .eq("email", user.email)
              .single();

            if (!emailError && profileByEmail) {
              data = profileByEmail;
            }
          }

          if (data) {
            // Extrair e salvar o primeiro nome
            let dashboardName = "";

            // Prioridade: display_name > full_name > username
            if (data.display_name) {
              dashboardName = data.display_name;
            } else if (data.full_name) {
              dashboardName = data.full_name.split(" ")[0]; // Pegar o primeiro nome
            } else if (data.username) {
              dashboardName = data.username;
            } else {
              dashboardName = "Usuário";
            }

            setFirstName(dashboardName);

            // Salvar no localStorage para uso rápido em outros componentes
            if (dashboardName && dashboardName !== "Usuário") {
              localStorage.setItem('userFirstName', dashboardName);
              console.log("Nome do usuário atualizado e salvo:", dashboardName);

              // Disparar evento para outros componentes saberem que o nome foi atualizado
              try {
                document.dispatchEvent(new CustomEvent('userFirstNameUpdated', { 
                  detail: { firstName: dashboardName } 
                }));
              } catch (e) {
                console.error("Erro ao disparar evento de atualização de nome:", e);
              }
            }

            // Atualizar avatar
            if (data.avatar_url) {
              setAvatarUrl(data.avatar_url);
              localStorage.setItem('userAvatarUrl', data.avatar_url);
            }
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();

    // Verificar se o profileService pode nos fornecer o nome do usuário de maneira mais confiável
    const loadProfileName = async () => {
      try {
        // Usar o serviço de perfil para obter o nome de exibição
        const displayName = await profileService.getUserDisplayName();
        if (displayName && displayName !== "Usuário") {
          setFirstName(displayName);
          localStorage.setItem('userFirstName', displayName);
          console.log("Nome obtido via profileService:", displayName);
        }
      } catch (e) {
        console.error("Erro ao obter nome via profileService:", e);
      }
    };

    loadProfileName();
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className={cn("flex flex-col h-full", className)}>
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-6">
          <Avatar className="h-10 w-10 border-2 border-[#FF6B00]">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-[#FF6B00] text-white">
              {firstName ? firstName.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium">
              {loading ? "Carregando..." : firstName}
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Estudante
            </p>
          </div>
        </div>

        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant={isActive(item.to) ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-sm font-normal",
                isActive(item.to)
                  ? "bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20 hover:text-[#FF6B00]"
                  : "text-gray-700 dark:text-gray-300 hover:bg-[#FF6B00]/10 hover:text-[#FF6B00]"
              )}
              asChild
            >
              <Link to={item.to}>
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
}