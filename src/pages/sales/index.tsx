import React from "react";
import { motion } from "framer-motion";
import ParticlesBackground from "@/sections/SchoolPower/components/ParticlesBackground";
import { SalesHeader } from "./components/SalesHeader";

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
        <div className="text-center">
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6"
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
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
          >
            A plataforma educacional mais avançada para transformar o ensino e aprendizado
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
