import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, FileText, Award, ChevronDown, ChevronRight, Calendar, CheckCircle } from 'lucide-react';

interface AvaliacaoCardProps {
  avaliacao: {
    id: string;
    tipo: 'Avaliacao';
    titulo: string;
    objetivo: string;
    resumo: string;
    criteriosAvaliacao?: string[];
    instrumentos?: string[];
    valorPontuacao?: string;
  };
}

const AvaliacaoCard: React.FC<AvaliacaoCardProps> = ({ avaliacao }) => {
  const [expandedFields, setExpandedFields] = useState<{ [key: string]: boolean }>({});

  const toggleField = (fieldName: string) => {
    setExpandedFields(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  return (
    <Card className="border-orange-300 bg-gradient-to-br from-orange-50 to-red-100 h-full hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-3">
          <Badge className="bg-orange-600 text-white border-orange-700 px-3 py-1 font-medium shadow-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Avaliação
            </div>
          </Badge>
          {avaliacao.valorPontuacao && (
            <div className="flex items-center gap-1 bg-white/70 px-2 py-1 rounded-full">
              <Award className="h-3 w-3 text-orange-600" />
              <span className="text-xs font-medium text-orange-700">{avaliacao.valorPontuacao}</span>
            </div>
          )}
        </div>
        <CardTitle className="text-base font-bold text-orange-800 leading-tight">
          {avaliacao.titulo}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Campo Objetivo - Clicável */}
        <div className="bg-white/60 rounded-lg p-3 border border-orange-200">
          <button
            onClick={() => toggleField('objetivo')}
            className="w-full flex items-center justify-between text-left hover:bg-orange-50/50 -m-1 p-1 rounded transition-colors"
          >
            <h4 className="text-sm font-semibold text-orange-700 flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-600" />
              Objetivo
            </h4>
            {expandedFields.objetivo ? 
              <ChevronDown className="h-4 w-4 text-orange-600" /> : 
              <ChevronRight className="h-4 w-4 text-orange-600" />
            }
          </button>
          {expandedFields.objetivo && (
            <div className="mt-2 pt-2 border-t border-orange-100">
              <p className="text-sm text-orange-800 leading-relaxed">
                {avaliacao.objetivo}
              </p>
            </div>
          )}
        </div>

        {/* Campo Resumo - Clicável */}
        <div className="bg-white/60 rounded-lg p-3 border border-orange-200">
          <button
            onClick={() => toggleField('resumo')}
            className="w-full flex items-center justify-between text-left hover:bg-orange-50/50 -m-1 p-1 rounded transition-colors"
          >
            <h4 className="text-sm font-semibold text-orange-700 flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-600" />
              Resumo
            </h4>
            {expandedFields.resumo ? 
              <ChevronDown className="h-4 w-4 text-orange-600" /> : 
              <ChevronRight className="h-4 w-4 text-orange-600" />
            }
          </button>
          {expandedFields.resumo && (
            <div className="mt-2 pt-2 border-t border-orange-100">
              <p className="text-sm text-orange-800 leading-relaxed">
                {avaliacao.resumo}
              </p>
            </div>
          )}
        </div>

        {/* Campo Critérios de Avaliação - Clicável */}
        {avaliacao.criteriosAvaliacao && avaliacao.criteriosAvaliacao.length > 0 && (
          <div className="bg-white/60 rounded-lg p-3 border border-orange-200">
            <button
              onClick={() => toggleField('criterios')}
              className="w-full flex items-center justify-between text-left hover:bg-orange-50/50 -m-1 p-1 rounded transition-colors"
            >
              <h4 className="text-sm font-semibold text-orange-700 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-orange-600" />
                Critérios ({avaliacao.criteriosAvaliacao.length})
              </h4>
              {expandedFields.criterios ? 
                <ChevronDown className="h-4 w-4 text-orange-600" /> : 
                <ChevronRight className="h-4 w-4 text-orange-600" />
              }
            </button>
            {expandedFields.criterios && (
              <div className="mt-2 pt-2 border-t border-orange-100">
                <div className="flex flex-wrap gap-2">
                  {avaliacao.criteriosAvaliacao.map((criterio, index) => (
                    <Badge key={index} className="bg-orange-100 text-orange-800 border-orange-300 text-xs">
                      {criterio}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Campo Instrumentos - Se disponível */}
        {avaliacao.instrumentos && avaliacao.instrumentos.length > 0 && (
          <div className="bg-white/60 rounded-lg p-3 border border-orange-200">
            <button
              onClick={() => toggleField('instrumentos')}
              className="w-full flex items-center justify-between text-left hover:bg-orange-50/50 -m-1 p-1 rounded transition-colors"
            >
              <h4 className="text-sm font-semibold text-orange-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                Instrumentos ({avaliacao.instrumentos.length})
              </h4>
              {expandedFields.instrumentos ? 
                <ChevronDown className="h-4 w-4 text-orange-600" /> : 
                <ChevronRight className="h-4 w-4 text-orange-600" />
              }
            </button>
            {expandedFields.instrumentos && (
              <div className="mt-2 pt-2 border-t border-orange-100">
                <div className="flex flex-wrap gap-2">
                  {avaliacao.instrumentos.map((instrumento, index) => (
                    <Badge key={index} className="bg-orange-100 text-orange-800 border-orange-300 text-xs">
                      {instrumento}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvaliacaoCard;