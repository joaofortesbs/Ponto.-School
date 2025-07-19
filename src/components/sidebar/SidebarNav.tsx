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
} from "lucide-react";
import MentorAI from "@/components/mentor/MentorAI";
import AgendaNav from "./AgendaNav";
import TurmasNav from "./TurmasNav";

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

  const navItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: "Painel",
      path: "/",
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "from-blue-600 to-blue-700",
      iconBg: "bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30",
      accent: "#3B82F6",
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      label: "Minhas Turmas",
      path: "/turmas",
      component: <TurmasNav />,
      gradient: "from-emerald-500 to-emerald-600",
      hoverGradient: "from-emerald-600 to-emerald-700",
      iconBg: "bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30",
      accent: "#10B981",
      subItems: [
        {
          name: "Visão Geral",
          path: "/turmas",
          icon: <Home className="h-4 w-4" />,
          color: "#10B981",
        },
        {
          name: "Turmas Ativas",
          path: "/turmas?view=ativas",
          icon: <BookOpen className="h-4 w-4" />,
          color: "#10B981",
        },
        {
          name: "Grupos de Estudo",
          path: "/turmas?view=grupos-estudo",
          icon: <Users2 className="h-4 w-4" />,
          color: "#10B981",
        },
        {
          name: "Desempenho",
          path: "/turmas?view=desempenho",
          icon: <BarChart className="h-4 w-4" />,
          color: "#10B981",
        },
      ],
    },
    {
      icon: <Users2 className="h-5 w-5" />,
      label: "Comunidades",
      path: "/comunidades",
      gradient: "from-purple-500 to-purple-600",
      hoverGradient: "from-purple-600 to-purple-700",
      iconBg: "bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30",
      accent: "#8B5CF6",
    },
    {
      icon: <Brain className="h-5 w-5" />,
      label: "Epictus IA",
      path: "/epictus-ia",
      isSpecial: true,
      gradient: "from-cyan-500 to-cyan-600",
      hoverGradient: "from-cyan-600 to-cyan-700",
      iconBg: "bg-gradient-to-r from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30",
      accent: "#06B6D4",
      badge: "IA",
    },
    {
      icon: <Rocket className="h-5 w-5" />,
      label: "School Power",
      path: "/school-power",
      isSpecial: true,
      gradient: "from-orange-500 to-orange-600",
      hoverGradient: "from-orange-600 to-orange-700",
      iconBg: "bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30",
      accent: "#F97316",
      badge: "POWER",
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: "Agenda",
      path: "/agenda",
      component: <AgendaNav />,
      gradient: "from-indigo-500 to-indigo-600",
      hoverGradient: "from-indigo-600 to-indigo-700",
      iconBg: "bg-gradient-to-r from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30",
      accent: "#6366F1",
      subItems: [
        {
          name: "Visão Geral",
          path: "/agenda?view=visao-geral",
          icon: <Home className="h-4 w-4" />,
          color: "#6366F1",
        },
        {
          name: "Calendário",
          path: "/agenda?view=calendario",
          icon: <Calendar className="h-4 w-4" />,
          color: "#6366F1",
        },
        {
          name: "Tarefas",
          path: "/agenda?view=tarefas",
          icon: <CheckSquare className="h-4 w-4" />,
          color: "#6366F1",
        },
        {
          name: "Desafios",
          path: "/agenda?view=desafios",
          icon: <Target className="h-4 w-4" />,
          color: "#6366F1",
        },
      ],
    },
    {
      icon: <Trophy className="h-5 w-5" />,
      label: "Conquistas",
      path: "/conquistas",
      gradient: "from-yellow-500 to-yellow-600",
      hoverGradient: "from-yellow-600 to-yellow-700",
      iconBg: "bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30",
      accent: "#EAB308",
    },
    {
      icon: <Wallet className="h-5 w-5" />,
      label: "Carteira",
      path: "/carteira",
      gradient: "from-green-500 to-green-600",
      hoverGradient: "from-green-600 to-green-700",
      iconBg: "bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30",
      accent: "#22C55E",
    },
  ];

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
          "bg-white dark:bg-[#001427] p-4 mb-4 flex flex-col items-center relative group",
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
                "bg-white dark:bg-[#29335C]/20 rounded-xl border border-gray-200 dark:border-[#29335C]/30 backdrop-blur-sm relative backface-hidden",
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
              {!isCollapsed && (
                <button
                  className="absolute top-3 right-3 w-6 h-6 rounded-full border-2 border-orange-500 bg-orange-600 bg-opacity-20 hover:bg-orange-600 hover:bg-opacity-30 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm cursor-pointer z-10"
                  onClick={() => setIsCardFlipped(!isCardFlipped)}
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
              {!isCollapsed && (
                <button
                  className="absolute top-3 right-3 w-6 h-6 rounded-full border-2 border-[#2462EA] bg-[#0f26aa] bg-opacity-20 hover:bg-[#0f26aa] hover:bg-opacity-30 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm cursor-pointer z-10"
                  onClick={() => setIsCardFlipped(!isCardFlipped)}
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
        <nav className="grid gap-1 px-2">
          {navItems.map((item, index) => (
            <div key={index} className="relative">
              {item.component ? (
                isCollapsed ? (
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex items-center justify-center rounded-lg px-3 py-2 text-start w-full",
                      isActive(item.path)
                        ? "bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 dark:text-[#FF6B00]"
                        : "text-[#001427] hover:bg-[#FF6B00]/5 dark:text-white dark:hover:bg-[#FF6B00]/10",
                      "group hover:scale-[1.02] transition-all duration-200 hover:shadow-sm active:scale-[0.98]",
                    )}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <div className="mx-auto">
                      {item.label === "Portal" ? (
                        <BookMarked className="h-5 w-5 text-[#001427] dark:text-white" />
                      ) : (
                        <Calendar className="h-5 w-5 text-[#001427] dark:text-white" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "absolute left-0 top-0 h-full w-1 rounded-r-md transition-all duration-300",
                        isActive(item.path)
                          ? "bg-[#FF6B00]"
                          : "bg-transparent group-hover:bg-[#FF6B00]/30",
                      )}
                    />
                  </Button>
                ) : (
                  item.component
                )
              ) : (
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-start w-full relative overflow-hidden backdrop-blur-sm",
                    isCollapsed ? "justify-center" : "justify-between",
                    isActive(item.path)
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-${item.accent}20 dark:shadow-${item.accent}30`
                      : "text-[#001427] hover:bg-white/80 dark:text-white dark:hover:bg-white/5 hover:shadow-md",
                    "group hover:scale-[1.02] transition-all duration-300 hover:shadow-lg active:scale-[0.98]",
                    "border border-transparent hover:border-white/20 dark:hover:border-white/10",
                  )}
                  style={{
                    background: isActive(item.path) 
                      ? `linear-gradient(135deg, ${item.accent}15 0%, ${item.accent}25 100%)`
                      : undefined,
                    borderColor: isActive(item.path) 
                      ? `${item.accent}40`
                      : undefined,
                  }}
                  onClick={(e) => {
                    if (item.subItems && !isCollapsed) {
                      e.preventDefault();
                      toggleSection(item.label);
                    } else {
                      handleNavigation(item.path, item.isSpecial);
                    }
                  }}
                >
                  {/* Gradient overlay for active state */}
                  {isActive(item.path) && (
                    <div 
                      className="absolute inset-0 rounded-xl opacity-10"
                      style={{
                        background: `linear-gradient(135deg, ${item.accent} 0%, transparent 100%)`
                      }}
                    />
                  )}
                  
                  {/* Hover glow effect */}
                  <div 
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${item.accent} 0%, transparent 100%)`
                    }}
                  />
                  
                  <div className="flex items-center relative z-10">
                    {/* Sophisticated icon container */}
                    <div
                      className={cn(
                        "relative transition-all duration-300 rounded-lg p-2 flex items-center justify-center",
                        isCollapsed ? "mx-auto" : "mr-3",
                        isActive(item.path)
                          ? "text-white transform scale-110"
                          : `text-[${item.accent}] ${item.iconBg}`,
                        "group-hover:scale-110 group-hover:rotate-3",
                      )}
                      style={{
                        color: isActive(item.path) ? 'white' : item.accent,
                      }}
                    >
                      {/* Icon glow effect */}
                      <div 
                        className={cn(
                          "absolute inset-0 rounded-lg blur-md opacity-0 transition-opacity duration-300",
                          isActive(item.path) ? "opacity-30" : "group-hover:opacity-20"
                        )}
                        style={{
                          background: item.accent,
                        }}
                      />
                      
                      <div className="relative z-10">
                        {item.icon}
                      </div>
                      
                      {/* Pulse animation for special items */}
                      {item.isSpecial && (
                        <div 
                          className="absolute inset-0 rounded-lg animate-pulse opacity-20"
                          style={{
                            background: `linear-gradient(45deg, ${item.accent}, transparent)`
                          }}
                        />
                      )}
                    </div>
                    
                    {!isCollapsed && (
                      <div className="flex items-center gap-2 flex-1">
                        <span
                          className={cn(
                            "font-medium transition-all duration-300",
                            isActive(item.path)
                              ? "text-white"
                              : "text-[#001427] dark:text-white group-hover:font-semibold",
                            item.isSpecial ? "tracking-wide" : "",
                          )}
                        >
                          {item.label}
                        </span>
                        
                        {/* Special badges for AI and Power items */}
                        {item.badge && (
                          <span 
                            className={cn(
                              "px-2 py-0.5 text-xs rounded-full font-bold tracking-wider",
                              "bg-gradient-to-r text-white shadow-sm",
                              isActive(item.path) 
                                ? "bg-white/20 text-white" 
                                : "text-white"
                            )}
                            style={{
                              background: isActive(item.path) 
                                ? 'rgba(255,255,255,0.2)' 
                                : `linear-gradient(135deg, ${item.accent}, ${item.accent}dd)`
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {!isCollapsed && item.subItems && (
                    <div 
                      className={cn(
                        "transition-all duration-300 rounded p-1",
                        isActive(item.path) ? "text-white" : `text-[${item.accent}]`
                      )}
                      style={{
                        color: isActive(item.path) ? 'white' : item.accent,
                      }}
                    >
                      {expandedSection === item.label ? (
                        <ChevronUp className="h-4 w-4 transform rotate-180 transition-transform duration-300" />
                      ) : (
                        <ChevronDown className="h-4 w-4 transition-transform duration-300" />
                      )}
                    </div>
                  )}
                  
                  {/* Sophisticated left accent bar */}
                  <div
                    className={cn(
                      "absolute left-0 top-0 h-full w-1 rounded-r-full transition-all duration-300",
                      isActive(item.path)
                        ? "w-2 opacity-100 shadow-lg"
                        : "w-0 opacity-0 group-hover:w-1 group-hover:opacity-60",
                    )}
                    style={{
                      background: `linear-gradient(to bottom, ${item.accent}, ${item.accent}80)`,
                      boxShadow: isActive(item.path) ? `0 0 20px ${item.accent}60` : 'none',
                    }}
                  />
                  
                  {/* Bottom glow line for active items */}
                  {isActive(item.path) && (
                    <div 
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 rounded-full opacity-60"
                      style={{
                        background: `linear-gradient(to right, transparent, ${item.accent}, transparent)`,
                        boxShadow: `0 0 10px ${item.accent}`,
                      }}
                    />
                  )}
                </Button>
              )}

              {/* Sophisticated Sub Items with enhanced animation */}
              {!isCollapsed &&
                item.subItems &&
                expandedSection === item.label && (
                  <div className="mt-2 space-y-1 pl-4 border-l-2 border-gradient-to-b relative">
                    {/* Animated connection line */}
                    <div 
                      className="absolute left-0 top-0 w-0.5 h-full rounded-full opacity-30 animate-pulse"
                      style={{
                        background: `linear-gradient(to bottom, ${item.accent}60, transparent)`,
                      }}
                    />
                    
                    {item.subItems.map((subItem, subIndex) => (
                      <Button
                        key={subIndex}
                        variant="ghost"
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-start w-full justify-start relative overflow-hidden",
                          "backdrop-blur-sm transition-all duration-300 border border-transparent",
                          isActive(subItem.path)
                            ? "bg-gradient-to-r text-white shadow-md font-medium transform scale-105"
                            : "text-[#001427] hover:bg-white/60 dark:text-white dark:hover:bg-white/10 hover:shadow-sm",
                          "group hover:translate-x-2 hover:scale-[1.02] active:scale-[0.98]",
                        )}
                        style={{
                          background: isActive(subItem.path) 
                            ? `linear-gradient(135deg, ${subItem.color}20 0%, ${subItem.color}10 100%)`
                            : undefined,
                          borderColor: isActive(subItem.path) 
                            ? `${subItem.color}30`
                            : undefined,
                        }}
                        onClick={() => navigate(subItem.path)}
                      >
                        {/* Gradient overlay for active state */}
                        {isActive(subItem.path) && (
                          <div 
                            className="absolute inset-0 rounded-lg opacity-5"
                            style={{
                              background: `linear-gradient(135deg, ${subItem.color} 0%, transparent 100%)`
                            }}
                          />
                        )}
                        
                        {/* Hover effect */}
                        <div 
                          className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-3 transition-opacity duration-300"
                          style={{
                            background: `linear-gradient(135deg, ${subItem.color} 0%, transparent 100%)`
                          }}
                        />
                        
                        {/* Sophisticated icon container */}
                        <div
                          className={cn(
                            "relative transition-all duration-300 rounded-md p-1.5 flex items-center justify-center",
                            isActive(subItem.path)
                              ? "transform scale-110 text-white"
                              : "text-[#001427] dark:text-white group-hover:scale-110",
                            "group-hover:rotate-6",
                          )}
                          style={{
                            background: isActive(subItem.path) 
                              ? `${subItem.color}20` 
                              : `${subItem.color}10`,
                            color: isActive(subItem.path) ? subItem.color : undefined,
                          }}
                        >
                          {/* Icon glow effect */}
                          <div 
                            className={cn(
                              "absolute inset-0 rounded-md blur-sm opacity-0 transition-opacity duration-300",
                              isActive(subItem.path) ? "opacity-20" : "group-hover:opacity-10"
                            )}
                            style={{
                              background: subItem.color,
                            }}
                          />
                          
                          <div className="relative z-10">
                            {subItem.icon}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 w-full relative z-10">
                          <span 
                            className={cn(
                              "font-medium transition-all duration-300",
                              isActive(subItem.path)
                                ? "font-semibold"
                                : "group-hover:font-semibold",
                            )}
                            style={{
                              color: isActive(subItem.path) ? subItem.color : undefined,
                            }}
                          >
                            {subItem.name}
                          </span>
                        </div>
                        
                        {/* Connection dot */}
                        <div 
                          className={cn(
                            "absolute -left-4 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full transition-all duration-300",
                            isActive(subItem.path) ? "scale-125 opacity-100" : "scale-75 opacity-40 group-hover:scale-100 group-hover:opacity-70"
                          )}
                          style={{
                            background: subItem.color,
                            boxShadow: isActive(subItem.path) ? `0 0 10px ${subItem.color}60` : 'none',
                          }}
                        />
                        
                        {/* Micro accent line */}
                        <div
                          className={cn(
                            "absolute bottom-0 left-0 h-0.5 rounded-full transition-all duration-300",
                            isActive(subItem.path) ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-1/3 group-hover:opacity-60"
                          )}
                          style={{
                            background: `linear-gradient(to right, ${subItem.color}, transparent)`,
                            boxShadow: isActive(subItem.path) ? `0 0 5px ${subItem.color}40` : 'none',
                          }}
                        />
                      </Button>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}