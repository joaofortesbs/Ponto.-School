
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import { Engine } from 'tsparticles-engine';
import { 
  Bot, 
  Brain, 
  BookOpen, 
  BarChart, 
  Lightbulb, 
  FileText, 
  Rocket, 
  Sparkles, 
  Zap,
  Compass
} from 'lucide-react';

interface SolarSystemEpictusTurboProps {
  onPauseChange?: (isPaused: boolean) => void;
  isPaused?: boolean;
}

const SolarSystemEpictusTurbo: React.FC<SolarSystemEpictusTurboProps> = ({ 
  onPauseChange,
  isPaused: externalPaused
}) => {
  const [pauseOrbit, setPauseOrbit] = useState(externalPaused || false);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const particlesInit = async (engine: Engine) => {
    await loadFull(engine);
  };

  useEffect(() => {
    if (externalPaused !== undefined) {
      setPauseOrbit(externalPaused);
    }
  }, [externalPaused]);

  const handleTyping = () => {
    setPauseOrbit(true);
    if (onPauseChange) onPauseChange(true);
    
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    
    typingTimeout.current = setTimeout(() => {
      setPauseOrbit(false);
      if (onPauseChange) onPauseChange(false);
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, []);

  // Definindo os planetas/funcionalidades
  const planets = [
    { 
      icon: <Brain className="w-8 h-8 text-indigo-400" />, 
      name: "Assistente IA", 
      orbitSize: 140, 
      duration: 20, 
      delay: 0 
    },
    { 
      icon: <BookOpen className="w-7 h-7 text-cyan-400" />, 
      name: "Resumos", 
      orbitSize: 180, 
      duration: 25, 
      delay: 2 
    },
    { 
      icon: <BarChart className="w-7 h-7 text-emerald-400" />, 
      name: "Análises", 
      orbitSize: 220, 
      duration: 30, 
      delay: 4 
    },
    { 
      icon: <Lightbulb className="w-7 h-7 text-amber-400" />, 
      name: "Ideias", 
      orbitSize: 260, 
      duration: 35, 
      delay: 6 
    },
    { 
      icon: <FileText className="w-7 h-7 text-rose-400" />, 
      name: "Escrita", 
      orbitSize: 300, 
      duration: 40, 
      delay: 8 
    },
    { 
      icon: <Rocket className="w-7 h-7 text-purple-400" />, 
      name: "Simulador", 
      orbitSize: 340, 
      duration: 45, 
      delay: 10 
    },
    { 
      icon: <Compass className="w-7 h-7 text-blue-400" />, 
      name: "Navegador", 
      orbitSize: 380, 
      duration: 50, 
      delay: 12 
    }
  ];

  return (
    <div className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Partículas de fundo */}
      <div className="absolute inset-0 -z-1">
        <Particles
          id="turboparticles"
          init={particlesInit}
          options={{
            fullScreen: { enable: false },
            particles: {
              number: { value: 80 },
              color: { value: "#ffffff" },
              shape: { type: "circle" },
              opacity: {
                value: 0.15,
                random: true,
              },
              size: {
                value: 1.5,
                random: true,
              },
              move: {
                enable: true,
                speed: 0.3,
                direction: "none",
                random: true,
                straight: false,
                outModes: "out",
              },
            },
            background: { color: "transparent" },
          }}
          className="h-full w-full absolute"
        />
      </div>

      {/* Centro - Sol (Epictus Turbo) */}
      <motion.div
        className="absolute z-10 flex flex-col items-center justify-center"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8F40] flex items-center justify-center shadow-lg shadow-orange-500/20 border border-orange-400/30">
          <Bot className="h-12 w-12 text-white" />
        </div>
        <div className="absolute -bottom-10 text-center">
          <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
            Epictus IA
          </h2>
          <p className="text-sm text-white/70">BETA</p>
        </div>
      </motion.div>

      {/* Planetas orbitais */}
      {planets.map((planet, index) => (
        <div key={index} className="absolute" style={{
          width: `${planet.orbitSize * 2}px`,
          height: `${planet.orbitSize * 2}px`,
          borderRadius: '50%',
          border: '1px dashed rgba(255, 255, 255, 0.1)',
        }}>
          <motion.div
            className="absolute"
            animate={{ 
              rotate: pauseOrbit ? 
                [null, `${index % 2 === 0 ? -10 : 10}deg`] : 
                [0, 360] 
            }}
            transition={{
              duration: pauseOrbit ? 0.5 : planet.duration,
              ease: pauseOrbit ? "easeOut" : "linear",
              repeat: Infinity,
              repeatType: "loop",
              delay: pauseOrbit ? 0 : planet.delay / 10,
            }}
            style={{
              width: `${planet.orbitSize * 2}px`,
              height: `${planet.orbitSize * 2}px`,
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            <motion.div
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                left: "100%",
                top: "50%",
              }}
              whileHover={{ scale: 1.1 }}
            >
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[#1c2842] bg-opacity-80 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/10 hover:border-white/30 transition-all cursor-pointer group">
                  {planet.icon}
                  <div className="absolute opacity-0 group-hover:opacity-100 whitespace-nowrap bg-black/80 text-white text-xs px-2 py-1 rounded -top-8 transition-opacity duration-200">
                    {planet.name}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      ))}

      {/* Efeito de brilho central */}
      <div className="absolute w-80 h-80 bg-orange-500/5 rounded-full filter blur-3xl"></div>
      <div className="absolute w-40 h-40 bg-blue-500/5 rounded-full filter blur-2xl"></div>

      {/* Instruções para o usuário */}
      <motion.div 
        className="absolute bottom-10 text-center max-w-md px-6 py-3 rounded-lg bg-[#0d1425]/60 backdrop-blur-md border border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <p className="text-white/80 text-sm">
          Digite sua mensagem na caixa abaixo para iniciar a conversa com o Epictus IA
        </p>
      </motion.div>
    </div>
  );
};

export default SolarSystemEpictusTurbo;
