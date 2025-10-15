import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/components/ThemeProvider";
import { Activity, TrendingUp } from "lucide-react";

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
          h-[72px] px-4 py-4
          flex items-center justify-between
          border-b-2
          ${isLightMode 
            ? 'bg-gradient-to-r from-orange-50 to-orange-100/50 border-orange-200/50' 
            : 'bg-gradient-to-r from-orange-500/10 to-orange-600/5 border-orange-500/20'
          }
        `}>
          <div className="flex items-center gap-3">
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center
              border-2 border-orange-500
              ${isLightMode ? 'bg-white' : 'bg-transparent'}
              shadow-sm
            `}>
              <Activity className="text-orange-500" size={20} />
            </div>
            <h3 className={`font-bold text-lg uppercase tracking-wide ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
              Pulso da Turma
            </h3>
          </div>
        </div>

        {/* Conteúdo de Introdução */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
          {/* Ícone Central */}
          <div className={`
            w-16 h-16 rounded-2xl flex items-center justify-center mb-6
            ${isLightMode ? 'bg-blue-50' : 'bg-blue-500/10'}
            border-2 border-dashed border-blue-500/40
          `}>
            <TrendingUp className="text-blue-500" size={32} />
          </div>

          {/* Mensagem de Boas-vindas */}
          <h4 className={`text-xl font-bold mb-3 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
            Monitore em Tempo Real
          </h4>

          <p className={`text-sm mb-8 max-w-xs leading-relaxed ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
            Acompanhe o desempenho e engajamento da sua turma com análises inteligentes
          </p>

          {/* Preview de Métricas */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
            <div className={`p-3 rounded-lg ${isLightMode ? 'bg-blue-50' : 'bg-blue-500/10'} border border-blue-500/30`}>
              <div className="text-2xl font-bold text-blue-500">--</div>
              <div className={`text-xs mt-1 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>Engajamento</div>
            </div>
            <div className={`p-3 rounded-lg ${isLightMode ? 'bg-green-50' : 'bg-green-500/10'} border border-green-500/30`}>
              <div className="text-2xl font-bold text-green-500">--</div>
              <div className={`text-xs mt-1 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>Aprovação</div>
            </div>
            <div className={`p-3 rounded-lg ${isLightMode ? 'bg-purple-50' : 'bg-purple-500/10'} border border-purple-500/30`}>
              <div className="text-2xl font-bold text-purple-500">--</div>
              <div className={`text-xs mt-1 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>Alunos</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}