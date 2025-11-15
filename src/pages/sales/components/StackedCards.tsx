
import React from "react";
import { motion } from "framer-motion";

export function StackedCards() {
  return (
    <div className="relative w-[280px] h-[400px] hidden lg:block">
      {/* Card Superior - "Atividades para ENEM" - Rotação -9.188deg conforme Figma */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="absolute top-0 left-0 flex items-center justify-center shadow-2xl"
        style={{
          boxSizing: 'border-box',
          background: '#FFF2E9',
          border: '7px solid #F97316',
          borderRadius: '57px',
          width: '272.383px',
          height: '229.915px',
          transform: 'rotate(-9.188deg)',
          transformOrigin: 'center center',
          zIndex: 2
        }}
      >
        <p className="text-center font-bold text-xl text-[#29335C] px-8">
          Atividades para<br />ENEM
        </p>
      </motion.div>

      {/* Card Inferior - "Planos de Aula" - MANTÉM ROTAÇÃO ORIGINAL */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="absolute bottom-0 right-0 w-[272px] h-[230px] bg-[#FFF2E9] border-[7px] border-[#F97316] rounded-[57px] flex items-center justify-center shadow-2xl"
        style={{
          transform: 'rotate(6.978deg)',
          transformOrigin: 'center center',
          zIndex: 1
        }}
      >
        <p className="text-center font-bold text-xl text-[#29335C] px-8">
          Planos de<br />Aula
        </p>
      </motion.div>
    </div>
  );
}
