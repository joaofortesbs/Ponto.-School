
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Zap, Brain, Star, Sparkles, BookOpen } from 'lucide-react';

const WelcomeMessage: React.FC = () => {
  // Estados para animações sequenciais
  const [animationPhase, setAnimationPhase] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);

  // Avançar automaticamente nas fases de animação
  useEffect(() => {
    const timer = setTimeout(() => {
      if (animationPhase < 3) {
        setAnimationPhase(animationPhase + 1);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [animationPhase]);

  // Rotacionar automaticamente os recursos destacados
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 6);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Dados dos recursos
  const features = [
    {
      title: "Inteligência Avançada",
      icon: <Brain className="h-6 w-6 text-[#4A90E2]" />,
      description: "Algoritmo de ponta treinado com conteúdo educacional premium"
    },
    {
      title: "Respostas Personalizadas",
      icon: <Sparkles className="h-6 w-6 text-[#FFD700]" />,
      description: "Adapta explicações ao seu estilo de aprendizado"
    },
    {
      title: "Processamento Ultrarrápido",
      icon: <Zap className="h-6 w-6 text-[#00FFAA]" />,
      description: "Respostas geradas em tempo recorde com alta precisão"
    },
    {
      title: "Conhecimento Abrangente",
      icon: <BookOpen className="h-6 w-6 text-[#FF6B6B]" />,
      description: "Domínio de múltiplas disciplinas e tópicos avançados"
    },
    {
      title: "Aprendizado Contínuo",
      icon: <Bot className="h-6 w-6 text-[#9D65FF]" />,
      description: "Evolui constantemente com novas informações e feedbacks"
    },
    {
      title: "Interação Natural",
      icon: <Star className="h-6 w-6 text-[#FFA500]" />,
      description: "Conversa fluida e intuitiva para uma experiência imersiva"
    }
  ];

  return (
    <motion.div
      className="w-full h-full flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Grid de fundo com efeito de movimento */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          className="absolute inset-0 opacity-10"
          style={{ 
            backgroundImage: 'linear-gradient(to right, rgba(64, 93, 230, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(64, 93, 230, 0.2) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
          animate={{ 
            x: [0, 10, 0], 
            y: [0, 15, 0] 
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 20, 
            ease: "easeInOut" 
          }}
        />
      </div>

      {/* Círculos de luz no fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl opacity-30"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: [
                '#4A90E2', '#FF6B6B', '#FFD700', '#00FFAA', '#9D65FF'
              ][i % 5],
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Container principal com fundo de vidro */}
      <motion.div 
        className="relative w-[85%] max-w-3xl bg-gradient-to-br from-[#0D23A0]/10 to-[#5B21BD]/20 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl overflow-hidden z-10"
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 40px rgba(74, 144, 226, 0.15) inset' }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.2 }}
      >
        {/* Linhas luminosas em movimento */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-[#4A90E2]/50 to-transparent"
              style={{ top: `${Math.random() * 100}%` }}
              animate={{
                x: ['-100%', '100%'],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-[1px] h-full bg-gradient-to-b from-transparent via-[#9D65FF]/50 to-transparent"
              style={{ left: `${Math.random() * 100}%` }}
              animate={{
                y: ['-100%', '100%'],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>

        {/* Partículas digitais */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-[#4A90E2]/80"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, Math.random() * -50 - 20],
                x: [0, Math.random() * 30 - 15],
                opacity: [0.8, 0],
                scale: [1, 0],
              }}
              transition={{
                duration: Math.random() * 4 + 2,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Ícone central com animação de pulso */}
        <AnimatePresence>
          <motion.div
            className="flex items-center justify-center mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.5 }}
          >
            <motion.div
              className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] flex items-center justify-center shadow-lg border-2 border-white/20 relative"
              animate={{ boxShadow: ['0 0 20px rgba(74, 144, 226, 0.5)', '0 0 40px rgba(74, 144, 226, 0.8)', '0 0 20px rgba(74, 144, 226, 0.5)'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Anéis em expansão ao redor do ícone */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border border-[#4A90E2]/80"
                    animate={{
                      scale: [1, 2],
                      opacity: [0.3, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.6,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </div>
              
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                }}
                transition={{ 
                  duration: 20, 
                  repeat: Infinity, 
                  ease: "linear"
                }}
                className="absolute inset-[-10px] rounded-full border-2 border-dashed border-[#4A90E2]/30 pointer-events-none"
              />
              
              <Bot className="h-10 w-10 text-white z-10" />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Título principal com efeito de foco gradual e subtítulo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <motion.h1
            className="text-4xl font-bold text-center mb-3 bg-gradient-to-r from-[#FFFFFF] via-[#A0A0FF] to-[#FFFFFF] bg-clip-text text-transparent relative inline-block"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <motion.span
              className="relative inline-block"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              Epictus IA BETA
            </motion.span>
            <motion.span 
              className="absolute -top-3 -right-10 text-xs px-2 py-0.5 bg-gradient-to-r from-[#FF6B6B] to-[#FF9F9F] rounded-full text-white font-medium tracking-wide"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.3, type: "spring" }}
            >
              2.0
            </motion.span>
          </motion.h1>
          
          <motion.p
            className="text-xl text-white/90 mb-2 max-w-2xl mx-auto"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            Sua experiência de aprendizado reinventada
          </motion.p>
          
          <motion.p
            className="text-white/70 max-w-2xl mx-auto"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            Potencializada por tecnologia avançada de processamento de linguagem natural
          </motion.p>
        </motion.div>

        {/* Feature destacada com animação de troca */}
        <motion.div
          className="mb-8 bg-[#0D1535]/50 backdrop-blur-md rounded-xl p-6 border border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeFeature}
              className="flex flex-col items-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-3 p-3 rounded-full bg-gradient-to-br from-[#1A2244] to-[#2A3256] border border-white/10">
                {features[activeFeature].icon}
              </div>
              <h3 className="text-lg font-medium text-white mb-2">{features[activeFeature].title}</h3>
              <p className="text-white/70 text-center text-sm">{features[activeFeature].description}</p>
            </motion.div>
          </AnimatePresence>
          
          {/* Indicadores de navegação */}
          <div className="flex justify-center mt-4 space-x-1">
            {features.map((_, index) => (
              <motion.button
                key={index}
                className="w-1.5 h-1.5 rounded-full bg-white/30"
                animate={{ 
                  backgroundColor: index === activeFeature ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)',
                  scale: index === activeFeature ? 1.5 : 1
                }}
                transition={{ duration: 0.3 }}
                onClick={() => setActiveFeature(index)}
              />
            ))}
          </div>
        </motion.div>

        {/* Grade de capacidades/recursos com efeito de hover */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
        >
          {[
            {
              title: "Conversas Contextuais",
              icon: "💬",
              description: "Diálogos inteligentes que mantêm o contexto completo"
            },
            {
              title: "Análise Avançada",
              icon: "🔍",
              description: "Compreensão profunda de conceitos complexos"
            },
            {
              title: "Métodos Personalizados",
              icon: "🚀",
              description: "Abordagens adaptadas ao seu perfil de aprendizado"
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              className="relative bg-white/5 backdrop-blur-md p-5 rounded-xl border border-white/10 overflow-hidden group"
              whileHover={{ 
                scale: 1.03, 
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                borderColor: "rgba(255, 255, 255, 0.3)",
                y: -5
              }}
              transition={{ duration: 0.2 }}
            >
              {/* Efeito de brilho no hover */}
              <motion.div 
                className="absolute -inset-px opacity-0 group-hover:opacity-100 rounded-xl pointer-events-none"
                style={{ 
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                  top: '-100%',
                  left: '-100%',
                  width: '300%',
                  height: '300%'
                }}
                animate={{ top: '100%', left: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", ease: "linear" }}
              />
              
              <div className="text-2xl mb-3 relative z-10 transform group-hover:scale-110 transition-transform">{item.icon}</div>
              <h3 className="font-medium text-white mb-2 relative z-10">{item.title}</h3>
              <p className="text-sm text-white/70 relative z-10">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Mensagem de ação com efeito de digitação */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          <div className="inline-flex items-center justify-center mb-2">
            <motion.div 
              className="w-2 h-2 rounded-full bg-[#00FF00] mr-2"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <p className="text-[#00FF00] text-sm font-mono">Sistema pronto</p>
          </div>
          
          <p className="text-white/80 text-sm mb-2">Digite sua mensagem abaixo para iniciar</p>
          
          <motion.div 
            className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-[#0D23A0]/30 to-[#5B21BD]/30 backdrop-blur-sm border border-white/20 text-white/90 text-sm"
            animate={{ 
              boxShadow: ['0 0 10px rgba(93, 63, 211, 0.3)', '0 0 20px rgba(93, 63, 211, 0.5)', '0 0 10px rgba(93, 63, 211, 0.3)'],
              y: [0, -3, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            Aguardando sua primeira mensagem...
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeMessage;
