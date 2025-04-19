
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileDown, PenLine, Eye, CheckCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

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

  const handleGenerateFlowchart = (option: 'ia' | 'manual') => {
    setSelectedOption(option);
    setIsLoading(true);
    
    // Simula o processamento do fluxograma
    setTimeout(() => {
      setIsLoading(false);
      // Aqui seria implementada a lógica real de geração do fluxograma
    }, 3000);
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
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
          Criar Fluxograma do Tema
        </h3>
      </div>

      <ScrollArea className="h-[50vh] pr-4">
        <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-4 border border-blue-100/80 dark:border-blue-800/30 mb-4 backdrop-blur-sm">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            Selecione abaixo como deseja gerar o fluxograma.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => handleGenerateFlowchart('ia')}
            className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all border border-blue-500/20 rounded-xl group relative overflow-hidden"
            disabled={isLoading}
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
            className="w-full py-6 bg-white/80 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/70 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl backdrop-blur-sm group relative overflow-hidden"
            disabled={isLoading}
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700/30 dark:to-gray-800/30 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            <span className="relative flex items-center justify-center">
              <PenLine className="h-5 w-5 mr-2 transform group-hover:translate-y-px transition-transform" />
              <span className="font-medium">Inserir meu próprio conteúdo</span>
            </span>
          </Button>
        </div>

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

        {selectedOption === 'ia' && !isLoading && (
          <div className="mt-6 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/70 dark:border-gray-700/50 p-5 shadow-sm backdrop-blur-sm">
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
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                <span>Visualizar Fluxograma</span>
              </Button>
            </div>
          </div>
        )}

        {selectedOption === 'manual' && !isLoading && (
          <div className="mt-6 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/70 dark:border-gray-700/50 p-5 shadow-sm backdrop-blur-sm">
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
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                <span>Visualizar Fluxograma</span>
              </Button>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default GerarFluxograma;
