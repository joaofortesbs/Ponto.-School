import React, { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Users, TrendingUp, TrendingDown } from "lucide-react";

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

        // 2. ATUALIZAÇÃO EM BACKGROUND: Buscar versão mais recente do servidor
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

  // Dados fictícios - substituir por dados reais da API
  const totalAlunos = 2;
  const totalAlunosHoje = 2;
  const totalAlunosOntem = 2; // Dados do dia anterior

  // Cálculo real do percentual de variação
  const percentualVariacao = totalAlunosOntem > 0
    ? Math.round(((totalAlunosHoje - totalAlunosOntem) / totalAlunosOntem) * 100)
    : 0;


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

      {/* Card Alunos */}
      <div className="flex flex-col justify-between p-6 rounded-lg shadow-md w-64 h-40"
        style={{
          background: isLightMode
            ? 'linear-gradient(180deg, #FFF, #F5F5F5)'
            : 'linear-gradient(180deg, #1E293B, #0F172A)',
          border: isLightMode ? '1px solid #e2e8f0' : '1px solid #334155',
        }}>

        <div className="flex items-center gap-3">
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
            ${isLightMode
              ? 'bg-gradient-to-br from-orange-50 to-orange-100/50'
              : 'bg-gradient-to-br from-orange-500/10 to-orange-600/5'
            }
            border border-orange-500/20
            shadow-sm
          `}>
            <Users className="text-orange-500" size={20} strokeWidth={2} fill="none" />
          </div>
          <div>
            <h3 className={`font-bold text-lg tracking-wide ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
              Alunos
            </h3>
          </div>
        </div>

        <div className={`
          px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1
          ${percentualVariacao >= 0
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }
        `}>
          {percentualVariacao >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {percentualVariacao >= 0 ? '+' : ''}{percentualVariacao}%
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-6">
          <div className={`text-5xl font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
            {totalAlunos}
          </div>
        </div>
      </div>
    </>
  );
}