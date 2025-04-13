import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { persistWebs, getStoredWebs } from "@/lib/web-persistence";

interface WebNode {
  id: number;
  x: number;
  y: number;
  connections: number[];
  opacity: number;
  size: number;
  glow: boolean;
}

interface WebConnection {
  id1: number;
  id2: number;
  opacity: number;
}

interface AnimatedBackgroundProps {
  children?: React.ReactNode;
}

export function AnimatedBackground({ children }: AnimatedBackgroundProps) {
  const [webNodes, setWebNodes] = useState<WebNode[]>([]);
  const [webConnections, setWebConnections] = useState<WebConnection[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const isAuthPage = window.location.pathname.includes('/login') || window.location.pathname.includes('/register');

  // Função principal para inicializar teias, otimizada para carregar rapidamente
  useEffect(() => {
    // Criar fallback imediato para garantir renderização
    const fallbackTimer = setTimeout(() => {
      if (!isInitialized) {
        console.log("Página de autenticação detectada, priorizando carregamento das teias");
        initializeWebsImmediately();
      }
    }, 100);

    // Função para inicialização imediata
    const initializeWebsImmediately = () => {
      // Tentar carregar teias do armazenamento local primeiro
      const storedWebs = getStoredWebs();

      if (storedWebs && storedWebs.nodes.length > 0) {
        setWebNodes(storedWebs.nodes);
        setWebConnections(storedWebs.connections);
        setIsInitialized(true);

        // Disparar evento para indicar que as teias estão prontas
        document.dispatchEvent(new CustomEvent('WebTeiasProntas'));
        console.log("Teias carregadas do localStorage:", storedWebs.nodes.length);
      } else {
        // Se não houver dados salvos, gerar novas teias
        console.log("Criando novas teias prioritárias...");
        generateWebNodes(true);
      }
    };

    // Iniciar imediatamente se for página de autenticação
    if (isAuthPage) {
      initializeWebsImmediately();
    } else {
      // Para outras páginas, podemos carregar normalmente
      const storedWebs = getStoredWebs();

      if (storedWebs && storedWebs.nodes.length > 0) {
        setWebNodes(storedWebs.nodes);
        setWebConnections(storedWebs.connections);
        setIsInitialized(true);
        document.dispatchEvent(new CustomEvent('WebTeiasProntas'));
      } else {
        generateWebNodes(false);
      }
    }

    return () => clearTimeout(fallbackTimer);
  }, [isAuthPage]);

  // Função otimizada para gerar os nós da teia
  const generateWebNodes = (isPriority = false) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const nodeCount = isPriority ? 150 : 120; // Mais nós para páginas de autenticação
    const newWebNodes: WebNode[] = [];

    // Garantir que os nós não saiam da tela
    const margin = Math.min(width, height) * 0.05; // 5% de margem

    for (let i = 0; i < nodeCount; i++) {
      // Posicionar os nós dentro dos limites, considerando as margens
      const x = margin + Math.random() * (width - 2 * margin);
      const y = margin + Math.random() * (height - 2 * margin);

      newWebNodes.push({
        id: i,
        x,
        y,
        connections: [],
        opacity: 0.15 + Math.random() * 0.35, // Mais visível
        size: 1.5 + Math.random() * 2.5, // Tamanho variável maior
        glow: Math.random() > 0.8, // 20% dos nós têm brilho
      });
    }

    // Criar conexões entre os nós
    const connections: WebConnection[] = [];
    const maxDistance = Math.min(width, height) * 0.25; // 25% da menor dimensão

    for (let i = 0; i < nodeCount; i++) {
      const node1 = newWebNodes[i];
      // Cada nó se conecta a até 3 outros nós
      const maxConnections = 2 + Math.floor(Math.random() * 2);
      let connectionsCount = 0;

      for (let j = 0; j < nodeCount && connectionsCount < maxConnections; j++) {
        if (i !== j) {
          const node2 = newWebNodes[j];
          const dx = node1.x - node2.x;
          const dy = node1.y - node2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            // Não repetir conexões já existentes
            if (!connections.some(c =>
              (c.id1 === i && c.id2 === j) ||
              (c.id1 === j && c.id2 === i)
            )) {
              connections.push({
                id1: i,
                id2: j,
                opacity: 0.1 + Math.random() * 0.2, // Ajustado para melhor visibilidade
              });

              node1.connections.push(j);
              newWebNodes[j].connections.push(i);
              connectionsCount++;
            }
          }
        }
      }
    }

    setWebNodes(newWebNodes);
    setWebConnections(connections);
    setIsInitialized(true);

    // Persistir as teias no armazenamento local
    persistWebs(newWebNodes, connections);

    // Disparar evento para indicar que as teias estão prontas
    document.dispatchEvent(new CustomEvent('WebTeiasProntas'));

    // Log para depuração
    if (isPriority) {
      console.log("Novas teias geradas com sucesso:", nodeCount);
    } else {
      // Otimização em segundo plano para páginas não-auth
      setTimeout(() => {
        console.log("Teias otimizadas em segundo plano:", nodeCount);
      }, 500);
    }
  };

  // Acompanhar a posição do mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => {
      setIsClicking(true);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Adicionar novos nós ao clicar
  useEffect(() => {
    if (!isClicking || !isInitialized) return;

    const addNewWebAtMousePosition = () => {
      const newId = webNodes.length;
      const newNode: WebNode = {
        id: newId,
        x: mousePosition.x,
        y: mousePosition.y,
        connections: [],
        opacity: 0.4 + Math.random() * 0.4, // Mais visível
        size: 2.5 + Math.random() * 3, // Um pouco maior
        glow: true, // Sempre brilha
      };

      // Conectar a nós próximos
      const newConnections: WebConnection[] = [];
      const maxDistance = 200;
      let connectionsCount = 0;
      const maxNewConnections = 3;

      webNodes.forEach((existingNode) => {
        const dx = newNode.x - existingNode.x;
        const dy = newNode.y - existingNode.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance && connectionsCount < maxNewConnections) {
          newConnections.push({
            id1: newId,
            id2: existingNode.id,
            opacity: 0.2 + Math.random() * 0.3, // Mais visível
          });

          newNode.connections.push(existingNode.id);
          existingNode.connections.push(newId);
          connectionsCount++;
        }
      });

      // Atualizar o estado
      setWebNodes(prev => [...prev, newNode]);
      setWebConnections(prev => [...prev, ...newConnections]);

      // Persistir as teias atualizadas
      persistWebs([...webNodes, newNode], [...webConnections, ...newConnections]);
    };

    addNewWebAtMousePosition();

  }, [isClicking, mousePosition, isInitialized, webNodes, webConnections]);

  // Disparar evento de atualização de teias quando solicitado
  useEffect(() => {
    const handleForceUpdate = () => {
      console.log("Atualizando teias forçadamente");
      if (!isInitialized || webNodes.length === 0) {
        generateWebNodes(true);
      } else {
        document.dispatchEvent(new CustomEvent('WebTeiasProntas'));
      }
    };

    document.addEventListener('ForceWebTeiaUpdate', handleForceUpdate);

    return () => {
      document.removeEventListener('ForceWebTeiaUpdate', handleForceUpdate);
    };
  }, [isInitialized, webNodes]);

  return (
    <div ref={canvasRef} className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
      {/* Efeito de gradiente escuro no fundo */}
      <div className="absolute inset-0 bg-[#001427] opacity-90 z-0"></div>

      {/* Container otimizado para renderização de SVGs */}
      <div className="absolute inset-0 z-1">
        {/* Renderizar as conexões */}
        {isInitialized && webConnections.map((connection) => {
          const node1 = webNodes.find(n => n.id === connection.id1);
          const node2 = webNodes.find(n => n.id === connection.id2);

          if (!node1 || !node2) return null;

          return (
            <svg
              key={`connection-${connection.id1}-${connection.id2}`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                opacity: 1,
              }}
            >
              <line
                x1={node1.x}
                y1={node1.y}
                x2={node2.x}
                y2={node2.y}
                stroke="#FF6B00"
                strokeOpacity={connection.opacity}
                strokeWidth={0.75}
              />
            </svg>
          );
        })}
      </div>

      {/* Renderizar os nós */}
      {isInitialized && webNodes.map((node) => (
        <div
          key={`node-${node.id}`}
          className={`absolute rounded-full ${node.glow ? 'animate-node-pulse' : ''}`}
          style={{
            top: node.y,
            left: node.x,
            width: node.size,
            height: node.size,
            backgroundColor: "#FF6B00",
            opacity: node.opacity,
            transform: "translate(-50%, -50%)",
            boxShadow: node.glow
              ? `0 0 6px 3px rgba(255, 107, 0, 0.5), 0 0 12px 8px rgba(255, 107, 0, 0.3)`
              : "none",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      ))}

      {/* Renderizar o conteúdo filho */}
      <div className="relative z-10 pointer-events-auto">{children}</div>
    </div>
  );
}