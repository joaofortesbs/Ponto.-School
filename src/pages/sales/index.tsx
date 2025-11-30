import React, { useState } from "react";
import { motion } from "framer-motion";
import ParticlesBackground from "@/sections/SchoolPower/components/ParticlesBackground";
import { SalesHeader } from "./components/SalesHeader";
import StackedCardsLeft from './components/StackedCardsLeft';
import StackedCardsRight from './components/StackedCardsRight';
import ChatInput from '@/sections/SchoolPower/components/ChatInput';
import { QuickAccessCards } from '@/sections/SchoolPower/components/4-cards-pré-prompts';
import { Button } from "@/components/ui/button";

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
              {/* Avatares Circulares Sobrepostos */}
              <style>{`
                .dollItem {
                  width: 60px;
                  height: 60px;
                  border-radius: 50%;
                  overflow: visible;
                  margin-left: -15px;
                  border: 4px solid #000822;
                  transition: transform 0.2s, z-index 0.2s, opacity 0.2s, border 0.2s;
                  cursor: pointer;
                  position: relative;
                }
                
                .dollItem:first-child {
                  margin-left: 0;
                }
                
                .dollItem:hover {
                  transform: translateY(-4px) scale(1.1);
                  z-index: 10 !important;
                  border: 3px solid transparent;
                  background-image: linear-gradient(#000822, #000822), linear-gradient(135deg, #FF4800, #F97316, #FFD05A);
                  background-origin: border-box;
                  background-clip: padding-box, border-box;
                }
                
                .dollName {
                  position: absolute;
                  bottom: 100%;
                  left: 50%;
                  transform: translateX(-50%);
                  background: white;
                  color: #103a4a;
                  padding: 8px 14px;
                  border-radius: 12px;
                  font-size: 13px;
                  font-weight: 400;
                  white-space: nowrap;
                  opacity: 0;
                  pointer-events: none;
                  transition: opacity 0.2s ease, transform 0.2s ease;
                  transform: translateX(-50%) translateY(4px);
                  margin-bottom: 8px;
                  z-index: 20;
                  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                }
                
                .dollName::after {
                  content: '';
                  position: absolute;
                  bottom: -6px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 0;
                  height: 0;
                  border-left: 6px solid transparent;
                  border-right: 6px solid transparent;
                  border-top: 6px solid white;
                }
                
                .dollItem:hover .dollName {
                  opacity: 1;
                  transform: translateX(-50%) translateY(0);
                }
                
                .dollItem img {
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                  border-radius: 50%;
                }
                
                .bg-mike { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
                .bg-alex { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
                .bg-emma { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
                .bg-david { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
                .bg-bob { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
                
                .plus-button {
                  width: 60px;
                  height: 60px;
                  border-radius: 50%;
                  background: rgba(255, 255, 255, 0.04);
                  border: 2px dashed rgba(255, 255, 255, 0.12);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin-left: -15px;
                  cursor: pointer;
                  transition: all 0.2s;
                  position: relative;
                }
                
                .plus-button:hover {
                  background: rgba(255, 255, 255, 0.08);
                  border-color: rgba(255, 255, 255, 0.2);
                  transform: translateY(-4px) scale(1.05);
                  z-index: 10 !important;
                }
                
                .plus-button .dollName {
                  position: absolute;
                  bottom: 100%;
                  left: 50%;
                  transform: translateX(-50%);
                  background: white;
                  color: #103a4a;
                  padding: 8px 14px;
                  border-radius: 12px;
                  font-size: 13px;
                  font-weight: 400;
                  white-space: nowrap;
                  opacity: 0;
                  pointer-events: none;
                  transition: opacity 0.2s ease, transform 0.2s ease;
                  transform: translateX(-50%) translateY(4px);
                  margin-bottom: 8px;
                  z-index: 20;
                  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                }
                
                .plus-button .dollName::after {
                  content: '';
                  position: absolute;
                  bottom: -6px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 0;
                  height: 0;
                  border-left: 6px solid transparent;
                  border-right: 6px solid transparent;
                  border-top: 6px solid white;
                }
                
                .plus-button:hover .dollName {
                  opacity: 1;
                  transform: translateX(-50%) translateY(0);
                }
              `}</style>
              
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex justify-center items-center mb-8"
              >
                <div className="flex items-center justify-center gap-0">
                  <div className="dollItem bg-mike" style={{ zIndex: 4 }}>
                    <span className="dollName">Jota é o <span style={{ color: '#FF6B00' }}>líder de equipe</span></span>
                    <img src="https://public-frontend-cos.metadl.com/nuxt-mgx/prod/assets/Mike-TeamLeader-Avatar.BVQZLCeX.png" alt="Jota" />
                  </div>
                  <div className="dollItem bg-alex" style={{ zIndex: 3 }}>
                    <span className="dollName">Felix é o <span style={{ color: '#FF6B00' }}>gerador de atividades</span></span>
                    <img src="https://public-frontend-cos.metadl.com/nuxt-mgx/prod/assets/Alex-Engineer-Avatar.DMF78Ta0.png" alt="Felix" />
                  </div>
                  <div className="dollItem bg-emma" style={{ zIndex: 2 }}>
                    <span className="dollName">Adrian é o <span style={{ color: '#FF6B00' }}>gerente pedagógico</span></span>
                    <img src="https://public-frontend-cos.metadl.com/nuxt-mgx/prod/assets/Emma-ProductManager-Avatar.DAgh_sAa.png" alt="Adrian" />
                  </div>
                  <div className="dollItem bg-david" style={{ zIndex: 1 }}>
                    <span className="dollName">Sam é o <span style={{ color: '#FF6B00' }}>analista de dados</span></span>
                    <img src="https://public-frontend-cos.metadl.com/nuxt-mgx/prod/assets/David-DataAnalyst-Avatar.JI1m4RZ8.png" alt="Sam" />
                  </div>
                  <div className="plus-button">
                    <span className="dollName">Mais agentes em breve</span>
                    <svg viewBox="0 0 16 16" style={{ width: '22px', height: '22px', fill: 'currentColor' }}>
                      <path d="M8 3a.5.5 0 0 1 .5.5v4h4a.5.5 0 0 1 0 1h-4v4a.5.5 0 0 1-1 0v-4h-4a.5.5 0 0 1 0-1h4v-4A.5.5 0 0 1 8 3z"/>
                    </svg>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex justify-center mb-12 mt-16 px-4"
              >
                <img 
                  src="/images/titulo-principal-pv.png" 
                  alt="Bem-vindo ao Ponto School" 
                  className="max-w-full h-auto object-contain drop-shadow-2xl"
                  style={{ maxWidth: '900px', width: '100%' }}
                  loading="eager"
                  onError={(e) => {
                    console.error('❌ Erro ao carregar imagem titulo-principal-pv.png');
                    console.error('Caminho tentado:', e.currentTarget.src);

                    // Sistema de fallback em cascata
                    if (e.currentTarget.src.includes('/images/titulo-principal-pv.png')) {
                      console.log('🔄 Tentando /titulo-principal-pv.png...');
                      e.currentTarget.src = '/titulo-principal-pv.png';
                    } else if (e.currentTarget.src.includes('/titulo-principal-pv.png')) {
                      console.log('🔄 Tentando /titulo1-pv.png como fallback...');
                      e.currentTarget.src = '/titulo1-pv.png';
                    } else if (e.currentTarget.src.includes('/titulo1-pv.png')) {
                      console.log('🔄 Tentando /titulo-pv.png como último fallback...');
                      e.currentTarget.src = '/titulo-pv.png';
                    } else {
                      console.error('❌ Todos os fallbacks falharam. Imagem ocultada.');
                      e.currentTarget.style.display = 'none';
                    }
                  }}
                  onLoad={() => {
                    console.log('✅ Imagem de título carregada com sucesso!');
                    console.log('📍 Caminho usado:', document.querySelector('img[alt="Bem-vindo ao Ponto School"]')?.getAttribute('src'));
                  }}
                />
              </motion.div>
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
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 pb-96 -mt-32">
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
        <div className="w-full mt-12 mb-32 flex items-start gap-8">
          {/* Imagem img-topico1-pv.png à esquerda */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex-shrink-0 mt-[37px] ml-[-300px]"
          >
            <img 
              src="/images/img-topico1-pv.png" 
              alt="Tópico 1 PV" 
              className="h-auto object-contain"
              style={{ maxWidth: '700px' }}
              loading="eager"
              onError={(e) => {
                console.error('❌ Erro ao carregar imagem img-topico1-pv.png');
                console.error('📍 Caminho tentado:', e.currentTarget.src);
              }}
              onLoad={() => {
                console.log('✅ Imagem img-topico1-pv.png carregada com sucesso!');
                console.log('📍 Caminho usado:', '/images/img-topico1-pv.png');
              }}
            />
          </motion.div>

          {/* Imagem oficial-titulo-1topico.png à direita e mais abaixo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex-shrink-0 mt-[83px] ml-7"
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
            <p 
              className="text-gray-300 text-lg leading-relaxed ml-4" 
              style={{ 
                fontFamily: "'Poppins', 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontWeight: 500,
                letterSpacing: '0.01em',
                lineHeight: '1.7',
                maxWidth: '650px',
                width: '100%',
                marginLeft: '15px'
              }}
            >
              Aqui, tudo o que você cria ganha vida de um jeito diferente. Suas atividades se transformam em <strong className="text-orange-400 font-semibold"> experiências gamificadas com rankings, moedas virtuais e desafios</strong> que seus alunos realmente querem completar. Quanto mais você compartilha e gera impacto, mais você cresce como referência abrindo portas para novos retornos e valorizando quem ensina de verdade.
            </p>

            {/* Botão Experimentar grátis */}
            <motion.div
              style={{
                marginLeft: '17px',
                marginTop: '34px'
              }}
            >
              <Button
                className="
                  relative overflow-hidden
                  px-4 md:px-5 py-2 md:py-3
                  text-white font-bold text-base md:text-lg
                  rounded-3xl
                  shadow-lg shadow-[#FF6B00]/20
                  hover:shadow-xl hover:shadow-[#FF6B00]/30
                  transition-all duration-300
                  group
                "
                style={{
                  border: '1.5px solid transparent',
                  backgroundImage: 'linear-gradient(135deg, #FFD05A, #FF6800, #FF5100)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'border-box'
                }}
                onClick={() => {
                  console.log('Botão Experimentar grátis clicado');
                  // Aqui você pode adicionar a navegação ou ação desejada
                }}
              >
                {/* Camada de fundo interno com opacidade de 30% */}
                <span 
                  className="absolute inset-[1.5px] rounded-[calc(1.5rem-1.5px)] z-0"
                  style={{
                    background: 'rgba(255, 107, 0, 0.3)'
                  }}
                ></span>

                {/* Efeito de brilho no hover */}
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-3xl z-[1]"></span>

                {/* Texto */}
                <span className="relative z-10 flex items-center justify-center">
                  Experimentar grátis
                </span>
              </Button>
            </motion.div>

            {/* Imagem img-topico2-pv.png */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="mt-[127px] -ml-[-17px]"
            >
              <img 
                src="/images/img-topico2-pv.png" 
                alt="Tópico 2 - Ponto School" 
                className="h-auto object-contain drop-shadow-lg"
                style={{ maxWidth: '650px', width: '100%' }}
                loading="eager"
                onError={(e) => {
                  console.error('❌ Erro ao carregar imagem img-topico2-pv.png');
                  console.error('Caminho completo tentado:', e.currentTarget.src);
                  console.error('Verifique se o arquivo existe em: public/images/img-topico2-pv.png');
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={() => {
                  console.log('✅ Imagem img-topico2-pv.png carregada com sucesso!');
                  console.log('📍 Caminho usado:', '/images/img-topico2-pv.png');
                }}
              />
            </motion.div>

            {/* Imagem ofc-titulo-2topico.png mais abaixo e à esquerda */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="-mt-[437px] -ml-[687px]"
            >
              <img 
                src="/images/ofc-titulo-2topico.png" 
                alt="Título Tópico 2 - Ponto School" 
                className="h-auto object-contain drop-shadow-lg"
                style={{ maxWidth: '650px', width: '100%' }}
                loading="eager"
                onError={(e) => {
                  console.error('❌ Erro ao carregar imagem ofc-titulo-2topico.png');
                  console.error('Caminho completo tentado:', e.currentTarget.src);
                  console.error('Verifique se o arquivo existe em: public/images/ofc-titulo-2topico.png');
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={() => {
                  console.log('✅ Imagem ofc-titulo-2topico.png carregada com sucesso!');
                  console.log('📍 Caminho usado:', '/images/ofc-titulo-2topico.png');
                }}
              />

              {/* Texto explicativo abaixo da imagem ofc-titulo-2topico.png */}
              <p 
                className="text-gray-300 text-lg leading-relaxed text-left" 
                style={{ 
                  fontFamily: "'Poppins', 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontWeight: 500,
                  letterSpacing: '0.01em',
                  lineHeight: '1.7',
                  maxWidth: '650px',
                  width: '100%',
                  marginLeft: '8px',
                  marginTop: '30px'
                }}
              >
                Esqueça modelos prontos que limitam sua criatividade. Aqui, você descreve qualquer tipo de atividade que imaginou, do seu jeito, e nossa IA <strong className="text-orange-400 font-semibold"> programa, ajusta e publica tudo automaticamente</strong>. E o melhor, salva como template reutilizável para usar com outros temas sempre que quiser. Cada atividade que você cria vira parte da sua identidade como professor, escalável para qualquer conteúdo.
              </p>
              {/* Botão Criar atividades */}
              <motion.div
                style={{
                  marginLeft: '9px',
                  marginTop: '34px'
                }}
              >
                <Button
                  className="
                    relative overflow-hidden
                    px-4 md:px-5 py-2 md:py-3
                    text-white font-bold text-base md:text-lg
                    rounded-3xl
                    shadow-lg shadow-[#FF6B00]/20
                    hover:shadow-xl hover:shadow-[#FF6B00]/30
                    transition-all duration-300
                    group
                  "
                  style={{
                    border: '1.5px solid transparent',
                    backgroundImage: 'linear-gradient(135deg, #FFD05A, #FF6800, #FF5100)',
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'border-box'
                  }}
                  onClick={() => {
                    console.log('Botão Criar atividades clicado');
                    // Aqui você pode adicionar a navegação ou ação desejada
                  }}
                >
                  {/* Camada de fundo interno com opacidade de 30% */}
                  <span 
                    className="absolute inset-[1.5px] rounded-[calc(1.5rem-1.5px)] z-0"
                    style={{
                      background: 'rgba(255, 107, 0, 0.3)'
                    }}
                  ></span>

                  {/* Efeito de brilho no hover */}
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-3xl z-[1]"></span>

                  {/* Texto */}
                  <span className="relative z-10 flex items-center justify-center">
                    Criar atividades
                  </span>
                </Button>
              </motion.div>
            </motion.div>

            {/* Container com img-topico3-pv.png e ofc-titulo-3topico.png */}
            <div className="flex items-start gap-8 mt-[127px] ml-[-693px]">
              {/* Imagem img-topico3-pv.png à esquerda */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
                className="flex-shrink-0 mt-[15px] ml-[7px]"
              >
                <img 
                  src="/images/img-topico3-pv.png" 
                  alt="Tópico 3 - Ponto School" 
                  className="h-auto object-contain drop-shadow-lg"
                  style={{ maxWidth: '547px', width: '100%' }}
                  loading="eager"
                  onError={(e) => {
                    console.error('❌ Erro ao carregar imagem img-topico3-pv.png');
                    console.error('Caminho completo tentado:', e.currentTarget.src);
                    console.error('Verifique se o arquivo existe em: public/images/img-topico3-pv.png');
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('✅ Imagem img-topico3-pv.png carregada com sucesso!');
                    console.log('📍 Caminho usado:', '/images/img-topico3-pv.png');
                  }}
                />

                {/* Imagem img.10x.engajamento.pv.png abaixo de img-topico3-pv.png */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.6 }}
                  className="mt-8"
                >
                  <img 
                    src="/images/img.10x.engajamento.pv.png" 
                    alt="10x Engajamento - Ponto School" 
                    className="h-auto object-contain drop-shadow-lg"
                    style={{ maxWidth: '1337px', width: '100%' }}
                    loading="eager"
                    onError={(e) => {
                      console.error('❌ Erro ao carregar imagem img.10x.engajamento.pv.png');
                      console.error('Caminho completo tentado:', e.currentTarget.src);
                      console.error('Verifique se o arquivo existe em: public/images/img.10x.engajamento.pv.png');
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('✅ Imagem img.10x.engajamento.pv.png carregada com sucesso!');
                      console.log('📍 Caminho usado:', '/images/img.10x.engajamento.pv.png');
                    }}
                  />
                </motion.div>

                {/* Imagem rodape-pv.png abaixo de img.10x.engajamento.pv.png */}
                {/* 
                  🎯 CONTROLES AVANÇADOS DE POSICIONAMENTO E TAMANHO:
                  
                  LARGURA (width):
                  - Ajuste em pixels: ex: '800px', '1000px', '1200px'
                  - Ajuste em porcentagem: ex: '50%', '75%', '100%'
                  - Ajuste em viewport: ex: '50vw', '80vw'
                  
                  ALTURA (height):
                  - 'auto' (mantém proporção)
                  - Ajuste em pixels: ex: '200px', '300px', '400px'
                  
                  POSICIONAMENTO HORIZONTAL (marginLeft):
                  - Valores negativos movem para ESQUERDA: ex: '-100px', '-50px'
                  - Valores positivos movem para DIREITA: ex: '50px', '100px'
                  - '0px' = centralizado
                  
                  POSICIONAMENTO VERTICAL (marginTop):
                  - Valores negativos movem para CIMA: ex: '-50px', '-100px'
                  - Valores positivos movem para BAIXO: ex: '50px', '100px'
                  
                  ESCALA (transform: scale):
                  - Menor que 1 = diminui: ex: 'scale(0.5)', 'scale(0.7)'
                  - Igual a 1 = tamanho original: 'scale(1)'
                  - Maior que 1 = aumenta: ex: 'scale(1.2)', 'scale(1.5)'
                */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.8 }}
                style={{
                  marginTop: '0px',        // 📏 AJUSTE VERTICAL: distância do elemento acima
                  marginLeft: '0px',        // 📏 AJUSTE HORIZONTAL: movimentação lateral
                  marginRight: '0px',       // 📏 AJUSTE HORIZONTAL DIREITO
                  paddingLeft: '0px',       // 📏 PADDING INTERNO ESQUERDO
                  paddingRight: '0px',      // 📏 PADDING INTERNO DIREITO
                  display: 'flex',
                  justifyContent: 'center', // Mantém centralizado (mude para 'flex-start' ou 'flex-end' se quiser)
                  alignItems: 'center'
                }}
              >
                <img 
                  src="/images/rodape-pv.png" 
                  alt="Rodapé - Ponto School" 
                  className="h-auto object-contain drop-shadow-lg"
                  style={{ 
                    // 🎨 CONTROLES PRINCIPAIS DE TAMANHO E POSIÇÃO:
                    width: '2127px',           // 📐 LARGURA: ajuste o valor aqui (ex: '400px', '800px', '50%')
                    maxWidth: '100%',         // 📐 LARGURA MÁXIMA: evita quebra em telas pequenas
                    height: 'auto',           // 📐 ALTURA: mantém proporção (ou defina em px)
                    
                    // 🔄 TRANSFORMAÇÕES AVANÇADAS:
                    transform: 'scale(0.6)',  // 🔍 ESCALA: 0.6 = 60% do tamanho (ajuste de 0.1 a 2.0)
                    transformOrigin: 'center', // 🎯 PONTO DE ORIGEM DA ESCALA
                    
                    // 📍 POSICIONAMENTO FINO:
                    position: 'relative',     // Permite ajustes com top/left
                    top: '-297px',               // ⬆️ MOVE VERTICAL: negativo=cima, positivo=baixo
                    left: '-407px',              // ⬅️ MOVE HORIZONTAL: negativo=esquerda, positivo=direita
                    
                    // 🎭 EFEITOS VISUAIS:
                    opacity: 1,               // 👁️ OPACIDADE: 0 a 1 (0=invisível, 1=opaco)
                    filter: 'none',           // 🎨 FILTROS: ex: 'brightness(1.1)', 'contrast(1.2)'
                    
                    // 📦 MARGENS EXTRAS (se necessário):
                    marginTop: '0px',         // ⬆️ MARGEM SUPERIOR EXTRA
                    marginBottom: '-997px',      // ⬇️ MARGEM INFERIOR EXTRA
                    marginLeft: '0px',        // ⬅️ MARGEM ESQUERDA EXTRA
                    marginRight: '0px'        // ➡️ MARGEM DIREITA EXTRA
                  }}
                  loading="eager"
                  onError={(e) => {
                    console.error('❌ Erro ao carregar imagem rodape-pv.png');
                    console.error('Caminho completo tentado:', e.currentTarget.src);
                    
                    // Tentar fallback para a raiz do public
                    if (e.currentTarget.src.includes('/images/rodape-pv.png')) {
                      console.log('🔄 Tentando carregar /rodape-pv.png como fallback...');
                      e.currentTarget.src = '/rodape-pv.png';
                    } else {
                      console.error('❌ Fallback também falhou. Verifique se o arquivo existe em: public/images/rodape-pv.png ou public/rodape-pv.png');
                      e.currentTarget.style.display = 'none';
                    }
                  }}
                  onLoad={() => {
                    console.log('✅ Imagem rodape-pv.png carregada com sucesso!');
                    console.log('📍 Caminho usado:', '/images/rodape-pv.png');
                  }}
                />
              </motion.div>
              </motion.div>

              {/* Imagem ofc-titulo-3topico.png à direita */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.6 }}
                className="flex-shrink-0 mt-[57px] -ml-[1477px]"
              >
                <img 
                  src="/images/ofc-titulo-3topico.png" 
                  alt="Título Tópico 3 - Ponto School" 
                  className="h-auto object-contain drop-shadow-lg"
                  style={{ maxWidth: '650px', width: '100%' }}
                  loading="eager"
                  onError={(e) => {
                    console.error('❌ Erro ao carregar imagem ofc-titulo-3topico.png');
                    console.error('Caminho completo tentado:', e.currentTarget.src);
                    console.error('Verifique se o arquivo existe em: public/images/ofc-titulo-3topico.png');
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('✅ Imagem ofc-titulo-3topico.png carregada com sucesso!');
                    console.log('📍 Caminho usado:', '/images/ofc-titulo-3topico.png');
                  }}
                />
                {/* Texto explicativo abaixo da imagem ofc-titulo-2topico.png */}
                <p 
                  className="text-gray-300 text-lg leading-relaxed text-left" 
                  style={{ 
                    fontFamily: "'Poppins', 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                    lineHeight: '1.7',
                    maxWidth: '650px',
                    width: '100%',
                    marginLeft: '25px',
                    marginTop: '30px'
                  }}
                >
                  Imagine reunir todo o seu trabalho em um único app que leva o seu nome, reflete o seu estilo e oferece uma experiência completa para seus alunos. Aqui, você transforma seu repertório em uma marca <strong className="text-orange-400 font-semibold"> educacional, organizada, gamificada e totalmente sua</strong>. E o melhor, seus alunos reconhecem você como a referência que é. Não é só sobre ensinar, é sobre ser visto e valorizado pelo que você faz!
                </p>
                {/* Botão Receber meu App */}
                <motion.div
                  style={{
                    marginLeft: '25px',
                    marginTop: '34px'
                  }}
                >
                  <Button
                    className="
                      relative overflow-hidden
                      px-4 md:px-5 py-2 md:py-3
                      text-white font-bold text-base md:text-lg
                      rounded-3xl
                      shadow-lg shadow-[#FF6B00]/20
                      hover:shadow-xl hover:shadow-[#FF6B00]/30
                      transition-all duration-300
                      group
                    "
                    style={{
                      border: '1.5px solid transparent',
                      backgroundImage: 'linear-gradient(135deg, #FFD05A, #FF6800, #FF5100)',
                      backgroundOrigin: 'border-box',
                      backgroundClip: 'border-box'
                    }}
                    onClick={() => {
                      console.log('Botão Receber meu App clicado');
                      // Aqui você pode adicionar a navegação ou ação desejada
                    }}
                  >
                    {/* Camada de fundo interno com opacidade de 30% */}
                    <span 
                      className="absolute inset-[1.5px] rounded-[calc(1.5rem-1.5px)] z-0"
                      style={{
                        background: 'rgba(255, 107, 0, 0.3)'
                      }}
                    ></span>

                    {/* Efeito de brilho no hover */}
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-3xl z-[1]"></span>

                    {/* Texto */}
                    <span className="relative z-10 flex items-center justify-center">
                      Receber meu App
                    </span>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}