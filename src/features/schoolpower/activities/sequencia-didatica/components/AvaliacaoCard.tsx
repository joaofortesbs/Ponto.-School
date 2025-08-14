
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { SequenciaDidaticaAula } from '../SequenciaDidaticaBuilder';

interface AvaliacaoCardProps {
  avaliacao: SequenciaDidaticaAula;
}

export const AvaliacaoCard: React.FC<AvaliacaoCardProps> = ({ avaliacao }) => {
  return (
    <Card className="h-full hover:shadow-md transition-shadow duration-200 border-l-4 border-l-purple-400">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <FileText className="h-5 w-5 text-purple-600" />
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 text-xs">
            Avaliação
          </Badge>
        </div>
        <CardTitle className="text-base font-semibold leading-tight">
          {avaliacao.titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div>
          <h4 className="text-sm font-medium text-purple-700 mb-1">Objetivo:</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {avaliacao.objetivo}
          </p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-purple-700 mb-1">Resumo:</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {avaliacao.resumo}
          </p>
        </div>
        
        <div className="pt-2 border-t border-purple-100">
          <span className="text-xs text-purple-600 font-medium">
            Ordem: {avaliacao.ordem}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvaliacaoCard;
