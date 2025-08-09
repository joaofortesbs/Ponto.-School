
import React from 'react';
import { Button } from '@/components/ui/button';
import { Target, Plus } from 'lucide-react';
import { ObjetivosData, ObjetivosDataProcessor } from './ObjetivosData';

interface ObjetivosInterfaceProps {
  planoData: any;
}

const ObjetivosInterface: React.FC<ObjetivosInterfaceProps> = ({ planoData }) => {
  const data = ObjetivosDataProcessor.processData(planoData);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            Objetivos de Aprendizagem
          </h3>
          <Button
            variant="outline"
            size="sm"
            className="bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/50"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Objetivo
          </Button>
        </div>

        {/* Frase gerada pela IA */}
        <div className="mb-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <Target className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-orange-800 dark:text-orange-200 leading-relaxed font-medium">
                Compreender a estrutura e o funcionamento da língua portuguesa: Utilizar a norma padrão da língua em situações comunicativas. Produzir textos coerentes e coesos. Desenvolver a capacidade de análise crítica e reflexiva sobre a língua. Ampliar o vocabulário. Aprimorar a leitura e a escrita.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          {data.objetivos.map((objetivo, index) => (
            <div
              key={index}
              className="group relative bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-700 rounded-2xl p-4 hover:shadow-md transition-all duration-200 hover:border-orange-300 dark:hover:border-orange-600"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{objetivo.descricao}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ObjetivosInterface;
