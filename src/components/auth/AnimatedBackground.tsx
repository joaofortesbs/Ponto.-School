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

    const minNodeCount = 400; // Aumentando para pelo menos 400 nós
    const calculatedNodeCount = Math.floor((width * height) / 2500); // Densidade muito mais aumentada
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
    if (!canvasRef.current) return;

    // Usar uma função de atualização simplificada para melhor performance
    setNodes((prevNodes) => {
      const updatedNodes = [];
      const width = dimensions.width;
      const height = dimensions.height;

      // Limitar o número de nós processados por frame para melhorar performance
      const maxNodesToProcess = Math.min(prevNodes.length, 75);

      for (let i = 0; i < maxNodesToProcess; i++) {
        const node = prevNodes[i];

        // Cálculos simplificados para maior performance
        let x = node.x + node.vx;
        let y = node.y + node.vy;
        let vx = node.vx;
        let vy = node.vy;

        // Verificação simplificada de bordas
        if (x < 0 || x > width) vx = -vx;
        if (y < 0 || y > height) vy = -vy;

        // Garantir que está dentro dos limites
        x = x < 0 ? 0 : x > width ? width : x;
        y = y < 0 ? 0 : y > height ? height : y;

        // Atualização mais eficiente de opacidade
        let opacity = node.opacity;
        let fadeState = node.fadeState;
        let fadeTimer = node.fadeTimer - 1;

        // Lógica simplificada de fade
        if (fadeTimer <= 0) {
          fadeState = fadeState === "in" ? "out" : "in";
          fadeTimer = 150 + Math.floor(Math.random() * 100);
        }

        // Ajuste de opacidade com menor incremento para suavidade
        if (fadeState === "in") {
          opacity = Math.min(0.85, opacity + 0.01);
        } else {
          opacity = Math.max(0.15, opacity - 0.01);
        }

        updatedNodes.push({
          ...node,
          x, y, vx, vy,
          opacity,
          fadeState,
          fadeTimer
        });
      }

      // Manter os outros nós sem alteração
      for (let i = maxNodesToProcess; i < prevNodes.length; i++) {
        updatedNodes.push(prevNodes[i]);
      }

      return updatedNodes;
    });
  }, [dimensions]);

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
    ctx.strokeStyle = 'rgba(255, 107, 0, 0.4)'; // Aumentada opacidade base

    for (let i = 0; i < nodes.length; i++) {
      const nodeA = nodes[i];

      for (let j = i + 1; j < nodes.length; j++) {
        const nodeB = nodes[j];
        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Desenhar linha se os nós estiverem próximos
        // Aumentando a distância máxima para criar mais conexões
        if (distance < 160) { // Aumentado alcance
          // Opacidade baseada na distância e na opacidade dos nós
          const opacity = (1 - distance / 160) * 0.45 * (nodeA.opacity + nodeB.opacity) / 2; // Aumentada opacidade

          // Gradiente nas linhas para efeito mais vibrante
          const gradient = ctx.createLinearGradient(nodeA.x, nodeA.y, nodeB.x, nodeB.y);
          gradient.addColorStop(0, `rgba(255, 107, 0, ${opacity * 1.2})`);
          gradient.addColorStop(0.5, `rgba(255, 140, 0, ${opacity * 1.5})`);
          gradient.addColorStop(1, `rgba(255, 107, 0, ${opacity * 1.2})`);

          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(nodeB.x, nodeB.y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 0.6; // Linhas ligeiramente mais grossas
          ctx.stroke();
        }
      }
    }

    // Efeito especial: mais conexões perto do cursor
    const cursorRange = 220; // Aumentado alcance do cursor
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const dx = node.x - mousePosition.x;
      const dy = node.y - mousePosition.y;
      const distanceToMouse = Math.sqrt(dx * dx + dy * dy);

      if (distanceToMouse < cursorRange) {
        const opacity = (1 - distanceToMouse / cursorRange) * 0.35; // Aumentada opacidade

        // Gradiente para o cursor
        const gradient = ctx.createLinearGradient(node.x, node.y, mousePosition.x, mousePosition.y);
        gradient.addColorStop(0, `rgba(255, 107, 0, ${opacity})`);
        gradient.addColorStop(1, `rgba(255, 140, 0, ${opacity * 0.7})`);

        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(mousePosition.x, mousePosition.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Adicionar conexões extras entre nós próximos ao cursor
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeB = nodes[j];
          const dxB = nodeB.x - mousePosition.x;
          const dyB = nodeB.y - mousePosition.y;
          const distanceBToMouse = Math.sqrt(dxB * dxB + dyB * dyB);

          if (distanceBToMouse < cursorRange && Math.random() > 0.6) { // Mais conexões (0.6 em vez de 0.7)
            const opacityB = (1 - Math.max(distanceToMouse, distanceBToMouse) / cursorRange) * 0.25; // Aumentada opacidade
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.strokeStyle = `rgba(255, 127, 0, ${opacityB})`; // Cor mais vibrante
            ctx.lineWidth = 0.4; // Ligeiramente mais grosso
            ctx.stroke();
          }
        }
      }
    }

    // Desenhar nós com gradiente
    nodes.forEach(node => {
      const radialGradient = ctx.createRadialGradient(
        node.x, node.y, 0,
        node.x, node.y, node.radius * 2
      );
      radialGradient.addColorStop(0, `rgba(255, 140, 0, ${node.opacity * 1.5})`); // Centro mais brilhante
      radialGradient.addColorStop(0.5, `rgba(255, 107, 0, ${node.opacity * 1.2})`); // Meio tom
      radialGradient.addColorStop(1, `rgba(255, 80, 0, ${node.opacity})`); // Borda

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * 1.1, 0, Math.PI * 2); // Nós ligeiramente maiores
      ctx.fillStyle = radialGradient;
      ctx.fill();

      // Adicionar brilho
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 127, 0, ${node.opacity * 0.15})`;
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

    // Adicionar 60 novos nós ao redor do clique
    const newNodes = Array.from({ length: 60 }, () => {
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
        className="absolute top-0 left-0 w-full h-full z-10"  
        style={{ 
          pointerEvents: 'auto',
          touchAction: 'none'
        }}
        onClick={handleCanvasClick}
      />
      {children}
    </div>
  );
}