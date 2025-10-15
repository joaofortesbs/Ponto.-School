
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/components/ThemeProvider";
import { Zap, Sparkles } from "lucide-react";

export default function JogadaDoDiaCard() {
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
              <Zap className="text-orange-500" size={20} strokeWidth={2} />
            </div>
            <h3 className={`font-bold text-lg uppercase tracking-wide ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
              Jogada do Dia
            </h3>
          </div>
        </div>

        {/* Conteúdo de Introdução */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
          {/* Ícone Central */}
          <div className={`
            w-20 h-20 rounded-2xl flex items-center justify-center mb-6
            bg-gradient-to-br from-orange-500 to-orange-600
            shadow-lg shadow-orange-500/30
          `}>
            <Sparkles className="text-white" size={36} strokeWidth={2} />
          </div>

          {/* Mensagem de Boas-vindas */}
          <h4 className={`text-xl font-bold mb-3 bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent`}>
            Sua Jogada Inteligente
          </h4>

          <p className={`text-sm mb-8 max-w-xs leading-relaxed ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
            Receba sugestões personalizadas e estratégias para potencializar seu ensino
          </p>

          {/* CTA de Introdução */}
          <button className={`
            px-6 py-3 rounded-xl font-semibold text-sm
            bg-gradient-to-r from-orange-500 to-orange-600
            text-white
            hover:from-orange-600 hover:to-orange-700
            transition-all duration-300
            hover:scale-105
            flex items-center gap-2
            shadow-lg shadow-orange-500/30
          `}>
            <Sparkles size={18} strokeWidth={2} />
            Descobrir Jogada
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
