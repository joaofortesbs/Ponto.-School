
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, FileText, Award } from 'lucide-react';

interface AvaliacaoCardProps {
  avaliacao: {
    id: string;
    tipo: 'Avaliacao';
    titulo: string;
    objetivo: string;
    resumo: string;
    criteriosAvaliacao?: string[];
    instrumentos?: string[];
    valorPontuacao?: string;
  };
}

const AvaliacaoCard: React.FC<AvaliacaoCardProps> = ({ avaliacao }) => {
  return (
    <Card className="border-purple-200 bg-purple-50 h-full hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <Badge className="bg-purple-100 text-purple-800">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Avaliação
            </div>
          </Badge>
          {avaliacao.valorPontuacao && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Award className="h-3 w-3" />
              {avaliacao.valorPontuacao}
            </span>
          )}
        </div>
        <CardTitle className="text-sm font-semibold text-gray-800 line-clamp-2">
          {avaliacao.titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
              <Target className="h-3 w-3" />
              Objetivo
            </h4>
            <p className="text-xs text-gray-700 line-clamp-2">
              {avaliacao.objetivo}
            </p>
          </div>
          
          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-1">Resumo</h4>
            <p className="text-xs text-gray-600 line-clamp-3">
              {avaliacao.resumo}
            </p>
          </div>

          {avaliacao.criteriosAvaliacao && avaliacao.criteriosAvaliacao.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-600 mb-1">Critérios</h4>
              <div className="flex flex-wrap gap-1">
                {avaliacao.criteriosAvaliacao.slice(0, 2).map((criterio, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {criterio}
                  </Badge>
                ))}
                {avaliacao.criteriosAvaliacao.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{avaliacao.criteriosAvaliacao.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AvaliacaoCard;
