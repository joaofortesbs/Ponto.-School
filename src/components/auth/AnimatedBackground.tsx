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
        // Aumentando a densidade das teias diminuindo o divisor
        const nodeCount = Math.floor((width * height) / 8000);
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

              if (distance < 300) {
                connections.push(j);
                if (connections.length >= 5) break; // Aumenta para 5 conexões por nó
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

              // Atrai levemente na direção do mouse
              return {
                ...node,
                velocity: {
                  x: node.velocity.x + (dx / distance) * factor * pushFactor,
                  y: node.velocity.y + (dy / distance) * factor * pushFactor
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

    const animationFrame = requestAnimationFrame(function animate() {
      updateNodePositions();
      requestAnimationFrame(animate);
    });

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
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

      {/* Removidos os nós de clique */}

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

        {/* Removidas as linhas entre nós de clique */}
      </svg>

      {/* Efeito de glow ao redor do cursor - REMOVED */}

      {/* Partículas que seguem o mouse - REMOVED */}

      {/* Conteúdo */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}