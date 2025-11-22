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

        {/* Container com as duas imagens lado a lado */}
        <div className="w-full mt-12 flex items-start gap-8">
          {/* Imagem img-topico1-pv.png à esquerda */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="-ml-72 flex-shrink-0"
          >
            <img 
              src="/img-topico1-pv.png" 
              alt="Tópico 1 PV" 
              className="h-auto object-contain"
              style={{ maxWidth: '700px' }}
              loading="eager"
              onError={(e) => {
                console.error('❌ Erro ao carregar imagem img-topico1-pv.png');
              }}
              onLoad={() => {
                console.log('✅ Imagem img-topico1-pv.png carregada com sucesso!');
              }}
            />
          </motion.div>

          {/* Imagem oficial-titulo-1topico.png à direita e mais abaixo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex-shrink-0 mt-24 ml-12"
          >
            <img 
              src="/images/ofc-titulo-1topico.png" 
              alt="Título Tópico 1 PV" 
              className="h-auto object-contain mb-6"
              style={{ maxWidth: '650px' }}
              loading="eager"
              onError={(e) => {
                console.error('❌ Erro ao carregar imagem oficial-titulo-1topico.png');
                console.error('Caminho tentado:', e.currentTarget.src);
                console.error('Verifique se o arquivo existe em: public/images/oficial-titulo-1topico.png');
              }}
              onLoad={() => {
                console.log('✅ Imagem oficial-titulo-1topico.png carregada com sucesso!');
                console.log('Caminho usado:', '/images/oficial-titulo-1topico.png');
              }}
            />

            {/* Texto explicativo */}
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
              Aqui, tudo o que você cria <strong className="text-white font-semibold">ganha vida de um jeito diferente</strong>. Suas atividades se transformam em <strong className="text-white font-semibold">experiências gamificadas</strong> que seus alunos realmente querem completar, com <strong className="text-orange-400 font-semibold">rankings, moedas virtuais e desafios</strong> que conectam turmas inteiras. E o melhor: quanto mais você compartilha e quanto mais impacto você gera, <strong className="text-white font-semibold">mais você cresce como referência</strong>! Abrindo portas para que seu conhecimento alcance alunos e professores e até <strong className="text-orange-400 font-semibold">gere retornos para você</strong>. É simples, natural e feito para <strong className="text-white font-semibold">valorizar quem ensina de verdade</strong>.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}