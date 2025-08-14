
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Target, Search } from 'lucide-react';
import { SequenciaDidaticaAula } from '../SequenciaDidaticaBuilder';

interface DiagnosticoCardProps {
  diagnostico: SequenciaDidaticaAula;
}

export const DiagnosticoCard: React.FC<DiagnosticoCardProps> = ({ diagnostico }) => {
  return (
    <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <BarChart3 className="h-3 w-3 mr-1" />
            Diagnóstico
          </Badge>
          <span className="text-xs text-gray-500">#{diagnostico.ordem}</span>
        </div>
        <CardTitle className="text-sm font-semibold text-green-900 line-clamp-2">
          {diagnostico.titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Target className="h-3 w-3 text-green-600" />
            <span className="text-xs font-medium text-green-700">Objetivo</span>
          </div>
          <p className="text-xs text-gray-600 line-clamp-2">{diagnostico.objetivo}</p>
        </div>
        
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Search className="h-3 w-3 text-green-600" />
            <span className="text-xs font-medium text-green-700">Resumo</span>
          </div>
          <p className="text-xs text-gray-600 line-clamp-3">{diagnostico.resumo}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiagnosticoCard;
