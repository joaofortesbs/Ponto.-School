
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, FileText, BarChart3 } from 'lucide-react';
import { SequenciaDidaticaAula } from '../SequenciaDidaticaBuilder';

interface AulaCardProps {
  aula: SequenciaDidaticaAula;
}

const getIconByType = (tipo: string) => {
  switch (tipo) {
    case 'Aula':
      return <BookOpen className="h-5 w-5 text-blue-600" />;
    case 'Diagnostico':
      return <BarChart3 className="h-5 w-5 text-green-600" />;
    case 'Avaliacao':
      return <FileText className="h-5 w-5 text-purple-600" />;
    default:
      return <BookOpen className="h-5 w-5 text-gray-600" />;
  }
};

const getBadgeColorByType = (tipo: string) => {
  switch (tipo) {
    case 'Aula':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Diagnostico':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'Avaliacao':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export const AulaCard: React.FC<AulaCardProps> = ({ aula }) => {
  return (
    <Card className="h-full hover:shadow-md transition-shadow duration-200 border-l-4 border-l-orange-400">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          {getIconByType(aula.tipo)}
          <Badge 
            variant="outline" 
            className={`text-xs ${getBadgeColorByType(aula.tipo)}`}
          >
            {aula.tipo}
          </Badge>
        </div>
        <CardTitle className="text-base font-semibold leading-tight">
          {aula.titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Objetivo:</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {aula.objetivo}
          </p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Resumo:</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {aula.resumo}
          </p>
        </div>
        
        <div className="pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500 font-medium">
            Ordem: {aula.ordem}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AulaCard;
