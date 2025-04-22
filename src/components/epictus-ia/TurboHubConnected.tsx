
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, Brain, PenLine, BookOpen, Calendar, PieChart, CheckSquare, Sparkles } from "lucide-react";

// Tipos para os nódulos
interface Nodule {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  functions: string[];
  example: string;
}

const TurboHubConnected: React.FC = () => {
  // Estado para controlar qual nódulo está em foco
  const [focusedNodule, setFocusedNodule] = useState<string | null>(null);
  const [particlesArray, setParticlesArray] = useState<{ x: number; y: number; size: number; speed: number; opacity: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Definição dos nódulos de recursos
  const nodules: Nodule[] = [
    {
      id: "simulator",
      name: "Simulador de Questões",
      icon: <Brain className="h-6 w-6" />,
      description: "Crie provas com dificuldade adaptativa e análise BNCC.",
      color: "from-blue-500 to-indigo-600",
      functions: [
        "Geração de questões por tema e habilidade",
        "Feedback pós-questão com explicações",
        "Histórico e gráficos de evolução"
      ],
      example: "Prova de Matemática com 5 questões discursivas de geometria analítica + explicações visuais."
    },
    {
      id: "redaction",
      name: "Copilot de Redação",
      icon: <PenLine className="h-6 w-6" />,
      description: "Revisa, escreve e melhora redações com IA avançada.",
      color: "from-purple-500 to-pink-600",
      functions: [
        "Análise estrutural de redações",
        "Sugestões de melhoria e correção",
        "Templates e exemplos adaptados"
      ],
      example: "Correção de redação sobre sustentabilidade com destaque para argumentos e coesão textual."
    },
    {
      id: "summarizer",
      name: "Resumo Ilustrado",
      icon: <BookOpen className="h-6 w-6" />,
      description: "Gera mapas mentais e resumos com imagens e conexões visuais.",
      color: "from-cyan-500 to-blue-600",
      functions: [
        "Síntese de conteúdos complexos",
        "Visualizações e mapas mentais",
        "Conexões interdisciplinares"
      ],
      example: "Mapa mental sobre Revolução Francesa com ramificações causais e ícones representativos."
    },
    {
      id: "planner",
      name: "Planejador Inteligente",
      icon: <Calendar className="h-6 w-6" />,
      description: "Cria cronogramas e planos de estudo automatizados e adaptáveis.",
      color: "from-emerald-500 to-green-600",
      functions: [
        "Agenda personalizada por objetivo",
        "Divisão balanceada de tempo e temas",
        "Métricas de progresso e adaptação"
      ],
      example: "Cronograma de 30 dias para preparação ENEM com foco nas suas fraquezas e revisão espaçada."
    },
    {
      id: "creator",
      name: "Criador de Aula",
      icon: <PieChart className="h-6 w-6" />,
      description: "Monta aulas completas com IA + material visual personalizado.",
      color: "from-orange-500 to-red-600",
      functions: [
        "Planos de aula estruturados",
        "Slides e materiais didáticos",
        "Atividades e avaliações integradas"
      ],
      example: "Aula sobre sistema solar com slides, vídeos sugeridos e atividade prática para impressão."
    },
    {
      id: "tasks",
      name: "Tarefas Interativas",
      icon: <CheckSquare className="h-6 w-6" />,
      description: "Exercícios dinâmicos que se adaptam ao seu progresso.",
      color: "from-amber-500 to-yellow-600",
      functions: [
        "Exercícios com nível adaptativo",
        "Feedback em tempo real",
        "Análise de pontos fortes e fracos"
      ],
      example: "Lista de exercícios de física que se torna mais complexa conforme você acerta."
    }
  ];

  // Efeito para criar partículas flutuantes simulando poeira estelar
  useEffect(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;

    // Criar array de partículas
    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * containerWidth,
      y: Math.random() * containerHeight,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random() * 0.5 + 0.2
    }));

    setParticlesArray(particles);

    // Animação das partículas
    const animateParticles = () => {
      setParticlesArray(prev => 
        prev.map(particle => ({
          ...particle,
          y: particle.y - particle.speed,
          x: particle.x + (Math.random() - 0.5) * 0.3,
          // Resetar partícula quando sai da tela
          ...(particle.y < 0 ? {
            y: containerHeight,
            x: Math.random() * containerWidth
          } : {})
        }))
      );
    };

    const animationFrame = setInterval(animateParticles, 50);

    // Ajustar partículas ao redimensionar a janela
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.offsetWidth;
      const newHeight = containerRef.current.offsetHeight;
      
      setParticlesArray(prev => 
        prev.map(particle => ({
          ...particle,
          x: (particle.x / containerWidth) * newWidth,
          y: (particle.y / containerHeight) * newHeight
        }))
      );
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Função para lidar com o clique em um nódulo
  const handleNoduleClick = (id: string) => {
    if (focusedNodule === id) {
      setFocusedNodule(null);
    } else {
      setFocusedNodule(id);
      // Aqui você poderia adicionar um efeito sonoro se desejado
    }
  };

  // Função para fechar o foco atual
  const handleCloseFocus = () => {
    setFocusedNodule(null);
  };

  // Encontrar o nódulo em foco
  const focusedNodeData = focusedNodule 
    ? nodules.find(n => n.id === focusedNodule) 
    : null;

  return (
    <div className="w-full mx-auto p-4 mt-2 mb-6">
      <div 
        ref={containerRef}
        className="relative min-h-[500px] w-full bg-gradient-to-r from-[#050e1d] to-[#0d1a30] rounded-2xl shadow-xl border border-white/5 overflow-hidden"
      >
        {/* Partículas de fundo - estrelas */}
        {particlesArray.map((particle, index) => (
          <div
            key={index}
            className="absolute rounded-full bg-white"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
            }}
          />
        ))}

        {/* Grade de fundo - sistema cibernético */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

        {/* Linhas de conexão com SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
          <defs>
            <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0D23A0" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#4A2FA0" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#5B21BD" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1230CC" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#3726BB" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#4A0D9F" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="techGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            {/* Animação das partículas nas linhas */}
            <linearGradient id="particleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#4A0D9F" stopOpacity="0.8" />
            </linearGradient>
            
            {/* Padrão de linha tecnológica */}
            <pattern id="techLinePattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
              <rect x="0" y="3.5" width="8" height="1" fill="rgba(255, 255, 255, 0.3)" />
            </pattern>
          </defs>

          {/* Linhas conectando nódulos ao centro */}
          {nodules.map((nodule, index) => {
            const angle = (index * (2 * Math.PI / nodules.length));
            const isActive = focusedNodule === null || focusedNodule === nodule.id;

            return (
              <g key={nodule.id} 
                filter={isActive ? "url(#glow)" : ""} 
                opacity={isActive ? 1 : 0.3} 
                className="transition-opacity duration-500"
              >
                {/* Linha base (mais grossa e brilhante) */}
                <path 
                  d={`M 50% 50% L ${50 + 35 * Math.cos(angle)}% ${50 + 35 * Math.sin(angle)}%`}
                  stroke={`url(#lineGradient${index % 2 + 1})`}
                  strokeWidth="3"
                  fill="none"
                  filter="url(#techGlow)"
                  className="transition-all duration-500"
                />
                
                {/* Linha tecnológica sobreposta (efeito digital) */}
                <path 
                  d={`M 50% 50% L ${50 + 35 * Math.cos(angle)}% ${50 + 35 * Math.sin(angle)}%`}
                  stroke={`url(#lineGradient${index % 2 + 1})`}
                  strokeWidth="1.5"
                  strokeDasharray={isActive ? "8 4" : "4 2"}
                  fill="none"
                  className="transition-all duration-500"
                />
                
                {/* Partículas pulsantes nas linhas com efeito tecnológico*/}
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.circle 
                    key={`particle-${index}-${i}`}
                    cx={`${50 + (20 + i * 5) * Math.cos(angle)}%`}
                    cy={`${50 + (20 + i * 5) * Math.sin(angle)}%`}
                    r="2"
                    fill="white"
                    stroke={`rgba(${index % 2 ? '74, 13, 159' : '13, 35, 160'}, 0.8)`}
                    strokeWidth="0.5"
                    animate={{ 
                      cx: [`${50 + (35 - i * 7) * Math.cos(angle)}%`, `${50 + 5 * Math.cos(angle)}%`],
                      cy: [`${50 + (35 - i * 7) * Math.sin(angle)}%`, `${50 + 5 * Math.sin(angle)}%`],
                      opacity: [0.8, 1, 0.2],
                      r: ["1.5px", "2.5px", "1px"],
                      filter: [
                        "drop-shadow(0 0 2px rgba(255, 255, 255, 0.8))",
                        "drop-shadow(0 0 4px rgba(255, 255, 255, 0.9))",
                        "drop-shadow(0 0 1px rgba(255, 255, 255, 0.7))"
                      ]
                    }}
                    transition={{ 
                      repeat: Infinity,
                      duration: 2 + i * 0.4,
                      delay: i * 0.7,
                      ease: "linear",
                      times: [0, 0.8, 1]
                    }}
                    style={{
                      display: isActive ? "block" : "none"
                    }}
                  />
                ))}
                
                {/* Pequenos pulsos digitais ao longo da linha */}
                {isActive && Array.from({ length: 2 }).map((_, i) => (
                  <motion.circle 
                    key={`digital-pulse-${index}-${i}`}
                    cx="50%"
                    cy="50%"
                    r="1.5"
                    fill="rgba(255, 255, 255, 0.9)"
                    filter="drop-shadow(0 0 2px rgba(255, 255, 255, 0.8))"
                    animate={{ 
                      cx: [`${50}%`, `${50 + 35 * Math.cos(angle) * 0.6}%`],
                      cy: [`${50}%`, `${50 + 35 * Math.sin(angle) * 0.6}%`],
                      opacity: [0.9, 0],
                      r: ["1.5px", "0.5px"]
                    }}
                    transition={{ 
                      repeat: Infinity,
                      duration: 1.5,
                      delay: i * 0.75,
                      ease: "linear" 
                    }}
                  />
                ))}
              </g>
            );
          })}
        </svg>

        {/* Núcleo central - Epictus Turbo */}
        <motion.div 
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 ${
            focusedNodule ? 'scale-90 opacity-80' : 'opacity-100'
          } transition-all duration-500`}
          animate={{
            boxShadow: [
              '0 0 15px rgba(13, 35, 160, 0.5)', 
              '0 0 25px rgba(91, 33, 189, 0.7)', 
              '0 0 15px rgba(13, 35, 160, 0.5)'
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        >
          <div className="relative w-28 h-28 rounded-[22px] bg-gradient-to-br from-[#2B27A9] to-[#3C2BD6] flex items-center justify-center shadow-2xl">
            <div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-[#0D23A0]/30 to-[#5B21BD]/30 blur-lg animate-pulse"></div>
            
            {/* Efeito de pulso recebendo dados */}
            <motion.div 
              className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-[#0D23A0]/10 to-[#5B21BD]/10"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <span className="text-white font-bold text-xl relative z-10">
              <div className="flex items-center justify-center flex-col">
                <Sparkles className="h-7 w-7 text-white mb-1" />
                <span>Turbo</span>
              </div>
            </span>
          </div>
        </motion.div>

        {/* Nódulos ao redor */}
        {nodules.map((nodule, index) => {
          const isFocused = focusedNodule === nodule.id;
          const isBlurred = focusedNodule !== null && focusedNodule !== nodule.id;

          // Posicionar os nódulos em círculo
          const angle = (index * (2 * Math.PI / nodules.length));
          const radius = 35; // % do container

          const positionStyle = {
            left: `calc(50% + ${radius * Math.cos(angle)}%)`,
            top: `calc(50% + ${radius * Math.sin(angle)}%)`,
          };

          return (
            <div 
              key={nodule.id} 
              style={positionStyle} 
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <motion.div
                className={`relative ${isBlurred ? 'opacity-30 blur-sm scale-75' : ''} transition-all duration-500`}
                animate={isFocused ? {
                  scale: [1, 1.2]
                } : {
                  scale: 1
                }}
                style={{ 
                  zIndex: isFocused ? 30 : 10 
                }}
                transition={{ duration: 0.3 }}
                onClick={() => handleNoduleClick(nodule.id)}
              >
                <motion.div 
                  className={`w-18 h-18 rounded-2xl bg-gradient-to-br ${nodule.color} flex items-center justify-center shadow-xl cursor-pointer border border-white/20`}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  style={{ width: "4.5rem", height: "4.5rem" }}
                >
                  <div className="text-white">
                    {nodule.icon}
                  </div>
                </motion.div>
                <div className="text-center mt-2 text-white text-sm font-medium w-24 mx-auto">
                  {nodule.name}
                </div>
              </motion.div>
            </div>
          );
        })}

        {/* Detalhes do nódulo em foco */}
        <AnimatePresence>
          {focusedNodeData && (
            <motion.div 
              className="absolute right-8 top-10 z-40 bg-gradient-to-r from-[#0c2341]/80 to-[#0f3562]/80 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl max-w-xs"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${focusedNodeData.color} flex items-center justify-center`}>
                    {focusedNodeData.icon}
                  </div>
                  <h3 className="text-white text-lg font-bold">{focusedNodeData.name}</h3>
                </div>

                <p className="text-white/80 text-sm mb-4">
                  {focusedNodeData.description}
                </p>

                <div className="mb-4">
                  <h4 className="text-white font-medium text-sm mb-2">Principais funções:</h4>
                  <ul className="space-y-1">
                    {focusedNodeData.functions.map((func, i) => (
                      <li key={i} className="text-white/70 text-xs flex items-start gap-2">
                        <span className="rounded-full bg-blue-500/30 h-4 w-4 flex-shrink-0 flex items-center justify-center mt-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                        </span>
                        {func}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="text-white font-medium text-sm mb-2">Exemplo real:</h4>
                  <p className="text-white/70 text-xs italic bg-white/5 p-2 rounded-lg">
                    "{focusedNodeData.example}"
                  </p>
                </div>

                <button 
                  className="w-full py-2 px-4 bg-gradient-to-r from-[#0D23A0] to-[#5B21BD] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Explorar {focusedNodeData.name}
                </button>
              </div>

              {/* Botão de fechar */}
              <button 
                className="absolute top-2 right-2 text-white/70 hover:text-white"
                onClick={handleCloseFocus}
              >
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botão de voltar (quando algum nódulo está em foco) */}
        <AnimatePresence>
          {focusedNodule && (
            <motion.button
              className="absolute bottom-4 left-4 flex items-center gap-1 text-white/70 hover:text-white bg-white/10 px-3 py-1.5 rounded-full text-sm"
              onClick={handleCloseFocus}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeft size={16} />
              <span>Voltar ao Hub</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TurboHubConnected;
