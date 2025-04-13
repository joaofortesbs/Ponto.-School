import React, { useEffect, useRef, useState } from "react";
import { loadWebStructure, saveWebStructure } from "@/lib/web-persistence";

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  pulse: number;
  pulseSpeed: number;
}

interface AnimatedBackgroundProps {
  children?: React.ReactNode;
}

export function AnimatedBackground({ children }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Point[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const animationRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const initialized = useRef<boolean>(false);
  const hasPriority = useRef<boolean>(false);
  const clickEffectRef = useRef<{x: number, y: number, radius: number, opacity: number} | null>(null);

  // Verificar se estamos em uma página de autenticação
  useEffect(() => {
    const isAuthPage = window.location.pathname.includes('/login') || 
                       window.location.pathname.includes('/register');
    if (isAuthPage) {
      console.log("Página de autenticação detectada, priorizando carregamento das teias");
      hasPriority.current = true;
    }
  }, []);

  // Gerar cor vibrante para as teias
  const getVibrantColor = () => {
    // Cores laranja vibrante em diferentes tons
    const colors = [
      "rgba(255, 107, 0, 0.9)",   // Laranja primário
      "rgba(255, 140, 0, 0.9)",   // Laranja mais claro
      "rgba(255, 80, 0, 0.9)",    // Laranja mais avermelhado
      "rgba(255, 170, 0, 0.85)",  // Laranja amarelado
      "rgba(255, 120, 50, 0.9)"   // Laranja médio
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Criar nós apenas uma vez na inicialização
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const loadedStructure = loadWebStructure();
    if (loadedStructure && loadedStructure.nodes.length > 0) {
      console.log("Estrutura de teias já existe no localStorage, carregando instantaneamente");

      // Atualizar cores de nós antigos
      const enhancedNodes = loadedStructure.nodes.map(node => ({
        ...node,
        color: getVibrantColor(),
        pulse: Math.random() * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03
      }));

      setNodes(enhancedNodes);

      // Disparar evento para notificar que as teias foram carregadas
      document.dispatchEvent(new CustomEvent('WebTeiasProntas'));
      return;
    }

    if (hasPriority.current) {
      console.log("Criando novas teias prioritárias...");
    } else {
      console.log("Criando novas teias...");
    }

    // Definir quantidade padrão de nós com base no tamanho da tela
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Quantidade base + ajuste baseado na área da tela (mais nós para telas maiores)
    const nodeCount = 150; // Aumentado para 150 nós

    // Criar nós iniciais com posições aleatórias e cores vibrantes
    const newNodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2 + 1, // Raio entre 1 e 3 (aumentado)
      color: getVibrantColor(),
      pulse: Math.random() * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03
    }));

    setNodes(newNodes);

    // Persistir estrutura no localStorage para futuros carregamentos
    saveWebStructure(newNodes);

    setTimeout(() => {
      console.log("Novas teias geradas com sucesso:", newNodes.length);
      // Disparar evento para notificar que as teias foram carregadas
      document.dispatchEvent(new CustomEvent('WebTeiasProntas'));
    }, 100);
  }, []);

  // Configurar canvas e iniciar animação
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      setCanvasSize({ width, height });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Iniciar loop de animação
    const animate = (timestamp: number) => {
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Limitar taxa de atualização
      const frameRate = hasPriority.current ? 30 : 24; // Taxa de quadros mais alta para páginas de autenticação
      if (timestamp - lastUpdateTimeRef.current < 1000/frameRate) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      lastUpdateTimeRef.current = timestamp;

      // Limpar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Atualizar e renderizar nós
      const updatedNodes = [...nodes];

      // Atualizar posição dos nós
      updatedNodes.forEach((node, index) => {
        // Atualizar posição com velocidade
        node.x += node.vx;
        node.y += node.vy;

        // Atualizar pulsação
        node.pulse += node.pulseSpeed;
        if (node.pulse > 2) node.pulse = 0;

        // Verificar colisão com bordas
        if (node.x < 0 || node.x > canvas.width) {
          node.vx *= -1;
        }
        if (node.y < 0 || node.y > canvas.height) {
          node.vy *= -1;
        }

        // Adicionar um pequeno movimento aleatório
        if (Math.random() > 0.97) {
          node.vx += (Math.random() - 0.5) * 0.05;
          node.vy += (Math.random() - 0.5) * 0.05;

          // Limitar velocidade
          const maxSpeed = 0.5;
          const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
          if (speed > maxSpeed) {
            node.vx = (node.vx / speed) * maxSpeed;
            node.vy = (node.vy / speed) * maxSpeed;
          }
        }
      });

      // Desenhar efeito de clique se existir
      if (clickEffectRef.current) {
        const effect = clickEffectRef.current;
        effect.radius += 1.5;
        effect.opacity -= 0.02;

        if (effect.opacity <= 0) {
          clickEffectRef.current = null;
        } else {
          // Desenhar círculo de onda
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 107, 0, ${effect.opacity})`;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Desenhar círculo interno
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, effect.radius * 0.7, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 140, 0, ${effect.opacity * 0.8})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Desenhar conexões entre nós
      // Raio de conexão e alcance do cursor aumentados
      const connectionRadius = 120;
      const cursorRange = 180;

      updatedNodes.forEach((nodeA, indexA) => {
        // Calcular efeito de pulsação
        const pulseScale = 1 + Math.sin(nodeA.pulse) * 0.3;
        const displayRadius = nodeA.radius * pulseScale;

        // Renderizar nó com gradiente
        const gradient = ctx.createRadialGradient(
          nodeA.x, nodeA.y, 0,
          nodeA.x, nodeA.y, displayRadius * 2
        );

        // Extrair valores de cor base
        const baseColor = nodeA.color;

        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(1, baseColor.replace(/[^,]+(?=\))/, '0'));

        ctx.beginPath();
        ctx.arc(nodeA.x, nodeA.y, displayRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Adicionar brilho
        ctx.beginPath();
        ctx.arc(nodeA.x, nodeA.y, displayRadius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = baseColor.replace(/[^,]+(?=\))/, '0.1');
        ctx.fill();

        // Distância do mouse
        const dx = nodeA.x - mousePosition.x;
        const dy = nodeA.y - mousePosition.y;
        const distanceToMouse = Math.sqrt(dx * dx + dy * dy);

        // Verificar conexões com outros nós
        updatedNodes.forEach((nodeB, indexB) => {
          if (indexA === indexB) return;

          const distance = Math.sqrt(
            Math.pow(nodeA.x - nodeB.x, 2) + Math.pow(nodeA.y - nodeB.y, 2)
          );

          // Desenhar conexão se estiver dentro do raio de conexão
          if (distance < connectionRadius) {
            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);

            // Opacidade baseada na distância
            const opacity = 1 - distance / connectionRadius;
            const colorBase = distanceToMouse < cursorRange * 0.8 ? 
                             "rgba(255, 107, 0," : 
                             "rgba(255, 255, 255,";

            // Cor mais vibrante para conexões próximas ao cursor
            ctx.strokeStyle = `${colorBase} ${opacity * 0.25})`;
            ctx.lineWidth = opacity * 1.5;
            ctx.stroke();
          }

          // Desenhar conexão adicional se ambos os nós estiverem próximos ao cursor
          const dxB = nodeB.x - mousePosition.x;
          const dyB = nodeB.y - mousePosition.y;
          const distanceBToMouse = Math.sqrt(dxB * dxB + dyB * dyB);

          if (distanceBToMouse < cursorRange && distanceToMouse < cursorRange) {
            const opacityB = (1 - Math.max(distanceToMouse, distanceBToMouse) / cursorRange) * 0.8;
            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);

            // Degradê para as conexões do cursor
            const gradient = ctx.createLinearGradient(nodeA.x, nodeA.y, nodeB.x, nodeB.y);
            gradient.addColorStop(0, `rgba(255, 107, 0, ${opacityB})`);
            gradient.addColorStop(1, `rgba(255, 170, 0, ${opacityB})`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.5 * opacityB;
            ctx.stroke();

            // Desenhar brilho ao longo da linha
            ctx.lineWidth = 4 * opacityB;
            ctx.strokeStyle = `rgba(255, 107, 0, ${opacityB * 0.3})`;
            ctx.stroke();
          }
        });
      });

      setNodes(updatedNodes);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    // Limpar event listeners ao desmontar
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [nodes, mousePosition]);

  // Rastrear posição do mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Adicionar listener para atualização forçada
    const handleForceUpdate = () => {
      console.log("Atualizando teias forçadamente");
    };
    document.addEventListener('ForceWebTeiaUpdate', handleForceUpdate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener('ForceWebTeiaUpdate', handleForceUpdate);
    };
  }, []);

  // Adicionar novos nós ao clicar
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const x = e.clientX;
    const y = e.clientY;

    // Efeito de onda ao clicar
    clickEffectRef.current = {
      x,
      y,
      radius: 5,
      opacity: 1
    };

    // Adicionar 40 novos nós ao redor do clique
    const newNodes = Array.from({ length: 40 }, () => {
      const radius = Math.random() * 2 + 1;
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 70;

      return {
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius,
        color: getVibrantColor(),
        pulse: Math.random() * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03
      };
    });

    setNodes((prev) => [...prev, ...newNodes]);
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        onClick={handleClick}
      />
      {children}
    </div>
  );
}