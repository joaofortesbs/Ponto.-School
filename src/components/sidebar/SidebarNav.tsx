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
  ProjectDiagram,
} from "lucide-react";
import MentorAI from "@/components/mentor/MentorAI";
import AgendaNav from "./AgendaNav";
import TurmasNav from "./TurmasNav";

// Função para processar dados de exercícios (adicionada)
const processExerciseListData = (listData: any[]) => {
  // Implementação da lógica de processamento, se necessário
  // Por enquanto, retorna os dados como estão ou um array vazio se não houver dados
  return listData || [];
};

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

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(isCollapsed);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMenuFlipping, setIsMenuFlipping] = useState(false);
  const [isModeChanging, setIsModeChanging] = useState(false);
  const [cascadeIndex, setCascadeIndex] = useState(0);
  const [isModeTransitioning, setIsModeTransitioning] = useState(false);
  const [isMenuAnimating, setIsMenuAnimating] = useState(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const [isCardHovered, setIsCardHovered] = useState(false); // Variável isCardHovered agora está definida

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
        // Primeiro tentar obter do localStorage para display rápido
        const storedFirstName = localStorage.getItem("userFirstName");
        const storedDisplayName = localStorage.getItem("userDisplayName");
        const storedAvatarUrl = localStorage.getItem("userAvatarUrl");

        if (storedDisplayName) {
          setFirstName(storedDisplayName);
        } else if (storedFirstName) {
          setFirstName(storedFirstName);
        }

        if (storedAvatarUrl) {
          setProfileImage(storedAvatarUrl);
        }

        // Depois buscar do Supabase para dados atualizados
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (error) {
            console.error("Error fetching user profile:", error);
            if (!firstName) setFirstName("Usuário"); // Fallback if profile fetch fails
          } else if (data) {
            setUserProfile(data as UserProfile);

            // Se o perfil tiver um avatar_url, usar ele e atualizar localStorage
            if (data.avatar_url) {
              setProfileImage(data.avatar_url);
              localStorage.setItem("userAvatarUrl", data.avatar_url);
            }

            // Determinar o primeiro nome com a mesma lógica do Dashboard
            const firstName =
              data.full_name?.split(" ")[0] ||
              data.display_name ||
              data.username ||
              "";

            setFirstName(firstName);
            localStorage.setItem("userFirstName", firstName);

            // Disparar evento para outros componentes
            document.dispatchEvent(
              new CustomEvent("userAvatarUpdated", {
                detail: { url: data.avatar_url },
              }),
            );
            document.dispatchEvent(
              new CustomEvent("usernameUpdated", {
                detail: {
                  displayName: data.display_name,
                  firstName: firstName,
                  username: data.username,
                },
              }),
            );
          }
        } else {
          if (!firstName) setFirstName("Usuário"); // Fallback if user is not authenticated
        }
      } catch (error) {
        console.error("Error:", error);
        if (!firstName) setFirstName("Usuário"); // Fallback for any other error
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);

        // Obter o usuário atual
        const { data: currentUser } = await supabase.auth.getUser();
        if (!currentUser.user) {
          throw new Error("Usuário não autenticado");
        }

        // Upload da imagem para o Supabase Storage
        const fileExt = file.name.split(".").pop();
        const fileName = `avatar-${currentUser.user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // Fazer upload para o storage do Supabase
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("profile-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          console.error("Erro ao fazer upload da imagem:", uploadError);
          throw new Error(uploadError.message);
        }

        // Obter a URL pública da imagem
        const { data: publicUrlData } = supabase.storage
          .from("profile-images")
          .getPublicUrl(filePath);

        if (!publicUrlData.publicUrl) {
          throw new Error("Não foi possível obter a URL pública da imagem");
        }

        // Atualizar o perfil do usuário com a URL da imagem
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            avatar_url: publicUrlData.publicUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentUser.user.id);

        if (updateError) {
          console.error("Erro ao atualizar perfil com avatar:", updateError);
          throw new Error(updateError.message);
        }

        // Atualizar o estado local
        setProfileImage(publicUrlData.publicUrl);

        // Salvar no localStorage para persistência
        localStorage.setItem("userAvatarUrl", publicUrlData.publicUrl);

        // Disparar evento para outros componentes saberem que o avatar foi atualizado
        document.dispatchEvent(
          new CustomEvent("userAvatarUpdated", {
            detail: { url: publicUrlData.publicUrl },
          }),
        );

        console.log("Avatar atualizado com sucesso!");
      } catch (error) {
        console.error("Erro ao processar upload de avatar:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleNavigation = (path: string, isSpecial?: boolean) => {
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
      path: "/trilhas-school",
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
      icon: "fas fa-calendar-alt",
      label: "Agenda",
      path: "/agenda",
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
      icon: "fas fa-chalkboard-teacher",
      label: "Minhas Turmas",
      path: "/turmas",
    },
    {
      icon: "fas fa-route",
      label: "Trilhas School",
      path: "/trilhas-school",
    },
    {
      icon: "fas fa-rocket",
      label: "School Power",
      path: "/school-power",
    },
    {
      icon: "fas fa-brain",
      label: "Epictus IA",
      path: "/epictus-ia",
      isSpecial: true,
    },
    {
      icon: "fas fa-globe",
      label: "Portal",
      path: "/portal",
    },
    {
      icon: "fas fa-calendar-alt",
      label: "Agenda",
      path: "/agenda",
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

  const navItems = isCardFlipped ? navItemsProfessor : navItemsAluno;

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
      <div
        className={cn(
          "bg-white dark:bg-[#001427] p-4 mb-0 flex flex-col items-center relative group",
          isCollapsed ? "mt-6 px-2" : "mt-4",
        )}
      >
        {/* Card wrapper com bordas arredondadas e flip effect */}
        <div
          className={cn(
            "relative w-full h-auto",
            isCollapsed ? "w-14" : "w-full",
          )}
          style={{ perspective: "1000px" }}
          onMouseEnter={() => setIsCardHovered(true)}
          onMouseLeave={() => setIsCardHovered(false)}
        >
          <div
            className={cn(
              "relative w-full h-auto transition-transform duration-700 transform-style-preserve-3d",
              isCardFlipped ? "rotate-y-180" : "",
            )}
          >
            {/* Front Side */}
            <div
              className={cn(
                "bg-white dark:bg-[#29335C]/20 rounded-2xl border border-gray-200 dark:border-[#29335C]/30 backdrop-blur-sm relative backface-hidden",
                isCollapsed ? "w-14 p-2" : "w-full p-4",
              )}
            >
              {/* Ícone de graduação no canto superior esquerdo quando expandido */}
              {!isCollapsed && (
                <div className="absolute top-3 left-3 z-10">
                  <div className="w-7 h-7">
                    <div className="w-full h-full rounded-full border-2 border-orange-500 bg-orange-600 bg-opacity-20 flex items-center justify-center">
                      <GraduationCap size={14} className="text-orange-500" />
                    </div>
                  </div>
                </div>
              )}

              {/* Botão Flip circular na mesma altura do ícone de graduação */}
              {!isCollapsed && isCardHovered && (
                <button
                  className="absolute top-3 right-3 w-6 h-6 rounded-full border-2 border-orange-500 bg-orange-600 bg-opacity-20 hover:bg-orange-600 hover:bg-opacity-30 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm cursor-pointer z-10"
                  onClick={() => {
                    // Limpar timeouts anteriores se existirem
                    clearAllTimeouts();

                    // Iniciar todas as animações simultaneamente
                    setIsModeTransitioning(true);
                    setIsMenuAnimating(true);
                    setIsMenuFlipping(true);
                    setIsCardFlipped(!isCardFlipped); // Flip imediato do card

                    // Calcular tempo total baseado no número de itens do menu
                    const totalItems = navItems.length;
                    const cascadeDelay = 80; // Delay entre cada item
                    const totalAnimationTime = (totalItems * cascadeDelay) + 600; // Tempo total da cascata

                    // Finalizar todas as animações após o tempo calculado
                    const finishTimeout = setTimeout(() => {
                      setIsModeTransitioning(false);
                      setIsMenuFlipping(false);
                      setIsMenuAnimating(false);
                    }, totalAnimationTime);
                    addTimeout(finishTimeout);
                  }}
                  title="Flip Card"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-orange-500"
                  >
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M8 16H3v5" />
                  </svg>
                </button>
              )}
              {/* Profile Image Component - Responsive avatar */}
              <div
                className={cn(
                  "relative flex justify-center flex-col items-center",
                  isCollapsed ? "mb-1" : "mb-4",
                )}
              >
                <div
                  className={cn(
                    "rounded-full overflow-hidden bg-gradient-to-r from-[#FF6B00] via-[#FF8736] to-[#FFB366] p-0.5 cursor-pointer transition-all duration-300",
                    isCollapsed ? "w-10 h-10" : "w-20 h-20",
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-[#001427] flex items-center justify-center">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error("Error loading profile image");
                          setProfileImage(null);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                        <div
                          className={cn(
                            "bg-yellow-300 rounded-full flex items-center justify-center",
                            isCollapsed ? "w-5 h-5" : "w-10 h-10",
                          )}
                        >
                          <span
                            className={cn(
                              "text-black font-bold",
                              isCollapsed ? "text-xs" : "text-lg",
                            )}
                          >
                            {firstName
                              ? firstName.charAt(0).toUpperCase()
                              : "U"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Barra de progresso quando colapsado */}
                {isCollapsed && (
                  <div className="flex justify-center mt-2">
                    <div 
                      className="h-1 bg-[#FF6B00] rounded-full opacity-30"
                      style={{ width: "40px" }}
                    >
                      <div 
                        className="h-full bg-[#FF6B00] rounded-full transition-all duration-300"
                        style={{ width: "65%" }}
                      />
                    </div>
                  </div>
                )}

                {/* File input component */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {isUploading && (
                <div className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                  Enviando...
                </div>
              )}

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              {!isCollapsed && (
                <div className="text-[#001427] dark:text-white text-center w-full">
                  <h3 className="font-semibold text-base mb-2 flex items-center justify-center">
                    <span className="mr-1">👋</span> Olá,{" "}
                    {(() => {
                      // Obter o primeiro nome com a mesma lógica do Dashboard
                      const firstName =
                        userProfile?.full_name?.split(" ")[0] ||
                        userProfile?.display_name ||
                        localStorage.getItem("userFirstName") ||
                        "Estudante";
                      return firstName;
                    })()}
                    !
                  </h3>
                  <div className="flex flex-col items-center mt-1">
                    <p className="text-xs text-[#001427]/70 dark:text-white/70 mb-0.5">
                      Nível {userProfile?.level || 1}
                    </p>
                    <div className="flex justify-center">
                      <div 
                        className="h-1.5 bg-[#FF6B00] rounded-full opacity-30"
                        style={{ width: "80px" }}
                      >
                        <div 
                          className="h-full bg-[#FF6B00] rounded-full transition-all duration-300"
                          style={{ width: "65%" }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-center mt-2">
                      <div 
                        className="px-5 py-0.5 border border-[#FF6B00] bg-[#FF6B00] bg-opacity-20 rounded-md flex items-center justify-center"
                      >
                        <span className="text-xs font-medium text-[#FF6B00]">
                          ALUNO
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Back Side - Idêntico ao front */}
            <div
              className={cn(
                "bg-white dark:bg-[#29335C]/20 rounded-xl border border-gray-200 dark:border-[#29335C]/30 backdrop-blur-sm relative backface-hidden absolute inset-0 rotate-y-180",
                isCollapsed ? "w-14 p-2" : "w-full p-4",
              )}
            >
              {/* Ícone de Briefcase no canto superior esquerdo quando expandido */}
              {!isCollapsed && (
                <div className="absolute top-3 left-3 z-10">
                  <div className="w-7 h-7">
                    <div className="w-full h-full rounded-full border-2 border-[#2462EA] bg-[#0f26aa] bg-opacity-20 flex items-center justify-center">
                      <Briefcase
                        size={12}
                        className="text-[#2462EA]"
                        strokeWidth={2.5}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Botão Flip circular na mesma altura do ícone de Briefcase */}
              {!isCollapsed && isCardHovered && (
                <button
                  className="absolute top-3 right-3 w-6 h-6 rounded-full border-2 border-[#2462EA] bg-[#0f26aa] bg-opacity-20 hover:bg-[#0f26aa] hover:bg-opacity-30 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm cursor-pointer z-10"
                  onClick={() => {
                    // Limpar timeouts anteriores se existirem
                    clearAllTimeouts();

                    // Iniciar todas as animações simultaneamente
                    setIsModeTransitioning(true);
                    setIsMenuAnimating(true);
                    setIsMenuFlipping(true);
                    setIsCardFlipped(!isCardFlipped); // Flip imediato do card

                    // Calcular tempo total baseado no número de itens do menu
                    const totalItems = navItems.length;
                    const cascadeDelay = 80; // Delay entre cada item
                    const totalAnimationTime = (totalItems * cascadeDelay) + 600; // Tempo total da cascata

                    // Finalizar todas as animações após o tempo calculado
                    const finishTimeout = setTimeout(() => {
                      setIsModeTransitioning(false);
                      setIsMenuFlipping(false);
                      setIsMenuAnimating(false);
                    }, totalAnimationTime);
                    addTimeout(finishTimeout);
                  }}
                  title="Flip Card"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#2462EA]"
                  >
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M8 16H3v5" />
                  </svg>
                </button>
              )}
              {/* Profile Image Component - Responsive avatar */}
              <div
                className={cn(
                  "relative flex justify-center flex-col items-center",
                  isCollapsed ? "mb-1" : "mb-4",
                )}
              >
                <div
                  className={cn(
                    "rounded-full overflow-hidden bg-gradient-to-r from-blue-500 via-purple-520 to-blue-600 p-0.5 cursor-pointer transition-all duration-300",
                    isCollapsed ? "w-10 h-10" : "w-20 h-20",
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-[#001427] flex items-center justify-center">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error("Error loading profile image");
                          setProfileImage(null);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                        <div
                          className={cn(
                            "bg-yellow-300 rounded-full flex items-center justify-center",
                            isCollapsed ? "w-5 h-5" : "w-10 h-10",
                          )}
                        >
                          <span
                            className={cn(
                              "text-black font-bold",
                              isCollapsed ? "text-xs" : "text-lg",
                            )}
                          >
                            {firstName
                              ? firstName.charAt(0).toUpperCase()
                              : "U"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Barra de progresso quando colapsado */}
                {isCollapsed && (
                  <div className="flex justify-center mt-2">
                    <div 
                      className="h-1 bg-[#2461E7] rounded-full opacity-30"
                      style={{ width: "40px" }}
                    >
                      <div 
                        className="h-full bg-[#2461E7] rounded-full transition-all duration-300"
                        style={{ width: "65%" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {isUploading && (
                <div className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                  Enviando...
                </div>
              )}

              {!isCollapsed && (
                <div className="text-[#001427] dark:text-white text-center w-full">
                  <h3 className="font-semibold text-base mb-2 flex items-center justify-center">
                    <span className="mr-1">👋</span> Olá,{" "}
                    {(() => {
                      // Obter o primeiro nome com a mesma lógica do Dashboard
                      const firstName =
                        userProfile?.full_name?.split(" ")[0] ||
                        userProfile?.display_name ||
                        localStorage.getItem("userFirstName") ||
                        "Estudante";
                      return firstName;
                    })()}
                    !
                  </h3>
                  <div className="flex flex-col items-center mt-1">
                    <p className="text-xs text-[#001427]/70 dark:text-white/70 mb-0.5">
                      Nível {userProfile?.level || 1}
                    </p>
                    <div className="flex justify-center">
                      <div 
                        className="h-1.5 bg-[#2461E7] rounded-full opacity-30"
                        style={{ width: "80px" }}
                      >
                        <div 
                          className="h-full bg-[#2461E7] rounded-full transition-all duration-300"
                          style={{ width: "65%" }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-center mt-2">
                      <div 
                        className="px-5 py-0.5 border border-[#2461E7] bg-[#2461E7] bg-opacity-20 rounded-md flex items-center justify-center"
                      >
                        <span className="text-xs font-medium text-[#2461E7]">
                          PROFESSOR
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ScrollArea
        className={cn(
          "py-2",
          isCollapsed ? "h-[calc(100%-180px)]" : "h-[calc(100%-300px)]",
        )}
      >
        {/* Navigation Menu com novo design */}
        <div className={cn(
          "navigation-menu-container px-2", 
          isCollapsed && "sidebar-collapsed",
          isCardFlipped ? "professor-mode" : "aluno-mode",
          isModeChanging && "mode-changing"
        )}>
          <nav className={cn(
            "menu-navigation",
            isMenuFlipping && "menu-flipping"
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
                  <AgendaNav />
                ) : (
                  <div 
                    className={cn(
                      "menu-item",
                      isActive(item.path) ? "active" : ""
                    )}
                    onClick={() => handleNavigation(item.path, item.isSpecial)}
                  >
                    <div className="item-content">
                      <div className={cn(
                        "icon-container",
                        isActive(item.path) ? "active" : ""
                      )}>
                        <i className={item.icon}></i>
                        <div className="icon-glow"></div>
                      </div>
                      {!isCollapsed && (
                        <div className="item-text">
                          <span className="item-title">{item.label}</span>
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

      <style jsx>{`
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

        * {
          font-family: 'Inter', sans-serif;
        }

        .navigation-menu-container {
          position: relative;
        }

        .menu-navigation {
          padding: 16px 0;
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
        }

        .menu-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 107, 0, 0.1), transparent);
          transition: left 0.6s;
        }

        .menu-item:hover::before {
          left: 100%;
        }

        .menu-item:hover:not(.active) {
          transform: translateX(6px);
          background: linear-gradient(135deg, rgba(255, 107, 0, 0.08), rgba(255, 107, 0, 0.08));
        }

        .menu-item.active {
          background: linear-gradient(135deg, rgba(255, 107, 0, 0.15), rgba(255, 107, 0, 0.15));
          border: 1px solid rgba(255, 107, 0, 0.3);
          box-shadow: 0 4px 12px rgba(255, 107, 0, 0.1) !important;
        }

        .item-content {
          display: flex;
          align-items: center;
          padding: 12px;
          gap: 12px;
          position: relative;
          height: 100% !important;
          min-height: 56px !important;
          box-sizing: border-box !important;
          flex-wrap: nowrap !important;
          overflow: hidden !important;
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
          background: rgba(255, 107, 0, 0.1);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          flex-shrink: 0 !important;
        }

        .icon-container.active {
          background: linear-gradient(135deg, #FF6B00, #FF6B00);
          color: white;
          box-shadow: 0 8px 16px rgba(255, 107, 0, 0.3);
        }

        .icon-container i {
          font-size: 15px;
          color: #FF6B00 !important;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }

        .icon-container.active i {
          color: white !important;
        }

        .menu-item:hover:not(.active) .icon-container {
          background: linear-gradient(135deg, rgba(255, 107, 0, 0.2), rgba(255, 107, 0, 0.2));
          transform: scale(1.08);
        }

        .menu-item:hover:not(.active) .icon-container i {
          color: #FF6B00 !important;
        }

        .icon-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 20px;
          height: 20px;
          background: radial-gradient(circle, rgba(255, 107, 0, 0.5), transparent);
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
          color: #FF6B00 !important;
          font-weight: 700;
        }

        .dark .menu-item.active .item-title {
          color: #FF6B00 !important;
        }

        .menu-item:hover:not(.active) .item-title {
          color: #FF6B00 !important;
        }

        /* Estilos para sidebar colapsado - apenas ícones */
        .sidebar-collapsed .item-text {
          display: none !important;
        }

        .sidebar-collapsed .menu-item {
          justify-content: center !important;
        }

        .sidebar-collapsed .item-content {
          justify-content: center !important;
          padding: 12px 8px !important;
        }

        .sidebar-collapsed .item-indicator {
          display: none !important;
        }

        .item-indicator {
          width: 8px !important;
          height: 8px !important;
          min-width: 8px !important;
          min-height: 8px !important;
          border-radius: 50%;
          background: #FF6B00;
          opacity: 0;
          transform: scale(0);
          transition: all 0.3s ease;
          flex-shrink: 0 !important;
        }

        .menu-item.active .item-indicator {
          opacity: 1;
          transform: scale(1);
          box-shadow: 0 0 8px rgba(255, 107, 0, 0.6);
        }

        /* ESTILOS ESPECÍFICOS PARA MODO PROFESSOR */
        .professor-mode .menu-item::before {
          background: linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.1), transparent);
        }

        .professor-mode .menu-item:hover:not(.active) {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(37, 99, 235, 0.08));
        }

        .professor-mode .menu-item.active {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(37, 99, 235, 0.15));
          border: 1px solid rgba(37, 99, 235, 0.3);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1) !important;
        }

        .professor-mode .icon-container {
          background: rgba(37, 99, 235, 0.1);
        }

        .professor-mode .icon-container i {
          color: #2563eb !important;
        }

        .professor-mode .icon-container.active {
          background: linear-gradient(135deg, #2563eb, #2563eb);
          color: white;
          box-shadow: 0 8px 16px rgba(37, 99, 235, 0.3);
        }

        .professor-mode .icon-container.active i {
          color: white !important;
        }

        .professor-mode .menu-item:hover:not(.active) .icon-container {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(37, 99, 235, 0.2));
        }

        .professor-mode .menu-item:hover:not(.active) .icon-container i {
          color: #2563eb !important;
        }

        .professor-mode .menu-item.active .item-title {
          color: #2563eb !important;
        }

        .professor-mode .menu-item:hover:not(.active) .item-title {
          color: #2563eb !important;
        }

        .professor-mode .item-indicator {
          background: #2563eb;
        }

        .professor-mode .menu-item.active .item-indicator {
          box-shadow: 0 0 8px rgba(37, 99, 235, 0.6);
        }

        .professor-mode .icon-glow {
          background: radial-gradient(circle, rgba(37, 99, 235, 0.5), transparent);
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
        .menu-animating .menu-item-wrapper {
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
            box-shadow: 0 0 0 rgba(37, 99, 235, 0);
          }
          10% {
            transform: translateX(-8px) rotateY(-20deg) scale(0.98);
            filter: brightness(1.1) hue-rotate(-10deg);
            box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
          }
          25% {
            transform: translateX(-15px) rotateY(-45deg) scale(0.92);
            filter: brightness(1.2) hue-rotate(-30deg);
            box-shadow: 0 4px 16px rgba(37, 99, 235, 0.2);
          }
          40% {
            transform: translateX(-20px) rotateY(-90deg) scale(0.85);
            filter: brightness(1.3) hue-rotate(-60deg);
            box-shadow: 0 6px 24px rgba(37, 99, 235, 0.3);
          }
          50% {
            transform: translateX(-15px) rotateY(-135deg) scale(0.8);
            filter: brightness(1.4) hue-rotate(-90deg);
            box-shadow: 0 8px 32px rgba(37, 99, 235, 0.4);
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