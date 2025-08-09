
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Eye, Lightbulb, CheckCircle } from 'lucide-react';
import { AtividadesData, AtividadesDataProcessor } from './AtividadesData';

interface AtividadesInterfaceProps {
  planoData: any;
}

const AtividadesInterface: React.FC<AtividadesInterfaceProps> = ({ planoData }) => {
  const data = AtividadesDataProcessor.processData(planoData);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-orange-600" />
          Atividades Práticas
        </h3>
        <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Atividade
        </Button>
      </div>

      <div className="space-y-4">
        {data.atividades.map((atividade, index) => (
          <Card key={index} className="border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">{atividade.nome}</h4>
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 px-3 py-1">
                      {atividade.tipo}
                    </Badge>
                  </div>

                  {atividade.ref_objetivos && atividade.ref_objetivos.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">Objetivos relacionados:</span>
                      <div className="flex flex-wrap gap-2">
                        {atividade.ref_objetivos.map((obj: number) => (
                          <Badge key={obj} variant="outline" size="sm" className="border-orange-300 text-orange-700 bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:bg-orange-900/30">
                            Objetivo {obj}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {atividade.visualizar_como_aluno && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong className="text-gray-800 dark:text-gray-200">Experiência do aluno:</strong> {atividade.visualizar_como_aluno}
                      </p>
                    </div>
                  )}

                  {atividade.sugestoes_ia && atividade.sugestoes_ia.length > 0 && (
                    <div className="bg-gradient-to-r from-orange-50 to-indigo-50 dark:from-orange-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                      <strong className="text-orange-800 dark:text-orange-200 block mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Sugestões da IA:
                      </strong>
                      <ul className="space-y-1">
                        {atividade.sugestoes_ia.map((sugestao: string, idx: number) => (
                          <li key={idx} className="text-orange-700 dark:text-orange-300 text-sm flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {sugestao}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button size="sm" variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button size="sm" variant="outline" className="border-gray-300 text-gray-600 hover:bg-gray-50">
                    Substituir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AtividadesInterface;
