
import React from "react";
import { motion } from "framer-motion";

export function StackedCards() {
  return (
    <div className="relative w-[272px] h-[460px] flex items-center justify-center">
      {/* Fundo com degradê laranja */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 opacity-20 rounded-3xl blur-2xl"></div>

      {/* Container dos cards */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Card Central - Design Figma */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-[272px] h-[230px]
            bg-[#fff2e9]
            rounded-[57px]
            border-[7px] border-[#f97316]
            shadow-2xl shadow-orange-500/30
            flex items-center justify-center
            z-30
            hover:scale-105
            transition-all duration-300
          "
          style={{
            transform: 'translate(-50%, -50%) rotate(6.978deg)',
          }}
        >
          <div className="text-center px-4">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              Novo Card<br />Figma
            </h3>
          </div>
        </motion.div>

        {/* Card Superior - "Atividades para ENEM" */}
        <motion.div
          initial={{ opacity: 0, y: -20, rotate: -8 }}
          animate={{ opacity: 1, y: 0, rotate: -8 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="
            absolute top-8 left-1/2 -translate-x-1/2
            w-[272px] h-[230px]
            bg-gradient-to-br from-orange-50 to-amber-50
            rounded-[57px]
            border-4 border-[#FF6B00]
            shadow-2xl shadow-orange-500/30
            flex items-center justify-center
            z-20
            hover:scale-105 hover:rotate-[-6deg]
            transition-all duration-300
          "
          style={{
            transform: 'translateX(-50%) rotate(-8deg)',
          }}
        >
          <div className="text-center px-4">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              Atividades para<br />ENEM
            </h3>
          </div>
        </motion.div>

        {/* Card Inferior - "Planos de Aula" */}
        <motion.div
          initial={{ opacity: 0, y: 20, rotate: 12 }}
          animate={{ opacity: 1, y: 0, rotate: 12 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="
            absolute bottom-8 left-1/2 -translate-x-1/2
            w-[272px] h-[230px]
            bg-gradient-to-br from-orange-50 to-amber-50
            rounded-[57px]
            border-4 border-[#FF6B00]
            shadow-2xl shadow-orange-500/30
            flex items-center justify-center
            z-10
            hover:scale-105 hover:rotate-[10deg]
            transition-all duration-300
          "
          style={{
            transform: 'translateX(-50%) rotate(12deg)',
          }}
        >
          <div className="text-center px-4">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              Planos de<br />Aula
            </h3>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
