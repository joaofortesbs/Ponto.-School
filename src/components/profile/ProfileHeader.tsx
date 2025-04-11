
import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Edit, Share2, Camera, Award, ChevronUp, Activity, Users, Trophy } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import type { UserProfile } from "@/types/user-profile";

interface ProfileHeaderProps {
  userProfile: UserProfile | null;
  isEditing: boolean;
  onEdit: () => void;
}

const ProfileHeader = ({ userProfile, isEditing, onEdit }: ProfileHeaderProps) => {
  const [scope, animate] = useState<HTMLDivElement | null>(null);
  const progressToNextLevel = 72; // Porcentagem de progresso para o próximo nível
  const [isStatExpanded, setIsStatExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Values for animation
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-100, 100], [5, -5]);
  const rotateY = useTransform(mouseX, [-100, 100], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  // Garantir que o perfil sempre tenha valores válidos
  const profile = userProfile ? {
    ...userProfile,
    // Definir valores padrão para propriedades ausentes
    id: userProfile.id || "1",
    user_id: userProfile.user_id || `USR${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    full_name: userProfile.full_name || "Usuário",
    display_name: userProfile.display_name || "Usuário",
    avatar_url: userProfile.avatar_url || "",
    level: userProfile.level || 1,
    plan_type: userProfile.plan_type || "lite",
    email: userProfile.email || "usuario@exemplo.com"
  } : {
    id: "1",
    user_id: `USR${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    full_name: "Usuário",
    display_name: "Usuário",
    avatar_url: "",
    level: 1,
    plan_type: "lite",
    email: "usuario@exemplo.com"
  };

  const getPlanBadgeClass = () => {
    const planType = profile.plan_type?.toLowerCase() || 'lite';
    switch (planType) {
      case 'pro':
        return 'bg-gradient-to-r from-purple-500 to-indigo-600';
      case 'premium':
        return 'bg-gradient-to-r from-yellow-400 to-amber-600';
      default:
        return 'bg-gradient-to-r from-orange-400 to-amber-500';
    }
  };

  // Variants for animations
  const cardVariants = {
    hover: {
      scale: 1.02,
      boxShadow: "0 20px 30px rgba(0, 0, 0, 0.15)",
      transition: { duration: 0.3, ease: "easeOut" }
    },
    tap: {
      scale: 0.98,
      boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.15, ease: "easeIn" }
    }
  };

  const statItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * custom,
        duration: 0.5,
        ease: [0.6, 0.05, -0.01, 0.9]
      }
    })
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      boxShadow: "0 10px 15px -3px rgba(255, 107, 0, 0.3), 0 4px 6px -2px rgba(255, 107, 0, 0.1)"
    },
    tap: { scale: 0.95 }
  };

  return (
    <div className="w-full">
      <motion.div
        ref={scope}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.8,
          ease: [0.6, 0.05, -0.01, 0.9]
        }}
        style={{
          rotateX,
          rotateY,
          transformPerspective: 1200,
          transformStyle: "preserve-3d"
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-full"
      >
        <motion.div 
          className="overflow-hidden rounded-xl bg-gradient-to-b from-navy-800 via-navy-900 to-[#001427] shadow-lg border border-gray-200/20 dark:border-gray-700/20"
          variants={cardVariants}
          whileHover="hover"
          whileTap="tap"
        >
          {/* Efeitos decorativos de fundo */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div 
              className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-orange-500/10 blur-xl"
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 8, repeat: Infinity, ease: "easeInOut" }
              }}
            />
            <motion.div 
              className="absolute bottom-10 -left-20 w-40 h-40 rounded-full bg-indigo-500/10 blur-xl"
              animate={{ 
                rotate: -360,
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ 
                rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 10, repeat: Infinity, ease: "easeInOut" }
              }}
            />
          </div>

          {/* Perfil do usuário */}
          <div className="px-6 py-8 flex flex-col items-center text-center relative">
            {/* Avatar com efeito de brilho e pulsação */}
            <div className="relative mb-5">
              <motion.div 
                className="absolute -inset-3 rounded-full opacity-60"
                style={{
                  background: `radial-gradient(circle, rgba(255, 107, 0, 0.7) 0%, rgba(255, 107, 0, 0) 70%)`
                }}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full opacity-75 blur-md"
                animate={{ 
                  rotate: [0, 360],
                  scale: [0.95, 1.05, 0.95]
                }}
                transition={{ 
                  rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                  scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
              />
              <div className="relative z-10">
                <Avatar className="w-28 h-28 border-4 border-white/10 shadow-lg">
                  <AvatarImage src={profile.avatar_url || ""} alt={profile.display_name} />
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-white text-3xl">
                    {profile.display_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <motion.div 
                  className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 shadow-md bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Camera className="w-4 h-4 text-white" />
                </motion.div>
              </div>
            </div>

            {/* Nome do usuário com animação */}
            <motion.div
              className="mb-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.h2 
                className="text-2xl font-bold text-white"
                whileHover={{ 
                  textShadow: "0 0 8px rgba(255, 107, 0, 0.8)"
                }}
              >
                {profile.display_name || "Usuário"}
              </motion.h2>
            </motion.div>

            {/* Badge do plano com efeitos */}
            <motion.div 
              className={`mb-3 px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1.5 ${getPlanBadgeClass()}`}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 0 15px rgba(255, 107, 0, 0.7)"
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Plano {profile.plan_type || "Lite"}</span>
            </motion.div>

            {/* Descrição com efeito de hover */}
            <motion.p 
              className="text-sm text-gray-300 mb-5 max-w-[80%] mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ color: "#fff" }}
            >
              Estudante de Engenharia de Software
            </motion.p>

            {/* Grid de métricas com efeito hover e animações */}
            <div className="grid grid-cols-3 gap-3 w-full mb-5">
              <motion.div 
                className="flex flex-col items-center py-3 px-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10"
                variants={statItemVariants}
                custom={0}
                initial="hidden"
                animate="visible"
                whileHover={{ 
                  y: -5, 
                  backgroundColor: "rgba(255,255,255,0.1)",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                }}
              >
                <motion.div 
                  className="text-2xl font-bold text-white mb-1"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  {profile.level || 1}
                </motion.div>
                <div className="flex items-center gap-1 text-xs text-gray-300">
                  <Trophy className="w-3 h-3 text-orange-400" />
                  <span>Nível</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex flex-col items-center py-3 px-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10"
                variants={statItemVariants}
                custom={1}
                initial="hidden"
                animate="visible"
                whileHover={{ 
                  y: -5, 
                  backgroundColor: "rgba(255,255,255,0.1)",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                }}
              >
                <motion.div 
                  className="text-2xl font-bold text-white mb-1"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, delay: 0.3, repeat: Infinity, ease: "easeInOut" }}
                >
                  8
                </motion.div>
                <div className="flex items-center gap-1 text-xs text-gray-300">
                  <Users className="w-3 h-3 text-orange-400" />
                  <span>Turmas</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex flex-col items-center py-3 px-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10"
                variants={statItemVariants}
                custom={2}
                initial="hidden"
                animate="visible"
                whileHover={{ 
                  y: -5, 
                  backgroundColor: "rgba(255,255,255,0.1)",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                }}
              >
                <motion.div 
                  className="text-2xl font-bold text-white mb-1"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, delay: 0.6, repeat: Infinity, ease: "easeInOut" }}
                >
                  12
                </motion.div>
                <div className="flex items-center gap-1 text-xs text-gray-300">
                  <Award className="w-3 h-3 text-orange-400" />
                  <span>Conquistas</span>
                </div>
              </motion.div>
            </div>

            {/* Barra de progresso com animação */}
            <div className="w-full px-3 mb-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-300 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-orange-400" />
                  Progresso para o próximo nível
                </p>
                <motion.p 
                  className="text-xs font-medium text-orange-400"
                  animate={{ 
                    opacity: [0.7, 1, 0.7],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {progressToNextLevel}%
                </motion.p>
              </div>
              <div className="relative h-2.5 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div 
                  className="absolute h-full bg-gradient-to-r from-orange-500 to-amber-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNextLevel}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                {/* Efeito de destaque na barra de progresso */}
                <motion.div 
                  className="absolute h-full w-20 bg-white/20"
                  animate={{ 
                    x: ['-100%', '400%'],
                    opacity: [0, 0.5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatDelay: 1
                  }}
                />
              </div>
            </div>

            {/* Botão de editar perfil animado */}
            <motion.button
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium shadow-lg shadow-orange-500/20"
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              onClick={onEdit}
              style={{
                transformStyle: "preserve-3d",
                zIndex: 10
              }}
            >
              <Edit className="w-4 h-4" style={{ transform: "translateZ(8px)" }} />
              <span style={{ transform: "translateZ(8px)" }}>
                {isEditing ? "Salvar Perfil" : "Editar Perfil"}
              </span>
              
              {/* Efeito de brilho no botão */}
              <motion.div 
                className="absolute inset-0 rounded-lg opacity-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ 
                  opacity: isHovered ? [0, 0.5, 0] : 0,
                  x: isHovered ? ['-100%', '200%'] : '-100%',
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: isHovered ? Infinity : 0,
                  repeatDelay: 0.5
                }}
              />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProfileHeader;
