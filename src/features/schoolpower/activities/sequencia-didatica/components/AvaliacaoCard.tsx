
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Target, CheckCircle } from 'lucide-react';
import { SequenciaDidaticaAula } from '../SequenciaDidaticaBuilder';

interface AvaliacaoCardProps {
  avaliacao: SequenciaDidaticaAula;
}

export const AvaliacaoCard: React.FC<AvaliacaoCardProps> = ({ avaliacao }) => {
  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            <FileText className="h-3 w-3 mr-1" />
            Avaliação
          </Badge>
          <span className="text-xs text-gray-500">#{avaliacao.ordem}</span>
        </div>
        <CardTitle className="text-sm font-semibold text-purple-900 line-clamp-2">
          {avaliacao.titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Target className="h-3 w-3 text-purple-600" />
            <span className="text-xs font-medium text-purple-700">Objetivo</span>
          </div>
          <p className="text-xs text-gray-600 line-clamp-2">{avaliacao.objetivo}</p>
        </div>
        
        <div>
          <div className="flex items-center gap-1 mb-1">
            <CheckCircle className="h-3 w-3 text-purple-600" />
            <span className="text-xs font-medium text-purple-700">Resumo</span>
          </div>
          <p className="text-xs text-gray-600 line-clamp-3">{avaliacao.resumo}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvaliacaoCard;
