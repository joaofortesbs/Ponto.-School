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
              {/* Círculo Laranja Animado */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex justify-center mb-8"
              >
                <motion.div
                  whileHover={{ scale: 1.3 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-full relative"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B00 0%, #FF8C40 100%)',
                    border: '2px solid transparent',
                    backgroundImage: `
                      linear-gradient(#000822, #000822),
                      linear-gradient(135deg, #FFD05A 0%, #FF6800 50%, #FF5100 100%)
                    `,
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box'
                  }}
                >
                  {/* Efeito de brilho interno */}
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 60%)'
                    }}
                  />
                </motion.div>
              </motion.div>

              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-5xl md:text-7xl font-bold text-white mb-12 mt-16"
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
          className="w-full flex justify-center mt-24 px-4"
        >
          <img 
            src="/titulo1-pv.png" 
            alt="Título PV" 
            className="max-w-full h-auto object-contain"
            style={{ maxWidth: '800px' }}
            loading="eager"
            onError={(e) => {
              console.error('❌ Erro ao carregar imagem titulo1-pv.png');
              console.error('Caminho tentado:', e.currentTarget.src);
              // Tentar fallback para titulo-pv.png
              if (e.currentTarget.src.includes('titulo1-pv.png')) {
                console.log('🔄 Tentando carregar titulo-pv.png como fallback...');
                e.currentTarget.src = '/titulo-pv.png';
              } else {
                // Se o fallback também falhar, ocultar a imagem
                e.currentTarget.style.display = 'none';
                console.error('❌ Fallback também falhou. Imagem ocultada.');
              }
            }}
            onLoad={() => {
              console.log('✅ Imagem carregada com sucesso!');
            }}
          />
        </motion.div>

        {/* Imagem Tópico 1 PV - Canto Esquerdo */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="w-full flex justify-start mt-12 px-4"
        >
          <div className="relative max-w-[600px] w-full">
            <div 
              className="w-full bg-gradient-to-br from-[#FF6B00]/10 to-[#FF8C40]/10 rounded-2xl border-2 border-[#FF6B00]/20 shadow-2xl overflow-hidden"
              style={{ aspectRatio: '3/2' }}
            >
              <div className="w-full h-full flex items-center justify-center p-8">
                <svg 
                  viewBox="0 0 600 400" 
                  className="w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Background gradient */}
                  <defs>
                    <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#FF6B00', stopOpacity: 0.1 }} />
                      <stop offset="100%" style={{ stopColor: '#FF8C40', stopOpacity: 0.2 }} />
                    </linearGradient>
                  </defs>
                  
                  <rect width="600" height="400" fill="url(#cardGradient)" />
                  
                  {/* Icon */}
                  <circle cx="300" cy="150" r="50" fill="#FF6B00" opacity="0.2" />
                  <path 
                    d="M 275 150 L 300 125 L 325 150 L 300 175 Z" 
                    fill="#FF6B00" 
                    opacity="0.8"
                  />
                  
                  {/* Text */}
                  <text 
                    x="300" 
                    y="250" 
                    textAnchor="middle" 
                    fontSize="28" 
                    fontWeight="bold" 
                    fill="#FF6B00"
                  >
                    Tópico 1
                  </text>
                  
                  <text 
                    x="300" 
                    y="285" 
                    textAnchor="middle" 
                    fontSize="18" 
                    fill="#FF6B00" 
                    opacity="0.7"
                  >
                    Adicione sua imagem personalizada
                  </text>
                  
                  <text 
                    x="300" 
                    y="315" 
                    textAnchor="middle" 
                    fontSize="14" 
                    fill="#666"
                  >
                    Faça upload de img-topico1-pv.png na pasta public/
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}