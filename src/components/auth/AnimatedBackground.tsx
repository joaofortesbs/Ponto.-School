import React, { useEffect, useRef, useState, useCallback } from "react";
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
  opacity?: number; // Opacidade para efeito fade in/out
  fadeState?: 'in' | 'out' | 'stable'; // Estado de fade
  fadeTimer?: number; // Contador para controle de fade
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
  const fadingNodesRef = useRef<{[key: string]: boolean}>({});

  // Função para criar novos nós na posição do cursor (para o efeito de clique)
  const createNodesAtCursor = useCallback((x: number, y: number, count: number = 5) => {
    if (!containerRef.current) return [];
    
    const { width, height } = dimensions;
    const newNodes: Node[] = [];
    
    // Margem de segurança para manter longe das bordas
    const margin = Math.min(width, height) * 0.1;
    
    for (let i = 0; i < count; i++) {
      // Posição aleatória ao redor do cursor (numa área pequena)
      const randomAngle = Math.random() * Math.PI * 2;
      const randomRadius = Math.random() * 50; // Raio máximo de 50px ao redor do cursor
      const nodeX = Math.min(Math.max(margin, x + Math.cos(randomAngle) * randomRadius), width - margin);
      const nodeY = Math.min(Math.max(margin, y + Math.sin(randomAngle) * randomRadius), height - margin);
      
      newNodes.push({
        x: nodeX,
        y: nodeY,
        size: Math.random() * 2 + 1,
        connections: [],
        id: Math.random().toString(36).substring(2, 15),
        velocity: { 
          x: (Math.random() - 0.5) * 0.3, // Velocidade inicial mais lenta
          y: (Math.random() - 0.5) * 0.3
        },
        opacity: 0, // Começa invisível
        fadeState: 'in', // Estado inicial: fade in
        fadeTimer: 0 // Timer inicial
      });
    }
    
    return newNodes;
  }, [dimensions]);
  
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

      // Margem mínima para garantir que as teias não saiam da tela
      const margin = 2;
      
      // Adapta os nós armazenados ao tamanho atual da tela
      const adaptedNodes = storedNodes.map(node => ({
        ...node,
        // Garantir que os nós estejam dentro dos limites atuais com margem
        x: Math.min(Math.max(margin, node.x), width - margin),
        y: Math.min(Math.max(margin, node.y), height - margin),
        connections: [],
        velocity: { 
          x: (Math.random() - 0.5) * 0.5, 
          y: (Math.random() - 0.5) * 0.5 
        },
        opacity: Math.random() * 0.3 + 0.2, // Opacidade inicial aleatória
        fadeState: Math.random() > 0.7 ? 'in' : 'stable', // 30% de chance de começar em fade in
        fadeTimer: Math.floor(Math.random() * 200) // Timer aleatório
      }));

      return adaptedNodes;
    } catch (error) {
      console.error('Erro ao carregar nós do localStorage:', error);
      return null;
    }
  };

  // Inicializa os nós da teia - otimizado para renderização instantânea como prioridade máxima
  useEffect(() => {
    // Função para criar conexões entre nós
    const createConnections = (nodesList: Node[]) => {
      return nodesList.map((node, index) => {
        // Se já tiver conexões, preservar para evitar recálculos
        if (node.connections && node.connections.length > 0) {
          return node;
        }

        const connections: number[] = [];
        for (let j = 0; j < nodesList.length; j++) {
          if (j !== index) {
            const distance = Math.sqrt(
              Math.pow(nodesList[j].x - node.x, 2) + 
              Math.pow(nodesList[j].y - node.y, 2)
            );

            // Verificar distância mínima entre nós para evitar aglomeração
            const minDistance = 30; // Distância mínima entre nós
            
            if (distance > minDistance && distance < 300) {
              connections.push(j);
              if (connections.length >= 4) break; // Limitar a 4 conexões por nó
            }
          }
        }
        return { ...node, connections };
      });
    };

    // Função para criar novos nós
    const createNewNodes = (width: number, height: number): Node[] => {
      // Usar um número fixo maior de nós para telas pequenas para garantir visual consistente
      const minNodeCount = 150; // Aumentado para 150
      const calculatedNodeCount = Math.floor((width * height) / 6000); // Densidade aumentada
      const nodeCount = Math.max(minNodeCount, calculatedNodeCount);

      // Margem mínima para garantir que as teias não saiam da tela
      const margin = 2;
      
      const newNodes: Node[] = [];
      for (let i = 0; i < nodeCount; i++) {
        // Posicionar nós afastados das bordas
        const nodeX = margin + Math.random() * (width - 2 * margin);
        const nodeY = margin + Math.random() * (height - 2 * margin);
        
        newNodes.push({
          x: nodeX,
          y: nodeY,
          size: Math.random() * 2 + 1,
          connections: [],
          id: Math.random().toString(36).substring(2, 15),
          velocity: { 
            x: (Math.random() - 0.5) * 0.5, 
            y: (Math.random() - 0.5) * 0.5 
          },
          opacity: Math.random() * 0.3 + 0.2, // Opacidade inicial aleatória
          fadeState: Math.random() > 0.7 ? 'in' : 'stable', // 30% de chance de começar em fade in
          fadeTimer: Math.floor(Math.random() * 200) // Timer aleatório
        });
      }

      return newNodes;
    };

    // Prioridade máxima para renderização instantânea
    const initializeNodesWithHighestPriority = () => {
      if (!containerRef.current) return;

      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });

      // Carregamento acelerado de nós persistidos
      try {
        // Acesso síncrono e direto ao localStorage para máxima velocidade
        const storedNodesString = localStorage.getItem(NODES_STORAGE_KEY);

        if (storedNodesString) {
          const storedNodes = JSON.parse(storedNodesString);

          if (Array.isArray(storedNodes) && storedNodes.length > 0) {
            // Margem de segurança para manter longe das bordas
            const margin = Math.min(width, height) * 0.1;
            
            // Adaptação imediata sem recálculos pesados
            const adaptedNodes = storedNodes.map(node => ({
              ...node,
              x: Math.min(Math.max(margin, node.x * width / window.innerWidth), width - margin),
              y: Math.min(Math.max(margin, node.y * height / window.innerHeight), height - margin),
              // Manter conexões existentes para evitar recálculos
              connections: node.connections || [],
              velocity: { 
                x: (Math.random() - 0.5) * 0.5, 
                y: (Math.random() - 0.5) * 0.5 
              },
              opacity: Math.random() * 0.3 + 0.2, // Opacidade inicial aleatória
              fadeState: Math.random() > 0.7 ? 'in' : 'stable', // 30% de chance de começar em fade in
              fadeTimer: Math.floor(Math.random() * 200) // Timer aleatório
            }));

            // Aplicar nós imediatamente
            setNodes(adaptedNodes);

            // Otimização secundária em segundo plano
            requestIdleCallback(() => {
              const nodesWithConnections = createConnections(adaptedNodes);
              setNodes(nodesWithConnections);
              saveNodesToStorage(nodesWithConnections);
              console.log("Teias otimizadas em segundo plano:", nodesWithConnections.length);
            });

            return;
          }
        }

        // Fallback para criação rápida
        console.log("Criando novas teias prioritárias...");
        const newNodes = createNewNodes(width, height);
        setNodes(newNodes);

        // Otimizar em segundo plano depois da renderização inicial
        requestAnimationFrame(() => {
          const nodesWithConnections = createConnections(newNodes);
          setNodes(nodesWithConnections);
          saveNodesToStorage(nodesWithConnections);
          console.log("Novas teias geradas com sucesso:", nodesWithConnections.length);
        });

      } catch (error) {
        console.error('Erro ao processar teias:', error);
        // Fallback ultra-rápido
        const newNodes = createNewNodes(width, height);
        setNodes(newNodes);
      }
    };

    // Inicialização com prioridade máxima
    initializeNodesWithHighestPriority();

    // Forçar update quando solicitado (troca de páginas, login, etc)
    const handleForceUpdate = () => {
      console.log("Atualizando teias forçadamente");
      initializeNodesWithHighestPriority();
    };

    document.addEventListener("ForceWebTeiaUpdate", handleForceUpdate);

    // Eventos
    window.addEventListener("resize", initializeNodesWithHighestPriority);
    window.addEventListener("beforeunload", () => saveNodesToStorage(nodes));

    return () => {
      document.removeEventListener("ForceWebTeiaUpdate", handleForceUpdate);
      window.removeEventListener("resize", initializeNodesWithHighestPriority);
      window.removeEventListener("beforeunload", () => saveNodesToStorage(nodes));
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
    
    // Manipulador para cliques do mouse - adiciona novas teias
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Cria de 3 a 7 novos nós na posição do clique
        const newCount = Math.floor(Math.random() * 5) + 3;
        const newClickNodes = createNodesAtCursor(mouseX, mouseY, newCount);
        
        setNodes(prevNodes => {
          const updatedNodes = [...prevNodes, ...newClickNodes];
          
          // Recalcular conexões apenas para os novos nós
          return updatedNodes.map((node, index) => {
            // Só processa novos nós
            if (newClickNodes.some(n => n.id === node.id)) {
              const connections: number[] = [];
              
              // Conectar com nós existentes
              for (let j = 0; j < updatedNodes.length; j++) {
                if (updatedNodes[j].id !== node.id) {
                  const distance = Math.sqrt(
                    Math.pow(updatedNodes[j].x - node.x, 2) + 
                    Math.pow(updatedNodes[j].y - node.y, 2)
                  );
                  
                  const minDistance = 30; // Distância mínima
                  
                  if (distance > minDistance && distance < 200) {
                    connections.push(j);
                    if (connections.length >= 3) break;
                  }
                }
              }
              
              return { ...node, connections };
            }
            
            return node;
          });
        });
      }
    };

    // Atualiza a posição dos nós com base na posição do cursor
    const updateNodePositions = () => {
      setNodes(prevNodes => {
        // Margem mínima para garantir que as teias não saiam da tela
        const margin = 2;
        
        const updatedNodes = prevNodes.map(node => {
          let { x, y, fadeState, fadeTimer, opacity } = node;
          const { width, height } = dimensions;

          // Atualizar estado de fade in/out
          if (!fadeState) fadeState = 'stable';
          if (!fadeTimer) fadeTimer = 0;
          if (opacity === undefined) opacity = 0.3;
          
          // Lógica de fade in/out
          if (fadeState === 'in') {
            opacity = Math.min(0.5, opacity + 0.01);
            fadeTimer++;
            
            if (opacity >= 0.5 || fadeTimer > 60) {
              fadeState = 'stable';
              fadeTimer = 0;
            }
          } else if (fadeState === 'out') {
            opacity = Math.max(0.1, opacity - 0.01);
            fadeTimer++;
            
            if (opacity <= 0.1 || fadeTimer > 60) {
              fadeState = 'in';
              fadeTimer = 0;
            }
          } else {
            // Em estado estável, chance aleatória de mudar para fade in/out
            fadeTimer++;
            if (fadeTimer > 200) {
              // A cada ~3 segundos, 15% de chance de mudar de estado
              if (Math.random() < 0.15) {
                fadeState = Math.random() < 0.5 ? 'in' : 'out';
                fadeTimer = 0;
              } else {
                fadeTimer = Math.floor(Math.random() * 100); // Reset parcial do timer
              }
            }
          }

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
            const attractionRange = 180; // Reduzido de 200 para 180
            const baseFactor = 0.01; // Fator de atração base reduzido de 0.02 para 0.01

            if (distance < attractionRange) {
              // Fator de atração aumenta conforme se aproxima do cursor - reduzido
              const attractFactor = baseFactor + (0.05 * (1 - distance / attractionRange)); // Reduzido de 0.1 para 0.05

              // Adiciona velocidade em direção ao cursor
              newVelocity = {
                x: node.velocity.x + (dx / (distance || 1)) * attractFactor,
                y: node.velocity.y + (dy / (distance || 1)) * attractFactor
              };
            } else {
              // Mesmo longe, há uma leve atração
              newVelocity = {
                x: node.velocity.x + (dx / (distance || 1)) * baseFactor * 0.05, // Reduzido de 0.1 para 0.05
                y: node.velocity.y + (dy / (distance || 1)) * baseFactor * 0.05
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

          // Manter dentro dos limites com margem de segurança
          if (x < margin) { x = margin; newVelocity.x *= -0.5; }
          if (x > width - margin) { x = width - margin; newVelocity.x *= -0.5; }
          if (y < margin) { y = margin; newVelocity.y *= -0.5; }
          if (y > height - margin) { y = height - margin; newVelocity.y *= -0.5; }

          // Verificar distância mínima com outros nós
          const minDistanceToNode = 30; // Distância mínima entre nós
          for (const otherNode of prevNodes) {
            if (otherNode.id === node.id) continue;
            
            const dx = otherNode.x - x;
            const dy = otherNode.y - y;
            const distanceToNode = Math.sqrt(dx * dx + dy * dy);
            
            if (distanceToNode < minDistanceToNode) {
              // Aplicar uma pequena força de repulsão
              const repulsionFactor = 0.02;
              newVelocity.x -= (dx / distanceToNode) * repulsionFactor;
              newVelocity.y -= (dy / distanceToNode) * repulsionFactor;
            }
          }

          return {
            ...node,
            x,
            y,
            velocity: newVelocity,
            opacity,
            fadeState,
            fadeTimer
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
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationFrame);
    };
  }, [dimensions, createNodesAtCursor]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-hidden bg-gradient-to-br from-brand-primary/5 to-gray-900/30 dark:from-gray-900/80 dark:to-brand-primary/20"
    >
      {/* Nós regulares da teia - renderização otimizada com efeito fade in/out */}
      {nodes.map((node, index) => (
        <div
          key={`node-${node.id || index}`}
          className="absolute rounded-full bg-white/80 dark:bg-brand-primary/80 animate-pulse-soft"
          style={{
            width: node.size,
            height: node.size,
            filter: "blur(0.5px)",
            left: node.x,
            top: node.y,
            animationDelay: `${Math.random() * 2}s`,
            opacity: node.opacity || 0.3,
            transition: "opacity 0.8s ease-in-out"
          }}
        />
      ))}

      {/* Conexões para nós regulares - otimizado para performance */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 107, 0, 0.15)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.35)" />
          </linearGradient>
        </defs>

        {/* Linhas entre nós regulares - renderização mais eficiente */}
        {nodes.map((node, index) =>
          // Limitar o número de conexões renderizadas para melhor performance
          node.connections?.slice(0, 3).map((targetIndex) => {
            const target = nodes[targetIndex];
            if (!target) return null;

            // Calcula a distância até o mouse - simplificado
            const lineCenter = {
              x: (node.x + target.x) / 2,
              y: (node.y + target.y) / 2
            };

            const distanceToMouse = Math.sqrt(
              Math.pow(lineCenter.x - mousePosition.x, 2) + 
              Math.pow(lineCenter.y - mousePosition.y, 2)
            );

            // Calcular opacidade baseada nas opacidades dos nós
            const nodeOpacity = node.opacity || 0.3;
            const targetOpacity = target.opacity || 0.3;
            const baseOpacity = (nodeOpacity + targetOpacity) / 2 * 0.5;

            // Opacidade otimizada para performance
            const maxDistance = 200;
            const opacityBase = baseOpacity; 
            const opacityBoost = Math.max(0, 1 - distanceToMouse / maxDistance) * 0.4; // Reduzido de 0.6 para 0.4

            return (
              <line
                key={`line-${node.id || index}-${target.id || targetIndex}`}
                x1={node.x}
                y1={node.y}
                x2={target.x}
                y2={target.y}
                stroke="url(#lineGradient)"
                strokeOpacity={opacityBase + opacityBoost}
                strokeWidth={0.5 + (opacityBoost * 1.2)} // Reduzido de 1.5 para 1.2
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