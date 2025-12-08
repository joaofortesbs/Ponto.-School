
import React, { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";

export default function CardTopoEvolucaoCognitiva() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAvatar = async () => {
      try {
        const neonUser = localStorage.getItem("neon_user");
        if (!neonUser) {
          console.log("🔐 Usuário não autenticado");
          return;
        }

        const userData = JSON.parse(neonUser);
        const userEmail = userData.email;

        if (!userEmail) {
          console.log("❌ Email não encontrado");
          return;
        }

        // Chave única para cache do avatar
        const avatarCacheKey = `avatar_cache_${userEmail}`;
        
        // 1. CARREGAMENTO INSTANTÂNEO: Verificar cache primeiro
        const cachedAvatar = localStorage.getItem(avatarCacheKey);
        if (cachedAvatar) {
          setUserAvatar(cachedAvatar);
          console.log("⚡ Avatar carregado instantaneamente do cache");
        }

        // 2. ATUALIZAÇÃO EM BACKGROUND: Buscar versão mais recente do servidor (com deduplicação)
        console.log("🔍 Buscando avatar do usuário:", userEmail);

        const { fetchProfileByEmail } = await import('@/lib/profile-api');
        const result = await fetchProfileByEmail(userEmail);

        if (result.success && result.data) {
          const avatarUrl = result.data.imagem_avatar;
          if (avatarUrl) {
            // Atualizar estado
            setUserAvatar(avatarUrl);
            
            // Salvar no cache para próximas vezes
            localStorage.setItem(avatarCacheKey, avatarUrl);
            
            console.log("✅ Avatar carregado e salvo no cache");
          } else {
            console.log("⚠️ Usuário sem avatar cadastrado");
          }
        } else {
          console.log("⚠️ Perfil não encontrado no Neon");
        }
      } catch (error) {
        console.error("❌ Erro ao buscar avatar:", error);
      }
    };

    fetchUserAvatar();
  }, []);

  const progressValue = 0;
  const materialsCount = 0;

  return (
    <>
      {/* Avatar do usuário */}
      <div className="relative w-12 h-12 rounded-full flex-shrink-0 p-[2px] bg-gradient-to-br from-[#FF6000] via-[#FF6000] to-[#FFCC33] group-hover:from-[#FF6000] group-hover:via-[#FFA54D] group-hover:to-[#FF6000] transition-all duration-500 shadow-lg shadow-orange-500/30">
        <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-[#001F3F]">
          {userAvatar ? (
            <img 
              src={userAvatar} 
              alt="Avatar do usuário" 
              className="w-full h-full object-cover"
              onError={() => setUserAvatar(null)}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${isLightMode ? 'bg-gradient-to-br from-orange-50 to-orange-100' : 'bg-gradient-to-br from-orange-500/20 to-orange-600/10'}`}>
              <i className="fas fa-user text-orange-500" style={{ fontSize: '1.5rem' }}></i>
            </div>
          )}
        </div>
      </div>

      {/* Barra de progresso e informações */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          {/* Barra de progresso */}
          <div className="flex-1 h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#FF6000] via-[#FF7300] to-[#FFCC33] transition-all duration-500 ease-out"
              style={{ width: `${progressValue}%` }}
            />
          </div>
          
          {/* Botão adicionar */}
          <button className={`
            w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
            ${isLightMode 
              ? 'bg-orange-50 hover:bg-orange-100 text-orange-600' 
              : 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400'
            }
            transition-all duration-300 ease-out
            hover:scale-110
          `}>
            <i className="fas fa-plus text-sm"></i>
          </button>
        </div>
        
        {/* Contador de materiais */}
        <div className="flex items-center gap-1.5 mt-1">
          <i className={`fas fa-book text-xs ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`}></i>
          <span className={`text-xs ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {materialsCount > 0 ? `${materialsCount} materiais adicionados` : 'Comece a adicionar materiais'}
          </span>
        </div>
      </div>
    </>
  );
}
