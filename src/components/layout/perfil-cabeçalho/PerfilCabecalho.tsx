
import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown, Diamond } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, HelpCircle, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { profileService } from "@/services/profileService";
import { UserProfile } from "@/types/user-profile";
import { ModalGeral } from "@/components/modal-geral";
import { powersService, PowersBalance } from "@/services/powersService";

const PerfilCabecalho: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [powers, setPowers] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updatePowersFromBalance = useCallback((balance: PowersBalance) => {
    console.log('[PerfilCabecalho] 💰 Atualizando Powers:', balance.available);
    setPowers(balance.available);
  }, []);

  useEffect(() => {
    const fetchUserProfileAndPowers = async () => {
      console.log('[PerfilCabecalho] 🚀 === INICIANDO CARREGAMENTO ===');
      try {
        // CRITICAL: Carregar perfil PRIMEIRO para que o email seja salvo
        const profile = await profileService.getCurrentUserProfile();
        setUserProfile(profile);
        console.log('[PerfilCabecalho] 👤 Perfil carregado:', profile?.nome_completo || 'N/A');
        console.log('[PerfilCabecalho] 📧 Email do perfil:', profile?.email || 'NÃO ENCONTRADO');
        
        // CRITICAL DEBUG: Log de todos os campos do perfil recebido
        console.log('[PerfilCabecalho] 📋 === PERFIL RECEBIDO (TODOS OS CAMPOS) ===');
        console.log('[PerfilCabecalho] 📋 profile:', JSON.stringify(profile, null, 2));
        console.log('[PerfilCabecalho] 📋 profile.powers_carteira:', profile?.powers_carteira);
        console.log('[PerfilCabecalho] 📋 typeof powers_carteira:', typeof profile?.powers_carteira);
        
        // FAST-PATH: Se o perfil já tem powers_carteira, usar diretamente (evita segunda chamada)
        if (profile?.email && typeof profile.powers_carteira === 'number') {
          console.log('[PerfilCabecalho] ⚡ FAST-PATH: Powers já vieram do perfil:', profile.powers_carteira);
          powersService.setBalanceFromProfile(profile.powers_carteira, profile.email);
          setPowers(profile.powers_carteira);
          console.log('[PerfilCabecalho] ⚡ Powers definidos instantaneamente:', profile.powers_carteira);
        } else if (profile?.email) {
          // Fallback: Perfil não veio com powers_carteira, buscar separadamente
          console.log('[PerfilCabecalho] 🔄 Fallback: Buscando Powers separadamente...');
          powersService.setUserEmail(profile.email);
          
          const balance = await powersService.forceRefreshFromDatabase(profile.email);
          
          if (powersService.isBalanceReady()) {
            setPowers(balance.available);
            console.log('[PerfilCabecalho] 💰 Powers carregados do banco:', balance.available);
          } else {
            console.log('[PerfilCabecalho] ⏳ Aguardando resposta do banco...');
            setPowers(null);
          }
        } else {
          console.warn('[PerfilCabecalho] ⚠️ Perfil sem email - Powers podem não sincronizar');
          await powersService.initialize();
          
          if (powersService.isBalanceReady()) {
            const balance = powersService.getBalance();
            setPowers(balance.available);
          } else {
            setPowers(null);
          }
        }
        
        console.log('[PerfilCabecalho] ✅ === CARREGAMENTO CONCLUÍDO ===');
      } catch (error) {
        console.error('[PerfilCabecalho] ❌ Erro ao carregar perfil/Powers:', error);
        setPowers(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfileAndPowers();

    const darkMode = localStorage.getItem("darkMode") === "true";
    setIsDark(darkMode);

    const loadProfileImage = () => {
      const tempPreview = localStorage.getItem("tempAvatarPreview");
      const cachedAvatar = localStorage.getItem("userAvatarUrl");
      
      if (tempPreview) {
        setProfileImage(tempPreview);
      } else if (cachedAvatar) {
        setProfileImage(cachedAvatar);
      }
    };

    loadProfileImage();

    const handleAvatarUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.avatarUrl) {
        setProfileImage(customEvent.detail.avatarUrl);
      }
    };

    const handlePointsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.points !== undefined) {
        console.log('[PerfilCabecalho] 📡 Evento schoolPointsUpdated recebido:', customEvent.detail.points);
        setPowers(customEvent.detail.points);
      }
    };

    const handleBalanceChanged = (event: Event) => {
      const customEvent = event as CustomEvent;
      // DB-ONLY v3.1: Só atualizar se o saldo veio do banco
      if (customEvent.detail?.available !== undefined && powersService.isBalanceReady()) {
        console.log('[PerfilCabecalho] 📡 Evento powers:balance:changed recebido (DB confirmado):', customEvent.detail.available);
        setPowers(customEvent.detail.available);
      }
    };

    document.addEventListener("userAvatarUpdated", handleAvatarUpdate as EventListener);
    document.addEventListener("schoolPointsUpdated", handlePointsUpdate as EventListener);
    window.addEventListener("powers:balance:changed", handleBalanceChanged as EventListener);

    const unsubscribe = powersService.onUpdate((balance) => {
      // DB-ONLY v3.1: Só atualizar se o saldo veio do banco
      if (powersService.isBalanceReady()) {
        console.log('[PerfilCabecalho] 📡 powersService.onUpdate recebido (DB confirmado):', balance.available);
        updatePowersFromBalance(balance);
      } else {
        console.log('[PerfilCabecalho] ⏳ Ignorando update - aguardando DB');
      }
    });

    return () => {
      document.removeEventListener("userAvatarUpdated", handleAvatarUpdate as EventListener);
      document.removeEventListener("schoolPointsUpdated", handlePointsUpdate as EventListener);
      window.removeEventListener("powers:balance:changed", handleBalanceChanged as EventListener);
      unsubscribe();
    };
  }, [updatePowersFromBalance]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('auth_status');
      localStorage.removeItem('auth_checked');

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      console.log("Usuário deslogado com sucesso");

      window.dispatchEvent(new CustomEvent('logout'));

      setTimeout(() => {
        window.location.href = "/login";
      }, 100);
    } catch (error) {
      console.error("Erro ao realizar logout:", error);
      window.location.href = "/login";
    }
  };

  const isLightMode = !isDark;

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-1.5 px-1.5 py-1 rounded-full bg-white dark:bg-[#0A2540] border border-[#E0E1DD] dark:border-white/10 hover:border-[#FF6B00]/30 dark:hover:border-[#FF6B00]/30 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md">
          {/* Avatar Circular */}
          <div className="relative">
            <Avatar className="w-9 h-9 border-2 border-transparent group-hover:border-[#FF6B00]/20 transition-all duration-300">
              <AvatarImage
                src={profileImage || userProfile?.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.username || "user"}`}
                alt={userProfile?.display_name || userProfile?.username || "Usuário"}
                className="w-full h-full object-cover scale-125"
              />
              <AvatarFallback className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] text-white text-xs font-bold">
                {userProfile?.display_name?.substring(0, 2) ||
                  userProfile?.username?.substring(0, 2) ||
                  "U"}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Valor e Ícone */}
          <div className="flex items-center gap-0.5">
            <img 
              src={`/lovable-uploads/icone-powers.png?v=${Date.now()}`}
              alt="Powers" 
              className="w-4 h-4 object-contain"
              onError={(e) => {
                console.error('Erro ao carregar imagem icone-powers.png');
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-sm font-semibold text-[#FF6B00]">{powers !== null ? powers : '...'}</span>
            <ChevronDown className="h-4 w-4 text-[#64748B] dark:text-white/60 group-hover:text-[#FF6B00] dark:group-hover:text-[#FF6B00] transition-colors duration-300" />
          </div>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-48 p-0 overflow-hidden border-0"
        style={{
          backgroundColor: isLightMode 
            ? 'rgba(254, 240, 231, 0.73)' 
            : '#0D1D2E',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: '1px solid rgba(255, 107, 0, 0.15)',
          borderRadius: '18px',
          boxShadow: isLightMode
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 8px 16px -8px rgba(255, 107, 0, 0.1), inset 0 1px 0 rgba(255, 107, 0, 0.1)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 8px 16px -8px rgba(255, 107, 0, 0.15), inset 0 1px 0 rgba(255, 107, 0, 0.12)'
        }}
      >
        {/* Header minimalista */}
        <div 
          className="px-5 py-4 relative"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.08) 0%, rgba(255, 140, 64, 0.04) 100%)',
            borderBottom: '1px solid rgba(255, 107, 0, 0.12)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF6B00]/3 to-transparent" />
          <h3 className={`text-sm font-bold relative z-10 tracking-wide text-center ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
            Minha Conta
          </h3>
        </div>

        {/* Menu Items */}
        <div className="py-3 px-2">
          <DropdownMenuItem 
            className={`mx-2 my-1.5 rounded-lg cursor-pointer transition-all duration-300 group relative overflow-hidden hover:bg-white/5 hover:text-[#FF6B00] focus:bg-white/5 focus:text-[#FF6B00] border border-transparent hover:border-[#FF6B00] ${isLightMode ? 'text-gray-700' : 'text-white'}`}
            onClick={() => setIsModalOpen(true)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF6B00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <User className={`mr-3.5 h-4 w-4 relative z-10 group-hover:text-[#FF6B00] transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <span className="relative z-10 font-normal text-sm">Perfil</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            className={`mx-2 my-1.5 rounded-lg cursor-pointer transition-all duration-300 group relative overflow-hidden hover:bg-white/5 hover:text-[#FF6B00] focus:bg-white/5 focus:text-[#FF6B00] border border-transparent hover:border-[#FF6B00] ${isLightMode ? 'text-gray-700' : 'text-white'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF6B00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <HelpCircle className={`mr-3.5 h-4 w-4 relative z-10 group-hover:text-[#FF6B00] transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <span className="relative z-10 font-normal text-sm">Ajuda</span>
          </DropdownMenuItem>
        </div>

        {/* Separator */}
        <div 
          className="mx-4 my-2 h-px"
          style={{
            background: 'linear-gradient(to right, transparent, rgba(255, 107, 0, 0.15), transparent)'
          }}
        />

        {/* Logout */}
        <div className="pb-3 px-2">
          <DropdownMenuItem 
            className={`mx-2 my-1.5 rounded-lg cursor-pointer transition-all duration-300 group relative overflow-hidden hover:bg-red-500/10 hover:text-red-500 focus:bg-red-500/10 focus:text-red-500 border border-transparent hover:border-red-500/20 ${isLightMode ? 'text-gray-700' : 'text-white'}`}
            onClick={handleLogout}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <LogOut className={`mr-3.5 h-4 w-4 relative z-10 group-hover:text-red-500 transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <span className="relative z-10 font-normal text-sm">Sair</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
    
    <ModalGeral 
      isOpen={isModalOpen} 
      onClose={() => setIsModalOpen(false)}
      initialSection="perfil"
    />
    </>
  );
};

export default PerfilCabecalho;
