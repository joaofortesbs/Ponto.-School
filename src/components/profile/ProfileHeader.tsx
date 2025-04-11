import React, { useState } from "react";
import { motion } from "framer-motion";
import type { UserProfile } from "@/types/user-profile";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { Edit, Camera, Share, ChevronUp, ChevronDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProfileHeaderProps {
  userProfile: UserProfile | null;
  isEditing: boolean;
  onEdit: () => void;
}

export default function ProfileHeader({ userProfile, isEditing, onEdit }: ProfileHeaderProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!userProfile) return null;

  const userInitials = getInitials(userProfile.display_name || userProfile.full_name || "Usuário");
  const progress = 72; // Progresso para o próximo nível (exemplo: 72%)

  return (
    <motion.div 
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 relative shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
    >
      {/* Banner superior */}
      <div className="h-24 bg-gradient-to-r from-blue-600 to-orange-500 relative">
        {isEditing && (
          <button className="absolute right-3 bottom-3 bg-black/20 hover:bg-black/30 transition-colors p-2 rounded-full text-white">
            <Camera size={18} />
          </button>
        )}
      </div>

      {/* Avatar e botão de editar */}
      <div className="px-6 pb-6 relative">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col items-center -mt-10">
            <div className="relative">
              {userProfile.avatar_url ? (
                <motion.img 
                  src={userProfile.avatar_url} 
                  alt={userProfile.display_name || "Perfil"} 
                  className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                />
              ) : (
                <motion.div 
                  className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 bg-orange-500 flex items-center justify-center text-white text-xl font-semibold"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {userInitials}
                </motion.div>
              )}

              {isEditing && (
                <button className="absolute right-0 bottom-0 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors p-1.5 rounded-full text-gray-600 dark:text-gray-200 shadow-md">
                  <Camera size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="pt-4">
            {!isEditing ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEdit}
                className="flex items-center space-x-1 text-sm bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 py-1.5 px-3 rounded-md shadow-sm border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-200"
              >
                <Edit size={14} />
                <span>Editar Perfil</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEdit}
                className="flex items-center space-x-1 text-sm bg-orange-500 hover:bg-orange-600 py-1.5 px-3 rounded-md shadow-sm text-white"
              >
                <span>Salvar</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Nome e informações */}
        <div className="text-center">
          <motion.h1 
            className="text-xl font-bold text-gray-800 dark:text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {userProfile.display_name || "Usuário"}
          </motion.h1>

          <motion.p 
            className="text-sm text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {userProfile.full_name || "Estudante"}
          </motion.p>

          <motion.div 
            className="mt-2 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
          >
            <span className="text-xs">Plano {userProfile.plan_type?.charAt(0).toUpperCase() + userProfile.plan_type?.slice(1) || "Lite"}</span>
          </motion.div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {userProfile.bio || "Estudante de Engenharia de Software"}
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-800 dark:text-white">{userProfile.level || 1}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Nível</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-800 dark:text-white">8</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Turmas</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-800 dark:text-white">12</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Conquistas</span>
            </div>
          </div>

          {/* Barra de progresso para o próximo nível */}
          <div className="mt-4">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-gray-500 dark:text-gray-400">Progresso para o próximo nível</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Botão de compartilhar perfil */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-4 w-full py-2 rounded-md bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium flex items-center justify-center gap-2 border border-gray-200/50 dark:border-gray-700"
          >
            <Share size={14} />
            <span>Compartilhar Perfil</span>
          </motion.button>

          {/* Expandir detalhes */}
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="mt-4 flex items-center justify-center w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            {showDetails ? (
              <>
                <span>Mostrar menos</span>
                <ChevronUp size={16} className="ml-1" />
              </>
            ) : (
              <>
                <span>Mostrar mais</span>
                <ChevronDown size={16} className="ml-1" />
              </>
            )}
          </button>

          {/* Detalhes extras (expandíveis) */}
          {showDetails && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 text-sm text-gray-600 dark:text-gray-300"
            >
              <p>Membro desde: Janeiro 2023</p>
              <p>Pontos de experiência: 1,250 XP</p>
              <p>Badge atual: Explorador Dedicado</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}