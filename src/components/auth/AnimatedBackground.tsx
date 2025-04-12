
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedBackgroundProps {
  children: React.ReactNode;
}

export function AnimatedBackground({ children }: AnimatedBackgroundProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<{ x: number; y: number; size: number; connections: number[]; velocity: { x: number, y: number } }[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [clickNodes, setClickNodes] = useState<{ x: number; y: number; size: number; age: number; connections: number[] }[]>([]);

  // Inicializa os nós da teia
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
        
        // Cria nós baseados no tamanho do container
        const nodeCount = Math.floor((width * height) / 15000);
        const newNodes = [];
        
        for (let i = 0; i < nodeCount; i++) {
          newNodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 1,
            connections: [],
            velocity: { 
              x: (Math.random() - 0.5) * 0.5, 
              y: (Math.random() - 0.5) * 0.5 
            }
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

  // Atualiza a posição do mouse e dos nós
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });

        // Atualiza a posição dos nós baseados no movimento do mouse
        setNodes(prevNodes => {
          return prevNodes.map(node => {
            const dx = e.clientX - rect.left - node.x;
            const dy = e.clientY - rect.top - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Influencia da posição do mouse na velocidade dos nós
            if (distance < 200) {
              const factor = 1 - distance / 200;
              const pushFactor = 0.8;
              
              // Afasta levemente da direção do mouse
              return {
                ...node,
                velocity: {
                  x: node.velocity.x - (dx / distance) * factor * pushFactor,
                  y: node.velocity.y - (dy / distance) * factor * pushFactor
                }
              };
            }
            
            return node;
          });
        });
      }
    };

    // Atualiza a posição dos nós com base em suas velocidades
    const updateNodePositions = () => {
      setNodes(prevNodes => {
        return prevNodes.map(node => {
          let { x, y } = node;
          const { width, height } = dimensions;
          
          // Movimento baseado na velocidade
          x += node.velocity.x;
          y += node.velocity.y;
          
          // Amortecimento da velocidade
          const damping = 0.98;
          const newVelocity = {
            x: node.velocity.x * damping,
            y: node.velocity.y * damping
          };
          
          // Manter dentro dos limites
          if (x < 0) { x = 0; newVelocity.x *= -0.5; }
          if (x > width) { x = width; newVelocity.x *= -0.5; }
          if (y < 0) { y = 0; newVelocity.y *= -0.5; }
          if (y > height) { y = height; newVelocity.y *= -0.5; }
          
          return {
            ...node,
            x,
            y,
            velocity: newVelocity
          };
        });
      });
    };

    // Atualiza os nós de clique, reduzindo sua idade
    const updateClickNodes = () => {
      setClickNodes(prevNodes => {
        return prevNodes
          .map(node => ({ ...node, age: node.age - 1 }))
          .filter(node => node.age > 0);
      });
    };
    
    const animationFrame = requestAnimationFrame(function animate() {
      updateNodePositions();
      updateClickNodes();
      requestAnimationFrame(animate);
    });

    const handleClick = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Criar novos nós ao redor do clique
        const newClickNodes = [];
        const numNodes = 5 + Math.floor(Math.random() * 5); // 5-9 nós por clique
        
        for (let i = 0; i < numNodes; i++) {
          const angle = (Math.PI * 2 * i) / numNodes;
          const distance = 20 + Math.random() * 30;
          
          newClickNodes.push({
            x: x + Math.cos(angle) * distance,
            y: y + Math.sin(angle) * distance,
            size: 1 + Math.random() * 1.5,
            age: 100 + Math.floor(Math.random() * 50), // durará 100-150 frames
            connections: []
          });
        }
        
        // Conectar os nós entre si formando um polígono
        newClickNodes.forEach((_, index) => {
          const connections = [
            (index + 1) % numNodes, 
            (index + 2) % numNodes
          ];
          newClickNodes[index].connections = connections;
        });
        
        setClickNodes(prev => [...prev, ...newClickNodes]);
      }
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationFrame);
    };
  }, [dimensions]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-hidden bg-gradient-to-br from-brand-primary/5 to-gray-900/30 dark:from-gray-900/80 dark:to-brand-primary/20"
    >
      {/* Nós regulares da teia */}
      {nodes.map((node, index) => (
        <motion.div
          key={`node-${index}`}
          className="absolute rounded-full bg-white/80 dark:bg-brand-primary/80"
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
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
            left: node.x,
            top: node.y,
          }}
        />
      ))}

      {/* Nós de clique */}
      {clickNodes.map((node, index) => (
        <motion.div
          key={`click-node-${index}-${node.x}-${node.y}`}
          className="absolute rounded-full bg-orange-400/90 dark:bg-orange-500/90"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0.8],
          }}
          transition={{
            opacity: {
              duration: 2,
              times: [0, 0.2, 1],
            },
            scale: {
              duration: 2,
              times: [0, 0.3, 1],
            }
          }}
          style={{
            width: node.size,
            height: node.size,
            filter: "blur(0.5px)",
            left: node.x,
            top: node.y,
            opacity: Math.min(node.age / 100, 1)
          }}
        />
      ))}

      {/* Conexões para nós regulares */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 107, 0, 0.15)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.35)" />
          </linearGradient>
          <linearGradient id="clickLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 147, 60, 0.6)" />
            <stop offset="100%" stopColor="rgba(255, 107, 0, 0.6)" />
          </linearGradient>
        </defs>
        
        {/* Linhas entre nós regulares */}
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
            const opacityBase = 0.08;
            const opacityBoost = Math.max(0, 1 - distanceToMouse / maxDistance) * 0.5;
            
            return (
              <line
                key={`line-${index}-${targetIndex}`}
                x1={node.x}
                y1={node.y}
                x2={target.x}
                y2={target.y}
                stroke="url(#lineGradient)"
                strokeOpacity={opacityBase + opacityBoost}
                strokeWidth={0.5 + (opacityBoost * 2)}
                className="transition-all duration-300"
              />
            );
          })
        )}
        
        {/* Linhas entre nós de clique */}
        {clickNodes.map((node, index) =>
          node.connections.map((targetIndex) => {
            const target = clickNodes[targetIndex];
            if (!target) return null;
            
            return (
              <line
                key={`click-line-${index}-${targetIndex}-${node.x}`}
                x1={node.x}
                y1={node.y}
                x2={target.x}
                y2={target.y}
                stroke="url(#clickLineGradient)"
                strokeOpacity={Math.min(node.age / 100, 1) * 0.8}
                strokeWidth={1 + Math.min(node.age / 100, 1)}
                className="animate-pulse-soft"
              />
            );
          })
        )}
      </svg>

      {/* Efeito de glow ao redor do cursor */}
      <motion.div 
        className="absolute w-[350px] h-[350px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,107,0,0.2) 0%, rgba(255,107,0,0) 70%)",
          left: mousePosition.x - 175,
          top: mousePosition.y - 175,
          mixBlendMode: "screen"
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />

      {/* Partículas que seguem o mouse */}
      <motion.div
        className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 pointer-events-none"
        style={{
          left: mousePosition.x - 8,
          top: mousePosition.y - 8,
          filter: "blur(4px)",
          opacity: 0.5,
        }}
      />

      {/* Conteúdo */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
