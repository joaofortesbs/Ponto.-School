
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { Zap, FileText, User, Database, BrainCircuit, Search } from "lucide-react";

const TurboAdvancedHubConnected: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<{[key: string]: {x: number, y: number}}>({}); 
  const [isPulsing, setIsPulsing] = useState(true);

  // Simulate nodes connecting to the hub
  useEffect(() => {
    // Stop pulsing animation after 3 seconds to indicate fully connected
    const timer = setTimeout(() => {
      setIsPulsing(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Calculate node positions (in a real implementation, this would be more dynamic)
  useEffect(() => {
    setNodePositions({
      'notes': { x: -120, y: -80 },
      'profile': { x: 120, y: -80 },
      'database': { x: -120, y: 80 },
      'ai': { x: 120, y: 80 },
      'search': { x: 0, y: -110 },
    });
  }, []);

  // Node definition and data
  const nodes = [
    { 
      id: 'notes', 
      icon: <FileText className="h-5 w-5" />,
      title: 'Anotações',
      description: 'Suas anotações e resumos integrados',
      color: '#0D23A0' 
    },
    { 
      id: 'profile', 
      icon: <User className="h-5 w-5" />,
      title: 'Perfil',
      description: 'Seu progresso e preferências de aprendizado',
      color: '#1230CC' 
    },
    { 
      id: 'database', 
      icon: <Database className="h-5 w-5" />,
      title: 'Banco de Dados',
      description: 'Conteúdo personalizado para você',
      color: '#2941FF' 
    },
    { 
      id: 'ai', 
      icon: <BrainCircuit className="h-5 w-5" />,
      title: 'IA Avançada',
      description: 'Modelos de linguagem avançados',
      color: '#4A0D9F' 
    },
    { 
      id: 'search', 
      icon: <Search className="h-5 w-5" />,
      title: 'Pesquisa',
      description: 'Acesso à informações precisas',
      color: '#5B21BD' 
    },
  ];

  return (
    <div className="w-full px-4 mb-3">
      <div className="hub-connected-width mx-auto relative h-[200px]">
        {/* Center hub */}
        <motion.div 
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            {/* Pulsing effect */}
            <AnimatePresence>
              {isPulsing && (
                <motion.div 
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-[#0D23A0] to-[#4A0D9F] opacity-70"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                />
              )}
            </AnimatePresence>
            
            {/* Main hub */}
            <motion.div
              className={`w-14 h-14 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#4A0D9F] flex items-center justify-center shadow-lg border-2 ${isDark ? 'border-[#0c2341]' : 'border-white/30'}`}
              animate={{
                boxShadow: isPulsing 
                  ? ['0 0 10px rgba(74, 13, 159, 0.5)', '0 0 20px rgba(74, 13, 159, 0.7)', '0 0 10px rgba(74, 13, 159, 0.5)']
                  : '0 0 15px rgba(74, 13, 159, 0.6)'
              }}
              transition={{
                duration: 2,
                repeat: isPulsing ? Infinity : 0,
                repeatType: "reverse"
              }}
            >
              <Zap className="h-7 w-7 text-white" />
            </motion.div>
          </div>
        </motion.div>

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0D23A0" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#4A0D9F" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          
          {/* Draw connection lines from center to each node */}
          {nodes.map((node) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;
            
            const centerX = 50; // Percentage
            const centerY = 50; // Percentage
            const nodeX = centerX + (pos.x / 3); // Convert from pixels to percentage
            const nodeY = centerY + (pos.y / 3); // Convert from pixels to percentage
            
            const isActive = activeNode === node.id || hoverNode === node.id;
            
            return (
              <motion.line 
                key={`line-${node.id}`}
                x1={`${centerX}%`}
                y1={`${centerY}%`}
                x2={`${nodeX}%`}
                y2={`${nodeY}%`}
                stroke={isActive ? node.color : "url(#lineGradient)"}
                strokeWidth={isActive ? 2.5 : 1.5}
                strokeDasharray={isActive ? "none" : "5,5"}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 0.7,
                  strokeWidth: isActive ? 2.5 : 1.5,
                }}
                transition={{ 
                  duration: 0.5,
                  delay: 0.2 + (Number(node.id.charCodeAt(0)) % 5) * 0.1 // Stagger effect
                }}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node, index) => {
          const pos = nodePositions[node.id];
          if (!pos) return null;
          
          const isActive = activeNode === node.id;
          const isHovered = hoverNode === node.id;
          
          return (
            <motion.div
              key={node.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
              style={{ 
                left: `calc(50% + ${pos.x}px)`, 
                top: `calc(50% + ${pos.y}px)` 
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                x: isActive || isHovered ? -5 : 0,
                y: isActive || isHovered ? -5 : 0,
              }}
              transition={{ 
                duration: 0.5, 
                delay: 0.3 + index * 0.1 // Stagger the animations
              }}
              onMouseEnter={() => setHoverNode(node.id)}
              onMouseLeave={() => setHoverNode(null)}
              onClick={() => setActiveNode(isActive ? null : node.id)}
            >
              <div className="relative group">
                {/* Node circle */}
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer shadow-md transition-all duration-300 border-2`}
                  style={{ 
                    background: `linear-gradient(135deg, ${node.color}90, ${node.color})`,
                    borderColor: isDark ? '#0c2341' : 'rgba(255, 255, 255, 0.3)'
                  }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: isActive || isHovered
                      ? `0 0 15px ${node.color}90`
                      : `0 0 5px ${node.color}40`
                  }}
                >
                  <motion.div
                    animate={{ 
                      scale: isActive || isHovered ? 1.2 : 1,
                      rotate: isActive ? [0, 10, -10, 0] : 0
                    }}
                    transition={{ duration: 0.3 }}
                    className="text-white"
                  >
                    {node.icon}
                  </motion.div>
                </motion.div>

                {/* Tooltip */}
                <AnimatePresence>
                  {(isActive || isHovered) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute ${pos.y < 0 ? 'bottom-full mb-2' : 'top-full mt-2'} ${pos.x < 0 ? 'right-0' : pos.x > 0 ? 'left-0' : 'left-1/2 -translate-x-1/2'} w-48 bg-gradient-to-r from-[#0c2341] to-[#0f3562] p-3 rounded-lg shadow-xl border border-white/10 z-30`}
                    >
                      <div className="flex flex-col">
                        <span className="text-white font-medium text-sm">{node.title}</span>
                        <span className="text-white/70 text-xs mt-1">{node.description}</span>
                      </div>
                      {/* Triangle indicator */}
                      <div 
                        className={`absolute ${pos.y < 0 ? 'top-full' : 'bottom-full'} ${pos.x < 0 ? 'right-3' : pos.x > 0 ? 'left-3' : 'left-1/2 -translate-x-1/2'} w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent ${pos.y < 0 ? 'border-t-[8px] border-t-[#0c2341]' : 'border-b-[8px] border-b-[#0f3562]'}`}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TurboAdvancedHubConnected;
