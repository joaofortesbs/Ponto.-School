
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedBackgroundProps {
  children: React.ReactNode;
}

export function AnimatedBackground({ children }: AnimatedBackgroundProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<{ x: number; y: number; size: number; connections: number[] }[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Inicializa os nós da teia
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
        
        // Cria nós baseados no tamanho do container
        const nodeCount = Math.floor((width * height) / 20000);
        const newNodes = [];
        
        for (let i = 0; i < nodeCount; i++) {
          newNodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 1,
            connections: []
          });
        }
        
        // Determina conexões entre nós
        newNodes.forEach((node, index) => {
          const connections: number[] = [];
          for (let j = 0; j < newNodes.length; j++) {
            if (j !== index) {
              const distance = Math.sqrt(
                Math.pow(newNodes[j].x - node.x, 2) + 
                Math.pow(newNodes[j].y - node.y, 2)
              );
              
              if (distance < 250) {
                connections.push(j);
                if (connections.length >= 3) break; // Limita a 3 conexões por nó
              }
            }
          }
          newNodes[index].connections = connections;
        });
        
        setNodes(newNodes);
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Atualiza a posição do mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-hidden bg-gradient-to-br from-brand-primary/5 to-gray-900/30 dark:from-gray-900/80 dark:to-brand-primary/20"
    >
      {/* Nós da teia */}
      {nodes.map((node, index) => (
        <motion.div
          key={`node-${index}`}
          className="absolute rounded-full bg-white dark:bg-brand-primary/80"
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            x: node.x,
            y: node.y,
            scale: [1, 1.2, 1],
          }}
          transition={{
            opacity: {
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              repeatType: "reverse"
            },
            scale: {
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              repeatType: "reverse"
            }
          }}
          style={{
            width: node.size,
            height: node.size,
            filter: "blur(0.5px)",
          }}
        />
      ))}

      {/* Conexões da teia */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 107, 0, 0.1)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.3)" />
          </linearGradient>
        </defs>
        {nodes.map((node, index) =>
          node.connections.map((targetIndex) => {
            const target = nodes[targetIndex];
            if (!target) return null;
            
            // Calcula a distância até o mouse
            const lineCenter = {
              x: (node.x + target.x) / 2,
              y: (node.y + target.y) / 2
            };
            
            const distanceToMouse = Math.sqrt(
              Math.pow(lineCenter.x - mousePosition.x, 2) + 
              Math.pow(lineCenter.y - mousePosition.y, 2)
            );
            
            // Opacidade baseada na proximidade do mouse
            const maxDistance = 200;
            const opacityBase = 0.05;
            const opacityBoost = Math.max(0, 1 - distanceToMouse / maxDistance) * 0.3;
            
            return (
              <line
                key={`line-${index}-${targetIndex}`}
                x1={node.x}
                y1={node.y}
                x2={target.x}
                y2={target.y}
                stroke="url(#lineGradient)"
                strokeOpacity={opacityBase + opacityBoost}
                strokeWidth={0.5 + (opacityBoost * 1.5)}
              />
            );
          })
        )}
      </svg>

      {/* Efeito de glow ao redor do cursor */}
      <motion.div 
        className="absolute w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,107,0,0.15) 0%, rgba(255,107,0,0) 70%)",
          left: mousePosition.x - 150,
          top: mousePosition.y - 150,
          mixBlendMode: "screen"
        }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />

      {/* Conteúdo */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
