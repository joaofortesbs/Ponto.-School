
import React, { useEffect, useState, useRef, useCallback } from "react";
import { saveNodes, loadNodes } from "@/lib/web-persistence";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  fadeState: 'in' | 'out' | 'stable';
  fadeTimer: number;
  opacity: number;
}

interface AnimatedBackgroundProps {
  children?: React.ReactNode;
}

export function AnimatedBackground({ children }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [dimensions, setDimensions] = useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 1280, 
    height: typeof window !== 'undefined' ? window.innerHeight : 800 
  });
  const [mousePosition, setMousePosition] = useState({ 
    x: dimensions.width / 2, 
    y: dimensions.height / 2 
  });
  const [isReady, setIsReady] = useState(false);
  const requestRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);
  const lastUpdateRef = useRef<number>(0);

  // Função para criar novos nós - memoizada para evitar recriações
  const createNodes = useCallback((width: number, height: number) => {
    if (isInitializedRef.current) return;
    
    const minNodeCount = 200;
    const calculatedNodeCount = Math.floor((width * height) / 3000);
    const nodeCount = Math.max(minNodeCount, calculatedNodeCount);
    const margin = 2;

    const newNodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const x = margin + Math.random() * (width - 2 * margin);
      const y = margin + Math.random() * (height - 2 * margin);
      const radius = Math.random() * 1.5 + 0.5;
      const fadeState = Math.random() > 0.7 ? 'out' : Math.random() > 0.5 ? 'in' : 'stable';
      const fadeTimer = Math.floor(Math.random() * 500) + 100;
      const opacity = fadeState === 'in' ? Math.random() * 0.3 :
                     fadeState === 'out' ? 0.1 + Math.random() * 0.3 :
                     0.2 + Math.random() * 0.3;

      newNodes.push({
        x, y,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius, fadeState, fadeTimer, opacity
      });
    }

    setNodes(newNodes);
    saveNodes(newNodes);
    isInitializedRef.current = true;
    setIsReady(true);
    
    return newNodes;
  }, []);

  // Inicializar dimensões e nós apenas uma vez
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateDimensions = () => {
      const newDimensions = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      setDimensions(newDimensions);
      
      // Só inicializar nós se ainda não foram inicializados
      if (!isInitializedRef.current) {
        try {
          const storedNodes = loadNodes();
          if (storedNodes && Array.isArray(storedNodes) && storedNodes.length > 0) {
            const adaptedNodes = storedNodes.map(node => ({
              ...node,
              x: Math.min(Math.max(2, (node.x / 100) * newDimensions.width), newDimensions.width - 2),
              y: Math.min(Math.max(2, (node.y / 100) * newDimensions.height), newDimensions.height - 2),
            }));
            setNodes(adaptedNodes);
            isInitializedRef.current = true;
            setIsReady(true);
          } else {
            createNodes(newDimensions.width, newDimensions.height);
          }
        } catch (error) {
          console.error("Erro ao carregar teias:", error);
          createNodes(newDimensions.width, newDimensions.height);
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []); // Dependências vazias para executar apenas uma vez

  // Atualizar posições dos nós - otimizado
  const updateNodePositions = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdateRef.current < 16) return; // Limitar a ~60fps
    lastUpdateRef.current = now;

    setNodes((prevNodes) => {
      if (prevNodes.length === 0) return prevNodes;
      
      return prevNodes.map(node => {
        let x = node.x + node.vx;
        let y = node.y + node.vy;
        let vx = node.vx;
        let vy = node.vy;

        // Verificação de bordas
        if (x < 0 || x > dimensions.width) vx = -vx;
        if (y < 0 || y > dimensions.height) vy = -vy;

        x = Math.max(0, Math.min(dimensions.width, x));
        y = Math.max(0, Math.min(dimensions.height, y));

        // Atualização de opacidade
        let opacity = node.opacity;
        let fadeState = node.fadeState;
        let fadeTimer = node.fadeTimer - 1;

        if (fadeTimer <= 0) {
          fadeState = fadeState === "in" ? "out" : "in";
          fadeTimer = 150 + Math.floor(Math.random() * 100);
        }

        if (fadeState === "in") {
          opacity = Math.min(0.85, opacity + 0.01);
        } else {
          opacity = Math.max(0.15, opacity - 0.01);
        }

        return { ...node, x, y, vx, vy, opacity, fadeState, fadeTimer };
      });
    });
  }, [dimensions.width, dimensions.height]);

  // Desenhar no canvas - otimizado
  const drawNodesAndConnections = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajustar canvas se necessário
    if (canvas.width !== dimensions.width || canvas.height !== dimensions.height) {
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
    }

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Desenhar conexões
    for (let i = 0; i < nodes.length; i++) {
      const nodeA = nodes[i];
      for (let j = i + 1; j < Math.min(nodes.length, i + 5); j++) { // Limitar conexões para performance
        const nodeB = nodes[j];
        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 160) {
          const opacity = (1 - distance / 160) * 0.45 * (nodeA.opacity + nodeB.opacity) / 2;
          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(nodeB.x, nodeB.y);
          ctx.strokeStyle = `rgba(255, 107, 0, ${opacity})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // Desenhar nós
    nodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * 1.1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 140, 0, ${node.opacity})`;
      ctx.fill();
    });
  }, [nodes, dimensions]);

  // Lidar com movimento do mouse - throttled
  useEffect(() => {
    let throttleTimeout: NodeJS.Timeout | null = null;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (throttleTimeout) return;
      
      throttleTimeout = setTimeout(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
        throttleTimeout = null;
      }, 16); // ~60fps
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, []);

  // Loop de animação principal
  useEffect(() => {
    if (!isReady) return;

    const animate = () => {
      updateNodePositions();
      drawNodesAndConnections();
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isReady, updateNodePositions, drawNodesAndConnections]);

  // Click handler para adicionar nós
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newNodes = Array.from({ length: 30 }, () => {
      const radius = Math.random() * 1.8 + 0.5;
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 90;

      return {
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius,
        fadeState: 'in' as const,
        fadeTimer: Math.floor(Math.random() * 300) + 200,
        opacity: 0.1
      };
    });

    setNodes(prevNodes => {
      const updatedNodes = [...prevNodes, ...newNodes];
      saveNodes(updatedNodes);
      return updatedNodes;
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute top-0 left-0 w-full h-full z-10"
        style={{ pointerEvents: 'auto', touchAction: 'none' }}
        onClick={handleCanvasClick}
      />
      {children}
    </div>
  );
}
