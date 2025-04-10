
import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Edit, Share2, Diamond, Camera, ChevronRight, ExternalLink, UserCircle, Copy } from "lucide-react";
import type { UserProfile } from "@/types/user-profile";
import { profileService } from "@/services/profileService";
import { generateUserIdSupabase } from "@/lib/generate-user-id";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProfileHeaderProps {
  userProfile: UserProfile | null;
  onEditClick: () => void;
}

export default function ProfileHeader({
  userProfile,
  onEditClick,
}: ProfileHeaderProps) {
  const profileContainerRef = useRef<HTMLDivElement>(null);
  const profileNameRef = useRef<HTMLHeadingElement>(null);
  const profileAvatarRef = useRef<HTMLDivElement>(null);
  const profileLevelRef = useRef<HTMLParagraphElement>(null);
  const [displayName, setDisplayName] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(72);
  const [hoverState, setHoverState] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!profileContainerRef.current || !hoverState) return;

      const container = profileContainerRef.current;
      const rect = container.getBoundingClientRect();

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 5;
      const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -5;

      if (profileNameRef.current) {
        profileNameRef.current.style.transform = `rotateX(${rotateX * 0.8}deg) rotateY(${rotateY * 0.8}deg) translateZ(10px)`;
        profileNameRef.current.style.textShadow = `${rotateY * 0.2}px ${rotateX * -0.2}px 2px rgba(0,0,0,0.2)`;
      }

      if (profileAvatarRef.current) {
        profileAvatarRef.current.style.transform = `rotateX(${rotateX * 0.7}deg) rotateY(${rotateY * 0.7}deg) translateZ(20px)`;
        profileAvatarRef.current.style.boxShadow = `${rotateY * 0.5}px ${rotateX * -0.5}px 20px rgba(0,0,0,0.2)`;
      }

      if (profileLevelRef.current) {
        profileLevelRef.current.style.transform = `rotateX(${rotateX * 1.2}deg) rotateY(${rotateY * 1.2}deg) translateZ(15px)`;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [hoverState]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Carregar nome de exibição
        const name = await profileService.getUserDisplayName();
        setDisplayName(name || "Usuário");
        
        // Gerar ou obter ID do usuário
        if (!userProfile?.user_id) {
          const planType = userProfile?.plan_type || "lite";
          const newUserId = await generateUserIdSupabase(planType);
          setUserId(newUserId);
        } else {
          setUserId(userProfile.user_id);
        }
        
        // Simulação de progresso animado
        const randomProgress = Math.floor(Math.random() * 30) + 60;
        setProgress(0);
        setTimeout(() => {
          setProgress(randomProgress);
        }, 500);
      } catch (error) {
        console.error("Error loading user data:", error);
        setDisplayName("Usuário");
        setUserId("BR2-" + Date.now() + "-" + Math.floor(Math.random() * 10000));
      }
    };

    loadUserData();
  }, [userProfile]);

  const copyUserId = () => {
    if (userId) {
      navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const emojiForLevel = (level: number) => {
    if (level < 5) return "🌱";
    if (level < 10) return "🌿";
    if (level < 15) return "🌲";
    if (level < 20) return "🌟";
    return "🏆";
  };

  return (
    <motion.div
      ref={profileContainerRef}
      className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden shadow-sm profile-3d-container"
      style={{ 
        perspective: "1000px",
        transformStyle: "preserve-3d",
        transition: "transform 0.3s ease, box-shadow 0.5s ease" 
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setHoverState(true)}
      onMouseLeave={() => {
        setHoverState(false);
        if (profileNameRef.current) profileNameRef.current.style.transform = "";
        if (profileAvatarRef.current) profileAvatarRef.current.style.transform = "";
        if (profileLevelRef.current) profileLevelRef.current.style.transform = "";
      }}
      whileHover={{ 
        boxShadow: "0 22px 40px rgba(0, 0, 0, 0.15)",
      }}
    >
      <div className="relative">
        <motion.div 
          className="h-32 bg-gradient-to-r from-[#29335C] to-[#001427]"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iLjA1IiBkPSJNMCAwaDYwMHY2MDBIMHoiLz48L3N2Zz4=')]"
               style={{ mixBlendMode: 'overlay' }}></div>
        </motion.div>
        <motion.div 
          className="absolute top-20 left-1/2 transform -translate-x-1/2"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="relative">
            <div
              ref={profileAvatarRef}
              className="w-24 h-24 rounded-full border-4 border-white dark:border-[#0A2540] overflow-hidden bg-white dark:bg-[#0A2540] profile-3d-element profile-3d-avatar"
              style={{ 
                transition: "transform 0.2s ease-out, box-shadow 0.2s ease-out",
                transformStyle: "preserve-3d"
              }}
            >
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                alt="Profile"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B00]/0 via-[#FF6B00]/0 to-[#FF6B00]/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <motion.button 
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#FF6B00] text-white flex items-center justify-center hover:bg-[#FF6B00]/90 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Camera className="h-4 w-4" />
            </motion.button>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="pt-16 pb-6 px-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2
          ref={profileNameRef}
          className="text-xl font-bold text-[#29335C] dark:text-white profile-3d-element profile-3d-text bg-clip-text"
          style={{ 
            transition: "transform 0.2s ease-out, text-shadow 0.2s ease-out",
            transformStyle: "preserve-3d"
          }}
        >
          {displayName || userProfile?.display_name || userProfile?.username || "Usuário"}
        </h2>
        
        <div className="flex items-center justify-center gap-1 mt-2">
          <p className="text-xs text-[#64748B] dark:text-white/60 flex items-center">
            ID: 
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span 
                    className="ml-1 cursor-pointer font-mono text-[#FF6B00] dark:text-[#FF6B00] font-medium hover:underline flex items-center" 
                    onClick={copyUserId}
                  >
                    {userId || "Carregando..."}
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: copied ? 1 : 0 }}
                      className="ml-1 text-green-500"
                    >
                      {copied ? "✓" : ""}
                    </motion.span>
                    <Copy className="h-3 w-3 ml-1 opacity-70" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clique para copiar seu ID</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </p>
        </div>
        
        <motion.div 
          className="flex items-center justify-center gap-1 mt-1"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Diamond className="h-4 w-4 text-[#FF6B00]" />
          <span className={cn(
            "text-sm font-medium",
            userProfile?.plan_type === "premium" 
              ? "text-[#FF6B00] bg-gradient-to-r from-[#FF6B00] to-[#FFB566] bg-clip-text text-transparent" 
              : "text-[#FF6B00]"
          )}>
            {userProfile?.plan_type === "premium"
              ? "Plano Premium"
              : "Plano Lite"}
          </span>
        </motion.div>
        
        <p className="text-[#64748B] dark:text-white/60 text-sm mt-2">
          Estudante de Engenharia de Software
        </p>

        <motion.div 
          className="flex items-center justify-center gap-4 mt-6 bg-[#F8F9FA] dark:bg-[#0d2e49] rounded-lg p-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-center relative group">
            <HoverCard>
              <HoverCardTrigger asChild>
                <div>
                  <p
                    ref={profileLevelRef}
                    className="text-lg font-bold text-[#29335C] dark:text-white profile-3d-element profile-3d-text flex items-center justify-center"
                    style={{ 
                      transition: "transform 0.2s ease-out",
                      transformStyle: "preserve-3d"
                    }}
                  >
                    <span className="mr-1">{userProfile?.level || 1}</span>
                    <span className="text-sm">{emojiForLevel(userProfile?.level || 1)}</span>
                  </p>
                  <p className="text-xs text-[#64748B] dark:text-white/60">Nível</p>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-60">
                <div className="flex flex-col space-y-2">
                  <h4 className="text-sm font-semibold">Nível de Experiência</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Avance de nível completando desafios, participando de aulas e contribuindo em turmas.
                  </p>
                  <div className="text-xs flex items-center text-slate-500">
                    <ChevronRight className="h-3 w-3 mr-1 text-[#FF6B00]" /> 
                    Próximo nível: {(userProfile?.level || 1) + 1}
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
          
          <div className="h-10 border-r border-[#E0E1DD] dark:border-white/10"></div>
          
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="text-center cursor-pointer">
                <p className="text-lg font-bold text-[#29335C] dark:text-white">
                  8
                </p>
                <p className="text-xs text-[#64748B] dark:text-white/60">Turmas</p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-60">
              <div className="flex flex-col space-y-2">
                <h4 className="text-sm font-semibold">Suas Turmas</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Você participa de 8 turmas. Administra 3 delas como líder.
                </p>
                <div className="text-xs flex items-center text-slate-500">
                  <ChevronRight className="h-3 w-3 mr-1 text-[#FF6B00]" /> 
                  Clique para ver detalhes
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
          
          <div className="h-10 border-r border-[#E0E1DD] dark:border-white/10"></div>
          
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="text-center cursor-pointer">
                <p className="text-lg font-bold text-[#29335C] dark:text-white group-hover:text-[#FF6B00] transition-colors">
                  12
                </p>
                <p className="text-xs text-[#64748B] dark:text-white/60">
                  Conquistas
                </p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-60">
              <div className="flex flex-col space-y-2">
                <h4 className="text-sm font-semibold">Suas Conquistas</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Você desbloqueou 12 de 50 conquistas disponíveis.
                </p>
                <div className="text-xs flex items-center text-slate-500">
                  <ChevronRight className="h-3 w-3 mr-1 text-[#FF6B00]" /> 
                  Próxima conquista: Mestre do Conhecimento
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </motion.div>

        <motion.div 
          className="mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-[#64748B] dark:text-white/60">
              Progresso para o próximo nível
            </span>
            <Badge variant="outline" className="bg-[#FF6B00]/10 text-[#FF6B00] border-none">
              {progress}%
            </Badge>
          </div>
          <Progress value={progress} className="h-2" indicatorClassName="bg-gradient-to-r from-[#FF6B00] to-[#FFB566]" />
        </motion.div>

        <motion.div 
          className="mt-6 flex gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div 
            className="flex-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8F3F] hover:from-[#FF7A1F] hover:to-[#FF9F5F] text-white shadow-md shadow-[#FF6B00]/20"
              onClick={onEditClick}
            >
              <Edit className="h-4 w-4 mr-2" /> Editar Perfil
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <Button
              variant="outline"
              className="w-10 h-10 p-0 border-[#E0E1DD] dark:border-white/10 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B00]/0 via-[#FF6B00]/0 to-[#FF6B00]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Share2 className="h-4 w-4 text-[#64748B] dark:text-white/60 group-hover:text-[#FF6B00] transition-colors" />
            </Button>
            
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Compartilhar perfil
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
