import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  NodeTypes,
  ConnectionLineType,
  ReactFlowInstance,
  useReactFlow,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
// @ts-ignore - Import dagre for layout calculations
import * as dagre from 'dagre';

// Importando os estilos necessários
import { cn } from '@/lib/utils';

// Definindo os tipos de nós personalizados
const StartNode = ({ data }: { data: any }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-lg bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700 min-w-[150px]">
      <div className="flex items-center">
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-800/50 mr-2">
          <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </div>
        <div className="text-sm font-medium text-blue-700 dark:text-blue-300">{data.label}</div>
      </div>
      <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{data.description || 'Início do fluxograma'}</div>
    </div>
  );
};

const DefaultNode = ({ data }: { data: any }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 min-w-[150px]">
      <div className="flex items-center">
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 mr-2">
          <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-400">
            <rect x="4" y="4" width="16" height="16" rx="2" />
          </svg>
        </div>
        <div className="text-sm font-medium">{data.label}</div>
      </div>
      <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{data.description || 'Sem descrição'}</div>
    </div>
  );
};

const EndNode = ({ data }: { data: any }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-lg bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-700 min-w-[150px]">
      <div className="flex items-center">
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-green-100 dark:bg-green-800/50 mr-2">
          <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
        </div>
        <div className="text-sm font-medium text-green-700 dark:text-green-300">{data.label}</div>
      </div>
      <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{data.description || 'Conclusão do fluxograma'}</div>
    </div>
  );
};

const DecisionNode = ({ data }: { data: any }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-lg bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-200 dark:border-amber-700 min-w-[150px] relative">
      <div className="flex items-center">
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-amber-100 dark:bg-amber-800/50 mr-2">
          <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 dark:text-amber-400">
            <polygon points="22 3 2 3 12 21 22 3" />
          </svg>
        </div>
        <div className="text-sm font-medium text-amber-700 dark:text-amber-300">{data.label}</div>
      </div>
      <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{data.description || 'Decisão a ser tomada'}</div>

      {/* Indicadores de saída Sim/Não para nós de decisão */}
      <div className="absolute -bottom-1 right-1/4 transform translate-y-1/2 bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 text-xs py-0.5 px-2 rounded-full border border-green-200 dark:border-green-700">
        Sim
      </div>
      <div className="absolute -bottom-1 left-1/4 transform translate-y-1/2 bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300 text-xs py-0.5 px-2 rounded-full border border-red-200 dark:border-red-700">
        Não
      </div>
    </div>
  );
};

