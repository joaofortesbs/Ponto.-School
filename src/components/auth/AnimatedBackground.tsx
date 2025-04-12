import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedBackgroundProps {
  children: React.ReactNode;
}

// Define os tipos para os nós e usa localStorage para persistência
interface WebNode {
  x: number;
  y: number;
  size: number;
  connections: number[];
  velocity: { x: number, y: number };
  id?: string; // Identificador único para cada nó
}

// Chave para armazenar no localStorage
const NODES_STORAGE_KEY = 'auth_animated_background_nodes';

export function AnimatedBackground({ children }: AnimatedBackgroundProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<WebNode[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const initialized = useRef(false);

  // Função para gerar nós iniciais baseados nas dimensões
  const generateInitialNodes = (width: number, height: number): WebNode[] => {
    // Aumenta a densidade para ter mais teias (divisor menor = mais nós)
    const nodeCount = Math.max(50, Math.floor((width * height) / 5000)); // Garantindo pelo menos 50 nós
    const newNodes: WebNode[] = [];

    for (let i = 0; i < nodeCount; i++) {
      newNodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        connections: [],
        velocity: { 
          x: (Math.random() - 0.5) * 0.5, 
          y: (Math.random() - 0.5) * 0.5 
        },
        id: `node-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`
      });
    }

    // Cria conexões entre nós próximos
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
            if (connections.length >= 8) break; // Aumenta para 8 conexões por nó
          }
        }
      }
      newNodes[index].connections = connections;
    });

    return newNodes;
  };

  // Inicializa os nós da teia e configura persistência - Forçando inicialização mais agressiva
  useEffect(() => {
    const initializeNodes = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });

        // Sempre gerar novos nós para garantir consistência visual
        const newNodes = generateInitialNodes(width, height);
        setNodes(newNodes);
        
        try {
          // Salvar imediatamente no localStorage
          localStorage.setItem(NODES_STORAGE_KEY, JSON.stringify(newNodes));
          console.log("Teias geradas e persistidas com sucesso:", newNodes.length);
        } catch (error) {
          console.error("Erro ao salvar nós da teia:", error);
        }
        
        initialized.current = true;
      }
    };

    // Inicializa imediatamente e após um pequeno delay para garantir que o container está pronto
    initializeNodes();
    const timer = setTimeout(initializeNodes, 100);
    
    // Recalcular em caso de redimensionamento
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Persistir os nós atualizados periodicamente
  useEffect(() => {
    if (nodes.length > 0) {
      const saveInterval = setInterval(() => {
        try {
          localStorage.setItem(NODES_STORAGE_KEY, JSON.stringify(nodes));
        } catch (error) {
          console.error("Erro ao salvar estado dos nós:", error);
        }
      }, 5000); // Salva a cada 5 segundos

      return () => clearInterval(saveInterval);
    }
  }, [nodes]);

  // Atualiza a posição do mouse e dos nós com atração mais forte
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

            // Influencia da posição do mouse na velocidade dos nós - Alcance e força aumentados
            if (distance < 250) { // Maior área de influência
              const factor = 1 - distance / 250;
              // Fator de atração muito mais forte
              const attractionFactor = 2.5; 

              // Atrai mais fortemente na direção do cursor
              return {
                ...node,
                velocity: {
                  x: node.velocity.x + (dx / distance) * factor * attractionFactor,
                  y: node.velocity.y + (dy / distance) * factor * attractionFactor
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
      {/* Nós regulares da teia com IDs persistentes - Aumenta a visibilidade */}
      {nodes.map((node, index) => (
        <motion.div
          key={node.id || `node-${index}`}
          className="absolute rounded-full bg-white/90 dark:bg-brand-primary/90"
          initial={{ opacity: 0.5 }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.3, 1],
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
            width: node.size + 0.5, // Ligeiramente maiores
            height: node.size + 0.5,
            filter: "blur(0.3px)",
            left: node.x,
            top: node.y,
            zIndex: 5
          }}
        />
      ))}

      {/* Conexões para nós regulares - Melhorada */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 4 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 107, 0, 0.25)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.45)" />
          </linearGradient>
        </defs>

        {/* Linhas entre nós regulares - Mais visíveis */}
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
            const maxDistance = 250; // Aumentado para maior área de efeito
            const opacityBase = 0.15; // Base mais visível
            const opacityBoost = Math.max(0, 1 - distanceToMouse / maxDistance) * 0.6;

            return (
              <line
                key={`line-${node.id || index}-${targetIndex}`}
                x1={node.x}
                y1={node.y}
                x2={target.x}
                y2={target.y}
                stroke="url(#lineGradient)"
                strokeOpacity={opacityBase + opacityBoost}
                strokeWidth={0.7 + (opacityBoost * 2.5)}
                className="transition-all duration-300"
              />
            );
          })
        )}
      </svg>

      {/* Conteúdo */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}