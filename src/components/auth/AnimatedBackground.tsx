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
  const [dimensions, setDimensions] = useState({ width: window.innerWidth || 1280, height: window.innerHeight || 800 });
  const [mousePosition, setMousePosition] = useState({ x: dimensions.width / 2, y: dimensions.height / 2 });
  const [isReady, setIsReady] = useState(false);
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);

  // Função para criar novos nós
  const createNodes = useCallback(() => {
    console.log("Criando novas teias...");

    // Certifique-se de que temos dimensões válidas
    const { width, height } = dimensions.width === 0 ? { width: window.innerWidth || 1280, height: window.innerHeight || 800 } : dimensions;

    const minNodeCount = 120; // Garantir pelo menos 120 nós
    const calculatedNodeCount = Math.floor((width * height) / 6000); // Densidade aumentada
    const nodeCount = Math.max(minNodeCount, calculatedNodeCount);

    // Margem mínima para garantir que as teias não saiam da tela
    const margin = 2;

    const newNodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const x = margin + Math.random() * (width - 2 * margin);
      const y = margin + Math.random() * (height - 2 * margin);
      const radius = Math.random() * 1.5 + 0.5;

      // Fade state aleatório para animação suave de aparecimento/desaparecimento
      const fadeState = Math.random() > 0.7 ? 'out' : Math.random() > 0.5 ? 'in' : 'stable';
      const fadeTimer = Math.floor(Math.random() * 500) + 100;
      const opacity = fadeState === 'in' ? Math.random() * 0.3 : 
                     fadeState === 'out' ? 0.1 + Math.random() * 0.3 : 
                     0.2 + Math.random() * 0.3;

      newNodes.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius,
        fadeState,
        fadeTimer,
        opacity
      });
    }

    // Atualiza o estado e salva os nós no localStorage
    setNodes(newNodes);
    console.log(`Novas teias geradas com sucesso:`, newNodes.length);
    saveNodes(newNodes);

    // Disparar evento indicando que as teias estão prontas
    document.dispatchEvent(new CustomEvent('WebTeiasProntas'));

    return newNodes;
  }, [dimensions]);

  // Tentar obter nós salvos ou criar novos
  const initializeNodes = useCallback(() => {
    if (isInitializedRef.current) return;

    // Garantir que temos dimensões válidas
    const { width, height } = dimensions.width === 0 ? 
      { width: window.innerWidth || 1280, height: window.innerHeight || 800 } : dimensions;

    try {
      const storedNodes = loadNodes();

      // Se temos nós salvos, adaptá-los às dimensões atuais
      if (storedNodes && Array.isArray(storedNodes) && storedNodes.length > 0) {
        // Margem mínima para garantir que as teias não saiam da tela
        const margin = 2;

        // Adapta os nós armazenados ao tamanho atual da tela
        const adaptedNodes = storedNodes.map(node => ({
          ...node,
          x: Math.min(Math.max(margin, (node.x / 100) * width), width - margin),
          y: Math.min(Math.max(margin, (node.y / 100) * height), height - margin),
        }));

        setNodes(adaptedNodes);
        console.log("Teias otimizadas em segundo plano:", adaptedNodes.length);

        // Atualizar o salvamento para refletir as novas dimensões
        saveNodes(adaptedNodes);
        isInitializedRef.current = true;
        setIsReady(true);

        // Disparar evento indicando que as teias estão prontas
        document.dispatchEvent(new CustomEvent('WebTeiasProntas'));

        return;
      }
    } catch (error) {
      console.error("Erro ao carregar teias:", error);
    }

    // Se não temos nós salvos ou falhou o carregamento, criar novos
    createNodes();
    isInitializedRef.current = true;
    setIsReady(true);
  }, [dimensions, createNodes]);

  // Inicializar as dimensões do canvas e os nós no carregamento da página
  useEffect(() => {
    // Dimensões iniciais
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    // Inicializar as teias imediatamente
    initializeNodes();

    // Forçar atualização das teias quando solicitado
    const handleForceUpdate = () => {
      console.log("Atualizando teias forçadamente");
      initializeNodes();
    };

    document.addEventListener('ForceWebTeiaUpdate', handleForceUpdate);

    // Limpar
    return () => {
      window.removeEventListener('resize', updateDimensions);
      document.removeEventListener('ForceWebTeiaUpdate', handleForceUpdate);
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [initializeNodes]);

  // Atualiza a posição dos nós com base na posição do cursor
  const updateNodePositions = useCallback(() => {
    setNodes(prevNodes => {
      // Margem mínima para garantir que as teias não saiam da tela
      const margin = 2;

      const updatedNodes = prevNodes.map(node => {
        let { x, y, fadeState, fadeTimer, opacity } = node;

        // Atualizar estado de fade
        if (fadeState === 'in') {
          opacity = Math.min(0.5, opacity + 0.002);
          fadeTimer -= 1;
          if (fadeTimer <= 0) {
            fadeState = 'stable';
            fadeTimer = Math.floor(Math.random() * 500) + 1000;
          }
        } else if (fadeState === 'out') {
          opacity = Math.max(0.05, opacity - 0.002);
          fadeTimer -= 1;
          if (fadeTimer <= 0) {
            fadeState = 'in';
            fadeTimer = Math.floor(Math.random() * 300) + 200;
          }
        } else {
          // Stable state
          fadeTimer -= 1;
          if (fadeTimer <= 0) {
            fadeState = Math.random() > 0.5 ? 'in' : 'out';
            fadeTimer = Math.floor(Math.random() * 300) + 200;
          }
        }

        // Atualizar posição baseada nos vetores de velocidade
        x += node.vx;
        y += node.vy;

        // Verificar limites da tela
        if (x < margin) {
          x = margin;
          node.vx *= -1;
        } else if (x > dimensions.width - margin) {
          x = dimensions.width - margin;
          node.vx *= -1;
        }

        if (y < margin) {
          y = margin;
          node.vy *= -1;
        } else if (y > dimensions.height - margin) {
          y = dimensions.height - margin;
          node.vy *= -1;
        }

        // Calcular a distância do cursor
        const dx = mousePosition.x - x;
        const dy = mousePosition.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // A força de atração depende da distância (menor atração quando próximo demais)
        let attractionForce = 0;

        if (distance < 200) {
          // Atração: mais forte entre 50 e 150 pixels, mais fraca quando muito perto ou muito longe
          attractionForce = Math.min(0.08, 0.3 / (1 + Math.exp(-(distance - 100) / 20)));

          // Calcular novas velocidades baseadas na força de atração
          const angle = Math.atan2(dy, dx);
          node.vx += attractionForce * Math.cos(angle);
          node.vy += attractionForce * Math.sin(angle);

          // Limitar velocidade máxima
          const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
          if (speed > 1.5) {
            node.vx = (node.vx / speed) * 1.5;
            node.vy = (node.vy / speed) * 1.5;
          }
        }

        // Aplicar atrito natural para evitar aceleração infinita
        node.vx *= 0.99;
        node.vy *= 0.99;

        // Retornar nó atualizado
        return {
          ...node,
          x,
          y,
          fadeState,
          fadeTimer,
          opacity
        };
      });

      return updatedNodes;
    });
  }, [dimensions, mousePosition]);

  // Desenha os nós e conexões no canvas
  const drawNodesAndConnections = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Garantir que o canvas tem as dimensões corretas
    if (canvas.width !== dimensions.width || canvas.height !== dimensions.height) {
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
    }

    // Limpar canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Desenhar conexões entre nós próximos
    ctx.strokeStyle = 'rgba(255, 107, 0, 0.2)';

    for (let i = 0; i < nodes.length; i++) {
      const nodeA = nodes[i];

      for (let j = i + 1; j < nodes.length; j++) {
        const nodeB = nodes[j];
        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Desenhar linha se os nós estiverem próximos
        if (distance < 100) {
          // Opacidade baseada na distância e na opacidade dos nós
          const opacity = (1 - distance / 100) * 0.2 * (nodeA.opacity + nodeB.opacity) / 2;
          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(nodeB.x, nodeB.y);
          ctx.strokeStyle = `rgba(255, 107, 0, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Efeito especial: mais conexões perto do cursor
    const cursorRange = 100;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const dx = node.x - mousePosition.x;
      const dy = node.y - mousePosition.y;
      const distanceToMouse = Math.sqrt(dx * dx + dy * dy);

      if (distanceToMouse < cursorRange) {
        const opacity = (1 - distanceToMouse / cursorRange) * 0.15;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(mousePosition.x, mousePosition.y);
        ctx.strokeStyle = `rgba(255, 107, 0, ${opacity})`;
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }
    }

    // Desenhar nós
    nodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 107, 0, ${node.opacity})`;
      ctx.fill();
    });
  }, [nodes, dimensions, mousePosition]);

  // Lidar com o movimento do mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Quando o usuário clica no canvas, adicionar mais nós
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const x = e.clientX;
    const y = e.clientY;

    // Adicionar 10 novos nós ao redor do clique
    const newNodes = Array.from({ length: 10 }, () => {
      const radius = Math.random() * 1.5 + 0.5;
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 50;

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

  // Loop de animação
  useEffect(() => {
    // Iniciar animação mesmo antes de isReady ser true para garantir que as teias apareçam
    const animate = (time: number) => {
      // Atualizar posições dos nós
      updateNodePositions();

      // Desenhar no canvas
      drawNodesAndConnections();

      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    // Garantir que teiasWebProntas seja disparado
    setTimeout(() => {
      if (!isReady) {
        setIsReady(true);
        document.dispatchEvent(new CustomEvent('WebTeiasProntas'));
      }
    }, 200);

    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [updateNodePositions, drawNodesAndConnections]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute top-0 left-0 w-full h-full z-0"
        style={{ 
          pointerEvents: 'none',
          touchAction: 'none'
        }}
        onClick={handleCanvasClick}
      />
      {children}
    </div>
  );
}