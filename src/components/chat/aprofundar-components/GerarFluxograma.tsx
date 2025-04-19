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

Crie um fluxograma que:
1. Identifique os principais blocos conceituais (etapas, partes, causas, consequências, tópicos)
2. Classifique cada bloco como "início", "processo" ou "conclusão"
3. Organize os blocos em uma sequência lógica
4. Forneça uma breve descrição de cada bloco
5. Retorne o resultado como um objeto JSON com a seguinte estrutura:
{
  "nodes": [
    {
      "id": "1",
      "title": "Título do nó",
      "description": "Descrição detalhada do nó",
      "type": "start/default/end"
    }
  ],
  "connections": [
    {
      "source": "1",
      "target": "2",
      "label": "Relação"
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
            // Determinar o tipo do nó (usando o tipo da IA ou inferindo por posição e conteúdo)
            let nodeType = node.type || 'default';
            if (!node.type) {
              // Inferência baseada na posição
              if (index === 0) nodeType = 'start';
              else if (index === extractedData.nodes.length - 1) nodeType = 'end';
              // Inferência baseada no conteúdo (opcional)
              else if (node.title?.toLowerCase().includes('decis') || 
                       node.title?.toLowerCase().includes('escolh') ||
                       node.title?.toLowerCase().includes('opç') ||
                       node.description?.toLowerCase().includes('se ') ||
                       node.description?.toLowerCase().includes('caso ')) {
                nodeType = 'decision';
              }
            }
            
            // Calcular posicionamento para layout vertical ou horizontal
            let position;
            const flowDirection = 'vertical'; // ou 'horizontal'
            
            // Cálculo de posição mais natural e com melhor espaçamento
            if (flowDirection === 'vertical') {
              // No layout vertical, posicionamos os nós em coluna com espaçamento progressivo
              const baseX = 250; // Centralizado
              const baseY = 80; // Começa mais no topo
              const spacing = 150; // Espaçamento maior entre nós
              
              position = { 
                x: baseX + (Math.random() * 30 - 15), // Pequena variação horizontal para naturalidade
                y: baseY + (index * spacing) 
              };
            } else {
              // No layout horizontal, posicionamos os nós em linha
              const baseX = 100;
              const baseY = 200;
              const spacing = 250; // Espaçamento maior para nós horizontais (geralmente têm mais informações)
              
              position = { 
                x: baseX + (index * spacing), 
                y: baseY + (Math.random() * 30 - 15) // Pequena variação vertical para naturalidade
              };
            }
            
            // Retorna o nó formatado com todos os dados necessários
            return {
              id: node.id,
              data: { 
                label: node.title || 'Conceito', 
                description: node.description || 'Sem descrição disponível'
              },
              type: nodeType,
              position
            };
          });
          
          // ETAPA 3: Gerar as Conexões (Edges) a partir dos dados da IA
          const edges = extractedData.connections?.map(conn => ({
            id: `e${conn.source}-${conn.target}`,
            source: conn.source,
            target: conn.target,
            label: conn.label || '',
            animated: true,
            style: { stroke: '#3b82f6' }
          })) || [];
          
          // Se não houver conexões definidas pela IA, criar conexões sequenciais padrão
          if (edges.length === 0 && nodes.length > 1) {
            for (let i = 0; i < nodes.length - 1; i++) {
              edges.push({
                id: `e${i+1}-${i+2}`,
                source: nodes[i].id,
                target: nodes[i+1].id,
                animated: true,
                style: { stroke: '#3b82f6' }
              });
            }
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