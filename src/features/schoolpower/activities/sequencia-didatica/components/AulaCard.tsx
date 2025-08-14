import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, BookOpen } from 'lucide-react';
import { SequenciaDidaticaAula } from '../SequenciaDidaticaBuilder';

interface AulaCardProps {
  aula: SequenciaDidaticaAula;
}

export const AulaCard: React.FC<AulaCardProps> = ({ aula }) => {
  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <BookOpen className="h-3 w-3 mr-1" />
            Aula
          </Badge>
          <span className="text-xs text-gray-500">#{aula.ordem}</span>
        </div>
        <CardTitle className="text-sm font-semibold text-blue-900 line-clamp-2">
          {aula.titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Target className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Objetivo</span>
          </div>
          <p className="text-xs text-gray-600 line-clamp-2">{aula.objetivo}</p>
        </div>

        <div>
          <div className="flex items-center gap-1 mb-1">
            <Clock className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Resumo</span>
          </div>
          <p className="text-xs text-gray-600 line-clamp-3">{aula.resumo}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AulaCard;