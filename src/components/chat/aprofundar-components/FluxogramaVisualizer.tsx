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
      </div>
      <div className="p-2 rounded-full bg-green-100 dark:bg-green-800 mt-2">
        <div className="w-4 h-4 bg-green-500 dark:bg-green-400 rounded-full" />
      </div>
    </div>
  ),
};

// Exemplos de dados para desenvolvimento
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

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#3b82f6' } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#3b82f6' } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#3b82f6' } }
];

interface FluxogramaVisualizerProps {
  flowData?: {
    nodes: Node[];
    edges: Edge[];
  };
  onNodeClick?: (node: Node) => void;
}

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
      >
        <Controls />
        <MiniMap
          nodeStrokeColor={(n) => {
            if (n.type === 'start') return '#3b82f6';
            if (n.type === 'end') return '#10b981';
            return '#aaa';
          }}
          nodeColor={(n) => {
            if (n.type === 'start') return '#dbeafe';
            if (n.type === 'end') return '#d1fae5';
            return '#ffffff';
          }}
        />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default FluxogramaVisualizer;