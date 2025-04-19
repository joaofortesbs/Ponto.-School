
import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  Handle,
  Position,
  useNodesState,
  useEdgesState
} from 'react-flow-renderer';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CircleHelp, Flag, HelpCircle, Target, Zap } from 'lucide-react';

// Tipos de nós personalizados
const StartNode = ({ data }: { data: any }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700 text-green-900 dark:text-green-300 text-sm font-medium w-40">
          <div className="flex items-center justify-center mb-1">
            <Flag className="h-4 w-4 mr-1" />
            <span>Início</span>
          </div>
          <div className="text-xs text-center text-green-800 dark:text-green-400">
            {data.label}
          </div>
          <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-green-500" />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs text-xs">{data.description}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const ProcessNode = ({ data }: { data: any }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-300 text-sm font-medium w-40">
          <div className="flex items-center justify-center mb-1">
            <Zap className="h-4 w-4 mr-1" />
            <span>Processo</span>
          </div>
          <div className="text-xs text-center text-blue-800 dark:text-blue-400">
            {data.label}
          </div>
          <Handle type="target" position={Position.Top} className="w-2 h-2 bg-blue-500" />
          <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-blue-500" />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs text-xs">{data.description}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const DecisionNode = ({ data }: { data: any }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="px-4 py-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700 text-yellow-900 dark:text-yellow-300 text-sm font-medium w-40">
          <div className="flex items-center justify-center mb-1">
            <HelpCircle className="h-4 w-4 mr-1" />
            <span>Decisão</span>
          </div>
          <div className="text-xs text-center text-yellow-800 dark:text-yellow-400">
            {data.label}
          </div>
          <Handle type="target" position={Position.Top} className="w-2 h-2 bg-yellow-500" />
          <Handle type="source" position={Position.Left} id="yes" className="w-2 h-2 bg-yellow-500" />
          <Handle type="source" position={Position.Right} id="no" className="w-2 h-2 bg-yellow-500" />
          <Handle type="source" position={Position.Bottom} id="continue" className="w-2 h-2 bg-yellow-500" />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs text-xs">{data.description}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const EndNode = ({ data }: { data: any }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 text-red-900 dark:text-red-300 text-sm font-medium w-40">
          <div className="flex items-center justify-center mb-1">
            <Target className="h-4 w-4 mr-1" />
            <span>Fim</span>
          </div>
          <div className="text-xs text-center text-red-800 dark:text-red-400">
            {data.label}
          </div>
          <Handle type="target" position={Position.Top} className="w-2 h-2 bg-red-500" />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs text-xs">{data.description}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// Configuração dos tipos de nós personalizados
const nodeTypes: NodeTypes = {
  start: StartNode,
  process: ProcessNode,
  decision: DecisionNode,
  end: EndNode,
};

interface FluxogramaVisualizerProps {
  flowData?: {
    nodes: Node[];
    edges: Edge[];
  };
  onNodeClick?: (node: Node) => void;
}

// Dados de exemplo para fluxograma
const exampleFlowData = {
  nodes: [
    {
      id: '1',
      type: 'start',
      position: { x: 250, y: 0 },
      data: { 
        label: 'Começar estudo', 
        description: 'Início do processo de estudo de um novo tema.' 
      },
    },
    {
      id: '2',
      type: 'process',
      position: { x: 250, y: 100 },
      data: { 
        label: 'Ler material base', 
        description: 'Leitura dos materiais fundamentais sobre o tema.' 
      },
    },
    {
      id: '3',
      type: 'decision',
      position: { x: 250, y: 200 },
      data: { 
        label: 'Compreendeu o material?',
        description: 'Verificar se o conteúdo básico foi compreendido antes de avançar.' 
      },
    },
    {
      id: '4',
      type: 'process',
      position: { x: 400, y: 300 },
      data: { 
        label: 'Resolver exercícios',
        description: 'Aplicar o conhecimento em exercícios práticos.' 
      },
    },
    {
      id: '5',
      type: 'process',
      position: { x: 100, y: 300 },
      data: { 
        label: 'Rever conceitos',
        description: 'Revisitar os conceitos básicos para melhor compreensão.' 
      },
    },
    {
      id: '6',
      type: 'end',
      position: { x: 250, y: 400 },
      data: { 
        label: 'Finalizar estudo',
        description: 'Concluir o ciclo de estudos do tema.' 
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
    { id: 'e3-4', source: '3', target: '4', sourceHandle: 'yes', label: 'Sim' },
    { id: 'e3-5', source: '3', target: '5', sourceHandle: 'no', label: 'Não' },
    { id: 'e4-6', source: '4', target: '6' },
    { id: 'e5-2', source: '5', target: '2' },
  ],
};

const FluxogramaVisualizer: React.FC<FluxogramaVisualizerProps> = ({ 
  flowData = exampleFlowData,
  onNodeClick 
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(flowData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowData.edges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    if (onNodeClick) {
      onNodeClick(node);
    }
  }, [onNodeClick]);

  return (
    <div className="h-[500px] w-full bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Controls />
        <MiniMap 
          nodeStrokeColor="#aaa"
          nodeColor="#ffffff"
          nodeBorderRadius={10} 
          maskColor="rgba(0, 0, 0, 0.1)"
        />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
      
      {selectedNode && (
        <Card className="p-4 mt-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30">
          <div className="flex items-center mb-2">
            <CircleHelp className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            <h4 className="text-base font-medium text-blue-900 dark:text-blue-100">
              {selectedNode.data.label}
            </h4>
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
            {selectedNode.data.description}
          </p>
          {selectedNode.data.details && (
            <div className="text-xs text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-800/50 p-2 rounded">
              {selectedNode.data.details}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default FluxogramaVisualizer;
