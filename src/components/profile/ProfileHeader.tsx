import React, { useRef, useEffect, useState, useCallback } from "react";
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
  Lightbulb,
  Camera,
  Upload,
  ImageIcon,
  RefreshCw
} from "lucide-react";
import type { UserProfile } from "@/types/user-profile";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { profileService } from "@/services/profileService";
import { toast } from "@/components/ui/use-toast";

interface ProfileHeaderProps {
  userProfile: UserProfile | null;
  onEditClick: () => void;
}

export default function ProfileHeader({
  userProfile,
  onEditClick,
}: ProfileHeaderProps) {
  // Refs
  const profileNameRef = useRef<HTMLHeadingElement>(null);
  const profilePictureRef = useRef<HTMLInputElement>(null);
  const coverPhotoRef = useRef<HTMLInputElement>(null);

  // Estado do perfil
  const [displayName, setDisplayName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  // Estados de UI
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showStatsDetails, setShowStatsDetails] = useState(false);
  const [activeAchievement, setActiveAchievement] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Array de conquistas recentes para animação
  const recentAchievements = [
    { icon: <Star className="h-4 w-4" />, name: "Primeiro Login", date: "1 dia atrás" },
    { icon: <Flame className="h-4 w-4" />, name: "3 dias consecutivos", date: "3 dias atrás" },
    { icon: <Lightbulb className="h-4 w-4" />, name: "Ideia Brilhante", date: "5 dias atrás" },
  ];

  // Função para carregar o perfil - definida fora de efeitos para evitar recriação
  const loadProfile = useCallback(async () => {
    try {
      // Garantir que o usuário tenha um ID
      const idGenerated = await profileService.ensureUserHasId();

      // Carregar o perfil atualizado
      const userData = await profileService.getCurrentUserProfile();

      if (userData) {
        console.log("Perfil recuperado:", userData);

        // Extrair e definir nome de exibição
        const displayNameValue = userData.display_name || userData.full_name || userData.username || '';
        setDisplayName(displayNameValue);

        // Extrair e definir avatar e capa
        setAvatarUrl(userData.avatar_url || null);
        setCoverUrl(userData.cover_url || null);

        // Salvar o username no localStorage
        if (userData.username) {
          localStorage.setItem('username', userData.username);
          setUsername(userData.username);
        } else {
          // Se não tiver username, buscar de outras fontes
          const updatedUsername = await fetchAndUpdateUsername();
          if (updatedUsername) {
            setUsername(updatedUsername);
          }
        }

        // Se houve geração de ID, mostrar toast
        if (idGenerated) {
          toast({
            title: "ID gerado com sucesso",
            description: `Seu ID de usuário: ${userData.user_id}`,
          });
        }

        setProfileLoaded(true);
        return userData;
      } else {
        console.warn("Nenhum dado de usuário retornado do profileService");
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    }
    return null;
  }, []);

  // Função para buscar e atualizar username separada
  const fetchAndUpdateUsername = useCallback(async () => {
    try {
      console.log("Buscando username de diversas fontes...");
      let foundUsername = null;

      // 1. Verificar no localStorage
      try {
        const directUsername = localStorage.getItem('username');
        if (directUsername) {
          console.log("Username encontrado diretamente no localStorage:", directUsername);
          foundUsername = directUsername;
        }
      } catch (e) {
        console.error('Erro ao acessar localStorage:', e);
      }

      // 2. Verificar no formData
      if (!foundUsername) {
        try {
          const savedFormData = localStorage.getItem('registrationFormData');
          if (savedFormData) {
            const parsedData = JSON.parse(savedFormData);
            if (parsedData.username) {
              foundUsername = parsedData.username;
              console.log("Username encontrado no localStorage (formData):", foundUsername);
            }
          }
        } catch (e) {
          console.error('Erro ao buscar username do localStorage (formData):', e);
        }
      }

      // 3. Verificar na sessão
      if (!foundUsername) {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user?.user_metadata?.username) {
            foundUsername = sessionData.session.user.user_metadata.username;
            console.log("Username encontrado nos metadados da sessão:", foundUsername);
          }
        } catch (e) {
          console.error('Erro ao buscar username da sessão:', e);
        }
      }

      // 4. Verificar na tabela de auth.users
      if (!foundUsername) {
        try {
          const { data: authUserData } = await supabase.auth.getUser();
          if (authUserData?.user?.user_metadata?.username) {
            foundUsername = authUserData.user.user_metadata.username;
            console.log("Username encontrado nos metadados do usuário:", foundUsername);
          }
        } catch (e) {
          console.error('Erro ao buscar username da tabela auth.users:', e);
        }
      }

      // Se encontramos um username, atualizar o perfil
      if (foundUsername) {
        localStorage.setItem('username', foundUsername);

        try {
          const updatedProfile = await profileService.updateUserProfile({
            username: foundUsername
          });

          if (updatedProfile) {
            console.log("Perfil atualizado com o username:", foundUsername);
            return foundUsername;
          }
        } catch (e) {
          console.error('Erro ao atualizar perfil com username:', e);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar e atualizar username:", error);
    }

    return null;
  }, []);

  // Efeito para carregar o perfil inicialmente
  useEffect(() => {
    const initializeProfile = async () => {
      // Se não temos dados do perfil, carregar do zero
      if (!userProfile) {
        await loadProfile();
        return;
      }

      // Definir estados para dados básicos do perfil
      setDisplayName(userProfile.display_name || userProfile.full_name || '');
      setUsername(userProfile.username || '');

      if (userProfile?.avatar_url) {
        setAvatarUrl(userProfile.avatar_url);
      }

      if (userProfile?.cover_url) {
        setCoverUrl(userProfile.cover_url);
      }

      // Verificar se tem informações essenciais
      if (!userProfile.username || !userProfile.user_id) {
        await loadProfile();
      }

      setProfileLoaded(true);
    };

    initializeProfile();
  }, [userProfile, loadProfile]);

  // Efeito para animações
  useEffect(() => {
    // Animação para barra de progresso
    const progressBar = document.querySelector('.progress-animation');
    if (progressBar) {
      progressBar.classList.add('animate-shimmer');
    }

    // Rotação para o avatar
    const avatarElement = document.querySelector('.profile-avatar');
    if (avatarElement) {
      avatarElement.classList.add('animate-avatar-entrance');
    }

    // Intervalo para trocar a conquista ativa
    const achievementInterval = setInterval(() => {
      setActiveAchievement((prev) => (prev + 1) % recentAchievements.length);
    }, 3000);

    return () => {
      clearInterval(achievementInterval);
    };
  }, []);

  // Handlers seguros

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

  const uploadProfilePicture = async (file: File) => {
    if (!file) return;

    try {
      setIsUploading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para fazer upload de imagens",
          variant: "destructive"
        });
        return;
      }

      const user = sessionData.session.user;
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload para o storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      // Atualizar perfil do usuário
      await profileService.updateUserProfile({
        avatar_url: publicUrlData.publicUrl
      });

      setAvatarUrl(publicUrlData.publicUrl);

      toast({
        title: "Sucesso",
        description: "Foto de perfil atualizada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao fazer upload da foto de perfil:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao fazer upload da foto",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const uploadCoverPhoto = async (file: File) => {
    if (!file) return;

    try {
      setIsUploading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para fazer upload de imagens",
          variant: "destructive"
        });
        return;
      }

      const user = sessionData.session.user;
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-cover-${Date.now()}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      // Upload para o storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      // Atualizar perfil do usuário
      await profileService.updateUserProfile({
        cover_url: publicUrlData.publicUrl
      });

      setCoverUrl(publicUrlData.publicUrl);

      toast({
        title: "Sucesso",
        description: "Foto de capa atualizada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao fazer upload da foto de capa:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao fazer upload da capa",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfilePictureClick = () => {
    profilePictureRef.current?.click();
  };

  const handleCoverPhotoClick = () => {
    coverPhotoRef.current?.click();
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadProfilePicture(e.target.files[0]);
    }
  };

  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadCoverPhoto(e.target.files[0]);
    }
  };

  const shareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `Perfil de ${displayName || userProfile?.display_name || 'Usuário'}`,
        text: `Veja o perfil de ${displayName || userProfile?.display_name || 'Usuário'} na plataforma`,
        url: window.location.href,
      })
      .then(() => {
        toast({
          title: "Compartilhado",
          description: "Perfil compartilhado com sucesso",
        });
      })
      .catch((error) => {
        console.error("Erro ao compartilhar:", error);
      });
    } else {
      // Fallback para copiar URL
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast({
          title: "URL Copiada",
          description: "Link do perfil copiado para a área de transferência",
        });
      });
    }
  };

  const refreshId = async () => {
    setRefreshing(true);
    try {
      // Gerar um novo ID
      const dataAtual = new Date();
      const anoMes = `${dataAtual.getFullYear().toString().slice(-2)}${(dataAtual.getMonth() + 1).toString().padStart(2, '0')}`;
      const tipoConta = (userProfile?.plan_type?.toLowerCase() === 'premium') ? '1' : '2';
      const sequencial = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      const generatedId = `BR${anoMes}${tipoConta}${sequencial}`;

      // Atualizar o perfil
      if (userProfile?.id) {
        await supabase
          .from('profiles')
          .update({
            user_id: generatedId,
            updated_at: new Date().toISOString()
          })
          .eq('id', userProfile.id);

        await loadProfile();
      }
    } catch (error) {
      console.error("Erro ao atualizar ID:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Calcular o nome de exibição e username fora da renderização
  const getDisplayInfo = () => {
    // Obter primeiro nome
    let firstName = "";
    const fullName = userProfile?.full_name || displayName || '';

    if (fullName) {
      firstName = fullName.split(' ')[0];
    } else if (userProfile?.username) {
      firstName = userProfile.username;
    } else if (userProfile?.display_name) {
      firstName = userProfile.display_name;
    } else {
      firstName = "Usuário";
    }

    // Obter nome de usuário mais confiável
    let usernameToDisplay = username || userProfile?.username || '';

    if (!usernameToDisplay) {
      // Verificar outras propriedades
      if (userProfile?.user_metadata?.username) {
        usernameToDisplay = userProfile.user_metadata.username;
      } else {
        try {
          usernameToDisplay = localStorage.getItem('username') || 'usuário';
        } catch (e) {
          usernameToDisplay = 'usuário';
        }
      }
    }

    return { firstName, username: usernameToDisplay };
  };

  // Obter informações de exibição de forma estável
  const { firstName, username: usernameToDisplay } = getDisplayInfo();

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
      <div className="h-32 bg-gradient-to-r from-[#001427] via-[#072e4f] to-[#0A2540] relative overflow-hidden group/cover">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt="Cover"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
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
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#001427]/90 to-transparent"></div>

        {/* Botão de upload da capa (visível no hover) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity duration-300 z-10">
          <div
            onClick={handleCoverPhotoClick}
            className="bg-black/50 hover:bg-black/70 p-2 rounded-full cursor-pointer transition-all duration-300 backdrop-blur-sm"
          >
            <Camera className="h-5 w-5 text-white" />
          </div>
        </div>
        <input
          type="file"
          ref={coverPhotoRef}
          className="hidden"
          accept="image/*"
          onChange={handleCoverPhotoChange}
        />

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
          <div className="relative group/avatar">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] rounded-full opacity-75 group-hover/avatar:opacity-100 blur-sm group-hover/avatar:blur transition duration-1000"></div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="profile-avatar relative cursor-pointer"
              onClick={handleProfilePictureClick}
            >
              <Avatar className="w-20 h-20 border-4 border-white dark:border-[#0A2540] shadow-xl group-hover/avatar:border-[#FF6B00]/20 transition-all duration-300">
                <AvatarImage
                  src={avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=John"}
                  alt="Avatar"
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-[#FF6B00] to-[#FF9B50] text-xl font-bold text-white">
                  {firstName.charAt(0) || "U"}
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
                  className="opacity-70 group-hover/avatar:opacity-100 transition-opacity"
                  strokeLinecap="round"
                />
              </svg>

              {/* Ícone de câmera para upload (visível no hover) */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </motion.div>
            <input
              type="file"
              ref={profilePictureRef}
              className="hidden"
              accept="image/*"
              onChange={handleProfilePictureChange}
            />

            {/* Indicador de status premium */}
            <motion.div
              className="absolute -bottom-1 -right-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: "spring", stiffness: 200 }}
            >
              <div className="bg-[#FF6B00] text-white p-1 rounded-full w-7 h-7 flex items-center justify-center shadow-lg group-hover/avatar:shadow-[#FF6B00]/40 transition-all duration-300">
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
          {firstName} <span className="text-gray-400 dark:text-gray-400">|</span> <span className="text-[#FF6B00]">@{usernameToDisplay}</span>
        </motion.h2>

        {/* User ID block */}
        {userProfile?.user_id ? (
          <div className="mt-2 bg-gradient-to-r from-[#FF6B00]/10 to-[#FF8C40]/5 dark:from-[#FF6B00]/20 dark:to-[#FF8C40]/10 backdrop-blur-sm px-3 py-1.5 rounded-full inline-flex items-center border border-[#FF6B00]/20">
            <div className="w-2 h-2 rounded-full bg-[#FF6B00] mr-2"></div>
            <span className="text-xs font-medium text-gray-800 dark:text-white">
              ID: <span className="font-mono">{userProfile.user_id}</span>
            </span>
          </div>
        ) : (
          <div className="mt-2 bg-gray-100 dark:bg-gray-800/40 backdrop-blur-sm px-3 py-1.5 rounded-full inline-flex items-center cursor-help" title="ID será gerado automaticamente logo após a criação da conta">
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse mr-2"></div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              ID: Gerando...
            </span>
          </div>
        )}

        <motion.div
          className="flex items-center justify-center gap-1 mt-1"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.3 }}
        >
          <span className="bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm hover:shadow hover:shadow-[#FF6B00]/20 transition-all duration-300 cursor-pointer">
            <Diamond className="h-3.5 w-3.5" />
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
                    className="absolute right-6 -mt-10 px-2py-1.5 bg-black/80 text-white text-[10px] rounded-lg shadow-lg backdrop-blur-sm z-50 w-32 text-center"
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
            disabled={isUploading}
          >
            {/* Efeito de brilho no hover */}
            <span className="absolute w-32 h-32 -mt-12 -ml-12 bg-white rotate-12 opacity-0 group-hover:opacity-10 transition-opacity duration-1000 transform group-hover:translate-x-40 group-hover:translate-y-10 pointer-events-none"></span>

            {isUploading ? (
              <div className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin mr-1.5"></div>
            ) : (
              <Edit className="h-3 w-3 mr-1.5 group-hover:scale-110 transition-transform" />
            )}
            <span className="relative z-10">Editar Perfil</span>
          </Button>
          <Button
            variant="outline"
            className="w-8 h-8 p-0 border-[#E0E1DD] dark:border-white/10 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 group/share transition-all duration-300 relative overflow-hidden"
            onClick={shareProfile}
            disabled={isUploading}
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