
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
              <i className="fas fa-heartbeat text-white text-lg"></i>
            </div>
            <h3 className={`font-bold text-lg uppercase tracking-wide ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
              Pulso da Turma
            </h3>
          </div>
          <div className={`
            px-2.5 py-1 rounded-md text-xs font-semibold
            bg-gradient-to-r from-orange-500 to-orange-600
            text-white
          `}>
            AO VIVO
          </div>
        </div>

        {/* Conteúdo do Card - SEM SCROLL */}
        <div className="flex-1 p-5 flex flex-col justify-between overflow-hidden">
          {/* Métricas Principais - Grid Compacto */}
          <div className="grid grid-cols-3 gap-2">
            <div className={`p-2.5 rounded-lg text-center ${isLightMode ? 'bg-blue-50' : 'bg-blue-500/10'}`}>
              <div className="text-2xl font-bold text-blue-500">87%</div>
              <div className={`text-[10px] font-medium uppercase mt-0.5 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                Engajamento
              </div>
            </div>
            <div className={`p-2.5 rounded-lg text-center ${isLightMode ? 'bg-green-50' : 'bg-green-500/10'}`}>
              <div className="text-2xl font-bold text-green-500">92%</div>
              <div className={`text-[10px] font-medium uppercase mt-0.5 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                Aprovação
              </div>
            </div>
            <div className={`p-2.5 rounded-lg text-center ${isLightMode ? 'bg-purple-50' : 'bg-purple-500/10'}`}>
              <div className="text-2xl font-bold text-purple-500">28</div>
              <div className={`text-[10px] font-medium uppercase mt-0.5 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                Alunos
              </div>
            </div>
          </div>

          {/* Alerta Importante */}
          <div className={`mt-3 p-3 rounded-xl border-l-4 border-yellow-500 ${isLightMode ? 'bg-yellow-50' : 'bg-yellow-500/10'}`}>
            <div className="flex items-start gap-2">
              <i className="fas fa-exclamation-triangle text-yellow-500 text-sm mt-0.5"></i>
              <div className="flex-1">
                <p className={`text-xs font-bold mb-1 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                  ATENÇÃO NECESSÁRIA
                </p>
                <p className={`text-xs leading-relaxed ${isLightMode ? 'text-yellow-800' : 'text-yellow-200'}`}>
                  5 alunos com dificuldade em Frações
                </p>
              </div>
            </div>
          </div>

          {/* Insights Rápidos */}
          <div className={`mt-3 p-3 rounded-xl ${isLightMode ? 'bg-gradient-to-br from-orange-50 to-orange-100/50' : 'bg-gradient-to-br from-orange-500/10 to-orange-600/5'}`}>
            <p className={`text-xs font-bold uppercase mb-2 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
              Insights IA:
            </p>
            <div className="space-y-1.5">
              <div className="flex items-start gap-1.5">
                <i className="fas fa-check text-green-500 text-xs mt-0.5"></i>
                <span className={`text-xs ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  Turma evolui 15% acima da média
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <i className="fas fa-chart-line text-blue-500 text-xs mt-0.5"></i>
                <span className={`text-xs ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  Melhor horário: 9h-10h
                </span>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button className={`
              px-3 py-2 rounded-lg font-semibold text-xs
              bg-gradient-to-r from-orange-500 to-orange-600
              text-white
              hover:from-orange-600 hover:to-orange-700
              transition-all duration-300
              hover:scale-105
              flex items-center justify-center gap-1.5
            `}>
              <i className="fas fa-chart-bar text-xs"></i>
              Ver Análise
            </button>
            <button className={`
              px-3 py-2 rounded-lg font-semibold text-xs
              ${isLightMode 
                ? 'border-2 border-orange-500 text-orange-600 hover:bg-orange-50' 
                : 'border-2 border-orange-500 text-orange-400 hover:bg-orange-500/10'
              }
              transition-all duration-300
              hover:scale-105
              flex items-center justify-center gap-1.5
            `}>
              <i className="fas fa-users text-xs"></i>
              Detalhes
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
