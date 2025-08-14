
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
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Star, Scale } from 'lucide-react';

interface AvaliacaoCardProps {
  avaliacao: {
    id: string;
    numero: number;
    titulo: string;
    tipo: string;
    instrumentos: string[];
    criterios: string;
    peso: string;
  };
}

export const AvaliacaoCard: React.FC<AvaliacaoCardProps> = ({ avaliacao }) => {
  return (
    <Card className="h-full hover:shadow-md transition-shadow border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          {avaliacao.titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Star className="h-4 w-4 text-purple-600" />
          <span className="font-medium">Tipo:</span>
          <span className={`px-2 py-1 rounded text-xs ${
            avaliacao.tipo === 'Formativa' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-purple-100 text-purple-800'
          }`}>
            {avaliacao.tipo}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Scale className="h-4 w-4" />
          <span className="font-medium">Peso:</span>
          <span>{avaliacao.peso}</span>
        </div>

        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-1">Instrumentos:</h4>
          <div className="flex flex-wrap gap-1">
            {avaliacao.instrumentos.map((instrumento, index) => (
              <span key={index} className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                {instrumento}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-1">Critérios:</h4>
          <p className="text-sm text-gray-600">{avaliacao.criterios}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvaliacaoCard;
