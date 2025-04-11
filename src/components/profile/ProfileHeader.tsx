import React, { useRef, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Diamond, Share2, Edit, Award, Users, Sparkles, ChevronUp, Trophy, BookOpen, Zap } from "lucide-react";
import type { UserProfile } from "@/types/user-profile";

interface ProfileHeaderProps {
  userProfile: UserProfile | null;
  onEditClick: () => void;
}

export default function ProfileHeader({
  userProfile,
  onEditClick,
}: ProfileHeaderProps) {
  const profileNameRef = useRef<HTMLHeadingElement>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (
      userProfile?.display_name &&
      userProfile.display_name.trim() !== ""
    ) {
      setDisplayName(userProfile.display_name);
    }
  }, [userProfile]);

  // Animação suave para a barra de progresso
  useEffect(() => {
    const interval = setInterval(() => {
      const progressBar = document.querySelector('.progress-animation');
      if (progressBar) {
        progressBar.classList.add('animate-pulse');
        setTimeout(() => {
          progressBar?.classList.remove('animate-pulse');
        }, 500);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 shadow-lg overflow-hidden relative group hover:shadow-xl transition-all duration-300">
      {/* Efeito decorativo no canto */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#FF6B00]/10 to-transparent rounded-bl-full z-0 opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Cover Photo com gradiente animado */}
      <div className="bg-gradient-to-r from-[#001427] via-[#072e4f] to-[#0A2540] h-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern-grid.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#001427]/80 to-transparent"></div>

        {/* Brilho decorativo animado */}
        <div className="absolute top-5 right-8 w-12 h-12 rounded-full bg-[#FF6B00]/20 blur-xl animate-pulse"></div>

        {/* Status badge */}
        <div className="absolute top-4 right-4">
          <div className="bg-[#00b894]/90 text-white text-xs py-1 px-3 rounded-full flex items-center">
            <span className="animate-pulse w-2 h-2 rounded-full bg-white mr-2"></span>
            Online
          </div>
        </div>

        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 z-10">
          <div className="relative group">
            <Avatar className="w-24 h-24 border-4 border-white dark:border-[#0A2540] shadow-lg group-hover:scale-105 transition-transform duration-300">
              <AvatarImage
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                alt="Avatar"
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-[#FF6B00] to-[#FF9B50]">U</AvatarFallback>
            </Avatar>

            {/* Indicador de status premium */}
            <div className="absolute -bottom-1 -right-1">
              <div className="bg-[#FF6B00] text-white text-xs p-1 rounded-full w-7 h-7 flex items-center justify-center shadow-md">
                <Trophy className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-16 pb-6 px-6 text-center relative z-10">
        <h2
          ref={profileNameRef}
          className="text-xl font-bold text-[#29335C] dark:text-white profile-3d-element profile-3d-text group-hover:scale-105 transition-transform duration-300"
        >
          {displayName || userProfile?.display_name || userProfile?.username || "Usuário"}
        </h2>

        <div className="flex items-center justify-center gap-1 mt-1">
          <p className="text-xs text-[#64748B] dark:text-white/60 bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded-full">
            ID: {userProfile?.user_id || "--"}
          </p>
        </div>

        <div className="flex items-center justify-center gap-1 mt-2">
          <span className="bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] text-white text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm group-hover:shadow transition-shadow duration-300">
            <Diamond className="h-3.5 w-3.5" />
            {userProfile?.plan_type === "premium" ? "Plano Premium" : "Plano Lite"}
          </span>
        </div>

        <p className="text-[#64748B] dark:text-white/60 text-sm mt-3 bg-slate-50 dark:bg-slate-800/30 py-1 px-3 rounded-full inline-block">
          <BookOpen className="w-3.5 h-3.5 inline-block mr-1.5 text-[#FF6B00]" />
          Estudante de Engenharia de Software
        </p>

        {/* Stats com ícones e hover effects */}
        <div className="flex justify-center gap-6 mt-6">
          <div className="text-center group/stat bg-slate-50 dark:bg-slate-800/30 px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/30 transition-colors duration-200">
            <div className="flex items-center justify-center mb-1">
              <Zap className="h-4 w-4 text-[#FF6B00] mr-1 group-hover/stat:animate-pulse" />
              <p className="text-lg font-bold text-[#29335C] dark:text-white">
                {userProfile?.level || 1}
              </p>
            </div>
            <p className="text-xs text-[#64748B] dark:text-white/60">Nível</p>
          </div>

          <div className="text-center group/stat bg-slate-50 dark:bg-slate-800/30 px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/30 transition-colors duration-200">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-[#FF6B00] mr-1 group-hover/stat:animate-pulse" />
              <p className="text-lg font-bold text-[#29335C] dark:text-white">8</p>
            </div>
            <p className="text-xs text-[#64748B] dark:text-white/60">Turmas</p>
          </div>

          <div className="text-center group/stat bg-slate-50 dark:bg-slate-800/30 px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/30 transition-colors duration-200">
            <div className="flex items-center justify-center mb-1">
              <Award className="h-4 w-4 text-[#FF6B00] mr-1 group-hover/stat:animate-pulse" />
              <p className="text-lg font-bold text-[#29335C] dark:text-white">
                12
              </p>
            </div>
            <p className="text-xs text-[#64748B] dark:text-white/60">
              Conquistas
            </p>
          </div>
        </div>

        {/* Barra de progresso estilizada */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-1.5">
            <div className="flex items-center">
              <ChevronUp className="h-3.5 w-3.5 text-[#FF6B00] mr-1" />
              <span className="text-xs text-[#64748B] dark:text-white/60">
                Progresso para o próximo nível
              </span>
            </div>
            <div 
              className="text-xs font-medium px-1.5 py-0.5 rounded-md bg-[#FF6B00]/10 text-[#FF6B00]"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              72%
              {showTooltip && (
                <div className="absolute right-6 -mt-8 px-2 py-1 bg-black/80 text-white text-xs rounded z-50">
                  Faltam 280 XP
                </div>
              )}
            </div>
          </div>
          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] rounded-full progress-animation relative"
              style={{ width: '72%' }}
            >
              <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Botões modernizados */}
        <div className="mt-6 flex gap-2">
          <Button
            className="flex-1 bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] hover:from-[#FF5B00] hover:to-[#FF8B40] text-white shadow-md hover:shadow-lg transition-all duration-300"
            onClick={onEditClick}
          >
            <Edit className="h-4 w-4 mr-2" /> Editar Perfil
          </Button>
          <Button
            variant="outline"
            className="w-10 h-10 p-0 border-[#E0E1DD] dark:border-white/10 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 group/share transition-all duration-300"
          >
            <Share2 className="h-4 w-4 text-[#64748B] dark:text-white/60 group-hover/share:text-[#FF6B00] transition-colors duration-300" />
          </Button>
        </div>

        {/* Indicador de conquistas recentes */}
        <div className="mt-4 flex justify-center">
          <div className="px-3 py-1 bg-slate-50 dark:bg-slate-800/30 rounded-full text-xs text-[#64748B] dark:text-white/60 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
            <span>3 novas conquistas esta semana</span>
          </div>
        </div>
      </div>
    </div>
  );
}