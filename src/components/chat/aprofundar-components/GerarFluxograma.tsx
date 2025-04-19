import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  FileDown, 
  PenLine, 
  Eye, 
  CheckCircle, 
  FileLineChart, 
  RotateCw,
  Download,
  Clipboard,
  Maximize2,
  Save,
  X,
  SendHorizonal
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import FluxogramaVisualizer from './FluxogramaVisualizer';
import FluxogramaDetailModal from './FluxogramaDetailModal';
import { Node } from 'reactflow';

interface GerarFluxogramaProps {
  handleBack: () => void;
  aprofundadoContent: {
    contexto: string;
  };
}

const GerarFluxograma: React.FC<GerarFluxogramaProps> = ({ 
  handleBack, 
  aprofundadoContent 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'ia' | 'manual' | null>(null);
  const [fluxogramaGerado, setFluxogramaGerado] = useState(false);
  const [showFluxograma, setShowFluxograma] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [manualContent, setManualContent] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const handleGenerateFlowchart = (option: 'ia' | 'manual') => {
    if (option === 'manual') {
      setSelectedOption(option);
      setShowManualInput(true);
      return;
    }

    setSelectedOption(option);
    setIsLoading(true);

    // Simula o processamento do fluxograma
    setTimeout(() => {
      setIsLoading(false);
      setFluxogramaGerado(true);
      // Aqui seria implementada a lógica real de geração do fluxograma
    }, 3000);
  };

  const handleSubmitManualContent = () => {
    if (!manualContent.trim()) {
      return;
    }

    setIsLoading(true);
    setShowManualInput(false);

    // Processar o conteúdo e gerar o fluxograma
    const processFluxogramaContent = async () => {
      try {
        // ETAPA 1: Analisar o conteúdo usando a API de IA
        let fluxogramaData;
        
        // Determinar a fonte do conteúdo (IA ou manual)
        const contentToAnalyze = selectedOption === 'manual' 
          ? manualContent 
          : aprofundadoContent?.contexto || '';
          
        if (!contentToAnalyze.trim()) {
          throw new Error('Conteúdo vazio. Por favor, forneça um texto para gerar o fluxograma.');
        }
        
        // Usar a API de IA para gerar o fluxograma
        try {
          // Mostrar indicador de carregamento enquanto processa
          setIsLoading(true);
          
          // Importar o serviço de IA
          const { generateAIResponse } = await import('@/services/aiChatService');
          
          // Criar um ID de sessão único para esta solicitação
          const sessionId = `fluxograma_${Date.now()}`;
          
          // Prompt estruturado para a IA
          const prompt = `
Analise o seguinte conteúdo e gere um fluxograma estruturado:

${contentToAnalyze}

Crie um fluxograma educacional estruturado em 5 camadas de aprendizado que:

1. Comece com um CONCEITO CENTRAL (nó inicial):
   - Defina o tema de forma objetiva e clara
   - Ex: "O que é fotossíntese?"

2. Adicione CONTEXTUALIZAÇÃO E PRÉ-REQUISITOS:
   - Conhecimentos prévios necessários
   - Termos importantes para entender o tema
   - Base científica/histórica relevante

3. Detalhe o PROCESSO, MECANISMO OU LÓGICA DO TEMA:
   - Passo a passo da explicação em etapas numeradas
   - Fluxo de causa e efeito
   - Ex: "Etapa 1: Captação de luz → Etapa 2: Transformação química → Etapa 3: Liberação de oxigênio"

4. Inclua uma CAMADA DE APLICAÇÃO/PRÁTICA:
   - Exemplos práticos ou situações-problema
   - Destaque erros comuns e dicas
   - Inclua nós de decisão do tipo: "Se o aluno pensar A → Mostrar que está errado" / "Se pensar B → Está correto"

5. Finalize com CONCLUSÃO OU RESULTADO FINAL:
   - Síntese do aprendizado
   - Resumo visual
   - Dica de ouro ou aplicação em provas

Adicione ELEMENTOS EXTRAS distribuídos no fluxograma:
- Tópicos Relacionados (possíveis conexões para novos fluxos)
- Comparações entre conceitos (quando aplicável)
- Aplicações na vida real
- Alertas sobre equívocos comuns

Classifique cada bloco com um dos seguintes tipos:
- "start" (conceito central)
- "context" (contextualização)
- "process" (etapas do processo)
- "practice" (aplicação prática)
- "decision" (pontos de decisão/verificação)
- "tip" (dicas extras)
- "end" (conclusão)

Organize os blocos em uma sequência lógica e crie conexões significativas entre eles, com rótulos descritivos para cada conexão.

Retorne o resultado como um objeto JSON com a seguinte estrutura:
{
  "nodes": [
    {
      "id": "1",
      "title": "Título do nó",
      "description": "Descrição detalhada do nó",
      "type": "start/default/decision/end"
    }
  ],
  "connections": [
    {
      "source": "1",
      "target": "2",
      "label": "Descrição da relação ou condição (ex: 'Segue para', 'Sim', 'Não')"
    }
  ]
}
`;

          // Chamar a API de IA com o prompt estruturado
          const response = await generateAIResponse(prompt, sessionId, {
            intelligenceLevel: 'advanced',
            detailedResponse: true
          });
          
          // Extrair o JSON da resposta
          let extractedData;
          try {
            // Tenta encontrar o JSON na resposta
            const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                             response.match(/```\n([\s\S]*?)\n```/) ||
                             response.match(/{[\s\S]*?}/);
                             
            const jsonString = jsonMatch ? jsonMatch[0].replace(/```json\n|```\n|```/g, '') : response;
            extractedData = JSON.parse(jsonString);
          } catch (error) {
            console.error('Erro ao extrair JSON da resposta da IA:', error);
            
            // Se falhar em extrair o JSON, criar uma estrutura padrão baseada no texto
            // Implementação de fallback similar à original
            const paragraphs = contentToAnalyze.split(/\n\n+/);
            const sentences = contentToAnalyze.split(/[.!?]\s+/);
            
            const mainBlocks = paragraphs.length > 3 ? paragraphs.slice(0, paragraphs.length) : sentences.slice(0, Math.min(8, sentences.length));
            
            const keywords = mainBlocks.map(block => {
              const words = block.split(/\s+/).filter(word => word.length > 3);
              const mainWord = words.find(word => word.length > 5) || words[0] || 'Conceito';
              return {
                text: block,
                keyword: mainWord.length > 20 ? mainWord.substring(0, 20) + '...' : mainWord
              };
            }).slice(0, 8);
            
            // Preparar os dados no formato esperado
            extractedData = {
              nodes: keywords.map((item, index) => ({
                id: (index + 1).toString(),
                title: item.keyword.charAt(0).toUpperCase() + item.keyword.slice(1),
                description: item.text,
                type: index === 0 ? 'start' : index === keywords.length - 1 ? 'end' : 'default'
              })),
              connections: keywords.slice(0, -1).map((_, index) => ({
                source: (index + 1).toString(),
                target: (index + 2).toString(),
                label: ''
              }))
            };
          }
          
          // ETAPA 2: Converter os dados da IA para o formato do fluxograma
          const nodes = extractedData.nodes.map((node, index) => {
            // Determinar o tipo do nó (usando o tipo da IA ou inferindo por conteúdo e posição)
            let nodeType = node.type || 'default';
            
            // Se o tipo não estiver definido, tente inferir do conteúdo ou posição
            if (!node.type) {
              // Mapeamento para as 5 camadas do fluxograma
              if (index === 0) {
                nodeType = 'start'; // CONCEITO CENTRAL
              } 
              else if (index === extractedData.nodes.length - 1) {
                nodeType = 'end'; // CONCLUSÃO
              }
              else if (index < Math.ceil(extractedData.nodes.length * 0.25)) {
                // Primeiros nós após o início são geralmente contexto e pré-requisitos
                nodeType = 'context';
              }
              else if (index < Math.ceil(extractedData.nodes.length * 0.6)) {
                // Nós intermediários são processos ou mecanismos
                nodeType = 'process';
              }
              else {
                // Nós finais antes da conclusão são aplicações práticas
                nodeType = 'practice';
              }
              
              // Inferência baseada no conteúdo sobrepõe a inferência por posição
              const titleLower = node.title?.toLowerCase() || '';
              const descLower = node.description?.toLowerCase() || '';
              
              if (titleLower.includes('pré-requisito') || 
                  titleLower.includes('termo') || 
                  titleLower.includes('context') ||
                  titleLower.includes('você precisa saber')) {
                nodeType = 'context';
              }
              else if (titleLower.includes('etapa') || 
                       titleLower.includes('passo') || 
                       titleLower.includes('processo') ||
                       titleLower.includes('fase')) {
                nodeType = 'process';
              }
              else if (titleLower.includes('exemplo') || 
                       titleLower.includes('prática') || 
                       titleLower.includes('aplicação') ||
                       titleLower.includes('exercício')) {
                nodeType = 'practice';
              }
              else if (titleLower.includes('dica') || 
                       titleLower.includes('lembre') || 
                       titleLower.includes('atenção') ||
                       titleLower.includes('importante') ||
                       titleLower.includes('nota')) {
                nodeType = 'tip';
              }
              else if (titleLower.includes('decis') || 
                       titleLower.includes('escolh') ||
                       titleLower.includes('verif') ||
                       titleLower.includes('se ') ||
                       descLower.includes('se ') ||
                       descLower.includes('caso ') ||
                       descLower.includes('correto') ||
                       descLower.includes('incorreto')) {
                nodeType = 'decision';
              }
            }
            
            // Calcular posicionamento usando uma estratégia de layout para fluxograma educacional
            // com as 5 camadas de aprendizado definidas
            let position;
            const canvasWidth = 600;
            const canvasHeight = extractedData.nodes.length * 150;
            const verticalSections = 5; // Uma seção para cada camada do modelo de aprendizado
            const sectionHeight = canvasHeight / verticalSections;
            
            // Calcular a seção vertical com base no tipo de nó
            let section = 0;
            switch (nodeType) {
              case 'start':
                section = 0; // Topo para o conceito central
                break;
              case 'context':
                section = 1; // Segunda seção para contextualização
                break;
              case 'process':
                section = 2; // Terceira seção para processos
                break;
              case 'practice':
              case 'decision':
                section = 3; // Quarta seção para aplicações e decisões
                break;
              case 'tip':
                // Os tips podem aparecer em qualquer lugar, então usar um cálculo específico
                section = Math.floor(Math.random() * 4) + 1; 
                break;
              case 'end':
                section = 4; // Fundo para conclusão
                break;
              default:
                // Posicionar nós padrão com base no índice relativo
                section = Math.floor((index / extractedData.nodes.length) * 4);
            }
            
            // Contar quantos nós estão na mesma seção para calcular o posicionamento horizontal
            const nodesInSameSection = extractedData.nodes.filter(n => {
              // Simplificado para a demonstração, na prática precisaria de uma análise de tipo real
              if (nodeType === 'start' && n.type === 'start') return true;
              if (nodeType === 'context' && n.type === 'context') return true;
              if (nodeType === 'process' && n.type === 'process') return true;
              if ((nodeType === 'practice' || nodeType === 'decision') && 
                  (n.type === 'practice' || n.type === 'decision')) return true;
              if (nodeType === 'end' && n.type === 'end') return true;
              return false;
            }).length;
            
            // Distribuir os nós horizontalmente dentro da seção
            const horizontalPosition = nodesInSameSection > 1 
              ? canvasWidth * (0.5 + ((index % nodesInSameSection) - (nodesInSameSection / 2)) * 0.15)
              : canvasWidth * 0.5;
            
            // Adicionar pequena variação aleatória para naturalidade e para evitar sobreposição
            const jitterX = Math.random() * 40 - 20;
            const jitterY = Math.random() * 40 - 20;
            
            position = { 
              x: horizontalPosition + jitterX,
              y: sectionHeight * (section + 0.5) + jitterY
            };
            
            // Dados extras para processos (etapa/passo)
            let extraData = {};
            if (nodeType === 'process') {
              // Tenta extrair um número de etapa do título
              const stepMatch = node.title?.match(/etapa\s*(\d+)|passo\s*(\d+)|fase\s*(\d+)/i);
              if (stepMatch) {
                const stepNumber = stepMatch[1] || stepMatch[2] || stepMatch[3];
                extraData = { stepNumber };
              }
            }
            
            // Retorna o nó formatado com todos os dados necessários
            return {
              id: node.id,
              data: { 
                label: node.title || 'Conceito', 
                description: node.description || 'Sem descrição disponível',
                ...extraData
              },
              type: nodeType,
              position
            };
          });
          
          // ETAPA 3: Gerar as Conexões (Edges) para o fluxograma educacional
          const edges = extractedData.connections?.map(conn => {
            // Determinar o estilo e cor da conexão baseado nos tipos de nós conectados
            const sourceNode = nodes.find(n => n.id === conn.source);
            const targetNode = nodes.find(n => n.id === conn.target);
            
            let edgeStyle = { stroke: '#3b82f6' }; // Azul padrão
            let labelStyle = { fill: '#3b82f6', fontWeight: 500 };
            
            // Estilizar com base no tipo de nós conectados
            if (sourceNode?.type === 'decision') {
              if (conn.label?.toLowerCase().includes('sim') || 
                  conn.label?.toLowerCase().includes('correto') ||
                  conn.label?.toLowerCase().includes('verdadeiro')) {
                edgeStyle = { stroke: '#10b981' }; // Verde para caminhos positivos
                labelStyle = { fill: '#10b981', fontWeight: 500 };
              } else if (conn.label?.toLowerCase().includes('não') || 
                         conn.label?.toLowerCase().includes('incorreto') ||
                         conn.label?.toLowerCase().includes('falso')) {
                edgeStyle = { stroke: '#f43f5e' }; // Vermelho para caminhos negativos
                labelStyle = { fill: '#f43f5e', fontWeight: 500 };
              }
            } 
            else if (sourceNode?.type === 'start') {
              edgeStyle = { stroke: '#6366f1', strokeWidth: 2 }; // Indigo destaque para início
            }
            else if (targetNode?.type === 'end') {
              edgeStyle = { stroke: '#10b981', strokeWidth: 2 }; // Verde destaque para conclusão
            }
            else if (sourceNode?.type === 'tip' || targetNode?.type === 'tip') {
              edgeStyle = { stroke: '#0ea5e9', strokeDasharray: '5,5' }; // Azul tracejado para dicas
              labelStyle = { fill: '#0ea5e9', fontWeight: 500 };
            }
            
            return {
              id: `e${conn.source}-${conn.target}`,
              source: conn.source,
              target: conn.target,
              label: conn.label || '',
              animated: conn.label?.toLowerCase().includes('importante') || false,
              style: edgeStyle,
              labelStyle: labelStyle,
              labelBgStyle: { fill: 'rgba(255, 255, 255, 0.75)', rx: 4, ry: 4 }
            }
          }) || [];
          
          // Se não houver conexões definidas pela IA, criar conexões para as 5 camadas de aprendizado
          if (edges.length === 0 && nodes.length > 1) {
            // Agrupar nós por tipo para facilitar o gerenciamento das camadas
            const nodesByType = {
              start: nodes.filter(n => n.type === 'start'),
              context: nodes.filter(n => n.type === 'context'),
              process: nodes.filter(n => n.type === 'process'),
              practice: nodes.filter(n => n.type === 'practice'),
              decision: nodes.filter(n => n.type === 'decision'),
              tip: nodes.filter(n => n.type === 'tip'),
              end: nodes.filter(n => n.type === 'end'),
              default: nodes.filter(n => n.type === 'default')
            };
            
            // 1. Conectar o nó inicial (conceito central) com os nós de contexto
            if (nodesByType.start.length > 0) {
              const startNode = nodesByType.start[0];
              
              // Se há nós de contexto, conecte o início a eles
              if (nodesByType.context.length > 0) {
                nodesByType.context.forEach((contextNode, idx) => {
                  edges.push({
                    id: `e${startNode.id}-${contextNode.id}`,
                    source: startNode.id,
                    target: contextNode.id,
                    label: idx === 0 ? 'Para entender' : '',
                    animated: false,
                    style: { stroke: '#3b82f6', strokeWidth: 2 },
                    labelStyle: { fill: '#3b82f6', fontWeight: 500 },
                    labelBgStyle: { fill: 'rgba(255, 255, 255, 0.75)', rx: 4, ry: 4 }
                  });
                });
              } 
              // Se não há contexto, conectar diretamente aos processos ou próximo tipo disponível
              else if (nodesByType.process.length > 0) {
                edges.push({
                  id: `e${startNode.id}-${nodesByType.process[0].id}`,
                  source: startNode.id,
                  target: nodesByType.process[0].id,
                  label: 'Entenda como funciona',
                  animated: false,
                  style: { stroke: '#3b82f6', strokeWidth: 2 },
                  labelStyle: { fill: '#3b82f6', fontWeight: 500 },
                  labelBgStyle: { fill: 'rgba(255, 255, 255, 0.75)', rx: 4, ry: 4 }
                });
              }
            }
            
            // 2. Conectar nós de contexto entre si (se houver mais de um)
            if (nodesByType.context.length > 1) {
              for (let i = 0; i < nodesByType.context.length - 1; i++) {
                edges.push({
                  id: `e${nodesByType.context[i].id}-${nodesByType.context[i+1].id}`,
                  source: nodesByType.context[i].id,
                  target: nodesByType.context[i+1].id,
                  label: '',
                  animated: false,
                  style: { stroke: '#0d9488' }, // Teal
                  labelStyle: { fill: '#0d9488', fontWeight: 500 },
                  labelBgStyle: { fill: 'rgba(255, 255, 255, 0.75)', rx: 4, ry: 4 }
                });
              }
              
              // Conectar o último nó de contexto à primeira etapa do processo
              if (nodesByType.process.length > 0) {
                edges.push({
                  id: `e${nodesByType.context[nodesByType.context.length-1].id}-${nodesByType.process[0].id}`,
                  source: nodesByType.context[nodesByType.context.length-1].id,
                  target: nodesByType.process[0].id,
                  label: 'Com isso em mente',
                  animated: false,
                  style: { stroke: '#0d9488' }, // Teal
                  labelStyle: { fill: '#0d9488', fontWeight: 500 },
                  labelBgStyle: { fill: 'rgba(255, 255, 255, 0.75)', rx: 4, ry: 4 }
                });
              }
            }
            
            // 3. Conectar nós de processo em sequência
            if (nodesByType.process.length > 1) {
              for (let i = 0; i < nodesByType.process.length - 1; i++) {
                const sourceNode = nodesByType.process[i];
                const targetNode = nodesByType.process[i+1];
                
                // Extrair números de etapa se disponíveis
                const sourceStep = sourceNode.data.stepNumber;
                const targetStep = targetNode.data.stepNumber;
                
                let label = '';
                if (sourceStep && targetStep) {
                  label = `Etapa ${sourceStep} → ${targetStep}`;
                } else {
                  label = 'Próxima etapa';
                }
                
                edges.push({
                  id: `e${sourceNode.id}-${targetNode.id}`,
                  source: sourceNode.id,
                  target: targetNode.id,
                  label: label,
                  animated: false,
                  style: { stroke: '#8b5cf6' }, // Roxo/Indigo
                  labelStyle: { fill: '#8b5cf6', fontWeight: 500 },
                  labelBgStyle: { fill: 'rgba(255, 255, 255, 0.75)', rx: 4, ry: 4 }
                });
              }
              
              // Conectar o último processo aos nós de aplicação prática
              const lastProcess = nodesByType.process[nodesByType.process.length - 1];
              if (nodesByType.practice.length > 0) {
                nodesByType.practice.forEach((practiceNode, idx) => {
                  edges.push({
                    id: `e${lastProcess.id}-${practiceNode.id}`,
                    source: lastProcess.id,
                    target: practiceNode.id,
                    label: idx === 0 ? 'Aplicação prática' : '',
                    animated: false,
                    style: { stroke: '#8b5cf6' }, // Roxo/Indigo
                    labelStyle: { fill: '#8b5cf6', fontWeight: 500 },
                    labelBgStyle: { fill: 'rgba(255, 255, 255, 0.75)', rx: 4, ry: 4 }
                  });
                });
              }
            }
            
            // 4. Conectar os nós de decisão com ramos "Correto" e "Incorreto"
            if (nodesByType.decision.length > 0) {
              nodesByType.decision.forEach((decisionNode, idx) => {
                // Determinar para onde o ramo "Correto" deve ir
                // Tipicamente para o próximo nó de prática ou conclusão
                let correctTargetFound = false;
                
                // Tentar encontrar um nó de prática não conectado como destino
                const availablePracticeNodes = nodesByType.practice.filter(n => 
                  n.id !== decisionNode.id && 
                  !edges.some(e => e.target === n.id) &&
                  !edges.some(e => e.source === decisionNode.id && e.target === n.id)
                );
                
                if (availablePracticeNodes.length > 0) {
                  edges.push({
                    id: `e${decisionNode.id}-${availablePracticeNodes[0].id}-correct`,
                    source: decisionNode.id,
                    target: availablePracticeNodes[0].id,
                    label: 'Correto',
                    animated: false,
                    style: { stroke: '#10b981' }, // Verde
                    labelStyle: { fill: '#10b981', fontWeight: 500 },
                    labelBgStyle: { fill: 'rgba(255, 255, 255, 0.75)', rx: 4, ry: 4 }
                  });
                  correctTargetFound = true;
                }
                
                // Se não encontrou alvo para o caminho correto, tente o nó de fim
                if (!correctTargetFound && nodesByType.end.length > 0) {
                  edges.push({
                    id: `e${decisionNode.id}-${nodesByType.end[0].id}-correct`,
                    source: decisionNode.id,
                    target: nodesByType.end[0].id,
                    label: 'Correto',
                    animated: false,
                    style: { stroke: '#10b981' }, // Verde 
                    labelStyle: { fill: '#10b981', fontWeight: 500 },
                    labelBgStyle: { fill: 'rgba(255, 255, 255, 0.75)', rx: 4, ry: 4 }
                  });
                  correctTargetFound = true;
                }
                
                // Determinar para onde o ramo "Incorreto" deve ir
                // Tipicamente para um nó de dica ou volta para um processo anterior
                let incorrectTargetFound = false;
                
                // Primeiro tente uma dica
                if (nodesByType.tip.length > 0) {
                  const availableTips = nodesByType.tip.filter(t => 
                    !edges.some(e => e.source === decisionNode.id && e.target === t.id)
                  );
                  
                  if (availableTips.length > 0) {
                    edges.push({
                      id: `e${decisionNode.id}-${availableTips[0].id}-incorrect`,
                      source: decisionNode.id,
                      target: availableTips[0].id,
                      label: 'Incorreto',
                      animated: false,
                      style: { stroke: '#f43f5e' }, // Vermelho
                      labelStyle: { fill: '#f43f5e', fontWeight: 500 },
                      labelBgStyle: { fill: 'rgba(255, 255, 255, 0.75)', rx: 4, ry: 4 }
                    });
                    incorrectTargetFound = true;
                  }
                }
                
                // Se não encontrou dica, volte para um processo anterior
                if (!incorrectTargetFound && nodesByType.process.length > 0) {
                  const processToReview = nodesByType.process[Math.floor(nodesByType.process.length / 2)];
                  edges.push({
                    id: `e${decisionNode.id}-${processToReview.id}-incorrect`,
                    source: decisionNode.id,
                    target: processToReview.id,
                    label: 'Incorreto - Revise',
                    animated: false,
                    style: { stroke: '#f43f5e' }, // Vermelho
                    labelStyle: { fill: '#f43f5e', fontWeight: 500 },
                    labelBgStyle: { fill: 'rgba(255, 255, 255, 0.75)', rx: 4, ry: 4 }
                  });
                  incorrectTargetFound = true;
                }
              });
            }
            
            // 5. Conectar nós de dica aos nós relevantes
            if (nodesByType.tip.length > 0) {
              nodesByType.tip.forEach(tipNode => {
                // Se o nó de dica não é destino de nenhuma conexão ainda, conecte-o
                if (!edges.some(e => e.target === tipNode.id)) {
                  // Encontrar um nó de processo aleatório para receber a dica
                  if (nodesByType.process.length > 0) {
                    const randomProcessIndex = Math.floor(Math.random() * nodesByType.process.length);
                    edges.push({
                      id: `e${nodesByType.process[randomProcessIndex].id}-${tipNode.id}`,
                      source: nodesByType.process[randomProcessIndex].id,
                      target: tipNode.id,
                      label: 'Dica importante',
                      animated: true,
                      style: { stroke: '#0ea5e9', strokeDasharray: '5,5' }, // Azul tracejado
                      labelStyle: { fill: '#0ea5e9', fontWeight: 500 },
                      labelBgStyle: { fill: 'rgba(255, 255, 255, 0.75)', rx: 4, ry: 4 }
                    });
                  }
                }
                
                // Se o nó de dica não é origem de nenhuma conexão ainda,
                // conecte-o de volta a um nó relevante
                if (!edges.some(e => e.source === tipNode.id)) {
                  // Tentar encontrar o próximo nó lógico
                  let targetFound = false;
                  
                  // Primeiro tente qualquer nó de prática disponível
                  if (!targetFound && nodesByType.practice.length > 0) {
                    const availablePractice = nodesByType.practice.find(p => 
                      !edges.some(e => e.source === tipNode.id && e.target === p.id)
                    );
                    
                    if (availablePractice) {
                      edges.push({
                        id: `e${tipNode.id}-${availablePractice.id}`,
                        source: tipNode.id,
                        target: availablePractice.id,
                        label: 'Continue',
                        animated: false,
                        style: { stroke: '#0ea5e9', strokeDasharray: '5,5' }, // Azul tracejado
                        labelStyle: { fill: '#0ea5e9', fontWeight: 500 },
                        labelBgStyle: { fill: 'rgba(255, 255, 255, 0.75)', rx: 4, ry: 4 }
                      });
                      targetFound = true;
                    }
                  }
                  
                  // Ou então, vá para o nó final
                  if (!targetFound && nodesByType.end.length > 0) {
                    edges.push({
                      id: `e${tipNode.id}-${nodesByType.end[0].id}`,
                      source: tipNode.id,
                      target: nodesByType.end[0].id,
                      label: 'Prosseguir',
                      animated: false,
                      style: { stroke: '#0ea5e9', strokeDasharray: '5,5' }, // Azul tracejado
                      labelStyle: { fill: '#0ea5e9', fontWeight: 500 },
                      labelBgStyle: { fill: 'rgba(255, 255, 255, 0.75)', rx: 4, ry: 4 }
                    });
                  }
                }
              });
            }
            
            // 6. Conectar nós de aplicação prática à conclusão
            if (nodesByType.practice.length > 0 && nodesByType.end.length > 0) {
              // Para cada nó de prática que não tem saída, conectar ao nó de conclusão
              nodesByType.practice.forEach(practiceNode => {
                if (!edges.some(e => e.source === practiceNode.id)) {
                  edges.push({
                    id: `e${practiceNode.id}-${nodesByType.end[0].id}`,
                    source: practiceNode.id,
                    target: nodesByType.end[0].id,
                    label: 'Consolidar aprendizado',
                    animated: false,
                    style: { stroke: '#6366f1' }, // Indigo
                    labelStyle: { fill: '#6366f1', fontWeight: 500 },
                    labelBgStyle: { fill: 'rgba(255, 255, 255, 0.75)', rx: 4, ry: 4 }
                  });
                }
              });
            }
            
            // 7. Verificar nós não conectados e criar conexões adicionais
            // Conectar qualquer nó sem saída ao próximo nó lógico no fluxo
            nodes.forEach(node => {
              // Se o nó não tem saída (exceto o nó final)
              if (node.type !== 'end' && !edges.some(e => e.source === node.id)) {
                // Determinar para qual tipo de nó deveria conectar com base na camada atual
                let targetNodeType = 'default';
                switch (node.type) {
                  case 'start': targetNodeType = 'context'; break;
                  case 'context': targetNodeType = 'process'; break;
                  case 'process': targetNodeType = 'practice'; break;
                  case 'practice': 
                  case 'decision': 
                  case 'tip': targetNodeType = 'end'; break;
                  default: targetNodeType = 'end';
                }
                
                // Encontrar o primeiro nó do tipo alvo que não é destino deste nó
                const targetNodes = nodesByType[targetNodeType] || [];
                const targetNode = targetNodes.find(t => 
                  t.id !== node.id && !edges.some(e => e.source === node.id && e.target === t.id)
                );
                
                // Se encontrou um nó alvo, crie a conexão
                if (targetNode) {
                  // Personalizar o rótulo com base nos tipos
                  let label = 'Continua';
                  if (node.type === 'start' && targetNode.type === 'context') {
                    label = 'Para compreender';
                  } else if (node.type === 'context' && targetNode.type === 'process') {
                    label = 'Vamos ao processo';
                  } else if (node.type === 'process' && targetNode.type === 'practice') {
                    label = 'Aplicação';
                  } else if (targetNode.type === 'end') {
                    label = 'Concluindo';
                  }
                  
                  edges.push({
                    id: `e${node.id}-${targetNode.id}`,
                    source: node.id,
                    target: targetNode.id,
                    label: label,
                    animated: false,
                    style: { stroke: '#3b82f6' }, // Azul padrão
                    labelStyle: { fill: '#3b82f6', fontWeight: 500 },
                    labelBgStyle: { fill: 'rgba(255, 255, 255, 0.75)', rx: 4, ry: 4 }
                  });
                }
                // Se não encontrou do tipo ideal, tente conectar ao nó final
                else if (nodesByType.end.length > 0 && node.type !== 'end') {
                  edges.push({
                    id: `e${node.id}-${nodesByType.end[0].id}`,
                    source: node.id,
                    target: nodesByType.end[0].id,
                    label: 'Finalizando',
                    animated: false,
                    style: { stroke: '#3b82f6' }, // Azul padrão
                    labelStyle: { fill: '#3b82f6', fontWeight: 500 },
                    labelBgStyle: { fill: 'rgba(255, 255, 255, 0.75)', rx: 4, ry: 4 }
                  });
                }
              }
            });
          }
          
          fluxogramaData = { nodes, edges };
          
        } catch (error) {
          console.error('Erro ao processar com IA:', error);
          
          // Fallback para o método original se a IA falhar
          fluxogramaData = await new Promise((resolve) => {
            // ETAPA 1: Analisar e Estruturar o Conteúdo
            const paragraphs = contentToAnalyze.split(/\n\n+/);
            const sentences = contentToAnalyze.split(/[.!?]\s+/);
            
            // Identificar blocos conceituais principais
            const mainBlocks = paragraphs.length > 3 ? paragraphs.slice(0, paragraphs.length) : sentences.slice(0, Math.min(8, sentences.length));
            
            // Extrair palavras-chave significativas
            const keywords = mainBlocks.map(block => {
              const words = block.split(/\s+/).filter(word => word.length > 3);
              const mainWord = words.find(word => word.length > 5) || words[0] || 'Conceito';
              return {
                text: block,
                keyword: mainWord.length > 20 ? mainWord.substring(0, 20) + '...' : mainWord
              };
            }).slice(0, 8); // Limitar a 8 nós para melhor visualização
            
            // ETAPA 2: Gerar os Nós (Nodes) do Fluxograma
            const nodes = keywords.map((item, index) => {
              // Determinar o tipo do nó
              let type = 'default';
              if (index === 0) type = 'start';
              else if (index === keywords.length - 1) type = 'end';
              
              // Criar descrição significativa
              const description = item.text.length > 100 
                ? item.text.substring(0, 100) + '...' 
                : item.text;
              
              // Ajustar posicionamento para layout de fluxo
              let position;
              const flowDirection = 'vertical'; // ou 'horizontal'
              
              if (flowDirection === 'vertical') {
                position = { x: 250, y: 100 + (index * 120) };
              } else {
                position = { x: 100 + (index * 220), y: 200 };
              }
              
              return {
                id: (index + 1).toString(),
                data: { 
                  label: item.keyword.charAt(0).toUpperCase() + item.keyword.slice(1), 
                  description: description
                },
                type,
                position
              };
            });
            
            // ETAPA 3: Gerar as Conexões (Edges)
            const edges = [];
            for (let i = 0; i < nodes.length - 1; i++) {
              edges.push({
                id: `e${i+1}-${i+2}`,
                source: (i + 1).toString(),
                target: (i + 2).toString(),
                animated: true,
                style: { stroke: '#3b82f6' }
              });
            }
            
            // Simular um pequeno atraso antes de resolver (opcional)
            setTimeout(() => {
              resolve({ nodes, edges });
            }, 1000);
          });
        }
        
        // Armazena os dados do fluxograma para uso posterior no visualizador
        localStorage.setItem('fluxogramaData', JSON.stringify(fluxogramaData));
        
        setIsLoading(false);
        setFluxogramaGerado(true);
      } catch (error) {
        console.error('Erro ao processar o fluxograma:', error);
        setIsLoading(false);
      }
    };
    
    processFluxogramaContent();
  };

  const handleCancelManualInput = () => {
    setShowManualInput(false);
    setSelectedOption(null);
    setManualContent('');
  };

  const handleVisualizarFluxograma = () => {
    setShowFluxograma(true);
  };

  const handleCloseFluxograma = () => {
    setShowFluxograma(false);
  };

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-2">
        <Button 
          onClick={handleBack} 
          variant="ghost" 
          size="sm" 
          className="mr-2 h-8 w-8 p-0 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <FileLineChart className="h-5 w-5 mr-2 text-blue-500" />
          Criar Fluxograma do Tema
        </h3>
      </div>

      {showFluxograma ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">Fluxograma Interativo</h4>
            <Button
              onClick={handleCloseFluxograma}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <FluxogramaVisualizer onNodeClick={handleNodeClick} />
          {/* Painel de ações fixo */}
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/70 dark:border-gray-700/50 p-5 shadow-sm backdrop-blur-sm fixed bottom-4 right-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <FileLineChart className="h-5 w-5 mr-2 text-blue-500" />
              Painel de Ações
            </h4>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              <Button variant="outline" className="flex flex-col items-center justify-center h-auto py-3 px-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all">
                <RotateCw className="h-5 w-5 mb-1 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-gray-700 dark:text-gray-300 text-center">Regenerar</span>
              </Button>

              <Button variant="outline" className="flex flex-col items-center justify-center h-auto py-3 px-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all">
                <Download className="h-5 w-5 mb-1 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-gray-700 dark:text-gray-300 text-center">Exportar</span>
              </Button>

              <Button variant="outline" className="flex flex-col items-center justify-center h-auto py-3 px-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all">
                <Clipboard className="h-5 w-5 mb-1 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-gray-700 dark:text-gray-300 text-center">Caderno</span>
              </Button>

              <Button variant="outline" className="flex flex-col items-center justify-center h-auto py-3 px-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all">
                <Maximize2 className="h-5 w-5 mb-1 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-gray-700 dark:text-gray-300 text-center">Ampliar</span>
              </Button>

              <Button variant="outline" className="flex flex-col items-center justify-center h-auto py-3 px-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all">
                <Save className="h-5 w-5 mb-1 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-gray-700 dark:text-gray-300 text-center">Salvar</span>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <ScrollArea className="h-[50vh] pr-4">
          <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-4 border border-blue-100/80 dark:border-blue-800/30 mb-4 backdrop-blur-sm">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              Selecione abaixo como deseja gerar o fluxograma.
            </p>
          </div>

          {!showManualInput ? (
            <div className="space-y-4">
              <Button
                onClick={() => handleGenerateFlowchart('ia')}
                className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all border border-blue-500/20 rounded-xl group relative overflow-hidden flex items-center justify-center"
                disabled={isLoading || showManualInput}
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400/10 to-indigo-400/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                <span className="relative flex items-center justify-center">
                  <FileDown className="h-5 w-5 mr-2 transform group-hover:translate-y-px transition-transform" />
                  <span className="font-medium">Usar conteúdo da IA acima</span>
                </span>
              </Button>

              <Button
                onClick={() => handleGenerateFlowchart('manual')}
                variant="outline"
                className="w-full py-6 bg-white/80 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/70 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl backdrop-blur-sm group relative overflow-hidden flex items-center justify-center"
                disabled={isLoading || showManualInput}
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700/30 dark:to-gray-800/30 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                <span className="relative flex items-center justify-center">
                  <PenLine className="h-5 w-5 mr-2 transform group-hover:translate-y-px transition-transform" />
                  <span className="font-medium">Inserir meu próprio conteúdo</span>
                </span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/70 dark:border-gray-700/50 p-5 shadow-sm backdrop-blur-sm">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Insira seu conteúdo para gerar o fluxograma</h4>
              <Textarea 
                value={manualContent}
                onChange={(e) => setManualContent(e.target.value)}
                placeholder="Insira aqui o conteúdo sobre o qual você deseja gerar um fluxograma..."
                className="min-h-[200px] resize-none"
              />
              <div className="flex justify-end space-x-2 mt-2">
                <Button
                  onClick={handleCancelManualInput}
                  variant="outline"
                  className="flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  <span>Cancelar</span>
                </Button>
                <Button
                  onClick={handleSubmitManualContent}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center"
                >
                  <SendHorizonal className="h-4 w-4 mr-2" />
                  <span>Gerar Fluxograma</span>
                </Button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="mt-6 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/70 dark:border-gray-700/50 p-6 shadow-sm backdrop-blur-sm">
              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100/80 dark:bg-blue-900/40 mb-4 relative">
                  <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-pulse"></div>
                  <svg className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Processando o Fluxograma</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Estamos analisando o conteúdo e construindo um fluxograma visual para facilitar sua compreensão.
                </p>
              </div>
              <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full animate-progress"></div>
              </div>
            </div>
          )}

          {selectedOption === 'ia' && !isLoading && fluxogramaGerado && (
            <div className="mt-6 space-y-6">
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/70 dark:border-gray-700/50 p-5 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 shadow-sm">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                </div>
                <h4 className="text-center text-lg font-medium text-gray-900 dark:text-white mb-2">Fluxograma Gerado!</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                  Seu fluxograma foi criado com base no conteúdo da IA.
                </p>
                <div className="flex justify-center">
                  <Button 
                    onClick={handleVisualizarFluxograma}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    <span>Visualizar Fluxograma</span>
                  </Button>
                </div>
              </div>

              {/* Painel de ações removido daqui, pois agora está fixo no topo */}
            </div>
          )}

          {selectedOption === 'manual' && !isLoading && fluxogramaGerado && (
            <div className="mt-6 space-y-6">
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/70 dark:border-gray-700/50 p-5 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 shadow-sm">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                </div>
                <h4 className="text-center text-lg font-medium text-gray-900 dark:text-white mb-2">Fluxograma Personalizado</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                  Seu fluxograma foi criado com base no conteúdo personalizado.
                </p>
                <div className="flex justify-center">
                  <Button
                    onClick={handleVisualizarFluxograma}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    <span>Visualizar Fluxograma</span>
                  </Button>
                </div>
              </div>

              {/* Painel de ações removido daqui, pois agora está fixo no topo */}
            </div>
          )}
        </ScrollArea>
      )}

      {showDetailModal && selectedNode && (
        <FluxogramaDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          node={selectedNode}
        />
      )}
    </div>
  );
};

export default GerarFluxograma;