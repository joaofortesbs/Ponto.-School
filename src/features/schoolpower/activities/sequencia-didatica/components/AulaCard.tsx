
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

interface EtapaAula {
  tipo: string;
  tempo: string;
  descricao: string;
  cor: string;
}

interface AulaCardProps {
  aulaIndex: number;
  titulo: string;
  objetivoEspecifico: string;
  resumo: string;
  etapas: EtapaAula[];
  recursos: string[];
  atividadePratica: string;
  duracao?: string;
}

export const AulaCard: React.FC<AulaCardProps> = ({
  aulaIndex,
  titulo,
  objetivoEspecifico,
  resumo,
  etapas,
  recursos,
  atividadePratica,
  duracao = "50 min"
}) => {
  const getEtapaColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'introdução':
      case 'introducao':
        return { bg: 'bg-green-500', text: 'text-green-700' };
      case 'desenvolvimento':
        return { bg: 'bg-orange-500', text: 'text-orange-700' };
      case 'fechamento':
        return { bg: 'bg-purple-500', text: 'text-purple-700' };
      default:
        return { bg: 'bg-blue-500', text: 'text-blue-700' };
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500 min-w-[320px] flex-shrink-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Calendar size={12} className="mr-1" />
            Aula {aulaIndex}
          </Badge>
          <span className="text-sm text-gray-500">{duracao}</span>
        </div>
        <CardTitle className="text-lg">{titulo}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-1">Objetivo Específico</h4>
          <p className="text-sm text-gray-600">{objetivoEspecifico}</p>
        </div>
        
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-1">Resumo</h4>
          <p className="text-sm text-gray-600">{resumo}</p>
        </div>

        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-2">Etapas da Aula</h4>
          <div className="space-y-2">
            {etapas.map((etapa, index) => {
              const cores = getEtapaColor(etapa.tipo);
              return (
                <div key={index} className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full ${cores.bg} mt-1.5 flex-shrink-0`}></div>
                  <div>
                    <span className={`text-xs font-medium ${cores.text}`}>
                      {etapa.tipo} ({etapa.tempo})
                    </span>
                    <p className="text-xs text-gray-600">{etapa.descricao}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-1">Recursos Necessários</h4>
          <div className="flex flex-wrap gap-1">
            {recursos.map((recurso, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {recurso}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-1">Atividade Prática</h4>
          <p className="text-xs text-gray-600">{atividadePratica}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AulaCard;
