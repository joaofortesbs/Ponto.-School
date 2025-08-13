
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckSquare } from 'lucide-react';

interface ComposicaoAvaliacao {
  tipo: string;
  quantidade: number;
  pontos: string;
}

interface AvaliacaoCardProps {
  avalIndex: number;
  titulo: string;
  objetivoAvaliativo: string;
  tipoAvaliacao: string;
  quantidadeQuestoes: number;
  valorTotal: string;
  composicao: ComposicaoAvaliacao[];
  gabarito: string;
  duracao?: string;
}

export const AvaliacaoCard: React.FC<AvaliacaoCardProps> = ({
  avalIndex,
  titulo,
  objetivoAvaliativo,
  tipoAvaliacao,
  quantidadeQuestoes,
  valorTotal,
  composicao,
  gabarito,
  duracao = "45 min"
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500 min-w-[320px] flex-shrink-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            <CheckSquare size={12} className="mr-1" />
            Avaliação {avalIndex}
          </Badge>
          <span className="text-sm text-gray-500">{duracao}</span>
        </div>
        <CardTitle className="text-lg">{titulo}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-1">Objetivo Avaliativo</h4>
          <p className="text-sm text-gray-600">{objetivoAvaliativo}</p>
        </div>

        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-1">Tipo de Avaliação</h4>
          <Badge variant="outline" className="bg-red-50 text-red-700">{tipoAvaliacao}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-1">Questões</h4>
            <p className="text-lg font-bold text-purple-600">{quantidadeQuestoes} questões</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-1">Valor Total</h4>
            <p className="text-sm text-gray-600">{valorTotal}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-1">Composição</h4>
          <div className="space-y-1 text-xs">
            {composicao.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span>{item.quantidade} {item.tipo}</span>
                <span className="font-medium">{item.pontos}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-1">Gabarito</h4>
          <p className="text-xs text-gray-600">{gabarito}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvaliacaoCard;
