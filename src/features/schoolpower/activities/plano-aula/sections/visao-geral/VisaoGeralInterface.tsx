
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from "@/components/ui/separator";
import { BookOpen, Lightbulb, CheckCircle } from 'lucide-react';
import { VisaoGeralData, VisaoGeralDataProcessor } from './VisaoGeralData';

interface VisaoGeralInterfaceProps {
  planoData: any;
}

const VisaoGeralInterface: React.FC<VisaoGeralInterfaceProps> = ({ planoData }) => {
  const data = VisaoGeralDataProcessor.processData(planoData);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-xl border border-orange-200 dark:border-orange-700">
        <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100 mb-4 flex items-center gap-3">
          <div className="p-2 bg-orange-500 rounded-lg">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          Informações Gerais
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Disciplina</label>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{data.disciplina}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Série/Ano</label>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{data.serie}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Tempo</label>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{data.tempo}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Metodologia</label>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{data.metodologia}</p>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 block">Recursos Necessários</label>
          <div className="flex flex-wrap gap-2">
            {data.recursos.map((recurso: string, index: number) => (
              <Badge key={index} variant="outline" className="border-orange-300 text-orange-700 bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:bg-orange-900/30 px-3 py-1">
                {recurso}
              </Badge>
            ))}
          </div>
        </div>

        {data.sugestoes_ia && data.sugestoes_ia.length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-indigo-50 dark:from-orange-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700 mt-4">
            <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Sugestões da IA
            </h4>
            <ul className="space-y-2">
              {data.sugestoes_ia.map((sugestao: string, index: number) => (
                <li key={index} className="text-orange-700 dark:text-orange-300 text-sm flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {sugestao}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisaoGeralInterface;
