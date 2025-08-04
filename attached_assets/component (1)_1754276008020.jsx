
import React, { useState } from 'react';
import { Clock, Star, Zap, ArrowRight } from 'lucide-react';

const TransformationInterface = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Barra de progresso no topo */}
        <div className="mb-8">
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        {/* Card principal retangular vertical largo */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border-2 border-orange-400 shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="text-center py-8 px-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              Seu futuro com a IA pedagógica
            </h1>
          </div>

          {/* Linha divisória central */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent"></div>

          {/* Seção superior - Cards de benefícios */}
          <div className="p-8 space-y-6">
            
            {/* Card 1 - Economia de tempo */}
            <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-2xl hover:scale-[1.02] transition-all duration-300 shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-white mb-1">
                  Você economizou 15h por semana
                </h3>
                <p className="text-slate-300 text-sm">
                  com seu novo assistente pedagógico
                </p>
              </div>
            </div>

            {/* Card 2 - Aulas engajadoras */}
            <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-2xl hover:scale-[1.02] transition-all duration-300 shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-white mb-1">
                  Aulas mais engajadoras
                </h3>
                <p className="text-slate-300 text-sm">
                  e sob medida para sua turma
                </p>
              </div>
            </div>

            {/* Card 3 - Menos estresse */}
            <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-2xl hover:scale-[1.02] transition-all duration-300 shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-white mb-1">
                  Menos estresse, mais ensino
                </h3>
                <p className="text-slate-300 text-sm">
                  foque no que realmente importa
                </p>
              </div>
            </div>
          </div>

          {/* Linha divisória central */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent"></div>

          {/* Seção inferior - Botão de ação */}
          <div className="p-8 text-center">
            <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center gap-3 mx-auto group">
              CONTINUAR
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransformationInterface;
