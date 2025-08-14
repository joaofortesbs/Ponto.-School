
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, BookOpen } from 'lucide-react';

interface AulaCardProps {
  aula: {
    id: string;
    tipo: 'Aula' | 'Diagnostico' | 'Avaliacao';
    titulo: string;
    objetivo: string;
    resumo: string;
    duracaoEstimada?: string;
    metodologia?: string;
    instrumentos?: string[];
    criteriosAvaliacao?: string[];
  };
}

const AulaCard: React.FC<AulaCardProps> = ({ aula }) => {
  const getCardColor = (tipo: string) => {
    switch (tipo) {
      case 'Aula':
        return 'border-blue-200 bg-blue-50';
      case 'Diagnostico':
        return 'border-green-200 bg-green-50';
      case 'Avaliacao':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'Aula':
        return 'bg-blue-100 text-blue-800';
      case 'Diagnostico':
        return 'bg-green-100 text-green-800';
      case 'Avaliacao':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'Aula':
        return <BookOpen className="h-4 w-4" />;
      case 'Diagnostico':
        return <Target className="h-4 w-4" />;
      case 'Avaliacao':
        return <Clock className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <Card className={`${getCardColor(aula.tipo)} h-full hover:shadow-md transition-shadow duration-200`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <Badge className={getBadgeColor(aula.tipo)}>
            <div className="flex items-center gap-1">
              {getIcon(aula.tipo)}
              {aula.tipo}
            </div>
          </Badge>
          {aula.duracaoEstimada && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {aula.duracaoEstimada}
            </span>
          )}
        </div>
        <CardTitle className="text-sm font-semibold text-gray-800 line-clamp-2">
          {aula.titulo}
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
              {aula.objetivo}
            </p>
          </div>
          
          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-1">Resumo</h4>
            <p className="text-xs text-gray-600 line-clamp-3">
              {aula.resumo}
            </p>
          </div>

          {aula.instrumentos && aula.instrumentos.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-600 mb-1">Instrumentos</h4>
              <div className="flex flex-wrap gap-1">
                {aula.instrumentos.slice(0, 2).map((instrumento, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {instrumento}
                  </Badge>
                ))}
                {aula.instrumentos.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{aula.instrumentos.length - 2}
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

export default AulaCard;
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Target, BookOpen } from 'lucide-react';

interface AulaCardProps {
  aula: {
    id: string;
    numero: number;
    titulo: string;
    objetivos: string[];
    duracao: string;
    metodologia: string;
    recursos: string[];
    desenvolvimento: string;
    avaliacao: string;
  };
}

export const AulaCard: React.FC<AulaCardProps> = ({ aula }) => {
  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          {aula.titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{aula.duracao}</span>
        </div>
        
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-1 flex items-center gap-1">
            <Target className="h-4 w-4" />
            Objetivos:
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {aula.objetivos.map((objetivo, index) => (
              <li key={index} className="flex items-start gap-1">
                <span className="text-blue-500 mt-1">•</span>
                <span>{objetivo}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-1">Metodologia:</h4>
          <p className="text-sm text-gray-600">{aula.metodologia}</p>
        </div>

        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-1">Recursos:</h4>
          <div className="flex flex-wrap gap-1">
            {aula.recursos.map((recurso, index) => (
              <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {recurso}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AulaCard;
