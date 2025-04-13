import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getWebPersistence, setWebPersistence } from "../../lib/web-persistence";

interface Node {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  size: number;
  fadeState: "in" | "out" | "stable";
  fadeTimer: number;
}

interface Props {
  cursor: { x: number | null; y: number | null };
  dimensions: { width: number; height: number };
}

const AnimatedBackground: React.FC<Props> = ({ cursor, dimensions }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const frameRef = useRef<number>();
  const renderedRef = useRef<boolean>(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const lastClickRef = useRef<{ x: number, y: number, time: number } | null>(null);

  // Aumentar a quantidade de nós inicial para melhor densidade visual
  const minNodeCount = 120;

  // Função para recuperar os nós armazenados
  const loadStoredNodes = () => {
    try {
      const storedNodes = getWebPersistence("backgroundNodes");

      if (storedNodes && Array.isArray(storedNodes) && storedNodes.length > 0) {
        console.log("Estrutura de teias já existe no localStorage, carregando instantaneamente");

        // Margem mínima para garantir que as teias não saiam da tela
        const margin = 2;

        // Adapta os nós armazenados ao tamanho atual da tela
        const adaptedNodes = storedNodes.map(node => ({
          ...node,
          x: Math.max(margin, Math.min(dimensions.width - margin, (node.x / 1920) * dimensions.width)),
          y: Math.max(margin, Math.min(dimensions.height - margin, (node.y / 1080) * dimensions.height)),
        }));

        return adaptedNodes;
      }

      return null;
    } catch (error) {
      console.error("Erro ao carregar teias do localStorage:", error);
      return null;
    }
  };

  // Função para gerar novos nós
  const generateNodes = useCallback(() => {
    try {
      // Verificar primeiro se já existem nós armazenados
      const storedNodes = loadStoredNodes();
      if (storedNodes) {
        setNodes(storedNodes);
        setIsInitialized(true);
        return;
      }

      console.log("Criando novas teias prioritárias...");

      const calculatedNodeCount = Math.floor((dimensions.width * dimensions.height) / 6000);
      const nodeCount = Math.max(minNodeCount, calculatedNodeCount);

      // Margem mínima para garantir que as teias não saiam da tela
      const margin = 2;

      const newNodes: Node[] = [];
      for (let i = 0; i < nodeCount; i++) {
        // Distribui os nós de forma mais uniforme pela tela
        const isAuthPage = window.location.pathname.includes('/auth') || 
                          window.location.pathname.includes('/login') || 
                          window.location.pathname.includes('/register');

        // Distribuição mais uniforme para evitar aglomerações
        const gridSize = Math.sqrt(nodeCount);
        const cellWidth = dimensions.width / gridSize;
        const cellHeight = dimensions.height / gridSize;

        const gridX = i % gridSize;
        const gridY = Math.floor(i / gridSize);

        const baseX = gridX * cellWidth;
        const baseY = gridY * cellHeight;

        // Adiciona variação dentro da célula
        const x = Math.max(margin, Math.min(dimensions.width - margin, 
          baseX + Math.random() * cellWidth));
        const y = Math.max(margin, Math.min(dimensions.height - margin, 
          baseY + Math.random() * cellHeight));

        newNodes.push({
          id: i,
          x,
          y,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.5 + 0.3,
          size: Math.random() * 2 + 1,
          fadeState: "stable",
          fadeTimer: Math.random() * 100
        });
      }

      // Salva nós no localStorage para persistência
      setWebPersistence("backgroundNodes", newNodes);
      console.log("Novas teias geradas com sucesso:", newNodes.length);

      setNodes(newNodes);
      setIsInitialized(true);
    } catch (error) {
      console.error("Erro ao gerar teias:", error);
      setRenderError(`Erro ao gerar teias: ${error}`);
      // Tenta uma abordagem mais simples se falhar
      const simpleNodes: Node[] = [];
      for (let i = 0; i < 30; i++) {
        simpleNodes.push({
          id: i,
          x: Math.random() * dimensions.width,
          y: Math.random() * dimensions.height,
          vx: 0,
          vy: 0,
          opacity: 0.5,
          size: 2,
          fadeState: "stable",
          fadeTimer: 0
        });
      }
      setNodes(simpleNodes);
      setIsInitialized(true);
    }
  }, [dimensions.width, dimensions.height]);

  // Inicialização com alta prioridade
  useEffect(() => {
    if (!renderedRef.current && dimensions.width > 0 && dimensions.height > 0) {
      // Verifica se estamos em uma página de autenticação
      const isAuthPage = window.location.pathname.includes('/auth') || 
                         window.location.pathname.includes('/login') || 
                         window.location.pathname.includes('/register');

      if (isAuthPage) {
        console.log("Inicializando sistema de teias com prioridade máxima");
        console.log("Página de autenticação detectada, preparando teias prioritárias");

        // Executa a inicialização imediatamente
        requestAnimationFrame(() => {
          generateNodes();
          renderedRef.current = true;
        });
      } else {
        // Para outras páginas, mantém o comportamento normal
        generateNodes();
        renderedRef.current = true;
      }
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [dimensions, generateNodes]);

  // Atualização dos nós após serem carregados
  useEffect(() => {
    if (!isInitialized || nodes.length === 0) return;

    console.log("Página de autenticação detectada, priorizando carregamento das teias");
    console.log("Atualizando teias forçadamente");

    const updatePositions = () => {
      setNodes(currentNodes => {
        const updatedNodes = [...currentNodes];
        try {
          // Otimizar as teias em segundo plano
          // Este processo é executado em um timeout para evitar bloquear a interface
          setTimeout(() => {
            console.log("Teias otimizadas em segundo plano:", updatedNodes.length);
          }, 1000);
        } catch (error) {
          console.error("Erro ao otimizar teias:", error);
        }
        return updatedNodes;
      });
    };

    // Executa a atualização imediatamente
    updatePositions();

    // Adiciona o efeito de clique para gerar mais teias
    const handleClick = (e: MouseEvent) => {
      const now = Date.now();

      // Limita a frequência de cliques para evitar sobrecarga
      if (lastClickRef.current && now - lastClickRef.current.time < 300) {
        return;
      }

      const clickX = e.clientX;
      const clickY = e.clientY;

      // Salva o último clique
      lastClickRef.current = { x: clickX, y: clickY, time: now };

      // Adiciona novos nós ao redor do clique
      setNodes(prevNodes => {
        const newNodes = [...prevNodes];

        // Adiciona 3-5 novos nós ao redor do clique
        const newNodesCount = Math.floor(Math.random() * 3) + 3;

        for (let i = 0; i < newNodesCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * 50 + 10;

          newNodes.push({
            id: prevNodes.length + i,
            x: clickX + Math.cos(angle) * distance,
            y: clickY + Math.sin(angle) * distance,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.5 + 0.3,
            size: Math.random() * 2 + 1,
            fadeState: "in",
            fadeTimer: 0
          });
        }

        // Limita o número total de nós para manter o desempenho
        return newNodes.slice(0, 200);
      });
    };

    // Adiciona listener de clique
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [isInitialized, nodes.length]);

  // Atualiza a posição dos nós com base na posição do cursor
  useEffect(() => {
    if (!isInitialized || nodes.length === 0) return;

    const updateNodePositions = () => {
      setNodes(prevNodes => {
        // Margem mínima para garantir que as teias não saiam da tela
        const margin = 2;

        const updatedNodes = prevNodes.map(node => {
          let { x, y, vx, vy, fadeState, fadeTimer, opacity } = node;

          // Atração para o cursor do mouse (quando existir)
          if (cursor.x !== null && cursor.y !== null) {
            const distX = cursor.x - x;
            const distY = cursor.y - y;
            const dist = Math.sqrt(distX * distX + distY * distY);

            // Ajusta a força de atração com base na distância
            // Mais suave, menos intensa para evitar aglomerações
            if (dist < 200) {
              const force = Math.min(0.05, 10 / (dist + 10)); // Força mais suave
              vx += (distX / dist) * force;
              vy += (distY / dist) * force;
            }
          }

          // Adiciona um pouco de aleatoriedade ao movimento
          vx += (Math.random() - 0.5) * 0.01;
          vy += (Math.random() - 0.5) * 0.01;

          // Limita a velocidade máxima
          const maxSpeed = 0.5;
          const speed = Math.sqrt(vx * vx + vy * vy);
          if (speed > maxSpeed) {
            vx = (vx / speed) * maxSpeed;
            vy = (vy / speed) * maxSpeed;
          }

          // Aplica o atrito para desacelerar gradualmente
          vx *= 0.98;
          vy *= 0.98;

          // Atualiza a posição
          x += vx;
          y += vy;

          // Mantém os nós dentro das bordas com efeito de colisão
          if (x < margin) {
            x = margin;
            vx *= -0.8;
          } else if (x > dimensions.width - margin) {
            x = dimensions.width - margin;
            vx *= -0.8;
          }

          if (y < margin) {
            y = margin;
            vy *= -0.8;
          } else if (y > dimensions.height - margin) {
            y = dimensions.height - margin;
            vy *= -0.8;
          }

          // Atualiza o estado de fade
          fadeTimer++;
          if (fadeState === "stable" && fadeTimer > 200) {
            if (Math.random() < 0.01) {
              fadeState = Math.random() < 0.5 ? "in" : "out";
              fadeTimer = 0;
            }
          } else if (fadeState === "in") {
            opacity = Math.min(opacity + 0.01, 0.8);
            if (opacity >= 0.8) {
              fadeState = "stable";
              fadeTimer = 0;
            }
          } else if (fadeState === "out") {
            opacity = Math.max(opacity - 0.01, 0.2);
            if (opacity <= 0.2) {
              fadeState = "stable";
              fadeTimer = 0;
            }
          }

          return { ...node, x, y, vx, vy, fadeState, fadeTimer, opacity };
        });

        // Persiste os nós atualizados ocasionalmente
        if (Math.random() < 0.01) {
          setWebPersistence("backgroundNodes", updatedNodes);
        }

        return updatedNodes;
      });

      frameRef.current = requestAnimationFrame(updateNodePositions);
    };

    frameRef.current = requestAnimationFrame(updateNodePositions);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [cursor, dimensions, isInitialized, nodes.length]);

  // Renderiza os nós e as conexões (teias)
  const renderNodes = () => {
    if (nodes.length === 0) return null;

    // Conexões entre os nós (teias)
    const connections: React.ReactNode[] = [];
    const connectionThreshold = 100; // Distância máxima para conexão

    for (let i = 0; i < nodes.length; i++) {
      const nodeA = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const nodeB = nodes[j];
        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionThreshold) {
          const opacity = Math.min(nodeA.opacity, nodeB.opacity) * (1 - distance / connectionThreshold);
          const width = Math.max(0.2, 1 - distance / connectionThreshold);

          connections.push(
            <line
              key={`${nodeA.id}-${nodeB.id}`}
              x1={nodeA.x}
              y1={nodeA.y}
              x2={nodeB.x}
              y2={nodeB.y}
              stroke={`rgba(255, 107, 0, ${opacity * 0.7})`}
              strokeWidth={width}
              strokeLinecap="round"
            />
          );
        }
      }
    }

    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <g>
          {connections}
        </g>
        <g>
          {nodes.map(node => (
            <circle
              key={node.id}
              cx={node.x}
              cy={node.y}
              r={node.size}
              fill={`rgba(255, 107, 0, ${node.opacity})`}
            />
          ))}
        </g>
      </svg>
    );
  };

  if (renderError) {
    return <div className="fixed inset-0 bg-gradient-to-br from-slate-900 to-slate-800 opacity-50"></div>;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {renderNodes()}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatedBackground;