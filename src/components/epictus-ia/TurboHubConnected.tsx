
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, PenSquare, Book, Calendar, UserRound, X, ArrowLeft } from "lucide-react";

// Interface para os nódulos
interface NoduleProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  functions: string[];
  example: string;
  color: string;
}

// Componente de Nódulo
const Nodule: React.FC<{
  nodule: NoduleProps;
  isActive: boolean;
  onClick: () => void;
  position: { x: string; y: string };
}> = ({ nodule, isActive, onClick, position }) => {
  return (
    <motion.div
      className={`absolute ${position.x} ${position.y} transition-all duration-500`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: isActive ? 1.4 : 1,
        filter: isActive ? "drop-shadow(0 0 12px rgba(100, 100, 255, 0.8))" : "none",
        zIndex: isActive ? 50 : 10
      }}
      whileHover={{ scale: isActive ? 1.4 : 1.1 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <motion.div
        className={`relative cursor-pointer w-14 h-14 rounded-full 
                  bg-gradient-to-br ${nodule.color} 
                  flex items-center justify-center shadow-lg border border-white/10 
                  overflow-hidden backdrop-blur-sm`}
        onClick={onClick}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div 
          className="absolute inset-0 bg-grid-pattern opacity-20"
          animate={{ 
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{ 
            duration: 20, 
            ease: "linear", 
            repeat: Infinity,
          }}
        />
        <div className="text-white">
          {nodule.icon}
        </div>
        
        {/* Partículas dentro do nódulo */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              initial={{ 
                x: Math.random() * 100 - 50,
                y: Math.random() * 100 - 50,
                opacity: 0.2
              }}
              animate={{ 
                x: Math.random() * 100 - 50,
                y: Math.random() * 100 - 50,
                opacity: [0.2, 0.8, 0.2]
              }}
              transition={{ 
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          ))}
        </div>
      </motion.div>
      
      <motion.div 
        className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-center font-medium text-white/80 w-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0.8 }}
        transition={{ duration: 0.3 }}
      >
        {nodule.title}
      </motion.div>
    </motion.div>
  );
};

