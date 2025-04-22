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
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * containerWidth,
      y: Math.random() * containerHeight,
      size: Math.random() * 2 + 1,
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
          x: particle.x + (Math.random() - 0.5) * 0.5,
          // Resetar partícula quando sai da tela
          ...(particle.y < 0 ? {
            y: containerHeight,
            x: Math.random() * containerWidth
          } : {})
        }))
      );
    };

    const animationFrame = setInterval(animateParticles, 50);

    return () => clearInterval(animationFrame);
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
    <div className="w-full mx-auto p-4 mt-1 mb-3">
      <div 
        ref={containerRef}
        className="relative min-h-[450px] w-full bg-gradient-to-r from-[#050e1d] to-[#0d1a30] rounded-2xl shadow-xl border border-white/5 overflow-hidden"
        style={{ zIndex: 10 }} // Set a lower z-index for the hub container
      >
        {/* Partículas de fundo */}
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

        {/* Grade de fundo */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0"></div>

        {/* Linhas de conexão - Versão Ultra Tecnológica */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-30 neural-connections">
          <defs>
            <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0D23A0" stopOpacity="1" />
              <stop offset="50%" stopColor="#4A2DB9" stopOpacity="1" />
              <stop offset="100%" stopColor="#5B21BD" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1230CC" stopOpacity="1" />
              <stop offset="50%" stopColor="#3526B5" stopOpacity="1" />
              <stop offset="100%" stopColor="#4A0D9F" stopOpacity="1" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Padrão de traços para linhas tecnológicas */}
            <pattern id="techPattern" x="0" y="0" width="8" height="1" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="4" y2="0" stroke="#6246EA" strokeWidth="1" />
            </pattern>

            {/* Marcadores para as linhas */}
            <marker id="dot" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="4" markerHeight="4">
              <circle cx="4" cy="4" r="3" fill="#8A63E8" />
            </marker>

            {/* Novo filtro de brilho mais intenso */}
            <filter id="strongGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Linhas conectando nódulos ao centro - Estilo ultra tecnológico */}
          {nodules.map((nodule, index) => {
            const angle = (index * (2 * Math.PI / nodules.length));
            const isActive = focusedNodule === null || focusedNodule === nodule.id;

            // Cálculos para curvas Bezier estilizadas
            const centerX = 50;
            const centerY = 50;
            const endX = 50 + 35 * Math.cos(angle);
            const endY = 50 + 35 * Math.sin(angle);

            // Pontos de controle para curva elegante
            const ctrlDist = 25;
            const ctrlX1 = centerX + ctrlDist * Math.cos(angle + 0.2);
            const ctrlY1 = centerY + ctrlDist * Math.sin(angle + 0.2);
            const ctrlX2 = endX - 10 * Math.cos(angle - 0.2);
            const ctrlY2 = endY - 10 * Math.sin(angle - 0.2);

            return (
              <g key={nodule.id} 
                 filter={isActive ? "url(#glow)" : ""} 
                 opacity={isActive ? 1 : 0.3} 
                 className="transition-opacity duration-500">

                {/* Linha curva principal - estilo tecnológico */}
                <path 
                  d={`M ${centerX}% ${centerY}% C ${ctrlX1}% ${ctrlY1}%, ${ctrlX2}% ${ctrlY2}%, ${endX}% ${endY}%`}
                  stroke={`url(#lineGradient${index % 2 + 1})`}
                  strokeWidth="2"
                  strokeDasharray={isActive ? "5,3" : "3,2"}
                  fill="none"
                  className="tech-line transition-all duration-500"
                  filter="url(#glow)"
                />

                {/* Linha brilhante de destaque */}
                <path 
                  d={`M ${centerX}% ${centerY}% C ${ctrlX1}% ${ctrlY1}%, ${ctrlX2}% ${ctrlY2}%, ${endX}% ${endY}%`}
                  stroke="#8A63E8"
                  strokeWidth="1"
                  strokeDasharray="1,12"
                  strokeLinecap="round"
                  fill="none"
                  opacity="1"
                  className="tech-highlight"
                  filter="url(#strongGlow)"
                />

                {/* Pontos de dados nas linhas - animados */}
                {[0.2, 0.5, 0.8].map((pos, i) => (
                  <motion.circle 
                    key={`dot-${index}-${i}`}
                    cx={`${centerX + (endX - centerX) * pos}%`}
                    cy={`${centerY + (endY - centerY) * pos}%`}
                    r={isActive ? "1.2" : "0.8"}
                    fill={i === 1 ? "#8A63E8" : "#4A0D9F"}
                    initial={{ opacity: 0.3 }}
                    animate={{ 
                      opacity: [0.3, 0.8, 0.3],
                      r: isActive ? ["1.2px", "1.8px", "1.2px"] : ["0.8px", "1.2px", "0.8px"]
                    }}
                    transition={{ 
                      repeat: Infinity,
                      duration: 1.5 + (i * 0.5),
                      delay: index * 0.1 + i * 0.2,
                      ease: "easeInOut"
                    }}
                  />
                ))}

                {/* Partícula fluindo do nódulo para o centro - visualização de dados */}
                <motion.circle 
                  cx="0%"
                  cy="0%"
                  r="1.5"
                  fill="#8A63E8"
                  filter="url(#glow)"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: [0, 0.9, 0],
                    cx: [`${endX}%`, `${centerX}%`],
                    cy: [`${endY}%`, `${centerY}%`] 
                  }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 3 + index * 0.5,
                    delay: index * 0.8,
                    ease: "linear"
                  }}
                />

                {/* Conector no final da linha */}
                <circle 
                  cx={`${endX}%`} 
                  cy={`${endY}%`} 
                  r="0.8" 
                  fill={isActive ? "#8A63E8" : "#4A0D9F"} 
                  className="transition-all duration-300"
                />
              </g>
            );
          })}
        </svg>

        {/* Núcleo central */}
        <motion.div 
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 ${
            focusedNodule ? 'opacity-50 blur-sm' : 'opacity-100'
          } transition-all duration-500`}
          animate={{
            boxShadow: ['0 0 15px rgba(13, 35, 160, 0.5)', '0 0 25px rgba(91, 33, 189, 0.7)', '0 0 15px rgba(13, 35, 160, 0.5)']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear"
          }}
        >
          <div className="relative w-24 h-24 rounded-[20px] bg-gradient-to-br from-[#2B27A9] to-[#3C2BD6] flex items-center justify-center shadow-2xl">
            <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-[#0D23A0]/30 to-[#5B21BD]/30 blur-lg animate-pulse"></div>
            <span className="text-white font-bold text-xl relative z-10">
              <div className="flex items-center justify-center flex-col">
                <Sparkles className="h-6 w-6 text-white mb-1" />
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
            <div key={nodule.id} style={positionStyle} className="absolute -translate-x-1/2 -translate-y-1/2 z-10">
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
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${nodule.color} flex items-center justify-center shadow-xl cursor-pointer border border-white/20`}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  {nodule.icon}
                </motion.div>
                <div className="text-center mt-2 text-white text-sm font-medium max-w-[100px] mx-auto">
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
              className="absolute right-8 top-10 z-50 bg-gradient-to-r from-[#0c2341]/80 to-[#0f3562]/80 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl max-w-xs" // Increased z-index here
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