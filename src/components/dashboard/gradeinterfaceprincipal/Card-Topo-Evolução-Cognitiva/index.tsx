
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/components/ThemeProvider";

interface CardTopoEvolucaoCognitivaProps {
  progressValue?: number;
  materialsCount?: number;
}

export default function CardTopoEvolucaoCognitiva({ 
  progressValue = 65, 
  materialsCount = 12 
}: CardTopoEvolucaoCognitivaProps) {
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

        console.log("🔍 Buscando avatar do usuário:", userEmail);

        const response = await fetch(`/api/perfis?email=${encodeURIComponent(userEmail)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const result = await response.json();

        if (result.success && result.data) {
          const avatarUrl = result.data.imagem_avatar;
          if (avatarUrl) {
            setUserAvatar(avatarUrl);
            console.log("✅ Avatar carregado com sucesso");
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

  return (
    <Card
      className={`
        lg:col-span-2
        group relative overflow-hidden 
        ${isLightMode 
          ? 'bg-white/95 border-2 border-orange-100/60 hover:border-orange-300/80' 
          : 'bg-[#001F3F]/60 border-2 border-orange-500/15 hover:border-orange-500/35'
        }
        transition-all duration-500 ease-out
        rounded-[1.5rem]
        h-[90px]
        hover:shadow-2xl hover:shadow-orange-500/20
        hover:-translate-y-2
        backdrop-blur-xl
        cursor-pointer
      `}
    >
      {/* Animated gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out`} />
      
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1200 ease-[cubic-bezier(0.4,0,0.2,1)] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Glow effect border */}
      <div className="absolute inset-0 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out bg-gradient-to-r from-orange-500/0 via-orange-500/20 to-orange-500/0 blur-xl" />

      <CardContent className="relative p-4 h-full flex items-center gap-3 z-10">
        {/* Avatar do usuário */}
        <div className="rounded-full overflow-hidden bg-gradient-to-r from-[#FF6B00] via-[#FF8736] to-[#FFB366] p-0.5 cursor-pointer transition-all duration-300 w-12 h-12 flex-shrink-0">
          <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-[#001427] flex items-center justify-center">
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
          <div className="flex items-center gap-3 mb-2">
            {/* Barra de progresso */}
            <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500 ease-out"
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
          <div className="flex items-center gap-1.5">
            <i className={`fas fa-book text-xs ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`}></i>
            <span className={`text-xs ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {materialsCount} materiais adicionados
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