// Componente de linha de conexão
const ConnectionLine: React.FC<{ 
  start: { x: number, y: number }, 
  end: { x: number, y: number },
  isActive: boolean,
  thickness?: number
}> = ({ start, end, isActive, thickness = 2 }) => {
  // Cálculo da distância e ângulo
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  
  // Posicionamento e rotação da linha
  const style = {
    width: `${length}px`,
    left: `${start.x}px`,
    top: `${start.y}px`,
    transform: `rotate(${angle}deg)`,
    transformOrigin: '0 50%',
  };
  
  return (
    <motion.div
      className="absolute h-px"
      style={style}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: isActive ? 0.8 : 0.3,
        height: `${thickness}px`,
        filter: isActive ? 'brightness(1.5)' : 'brightness(1)'
      }}
      transition={{ duration: 0.5 }}
    >
      <div className={`w-full h-full bg-gradient-to-r from-blue-500/50 to-indigo-600/50`}></div>
      
      {/* Partículas que percorrem a linha */}
      <AnimatePresence>
        {isActive && (
          <motion.div 
            className="absolute top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400 shadow-glow"
            initial={{ left: 0, opacity: 0 }}
            animate={{ 
              left: '100%', 
              opacity: [0, 1, 0] 
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              repeatType: "loop",
              ease: "linear"
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Detalhes do nódulo
const NoduleDetails: React.FC<{ 
  nodule: NoduleProps; 
  onClose: () => void 
}> = ({ nodule, onClose }) => {
  return (
    <motion.div
      className="absolute right-5 top-1/2 transform -translate-y-1/2 max-w-xs w-full bg-gradient-to-br from-slate-900/80 to-blue-950/80 
                backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ type: "spring", duration: 0.4 }}
    >
      <div className="relative p-5">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        <button 
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-slate-800/70 flex items-center justify-center hover:bg-slate-700/90 transition-colors text-white/80"
          onClick={onClose}
        >
          <X size={14} />
        </button>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-10 h-10 rounded-full ${nodule.color} flex items-center justify-center shadow-md`}>
              {nodule.icon}
            </div>
            <h3 className="text-white text-lg font-semibold">{nodule.title}</h3>
          </div>
          
          <p className="text-white/80 text-sm mb-4">{nodule.description}</p>
          
          <div className="mb-4">
            <h4 className="text-white/90 text-sm font-medium mb-2">Principais funções:</h4>
            <ul className="text-white/70 text-xs space-y-1">
              {nodule.functions.map((func, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>{func}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mb-4">
            <h4 className="text-white/90 text-sm font-medium mb-1">Exemplo:</h4>
            <div className="text-white/70 text-xs p-2 bg-slate-950/50 rounded-lg border border-white/5">
              {nodule.example}
            </div>
          </div>
          
          <button 
            className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium
                      hover:from-blue-500 hover:to-indigo-500 transition-colors shadow-lg"
          >
            Explorar {nodule.title}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Componente principal Hub Conectado
const TurboHubConnected: React.FC = () => {
  const [activeNodule, setActiveNodule] = useState<string | null>(null);
  const [hubOpacity, setHubOpacity] = useState(1);
  const [positions, setPositions] = useState<{[key: string]: { x: number, y: number }}>({});
  
  // Nódulos disponíveis
  const nodules: NoduleProps[] = [
    {
      id: "simulador",
      icon: <Brain size={24} />,
      title: "Simulador de Questões",
      description: "Crie provas com dificuldade adaptativa e análise BNCC.",
      functions: [
        "Geração de questões por tema e habilidade",
        "Feedback pós-questão com explicações",
        "Histórico e gráficos de evolução"
      ],
      example: "Prova de Matemática com 5 questões discursivas de geometria analítica + explicações visuais.",
      color: "from-purple-700 to-indigo-800"
    },
    {
      id: "redacao",
      icon: <PenSquare size={24} />,
      title: "Copilot de Redação",
      description: "Revisa, escreve e melhora redações com IA avançada.",
      functions: [
        "Correção por competências",
        "Sugestões de melhoria e exemplos",
        "Análise de coerência e coesão"
      ],
      example: "Correção de redação sobre tecnologia com feedback detalhado em cada parágrafo.",
      color: "from-amber-600 to-orange-700"
    },
    {
      id: "resumo",
      icon: <Book size={24} />,
      title: "Resumo Ilustrado",
      description: "Gera mapas mentais e resumos com imagens explicativas.",
      functions: [
        "Síntese de conteúdos extensos",
        "Visualização de conceitos complexos",
        "Organização hierárquica de informações"
      ],
      example: "Mapa mental sobre sistema nervoso com ilustrações das áreas cerebrais e suas funções.",
      color: "from-emerald-600 to-teal-700"
    },
    {
      id: "planejador",
      icon: <Calendar size={24} />,
      title: "Planejador Inteligente",
      description: "Cria cronogramas e planos de estudo automatizados personalizados.",
      functions: [
        "Organização por prioridade e dificuldade",
        "Distribuição inteligente de tempo",
        "Adaptação baseada em progresso"
      ],
      example: "Plano de 30 dias para o ENEM com foco em suas áreas mais fracas e revisões espaçadas.",
      color: "from-blue-600 to-cyan-700"
    },
    {
      id: "criador",
      icon: <UserRound size={24} />,
      title: "Criador de Aula",
      description: "Monta aulas completas com IA + material visual para professores.",
      functions: [
        "Geração de planos de aula estruturados",
        "Material complementar personalizado",
        "Atividades e avaliações integradas"
      ],
      example: "Aula sobre história do Brasil com slides, textos de apoio e atividades práticas para 50 minutos.",
      color: "from-rose-600 to-pink-700"
    }
  ];
  
  // Posições dos nódulos em relação ao núcleo
  const nodulePositions = {
    "simulador": { x: "top-8 left-10", y: "top-8 left-10" },
    "redacao": { x: "top-24 right-10", y: "top-24 right-10" },
    "resumo": { x: "bottom-24 left-14", y: "bottom-24 left-14" },
    "planejador": { x: "bottom-8 left-1/2", y: "bottom-8 left-1/2" },
    "criador": { x: "top-20 left-1/3", y: "top-20 left-1/3" }
  };
  
  // Calcula as coordenadas para as linhas de conexão
  useEffect(() => {
    const hubElement = document.getElementById("epictusTurboHub");
    if (!hubElement) return;
    
    const hubRect = hubElement.getBoundingClientRect();
    const hubCenterX = hubRect.width / 2;
    const hubCenterY = hubRect.height / 2;
    
    // Coordenadas do núcleo
    const centerPos = { 
      x: hubCenterX, 
      y: hubCenterY 
    };
    
    // Obter posições dos nódulos no DOM
    const nodePositions: {[key: string]: { x: number, y: number }} = { core: centerPos };
    
    nodules.forEach(nodule => {
      const element = document.getElementById(`nodule-${nodule.id}`);
      if (element) {
        const rect = element.getBoundingClientRect();
        const relativeRect = {
          x: rect.left - hubRect.left + rect.width / 2,
          y: rect.top - hubRect.top + rect.height / 2
        };
        nodePositions[nodule.id] = relativeRect;
      }
    });
    
    setPositions(nodePositions);
  }, [activeNodule]);
  
  // Manipula clique no nódulo
  const handleNoduleClick = (id: string) => {
    if (activeNodule === id) {
      setActiveNodule(null);
      setHubOpacity(1);
    } else {
      setActiveNodule(id);
      setHubOpacity(0.6);
    }
  };
  
  // Manipula o botão de voltar
  const handleBackToHub = () => {
    setActiveNodule(null);
    setHubOpacity(1);
  };
  
  return (
    <div className="w-full max-w-5xl mx-auto my-4 px-4 relative">
      <motion.div 
        id="epictusTurboHub"
        className="relative w-full h-64 rounded-xl bg-gradient-to-r from-[#050e1d]/95 to-[#071428]/95 overflow-hidden border border-white/5 shadow-xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Partículas flutuantes de fundo */}
        <div className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: Math.random() * 100 + "%", 
                opacity: Math.random() * 0.5 + 0.1 
              }}
              animate={{ 
                y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                opacity: [0.1, 0.5, 0.1]
              }}
              transition={{ 
                duration: 5 + Math.random() * 15, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          ))}
        </div>
        
        {/* Linhas de conexão */}
        <div className="absolute inset-0">
          {Object.keys(positions).length > 0 && 
            nodules.map(nodule => {
              const corePos = positions.core;
              const nodulePos = positions[nodule.id];
              
              if (corePos && nodulePos) {
                return (
                  <ConnectionLine 
                    key={`line-${nodule.id}`}
                    start={corePos}
                    end={nodulePos}
                    isActive={activeNodule === nodule.id || !activeNodule}
                  />
                );
              }
              return null;
            })
          }
        </div>
        
        {/* Núcleo central */}
        <motion.div 
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
          animate={{ 
            scale: activeNodule ? 0.9 : 1, 
            opacity: hubOpacity,
            filter: activeNodule ? "blur(2px)" : "none"
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <motion.div
              className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] flex items-center justify-center shadow-xl border border-indigo-500/30 overflow-hidden"
              animate={{ 
                rotate: 360,
                boxShadow: [
                  "0 0 10px rgba(93, 63, 211, 0.5)",
                  "0 0 25px rgba(93, 63, 211, 0.7)",
                  "0 0 10px rgba(93, 63, 211, 0.5)"
                ]
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                boxShadow: { duration: 2, repeat: Infinity, repeatType: "reverse" }
              }}
            >
              <motion.div
                className="absolute inset-0 bg-grid-pattern opacity-20"
                animate={{ 
                  backgroundPosition: ["0% 0%", "100% 100%"],
                }}
                transition={{ 
                  duration: 10, 
                  ease: "linear", 
                  repeat: Infinity,
                }}
              />
              
              <motion.div 
                className="text-white text-xl font-bold"
                animate={{ scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                IA
              </motion.div>
              
              {/* Efeito de onda circular animada */}
              <motion.div
                className="absolute inset-0 rounded-xl border-4 border-white/10"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0, 0.1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              />
            </motion.div>
            
            <motion.div 
              className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 text-xs text-center font-medium text-white/90 whitespace-nowrap"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Epictus Turbo
            </motion.div>
          </div>
        </motion.div>
        
        {/* Nódulos ao redor */}
        <div className="absolute inset-0">
          {nodules.map((nodule) => (
            <div id={`nodule-${nodule.id}`} key={nodule.id} className="absolute" style={{ 
              [nodulePositions[nodule.id].x.split(' ')[0]]: nodulePositions[nodule.id].x.split(' ')[1], 
              [nodulePositions[nodule.id].y.split(' ')[0]]: nodulePositions[nodule.id].y.split(' ')[1]
            }}>
              <Nodule 
                nodule={nodule}
                isActive={activeNodule === nodule.id}
                onClick={() => handleNoduleClick(nodule.id)}
                position={{ x: "", y: "" }}
              />
            </div>
          ))}
        </div>
        
        {/* Botão voltar quando um nódulo está ativo */}
        <AnimatePresence>
          {activeNodule && (
            <motion.button
              className="absolute top-4 left-4 z-50 py-1.5 px-3 flex items-center gap-1.5 bg-slate-800/60 hover:bg-slate-700/80 
                        text-white text-xs font-medium rounded-lg border border-white/10 backdrop-blur-sm"
              onClick={handleBackToHub}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              <ArrowLeft size={14} />
              <span>Voltar ao Hub</span>
            </motion.button>
          )}
        </AnimatePresence>
        
        {/* Detalhes do nódulo ativo */}
        <AnimatePresence>
          {activeNodule && (
            <NoduleDetails 
              nodule={nodules.find(n => n.id === activeNodule)!}
              onClose={handleBackToHub}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default TurboHubConnected;
