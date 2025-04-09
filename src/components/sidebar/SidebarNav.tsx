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
  const [showNovidadesPopup, setShowNovidadesPopup] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (error) {
            console.error("Error fetching user profile:", error);
          } else if (data) {
            setUserProfile(data as UserProfile);
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
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
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      label: "Minhas Turmas",
      path: "/turmas",
      component: <TurmasNav />,
      subItems: [
        {
          name: "Visão Geral",
          path: "/turmas",
          icon: <Home className="h-4 w-4 text-[#29335C]" />,
        },
        {
          name: "Turmas Ativas",
          path: "/turmas?view=ativas",
          icon: <BookOpen className="h-4 w-4 text-[#29335C]" />,
        },
        {
          name: "Grupos de Estudo",
          path: "/turmas?view=grupos",
          icon: <Users2 className="h-4 w-4 text-[#29335C]" />,
        },
        {
          name: "Desempenho",
          path: "/turmas?view=desempenho",
          icon: <BarChart className="h-4 w-4 text-[#29335C]" />,
        },
      ],
    },
    {
      icon: <Users2 className="h-5 w-5" />,
      label: "Comunidades",
      path: "/comunidades",
    },
    {
      icon: <MessageCircle className="h-5 w-5" />,
      label: "Conexão Expert",
      path: "/pedidos-ajuda",
      isSpecial: true,
    },
    {
      icon: <Brain className="h-5 w-5" />,
      label: "Epictus IA",
      path: "/epictus-ia",
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: "Agenda",
      path: "/agenda",
      component: <AgendaNav />,
      subItems: [
        {
          name: "Visão Geral",
          path: "/agenda?view=visao-geral",
          icon: <Home className="h-4 w-4 text-[#29335C]" />,
        },
        {
          name: "Calendário",
          path: "/agenda?view=calendario",
          icon: <Calendar className="h-4 w-4 text-[#29335C]" />,
        },
        {
          name: "Tarefas",
          path: "/agenda?view=tarefas",
          icon: <CheckSquare className="h-4 w-4 text-[#29335C]" />,
        },
        {
          name: "Desafios",
          path: "/agenda?view=desafios",
          icon: <Target className="h-4 w-4 text-[#29335C]" />,
        },
      ],
    },
    {
      icon: <BookMarked className="h-5 w-5" />,
      label: "Portal",
      path: "/portal",
    },
    {
      icon: <Compass className="h-5 w-5" />,
      label: "Explorar",
      path: "/explorar",
      subItems: [
        {
          name: "Trilha School",
          path: "/trilha-conhecimento",
          icon: <Map className="h-4 w-4 text-[#FF6B00]" />,
        },
        {
          name: "Trade School",
          path: "/trade-school",
          icon: <GraduationCap className="h-4 w-4 text-[#FF6B00]" />,
        },
        {
          name: "Eventos",
          path: "/eventos",
          icon: <CalendarClock className="h-4 w-4 text-[#FF6B00]" />,
        },
        {
          name: "EPC",
          path: "/epc",
          icon: <Upload className="h-4 w-4 text-[#FF6B00]" />,
        },
      ],
    },

    {
      icon: <ShoppingCart className="h-5 w-5" />,
      label: "Mercado",
      path: "/mercado",
    },
    {
      icon: <Trophy className="h-5 w-5" />,
      label: "Conquistas",
      path: "/conquistas",
    },
    {
      icon: <Wallet className="h-5 w-5" />,
      label: "Carteira",
      path: "/carteira",
    },
    {
      icon: <Rocket className="h-5 w-5" />,
      label: "Novidades",
      path: "/novidades",
      isSpecial: true,
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

      {/* Novidades Popup - Center of the screen */}
      {showNovidadesPopup && (
        <div className="fixed inset-0 z-[9999] bg-background/60 backdrop-blur-sm flex items-center justify-center">
          <div className="w-[600px] max-w-[90vw] max-h-[80vh] overflow-hidden">
            <div className="relative bg-white dark:bg-[#121212] rounded-xl shadow-xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <Rocket className="h-6 w-6 text-[#FF6B00]" />
                  <h2 className="text-2xl font-semibold text-[#FF6B00]">
                    Novidades da Plataforma
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNovidadesPopup(false)}
                  className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-[#FF6B00]"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-hidden p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Rocket className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    Página de Novidades em Desenvolvimento
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Esta funcionalidade está sendo implementada e estará
                    disponível em breve.
                  </p>
                  <Button
                    className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                    onClick={() => setShowNovidadesPopup(false)}
                  >
                    Entendi
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Component - Exactly like the image */}
      <div className="bg-white dark:bg-[#001427] p-3 mb-4 mt-2 flex flex-col items-center relative group">
        <div className="relative mb-2">
          <div
            className="rounded-full overflow-hidden mx-auto relative group"
            style={{
              width: isCollapsed ? "40px" : "60px",
              height: isCollapsed ? "40px" : "60px",
              background: "linear-gradient(45deg, #FFD700, #FF6B00, #FF0000)",
              padding: "2px",
            }}
          >
            <div
              className="cursor-pointer w-full h-full rounded-full overflow-hidden relative"
              style={{
                background: "#001427",
                padding: "2px",
              }}
            >
              <img
                src={
                  profileImage ||
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&mouth=smile&eyes=happy"
                }
                alt="Perfil do Usuário"
                className="w-full h-full object-cover rounded-full"
              />
              <div
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                onClick={handleImageUploadClick}
              >
                <Upload className="h-5 w-5 text-white" />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>
        </div>
        {!isCollapsed && (
          <div className="text-[#001427] dark:text-white text-center">
            <h3 className="font-semibold text-base mb-2 flex items-center justify-center">
              <span className="mr-1">👋</span> Olá{" "}
              {userProfile?.display_name || userProfile?.username || "Usuário"}
            </h3>
            <div className="flex flex-col items-center mt-1">
              <p className="text-xs text-[#001427]/70 dark:text-white/70 mb-0.5">
                Nível 37
              </p>
              <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FFD700] via-[#FF6B00] to-[#FF0000] rounded-full"
                  style={{ width: "60%" }}
                ></div>
              </div>
              <span className="text-[10px] text-[#FF6B00] mt-0.5">
                1.500 XP / 3.000 XP
              </span>
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="h-[calc(100%-180px)] py-2">
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
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-start w-full",
                    isCollapsed ? "justify-center" : "justify-between",
                    isActive(item.path)
                      ? "bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 dark:text-[#FF6B00]"
                      : "text-[#001427] hover:bg-[#FF6B00]/5 dark:text-white dark:hover:bg-[#FF6B00]/10",
                    "group hover:scale-[1.02] transition-all duration-200 hover:shadow-sm active:scale-[0.98]",
                    item.label === "Novidades"
                      ? "relative overflow-hidden"
                      : "",
                  )}
                  onClick={(e) => {
                    if (item.subItems && !isCollapsed) {
                      e.preventDefault();
                      toggleSection(item.label);
                    } else {
                      handleNavigation(item.path, item.isSpecial);
                    }
                  }}
                >
                  {item.label === "Novidades" && (
                    <div className="absolute inset-0 rounded-lg border border-transparent bg-gradient-to-r from-[#FFD700] to-[#FF6B00] opacity-10 animate-gradient-x"></div>
                  )}
                  <div className="flex items-center relative z-10">
                    <div
                      className={cn(
                        "transition-all duration-300",
                        isCollapsed ? "mx-auto" : "mr-3",
                        isActive(item.path)
                          ? "text-[#FF6B00] dark:text-[#FF6B00]"
                          : item.label === "Novidades"
                            ? "text-[#FF6B00] dark:text-[#FF6B00]"
                            : "text-[#001427] dark:text-white",
                      )}
                    >
                      {item.icon}
                    </div>
                    {!isCollapsed && (
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            item.label === "Novidades"
                              ? "text-[#FF6B00] font-bold"
                              : "",
                          )}
                        >
                          {item.label}
                        </span>
                        {item.label === "Explorar" && (
                          <span className="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md">
                            Em breve
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {!isCollapsed && item.subItems && (
                    <div className="text-[#001427] dark:text-white">
                      {expandedSection === item.label ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  )}
                  {item.label !== "Novidades" && (
                    <div
                      className={cn(
                        "absolute left-0 top-0 h-full w-1 rounded-r-md transition-all duration-300",
                        isActive(item.path)
                          ? "bg-[#FF6B00]"
                          : "bg-transparent group-hover:bg-[#FF6B00]/30",
                      )}
                    />
                  )}
                </Button>
              )}

              {/* Sub Items */}
              {!isCollapsed &&
                item.subItems &&
                expandedSection === item.label && (
                  <div className="mt-1 space-y-1">
                    {item.subItems.map((subItem, subIndex) => (
                      <Button
                        key={subIndex}
                        variant="ghost"
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-start w-full justify-start",
                          isActive(subItem.path)
                            ? "bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 dark:text-[#FF6B00] font-medium"
                            : "text-[#001427] hover:bg-[#FF6B00]/5 dark:text-white dark:hover:bg-[#FF6B00]/10",
                          "hover:translate-x-1 transition-transform pl-2",
                        )}
                        onClick={() => navigate(subItem.path)}
                      >
                        {subItem.icon}
                        <div className="flex items-center gap-2 w-full">
                          <span>{subItem.name}</span>
                          {item.label === "Explorar" && (
                            <span className="ml-auto">
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
                                className="text-gray-500 dark:text-gray-400"
                              >
                                <rect
                                  width="18"
                                  height="11"
                                  x="3"
                                  y="11"
                                  rx="2"
                                  ry="2"
                                ></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                              </svg>
                            </span>
                          )}
                        </div>
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