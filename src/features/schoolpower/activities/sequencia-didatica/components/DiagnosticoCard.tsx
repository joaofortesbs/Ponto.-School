import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, BarChart3, Clock } from 'lucide-react';

interface DiagnosticoCardProps {
  diagnostico: {
    id: string;
    tipo: 'Diagnostico';
    titulo: string;
    objetivo: string;
    resumo: string;
    instrumentos?: string[];
    momentoAplicacao?: string;
  };
}

const DiagnosticoCard: React.FC<DiagnosticoCardProps> = ({ diagnostico }) => {
  return (
    <Card className="border-green-200 bg-green-50 h-full hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <Badge className="bg-green-100 text-green-800">
            <div className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              Diagnóstico
            </div>
          </Badge>
          {diagnostico.momentoAplicacao && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {diagnostico.momentoAplicacao}
            </span>
          )}
        </div>
        <CardTitle className="text-sm font-semibold text-gray-800 line-clamp-2">
          {diagnostico.titulo}
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
              {diagnostico.objetivo}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-1">Resumo</h4>
            <p className="text-xs text-gray-600 line-clamp-3">
              {diagnostico.resumo}
            </p>
          </div>

          {diagnostico.instrumentos && diagnostico.instrumentos.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-600 mb-1">Instrumentos</h4>
              <div className="flex flex-wrap gap-1">
                {diagnostico.instrumentos.slice(0, 2).map((instrumento, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {instrumento}
                  </Badge>
                ))}
                {diagnostico.instrumentos.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{diagnostico.instrumentos.length - 2}
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

export default DiagnosticoCard;