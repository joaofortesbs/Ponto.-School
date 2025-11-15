import React from "react";
import { motion } from "framer-motion";
import ParticlesBackground from "@/sections/SchoolPower/components/ParticlesBackground";
import { SalesHeader } from "./components/SalesHeader";

// Componente para os cards empilhados
const Card = ({ text, isTop, isBottom }) => (
  <motion.div
    initial={{ y: isTop ? -50 : 50, opacity: 0, rotate: isTop ? -10 : 10 }}
    animate={{ y: 0, opacity: 1, rotate: 0 }}
    transition={{ duration: 0.8, delay: isTop ? 0.7 : 0.9 }}
    className={`absolute w-[200px] h-[250px] md:w-[250px] md:h-[320px]
                rounded-full border-4 border-orange-500
                bg-orange-50 flex items-center justify-center
                shadow-lg`}
    style={{
      top: isTop ? '10%' : 'auto',
      bottom: isBottom ? '10%' : 'auto',
      transform: `rotate(${isTop ? -5 : 5}deg)`,
      zIndex: isTop ? 1 : 0,
    }}
  >
    <p className="text-center font-bold text-orange-600 text-lg md:text-xl px-4">
      {text}
    </p>
  </motion.div>
);

const StackedCards = () => (
  <div className="relative w-[220px] h-[500px] md:w-[280px] md:h-[680px] flex items-center justify-center">
    <Card text="Atividades para ENEM" isTop={true} />
    <Card text="Planos de Aula" isBottom={true} />
  </div>
);


export default function SalesPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#0A1628] via-[#0D1B2A] to-[#1B263B]">
      {/* Fundo de Partículas */}
      <ParticlesBackground isDarkTheme={true} className="z-0" />

      {/* Cabeçalho Flutuante */}
      <SalesHeader />

      {/* Conteúdo Principal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-32"
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-center lg:justify-between gap-8 md:gap-12 flex-wrap lg:flex-nowrap">
            {/* Cards Empilhados - Visível em Desktop */}
            <div className="hidden lg:block">
              <StackedCards />
            </div>

            {/* Título Principal e Descrição */}
            <div className="text-center lg:text-left flex-shrink-0">
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
              >
                Bem-vindo ao
                <br />
                <span className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent">
                  Ponto School
                </span>
              </motion.h1>

              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto lg:mx-0"
              >
                A plataforma educacional mais avançada para transformar o ensino e aprendizado
              </motion.p>
            </div>

             {/* Cards Empilhados - Visível em Mobile */}
            <div className="lg:hidden w-full flex items-center justify-center mt-8">
              <StackedCards />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}