// Configuração avançada de nós para o fluxograma
const nodeTypes: NodeTypes = {
  start: ({ data, ...props }: any) => (
    <div
      className={cn(
        "px-4 py-2 shadow-md rounded-lg border border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/40",
        "min-w-[200px] font-medium flex flex-col items-center justify-center"
      )}
    >
      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-800 mb-2">
        <div className="w-4 h-4 bg-blue-500 dark:bg-blue-400 rounded-full" />
      </div>
      <div className="text-center">
        <div className="text-sm font-semibold text-blue-800 dark:text-blue-300">
          {data.label}
        </div>
        {data.description && (
          <div className="text-xs text-blue-600 dark:text-blue-400 opacity-75 mt-1 max-w-[180px] line-clamp-2">
            {data.description}
          </div>
        )}
      </div>
    </div>
  ),

  context: ({ data, ...props }: any) => (
    <div
      className={cn(
        "px-4 py-2 shadow-md rounded-lg border border-teal-300 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/40 dark:to-cyan-900/40",
        "min-w-[200px] font-medium"
      )}
    >
      <div className="flex items-center justify-center mb-1">
        <div className="p-1 rounded-full bg-teal-100 dark:bg-teal-800 mr-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-teal-600 dark:text-teal-400">
            <path d="M12 16v-4M12 8h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="text-sm font-semibold text-teal-800 dark:text-teal-300">
          {data.label}
        </div>
      </div>
      {data.description && (
        <div className="text-xs text-teal-600 dark:text-teal-400 opacity-75 mt-1 line-clamp-3">
          {data.description}
        </div>
      )}
    </div>
  ),

  default: ({ data, ...props }: any) => (
    <div
      className={cn(
        "px-4 py-2 shadow-md rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700",
        "min-w-[180px] font-medium"
      )}
    >
      <div className="text-center">
        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {data.label}
        </div>
        {data.description && (
          <div className="text-xs text-gray-600 dark:text-gray-400 opacity-75 mt-1 line-clamp-2">
            {data.description}
          </div>
        )}
      </div>
    </div>
  ),

  process: ({ data, ...props }: any) => (
    <div
      className={cn(
        "px-4 py-3 shadow-md rounded-lg border border-purple-300 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/40 dark:to-indigo-900/40",
        "min-w-[200px] font-medium"
      )}
    >
      <div className="flex items-center">
        {data.stepNumber && (
          <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center mr-2">
            <span className="text-xs font-bold text-purple-700 dark:text-purple-300">{data.stepNumber}</span>
          </div>
        )}
        <div className="text-sm font-semibold text-purple-800 dark:text-purple-300">
          {data.label}
        </div>
      </div>
      {data.description && (
        <div className="text-xs text-purple-600 dark:text-purple-400 opacity-75 mt-1 line-clamp-3">
          {data.description}
        </div>
      )}
    </div>
  ),

  practice: ({ data, ...props }: any) => (
    <div
      className={cn(
        "px-4 py-2 shadow-md rounded-lg border border-indigo-300 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/40 dark:to-violet-900/40",
        "min-w-[200px] font-medium"
      )}
    >
      <div className="flex items-center mb-1">
        <div className="p-1 rounded-full bg-indigo-100 dark:bg-indigo-800 mr-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600 dark:text-indigo-400">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">
          {data.label}
        </div>
      </div>
      {data.description && (
        <div className="text-xs text-indigo-600 dark:text-indigo-400 opacity-75 mt-1 line-clamp-3">
          {data.description}
        </div>
      )}
    </div>
  ),

  decision: ({ data, ...props }: any) => (
    <div
      className={cn(
        "px-4 py-2 shadow-md rounded-lg border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/40 dark:to-yellow-900/40",
        "min-w-[200px] min-h-[100px] font-medium flex flex-col items-center justify-center relative"
      )}
    >
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-100 dark:bg-amber-800 p-1 rounded-full border border-amber-300 dark:border-amber-700">
        <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 dark:text-amber-400">
          <polygon points="22 3 2 3 12 21 22 3" />
        </svg>
      </div>

      <div className="text-center mt-2">
        <div className="text-sm font-semibold text-amber-800 dark:text-amber-300">
          {data.label}
        </div>
        {data.description && (
          <div className="text-xs text-amber-600 dark:text-amber-400 opacity-75 mt-1 line-clamp-2">
            {data.description}
          </div>
        )}
      </div>

      {/* Indicadores de saída */}
      <div className="absolute -bottom-2 right-8 transform translate-y-1/2 bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 text-xs py-0.5 px-2 rounded-full border border-green-200 dark:border-green-700 shadow-sm">
        Correto
      </div>
      <div className="absolute -bottom-2 left-8 transform translate-y-1/2 bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300 text-xs py-0.5 px-2 rounded-full border border-red-200 dark:border-red-700 shadow-sm">
        Incorreto
      </div>
    </div>
  ),

  tip: ({ data, ...props }: any) => (
    <div
      className={cn(
        "px-4 py-2 shadow-md rounded-lg border border-blue-300 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/40 dark:to-sky-900/40",
        "min-w-[180px] font-medium"
      )}
    >
      <div className="flex items-start mb-1">
        <div className="p-1 rounded-full bg-blue-100 dark:bg-blue-800 mr-2 flex-shrink-0 mt-0.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600 dark:text-blue-400">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="text-sm font-semibold text-blue-800 dark:text-blue-300 leading-tight">
          {data.label}
        </div>
      </div>
      {data.description && (
        <div className="text-xs text-blue-600 dark:text-blue-400 opacity-75 mt-1 ml-7 line-clamp-3">
          {data.description}
        </div>
      )}
    </div>
  ),

  end: ({ data, ...props }: any) => (
    <div
      className={cn(
        "px-4 py-2 shadow-md rounded-lg border border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40",
        "min-w-[200px] font-medium flex flex-col items-center justify-center"
      )}
    >
      <div className="text-center">
        <div className="text-sm font-semibold text-green-800 dark:text-green-300">
          {data.label}
        </div>
        {data.description && (
          <div className="text-xs text-green-600 dark:text-green-400 opacity-75 mt-1 max-w-[180px] line-clamp-3">
            {data.description}
          </div>
        )}
      </div>
      <div className="p-2 rounded-full bg-green-100 dark:bg-green-800 mt-2">
        <div className="w-4 h-4 bg-green-500 dark:bg-green-400 rounded-full" />
      </div>
    </div>
  ),
};

