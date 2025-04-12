
import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedBackgroundProps {
  children: React.ReactNode;
}

interface Node {
  x: number;
  y: number;
  size: number;
  connections: number[];
  velocityX?: number;
  velocityY?: number;
  originX?: number;
  originY?: number;
}

export function AnimatedBackground({ children }: AnimatedBackgroundProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [previousMousePosition, setPreviousMousePosition] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const [clickedPoints, setClickedPoints] = useState<{x: number, y: number, id: number}[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const lastClickTime = useRef(0);
  const mouseSpeedRef = useRef({ x: 0, y: 0 });
  const requestRef = useRef<number>();
  const nodeCountRef = useRef(0);

  // Cria novos nós
  const createNodes = useCallback((count: number, centerX?: number, centerY?: number, spread: number = 150) => {
    if (!containerRef.current) return [];
    
    const { width, height } = dimensions;
    const newNodes: Node[] = [];
    
    for (let i = 0; i < count; i++) {
      // Se centerX e centerY são fornecidos, cria nós ao redor desse ponto
      const x = centerX !== undefined 
        ? centerX + (Math.random() - 0.5) * spread * 2
        : Math.random() * width;
      
      const y = centerY !== undefined 
        ? centerY + (Math.random() - 0.5) * spread * 2
        : Math.random() * height;
      
      newNodes.push({
        x,
        y,
        size: Math.random() * 2 + 1,
        connections: [],
        velocityX: (Math.random() - 0.5) * 0.5,
        velocityY: (Math.random() - 0.5) * 0.5,
        originX: x,
        originY: y
      });
    }
    
    return newNodes;
  }, [dimensions]);

  // Atualiza conexões entre nós
  const updateConnections = useCallback((allNodes: Node[]) => {
    return allNodes.map((node, index) => {
      const connections: number[] = [];
      
      for (let j = 0; j < allNodes.length; j++) {
        if (j !== index) {
          const distance = Math.sqrt(
            Math.pow(allNodes[j].x - node.x, 2) + 
            Math.pow(allNodes[j].y - node.y, 2)
          );
          
          if (distance < 250) {
            connections.push(j);
            if (connections.length >= 4) break; // Aumenta para 4 conexões por nó
          }
        }
      }
      
      return {
        ...node,
        connections
      };
    });
  }, []);

  // Inicializa os nós da teia
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
        
        // Calcula quantidade de nós baseada no tamanho
        const nodeCount = Math.floor((width * height) / 18000);
        nodeCountRef.current = nodeCount;
        
        // Cria nós iniciais
        const initialNodes = createNodes(nodeCount);
        const nodesWithConnections = updateConnections(initialNodes);
        
        setNodes(nodesWithConnections);
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [createNodes, updateConnections]);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newPosition = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
        
        // Calcula a velocidade do mouse
        const speedX = newPosition.x - mousePosition.x;
        const speedY = newPosition.y - mousePosition.y;
        mouseSpeedRef.current = { x: speedX, y: speedY };
        
        setPreviousMousePosition(mousePosition);
        setMousePosition(newPosition);
        
        // Determina se o mouse está se movendo significativamente
        const isSignificantMovement = Math.abs(speedX) > 3 || Math.abs(speedY) > 3;
        setIsMoving(isSignificantMovement);
      }
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mousePosition]);

  // Handle mouse click
  useEffect(() => {
    const handleMouseClick = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        // Previne múltiplos cliques muito rápidos
        const now = Date.now();
        if (now - lastClickTime.current < 300) return;
        lastClickTime.current = now;
        
        // Adiciona um ponto de clique com animação
        const newClickPoint = {
          x: clickX,
          y: clickY,
          id: Date.now()
        };
        
        setClickedPoints(prev => [...prev, newClickPoint]);
        
        // Adiciona novos nós ao redor do ponto de clique
        const newNodeCount = Math.floor(Math.random() * 5) + 3; // 3-7 novos nós
        const newNodes = createNodes(newNodeCount, clickX, clickY, 100);
        
        setNodes(prevNodes => {
          // Combina os nós existentes com os novos
          const combinedNodes = [...prevNodes, ...newNodes];
          // Limita a quantidade total de nós para performance
          const maxNodes = nodeCountRef.current + 50;
          const trimmedNodes = combinedNodes.length > maxNodes 
            ? combinedNodes.slice(combinedNodes.length - maxNodes) 
            : combinedNodes;
          
          return updateConnections(trimmedNodes);
        });
        
        // Remove o ponto de clique após a animação
        setTimeout(() => {
          setClickedPoints(prev => prev.filter(point => point.id !== newClickPoint.id));
        }, 1500);
      }
    };
    
    containerRef.current?.addEventListener("click", handleMouseClick);
    
    return () => {
      containerRef.current?.removeEventListener("click", handleMouseClick);
    };
  }, [createNodes, updateConnections]);

  // Animação dos nós reagindo ao mouse
  const animateNodes = useCallback(() => {
    if (containerRef.current) {
      setNodes(prevNodes => {
        return prevNodes.map(node => {
          // Calcula a distância até o mouse
          const distanceToMouse = Math.sqrt(
            Math.pow(node.x - mousePosition.x, 2) + 
            Math.pow(node.y - mousePosition.y, 2)
          );
          
          // Se o mouse está se movendo e está próximo, afeta o nó
          let newX = node.x;
          let newY = node.y;
          
          if (isMoving && distanceToMouse < 200) {
            // Calcula força baseada na proximidade e velocidade do mouse
            const force = (1 - distanceToMouse / 200) * 0.5;
            const mouseInfluenceX = mouseSpeedRef.current.x * force;
            const mouseInfluenceY = mouseSpeedRef.current.y * force;
            
            // Aplica a influência do mouse
            newX += mouseInfluenceX;
            newY += mouseInfluenceY;
          } else {
            // Movimento natural e retorno à posição original
            if (node.originX && node.originY) {
              const returnForce = 0.01;
              newX += (node.originX - newX) * returnForce;
              newY += (node.originY - newY) * returnForce;
            }
            
            // Adiciona um pouco de movimento aleatório
            newX += (Math.random() - 0.5) * 0.2;
            newY += (Math.random() - 0.5) * 0.2;
          }
          
          // Mantém os nós dentro dos limites
          newX = Math.max(0, Math.min(newX, dimensions.width));
          newY = Math.max(0, Math.min(newY, dimensions.height));
          
          return {
            ...node,
            x: newX,
            y: newY
          };
        });
      });
      
      requestRef.current = requestAnimationFrame(animateNodes);
    }
  }, [dimensions, isMoving, mousePosition]);

  // Inicia e para a animação
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animateNodes);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animateNodes]);

  // Atualiza conexões quando os nós se movem
  useEffect(() => {
    const updateNodeConnections = () => {
      setNodes(prevNodes => updateConnections(prevNodes));
    };
    
    // Atualiza conexões a cada 500ms para melhor performance
    const intervalId = setInterval(updateNodeConnections, 500);
    
    return () => clearInterval(intervalId);
  }, [updateConnections]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-hidden bg-gradient-to-br from-brand-primary/5 to-gray-900/30 dark:from-gray-900/80 dark:to-brand-primary/20 cursor-crosshair"
    >
      {/* Nós da teia */}
      {nodes.map((node, index) => (
        <motion.div
          key={`node-${index}`}
          className="absolute rounded-full bg-white dark:bg-brand-primary/80"
          initial={{ opacity: 0.2 }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            x: node.x,
            y: node.y,
            scale: [1, 1.2, 1],
          }}
          transition={{
            x: { duration: 0.1, ease: "linear" },
            y: { duration: 0.1, ease: "linear" },
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
            <stop offset="0%" stopColor="rgba(255, 107, 0, 0.08)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.25)" />
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
            const opacityBase = 0.03; // Reduzido de 0.05
            const opacityBoost = Math.max(0, 1 - distanceToMouse / maxDistance) * 0.2; // Reduzido de 0.3
            
            return (
              <line
                key={`line-${index}-${targetIndex}`}
                x1={node.x}
                y1={node.y}
                x2={target.x}
                y2={target.y}
                stroke="url(#lineGradient)"
                strokeOpacity={opacityBase + opacityBoost}
                strokeWidth={0.4 + (opacityBoost * 1.2)} // Reduzido de 0.5 + 1.5
              />
            );
          })
        )}
      </svg>

      {/* Efeito de glow ao redor do cursor (brilho reduzido) */}
      <motion.div 
        className="absolute w-[250px] h-[250px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,107,0,0.08) 0%, rgba(255,107,0,0) 70%)", // Reduzido de 0.15
          left: mousePosition.x - 125,
          top: mousePosition.y - 125,
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

      {/* Animação de clique */}
      <AnimatePresence>
        {clickedPoints.map((point) => (
          <motion.div
            key={`click-${point.id}`}
            className="absolute rounded-full pointer-events-none bg-brand-primary/10 dark:bg-brand-primary/20"
            style={{
              left: point.x - 25,
              top: point.y - 25,
              width: 50,
              height: 50,
            }}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* Conteúdo */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
