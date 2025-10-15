
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/components/ThemeProvider";

export default function ProximaAulaCard() {
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
              w-12 h-12 rounded-xl flex items-center justify-center
              border-2 border-orange-500
              ${isLightMode ? 'bg-white' : 'bg-transparent'}
              shadow-sm
            `}>
              <i className="fas fa-calendar text-orange-500 text-xl"></i>
            </div>
            <h3 className={`font-bold text-lg uppercase tracking-wide ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
              Próxima Aula
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

        {/* Conteúdo do Card - SEM SCROLL - Layout Compacto */}
        <div className="flex-1 p-5 flex flex-col justify-between overflow-hidden">
          {/* Timestamp - Compacto */}
          <div className={`flex items-center gap-2 pb-2.5 border-b ${isLightMode ? 'border-gray-200' : 'border-gray-700'}`}>
            <i className="fas fa-clock text-xs text-orange-500"></i>
            <span className={`text-xs font-medium ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
              Segunda, 15 Out • 08:00-08:45
            </span>
          </div>

          {/* Info Principal - Compacto */}
          <div className={`mt-3 p-3 rounded-xl ${isLightMode ? 'bg-orange-50' : 'bg-orange-500/10'}`}>
            <div className="flex items-start gap-2.5">
              <i className="fas fa-book text-orange-500 text-lg mt-0.5"></i>
              <div className="flex-1">
                <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                  MATEMÁTICA • TURMA 7A
                </p>
                <p className={`text-sm font-medium leading-tight ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  Frações - Soma com Denominadores Diferentes
                </p>
              </div>
            </div>
          </div>

          {/* Status Checklist - Ultra Compacto */}
          <div className={`mt-3 p-2.5 rounded-xl border-2 border-dashed ${isLightMode ? 'border-green-300 bg-green-50/50' : 'border-green-500/30 bg-green-500/5'}`}>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <i className="fas fa-check-circle text-green-500 text-xs"></i>
                <span className={`text-xs ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  Plano de Aula Completo
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <i className="fas fa-check-circle text-green-500 text-xs"></i>
                <span className={`text-xs ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  12 Slides Gamificados
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <i className="fas fa-check-circle text-green-500 text-xs"></i>
                <span className={`text-xs ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  Atividade Interativa
                </span>
              </div>
            </div>
          </div>

          {/* CTAs - Compacto */}
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
              <i className="fas fa-book-open text-xs"></i>
              Ver Plano
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
              <i className="fas fa-bolt text-xs"></i>
              Ajustar
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
