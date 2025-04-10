import React, { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Edit, Share2, Camera, Check, Award } from "lucide-react";
import { motion, useAnimate, useMotionValue } from "framer-motion";
import type { UserProfile } from "@/types/user-profile";

interface ProfileHeaderProps {
  userProfile?: UserProfile | null;
  isEditing: boolean;
  onEdit: () => void;
}

const ProfileHeader = ({ userProfile, isEditing, onEdit }: ProfileHeaderProps) => {
  const [scope, animate] = useAnimate();
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  // Garantir que o perfil sempre tenha valores válidos
  const profile = userProfile || {
    id: "1",
    user_id: `USR${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    full_name: "Usuário",
    display_name: "Usuário",
    avatar_url: "",
    level: 1,
    plan_type: "lite",
    email: "usuario@exemplo.com",
    bio: "Estudante utilizando a plataforma Epictus",
    skills: ["Aprendizado", "Organização"],
    interests: ["Educação", "Tecnologia"],
    education: [
      {
        institution: "Epictus Academy",
        degree: "Curso Online",
        years: "2024-Presente"
      }
    ],
    contact_info: {
      phone: "",
      address: "",
      social: {
        twitter: "",
        linkedin: "",
        github: ""
      }
    },
    coins: 100,
    rank: "Iniciante"
  };

  const progressToNextLevel = 72; // Porcentagem de progresso para o próximo nível

  useEffect(() => {
    // Animar ao carregar o componente
    animate(scope.current, { opacity: 1, y: 0 }, { duration: 0.5 });

    // Gerar ID de usuário se não existir
    if (!profile.user_id) {
      profile.user_id = "USR" + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    }
  }, []);

  // Efeito 3D no cartão
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Calcular rotação limitada a +/- 5 graus
    const rotX = (mouseY / (rect.height / 2)) * -5;
    const rotY = (mouseX / (rect.width / 2)) * 5;

    rotateX.set(rotX);
    rotateY.set(rotY);
  };

  const handleMouseLeave = () => {
    // Animar de volta à posição inicial
    animate(rotateX, 0, { duration: 0.5 });
    animate(rotateY, 0, { duration: 0.5 });
  };

  const getPlanBadgeClass = () => {
    switch (profile.plan_type?.toLowerCase()) {
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
      className="mx-auto mb-8 max-w-md"
    >
      <motion.div
        ref={cardRef}
        className="profile-3d-container overflow-hidden rounded-xl bg-white dark:bg-gray-800/90 shadow-lg border border-gray-200 dark:border-gray-700"
        style={{
          transform: "perspective(1000px)",
          rotateX: rotateX,
          rotateY: rotateY,
          boxShadow: "0 20px 30px -10px rgba(0,0,0,0.15)"
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Gradiente superior */}
        <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Avatar e informações do perfil */}
        <div className="relative px-6 pb-6">
          <motion.div 
            className="profile-3d-avatar absolute -top-14 left-1/2 transform -translate-x-1/2"
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <Avatar className="w-28 h-28 border-4 border-white dark:border-gray-800 shadow-lg">
              <AvatarImage src={profile.avatar_url || ""} alt={profile.display_name} />
              <AvatarFallback className="bg-orange-500 text-white text-3xl">
                {profile.display_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>

            {/* Círculo de câmera para trocar avatar */}
            <Button 
              variant="secondary" 
              size="icon" 
              className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 shadow-md"
            >
              <Camera className="w-4 h-4" />
            </Button>
          </motion.div>

          <div className="mt-16 flex flex-col items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {profile.display_name || "Usuário"}
            </h2>

            {/* ID do usuário com efeito de destaque */}
            <motion.div 
              className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5"
              initial={{ opacity: 0.5 }}
              whileHover={{ scale: 1.05, opacity: 1 }}
            >
              ID: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md text-orange-600 dark:text-orange-400">{profile.user_id || "—"}</span>
            </motion.div>

            {/* Badge do plano */}
            <motion.div 
              className={`mt-2 px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1.5 ${getPlanBadgeClass()}`}
              whileHover={{ scale: 1.05 }}
            >
              <Award className="w-3.5 h-3.5" />
              <span className="profile-premium-badge">Plano {profile.plan_type || "Lite"}</span>
            </motion.div>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {profile.full_name || "Estudante de Engenharia de Software"}
            </p>

            {/* Métricas */}
            <div className="w-full grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex flex-col items-center">
                <span className="text-xl font-semibold text-gray-900 dark:text-white">{profile.level || 1}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Nível</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl font-semibold text-gray-900 dark:text-white">8</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Turmas</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl font-semibold text-gray-900 dark:text-white">12</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Conquistas</span>
              </div>
            </div>

            {/* Barra de progresso */}
            <div className="w-full mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs text-gray-500 dark:text-gray-400">Progresso para o próximo nível</p>
                <p className="text-xs font-medium text-orange-600 dark:text-orange-400">{progressToNextLevel}%</p>
              </div>
              <div className="relative w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div 
                  className="absolute h-full bg-gradient-to-r from-orange-500 to-orange-400 progress-bar-shine"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNextLevel}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex w-full gap-2 mt-6">
              <Button 
                variant="default" 
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                onClick={onEdit}
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
              <Button variant="outline" size="icon" className="aspect-square">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfileHeader;