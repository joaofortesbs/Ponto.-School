
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/components/ThemeProvider";

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
              <i className="fas fa-bolt text-orange-500 text-xl"></i>
            </div>
            <h3 className={`font-bold text-lg uppercase tracking-wide ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
              Jogada do Dia
            </h3>
          </div>
          <div className={`
            px-2 py-1 rounded-md text-xs font-semibold
            bg-gradient-to-r from-orange-500 to-orange-600
            text-white
            flex items-center gap-1
          `}>
            <i className="fas fa-robot text-xs"></i>
            IA
          </div>
        </div>

        {/* Conteúdo do Card - SEM SCROLL */}
        <div className="flex-1 p-5 flex flex-col justify-between overflow-hidden">
          {/* Card de Recomendação - Compacto */}
          <div className={`
            p-3.5 rounded-xl border-2 border-orange-500
            ${isLightMode ? 'bg-gradient-to-br from-orange-50 to-orange-100/50' : 'bg-gradient-to-br from-orange-500/10 to-orange-600/5'}
          `}>
            {/* Título da Ação - Compacto */}
            <div className="mb-2.5 flex items-start gap-2">
              <i className="fas fa-bullseye text-orange-500 text-lg mt-0.5"></i>
              <h4 className={`text-sm font-bold leading-tight ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                CRIAR RECUPERAÇÃO PARA 7A
              </h4>
            </div>

            {/* Por quê? - Compacto */}
            <div className="mb-2.5">
              <p className={`text-[10px] font-bold uppercase mb-1 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                Por quê?
              </p>
              <ul className="space-y-0.5">
                <li className={`text-xs flex items-start gap-1.5 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  <span>•</span>
                  <span>15 alunos (65%) erraram Frações</span>
                </li>
                <li className={`text-xs flex items-start gap-1.5 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  <span>•</span>
                  <span>Próxima aula em 2 dias</span>
                </li>
              </ul>
            </div>

            {/* O que terá - Compacto */}
            <div className="space-y-0.5">
              <div className={`text-xs flex items-center gap-1.5 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                <i className="fas fa-check text-green-500 text-[10px]"></i>
                <span>5 atividades gamificadas</span>
              </div>
              <div className={`text-xs flex items-center gap-1.5 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                <i className="fas fa-check text-green-500 text-[10px]"></i>
                <span>Vídeos explicativos curtos</span>
              </div>
            </div>
          </div>

          {/* Footer com tempo e impacto - Compacto */}
          <div className={`mt-3 p-2.5 rounded-lg ${isLightMode ? 'bg-gray-50' : 'bg-gray-800/30'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <i className="fas fa-clock text-orange-500 text-xs"></i>
                <span className={`text-xs ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                  3 min
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <i className="fas fa-chart-line text-green-500 text-xs"></i>
                <span className={`text-xs font-semibold ${isLightMode ? 'text-green-600' : 'text-green-400'}`}>
                  +40% Impacto
                </span>
              </div>
            </div>
          </div>

          {/* CTA Principal - Compacto */}
          <button className={`
            mt-3 w-full px-3 py-2.5 rounded-lg font-bold text-xs
            bg-gradient-to-r from-orange-500 via-orange-600 to-yellow-500
            text-white
            hover:from-orange-600 hover:via-orange-700 hover:to-yellow-600
            transition-all duration-300
            hover:scale-105
            shadow-lg shadow-orange-500/30
            flex items-center justify-center gap-2
            uppercase
          `}>
            <i className="fas fa-bolt text-sm animate-pulse"></i>
            CRIAR AGORA (3 MIN)
          </button>

          {/* CTAs Secundários - Compacto */}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button className={`
              px-2 py-1.5 rounded-lg font-semibold text-xs
              ${isLightMode 
                ? 'border-2 border-orange-500 text-orange-600 hover:bg-orange-50' 
                : 'border-2 border-orange-500 text-orange-400 hover:bg-orange-500/10'
              }
              transition-all duration-300
              flex items-center justify-center gap-1
            `}>
              <i className="fas fa-calendar text-xs"></i>
              Agendar
            </button>
            <button className={`
              px-2 py-1.5 rounded-lg font-semibold text-xs
              ${isLightMode 
                ? 'text-gray-600 hover:bg-gray-100' 
                : 'text-gray-400 hover:bg-gray-700/30'
              }
              transition-all duration-300
              flex items-center justify-center gap-1
            `}>
              <i className="fas fa-sync text-xs"></i>
              Outra
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
