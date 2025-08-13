
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';

interface CriterioCorrecao {
  faixa: string;
  resultado: string;
  cor: string;
}

interface DiagnosticoCardProps {
  diagIndex: number;
  titulo: string;
  objetivoAvaliativo: string;
  tipoAvaliacao: string;
  quantidadeQuestoes: number;
  formato: string;
  criteriosCorrecao: CriterioCorrecao[];
  duracao?: string;
}

export const DiagnosticoCard: React.FC<DiagnosticoCardProps> = ({
  diagIndex,
  titulo,
  objetivoAvaliativo,
  tipoAvaliacao,
  quantidadeQuestoes,
  formato,
  criteriosCorrecao,
  duracao = "20 min"
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500 min-w-[320px] flex-shrink-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <BarChart3 size={12} className="mr-1" />
            Diagnóstico {diagIndex}
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
          <Badge variant="outline" className="bg-blue-50 text-blue-700">{tipoAvaliacao}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-1">Questões</h4>
            <p className="text-lg font-bold text-green-600">{quantidadeQuestoes} questões</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-1">Formato</h4>
            <p className="text-sm text-gray-600">{formato}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-1">Critérios de Correção</h4>
          <div className="space-y-1 text-xs">
            {criteriosCorrecao.map((criterio, index) => (
              <div key={index} className="flex justify-between">
                <span>{criterio.faixa}</span>
                <span className={`font-medium ${criterio.cor}`}>{criterio.resultado}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiagnosticoCard;
