
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, Share2, Download } from 'lucide-react';
import FluxogramaVisualizer from '@/components/chat/aprofundar-components/FluxogramaVisualizer';
import FluxogramaDetailModal from '@/components/chat/aprofundar-components/FluxogramaDetailModal';
import { Node } from 'reactflow';

const SharedFluxogramaPage: React.FC = () => {
  const router = useRouter();
  const { title, username, userId } = router.query;
  
  const [fluxogramaData, setFluxogramaData] = useState<any>(null);
  const [fluxogramaTitle, setFluxogramaTitle] = useState('');
  const [ownerUsername, setOwnerUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    if (title && userId) {
      // Tentar carregar dados do localStorage
      try {
        const formattedTitle = typeof title === 'string' ? title : '';
        const formattedUserId = typeof userId === 'string' ? userId : '';
        
        const shareDataKey = `shared_fluxograma_${formattedTitle}_${formattedUserId}`;
        const sharedDataString = localStorage.getItem(shareDataKey);
        
        if (sharedDataString) {
          const sharedData = JSON.parse(sharedDataString);
          setFluxogramaData(sharedData.fluxogramaData);
          setFluxogramaTitle(sharedData.title);
          setOwnerUsername(sharedData.username);
        } else {
          console.error('Dados do fluxograma não encontrados no localStorage');
        }
      } catch (error) {
        console.error('Erro ao carregar fluxograma compartilhado:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [title, userId]);

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
    setShowDetailModal(true);
  };

  const handleShareAgain = async () => {
    try {
      // Recriar URL para compartilhar novamente
      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}/fluxograma/${title}/${username}/${userId}`;
      
      await navigator.clipboard.writeText(shareUrl);
      alert(`URL do fluxograma copiada para a área de transferência:\n${shareUrl}`);
    } catch (error) {
      console.error('Erro ao compartilhar fluxograma:', error);
      alert('Ocorreu um erro ao compartilhar o fluxograma.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Carregando fluxograma...</p>
        </div>
      ) : fluxogramaData ? (
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <Button 
                onClick={() => window.history.back()} 
                variant="ghost" 
                size="sm" 
                className="mb-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {fluxogramaTitle}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Criado por: <span className="font-medium">{ownerUsername}</span>
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleShareAgain}
                className="flex items-center"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Implementação básica de exportação como imagem
                  alert('Funcionalidade de download será implementada em breve');
                }}
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
              <Info className="h-4 w-4 text-blue-500 mr-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Clique nos elementos do fluxograma para ver detalhes. Use o mouse para navegar e a roda do mouse para ampliar/reduzir.
              </p>
            </div>
            <div className="p-4">
              <FluxogramaVisualizer 
                flowData={fluxogramaData} 
                onNodeClick={handleNodeClick} 
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] max-w-md mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
            <Info className="h-8 w-8 text-gray-500 dark:text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Fluxograma não encontrado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            O fluxograma que você está procurando não está disponível ou foi removido.
          </p>
          <Button onClick={() => window.history.back()}>
            Voltar
          </Button>
        </div>
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

export default SharedFluxogramaPage;
