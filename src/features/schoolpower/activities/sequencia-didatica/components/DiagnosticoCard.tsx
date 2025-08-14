
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';
import { SequenciaDidaticaAula } from '../SequenciaDidaticaBuilder';

interface DiagnosticoCardProps {
  diagnostico: SequenciaDidaticaAula;
}

export const DiagnosticoCard: React.FC<DiagnosticoCardProps> = ({ diagnostico }) => {
  return (
    <Card className="h-full hover:shadow-md transition-shadow duration-200 border-l-4 border-l-green-400">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <BarChart3 className="h-5 w-5 text-green-600" />
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 text-xs">
            Diagnóstico
          </Badge>
        </div>
        <CardTitle className="text-base font-semibold leading-tight">
          {diagnostico.titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div>
          <h4 className="text-sm font-medium text-green-700 mb-1">Objetivo:</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {diagnostico.objetivo}
          </p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-green-700 mb-1">Resumo:</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {diagnostico.resumo}
          </p>
        </div>
        
        <div className="pt-2 border-t border-green-100">
          <span className="text-xs text-green-600 font-medium">
            Ordem: {diagnostico.ordem}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiagnosticoCard;
