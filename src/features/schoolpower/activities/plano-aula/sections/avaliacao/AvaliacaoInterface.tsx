
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Plus } from 'lucide-react';
import { AvaliacaoData, AvaliacaoDataProcessor } from './AvaliacaoData';

interface AvaliacaoInterfaceProps {
  planoData: any;
}

const AvaliacaoInterface: React.FC<AvaliacaoInterfaceProps> = ({ planoData }) => {
  const data = AvaliacaoDataProcessor.processData(planoData);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-orange-600" />
            Avaliação
          </h3>
          <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Critério
          </Button>
      </div>
      <Card className="border-l-4 border-l-orange-500 shadow-lg">
        <CardContent className="space-y-6 p-6">
          <div className="bg-orange-50 dark:bg-orange-900/20 p-5 rounded-xl border border-orange-200 dark:border-orange-700">
            <label className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-3 block">Critérios de Avaliação</label>
            <p className="text-orange-700 dark:text-orange-300 text-base leading-relaxed">
              {data.criterios}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 block">Instrumentos de Avaliação</label>
              <div className="flex flex-wrap gap-2">
                {data.instrumentos.map((instrumento: string, index: number) => (
                  <Badge key={index} variant="outline" className="border-orange-300 text-orange-700 bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:bg-orange-900/30 px-3 py-1">
                    {instrumento}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 block">Feedback</label>
              <p className="text-base text-gray-800 dark:text-gray-200">{data.feedback}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvaliacaoInterface;
