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

  // Definindo os planetas/funcionalidades com tamanhos reduzidos
  const planets = [
    { 
      icon: <Brain className="w-5 h-5 text-indigo-400" />, 
      name: "Assistente IA", 
      orbitSize: 90, 
      duration: 28, 
      delay: 0 
    },
    { 
      icon: <BookOpen className="w-5 h-5 text-cyan-400" />, 
      name: "Resumos", 
      orbitSize: 115, 
      duration: 35, 
      delay: 2 
    },
    { 
      icon: <BarChart className="w-5 h-5 text-emerald-400" />, 
      name: "Análises", 
      orbitSize: 140, 
      duration: 42, 
      delay: 4 
    },
    { 
      icon: <Lightbulb className="w-5 h-5 text-amber-400" />, 
      name: "Ideias", 
      orbitSize: 165, 
      duration: 48, 
      delay: 6 
    },
    { 
      icon: <FileText className="w-5 h-5 text-rose-400" />, 
      name: "Escrita", 
      orbitSize: 190, 
      duration: 55, 
      delay: 8 
    },
    { 
      icon: <Rocket className="w-5 h-5 text-purple-400" />, 
      name: "Simulador", 
      orbitSize: 215, 
      duration: 60, 
      delay: 10 
    }
  ];

  return (
    <div className="relative w-full max-w-7xl mx-auto h-[50vh] flex items-center justify-center overflow-hidden"> {/* Reduced height */}
      {/* Partículas flutuantes decorativas */}
      <div className="absolute inset-0 -z-1 pointer-events-none">
        {Array.from({ length: 20 }).map((_, index) => (
          <motion.div
            key={`floating-particle-${index}`}
            className="absolute rounded-full bg-white/20"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      {/* Partículas de fundo aprimoradas */}
      <div className="absolute inset-0 -z-1">
        <Particles
          id="turboparticles"
          init={particlesInit}
          options={{
            fullScreen: { enable: false },
            particles: {
              number: { value: 100 },
              color: { 
                value: ["#ffffff", "#8b5cf6", "#3b82f6", "#10b981"] 
              },
              shape: { type: "circle" },
              opacity: {
                value: 0.15,
                random: true,
                anim: {
                  enable: true,
                  speed: 0.2,
                  opacity_min: 0.05,
                  sync: false
                }
              },
              size: {
                value: 1.8,
                random: true,
                anim: {
                  enable: true,
                  speed: 0.5,
                  size_min: 0.5,
                  sync: false
                }
              },
              move: {
                enable: true,
                speed: 0.4,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false,
                attract: {
                  enable: true,
                  rotateX: 600,
                  rotateY: 1200
                }
              },
              links: {
                enable: true,
                distance: 80,
                color: "#ffffff",
                opacity: 0.04,
                width: 1
              },
            },
            interactivity: {
              detect_on: "canvas",
              events: {
                onhover: {
                  enable: true,
                  mode: "grab"
                },
                onclick: {
                  enable: true,
                  mode: "push"
                },
                resize: true
              },
              modes: {
                grab: {
                  distance: 100,
                  line_linked: {
                    opacity: 0.25
                  }
                },
                push: {
                  particles_nb: 3
                }
              }
            },
            background: { color: "transparent" },
          }}
          className="h-full w-full absolute"
        />
      </div>

      {/* Gradiente de fundo circular */}
      <div className="absolute w-full h-full bg-gradient-radial from-indigo-900/10 via-blue-900/5 to-transparent"></div>

      {/* Centro - Sol (Epictus IA) - Design aprimorado (tamanho reduzido) */}
      <motion.div
        className="absolute z-10 flex flex-col items-center justify-center"
        animate={{
          scale: [1, 1.05, 1],
          filter: ["brightness(1)", "brightness(1.1)", "brightness(1)"]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8F40] flex items-center justify-center shadow-lg shadow-orange-500/30 border border-orange-400/40 relative">
          <Bot className="h-8 w-8 text-white" />
          <div className="absolute inset-0 rounded-full bg-orange-500/20 animate-pulse"></div>
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-orange-400/20 to-amber-300/20 blur-sm"></div>
        </div>
        {/* Texto removido completamente */}
      </motion.div>

      {/* Planetas orbitais - Design aprimorado */}
      {planets.map((planet, index) => (
        <div key={index} className="absolute" style={{
          width: `${planet.orbitSize * 2}px`,
          height: `${planet.orbitSize * 2}px`,
          borderRadius: '50%',
          border: '1px dashed rgba(255, 255, 255, 0.07)',
        }}>
          <motion.div
            className="absolute"
            animate={{ 
              rotate: pauseOrbit ? 
                [null, `${index % 2 === 0 ? -5 : 5}deg`] : 
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
              whileHover={{ scale: 1.15, filter: "brightness(1.2)" }}
            >
              <div className="flex flex-col items-center group">
                <div className="w-12 h-12 rounded-full bg-[#1c2842]/90 backdrop-blur-md flex items-center justify-center 
                      shadow-lg border border-white/10 hover:border-white/30 transition-all cursor-pointer
                      hover:shadow-[0_0_15px_rgba(79,70,229,0.3)] relative z-10">
                  {planet.icon}
                  <div className="absolute w-full h-full rounded-full bg-indigo-500/10 animate-ping-slow"></div>
                </div>
                <div className="absolute opacity-0 group-hover:opacity-100 whitespace-nowrap bg-[#0f172a]/90 backdrop-blur-md 
                     text-white text-xs px-3 py-1.5 rounded-full -top-8 transition-all duration-200 z-20
                     border border-indigo-500/20 shadow-lg transform group-hover:-translate-y-1 pointer-events-none">
                  {planet.name}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      ))}

      {/* Efeitos de luz aprimorados */}
      <div className="absolute w-60 h-60 bg-indigo-500/5 rounded-full filter blur-3xl"></div>
      <div className="absolute w-40 h-40 bg-blue-500/5 rounded-full filter blur-3xl"></div>
      <div className="absolute w-32 h-32 bg-orange-500/10 rounded-full filter blur-xl"></div>
    </div>
  );
};

export default SolarSystemEpictusTurbo;