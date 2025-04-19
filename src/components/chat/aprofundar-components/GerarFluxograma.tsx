
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
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
          className="mr-2 h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📈 Criar Fluxograma do Tema</h3>
      </div>

      <ScrollArea className="h-[50vh] pr-4">
        <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30 mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            Selecione abaixo como deseja gerar o fluxograma.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => handleGenerateFlowchart('ia')}
            className="w-full py-6 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all border border-blue-400 dark:border-blue-700"
            disabled={isLoading}
          >
            <span className="text-xl mr-2">📥</span> Usar conteúdo da IA acima
          </Button>
          
          <Button
            onClick={() => handleGenerateFlowchart('manual')}
            variant="outline"
            className="w-full py-6 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
            disabled={isLoading}
          >
            <span className="text-xl mr-2">✍️</span> Inserir meu próprio conteúdo
          </Button>
        </div>

        {isLoading && (
          <div className="mt-6 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200/70 dark:border-gray-700/50 p-6 shadow-sm">
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/40 mb-4">
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
            <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full animate-progress"></div>
            </div>
          </div>
        )}

        {selectedOption === 'ia' && !isLoading && (
          <div className="mt-6 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200/70 dark:border-gray-700/50 p-4 shadow-sm">
            <div className="flex items-center justify-center mb-4">
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h4 className="text-center text-lg font-medium text-gray-900 dark:text-white mb-2">Fluxograma Gerado!</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
              Seu fluxograma foi criado com base no conteúdo da IA.
            </p>
            <div className="flex justify-center">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Visualizar Fluxograma
              </Button>
            </div>
          </div>
        )}

        {selectedOption === 'manual' && !isLoading && (
          <div className="mt-6 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200/70 dark:border-gray-700/50 p-4 shadow-sm">
            <h4 className="text-center text-lg font-medium text-gray-900 dark:text-white mb-2">Fluxograma Personalizado</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
              Seu fluxograma foi criado com base no conteúdo personalizado.
            </p>
            <div className="flex justify-center">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Visualizar Fluxograma
              </Button>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default GerarFluxograma;
