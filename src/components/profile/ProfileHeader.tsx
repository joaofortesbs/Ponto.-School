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
  Lightbulb,
  Camera,
  Upload,
  ImageIcon,
  RefreshCw,
  UserPlus,
  UserCheck,
  Clock
} from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

import type { UserProfile } from "@/types/user-profile";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { profileService } from "@/services/profileService";
import { useToast } from "@/components/ui/use-toast";
import { usePartners } from "@/hooks/usePartners";

interface ProfileHeaderProps {
  userProfile: UserProfile | null;
  onEditClick: () => void;
}

export default function ProfileHeader({
  userProfile,
  onEditClick,
}: ProfileHeaderProps) {
  const profileNameRef = useRef<HTMLHeadingElement>(null);
  const profilePictureRef = useRef<HTMLInputElement>(null);
  const coverPhotoRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showStatsDetails, setShowStatsDetails] = useState(false);
  const [activeAchievement, setActiveAchievement] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFollowersTooltip, setShowFollowersTooltip] = useState(false);
  const [showFollowingTooltip, setShowFollowingTooltip] = useState(false);
  const [showFollowingInTooltip, setShowFollowingInTooltip] = useState(false);
  const [showAddPartnersModal, setShowAddPartnersModal] = useState(false);

  // Use the usePartners hook to manage partners state
  const {
    currentPartners,
    pendingRequests,
    fetchPartners,
  } = usePartners(userProfile?.user_id);

  useEffect(() => {
    if (userProfile?.user_id) {
      fetchPartners();
    }
  }, [userProfile?.user_id, fetchPartners]);

  // Array de conquistas recentes para animação
  const recentAchievements = [
    { icon: <Star className="h-4 w-4" />, name: "Primeiro Login", date: "1 dia atrás" },
    { icon: <Flame className="h-4 w-4" />, name: "3 dias consecutivos", date: "3 dias atrás" },
    { icon: <Lightbulb className="h-4 w-4" />, name: "Ideia Brilhante", date: "5 dias atrás" },
  ];

  // Função aprimorada para garantir que temos o username correto e consistente com o cabeçalho
  const ensureCorrectUsername = async () => {
    try {
      // Verificar se temos o username e informações de perfil no localStorage (usado no cabeçalho)
      const headerUsername = localStorage.getItem('username');
      const headerFirstName = localStorage.getItem('userFirstName');
      const headerDisplayName = localStorage.getItem('userDisplayName');
      const sessionUsername = sessionStorage.getItem('username');
      const supabaseUser = await supabase.auth.getUser();
      const userEmail = supabaseUser.data?.user?.email || localStorage.getItem('userEmail') || '';

      console.log("Sincronizando informações de usuário:", {
        headerUsername,
        headerFirstName,
        headerDisplayName,
        sessionUsername,
        userEmail,
        profileUsername: userProfile?.username,
        profileDisplayName: userProfile?.display_name,
        profileFullName: userProfile?.full_name
      });

      // Avaliar validade dos usernames disponíveis
      const isUsernameValid = (username: string | null | undefined) => {
        return username && username !== 'Usuário' && !username.startsWith('user_') && username.length > 2;
      };

      // Determinar o melhor username baseado em todas as fontes disponíveis
      let bestUsername = null;
      let bestDisplayName = null;
      let sourceOfUsername = 'nenhuma';

      // 1. Priorizar o username do perfil no banco (fonte primária)
      if (isUsernameValid(userProfile?.username)) {
        bestUsername = userProfile.username;
        sourceOfUsername = 'perfil';
      }
      // 2. Verificar username no localStorage (usado pelo header)
      else if (isUsernameValid(headerUsername)) {
        bestUsername = headerUsername;
        sourceOfUsername = 'localStorage';
      }
      // 3. Verificar username na sessionStorage
      else if (isUsernameValid(sessionUsername)) {
        bestUsername = sessionUsername;
        sourceOfUsername = 'sessionStorage';
      }
      // 4. Usar email como fonte para username (muito confiável)
      else if (userEmail && userEmail.includes('@')) {
        const emailUsername = userEmail.split('@')[0];
        if (isUsernameValid(emailUsername)) {
          bestUsername = emailUsername;
          sourceOfUsername = 'email';
        }
      }
      // 5. Último recurso: gerar um username com timestamp fixo baseado na data
      else {
        const today = new Date();
        const seed = `${today.getFullYear()}${(today.getMonth()+1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
        bestUsername = `user_${seed}`;
        sourceOfUsername = 'gerado';
      }

      // Determinar o melhor display_name
      if (userProfile?.display_name && userProfile.display_name !== 'Usuário') {
        bestDisplayName = userProfile.display_name;
      } else if (headerDisplayName && headerDisplayName !== 'Usuário') {
        bestDisplayName = headerDisplayName;
      } else if (headerFirstName && headerFirstName !== 'Usuário') {
        bestDisplayName = headerFirstName;
      } else if (userProfile?.full_name) {
        bestDisplayName = userProfile.full_name.split(' ')[0];
      } else if (bestUsername && isUsernameValid(bestUsername)) {
        bestDisplayName = bestUsername;
      } else {
        bestDisplayName = 'Usuário';
      }

      console.log(`Melhor username encontrado: ${bestUsername} (fonte: ${sourceOfUsername})`);
      console.log(`Melhor display name encontrado: ${bestDisplayName}`);

      // Sincronizar em todas as fontes
      if (bestUsername) {
        // Atualizar localStorage e sessionStorage para garantir consistência
        localStorage.setItem('username', bestUsername);
        try { sessionStorage.setItem('username', bestUsername); } catch(e) {}

        // Atualizar estado local para exibição imediata
        setDisplayName(bestDisplayName);

        // Verificar se o perfil precisa ser atualizado
        if (userProfile && 
            (userProfile.username !== bestUsername || 
             userProfile.display_name !== bestDisplayName)) {

          console.log("Atualizando perfil com username e display_name definidos");

          // Atualizar o perfil no Supabase
          const updateResult = await profileService.updateUserProfile({
            username: bestUsername,
            display_name: bestDisplayName,
            updated_at: new Date().toISOString()
          });

          if (updateResult) {
            console.log("Perfil atualizado com sucesso:", updateResult);
            // Notificar outros componentes sobre a atualização
            document.dispatchEvent(new CustomEvent('usernameUpdated', { 
              detail: { username: bestUsername } 
            }));
          }
        }

        // Disparar evento global para outros componentes saberem do username
        if (!window.usernameSyncEvent) {
          window.usernameSyncEvent = true;
          console.log("Disparando evento global de sincronização de username");
          document.dispatchEvent(new CustomEvent('usernameSynchronized', { 
            detail: { username: bestUsername, displayName: bestDisplayName } 
          }));
        }
      }
    } catch (error) {
      console.error("Erro ao sincronizar username com cabeçalho:", error);
    }
  };

  // Declaração global para rastrear se o evento já foi disparado
  declare global {
    interface Window {
      usernameSyncEvent?: boolean;
    }
  }

  useEffect(() => {
    // Verificar se temos um username no cabeçalho e configurar um padrão se não tiver
    const headerUsername = localStorage.getItem('username');
    if (!headerUsername || headerUsername === 'Usuário') {
      console.log("Definindo username padrão no localStorage");
      // Usar um valor dinâmico em vez de um valor fixo
      // Verificar se temos outro nome disponível para usar
      const userEmail = localStorage.getItem('userEmail') || '';
      const userNameFromEmail = userEmail.split('@')[0] || '';

      // Usar o primeiro segmento do email ou um valor genérico
      localStorage.setItem('username', userNameFromEmail || 'user_' + Math.floor(Math.random() * 1000));
    }

    // Forçar carregamento do perfil se userProfile for null
    if (!userProfile) {
      loadProfile();
      return;
    }

    // Garantir que o username seja consistente com o cabeçalho
    ensureCorrectUsername();

    // Obter o username do localStorage (usado pelo cabeçalho)
    const storedUsername = localStorage.getItem('username');

    // Definir displayName com ordem de prioridade
    let nameToDisplay = '';

    if (userProfile.display_name) {
      nameToDisplay = userProfile.display_name;
    } else if (storedUsername) {
      nameToDisplay = storedUsername;
    } else if (userProfile.username) {
      nameToDisplay = userProfile.username;
    } else if (userProfile.full_name) {
      nameToDisplay = userProfile.full_name.split(' ')[0]; // Primeiro nome
    } else {
      nameToDisplay = 'Usuário';
    }

    setDisplayName(nameToDisplay);

    if (userProfile?.avatar_url) {
      setAvatarUrl(userProfile.avatar_url);
    }
    if (userProfile?.cover_url) {
      setCoverUrl(userProfile.cover_url);
    }

    // Verificar se o usuário tem um ID e, caso não tenha, gerar um
    if (!userProfile.user_id) {
      loadProfile();
    }

    // Log para debug - log detalhado para depuração
    console.log("Profile data loaded (detalhado):", {
      display_name: userProfile.display_name,
      username: userProfile.username,
      full_name: userProfile.full_name,
      email: userProfile.email,
      storedUsername: storedUsername,
      nameToDisplay: nameToDisplay,
      completo: userProfile
    });

    // Tentar verificar qualquer outro dado de cadastro que possa existir
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        console.log("Dados do usuário na sessão:", session.user);

        // Se o perfil não tiver um nome de usuário, tentar pegar da sessão ou localStorage
        if (!userProfile.username) {
          const usernameToUse = storedUsername || session.user.user_metadata?.username;

          if (usernameToUse) {
            // Atualizar o perfil com esse nome de usuário
            profileService.updateUserProfile({
              username: usernameToUse
            }).then(updatedProfile => {
              if (updatedProfile) {
                console.log("Nome de usuário atualizado com sucesso:", updatedProfile.username);
                // Salvar no localStorage para garantir consistência
                localStorage.setItem('username', usernameToUse);
                // Recarregar perfil após atualização
                loadProfile();
              }
            });
          }
        }

        // Se o perfil não tiver um nome completo, tentar pegar da sessão
        if (!userProfile.full_name && session.user.user_metadata?.full_name) {
          // Atualizar o perfil com esse nome completo
          profileService.updateUserProfile({
            full_name: session.user.user_metadata.full_name
          });
        }
      }
    }).catch(error => {
      console.error("Erro ao obter sessão:", error);
    });
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
      let filePath = `avatars/${fileName}`;

      // Comprimir a imagem antes do upload (opcional, para melhor performance)
      let fileToUpload = file;
      if (file.size > 1000000) { // Se for maior que 1MB
        const canvas = document.createElement('canvas');
        const img = new Image();

        const loadImage = new Promise<File>((resolve) => {
          img.onload = () => {
            // Calcular novo tamanho mantendo a proporção
            let width = img.width;
            let height = img.height;
            const maxSize = 800; // Tamanho máximo para qualquer dimensão

            if (width > height && width > maxSize) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else if (height > maxSize) {
              width = (width / height) * maxSize;
              height = maxSize;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
              if (blob) {
                const optimizedFile = new File([blob], file.name, { 
                  type: 'image/jpeg', 
                  lastModified: Date.now() 
                });
                resolve(optimizedFile);
              } else {
                resolve(file); // Fallback para arquivo original
              }
            }, 'image/jpeg', 0.85);
          };
          img.onerror = () => resolve(file); // Fallback em caso de erro
        });

        img.src = URL.createObjectURL(file);
        fileToUpload = await loadImage;
      }

      // Upload para o storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        if (uploadError.message.includes('The resource already exists')) {
          // Se o arquivo já existe, gerar um novo nome e tentar novamente
          const newFileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
          const newFilePath = `avatars/${newFileName}`;

          const { error: retryError } = await supabase.storage
            .from('profiles')
            .upload(newFilePath, fileToUpload, {
              cacheControl: '3600',
              upsert: true
            });

          if (retryError) throw retryError;

          // Atualizar o caminho do arquivo
          filePath = newFilePath;
        } else {
          throw uploadError;
        }
      }

      // Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error("Não foi possível obter a URL pública da imagem");
      }

      // Atualizar perfil do usuário
      const updatedProfile = await profileService.updateUserProfile({
        avatar_url: publicUrlData.publicUrl
      });

      if (updatedProfile) {
        setAvatarUrl(publicUrlData.publicUrl);

        // Salvar também no localStorage para uso em outros componentes
        try {
          localStorage.setItem('userAvatarUrl', publicUrlData.publicUrl);
          // Disparar evento para outros componentes saberem que o avatar foi atualizado
          document.dispatchEvent(new CustomEvent('userAvatarUpdated', { 
            detail: { url: publicUrlData.publicUrl } 
          }));
        } catch (e) {
          console.warn("Erro ao salvar avatar no localStorage", e);
        }

        toast({
          title: "Sucesso",
          description: "Foto de perfil atualizada com sucesso",
        });
      } else {
        throw new Error("Não foi possível atualizar o perfil");
      }
    } catch (error) {
      console.error("Erro ao fazer upload da foto de perfil:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao fazer upload da foto: " + (error instanceof Error ? error.message : "Erro desconhecido"),
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
      let filePath = `covers/${fileName}`;

      // Comprimir a imagem antes do upload (opcional, para melhor performance)
      let fileToUpload = file;
      if (file.size > 1500000) { // Se for maior que 1.5MB
        const canvas = document.createElement('canvas');
        const img = new Image();

        const loadImage = new Promise<File>((resolve) => {
          img.onload = () => {
            // Calcular novo tamanho mantendo a proporção
            let width = img.width;
            let height = img.height;

            // Para imagens de capa, manter a largura maior
            const maxWidth = 1200;
            if (width > maxWidth) {
              height = (height / width) * maxWidth;
              width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
              if (blob) {
                const optimizedFile = new File([blob], file.name, { 
                  type: 'image/jpeg', 
                  lastModified: Date.now() 
                });
                resolve(optimizedFile);
              } else {
                resolve(file); // Fallback para arquivo original
              }
            }, 'image/jpeg', 0.8);
          };
          img.onerror = () => resolve(file); // Fallback em caso de erro
        });

        img.src = URL.createObjectURL(file);
        fileToUpload = await loadImage;
      }

      // Upload para o storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        if (uploadError.message.includes('The resource already exists')) {
          // Se o arquivo já existe, gerar um novo nome e tentar novamente
          const newFileName = `${user.id}-cover-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
          const newFilePath = `covers/${newFileName}`;

          const { error: retryError } = await supabase.storage
            .from('profiles')
            .upload(newFilePath, fileToUpload, {
              cacheControl: '3600',
              upsert: true
            });

          if (retryError) throw retryError;

          // Atualizar o caminho do arquivo
          filePath = newFilePath;
        } else {
          throw uploadError;
        }
      }

      // Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error("Não foi possível obter a URL pública da imagem");
      }

      // Atualizar perfil do usuário
      const updatedProfile = await profileService.updateUserProfile({
        cover_url: publicUrlData.publicUrl
      });

      if (updatedProfile) {
        setCoverUrl(publicUrlData.publicUrl);

        // Salvar também no localStorage para uso em outros componentes
        try {
          localStorage.setItem('userCoverUrl', publicUrlData.publicUrl);
          // Disparar evento para outros componentes
          document.dispatchEvent(new CustomEvent('userCoverUpdated', { 
            detail: { url: publicUrlData.publicUrl } 
          }));
        } catch (e) {
          console.warn("Erro ao salvar capa no localStorage", e);
        }

        toast({
          title: "Sucesso",
          description: "Foto de capa atualizada com sucesso",
        });
      } else {
        throw new Error("Não foi possível atualizar o perfil");
      }
    } catch (error) {
      console.error("Erro ao fazer upload da foto de capa:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao fazer upload da capa: " + (error instanceof Error ? error.message : "Erro desconhecido"),
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
      const file = e.target.files[0];
      // Verificar se o arquivo é uma imagem
      if (file.type.startsWith('image/')) {
        uploadProfilePicture(file);
        // Criar uma prévia da imagem para feedback imediato
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setAvatarUrl(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione uma imagem (JPG, PNG, etc.)",
          variant: "destructive"
        });
      }
    }
  };

  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Verificar se o arquivo é uma imagem
      if (file.type.startsWith('image/')) {
        uploadCoverPhoto(file);
        // Criar uma prévia da imagem para feedback imediato
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setCoverUrl(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione uma imagem (JPG, PNG, etc.)",
          variant: "destructive"
        });
      }
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

  async function loadProfile() {
    try {
      // Primeiro garantir que o usuário tenha um ID
      const idGenerated = await profileService.ensureUserHasId();

      // Então carregar o perfil atualizado
      const userData = await profileService.getCurrentUserProfile();

      if (userData) {
        // Atualizar a interface com os dados
        if (typeof setUserProfile === 'function') {
          setUserProfile(userData);
        }

        // Extrair e exibir dados do perfil
        console.log("Perfil recuperado:", userData);

        // Definir nome de exibição (prioridade: display_name, full_name, username)
        setDisplayName(userData.display_name || userData.full_name || userData.username || '');

        // Definir avatar e capa
        setAvatarUrl(userData.avatar_url || null);
        setCoverUrl(userData.cover_url || null);

        // Se houve geração de ID, mostrar toast informativo
        if (idGenerated) {
          toast({
            title: "ID gerado com sucesso",
            description: `Seu ID de usuário: ${userData.user_id}`,
          });
        }

        console.log("Perfil carregado com sucesso:", userData);
        return userData;
      } else {
        console.warn("Nenhum dado de usuário retornado do profileService");

        // Tentar uma segunda vez após um breve intervalo
        setTimeout(async () => {
          const retryUserData = await profileService.getCurrentUserProfile();
          if (retryUserData) {
            console.log("Perfil recuperado na segunda tentativa:", retryUserData);
            setDisplayName(retryUserData.display_name || retryUserData.full_name || retryUserData.username || '');
            setAvatarUrl(retryUserData.avatar_url || null);
            setCoverUrl(retryUserData.cover_url || null);
          }
        }, 1500);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    }
    return null;
  }

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
        loadProfile();
      }

    } catch (error) {
      console.error("Erro ao atualizar ID:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const setUserProfile = (profile: UserProfile | null) => {
    //Implementation for updating the component's state with new profile data.  This is a placeholder.
  }

  return (
    
      
      
      

      {/* Efeitos decorativos */}
      
      
      

      {/* Partículas animadas (visíveis no hover) */}
      
        
          
            {/*
            {[...Array(6)].map((_, i) => (
              
            ))}
            */}
          
        
      

      {/* Cover Photo com gradiente animado e efeito de movimento - altura reduzida */}
      
        {coverUrl ? (
          
            
              
                // Fallback para padrão em caso de erro
                //e.currentTarget.className = "absolute inset-0 w-full h-full object-cover opacity-20";
              
            
          
        ) : (
          
            
              
            
          
        )}

        
        

        {/* Botão de upload da capa (visível no hover) */}
        
          
            
              
              
              Alterar imagem de capa
            
          
          
            
              Upload de imagem de capa
            
          
        

        {/* Efeitos de luz */}
        
          
            
          
        

        
          
            
          
        

        {/* Status badge animado */}
        
          
            
              
              
              Online
            
          
        

        {/* Nível destacado */}
        
          
            
              
              Nível {userProfile?.level || 1}
            
          
        
      

      {/* Avatar com animação avançada - movido para fora da capa */}
      
        
          
            
              
                
                  
                    
                      
                        
                        
                          {displayName?.charAt(0) || userProfile?.display_name?.charAt(0) || "U"}
                        
                      
                    

                    {/* Anel de progresso ao redor do avatar */}
                    
                      
                        
                        
                        
                        
                        
                      
                    

                    {/* Ícone de câmera para upload (visível no hover) */}
                    
                      
                        
                          
                          Alterar
                        
                      
                    
                    
                      Upload de foto de perfil
                    
                  

                  {/* Indicador de status premium */}
                  
                    
                      
                        
                      
                    
                  
                
              
            
          
        
      

      {/* Profile Info - padding reduzido */}
      
        
          {(() => {
            // Informações para depuração
            console.log("Perfil carregado para exibição:", {
              displayName,
              profile_display_name: userProfile?.display_name,
              profile_full_name: userProfile?.full_name,
              profile_username: userProfile?.username
            });

            // Obter dados do usuário de todas as fontes possíveis
            // Começar com localStorage que contém os dados do cabeçalho
            const headerUsername = localStorage.getItem('username');
            const userFirstName = localStorage.getItem('userFirstName');
            const userDisplayName = localStorage.getItem('userDisplayName');

            // Garantir que sempre temos um nome de usuário válido
            // Prioridade de obtenção: localStorage > perfil > session > fallback
            const resolvedUsername = headerUsername && headerUsername !== 'Usuário' 
                                  ? headerUsername 
                                  : userProfile?.username && userProfile.username !== 'Usuário'
                                  ? userProfile.username
                                  : sessionStorage.getItem('username') || 'user_' + Math.floor(Math.random() * 1000);

            // Se o nome recuperado for válido mas diferente do que está no localStorage,
            // atualizar o localStorage para manter a consistência
            if (resolvedUsername && resolvedUsername !== 'Usuário' && headerUsername !== resolvedUsername) {
              localStorage.setItem('username', resolvedUsername);
            }

            console.log("Dados para exibição do perfil:", {
              localStorage_username: headerUsername,
              localStorage_userFirstName: userFirstName,
              localStorage_userDisplayName: userDisplayName,
              profile_username: userProfile?.username,
              profile_display_name: userProfile?.display_name,
              profile_full_name: userProfile?.full_name,
              resolved_username: resolvedUsername
            });

            // Função auxiliar para verificar se um nome de usuário é válido
            const isValidUsername = (username: string | null | undefined): boolean => {
              return !!username && 
                     username !== 'Usuário' && 
                     username !== 'user_undefined' && 
                     !username.includes('user_') && 
                     username.length > 1;
            };

            // Determinação do nome de exibição com prioridade clara
            const displayNameToUse = 
              (userProfile?.display_name && userProfile.display_name !== 'Usuário' ? userProfile.display_name : null) || 
              userDisplayName || 
              userFirstName || 
              (userProfile?.full_name ? userProfile.full_name.split(' ')[0] : null) || 
              'Usuário';

            // Busca um nome de usuário válido em todas as fontes disponíveis
            // Primeiro tentar obter do email (primeiro segmento do email como fallback universal)
            const emailUsername = userProfile?.email ? userProfile.email.split('@')[0] : null;

            // Nome de usuário com prioridade de fontes e validação
            let usernameToDisplay;

            // 1. Verificar username do perfil (fonte definitiva)
            if (isValidUsername(userProfile?.username)) {
              usernameToDisplay = userProfile?.username;
            } 
            // 2. Verificar username do localStorage (usado pelo header)
            else if (isValidUsername(headerUsername)) {
              usernameToDisplay = headerUsername;

              // Se temos username válido no localStorage mas não no perfil, atualizar o perfil
              if (userProfile && userProfile.id) {
                setTimeout(() => {
                  profileService.updateUserProfile({
                    id: userProfile.id,
                    username: headerUsername
                  }).then(() => console.log("Perfil atualizado com username do localStorage"));
                }, 500);
              }
            } 
            // 3. Verificar metadados de sessão (via sessionStorage)
            else if (isValidUsername(sessionStorage.getItem('username'))) {
              usernameToDisplay = sessionStorage.getItem('username');
            }
            // 4. Usar email como fonte alternativa (muito confiável)
            else if (isValidUsername(emailUsername)) {
              usernameToDisplay = emailUsername;

              // Salvar no localStorage e atualizar perfil
              if (emailUsername) {
                localStorage.setItem('username', emailUsername);

                if (userProfile && userProfile.id) {
                  setTimeout(() => {
                    profileService.updateUserProfile({
                      id: userProfile.id,
                      username: emailUsername
                    }).then(() => console.log("Perfil atualizado com username do email"));
                  }, 500);
                }
              }
            }
            // 5. Gerar um nome de usuário consistente baseado no ID
            else if (userProfile?.user_id) {
              const generatedUsername = `user_${userProfile.user_id.substring(userProfile.user_id.length - 6)}`;
              usernameToDisplay = generatedUsername;

              // Salvar para uso futuro
              localStorage.setItem('username', generatedUsername);

              if (userProfile && userProfile.id) {
                setTimeout(() => {
                  profileService.updateUserProfile({
                    id: userProfile.id,
                    username: generatedUsername
                  }).then(() => console.log("Perfil atualizado com username gerado do ID"));
                }, 500);
              }
            }
            // 6. Último recurso: gerar nome aleatório mas FIXO (usando data)
            else {
              // Gerar com base em data para ser constante
              const date = new Date();
              const seedValue = date.getFullYear() + date.getMonth() + date.getDate();
              const generatedUsername = `user_${seedValue}`;
              usernameToDisplay = generatedUsername;

              // Salvar para uso futuro
              localStorage.setItem('username', generatedUsername);
            }

            // Exibir nome e username consistentes com o header
            return (
              <>
                {(() => {
                  // Obter o primeiro nome com prioridade
                  const firstNameFromFullName = userProfile?.full_name?.split(' ')[0] || '';
                  const firstName = firstNameFromFullName || 
                                  userProfile?.display_name || 
                                  localStorage.getItem('userFirstName') || 
                                  ''; 

                  return (
                    <>
                      {firstName}  |  @{usernameToDisplay}
                    </>
                  );
                })()}
              </>
            );
          })()}
        

        {/* User ID block */}
        {userProfile?.user_id ? (
          
            
            
              ID: 
            
          
        ) : (
          
            
            
              ID: Gerando...
            
          
        )}

        
          
            
              
                Plano {userProfile?.plan_type === "full" 
                ? "Full" 
                : userProfile?.plan_type === "premium" 
                  ? "Premium" 
                  : "Lite"}
              
            
          
        

        
          
            
              
              Estudante de Engenharia de Software
            
          
        

        {/* Stats com ícones e hover effects - reduzido */}
        
          {/* Parceiros/Seguidores - exibe 0 para novos usuários */}
          
            
              
                
                

                  
                    {pendingRequests.length > 0 && (
                      
                        {pendingRequests.length}
                      
                    )}
                  

                  {userProfile?.followers_count || 0}
                
                Parceiros
              
            
            
              {/* Tooltip quando não há parceiros */}
              {showFollowersTooltip && (
                
                  {(userProfile?.followers_count || 0) === 0 ? (
                    
                      
                        Nenhum parceiro ainda
                      
                      
                        Use o botão "Adicionar Parceiros" para conectar-se com outros usuários
                      
                    
                  ) : (
                    
                      {userProfile?.followers_count} Parceiros
                    
                  )}
                
              )}
            
          

          
            
              
                
                  {userProfile?.level || 1}
                
                Nível
              
            
            
              {/* Tooltip com detalhes do nível */}
              {showStatsDetails && (
                
                  Detalhes do Nível
                  
                    XP Atual:
                    {userProfile?.experience_points || 0}/{((userProfile?.level || 1) * 1000)}
                  
                  
                    Próximo Nível:
                    Nível {(userProfile?.level || 1) + 1}
                  
                
              )}
            
          

          
            
              
                {userProfile?.classes_count || 0}
              
            Turmas
          

          
            
              
                {userProfile?.achievements_count || 0}
              
            Conquistas
          
        

        {/* Barra de progresso melhorada - reduzida */}
        
          
            
              Progresso para o próximo nível
            
            
              {(() => {
                const currentXP = userProfile?.experience_points || 0;
                const currentLevel = userProfile?.level || 1;
                const xpForNextLevel = currentLevel * 1000;
                const previousLevelXP = (currentLevel - 1) * 1000;
                const xpInCurrentLevel = currentXP - previousLevelXP;
                const xpNeededForLevel = xpForNextLevel - previousLevelXP;
                const progressPercentage = xpNeededForLevel > 0 ? Math.round((xpInCurrentLevel / xpNeededForLevel) * 100) : 0;
                return `${progressPercentage}%`;
              })()}
            
            
              
                Progresso
              
              {userProfile?.experience_points || 0}/{(userProfile?.level || 1) * 1000} XP
              Faltam {((userProfile?.level || 1) * 1000) - (userProfile?.experience_points || 0)} XP
            
          
        

        {/* Botões modernizados - reduzidos */}
        
          
            
              
              Editar Perfil
            
          
          
            
              
              Compartilhar
            
          
          
            
              
              Adicionar Parceiros
            
          
        

        {/* Conquistas recentes animadas - reduzido */}
        
          
            
              
                
                  
                    
                      {recentAchievements[activeAchievement]?.icon}
                    
                    
                      
                        {recentAchievements[activeAchievement]?.name}
                      
                      
                        {recentAchievements[activeAchievement]?.date}
                      
                    
                  
                
              
            
          
        

        {/* Mini tooltip de conquistas */}
        
          
            {(userProfile?.achievements_count || 0) === 0 ? (
              "Suas conquistas aparecerão aqui conforme você progride"
            ) : (
              `${userProfile?.achievements_count} conquista${(userProfile?.achievements_count || 0) > 1 ? 's' : ''} obtida${(userProfile?.achievements_count || 0) > 1 ? 's' : ''}`
            )}
          
          {/* Indicador simples */}
        

        
          
            
              
                Ativo há 3 horas
              
            
          
        
      
    
  );
}