
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { Brain, Network, Database, Lightbulb, Sparkles, FileCode, BookOpen, Globe, Cpu } from "lucide-react";

const IAHubConnected: React.FC = () => {
  const { theme } = useTheme();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = theme === "dark";

  // Simular a ativação de um módulo aleatório a cada 3 segundos
  useEffect(() => {
    const moduleNames = ["research", "code", "documents", "knowledge", "tools", "analysis", "web"];
    let timeoutId: NodeJS.Timeout;
    
    const activateRandomModule = () => {
      const randomModule = moduleNames[Math.floor(Math.random() * moduleNames.length)];
      setActiveModule(randomModule);
      
      // Desativar após 1.5 segundos
      setTimeout(() => {
        setActiveModule(null);
      }, 1500);
      
      // Agendar próxima ativação
      timeoutId = setTimeout(activateRandomModule, 3000);
    };
    
    // Iniciar ciclo
    timeoutId = setTimeout(activateRandomModule, 2000);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // Posições dos nódulos - ajustadas para maior espaçamento e alinhamento
  const modules = [
    { 
      id: "core", 
      name: "IA Core", 
      icon: <Cpu className="w-6 h-6 text-white" />, 
      x: 50, // centro
      y: 50, 
      color: "#4A0D9F" 
    },
    { 
      id: "research", 
      name: "Research Hub", 
      icon: <Brain className="w-5 h-5 text-white" />, 
      x: 20, // esquerda
      y: 15, 
      color: "#0D23A0",
      connectionStrength: 0.8
    },
    { 
      id: "code", 
      name: "Code Analyzer", 
      icon: <FileCode className="w-5 h-5 text-white" />, 
      x: 80, // direita
      y: 15, 
      color: "#1230CC",
      connectionStrength: 0.9
    },
    { 
      id: "documents", 
      name: "Document Analysis", 
      icon: <BookOpen className="w-5 h-5 text-white" />, 
      x: 30, // esquerda-centro
      y: 85, 
      color: "#5B21BD",
      connectionStrength: 0.7
    },
    { 
      id: "knowledge", 
      name: "Knowledge Base", 
      icon: <Database className="w-5 h-5 text-white" />, 
      x: 74, // direita-centro
      y: 80, 
      color: "#4A0D9F",
      connectionStrength: 0.95
    },
    { 
      id: "tools", 
      name: "Tools Library", 
      icon: <Sparkles className="w-5 h-5 text-white" />, 
      x: 62, // direita-baixo
      y: 40, 
      color: "#0D23A0",
      connectionStrength: 0.85
    },
    { 
      id: "analysis", 
      name: "Deep Analysis", 
      icon: <Lightbulb className="w-5 h-5 text-white" />, 
      x: 35, // esquerda-meio
      y: 40, 
      color: "#1230CC",
      connectionStrength: 0.8
    },
    { 
      id: "web", 
      name: "Web Integration", 
      icon: <Globe className="w-5 h-5 text-white" />, 
      x: 50, // centro-baixo
      y: 65, 
      color: "#5B21BD",
      connectionStrength: 0.75
    }
  ];

  // Função para desenhar uma linha com glow
  const drawLine = (x1: number, y1: number, x2: number, y2: number, strength: number = 1, active: boolean = false) => {
    if (!containerRef.current) return null;
    
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    
    const startX = (x1 / 100) * containerWidth;
    const startY = (y1 / 100) * containerHeight;
    const endX = (x2 / 100) * containerWidth;
    const endY = (y2 / 100) * containerHeight;
    
    // Calcular comprimento e ângulo da linha
    const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
    
    // Posicionar no ponto médio
    const midX = startX + (endX - startX) / 2 - length / 2;
    const midY = startY + (endY - startY) / 2;
    
    const baseOpacity = strength * 0.6;
    const activeOpacity = active ? 1 : baseOpacity;
    
    return (
      <motion.div 
        className="absolute h-[1.5px] origin-left"
        style={{
          left: midX,
          top: midY,
          width: length,
          transform: `rotate(${angle}deg)`,
          background: `linear-gradient(90deg, rgba(18,48,204,${activeOpacity}) 0%, rgba(74,13,159,${activeOpacity}) 100%)`,
          boxShadow: active ? `0 0 8px 1px rgba(74,13,159,0.6)` : `0 0 2px rgba(74,13,159,${baseOpacity * 0.5})`,
          opacity: active ? 1 : baseOpacity,
          zIndex: 1
        }}
        animate={{
          opacity: active ? [baseOpacity, 1, baseOpacity] : baseOpacity,
          boxShadow: active ? 
            ['0 0 2px rgba(74,13,159,0.3)', '0 0 8px 2px rgba(74,13,159,0.6)', '0 0 2px rgba(74,13,159,0.3)'] : 
            `0 0 2px rgba(74,13,159,${baseOpacity * 0.5})`
        }}
        transition={{
          duration: active ? 1.5 : 0.3,
          ease: "easeInOut"
        }}
      />
    );
  };
  
  return (
    <div className="w-full px-4 mb-4">
      <motion.div 
        className={`relative w-full h-[180px] rounded-xl ${
          isDark ? 'bg-gradient-to-r from-[#050e1d] to-[#0d1a30]' : 'bg-gradient-to-r from-[#0c2341] to-[#0f3562]'
        } shadow-lg overflow-hidden`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        ref={containerRef}
      >
        {/* Background grid pattern */}
        <div className="absolute inset-0 bg-[url('/images/pattern-grid.svg')] bg-repeat opacity-10"></div>
        
        {/* Background glow effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D23A0]/5 via-transparent to-[#4A0D9F]/5"></div>
        
        {/* Title */}
        <div className="absolute top-3 left-4 flex items-center gap-2 z-10">
          <Network className="w-5 h-5 text-[#1230CC]" />
          <h3 className="text-white text-sm font-medium">Hub Conectado</h3>
          <div className="flex items-center ml-1">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-xs text-green-400 ml-1">Ativo</span>
          </div>
        </div>
        
        {/* Core module - always fully opaque */}
        {modules.map(module => {
          const isActive = activeModule === module.id || module.id === "core";
          const isCore = module.id === "core";
          
          return (
            <motion.div
              key={module.id}
              className="absolute z-20"
              style={{
                left: `${module.x}%`,
                top: `${module.y}%`,
                transform: "translate(-50%, -50%)"
              }}
              initial={{ scale: isCore ? 1 : 0.95, opacity: isCore ? 1 : 0.7 }}
              animate={{ 
                scale: isActive ? 1.1 : isCore ? 1 : 0.95,
                opacity: isActive ? 1 : isCore ? 1 : 0.7,
                boxShadow: isActive ? `0 0 15px ${module.color}` : `0 0 5px ${module.color}40`
              }}
              transition={{ duration: 0.3 }}
            >
              <div 
                className={`rounded-full flex items-center justify-center relative cursor-pointer group ${
                  isCore ? 'w-14 h-14' : 'w-10 h-10'
                }`}
              >
                {/* Glow effect behind node */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{ 
                    background: `radial-gradient(circle, ${module.color}70 0%, ${module.color}00 70%)`,
                    opacity: isActive ? 0.8 : 0.3,
                    transform: `scale(${isActive ? 1.5 : 1.2})`,
                    transition: "all 0.3s ease"
                  }}
                ></div>
                
                {/* Node background */}
                <div 
                  className={`absolute inset-0 rounded-full ${
                    isCore ? 'bg-gradient-to-br from-[#0D23A0] to-[#4A0D9F]' : 'bg-gradient-to-br'
                  } border border-white/20`}
                  style={{ 
                    background: !isCore ? `linear-gradient(135deg, ${module.color}, ${module.color}99)` : undefined,
                    boxShadow: `0 0 ${isActive ? '10px' : '5px'} ${isActive ? '3px' : '1px'} ${module.color}${isActive ? '90' : '40'}`
                  }}
                ></div>
                
                {/* Icon */}
                <div className="relative z-10">
                  {module.icon}
                </div>
                
                {/* Tooltip */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-[#0c2341] text-white text-xs py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none z-30">
                  {module.name}
                </div>
                
                {/* Pulse animation for active node */}
                {isActive && !isCore && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2"
                    style={{ borderColor: module.color }}
                    initial={{ opacity: 0.7, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.5 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                
                {/* Special pulse animation for core */}
                {isCore && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-[#1230CC]"
                      initial={{ opacity: 0.7, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.8 }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-[#4A0D9F]"
                      initial={{ opacity: 0.5, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.5 }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
        
        {/* Connection lines */}
        {modules
          .filter(module => module.id !== "core")
          .map(module => {
            const isActive = activeModule === module.id;
            return drawLine(
              modules.find(m => m.id === "core")!.x,
              modules.find(m => m.id === "core")!.y,
              module.x,
              module.y,
              module.connectionStrength,
              isActive
            );
          })}
        
        {/* Cross-connections between secondary nodes */}
        {drawLine(
          modules.find(m => m.id === "research")!.x,
          modules.find(m => m.id === "research")!.y,
          modules.find(m => m.id === "knowledge")!.x,
          modules.find(m => m.id === "knowledge")!.y,
          0.4,
          activeModule === "research" || activeModule === "knowledge"
        )}
        
        {drawLine(
          modules.find(m => m.id === "code")!.x,
          modules.find(m => m.id === "code")!.y,
          modules.find(m => m.id === "tools")!.x,
          modules.find(m => m.id === "tools")!.y,
          0.4,
          activeModule === "code" || activeModule === "tools"
        )}
        
        {drawLine(
          modules.find(m => m.id === "analysis")!.x,
          modules.find(m => m.id === "analysis")!.y,
          modules.find(m => m.id === "documents")!.x,
          modules.find(m => m.id === "documents")!.y,
          0.4,
          activeModule === "analysis" || activeModule === "documents"
        )}
        
        {drawLine(
          modules.find(m => m.id === "web")!.x,
          modules.find(m => m.id === "web")!.y,
          modules.find(m => m.id === "tools")!.x,
          modules.find(m => m.id === "tools")!.y,
          0.3,
          activeModule === "web" || activeModule === "tools"
        )}
        
        {/* Stats & info in the corner */}
        <div className="absolute bottom-3 right-4 flex items-end justify-end">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-xs text-[#1230CC]">
              <div className="h-1.5 w-1.5 rounded-full bg-[#1230CC] animate-pulse"></div>
              <span>Processamento neuronal</span>
            </div>
            <div className="text-white text-xs opacity-80 mt-0.5">
              <span className="font-mono">750k</span> parâmetros ativos
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default IAHubConnected;
