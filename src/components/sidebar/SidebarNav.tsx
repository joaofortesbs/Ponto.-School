import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types/user-profile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Home,
  BookOpen,
  Briefcase,
  ShoppingCart,
  Calendar,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Brain,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Trophy,
  Wallet,
  ChevronDown,
  ChevronUp,
  Users2,
  FolderKanban,
  Rocket,
  CheckSquare,
  Bell,
  Target,
  BarChart,
  DollarSign,
  Plus,
  BookText,
  Heart,
  BookMarked,
  Map,
  Compass,
  GraduationCap,
  CalendarClock,
  Upload,
  Route,
  Star, // Import Star icon
} from "lucide-react";
import MentorAI from "@/components/mentor/MentorAI";
// import AgendaNav from "./AgendaNav";
// import TurmasNav from "./TurmasNav";
import { useUserName } from "@/hooks/useUserName";
import { CardPerfilMenuLateral } from "./Card-Perfil-Menu-Lateral";

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function SidebarNav({
  className,
  isCollapsed = false,
  onToggleCollapse,
  ...props
}: SidebarNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMentorAI, setShowMentorAI] = useState(false);
  const { userName } = useUserName();

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(isCollapsed);
  const [firstName, setFirstName] = useState<string | null>(null);

  // Determinar estado inicial do flip baseado no tipo de conta (otimizado)
  const getInitialFlipState = () => {
    // Prioridade 1: Cache direto (mais rápido)
    const cachedAccountType = localStorage.getItem("userAccountType");
    if (cachedAccountType === 'Professor') return true;
    if (cachedAccountType === 'Aluno' || cachedAccountType === 'Coordenador') return false;

    // Prioridade 2: Dados do Neon (fallback)
    const neonUser = localStorage.getItem("neon_user");
    if (neonUser) {
      try {
        const userData = JSON.parse(neonUser);
        const tipoConta = userData.tipo_conta;

        // Atualizar cache imediatamente
        if (tipoConta) {
          localStorage.setItem("userAccountType", tipoConta);
        }

        return tipoConta === 'Professor';
      } catch (e) {
        console.debug("Erro ao parsear neon_user:", e);
      }
    }

    // Default para Aluno (não flipped)
    return false;
  };

  const [isCardFlipped, setIsCardFlipped] = useState(getInitialFlipState());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMenuFlipping, setIsMenuFlipping] = useState(false);
  const [isModeChanging, setIsModeChanging] = useState(false);
  const [cascadeIndex, setCascadeIndex] = useState(0);
  const [isModeTransitioning, setIsModeTransitioning] = useState(false);
  const [isMenuAnimating, setIsMenuAnimating] = useState(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const [isCardHovered, setIsCardHovered] = useState(false); // Variável isCardHovered agora está definida
  // Estado do tipo de conta com valor inicial do cache
  const [userAccountType, setUserAccountType] = useState<'Professor' | 'Aluno' | 'Coordenador' | null>(() => {
    // Buscar do cache imediatamente para renderização instantânea
    const cachedType = localStorage.getItem("userAccountType");
    if (cachedType === 'Professor' || cachedType === 'Aluno' || cachedType === 'Coordenador') {
      return cachedType;
    }
    return 'Aluno'; // Default para renderização imediata
  });

  // Função para adicionar timeouts ao array
  const addTimeout = (timeout: NodeJS.Timeout) => {
    timeoutsRef.current.push(timeout);
  };

  // Função para limpar todos os timeouts
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = []; // Limpar o array após remover os timeouts
  };

  useEffect(() => {
    // Listener para atualizações de avatar feitas em outros componentes
    const handleAvatarUpdate = (event: CustomEvent) => {
      if (event.detail && event.detail.url) {
        setProfileImage(event.detail.url);
      }
    };

    // Listener para atualizações de nome de usuário
    const handleUsernameUpdate = (event: CustomEvent) => {
      if (event.detail?.displayName) {
        setFirstName(event.detail.displayName);
      } else if (event.detail?.firstName) {
        setFirstName(event.detail.firstName);
      }
    };

    // Adicionar os listeners
    document.addEventListener(
      "userAvatarUpdated",
      handleAvatarUpdate as EventListener,
    );
    document.addEventListener(
      "usernameUpdated",
      handleUsernameUpdate as EventListener,
    );
    document.addEventListener(
      "usernameReady",
      handleUsernameUpdate as EventListener,
    );
    document.addEventListener(
      "usernameSynchronized",
      handleUsernameUpdate as EventListener,
    );

    // Remover os listeners quando o componente for desmontado
    return () => {
      document.removeEventListener(
        "userAvatarUpdated",
        handleAvatarUpdate as EventListener,
      );
      document.removeEventListener(
        "usernameUpdated",
        handleUsernameUpdate as EventListener,
      );
      document.removeEventListener(
        "usernameReady",
        handleUsernameUpdate as EventListener,
      );
      document.removeEventListener(
        "usernameSynchronized",
        handleUsernameUpdate as EventListener,
      );
    };
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // 1. CARREGAMENTO INSTANTÂNEO DO CACHE
        const cachedData = localStorage.getItem("neon_user");
        const cachedAvatar = localStorage.getItem("userAvatarUrl");
        const cachedFirstName = localStorage.getItem("userFirstName");
        const cachedAccountType = localStorage.getItem("userAccountType");
        const tempPreview = localStorage.getItem("tempAvatarPreview");

        // Renderizar imediatamente com dados do cache
        if (tempPreview) {
          setProfileImage(tempPreview);
        } else if (cachedAvatar) {
          setProfileImage(cachedAvatar);
        }

        if (cachedFirstName) {
          setFirstName(cachedFirstName);
        }

        if (cachedAccountType === 'Professor' || cachedAccountType === 'Aluno' || cachedAccountType === 'Coordenador') {
          setUserAccountType(cachedAccountType);
        }

        // Desligar loading imediatamente após carregar cache
        setLoading(false);

        // 2. ATUALIZAÇÃO EM BACKGROUND (não bloqueia UI)
        if (cachedData) {
          const userData = JSON.parse(cachedData);

          // Buscar atualizações do servidor em background
          requestAnimationFrame(async () => {
            try {
              const response = await fetch(`/api/perfis?email=${encodeURIComponent(userData.email)}`, {
                priority: 'low' // Baixa prioridade para não bloquear
              });

              if (!response.ok) return; // Silenciosamente ignorar erros

              const result = await response.json();

              if (result.success && result.data) {
                const profile = result.data;

                // Atualizar apenas se houver mudanças
                if (profile.imagem_avatar && profile.imagem_avatar !== cachedAvatar) {
                  setProfileImage(profile.imagem_avatar);
                  localStorage.setItem("userAvatarUrl", profile.imagem_avatar);
                  localStorage.removeItem("tempAvatarPreview");
                }

                const newFirstName = profile.nome_completo?.split(" ")[0] || profile.nome_usuario || "Usuário";
                if (newFirstName !== cachedFirstName) {
                  setFirstName(newFirstName);
                  localStorage.setItem("userFirstName", newFirstName);
                }

                if (profile.tipo_conta && profile.tipo_conta !== cachedAccountType) {
                  setUserAccountType(profile.tipo_conta);
                  localStorage.setItem("userAccountType", profile.tipo_conta);
                }

                // Atualizar cache completo
                localStorage.setItem("neon_user", JSON.stringify(profile));
              }
            } catch (error) {
              // Silenciosamente ignorar erros de atualização em background
              console.debug("Atualização em background falhou (não crítico):", error);
            }
          });
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        setFirstName("Usuário");
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleProfileImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Validar tipo de arquivo
      if (!file.type.startsWith("image/")) {
        alert("Por favor, selecione uma imagem válida");
        return;
      }

      // Validar tamanho do arquivo (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 5MB");
        return;
      }

      // Obter email do usuário do Neon
      const neonUser = localStorage.getItem("neon_user");
      if (!neonUser) {
        alert("Usuário não autenticado");
        return;
      }

      const userData = JSON.parse(neonUser);
      const userEmail = userData.email;

      if (!userEmail) {
        alert("Email do usuário não encontrado");
        return;
      }

      console.log("🔄 Iniciando upload de avatar para:", userEmail);

      // Criar preview local IMEDIATAMENTE e manter
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const imageUrl = e.target.result as string;
          setProfileImage(imageUrl);
          // Salvar preview no localStorage temporariamente
          localStorage.setItem("tempAvatarPreview", imageUrl);
        }
      };
      reader.readAsDataURL(file);

      // Preparar FormData para upload
      const formData = new FormData();
      formData.append("avatar", file);
      formData.append("email", userEmail);

      // Upload para o servidor que salvará no Supabase Storage E no Neon
      const uploadResponse = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      // Verificar se a resposta é válida
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('❌ Erro na resposta do servidor:', errorText);
        throw new Error(`Erro no servidor: ${uploadResponse.status}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log('📦 Resposta do servidor:', uploadResult);

      if (uploadResult.success && uploadResult.avatar_url) {
        console.log("✅ Avatar atualizado com sucesso no banco Neon");

        // Atualizar estado local
        setProfileImage(uploadResult.avatar_url);

        // Atualizar localStorage do Neon
        const neonUser = JSON.parse(localStorage.getItem("neon_user") || "{}");
        neonUser.imagem_avatar = uploadResult.avatar_url;
        localStorage.setItem("neon_user", JSON.stringify(neonUser));

        // Limpar preview temporário
        localStorage.removeItem("tempAvatarPreview");

        alert("✅ Avatar atualizado com sucesso!");
      } else {
        throw new Error(uploadResult.error || "Erro ao processar upload");
      }

    } catch (error) {
      console.error("❌ Erro ao atualizar avatar:", error);
      // Restaurar preview se houver
      const tempPreview = localStorage.getItem("tempAvatarPreview");
      if (tempPreview) {
        setProfileImage(tempPreview);
      }
      alert(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar imagem de perfil",
      );
    }
  };

  const handleNavigation = (path: string, isSpecial?: boolean, disabled?: boolean) => {
    if (disabled) {
      return; // Não navega se o item estiver desabilitado
    }

    if (path === "/mentor-ia") {
      setShowMentorAI(true);
    } else {
      setShowMentorAI(false);
      navigate(path);
    }
  };

  const isActive = (path: string) => {
    if (path === "/mentor-ia") {
      return showMentorAI;
    }
    return location.pathname === path;
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const navItemsAluno = [
    {
      icon: "fas fa-home",
      label: "Painel",
      path: "/",
    },
    {
      icon: "fas fa-user-graduate",
      label: "Minhas Turmas",
      path: "/turmas",
    },
    {
      icon: "fas fa-route",
      label: "Trilhas School",
      path: "/trilhas-school/alunos",
    },
    {
      icon: "fas fa-project-diagram",
      label: "School Planner",
      path: "/school-planner",
    },
    {
      icon: "fas fa-brain",
      label: "Epictus IA",
      path: "/epictus-ia",
      isSpecial: true,
    },
    {
      icon: "fas fa-users",
      label: "Comunidades",
      path: "/comunidades",
    },
    {
      icon: "fas fa-trophy",
      label: "Conquistas",
      path: "/conquistas",
    },
    {
      icon: "fas fa-compass",
      label: "Explorar",
      path: "/explorar",
    },
  ];

  const navItemsProfessor = [
    {
      icon: "fas fa-home",
      label: "Painel",
      path: "/",
    },
    {
      icon: "fas fa-rocket",
      label: "School Power",
      path: "/school-power",
    },
    {
      icon: "fas fa-chalkboard-teacher",
      label: "Minhas Turmas",
      path: "/turmas",
      disabled: true,
    },
    {
      icon: "fas fa-route",
      label: "Trilhas School",
      path: "/trilhas-school/professores",
      disabled: true,
    },
    {
      icon: "fas fa-brain",
      label: "Epictus IA",
      path: "/epictus-ia",
      isSpecial: true,
      disabled: true,
    },
    {
      icon: "fas fa-globe",
      label: "Portal",
      path: "/portal",
      disabled: true,
    },
    {
      icon: "fas fa-users",
      label: "Comunidades",
      path: "/comunidades",
      disabled: true,
    },
    {
      icon: "fas fa-trophy",
      label: "Conquistas",
      path: "/conquistas",
      disabled: true,
    },
    {
      icon: "fas fa-compass",
      label: "Explorar",
      path: "/explorar",
      disabled: true,
    },
  ];

  const navItemsCoordenador = [
    {
      icon: "fas fa-home",
      label: "Painel",
      path: "/",
    },
    {
      icon: "fas fa-users-cog",
      label: "Gestão",
      path: "/gestao",
      disabled: true,
    },
    {
      icon: "fas fa-chalkboard-teacher",
      label: "Turmas",
      path: "/turmas",
      disabled: true,
    },
    {
      icon: "fas fa-route",
      label: "Trilhas School",
      path: "/trilhas-school/coordenador",
      disabled: true,
    },
    {
      icon: "fas fa-brain",
      label: "Epictus IA",
      path: "/epictus-ia",
      isSpecial: true,
      disabled: true,
    },
    {
      icon: "fas fa-chart-line",
      label: "Relatórios",
      path: "/relatorios",
      disabled: true,
    },
    {
      icon: "fas fa-book-open",
      label: "Biblioteca",
      path: "/biblioteca",
      disabled: true,
    },
  ];

  // Determinar qual menu usar baseado no tipo de conta
  const getNavItems = () => {
    if (userAccountType === 'Professor') {
      return navItemsProfessor;
    } else if (userAccountType === 'Coordenador') {
      return navItemsCoordenador;
    } else {
      return navItemsAluno; // Default para Aluno
    }
  };

  const navItems = getNavItems();

  return (
    <div className="relative h-full">
      {showMentorAI && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-10 z-50 bg-white dark:bg-[#121212] rounded-xl shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-[#00FFFF]" />
                <h2 className="text-xl font-semibold">Mentor IA</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMentorAI(false)}
                className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <MentorAI />
            </div>
          </div>
        </div>
      )}

      {/* User Profile Component - Greeting and progress section */}
      <CardPerfilMenuLateral
        isCollapsed={isCollapsed}
        userProfile={userProfile}
        profileImage={profileImage}
        firstName={firstName}
        userName={userName}
        userAccountType={userAccountType}
        isCardFlipped={isCardFlipped}
        isUploading={isUploading}
        fileInputRef={fileInputRef}
        onImageChange={handleImageChange}
        setIsCardHovered={setIsCardHovered}
      />

      <ScrollArea
        className={cn(
          "py-2",
          isCollapsed ? "h-[calc(100%-180px)]" : "h-[calc(100%-300px)]",
        )}
      >
        {/* Navigation Menu com novo design */}
        <div className={cn(
          "navigation-menu-container",
          isCollapsed && "sidebar-collapsed",
          isCardFlipped ? "professor-mode" : "aluno-mode",
          isModeChanging && "mode-changing"
        )}>
          <nav className={cn(
            "menu-navigation",
            isMenuFlipping && "menu-flipping",
            "px-4"
          )}>
            {navItems.map((item, index) => (
              <div
                key={`${isCardFlipped ? 'professor' : 'aluno'}-${item.path}-${index}`}
                className={cn(
                  "relative menu-item-wrapper",
                  isMenuFlipping && "animate-menu-transition"
                )}
                style={{
                  animationDelay: `${index * 80}ms`
                }}
              >
                {item.label === "Agenda" && !isCollapsed ? (
                  <div className="text-sm text-gray-400 px-4 py-2">Agenda em desenvolvimento</div>
                ) : (
                  <div
                    className={cn(
                      "menu-item",
                      isActive(item.path) ? "active" : "",
                      item.disabled ? "disabled" : ""
                    )}
                    onClick={() => handleNavigation(item.path, item.isSpecial, item.disabled)}
                  >
                    <div className="item-content">
                      <div className={cn(
                        "icon-container",
                        isActive(item.path) ? "active" : "",
                        item.disabled ? "disabled" : ""
                      )}>
                        <i className={item.icon}></i>
                        <div className="icon-glow"></div>
                      </div>
                      {!isCollapsed && (
                        <div className="item-text">
                          <span className="item-title">{item.label}</span>
                        </div>
                      )}
                      {item.disabled && !isCollapsed && (
                        <div className="lock-icon">
                          <i className="fas fa-lock"></i>
                        </div>
                      )}
                      <div className="item-indicator"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </ScrollArea>

      <style>{`
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

        * {
          font-family: 'Inter', sans-serif;
        }

        .navigation-menu-container {
          position: relative;
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .menu-navigation {
          padding: 16px 0;
          width: 100%;
        }

        .navigation-menu-container:not(.sidebar-collapsed) .menu-navigation {
          width: calc(100% - 2rem);
          margin: 0 auto;
        }

        .menu-item {
          margin: 0 0 4px;
          border-radius: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          min-height: 56px !important;
          height: 56px !important;
          width: 100%;
        }

        .navigation-menu-container:not(.sidebar-collapsed) .menu-item {
          width: 100%;
        }

        /* Garantir que os itens do menu tenham a mesma largura do card de perfil */
        .navigation-menu-container:not(.sidebar-collapsed) .menu-item {
          margin-left: 0;
          margin-right: 0;
        }

        .menu-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.1), transparent);
          transition: left 0.6s;
        }

        .menu-item:hover::before {
          left: 100%;
        }

        .menu-item:hover:not(.active) {
          transform: translateX(6px);
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(37, 99, 235, 0.08));
        }

        .menu-item.active {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(37, 99, 235, 0.15));
          border: 1px solid rgba(37, 99, 235, 0.3);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1) !important;
        }

        .item-content {
          display: flex;
          align-items: center;
          padding: 12px 0.75rem;
          gap: 12px;
          position: relative;
          height: 100% !important;
          min-height: 56px !important;
          box-sizing: border-box !important;
          flex-wrap: nowrap !important;
          overflow: hidden !important;
          width: 100%;
        }
        
        .navigation-menu-container:not(.sidebar-collapsed) .item-content {
          padding: 12px 0.75rem;
        }

        .icon-container {
          width: 36px !important;
          height: 36px !important;
          min-width: 36px !important;
          min-height: 36px !important;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(37, 99, 235, 0.1);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          flex-shrink: 0 !important;
        }

        .icon-container.active {
          background: linear-gradient(135deg, #2563eb, #2563eb);
          color: white;
          box-shadow: 0 8px 16px rgba(37, 99, 235, 0.3);
        }

        .icon-container i {
          font-size: 15px;
          color: #2563eb !important;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }

        .icon-container.active i {
          color: white !important;
        }

        .menu-item:hover:not(.active) .icon-container {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(37, 99, 235, 0.2));
          transform: scale(1.08);
        }

        .menu-item:hover:not(.active) .icon-container i {
          color: #2563eb !important;
        }

        .icon-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 20px;
          height: 20px;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.5), transparent);
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(0);
          transition: transform 0.3s ease;
        }

        .icon-container.active .icon-glow {
          transform: translate(-50%, -50%) scale(2.5);
        }

        .item-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-height: 36px !important;
          justify-content: center !important;
          min-width: 0 !important;
          overflow: hidden !important;
        }

        .item-title {
          font-size: 15px !important;
          font-weight: 600;
          color: #1a202c;
          transition: color 0.3s ease;
          line-height: 1.4 !important;
          margin: 0 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          display: block !important;
          width: 100% !important;
        }

        .dark .item-title {
          color: white !important;
        }

        .menu-item.active .item-title {
          color: #2563eb !important;
          font-weight: 700;
        }

        .dark .menu-item.active .item-title {
          color: #2563eb !important;
        }

        .menu-item:hover:not(.active) .item-title {
          color: #2563eb !important;
        }

        /* Estilos para sidebar colapsado - apenas ícones */
        .sidebar-collapsed .item-text {
          display: none !important;
        }

        .sidebar-collapsed .menu-item {
          justify-content: center !important;
          width: 56px !important;
          margin: 0 auto 4px !important;
        }

        .sidebar-collapsed .item-content {
          justify-content: center !important;
          padding: 12px 8px !important;
        }

        .sidebar-collapsed .item-indicator {
          display: none !important;
        }

        .sidebar-collapsed .menu-navigation {
          width: 56px !important;
          padding: 16px 0 !important;
          margin: 0 auto !important;
        }

        .sidebar-collapsed .navigation-menu-container {
          width: 56px !important;
          padding: 0 !important;
          margin: 0 auto !important;
        }

        .item-indicator {
          width: 8px !important;
          height: 8px !important;
          min-width: 8px !important;
          min-height: 8px !important;
          border-radius: 50%;
          background: #2563eb;
          opacity: 0;
          transform: scale(0);
          transition: all 0.3s ease;
          flex-shrink: 0 !important;
        }

        .menu-item.active .item-indicator {
          opacity: 1;
          transform: scale(1);
          box-shadow: 0 0 8px rgba(37, 99, 235, 0.6);
        }

        /* ESTILOS ESPECÍFICOS PARA MODO PROFESSOR */
        .professor-mode .menu-item::before {
          background: linear-gradient(90deg, transparent, rgba(255, 107, 0, 0.1), transparent);
        }

        .professor-mode .menu-item:hover:not(.active) {
          background: linear-gradient(135deg, rgba(255, 107, 0, 0.08), rgba(255, 107, 0, 0.08));
        }

        .professor-mode .menu-item.active {
          background: linear-gradient(135deg, rgba(255, 107, 0, 0.15), rgba(255, 107, 0, 0.15));
          border: 1px solid rgba(255, 107, 0, 0.3);
          box-shadow: 0 4px 12px rgba(255, 107, 0, 0.1) !important;
        }

        .professor-mode .icon-container {
          background: rgba(255, 107, 0, 0.1);
        }

        .professor-mode .icon-container i {
          color: #FF6B00 !important;
        }

        .professor-mode .icon-container.active {
          background: linear-gradient(135deg, #FF6B00, #FF6B00);
          color: white;
          box-shadow: 0 8px 16px rgba(255, 107, 0, 0.3);
        }

        .professor-mode .icon-container.active i {
          color: white !important;
        }

        .professor-mode .menu-item:hover:not(.active) .icon-container {
          background: linear-gradient(135deg, rgba(255, 107, 0, 0.2), rgba(255, 107, 0, 0.2));
        }

        .professor-mode .menu-item:hover:not(.active) .icon-container i {
          color: #FF6B00 !important;
        }

        .professor-mode .menu-item.active .item-title {
          color: #FF6B00 !important;
        }

        .professor-mode .menu-item:hover:not(.active) .item-title {
          color: #FF6B00 !important;
        }

        .professor-mode .item-indicator {
          background: #FF6B00;
        }

        .professor-mode .menu-item.active .item-indicator {
          box-shadow: 0 0 8px rgba(255, 107, 0, 0.6);
        }

        .professor-mode .icon-glow {
          background: radial-gradient(circle, rgba(255, 107, 0, 0.5), transparent);
        }

        @keyframes orangeBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        /* Animações para transição entre menus */
        .menu-flipping .menu-item-wrapper {
          animation: menuItemExit 0.4s ease-in-out forwards;
        }

        @keyframes menuItemExit {
          0% {
            opacity: 1;
            transform: translateX(0) rotateY(0deg) scale(1);
          }
          50% {
            opacity: 0;
            transform: translateX(-30px) rotateY(-45deg) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translateX(0) rotateY(0deg) scale(1);
          }
        }

        .animate-menu-transition {
          animation: menuItemEnter 0.5s ease-out forwards;
        }

        @keyframes menuItemEnter {
          0% {
            opacity: 0;
            transform: translateX(30px) rotateY(45deg) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translateX(0) rotateY(0deg) scale(1);
          }
        }

        /* Pulso da navegação durante mudança de modo */
        .mode-changing .menu-navigation {
          animation: navigationPulse 1.5s ease-in-out infinite;
        }

        @keyframes navigationPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(255, 107, 0, 0.2);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(255, 107, 0, 0);
          }
        }

        /* Efeito contínuo */
        .cascading-effect {
          animation: cascadeWave 1.2s ease-in-out infinite;
          transform-origin: center;
        }

        @keyframes cascadeWave {
          0% {
            transform: translateX(0) rotateY(0deg) scale(1);
            filter: brightness(1);
          }
          25% {
            transform: translateX(-15px) rotateY(-10deg) scale(0.95);
            filter: brightness(1.1);
          }
          50% {
            transform: translateX(0) rotateY(0deg) scale(1.02);
            filter: brightness(1.15);
          }
          75% {
            transform: translateX(15px) rotateY(10deg) scale(0.98);
            filter: brightness(1.1);
          }
          100% {
            transform: translateX(0) rotateY(0deg) scale(1);
            filter: brightness(1);
          }
        }

        /* Efeito cascata para modo aluno */
        .student-mode .cascading-effect {
          animation: cascadeWaveOrange 1.2s ease-in-out infinite;
        }

        /* Estilos para itens desabilitados */
        .menu-item.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .menu-item.disabled .icon-container {
          background: rgba(156, 163, 175, 0.1) !important;
        }

        .menu-item.disabled .icon-container i {
          color: #9ca3af !important;
        }

        .menu-item.disabled .item-title {
          color: #9ca3af !important;
        }

        .dark .menu-item.disabled .item-title {
          color: #6b7280 !important;
        }

        /* Efeito de hover para itens desabilitados */
        .menu-item.disabled:hover {
          transform: translateX(6px) !important;
          background: linear-gradient(135deg, rgba(156, 163, 175, 0.08), rgba(156, 163, 175, 0.08)) !important;
        }

        .menu-item.disabled:hover .item-title {
          color: #9ca3af !important;
        }

        .dark .menu-item.disabled:hover .item-title {
          color: #6b7280 !important;
        }

        .menu-item.disabled:hover .icon-container {
          transform: scale(1.08) !important;
          background: rgba(156, 163, 175, 0.2) !important;
        }

        .menu-item.disabled:hover .icon-container i {
          color: #9ca3af !important;
        }

        .dark .menu-item.disabled:hover .icon-container i {
          color: #6b7280 !important;
        }

        /* Efeito de onda para itens desabilitados */
        .menu-item.disabled::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(156, 163, 175, 0.1), transparent);
          transition: left 0.6s;
        }

        .menu-item.disabled:hover::before {
          left: 100%;
        }

        /* Ícone de cadeado */
        .lock-icon {
          width: 16px !important;
          height: 16px !important;
          min-width: 16px !important;
          min-height: 16px !important;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0 !important;
          margin-left: auto;
          margin-right: 16px;
        }

        .lock-icon i {
          font-size: 12px;
          color: #9ca3af !important;
        }

        .dark .lock-icon i {
          color: #6b7280 !important;
        }

        @keyframes cascadeWaveOrange {
          0% {
            transform: translateX(0) rotateY(0deg) scale(1);
            box-shadow: 0 0 0 0 rgba(255, 107, 0, 0);
          }
          25% {
            transform: translateX(-15px) rotateY(-10deg) scale(0.95);
            box-shadow: 0 4px 12px rgba(255, 107, 0, 0.3);
          }
          50% {
            transform: translateX(0) rotateY(0deg) scale(1.02);
            box-shadow: 0 6px 20px rgba(255, 107, 0, 0.4);
          }
          75% {
            transform: translateX(15px) rotateY(10deg) scale(0.98);
            box-shadow: 0 4px 12px rgba(255, 107, 0, 0.3);
          }
          100% {
            transform: translateX(0) rotateY(0deg) scale(1);
            box-shadow: 0 0 0 0 rgba(255, 107, 0, 0);
          }
        }

        /* Efeito cascata para modo professor */
        .professor-mode .cascading-effect {
          animation: cascadeWaveBlue 1.2s ease-in-out infinite;
        }

        @keyframes cascadeWaveBlue {
          0% {
            transform: translateX(0) rotateY(0deg) scale(1);
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
          }
          25% {
            transform: translateX(-15px) rotateY(-10deg) scale(0.95);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
          }
          50% {
            transform: translateX(0) rotateY(0deg) scale(1.02);
            box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
          }
          75% {
            transform: translateX(15px) rotateY(10deg) scale(0.98);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
          }
          100% {
            transform: translateX(0) rotateY(0deg) scale(1);
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
          }
        }

        /* Efeito cascata para itens individuais */
        .cascading-menu-item {
          animation: menuItemCascade 1s ease-in-out;
          animation-delay: var(--cascade-delay, 0s);
        }

        @keyframes menuItemCascade {
          0% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
          20% {
            transform: translateX(-20px) scale(0.9);
            opacity: 0.7;
          }
          40% {
            transform: translateX(10px) scale(1.05);
            opacity: 0.9;
          }
          60% {
            transform: translateX(-5px) scale(0.98);
            opacity: 1;
          }
          80% {
            transform: translateX(2px) scale(1.02);
            opacity: 1;
          }
          100% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }

        /* Efeitos contínuos durante mudança de modo */
        .mode-changing .menu-item {
          animation: continuousPulse 2s ease-in-out infinite;
        }

        @keyframes continuousPulse {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1);
          }
          25% {
            transform: scale(1.02);
            filter: brightness(1.1);
          }
          50% {
            transform: scale(0.98);
            filter: brightness(1.05);
          }
          75% {
            transform: scale(1.01);
            filter: brightness(1.08);
          }
        }

        /* Animações para o flip do menu */
        .menu-animating .menu-navigation {
          animation: menuFlipCascade 1.5s ease-in-out;
          animation-delay: var(--cascade-delay, 0s);
        }

        .menu-item-flip-animation {
          animation: menuItemFlipTransition 1.8s cubic-bezier(0.23, 1, 0.32, 1);
        }

        @keyframes menuFlipCascade {
          0% {
            transform: rotateY(0deg) scale(1);
            opacity: 1;
          }
          15% {
            transform: rotateY(-15deg) scale(0.95);
            opacity: 0.8;
          }
          30% {
            transform: rotateY(-30deg) scale(0.9);
            opacity: 0.6;
          }
          50% {
            transform: rotateY(180deg) scale(0.85);
            opacity: 0.4;
          }
          65% {
            transform: rotateY(195deg) scale(0.9);
            opacity: 0.6;
          }
          80% {
            transform: rotateY(345deg) scale(0.95);
            opacity: 0.8;
          }
          100% {
            transform: rotateY(360deg) scale(1);
            opacity: 1;
          }
        }

        @keyframes menuItemFlipTransition {
          0% {
            transform: translateX(0) rotateY(0deg) scale(1);
            filter: brightness(1) hue-rotate(0deg);
            box-shadow: 0 0 0 rgba(255, 107, 0, 0);
          }
          10% {
            transform: translateX(-8px) rotateY(-20deg) scale(0.98);
            filter: brightness(1.1) hue-rotate(10deg);
            box-shadow: 0 2px 8px rgba(255, 107, 0, 0.1);
          }
          25% {
            transform: translateX(-15px) rotateY(-45deg) scale(0.92);
            filter: brightness(1.2) hue-rotate(30deg);
            box-shadow: 0 4px 16px rgba(255, 107, 0, 0.2);
          }
          40% {
            transform: translateX(-20px) rotateY(-90deg) scale(0.85);
            filter: brightness(1.3) hue-rotate(60deg);
            box-shadow: 0 6px 24px rgba(255, 107, 0, 0.3);
          }
          50% {
            transform: translateX(-15px) rotateY(-135deg) scale(0.8);
            filter: brightness(1.4) hue-rotate(90deg);
            box-shadow: 0 8px 32px rgba(255, 107, 0, 0.4);
          }
          60% {
            transform: translateX(-5px) rotateY(-180deg) scale(0.85);
            filter: brightness(1.3) hue-rotate(120deg);
            box-shadow: 0 6px 24px rgba(37, 99, 235, 0.3);
          }
          75% {
            transform: translateX(5px) rotateY(-225deg) scale(0.92);
            filter: brightness(1.2) hue-rotate(150deg);
            box-shadow: 0 4px 16px rgba(37, 99, 235, 0.2);
          }
          90% {
            transform: translateX(8px) rotateY(-340deg) scale(0.98);
            filter: brightness(1.1) hue-rotate(170deg);
            box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
          }
          100% {
            transform: translateX(0) rotateY(-360deg) scale(1);
            filter: brightness(1) hue-rotate(180deg);
            box-shadow: 0 0 0 rgba(37, 99, 235, 0);
          }
        }

        /* Animação específica para modo professor */
        .professor-mode .menu-item-flip-animation {
          animation: menuItemFlipTransitionProfessor 1.8s cubic-bezier(0.23, 1, 0.32, 1);
        }

        @keyframes menuItemFlipTransitionProfessor {
          0% {
            transform: translateX(0) rotateY(0deg) scale(1);
            filter: brightness(1) hue-rotate(0deg);
            box-shadow: 0 0 0 rgba(255, 107, 0, 0);
          }
          10% {
            transform: translateX(-8px) rotateY(-20deg) scale(0.98);
            filter: brightness(1.1) hue-rotate(-10deg);
            box-shadow: 0 2px 8px rgba(255, 107, 0, 0.1);
          }
          25% {
            transform: translateX(-15px) rotateY(-45deg) scale(0.92);
            filter: brightness(1.2) hue-rotate(-30deg);
            box-shadow: 0 4px 16px rgba(255, 107, 0, 0.2);
          }
          40% {
            transform: translateX(-20px) rotateY(-90deg) scale(0.85);
            filter: brightness(1.3) hue-rotate(-60deg);
            box-shadow: 0 6px 24px rgba(255, 107, 0, 0.3);
          }
          50% {
            transform: translateX(-15px) rotateY(-135deg) scale(0.8);
            filter: brightness(1.4) hue-rotate(-90deg);
            box-shadow: 0 8px 32px rgba(255, 107, 0, 0.4);
          }
          60% {
            transform: translateX(-5px) rotateY(-180deg) scale(0.85);
            filter: brightness(1.3) hue-rotate(-120deg);
            box-shadow: 0 6px 24px rgba(255, 107, 0, 0.3);
          }
          75% {
            transform: translateX(5px) rotateY(-225deg) scale(0.92);
            filter: brightness(1.2) hue-rotate(-150deg);
            box-shadow: 0 4px 16px rgba(255, 107, 0, 0.2);
          }
          90% {
            transform: translateX(8px) rotateY(-340deg) scale(0.98);
            filter: brightness(1.1) hue-rotate(-170deg);
            box-shadow: 0 2px 8px rgba(255, 107, 0, 0.1);
          }
          100% {
            transform: translateX(0) rotateY(-360deg) scale(1);
            filter: brightness(1) hue-rotate(-180deg);
            box-shadow: 0 0 0 rgba(255, 107, 0, 0);
          }
        }

        /* Efeito de onda no container durante a animação */
        .menu-animating .menu-navigation {
          animation: menuContainerPulse 2s ease-in-out;
        }

        @keyframes menuContainerPulse {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1);
          }
          25% {
            transform: scale(1.02);
            filter: brightness(1.05);
          }
          50% {
            transform: scale(1.01);
            filter: brightness(1.1);
          }
          75% {
            transform: scale(1.02);
            filter: brightness(1.05);
          }
        }
      `}</style>
    </div>
  );
}