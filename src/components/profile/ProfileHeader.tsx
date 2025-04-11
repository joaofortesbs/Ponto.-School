
import React, { useRef, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Diamond, 
  Share2, 
  Edit, 
  Award, 
  Users, 
  Sparkles, 
  ChevronUp, 
  Trophy, 
  BookOpen, 
  Zap,
  Star,
  BellRing,
  Flame,
  Laptop,
  Lightbulb
} from "lucide-react";
import type { UserProfile } from "@/types/user-profile";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isHovering, setIsHovering] = useState(false);
  const [showStatsDetails, setShowStatsDetails] = useState(false);
  const [activeAchievement, setActiveAchievement] = useState(0);

  // Array de conquistas recentes para animação
  const recentAchievements = [
    { icon: <Star className="h-4 w-4" />, name: "Primeiro Login", date: "1 dia atrás" },
    { icon: <Flame className="h-4 w-4" />, name: "3 dias consecutivos", date: "3 dias atrás" },
    { icon: <Lightbulb className="h-4 w-4" />, name: "Ideia Brilhante", date: "5 dias atrás" },
  ];

  useEffect(() => {
    if (
      userProfile?.display_name &&
      userProfile.display_name.trim() !== ""
    ) {
      setDisplayName(userProfile.display_name);
    }
  }, [userProfile]);

  useEffect(() => {
    // Animação para barra de progresso
    const progressBar = document.querySelector('.progress-animation');
    if (progressBar) {
      progressBar.classList.add('animate-shimmer');
    }

    // Rotação para o avatar quando a página é carregada
    const avatarElement = document.querySelector('.profile-avatar');
    if (avatarElement) {
      avatarElement.classList.add('animate-avatar-entrance');
    }

    // Intervalo para trocar a conquista ativa na exibição
    const achievementInterval = setInterval(() => {
      setActiveAchievement((prev) => (prev + 1) % recentAchievements.length);
    }, 3000);

    return () => {
      clearInterval(achievementInterval);
    };
  }, []);

  // Efeito de paralaxe no card
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 30;
    const rotateY = (centerX - x) / 30;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };
  
  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
  };

  return (
    <div 
      className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 shadow-lg overflow-hidden relative group hover:shadow-2xl transition-all duration-500"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovering(true)}
      onMouseOver={() => setIsHovering(true)}
      style={{ transition: "all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}
    >
      {/* Efeitos decorativos */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#FF6B00]/20 to-transparent rounded-bl-full z-0 opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#0A2540]/10 to-transparent rounded-tr-full z-0 opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Partículas animadas (visíveis no hover) */}
      <AnimatePresence>
        {isHovering && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-2 h-2 rounded-full bg-[#FF6B00]/30"
                initial={{ 
                  opacity: 0,
                  x: Math.random() * 300 - 150, 
                  y: Math.random() * 200 - 100,
                  scale: 0
                }}
                animate={{ 
                  opacity: [0, 0.8, 0],
                  x: Math.random() * 300 - 150,
                  y: Math.random() * 200 - 100, 
                  scale: [0, 1, 0]
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ 
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Cover Photo com gradiente animado e efeito de movimento - altura reduzida */}
      <div className="h-32 bg-gradient-to-r from-[#001427] via-[#072e4f] to-[#0A2540] relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-[url('/images/pattern-grid.svg')] opacity-20"
          animate={{ 
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#001427]/90 to-transparent"></div>

        {/* Efeitos de luz */}
        <motion.div 
          className="absolute top-5 right-8 w-12 h-12 rounded-full bg-[#FF6B00]/20 blur-xl"
          animate={{ 
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <motion.div
          className="absolute bottom-5 left-10 w-16 h-16 rounded-full bg-[#0064FF]/20 blur-xl"
          animate={{ 
            opacity: [0.1, 0.4, 0.1],
            scale: [1, 1.3, 1]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1
          }}
        />

        {/* Status badge animado */}
        <div className="absolute top-3 right-3 z-10">
          <motion.div 
            className="bg-[#00b894]/90 text-white text-xs py-0.5 px-2 rounded-full flex items-center shadow-lg backdrop-blur-sm"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <motion.span 
              className="w-1.5 h-1.5 rounded-full bg-white mr-1.5"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            Online
          </motion.div>
        </div>

        {/* Nível destacado */}
        <div className="absolute top-3 left-3 z-10">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] text-white text-xs py-0.5 px-2 rounded-full flex items-center shadow-lg"
          >
            <Zap className="h-3 w-3 mr-1" />
            Nível {userProfile?.level || 1}
          </motion.div>
        </div>
      </div>

      {/* Avatar com animação avançada - movido para fora da capa */}
      <div className="flex justify-center -mt-10 mb-2 relative z-20">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] rounded-full opacity-75 group-hover:opacity-100 blur-sm group-hover:blur transition duration-1000"></div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="profile-avatar relative"
            >
              <Avatar className="w-20 h-20 border-4 border-white dark:border-[#0A2540] shadow-xl group-hover:border-[#FF6B00]/20 transition-all duration-300">
                <AvatarImage
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                  alt="Avatar"
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-[#FF6B00] to-[#FF9B50] text-xl font-bold text-white">
                  {displayName?.charAt(0) || userProfile?.display_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              
              {/* Anel de progresso ao redor do avatar */}
              <svg className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)] rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="49%"
                  fill="none"
                  stroke="#FF6B00"
                  strokeWidth="2"
                  strokeDasharray="308"
                  strokeDashoffset="85"
                  className="opacity-70 group-hover:opacity-100 transition-opacity"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>

            {/* Indicador de status premium */}
            <motion.div 
              className="absolute -bottom-1 -right-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: "spring", stiffness: 200 }}
            >
              <div className="bg-[#FF6B00] text-white p-1 rounded-full w-7 h-7 flex items-center justify-center shadow-lg group-hover:shadow-[#FF6B00]/40 transition-all duration-300">
                <Trophy className="h-4 w-4" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Profile Info - padding reduzido */}
      <div className="pt-1 pb-4 px-4 text-center relative z-10">
        <motion.h2
          ref={profileNameRef}
          className="text-lg font-bold text-[#29335C] dark:text-white profile-3d-text"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
        >
          {displayName || userProfile?.display_name || userProfile?.username || "Usuário"}
        </motion.h2>

        <motion.div 
          className="flex items-center justify-center gap-1 mt-0.5"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.3 }}
        >
          <p className="text-[10px] text-[#64748B] dark:text-white/60 bg-slate-100 dark:bg-slate-800/50 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
            ID: {userProfile?.user_id || "--"}
          </p>
        </motion.div>

        <motion.div 
          className="flex items-center justify-center gap-1 mt-1"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.3 }}
        >
          <span className="bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] text-white text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm hover:shadow hover:shadow-[#FF6B00]/20 transition-all duration-300 cursor-pointer">
            <Diamond className="h-3 w-3" />
            {userProfile?.plan_type === "premium" ? "Plano Premium" : "Plano Lite"}
          </span>
        </motion.div>

        <motion.p 
          className="text-[#64748B] dark:text-white/60 text-xs mt-1.5 bg-slate-50 dark:bg-slate-800/30 py-0.5 px-2 rounded-full inline-block backdrop-blur-sm"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.3 }}
        >
          <BookOpen className="w-3 h-3 inline-block mr-1 text-[#FF6B00]" />
          Estudante de Engenharia de Software
        </motion.p>

        {/* Stats com ícones e hover effects - reduzido */}
        <motion.div 
          className="flex justify-center gap-2 mt-3"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.3 }}
        >
          <motion.div 
            whileHover={{ y: -3, scale: 1.03 }}
            className="text-center group/stat bg-slate-50 dark:bg-slate-800/30 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/30 transition-all duration-300 shadow-sm hover:shadow border border-transparent hover:border-[#FF6B00]/10 relative"
            onMouseEnter={() => setShowStatsDetails(true)}
            onMouseLeave={() => setShowStatsDetails(false)}
          >
            <div className="flex flex-col items-center justify-center">
              <div className="w-6 h-6 bg-[#FF6B00]/10 rounded-full flex items-center justify-center mb-0.5 group-hover/stat:bg-[#FF6B00]/20 transition-all duration-300">
                <Zap className="h-3.5 w-3.5 text-[#FF6B00] group-hover/stat:scale-110 transition-transform" />
              </div>
              <p className="text-base font-bold text-[#29335C] dark:text-white">
                {userProfile?.level || 1}
              </p>
              <p className="text-[10px] text-[#64748B] dark:text-white/60">Nível</p>
            </div>
            
            {/* Tooltip com detalhes */}
            {showStatsDetails && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-white dark:bg-[#1E293B] p-2 rounded-lg shadow-lg text-xs z-20 w-40 border border-[#E0E1DD] dark:border-white/10"
              >
                <div className="text-center mb-1 font-medium text-[#29335C] dark:text-white">Detalhes do Nível</div>
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B] dark:text-white/60">XP Atual:</span>
                  <span className="font-medium text-[#29335C] dark:text-white">720/1000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B] dark:text-white/60">Próximo Nível:</span>
                  <span className="font-medium text-[#FF6B00]">Nível 2</span>
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.div 
            whileHover={{ y: -3, scale: 1.03 }}
            className="text-center group/stat bg-slate-50 dark:bg-slate-800/30 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/30 transition-all duration-300 shadow-sm hover:shadow border border-transparent hover:border-[#FF6B00]/10"
          >
            <div className="flex flex-col items-center justify-center">
              <div className="w-6 h-6 bg-[#FF6B00]/10 rounded-full flex items-center justify-center mb-0.5 group-hover/stat:bg-[#FF6B00]/20 transition-all duration-300">
                <Users className="h-3.5 w-3.5 text-[#FF6B00] group-hover/stat:scale-110 transition-transform" />
              </div>
              <p className="text-base font-bold text-[#29335C] dark:text-white">8</p>
              <p className="text-[10px] text-[#64748B] dark:text-white/60">Turmas</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -3, scale: 1.03 }}
            className="text-center group/stat bg-slate-50 dark:bg-slate-800/30 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/30 transition-all duration-300 shadow-sm hover:shadow border border-transparent hover:border-[#FF6B00]/10"
          >
            <div className="flex flex-col items-center justify-center">
              <div className="w-6 h-6 bg-[#FF6B00]/10 rounded-full flex items-center justify-center mb-0.5 group-hover/stat:bg-[#FF6B00]/20 transition-all duration-300">
                <Award className="h-3.5 w-3.5 text-[#FF6B00] group-hover/stat:scale-110 transition-transform" />
              </div>
              <p className="text-base font-bold text-[#29335C] dark:text-white">12</p>
              <p className="text-[10px] text-[#64748B] dark:text-white/60">Conquistas</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Barra de progresso melhorada - reduzida */}
        <motion.div 
          className="mt-3"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <ChevronUp className="h-2.5 w-2.5 text-[#FF6B00] mr-0.5" />
              <span className="text-[10px] text-[#64748B] dark:text-white/60">
                Progresso para o próximo nível
              </span>
            </div>
            <div 
              className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20 transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              72%
              <AnimatePresence>
                {showTooltip && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-6 -mt-10 px-2 py-1.5 bg-black/80 text-white text-[10px] rounded-lg shadow-lg backdrop-blur-sm z-50 w-32 text-center"
                  >
                    <div className="font-medium mb-0.5">Progresso</div>
                    <div className="text-white/80">720/1000 XP</div>
                    <div className="text-white/80">Faltam 280 XP</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-[#FF6B00] via-[#FF9B50] to-[#FF6B00] rounded-full progress-animation relative"
              style={{ width: '72%' }}
            >
              {/* Animação de brilho */}
              <div className="absolute inset-0 animate-shimmer" style={{ 
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s infinite'
              }}></div>
            </div>
          </div>
        </motion.div>

        {/* Botões modernizados - reduzidos */}
        <motion.div 
          className="mt-3 flex gap-2"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.3 }}
        >
          <Button
            className="flex-1 bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] hover:from-[#FF5B00] hover:to-[#FF8B40] text-white text-xs h-8 shadow-sm hover:shadow hover:shadow-[#FF6B00]/20 transition-all duration-300 group flex items-center justify-center relative overflow-hidden"
            onClick={onEditClick}
          >
            {/* Efeito de brilho no hover */}
            <span className="absolute w-32 h-32 -mt-12 -ml-12 bg-white rotate-12 opacity-0 group-hover:opacity-10 transition-opacity duration-1000 transform group-hover:translate-x-40 group-hover:translate-y-10 pointer-events-none"></span>
            
            <Edit className="h-3 w-3 mr-1.5 group-hover:scale-110 transition-transform" /> 
            <span className="relative z-10">Editar Perfil</span>
          </Button>
          <Button
            variant="outline"
            className="w-8 h-8 p-0 border-[#E0E1DD] dark:border-white/10 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 group/share transition-all duration-300 relative overflow-hidden"
          >
            <Share2 className="h-3.5 w-3.5 text-[#64748B] dark:text-white/60 group-hover/share:text-[#FF6B00] transition-colors duration-300" />
            
            {/* Efeito de onda ao clicar */}
            <span className="absolute w-0 h-0 rounded-full bg-[#FF6B00]/10 opacity-0 group-active/share:w-16 group-active/share:h-16 group-active/share:opacity-100 transition-all duration-500 -z-10"></span>
          </Button>
        </motion.div>

        {/* Carousel de conquistas recentes - reduzido */}
        <motion.div 
          className="mt-3"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.3 }}
        >
          <div className="px-2 py-1 bg-slate-50 dark:bg-slate-800/30 rounded-lg text-[10px] text-[#64748B] dark:text-white/60 flex flex-col items-center gap-1 group/achievements relative overflow-hidden border border-transparent hover:border-[#FF6B00]/10 transition-all duration-300 shadow-sm hover:shadow">
            <div className="flex items-center gap-1 w-full justify-center">
              <Sparkles className="h-3 w-3 text-yellow-500" />
              <span className="font-medium">Conquistas Recentes</span>
            </div>
            
            {/* Animação de carrossel para conquistas */}
            <div className="h-5 w-full relative overflow-hidden">
              {recentAchievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  className="absolute inset-0 flex items-center justify-center gap-1.5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: activeAchievement === index ? 1 : 0,
                    y: activeAchievement === index ? 0 : 20
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-[#FF6B00]">{achievement.icon}</span>
                  <span className="text-[#29335C] dark:text-white font-medium">{achievement.name}</span>
                  <span className="text-[#64748B] dark:text-white/60 text-[9px]">• {achievement.date}</span>
                </motion.div>
              ))}
            </div>
            
            {/* Indicadores de navegação */}
            <div className="flex gap-0.5">
              {recentAchievements.map((_, index) => (
                <div 
                  key={index}
                  className={`w-1 h-1 rounded-full transition-all duration-300 ${
                    activeAchievement === index 
                      ? 'bg-[#FF6B00] scale-110' 
                      : 'bg-[#64748B]/30 dark:bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* Indicador de atividade recente - reduzido */}
        <motion.div 
          className="mt-2 flex justify-center"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.3 }}
        >
          <div className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800/30 rounded-full text-[10px] text-[#64748B] dark:text-white/60 flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-700/30 transition-all duration-300 cursor-pointer group/activity">
            <BellRing className="h-2.5 w-2.5 text-[#FF6B00] group-hover/activity:animate-ping" />
            <span>Ativo há 3 horas</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
