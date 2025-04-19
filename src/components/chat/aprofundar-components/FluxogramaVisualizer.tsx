import React, { useState, useCallback, useEffect } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';

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
        "min-w-[150px] font-medium flex flex-col items-center justify-center"
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
          <div className="text-xs text-blue-600 dark:text-blue-400 opacity-75 mt-1 max-w-[200px] truncate">
            {typeof data.description === 'string' && data.description.length > 30 
              ? `${data.description.substring(0, 30)}...` 
              : data.description}
          </div>
        )}
      </div>
    </div>
  ),
  default: ({ data, ...props }: any) => (
    <div
      className={cn(
        "px-4 py-2 shadow-md rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700",
        "min-w-[150px] font-medium"
      )}
    >
      <div className="text-center">
        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {data.label}
        </div>
        {data.description && (
          <div className="text-xs text-gray-600 dark:text-gray-400 opacity-75 mt-1 max-w-[200px] truncate">
            {typeof data.description === 'string' && data.description.length > 30 
              ? `${data.description.substring(0, 30)}...` 
              : data.description}
          </div>
        )}
      </div>
    </div>
  ),
  end: ({ data, ...props }: any) => (
    <div
      className={cn(
        "px-4 py-2 shadow-md rounded-lg border border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40",
        "min-w-[150px] font-medium flex flex-col items-center justify-center"
      )}
    >
      <div className="text-center">
        <div className="text-sm font-semibold text-green-800 dark:text-green-300">
          {data.label}
        </div>
        {data.description && (
          <div className="text-xs text-green-600 dark:text-green-400 opacity-75 mt-1 max-w-[200px] truncate">
            {typeof data.description === 'string' && data.description.length > 30 
              ? `${data.description.substring(0, 30)}...` 
              : data.description}
          </div>
        )}
      </div>
      <div className="p-2 rounded-full bg-green-100 dark:bg-green-800 mt-2">
        <div className="w-4 h-4 bg-green-500 dark:bg-green-400 rounded-full" />
      </div>
    </div>
  ),
  process: ({ data, ...props }: any) => (
    <div
      className={cn(
        "px-4 py-2 shadow-md rounded-lg border border-purple-300 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/40 dark:to-indigo-900/40",
        "min-w-[150px] font-medium"
      )}
    >
      <div className="text-center">
        <div className="text-sm font-semibold text-purple-800 dark:text-purple-300">
          {data.label}
        </div>
        {data.description && (
          <div className="text-xs text-purple-600 dark:text-purple-400 opacity-75 mt-1 max-w-[200px] truncate">
            {typeof data.description === 'string' && data.description.length > 30 
              ? `${data.description.substring(0, 30)}...` 
              : data.description}
          </div>
        )}
      </div>
    </div>
  ),
  decision: ({ data, ...props }: any) => (
    <div
      className={cn(
        "px-4 py-2 shadow-md rounded-lg border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/40 dark:to-yellow-900/40",
        "min-w-[180px] min-h-[100px] font-medium flex flex-col items-center justify-center relative"
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
          <div className="text-xs text-amber-600 dark:text-amber-400 opacity-75 mt-1 max-w-[160px] truncate">
            {typeof data.description === 'string' && data.description.length > 30 
              ? `${data.description.substring(0, 30)}...` 
              : data.description}
          </div>
        )}
      </div>
      
      {/* Indicadores de saída */}
      <div className="absolute -bottom-2 right-8 transform translate-y-1/2 bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 text-xs py-0.5 px-2 rounded-full border border-green-200 dark:border-green-700 shadow-sm">
        Sim
      </div>
      <div className="absolute -bottom-2 left-8 transform translate-y-1/2 bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300 text-xs py-0.5 px-2 rounded-full border border-red-200 dark:border-red-700 shadow-sm">
        Não
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

/**
 * Componente principal do visualizador de fluxograma
 */
const FluxogramaVisualizer: React.FC<FluxogramaVisualizerProps> = ({ 
  flowData,
  onNodeClick 
}) => {
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
  const [nodes, setNodes, onNodesChange] = useNodesState(data.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(data.edges);

  // Atualiza os nós e arestas quando os dados externos mudam
  useEffect(() => {
    if (flowData) {
      setNodes(flowData.nodes);
      setEdges(flowData.edges);
    }
  }, [flowData, setNodes, setEdges]);

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
        fitView
        attributionPosition="bottom-right"
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { strokeWidth: 2 },
          labelShowBg: true,
          labelBgPadding: [4, 2],
          labelBgBorderRadius: 4
        }}
      >
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

export default FluxogramaVisualizer;