// Dados de exemplo para inicialização (caso não tenha dados carregados)
const initialNodes: Node[] = [
  {
    id: '1',
    data: { label: 'Início do Processo', description: 'Ponto de partida para o fluxo de informações' },
    position: { x: 250, y: 0 },
    type: 'start',
  },
  {
    id: '2',
    data: { label: 'Conceito Principal', description: 'Elemento fundamental do tema abordado' },
    position: { x: 250, y: 100 },
    type: 'default',
  },
  {
    id: '3',
    data: { label: 'Aplicação Prática', description: 'Como o conceito é aplicado na prática' },
    position: { x: 250, y: 200 },
    type: 'default',
  },
  {
    id: '4',
    data: { label: 'Conclusão', description: 'Resultados e aprendizados principais' },
    position: { x: 250, y: 300 },
    type: 'end',
  }
];

// Conexões de exemplo
const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', label: 'Segue o processo', animated: true, style: { stroke: '#3b82f6' } },
  { id: 'e2-3', source: '2', target: '3', label: 'Segue o processo', animated: true, style: { stroke: '#3b82f6' } },
  { id: 'e3-4', source: '3', target: '4', label: 'Segue o processo', animated: true, style: { stroke: '#3b82f6' } }
];

interface FluxogramaVisualizerProps {
  flowData?: {
    nodes: Node[];
    edges: Edge[];
  };
  onNodeClick?: (node: Node) => void;
}

// Layout automático dos nós utilizando dagre para organizar o fluxograma
const nodeWidth = 220;
const nodeHeight = 120;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  // Cria um novo grafo
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Define as direções: TB (top to bottom) ou LR (left to right)
  // Aumentando os valores de nodesep e ranksep para melhor organização e evitar sobreposição
  dagreGraph.setGraph({ 
    rankdir: direction, 
    nodesep: 120,       // Aumentado para melhor espaçamento horizontal
    ranksep: 150,       // Aumentado para melhor espaçamento vertical
    marginx: 40,        // Margem horizontal aumentada
    marginy: 40,        // Margem vertical aumentada
    align: 'DL',        // Alinhamento para melhor organização
    acyclicer: 'greedy' // Previne ciclos e melhora layout
  });

  // Adiciona os nós ao grafo dagre com as dimensões adequadas
  nodes.forEach((node) => {
    // Ajusta os tamanhos baseados no tipo do nó
    let width = nodeWidth;
    let height = nodeHeight;

    // Nós de tipo start e end podem ter dimensões diferentes
    if (node.type === 'start' || node.type === 'end') {
      height = 100;
      width = 220;  // Garantir largura consistente
    } else if (node.type === 'decision') {
      height = 140; // Nós de decisão podem precisar de mais espaço vertical
      width = 240;  // Ligeiramente mais largos para decisões
    } else if (node.type === 'process') {
      width = 230;  // Processos um pouco mais largos
    }

    dagreGraph.setNode(node.id, { width, height });
  });

  // Adiciona as arestas ao grafo com configurações para centralização
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target, {
      weight: 1,             // Peso padrão
      minlen: 1,             // Comprimento mínimo da aresta
      labelpos: 'c',         // Posição do label centralizada
      width: 2,              // Largura da linha
      height: 2              // Altura da linha
    });
  });

  // Calcula o layout
  dagre.layout(dagreGraph);

  // Obtem os nós com as posições atualizadas
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    // Arredondar as coordenadas para evitar posicionamento em pixels fracionários
    // que podem causar linhas borradas ou desalinhadas
    return {
      ...node,
      position: {
        x: Math.round(nodeWithPosition.x - nodeWidth / 2),
        y: Math.round(nodeWithPosition.y - nodeHeight / 2),
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

/**
 * Componente principal do visualizador de fluxograma
 */
const FluxogramaVisualizer: React.FC<FluxogramaVisualizerProps> = ({ 
  flowData,
  onNodeClick 
}) => {
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const [isLayouted, setIsLayouted] = useState(false);

  // Carrega os dados do localStorage, se houver, ou usa os exemplos
  const loadFlowData = () => {
    try {
      const savedData = localStorage.getItem('fluxogramaData');
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do fluxograma:', error);
    }
    return { nodes: initialNodes, edges: initialEdges };
  };

  const data = flowData || loadFlowData();

  // Aplicar o layout automático aos nós e arestas usando dagre
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    data.nodes, 
    data.edges,
    'TB' // direção de cima para baixo
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // Função para reorganizar o layout
  const onLayout = useCallback((direction: 'TB' | 'LR') => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      direction
    );

    // Atualizar estilo de todas as arestas para remover animações e usar linhas sólidas
    const updatedEdges = layoutedEdges.map(edge => ({
      ...edge,
      animated: false,
      style: {
        ...edge.style,
        strokeWidth: 2,
        strokeDasharray: 'none', // Remover pontilhados
      },
      type: 'smoothstep',
    }));

    setNodes([...layoutedNodes]);
    setEdges([...updatedEdges]);

    // Centralizar o fluxograma após o layout com padding maior
    if (reactFlowInstance.current) {
      window.requestAnimationFrame(() => {
        reactFlowInstance.current?.fitView({
          padding: 0.25,
          includeHiddenNodes: false,
          minZoom: 0.85, // Limitar o zoom mínimo para evitar visualização muito distante
          maxZoom: 1.5,  // Limitar o zoom máximo para evitar detalhes muito grandes
        });
      });
    }

    setIsLayouted(true);
  }, [nodes, edges, setNodes, setEdges]);

  // Atualiza os nós e arestas quando os dados externos mudam
  useEffect(() => {
    if (flowData) {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        flowData.nodes, 
        flowData.edges,
        'TB'
      );

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setIsLayouted(false);
    }
  }, [flowData, setNodes, setEdges]);

  // Aplica o layout automático na montagem inicial
  useEffect(() => {
    if (!isLayouted) {
      // Pequeno delay para garantir que o componente está totalmente montado
      const timer = setTimeout(() => {
        onLayout('TB');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLayouted, onLayout]);

  // Função para lidar com cliques nos nós
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (onNodeClick) {
      onNodeClick(node);
    }
  }, [onNodeClick]);

  return (
    <div className="h-[60vh] bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        onInit={(instance) => {
          reactFlowInstance.current = instance;
          instance.fitView({ padding: 0.25 });
        }}
        fitView
        attributionPosition="bottom-right"
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { 
            strokeWidth: 2, 
            stroke: '#3b82f6',
            strokeDasharray: 'none' // Remove pontilhados animados
          },
          animated: false, // Desliga animação
          labelShowBg: true,
          labelBgPadding: [4, 2],
          labelBgBorderRadius: 4,
          pathOptions: {
            offset: 15, // Ajuste de offset para evitar sobreposição
            borderRadius: 8 // Bordas arredondadas para as linhas
          }
        }}
        proOptions={{ hideAttribution: true }} // Remove atribuição para visual mais limpo
        <Controls />
        <MiniMap
          nodeStrokeColor={(n) => {
            if (n.type === 'start') return '#3b82f6';
            if (n.type === 'end') return '#10b981';
            if (n.type === 'decision') return '#f59e0b';
            return '#aaa';
          }}
          nodeColor={(n) => {
            if (n.type === 'start') return '#dbeafe';
            if (n.type === 'end') return '#d1fae5';
            if (n.type === 'decision') return '#fef3c7';
            return '#ffffff';
          }}
        />
        <Panel position="top-right" className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={() => onLayout('TB')}
              className="px-3 py-1 text-xs font-medium rounded-md bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 transition-colors"
            >
              Organizar Vertical
            </button>
            <button
              onClick={() => onLayout('LR')}
              className="px-3 py-1 text-xs font-medium rounded-md bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 transition-colors"
            >
              Organizar Horizontal
            </button>
          </div>
        </Panel>
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
};

/**
 * Função auxiliar para criar um novo nó com a estrutura padrão
 * @param id Identificador único do nó
 * @param label Título ou nome do nó
 * @param description Descrição detalhada do nó
 * @param type Tipo do nó (start, default, decision, end)
 * @param position Posição {x, y} do nó no fluxograma
 * @returns Objeto Node formatado corretamente para ReactFlow
 */
export const createFluxogramaNode = (
  id: string,
  label: string,
  description: string,
  type: 'start' | 'default' | 'decision' | 'end' = 'default',
  position: { x: number; y: number }
): Node => {
  return {
    id,
    data: { label, description },
    type,
    position
  };
};

/**
 * Função para processar respostas de prompts de fluxograma e converter para o formato esperado
 * @param promptResponse Resposta da IA contendo os dados do fluxograma
 * @returns Objeto com nodes e edges formatados para ReactFlow
 */
export const processPromptResponse = (promptResponse: string): { nodes: Node[], edges: Edge[] } => {
  try {
    // Tenta extrair o JSON da resposta
    const jsonMatch = promptResponse.match(/```json\n([\s\S]*?)\n```/) || 
                      promptResponse.match(/```\n([\s\S]*?)\n```/) ||
                      promptResponse.match(/{[\s\S]*?}/);

    const jsonString = jsonMatch ? jsonMatch[0].replace(/```json\n|```\n|```/g, '') : promptResponse;
    const data = JSON.parse(jsonString);

    // Mapeia os nós para o formato esperado pelo React Flow
    const nodes = data.nodes.map((node: any) => ({
      id: node.id,
      data: { 
        label: node.data.label, 
        description: node.data.description || '',
        details: node.data.details || '',
        category: node.data.category || ''
      },
      position: node.position || { x: 0, y: 0 },
      type: mapCategoryToNodeType(node.data.category) || node.type || 'default'
    }));

    // Mapeia as arestas (edges) para o formato esperado pelo React Flow
    const edges = data.edges.map((edge: any) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label || '',
      animated: edge.animated || false,
      style: edge.style || { stroke: '#3b82f6' }
    }));

    return { nodes, edges };
  } catch (error) {
    console.error('Erro ao processar resposta do prompt:', error);
    // Retorna um fluxograma padrão em caso de erro
    return {
      nodes: initialNodes,
      edges: initialEdges
    };
  }
};

/**
 * Mapeia a categoria do nó para um tipo de nó do React Flow
 */
const mapCategoryToNodeType = (category?: string): string => {
  if (!category) return 'default';

  const categoryLower = category.toLowerCase();

  if (categoryLower.includes('defin') || categoryLower.includes('conceito')) {
    return 'start';
  }
  if (categoryLower.includes('contexto') || categoryLower.includes('requisito')) {
    return 'context';
  }
  if (categoryLower.includes('processo') || categoryLower.includes('etapa')) {
    return 'process';
  }
  if (categoryLower.includes('exemplo') || categoryLower.includes('aplica')) {
    return 'practice';
  }
  if (categoryLower.includes('decisão') || categoryLower.includes('erro')) {
    return 'decision';
  }
  if (categoryLower.includes('dica')) {
    return 'tip';
  }
  if (categoryLower.includes('conc') || categoryLower.includes('resumo')) {
    return 'end';
  }

  return 'default';
};

export default FluxogramaVisualizer;