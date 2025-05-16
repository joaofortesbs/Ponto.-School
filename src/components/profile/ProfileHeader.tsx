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
  UserCheck
} from "lucide-react";
import AddFriendsModal from "./AddFriendsModal";
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
  const [showAddFriendsModal, setShowAddFriendsModal] = useState(false);


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
          <div className="absolute inset-0 w-full h-full">
            <img
              src={coverUrl}
              alt="Cover"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                console.error("Erro ao carregar imagem de capa", e);
                // Fallback para padrão em caso de erro
                e.currentTarget.src = "/images/pattern-grid.svg";
                e.currentTarget.className = "absolute inset-0 w-full h-full object-cover opacity-20";
              }}
            />
          </div>
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
            <span className="sr-only">Alterar imagem de capa</span>
          </div>
        </div>
        <input
          type="file"
          ref={coverPhotoRef}
          className="hidden"
          accept="image/*"
          onChange={handleCoverPhotoChange}
          aria-label="Upload de imagem de capa"
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

        {/* Nível destacado e Adicionar amigos */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] text-white text-xs py-0.5 px-2 rounded-full flex items-center shadow-lg"
          >
            <Zap className="h-3 w-3 mr-1" />
            Nível {userProfile?.level || 1}
          </motion.div>
          
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.3 }}
            className="bg-white/20 backdrop-blur-sm text-white text-xs py-0.5 px-2 rounded-full flex items-center shadow-lg cursor-pointer hover:bg-white/30 transition-colors"
            onClick={() => setShowAddFriendsModal(true)}
          >
            <UserPlus className="h-3 w-3 mr-1" />
            Adicionar amigos
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
              <Avatar className="w-20 h-20 border-4 border-white dark:border-[#0A2540] shadow-xl group-hover/avatar:border-[#FF6B00]/20 transition-all duration-300 relative overflow-hidden">
                <AvatarImage
                  src={avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=John"}
                  alt="Avatar"
                  className="object-cover z-10"
                  onError={(e) => {
                    console.error("Erro ao carregar avatar", e);
                    // Esconder a imagem com erro
                    e.currentTarget.style.display = 'none';
                    // Será mostrado o AvatarFallback automaticamente
                  }}
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
                  className="opacity-70 group-hover/avatar:opacity-100 transition-opacity"
                  strokeLinecap="round"
                />
              </svg>

              {/* Ícone de câmera para upload (visível no hover) */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 z-20">
                <div className="flex flex-col items-center">
                  <Camera className="h-6 w-6 text-white" />
                  <span className="text-white text-xs mt-1">Alterar</span>
                </div>
              </div>
            </motion.div>
            <input
              type="file"
              ref={profilePictureRef}
              className="hidden"
              accept="image/*"
              onChange={handleProfilePictureChange}
              aria-label="Upload de foto de perfil"
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
                      {firstName} <span className="text-gray-400 dark:text-gray-400">|</span> <span className="text-[#FF6B00]">@{usernameToDisplay}</span>
                    </>
                  );
                })()}
              </>
            );
          })()}
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
            {userProfile?.plan_type === "full" 
                ? "Plano Full" 
                : userProfile?.plan_type === "premium" 
                  ? "Plano Premium" 
                  : "Plano Lite"}
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
          {/* Seguidores - agora é o primeiro componente */}
          <motion.div
            whileHover={{ y: -3, scale: 1.03 }}
            className="text-center group/stat bg-slate-50 dark:bg-slate-800/30 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/30 transition-all duration-300 shadow-sm hover:shadow border border-transparent hover:border-[#FF6B00]/10 relative"
            onMouseEnter={() => setShowFollowersTooltip(true)}
            onMouseLeave={() => setShowFollowersTooltip(false)}
          >
            <div className="flex flex-col items-center justify-center">
              <div className="w-6 h-6 bg-[#FF6B00]/10 rounded-full flex items-center justify-center mb-0.5 group-hover/stat:bg-[#FF6B00]/20 transition-all duration-300">
                <UserPlus className="h-3.5 w-3.5 text-[#FF6B00] group-hover/stat:scale-110 transition-transform" />
              </div>
              <p className="text-base font-bold text-[#29335C] dark:text-white">24</p>
              <p className="text-[10px] text-[#64748B] dark:text-white/60">Seguidores</p>
            </div>
            
            {/* Tooltip com detalhes dos seguidores */}
            {showFollowersTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -top-24 left-1/2 transform -translate-x-1/2 bg-white dark:bg-[#1E293B] p-2 rounded-lg shadow-lg text-xs z-30 w-48 border border-[#E0E1DD] dark:border-white/10"
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium text-[#29335C] dark:text-white">
                    {showFollowingInTooltip ? "Seguindo (18)" : "Seguidores (24)"}
                  </div>
                  <div 
                    className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-full px-1.5 py-0.5 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    onClick={() => setShowFollowingInTooltip(!showFollowingInTooltip)}
                  >
                    {showFollowingInTooltip ? 
                      <UserPlus className="h-3 w-3 text-[#FF6B00]" /> : 
                      <UserCheck className="h-3 w-3 text-[#FF6B00]" />
                    }
                    <span className="text-[9px] text-[#29335C] dark:text-white">
                      {showFollowingInTooltip ? "Ver seguidores" : "Ver seguindo"}
                    </span>
                  </div>
                </div>
                
                <div className="max-h-20 overflow-y-auto">
                  {!showFollowingInTooltip ? (
                    // Conteúdo de seguidores
                    <>
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                          <span className="text-[9px] font-medium">ML</span>
                        </div>
                        <span className="text-[#29335C] dark:text-white">Maria Lima</span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
                          <span className="text-[9px] font-medium">PS</span>
                        </div>
                        <span className="text-[#29335C] dark:text-white">Pedro Silva</span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center overflow-hidden">
                          <span className="text-[9px] font-medium">AS</span>
                        </div>
                        <span className="text-[#29335C] dark:text-white">Ana Santos</span>
                      </div>
                      <div className="text-center text-[#FF6B00] text-[10px] mt-1 cursor-pointer hover:underline">
                        Ver todos os 24 seguidores
                      </div>
                    </>
                  ) : (
                    // Conteúdo de quem o usuário segue
                    <>
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                          <span className="text-[9px] font-medium">JC</span>
                        </div>
                        <span className="text-[#29335C] dark:text-white">João Costa</span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center overflow-hidden">
                          <span className="text-[9px] font-medium">CM</span>
                        </div>
                        <span className="text-[#29335C] dark:text-white">Carlos Mendes</span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-5 h-5 rounded-full bg-pink-100 flex items-center justify-center overflow-hidden">
                          <span className="text-[9px] font-medium">LC</span>
                        </div>
                        <span className="text-[#29335C] dark:text-white">Lucia Campos</span>
                      </div>
                      <div className="text-center text-[#FF6B00] text-[10px] mt-1 cursor-pointer hover:underline">
                        Ver todos os 18 perfis
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>

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
      
      {/* Modal de Adicionar Amigos */}
      <AddFriendsModal 
        open={showAddFriendsModal} 
        onOpenChange={setShowAddFriendsModal} 
      />
    </div>
  );
}