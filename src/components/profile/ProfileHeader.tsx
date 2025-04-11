import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Edit, Share2, Camera, Award } from "lucide-react";
import { motion, useAnimate, useMotionValue } from "framer-motion";
import type { UserProfile } from "@/types/user-profile";

interface ProfileHeaderProps {
  userProfile: UserProfile | null;
  isEditing: boolean;
  onEdit: () => void;
}

const ProfileHeader = ({ userProfile, isEditing, onEdit }: ProfileHeaderProps) => {
  const [scope, animate] = useAnimate();
  const progressToNextLevel = 72; // Porcentagem de progresso para o próximo nível

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

  useEffect(() => {
    // Animar ao carregar o componente
    animate(scope.current, { opacity: 1, y: 0 }, { duration: 0.5 });
  }, [animate, scope]);

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

  return (
    <motion.div
      ref={scope}
      initial={{ opacity: 0, y: 20 }}
      className="w-full"
    >
      <motion.div 
        className="overflow-hidden rounded-xl bg-gradient-to-b from-navy-800 to-navy-900 dark:from-navy-900 dark:to-[#001427] shadow-lg border border-gray-200 dark:border-gray-700"
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Perfil do usuário */}
        <div className="px-4 py-6 flex flex-col items-center text-center relative">
          {/* Avatar com efeito de brilho */}
          <div className="relative mb-3">
            <motion.div 
              className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full opacity-75 blur-md"
              animate={{ 
                rotate: [0, 360],
                scale: [0.95, 1.05, 0.95]
              }}
              transition={{ 
                rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
            />
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-800 shadow-lg">
                <AvatarImage src={profile.avatar_url || ""} alt={profile.display_name} />
                <AvatarFallback className="bg-orange-500 text-white text-3xl">
                  {profile.display_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <motion.div 
                className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 shadow-md bg-white dark:bg-gray-800 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Camera className="w-4 h-4 text-orange-500" />
              </motion.div>
            </div>
          </div>

          {/* Nome do usuário */}
          <motion.h2 
            className="text-xl font-bold text-white mb-1"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {profile.display_name || "Usuário"}
          </motion.h2>

          {/* Badge do plano */}
          <motion.div 
            className={`mb-2 px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1.5 ${getPlanBadgeClass()}`}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Plano {profile.plan_type || "Lite"}</span>
          </motion.div>

          {/* Descrição */}
          <motion.p 
            className="text-sm text-gray-300 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Estudante de Engenharia de Software
          </motion.p>

          {/* Grid de métricas com efeito hover */}
          <div className="grid grid-cols-3 gap-2 w-full mb-4">
            <motion.div 
              className="flex flex-col items-center p-2 rounded-lg bg-white/5 backdrop-blur-sm"
              whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <span className="text-xl font-semibold text-white">{profile.level || 1}</span>
              <span className="text-xs text-gray-300">Nível</span>
            </motion.div>
            <motion.div 
              className="flex flex-col items-center p-2 rounded-lg bg-white/5 backdrop-blur-sm"
              whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <span className="text-xl font-semibold text-white">8</span>
              <span className="text-xs text-gray-300">Turmas</span>
            </motion.div>
            <motion.div 
              className="flex flex-col items-center p-2 rounded-lg bg-white/5 backdrop-blur-sm"
              whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <span className="text-xl font-semibold text-white">12</span>
              <span className="text-xs text-gray-300">Conquistas</span>
            </motion.div>
          </div>

          {/* Barra de progresso com animação */}
          <div className="w-full px-2 mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs text-gray-300">Progresso para o próximo nível</p>
              <p className="text-xs font-medium text-orange-400">{progressToNextLevel}%</p>
            </div>
            <div className="relative h-2.5 bg-gray-700 rounded-full overflow-hidden">
              <motion.div 
                className="absolute h-full bg-gradient-to-r from-orange-500 to-orange-400"
                initial={{ width: 0 }}
                animate={{ width: `${progressToNextLevel}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Botão de editar perfil */}
          <motion.button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onEdit}
          >
            <Edit className="w-4 h-4" />
            {isEditing ? "Salvar Perfil" : "Editar Perfil"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfileHeader;