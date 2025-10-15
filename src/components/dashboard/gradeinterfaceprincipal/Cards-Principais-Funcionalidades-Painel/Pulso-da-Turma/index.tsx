
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/components/ThemeProvider";

export default function PulsoDaTurmaCard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";

  return (
    <Card
      className={`
        group relative overflow-hidden
        ${isLightMode 
          ? 'bg-white/95 border-2 border-orange-100/60 hover:border-orange-300/80' 
          : 'bg-[#001F3F]/60 border-2 border-orange-500/15 hover:border-orange-500/35'
        }
        transition-all duration-500 ease-out
        rounded-[1.5rem]
        h-[420px]
        hover:shadow-2xl hover:shadow-orange-500/20
        hover:-translate-y-2
        backdrop-blur-xl
        cursor-pointer
      `}
    >
      {/* Background gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out" />
      
      {/* Efeito shimmer */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1200 ease-[cubic-bezier(0.4,0,0.2,1)] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <CardContent className="relative p-0 h-full flex flex-col z-10">
        {/* Header Padronizado - Altura fixa de 72px */}
        <div className={`
          h-[72px] px-6 py-4
          flex items-center justify-between
          border-b-2
          ${isLightMode 
            ? 'bg-gradient-to-r from-orange-50 to-orange-100/50 border-orange-200/50' 
            : 'bg-gradient-to-r from-orange-500/10 to-orange-600/5 border-orange-500/20'
          }
        `}>
          <div className="flex items-center gap-3">
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center
              bg-gradient-to-br from-orange-500 to-orange-600
              shadow-lg shadow-orange-500/30
            `}>
              <i className="fas fa-heart text-white text-lg"></i>
            </div>
            <h3 className={`font-bold text-lg uppercase tracking-wide ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
              Pulso da Turma
            </h3>
          </div>
          <button className={`
            w-9 h-9 rounded-lg flex items-center justify-center
            ${isLightMode 
              ? 'hover:bg-orange-50 text-orange-600' 
              : 'hover:bg-orange-500/10 text-orange-400'
            }
            transition-colors duration-300
          `}>
            <i className="fas fa-cog text-sm"></i>
          </button>
        </div>

        {/* Conteúdo do Card */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto custom-scrollbar">
          {/* Métrica Hero */}
          <div className={`p-6 rounded-2xl text-center ${isLightMode ? 'bg-gradient-to-br from-orange-50 to-orange-100/50' : 'bg-gradient-to-br from-orange-500/10 to-orange-600/5'}`}>
            <div className="mb-2">
              <span className="text-6xl font-black bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                🔥 87%
              </span>
            </div>
            <p className={`text-sm font-bold uppercase mb-2 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
              ENGAJAMENTO
            </p>
            <div className="flex items-center justify-center gap-1">
              <i className="fas fa-arrow-up text-green-500 text-xs"></i>
              <span className="text-xs text-green-500 font-semibold">
                +12% vs semana
              </span>
            </div>
          </div>

          {/* Atividade ao vivo */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <i className="fas fa-bullseye text-orange-500 text-sm animate-pulse"></i>
              <h4 className={`text-xs font-bold uppercase ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                AGORA MESMO:
              </h4>
            </div>
            <div className={`p-3 rounded-lg ${isLightMode ? 'bg-orange-50' : 'bg-orange-500/5'}`}>
              <p className={`text-sm mb-1 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                📝 32 alunos fazendo "Quiz de Frações"
              </p>
              <p className={`text-xs ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                Turma 7A • 78% de acerto médio
              </p>
              <button className={`
                mt-2 px-3 py-1.5 rounded-md text-xs font-semibold
                bg-gradient-to-r from-orange-500 to-orange-600
                text-white
                hover:from-orange-600 hover:to-orange-700
                transition-all duration-300
                flex items-center gap-1
              `}>
                <i className="fas fa-eye text-xs"></i>
                Ver Ao Vivo
              </button>
            </div>
          </div>

          {/* Destaque do Dia */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <i className="fas fa-star text-yellow-500 text-sm"></i>
              <h4 className={`text-xs font-bold uppercase ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                DESTAQUE DO DIA:
              </h4>
            </div>
            <div className={`p-3 rounded-lg border-l-4 border-orange-500 ${isLightMode ? 'bg-orange-50' : 'bg-orange-500/10'}`}>
              <p className={`text-sm italic ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                "Maria (7A) completou 1ª trilha e subiu nota em 35%! Ela citou suas aulas 💙"
              </p>
            </div>
          </div>

          {/* CTA Principal */}
          <button className={`
            w-full px-4 py-3 rounded-lg font-semibold text-sm
            bg-gradient-to-r from-orange-500 to-orange-600
            text-white
            hover:from-orange-600 hover:to-orange-700
            transition-all duration-300
            hover:scale-105
            flex items-center justify-center gap-2
          `}>
            <i className="fas fa-chart-line text-sm"></i>
            Ver Relatório Completo
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
