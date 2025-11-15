import React, { useState } from "react";
import { motion } from "framer-motion";
import ParticlesBackground from "@/sections/SchoolPower/components/ParticlesBackground";
import { SalesHeader } from "./components/SalesHeader";
import StackedCardsLeft from './components/StackedCardsLeft';
import StackedCardsRight from './components/StackedCardsRight';
import ChatInput from '@/sections/SchoolPower/components/ChatInput';
import { QuickAccessCards } from '@/sections/SchoolPower/components/4-cards-pré-prompts';

export default function SalesPage() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleSendMessage = (message: string, files?: any[]) => {
    console.log('📨 Mensagem enviada na página de vendas:', message);
    console.log('📎 Arquivos:', files?.length || 0);
  };

  const handleCardClick = (cardName: string) => {
    setSelectedCard(cardName);
  };

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
        className="relative z-10 flex min-h-screen items-end justify-center px-4 pt-24 pb-32"
      >
        <div className="relative w-full max-w-[1800px] mx-auto">
          <div className="flex items-start justify-between w-full">
            {/* Cards Sobrepostos - Canto Esquerdo Extremo */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hidden lg:block flex-shrink-0"
            >
              <StackedCardsLeft />
            </motion.div>

            {/* Conteúdo de Texto - Centro */}
            <div className="text-center flex-1 px-8">
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
                className="text-xl md:text-2xl text-gray-300 mb-20 max-w-3xl mx-auto"
              >
                A plataforma educacional mais avançada para transformar o ensino e aprendizado
              </motion.p>

              {/* Container Unificado: Caixa de Mensagens + Cards Retangulares */}
              <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 items-center justify-center mt-8">
                {/* Caixa de Enviar Mensagens */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="w-full"
                >
                  <ChatInput
                    isDarkTheme={true}
                    onSend={handleSendMessage}
                    externalSelectedCard={selectedCard}
                    onCardClick={handleCardClick}
                  />
                </motion.div>

                {/* Cards Retangulares de Prompts Rápidos - Logo Abaixo */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  className="w-full"
                >
                  <QuickAccessCards
                    selectedCard={selectedCard}
                    onCardClick={handleCardClick}
                  />
                </motion.div>
              </div>
            </div>

            {/* Cards Sobrepostos Duplicados - Canto Direito Extremo */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="hidden lg:block flex-shrink-0"
            >
              <StackedCardsRight />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}