import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedBackgroundProps {
  children: React.ReactNode;
}

// Interface para os nós da teia
interface Node {
  x: number;
  y: number;
  size: number;
  connections: number[];
  velocity: { x: number, y: number };
  id?: string; // ID único para persistência
}

// Chave para armazenamento no localStorage
const NODES_STORAGE_KEY = 'animated_background_nodes';

export function AnimatedBackground({ children }: AnimatedBackgroundProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });
  const mousePresentRef = useRef(false);

  // Salva os nós no localStorage
  const saveNodesToStorage = (nodesToSave: Node[]) => {
    try {
      // Salvamos apenas as propriedades essenciais
      const simplifiedNodes = nodesToSave.map(node => ({
        x: node.x,
        y: node.y,
        size: node.size,
        id: node.id || Math.random().toString(36).substring(2, 15)
      }));
      localStorage.setItem(NODES_STORAGE_KEY, JSON.stringify(simplifiedNodes));
    } catch (error) {
      console.error('Erro ao salvar nós no localStorage:', error);
    }
  };

  // Carrega os nós do localStorage
  const loadNodesFromStorage = (width: number, height: number): Node[] | null => {
    try {
      const storedNodesString = localStorage.getItem(NODES_STORAGE_KEY);
      if (!storedNodesString) return null;
      
      const storedNodes = JSON.parse(storedNodesString);
      
      // Verifica se os nós armazenados são válidos
      if (!Array.isArray(storedNodes) || storedNodes.length === 0) return null;
      
      // Adapta os nós armazenados ao tamanho atual da tela
      const adaptedNodes = storedNodes.map(node => ({
        ...node,
        // Garantir que os nós estejam dentro dos limites atuais
        x: Math.min(Math.max(0, node.x), width),
        y: Math.min(Math.max(0, node.y), height),
        connections: [],
        velocity: { 
          x: (Math.random() - 0.5) * 0.5, 
          y: (Math.random() - 0.5) * 0.5 
        }
      }));
      
      return adaptedNodes;
    } catch (error) {
      console.error('Erro ao carregar nós do localStorage:', error);
      return null;
    }
  };

  // Inicializa os nós da teia
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });

        // Tenta carregar nós do localStorage primeiro
        const storedNodes = loadNodesFromStorage(width, height);
        
        if (storedNodes) {
          // Recalcula as conexões para os nós carregados
          storedNodes.forEach((node, index) => {
            const connections: number[] = [];
            for (let j = 0; j < storedNodes.length; j++) {
              if (j !== index) {
                const distance = Math.sqrt(
                  Math.pow(storedNodes[j].x - node.x, 2) + 
                  Math.pow(storedNodes[j].y - node.y, 2)
                );

                if (distance < 300) {
                  connections.push(j);
                  if (connections.length >= 5) break;
                }
              }
            }
            storedNodes[index].connections = connections;
          });
          
          setNodes(storedNodes);
        } else {
          // Cria novos nós se não houver nenhum armazenado
          const nodeCount = Math.floor((width * height) / 8000);
          const newNodes: Node[] = [];

          for (let i = 0; i < nodeCount; i++) {
            newNodes.push({
              x: Math.random() * width,
              y: Math.random() * height,
              size: Math.random() * 2 + 1,
              connections: [],
              id: Math.random().toString(36).substring(2, 15),
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
                  if (connections.length >= 5) break; // 5 conexões por nó
                }
              }
            }
            newNodes[index].connections = connections;
          });

          setNodes(newNodes);
          saveNodesToStorage(newNodes);
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Configurar evento de "beforeunload" para salvar os nós antes de fechar/recarregar
    window.addEventListener("beforeunload", () => {
      saveNodesToStorage(nodes);
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("beforeunload", () => {
        saveNodesToStorage(nodes);
      });
    };
  }, []);

  // Atualiza a posição do mouse e dos nós
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        setMousePosition({
          x: mouseX,
          y: mouseY
        });
        
        lastMousePos.current = { x: mouseX, y: mouseY };
        mousePresentRef.current = true;
      }
    };

    const handleMouseLeave = () => {
      mousePresentRef.current = false;
    };

    const handleMouseEnter = () => {
      mousePresentRef.current = true;
    };

    // Atualiza a posição dos nós com base na posição do cursor
    const updateNodePositions = () => {
      setNodes(prevNodes => {
        const updatedNodes = prevNodes.map(node => {
          let { x, y } = node;
          const { width, height } = dimensions;
          
          // Utiliza a última posição conhecida do mouse
          const mouseX = lastMousePos.current.x;
          const mouseY = lastMousePos.current.y;
          
          // Calcula a distância ao cursor
          const dx = mouseX - x;
          const dy = mouseY - y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          let newVelocity = { ...node.velocity };
          
          // Se o mouse estiver presente, as teias são atraídas para ele
          if (mousePresentRef.current) {
            // Atração sempre presente, mas mais forte quanto mais perto do mouse
            const attractionRange = 200;
            const baseFactor = 0.02; // Fator de atração base
            
            if (distance < attractionRange) {
              // Fator de atração aumenta conforme se aproxima do cursor
              const attractFactor = baseFactor + (0.1 * (1 - distance / attractionRange));
              
              // Adiciona velocidade em direção ao cursor
              newVelocity = {
                x: node.velocity.x + (dx / (distance || 1)) * attractFactor,
                y: node.velocity.y + (dy / (distance || 1)) * attractFactor
              };
            } else {
              // Mesmo longe, há uma leve atração
              newVelocity = {
                x: node.velocity.x + (dx / (distance || 1)) * baseFactor * 0.1,
                y: node.velocity.y + (dy / (distance || 1)) * baseFactor * 0.1
              };
            }
          }
          
          // Movimento baseado na velocidade
          x += newVelocity.x;
          y += newVelocity.y;
          
          // Amortecimento da velocidade
          const damping = 0.97; // Levemente reduzido para manter mais movimento
          newVelocity = {
            x: newVelocity.x * damping,
            y: newVelocity.y * damping
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
        
        // Periodicamente salvar os nós no localStorage (a cada 30 frames aproximadamente)
        if (Math.random() < 0.03) {
          saveNodesToStorage(updatedNodes);
        }
        
        return updatedNodes;
      });
    };

    const animationFrame = requestAnimationFrame(function animate() {
      updateNodePositions();
      requestAnimationFrame(animate);
    });

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mouseenter", handleMouseEnter);
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
          key={`node-${node.id || index}`}
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

      {/* Conexões para nós regulares */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 107, 0, 0.15)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.35)" />
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

            // Opacidade baseada na proximidade do mouse - intensificada
            const maxDistance = 200;
            const opacityBase = 0.1; // Levemente aumentado
            const opacityBoost = Math.max(0, 1 - distanceToMouse / maxDistance) * 0.7; // Intensificado

            return (
              <line
                key={`line-${node.id || index}-${target.id || targetIndex}`}
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
      </svg>

      {/* Conteúdo */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}