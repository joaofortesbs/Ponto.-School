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
  Users,
  GraduationCap,
  Calendar,
  Trophy,
  Search,
  Brain,
  Upload,
  CalendarClock,
  Target,
  Compass,
  Settings,
  HelpCircle,
  Wallet,
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
  const [isUploading, setIsUploading] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);
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
            if (!firstName) setFirstName("Usuário");
          } else if (data) {
            setUserProfile(data as UserProfile);

            if (data.avatar_url) {
              setProfileImage(data.avatar_url);
              localStorage.setItem("userAvatarUrl", data.avatar_url);
            }

            const firstName =
              data.full_name?.split(" ")[0] ||
              data.display_name ||
              data.username ||
              "";

            setFirstName(firstName);
            localStorage.setItem("userFirstName", firstName);

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
          if (!firstName) setFirstName("Usuário");
        }
      } catch (error) {
        console.error("Error:", error);
        if (!firstName) setFirstName("Usuário");
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

        const { data: currentUser } = await supabase.auth.getUser();
        if (!currentUser.user) {
          throw new Error("Usuário não autenticado");
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `avatar-${currentUser.user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

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

        const { data: publicUrlData } = supabase.storage
          .from("profile-images")
          .getPublicUrl(filePath);

        if (!publicUrlData.publicUrl) {
          throw new Error("Não foi possível obter a URL pública da imagem");
        }

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

        setProfileImage(publicUrlData.publicUrl);
        localStorage.setItem("userAvatarUrl", publicUrlData.publicUrl);

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

  const navItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: "Painel",
      path: "/",
    },
    {
      icon: <GraduationCap className="h-5 w-5" />,
      label: "Minhas Turmas",
      path: "/turmas",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Comunidades",
      path: "/comunidades",
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      label: "Trilhas School",
      path: "/biblioteca",
    },
    {
      icon: <Target className="h-5 w-5" />,
      label: "School Planner",
      path: "/agenda",
    },
    {
      icon: <Brain className="h-5 w-5" />,
      label: "Epictus IA",
      path: "/epictus-ia",
      isSpecial: true,
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: "Agenda",
      path: "/agenda",
    },
    {
      icon: <Trophy className="h-5 w-5" />,
      label: "Conquistas",
      path: "/conquistas",
    },
    {
      icon: <Compass className="h-5 w-5" />,
      label: "Explorar",
      path: "/explorar",
    },
  ];

  return (
    <div className="relative h-full bg-gray-50/80 dark:bg-gray-900/50">
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
                <span className="text-xl">×</span>
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <MentorAI />
            </div>
          </div>
        </div>
      )}

      {/* User Profile Component */}
      {!isCollapsed && (
        <div className="p-4 mb-6">
          <div className="relative flex items-center space-x-3 p-3 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
            <div
              className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-orange-400 to-orange-600 p-0.5 cursor-pointer transition-all duration-300 hover:scale-105"
              onClick={handleImageUploadClick}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-800 flex items-center justify-center">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={() => setProfileImage(null)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {firstName ? firstName.charAt(0).toUpperCase() : "U"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {firstName || "Usuário"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Nível {userProfile?.level || 1} • Estudante
              </p>
            </div>

            <div className="w-2 h-2 rounded-full bg-orange-500"></div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>
      )}

      <ScrollArea className={cn("px-3", isCollapsed ? "h-[calc(100%-80px)]" : "h-[calc(100%-200px)]")}>
        <nav className="space-y-1">
          {navItems.map((item, index) => (
            <div key={index} className="relative">
              <Button
                variant="ghost"
                className={cn(
                  "w-full flex items-center gap-3 h-12 px-3 rounded-xl text-left font-medium transition-all duration-200",
                  isCollapsed ? "justify-center" : "justify-start",
                  isActive(item.path)
                    ? "bg-orange-500 text-white shadow-lg hover:bg-orange-600"
                    : "text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400"
                )}
                onClick={() => handleNavigation(item.path, item.isSpecial)}
              >
                <div className={cn(
                  "transition-all duration-300",
                  isActive(item.path)
                    ? "text-white"
                    : "text-orange-500"
                )}>
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <span className="truncate">
                    {item.label}
                  </span>
                )}
              </Button>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Bottom Navigation */}
      {!isCollapsed && (
        <div className="mt-auto p-3 space-y-1">
          <Button
            variant="ghost"
            className="w-full flex items-center gap-3 h-12 px-3 rounded-xl text-left font-medium text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200"
            onClick={() => navigate("/carteira")}
          >
            <Wallet className="h-5 w-5 text-orange-500" />
            <span>Carteira</span>
          </Button>

          <Button
            variant="ghost"
            className="w-full flex items-center gap-3 h-12 px-3 rounded-xl text-left font-medium text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200"
            onClick={() => navigate("/ajuda")}
          >
            <HelpCircle className="h-5 w-5 text-orange-500" />
            <span>Ajuda</span>
          </Button>

          <Button
            variant="ghost"
            className="w-full flex items-center gap-3 h-12 px-3 rounded-xl text-left font-medium text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200"
            onClick={() => navigate("/configuracoes")}
          >
            <Settings className="h-5 w-5 text-orange-500" />
            <span>Configurações</span>
          </Button>
        </div>
      )}
    </div>
  );
}