
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Compass,
  Star,
  Zap,
  Diamond
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
  const [selectedPlanet, setSelectedPlanet] = useState<number | null>(null);
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

  // Cores mais vibrantes e sofisticadas para os planetas
  const planetColors = {
    assistenteIA: {
      icon: "text-indigo-400",
      orb: "from-indigo-500 to-violet-600",
      glow: "rgba(99, 102, 241, 0.4)",
      trail: "rgba(79, 70, 229, 0.15)"
    },
    resumos: {
      icon: "text-cyan-400",
      orb: "from-cyan-400 to-blue-500",
      glow: "rgba(34, 211, 238, 0.4)",
      trail: "rgba(6, 182, 212, 0.15)"
    },
    analises: {
      icon: "text-emerald-400",
      orb: "from-emerald-400 to-green-500",
      glow: "rgba(16, 185, 129, 0.4)",
      trail: "rgba(5, 150, 105, 0.15)"
    },
    ideias: {
      icon: "text-amber-400",
      orb: "from-amber-400 to-yellow-500",
      glow: "rgba(245, 158, 11, 0.4)",
      trail: "rgba(217, 119, 6, 0.15)"
    },
    escrita: {
      icon: "text-rose-400",
      orb: "from-rose-400 to-pink-600",
      glow: "rgba(244, 63, 94, 0.4)",
      trail: "rgba(225, 29, 72, 0.15)"
    },
    simulador: {
      icon: "text-purple-400",
      orb: "from-purple-400 to-fuchsia-600",
      glow: "rgba(168, 85, 247, 0.4)",
      trail: "rgba(147, 51, 234, 0.15)"
    },
  };

  // Definindo os planetas/funcionalidades com designs mais sofisticados
  const planets = [
    { 
      icon: <Brain className="w-5 h-5 text-indigo-400" />, 
      colorClass: planetColors.assistenteIA,
      name: "Assistente IA", 
      description: "Seu assistente de inteligência artificial personalizado",
      orbitSize: 80, 
      duration: 28, 
      delay: 0,
      particleTrail: true
    },
    { 
      icon: <BookOpen className="w-5 h-5 text-cyan-400" />, 
      colorClass: planetColors.resumos,
      name: "Resumos", 
      description: "Criação de resumos inteligentes de conteúdos",
      orbitSize: 105, 
      duration: 35, 
      delay: 2,
      particleTrail: true
    },
    { 
      icon: <BarChart className="w-5 h-5 text-emerald-400" />, 
      colorClass: planetColors.analises,
      name: "Análises", 
      description: "Análises detalhadas de desempenho e resultados",
      orbitSize: 130, 
      duration: 42, 
      delay: 4,
      particleTrail: true
    },
    { 
      icon: <Lightbulb className="w-5 h-5 text-amber-400" />, 
      colorClass: planetColors.ideias,
      name: "Ideias", 
      description: "Gerador de ideias e conceitos inovadores",
      orbitSize: 155, 
      duration: 48, 
      delay: 6,
      particleTrail: true
    },
    { 
      icon: <FileText className="w-5 h-5 text-rose-400" />, 
      colorClass: planetColors.escrita,
      name: "Escrita", 
      description: "Assistente de escrita avançado e criativo",
      orbitSize: 180, 
      duration: 55, 
      delay: 8,
      particleTrail: true
    },
    { 
      icon: <Rocket className="w-5 h-5 text-purple-400" />, 
      colorClass: planetColors.simulador,
      name: "Simulador", 
      description: "Simulações avançadas para aprendizado prático",
      orbitSize: 205, 
      duration: 60, 
      delay: 10,
      particleTrail: true
    }
  ];

  // Função para gerar estrelas aleatórias
  const generateRandomStars = (count: number) => {
    const stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        id: i,
        size: Math.random() * 2 + 0.5,
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: Math.random() * 0.5 + 0.3,
        pulse: Math.random() > 0.7,
        pulseSpeed: Math.random() * 3 + 2
      });
    }
    return stars;
  };

  const stars = generateRandomStars(50);

  return (
    <div className="solar-system-container relative flex items-center justify-center overflow-hidden">
      {/* Partículas de fundo aprimoradas */}
      <div className="absolute inset-0 -z-1">
        <Particles
          id="turboparticles"
          init={particlesInit}
          options={{
            fullScreen: { enable: false },
            particles: {
              number: { value: 120 },
              color: { 
                value: ["#ffffff", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899"] 
              },
              shape: { type: "circle" },
              opacity: {
                value: 0.2,
                random: true,
                anim: {
                  enable: true,
                  speed: 0.2,
                  opacity_min: 0.05,
                  sync: false
                }
              },
              size: {
                value: 2,
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
                speed: 0.3,
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
                distance: 90,
                color: "#ffffff",
                opacity: 0.04,
                width: 1
              },
              twinkle: {
                particles: {
                  enable: true,
                  frequency: 0.05,
                  opacity: 1
                }
              }
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
                  distance: 140,
                  line_linked: {
                    opacity: 0.4
                  }
                },
                push: {
                  particles_nb: 4
                }
              }
            },
            background: { color: "transparent" },
          }}
          className="h-full w-full absolute"
        />
      </div>

      {/* Estrelas estáticas */}
      {stars.map((star) => (
        <div
          key={star.id}
          className={`absolute rounded-full bg-white ${star.pulse ? 'animate-pulse-custom' : ''}`}
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            left: `${star.x}%`,
            top: `${star.y}%`,
            opacity: star.opacity,
            animationDuration: `${star.pulseSpeed}s`,
            boxShadow: `0 0 ${star.size + 1}px rgba(255, 255, 255, 0.8)`
          }}
        />
      ))}

      {/* Gradientes de fundo atmosféricos */}
      <div className="absolute w-full h-full">
        <div className="absolute w-full h-full bg-gradient-radial from-indigo-900/15 via-blue-900/10 to-transparent"></div>
        <div className="absolute w-full h-full bg-gradient-radial from-purple-900/10 via-transparent to-transparent" style={{ transform: 'translate(-20%, -20%)' }}></div>
        <div className="absolute w-full h-full bg-gradient-radial from-teal-900/10 via-transparent to-transparent" style={{ transform: 'translate(20%, 20%)' }}></div>
      </div>

      {/* Campo de energia cósmica */}
      <div className="absolute w-[110%] h-[110%] rounded-full border border-indigo-500/5 animate-spin-very-slow"></div>
      <div className="absolute w-[100%] h-[100%] rounded-full border border-purple-500/5 animate-spin-slow-reverse"></div>

      {/* Centro - Sol (Epictus IA) - Design ultramoderno */}
      <motion.div
        className="absolute z-20 flex flex-col items-center justify-center"
        animate={{
          scale: [1, 1.05, 1],
          filter: ["brightness(1) drop-shadow(0 0 8px rgba(255, 107, 0, 0.3))", 
                  "brightness(1.2) drop-shadow(0 0 12px rgba(255, 107, 0, 0.5))", 
                  "brightness(1) drop-shadow(0 0 8px rgba(255, 107, 0, 0.3))"]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        {/* Sol Principal */}
        <div className="w-16 h-16 rounded-full relative group">
          {/* Camada externa pulsante */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 blur-md animate-pulse-slow"></div>
          
          {/* Brilho externo */}
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-amber-400/10 via-orange-500/10 to-red-500/10 blur-xl"></div>
          
          {/* Núcleo do sol */}
          <div className="w-full h-full rounded-full bg-gradient-conic from-amber-400 via-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/40 border border-orange-400/40 relative z-10 group-hover:shadow-orange-500/60 transition-shadow duration-300">
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent"></div>
            <Bot className="h-8 w-8 text-white drop-shadow-md relative z-10" />
            
            {/* Efeito de pulso no centro */}
            <div className="absolute inset-0 rounded-full bg-orange-500/30 animate-pulse-custom"></div>
            
            {/* Raios solares */}
            <div className="absolute -inset-3 z-0">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute top-1/2 left-1/2 w-1 h-10 bg-gradient-to-t from-orange-400/90 to-transparent -translate-x-1/2 -translate-y-1/2 origin-top"
                  style={{ transform: `translate(-50%, -50%) rotate(${45 * i}deg) translateY(8px)` }}
                ></div>
              ))}
            </div>
          </div>
          
          {/* Linha orbital de energia */}
          <div className="absolute -inset-1 rounded-full border border-orange-400/30 animate-ping-slow"></div>
          
          {/* Texto com efeito de brilho */}
          <div className="absolute -bottom-9 text-center z-10">
            <h2 className="text-base font-bold bg-gradient-to-br from-amber-300 via-orange-400 to-amber-300 bg-clip-text text-transparent drop-shadow-sm">
              Epictus IA
            </h2>
            <div className="flex items-center justify-center gap-1">
              <p className="text-xs text-white/80 -mt-0.5">BETA</p>
              <Sparkles className="w-3 h-3 text-amber-300" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Planetas orbitais - Design hiper-moderno */}
      {planets.map((planet, index) => (
        <motion.div 
          key={index} 
          className="absolute"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          style={{
            width: `${planet.orbitSize * 2}px`,
            height: `${planet.orbitSize * 2}px`,
            borderRadius: '50%',
          }}
        >
          {/* Órbita estilizada */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(${planet.colorClass.trail} 0deg, transparent 20deg, ${planet.colorClass.trail} 40deg, transparent 60deg, ${planet.colorClass.trail} 80deg, transparent 100deg, ${planet.colorClass.trail} 120deg, transparent 140deg, ${planet.colorClass.trail} 160deg, transparent 180deg, ${planet.colorClass.trail} 200deg, transparent 220deg, ${planet.colorClass.trail} 240deg, transparent 260deg, ${planet.colorClass.trail} 280deg, transparent 300deg, ${planet.colorClass.trail} 320deg, transparent 340deg)`,
              opacity: selectedPlanet === index ? 0.6 : 0.2,
              transform: selectedPlanet === index ? 'scale(1.03)' : 'scale(1)',
              transition: 'opacity 0.3s, transform 0.3s'
            }}
          ></div>

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
              zIndex: selectedPlanet === index ? 30 : 10,
            }}
          >
            {/* Efeito de trilha de partículas para cada planeta */}
            {planet.particleTrail && !pauseOrbit && (
              <div className="absolute left-[100%] top-[50%] -translate-x-1/2 -translate-y-1/2 opacity-70 z-0">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: `${4 - i * 0.6}px`,
                      height: `${4 - i * 0.6}px`,
                      backgroundColor: planet.colorClass.trail,
                      opacity: 0.7 - i * 0.1,
                      transform: `translateX(${-i * 4}px) translateY(${i % 2 === 0 ? -1 : 1}px)`,
                      boxShadow: `0 0 8px ${planet.colorClass.glow}`,
                    }}
                  />
                ))}
              </div>
            )}

            <motion.div
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
              style={{
                left: "100%",
                top: "50%",
              }}
              whileHover={{ scale: 1.2 }}
              onClick={() => setSelectedPlanet(selectedPlanet === index ? null : index)}
            >
              <div className="flex flex-col items-center">
                {/* Planeta com efeitos visuais avançados */}
                <motion.div 
                  className={`w-12 h-12 rounded-full bg-[#1c2842]/90 backdrop-blur-md flex items-center justify-center 
                        shadow-lg border border-white/10 transition-all cursor-pointer relative
                        hover:shadow-[0_0_20px_${planet.colorClass.glow}] group`}
                  whileHover={{ 
                    boxShadow: `0 0 25px ${planet.colorClass.glow}`,
                    borderColor: "rgba(255, 255, 255, 0.3)" 
                  }}
                  animate={selectedPlanet === index ? {
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      `0 0 15px ${planet.colorClass.glow}`,
                      `0 0 25px ${planet.colorClass.glow}`,
                      `0 0 15px ${planet.colorClass.glow}`
                    ]
                  } : {}}
                  transition={selectedPlanet === index ? {
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  } : {}}
                >
                  {/* Gradiente superfície do planeta */}
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${planet.colorClass.orb} opacity-40`}></div>
                  
                  {/* Brilho interno */}
                  <div className="absolute inset-1.5 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                  
                  {/* Ícone central com efeito de pulse neon */}
                  <div className="relative z-10 transform transition-transform group-hover:scale-110">
                    {planet.icon}
                  </div>

                  {/* Anel luminoso pulsante */}
                  <div className="absolute w-full h-full rounded-full border-t border-l border-white/20 animate-spin-very-slow"></div>
                  
                  {/* Efeito de brilho pulsante */}
                  <div className="absolute w-full h-full rounded-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse-slow"></div>
                  
                  {/* Aura energética */}
                  <motion.div 
                    className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-40 bg-gradient-radial"
                    style={{
                      background: `radial-gradient(circle, ${planet.colorClass.glow} 0%, transparent 70%)`,
                    }}
                    animate={selectedPlanet === index ? { opacity: 0.6 } : {}}
                  ></motion.div>
                </motion.div>

                {/* Tooltip de informação aprimorado */}
                <AnimatePresence>
                  {(selectedPlanet === index || false) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="absolute whitespace-nowrap bg-[#0f172a]/90 backdrop-blur-xl 
                            text-white px-4 py-3 rounded-xl -bottom-20 
                            border border-indigo-500/30 shadow-xl z-50"
                      style={{
                        boxShadow: `0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 0 15px ${planet.colorClass.glow}`
                      }}
                    >
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#0f172a]/90 border-t border-l border-indigo-500/30 transform rotate-45"></div>
                      <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-sm flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: planet.colorClass.glow }}></div>
                          {planet.name}
                        </h3>
                        <p className="text-xs text-white/70">{planet.description}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Label de nome minimalista quando não selecionado */}
                <AnimatePresence>
                  {(selectedPlanet === null && false) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute opacity-0 group-hover:opacity-100 whitespace-nowrap bg-[#0f172a]/80 backdrop-blur-md 
                            text-white text-xs px-2 py-1 rounded-full -top-6 transition-all duration-200 
                            border border-indigo-500/20"
                    >
                      {planet.name}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      ))}

      {/* Efeitos de luz atmosféricos */}
      <div className="absolute w-60 h-60 bg-indigo-500/5 rounded-full filter blur-3xl"></div>
      <div className="absolute w-60 h-60 bg-violet-500/5 rounded-full filter blur-3xl" style={{ transform: 'translate(20%, 20%)' }}></div>
      <div className="absolute w-40 h-40 bg-blue-500/5 rounded-full filter blur-3xl" style={{ transform: 'translate(-30%, -20%)' }}></div>
      <div className="absolute w-40 h-40 bg-orange-500/10 rounded-full filter blur-xl"></div>
    </div>
  );
};

export default SolarSystemEpictusTurbo;
