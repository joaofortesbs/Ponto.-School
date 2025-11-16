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
    <div className="relative min-h-screen w-full overflow-hidden" style={{ backgroundColor: '#000822' }}>
      <style>{`
        .sales-page-cards .quick-access-cards {
          max-width: 600px;
          margin: 0 auto;
        }
        .sales-page-cards .quick-access-card {
          max-width: 140px;
        }
      `}</style>
      
      {/* Fundo de Partículas */}
      <ParticlesBackground isDarkTheme={true} className="z-0" />

      {/* Cabeçalho Flutuante */}
      <SalesHeader />

      {/* Conteúdo Principal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-24 pb-12"
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
              {/* Componente de Professores Transformados */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="w-full mb-4 flex items-center justify-center"
              >
                <div className="flex items-center gap-3">
                  {/* Círculos Sobrepostos com Imagens */}
                  <div className="flex items-center -space-x-2">
                    <div className="w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] shadow-md">
                      <div className="w-full h-full rounded-full bg-[#FFF5E6] overflow-hidden flex items-center justify-center">
                        <img 
                          src="/depoimento-circulo-pv1.webp" 
                          alt="Depoimento 1"
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] shadow-md">
                      <div className="w-full h-full rounded-full bg-[#FFF5E6] overflow-hidden flex items-center justify-center">
                        <img 
                          src="/depoimento-circulo-pv2.webp" 
                          alt="Depoimento 2"
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] shadow-md">
                      <div className="w-full h-full rounded-full bg-[#FFF5E6] overflow-hidden flex items-center justify-center">
                        <img 
                          src="/depoimento-circulo-pv3.webp" 
                          alt="Depoimento 3"
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] shadow-md">
                      <div className="w-full h-full rounded-full bg-[#FFF5E6] overflow-hidden flex items-center justify-center">
                        <img 
                          src="/depoimento-circulo-pv4.webp" 
                          alt="Depoimento 4"
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Texto */}
                  <div className="flex items-center">
                    <p className="text-gray-300 font-normal text-sm md:text-base whitespace-nowrap">
                      Mais de 5 mil professores transformados
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-5xl md:text-7xl font-bold text-white mb-12 mt-24"
              >
                Bem-vindo ao
                <br />
                <span className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent">
                  Ponto School
                </span>
              </motion.h1>
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

      {/* Container Separado: Caixa de Mensagens + Cards Retangulares - ABAIXO DE TODO O CONTEÚDO */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 pb-20 -mt-32">
        {/* Caixa de Enviar Mensagens */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="w-full mb-6"
        >
          <ChatInput
            isDarkTheme={true}
            onSend={handleSendMessage}
            externalSelectedCard={selectedCard}
            onCardClick={handleCardClick}
          />
        </motion.div>

        {/* Cards Retangulares de Prompts Rápidos */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="w-full sales-page-cards"
        >
          <QuickAccessCards
            selectedCard={selectedCard}
            onCardClick={handleCardClick}
          />
        </motion.div>

        {/* Imagem Titulo PV */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="w-full flex justify-center mt-12 px-4"
        >
          <div className="relative max-w-[800px] w-full">
            <img 
              src="/titulo-pv.png" 
              alt="Título PV" 
              className="max-w-full h-auto object-contain w-full"
              onError={(e) => {
                console.error('❌ Erro ao carregar imagem titulo-pv.png - Arquivo não encontrado em /public/');
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-2 border-dashed border-orange-500/30 rounded-xl p-8 text-center">
                      <p class="text-orange-400 font-semibold text-lg mb-2">📸 Imagem Não Encontrada</p>
                      <p class="text-gray-400 text-sm">Por favor, adicione o arquivo <code class="bg-gray-800 px-2 py-1 rounded">titulo-pv.png</code> na pasta <code class="bg-gray-800 px-2 py-1 rounded">public/</code></p>
                    </div>
                  `;
                }
              }}
              onLoad={() => {
                console.log('✅ Imagem titulo-pv.png carregada com sucesso!');
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}