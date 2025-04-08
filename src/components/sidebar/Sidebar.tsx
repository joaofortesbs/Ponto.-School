import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Bell,
  BookOpen,
  Calendar,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Clock,
  Compass,
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  Library,
  MessageSquare,
  Settings,
  ShoppingCart,
  Star,
  Target,
  Users,
  Wallet,
} from "lucide-react";
import AgendaNav from "./AgendaNav";
import OrganizacaoNav from "./OrganizacaoNav";

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = React.useState<string | null>(
    "dashboard",
  );
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
  const [userName, setUserName] = React.useState("Carregando..."); // Updated to use state for username

  const toggleExpand = (item: string) => {
    setExpandedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const isExpanded = (item: string) => expandedItems.includes(item);

  const handleItemClick = (item: string, path: string) => {
    setActiveItem(item);
    navigate(path);
  };

  // Buscar nome do usuário
  React.useEffect(() => {
    const fetchUserName = async () => {
      try {
        const displayName = await profileService.getUserDisplayName();
        setUserName(displayName);
      } catch (err) {
        console.error("Erro ao buscar nome do usuário:", err);
        setUserName("Usuário");
      }
    };

    fetchUserName();

    // Atualizar o nome quando o status de login mudar
    const handleLoginChange = () => {
      fetchUserName();
    };

    window.addEventListener('login-status-changed', handleLoginChange);

    return () => {
      window.removeEventListener('login-status-changed', handleLoginChange);
    };
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-[#001427] text-white w-64 py-4 px-2",
        className,
      )}
    >
      {/* User Profile */}
      <div className="flex items-center space-x-3 px-4 py-3 mb-6">
        <Avatar className="h-10 w-10 border-2 border-[#FF6B00]">
          <AvatarImage src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAABCnSURBVHgB7d1NbBzXmQbgd6qbTVGiJFKWZcmSLTtOYmfjTTaxkwCZBMgim2AXAXKZzcw5F+Swy2SRU4Bk5xYg2ewtyGFnL0EuswEGAZIgQILEiYPYjhPHlizZlkRKIiVSYv+wWVXz1cdmq7u+qr+q+v6eBwQlqtlqNqve+t73fVUlBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="/>
          <AvatarFallback className="bg-[#FF6B00] text-white">PS</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{userName}</p>
          <div className="flex items-center">
            <Badge className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white text-xs px-1.5 py-0 h-4 rounded">
              Nível 3
            </Badge>
            <span className="text-xs text-gray-400 ml-1.5">Estudante</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-gray-400">Progresso do curso</span>
          <span className="text-xs font-medium text-[#FF6B00]">65%</span>
        </div>
        <Progress value={65} className="h-1.5 bg-[#29335C]/30" />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-sm font-medium h-10 px-3",
            activeItem === "dashboard"
              ? "bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20"
              : "text-gray-300 hover:bg-[#29335C]/30 hover:text-white",
          )}
          onClick={() => handleItemClick("dashboard", "/dashboard")}
        >
          <Home className="h-4 w-4 mr-3" />
          Início
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-sm font-medium h-10 px-3",
            activeItem === "turmas"
              ? "bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20"
              : "text-gray-300 hover:bg-[#29335C]/30 hover:text-white",
          )}
          onClick={() => handleItemClick("turmas", "/turmas")}
        >
          <Users className="h-4 w-4 mr-3" />
          Turmas
        </Button>

        <div>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-sm font-medium h-10 px-3",
              isExpanded("agenda")
                ? "bg-[#29335C]/30 text-white"
                : activeItem?.startsWith("agenda")
                  ? "bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20"
                  : "text-gray-300 hover:bg-[#29335C]/30 hover:text-white",
            )}
            onClick={() => toggleExpand("agenda")}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-3" />
                Agenda
              </div>
              {isExpanded("agenda") ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          </Button>
          {isExpanded("agenda") && <AgendaNav activeItem={activeItem} />}
        </div>

        <div>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-sm font-medium h-10 px-3",
              isExpanded("organizacao")
                ? "bg-[#29335C]/30 text-white"
                : activeItem?.startsWith("organizacao")
                  ? "bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20"
                  : "text-gray-300 hover:bg-[#29335C]/30 hover:text-white",
            )}
            onClick={() => toggleExpand("organizacao")}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <CheckSquare className="h-4 w-4 mr-3" />
                Organização
              </div>
              {isExpanded("organizacao") ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          </Button>
          {isExpanded("organizacao") && (
            <OrganizacaoNav activeItem={activeItem} />
          )}
        </div>

        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-sm font-medium h-10 px-3",
            activeItem === "biblioteca"
              ? "bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20"
              : "text-gray-300 hover:bg-[#29335C]/30 hover:text-white",
          )}
          onClick={() => handleItemClick("biblioteca", "/biblioteca")}
        >
          <Library className="h-4 w-4 mr-3" />
          Biblioteca
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-sm font-medium h-10 px-3",
            activeItem === "mercado"
              ? "bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20"
              : "text-gray-300 hover:bg-[#29335C]/30 hover:text-white",
          )}
          onClick={() => handleItemClick("mercado", "/mercado")}
        >
          <ShoppingCart className="h-4 w-4 mr-3" />
          Mercado
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-sm font-medium h-10 px-3",
            activeItem === "comunidades"
              ? "bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20"
              : "text-gray-300 hover:bg-[#29335C]/30 hover:text-white",
          )}
          onClick={() => handleItemClick("comunidades", "/comunidades")}
        >
          <Users className="h-4 w-4 mr-3" />
          Comunidades
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-sm font-medium h-10 px-3",
            activeItem === "carteira"
              ? "bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20"
              : "text-gray-300 hover:bg-[#29335C]/30 hover:text-white",
          )}
          onClick={() => handleItemClick("carteira", "/carteira")}
        >
          <Wallet className="h-4 w-4 mr-3" />
          Carteira
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-sm font-medium h-10 px-3",
            activeItem === "epictus-ia"
              ? "bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20"
              : "text-gray-300 hover:bg-[#29335C]/30 hover:text-white",
          )}
          onClick={() => handleItemClick("epictus-ia", "/epictus-ia")}
        >
          <GraduationCap className="h-4 w-4 mr-3" />
          Epictus IA
        </Button>
      </div>

      {/* Bottom Navigation */}
      <div className="mt-auto px-2 space-y-1">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-sm font-medium h-10 px-3",
            activeItem === "ajuda"
              ? "bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20"
              : "text-gray-300 hover:bg-[#29335C]/30 hover:text-white",
          )}
          onClick={() => handleItemClick("ajuda", "/ajuda")}
        >
          <MessageSquare className="h-4 w-4 mr-3" />
          Ajuda
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-sm font-medium h-10 px-3",
            activeItem === "configuracoes"
              ? "bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20"
              : "text-gray-300 hover:bg-[#29335C]/30 hover:text-white",
          )}
          onClick={() => handleItemClick("configuracoes", "/configuracoes")}
        >
          <Settings className="h-4 w-4 mr-3" />
          Configurações
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;