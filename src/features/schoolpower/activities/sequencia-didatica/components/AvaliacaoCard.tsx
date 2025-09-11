import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, FileText, Award, ChevronDown, ChevronRight, CheckCircle, Calendar } from 'lucide-react';

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
    <Card className="border-purple-300 bg-gradient-to-br from-purple-50 to-violet-100 h-full hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-2 rounded-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-3">
          <Badge className="bg-purple-600 text-white border-purple-700 px-3 py-1 font-medium shadow-sm transition-all duration-200 hover:bg-purple-700">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Avaliação
            </div>
          </Badge>
          {avaliacao.valorPontuacao && (
            <div className="flex items-center gap-1 bg-white/70 px-2 py-1 rounded-full transition-all duration-200 hover:bg-white/90">
              <Award className="h-3 w-3 text-purple-600" />
              <span className="text-xs font-medium text-purple-700">{avaliacao.valorPontuacao}</span>
            </div>
          )}
        </div>
        <CardTitle className="text-base font-bold text-purple-800 leading-tight">
          {avaliacao.titulo}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Campo Objetivo - Clicável */}
        <div className="bg-white/60 rounded-xl p-3 border border-purple-200 transition-all duration-200 hover:bg-white/80 hover:border-purple-300">
          <button
            onClick={() => toggleField('objetivo')}
            className="w-full flex items-center justify-between text-left hover:bg-purple-50/50 -m-1 p-1 rounded-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            <h4 className="text-sm font-semibold text-purple-700 flex items-center gap-2 transition-colors duration-200 hover:text-purple-800">
              <Target className="h-4 w-4 text-purple-600 transition-colors duration-200 hover:text-purple-700" />
              Objetivo
            </h4>
            {expandedFields.objetivo ? 
              <ChevronDown className="h-4 w-4 text-purple-600 transition-all duration-200 hover:text-purple-700" /> : 
              <ChevronRight className="h-4 w-4 text-purple-600 transition-all duration-200 hover:text-purple-700" />
            }
          </button>
          {expandedFields.objetivo && (
            <div className="mt-2 pt-2 border-t border-purple-100">
              <p className="text-sm text-purple-800 leading-relaxed">
                {avaliacao.objetivo}
              </p>
            </div>
          )}
        </div>

        {/* Campo Resumo - Clicável */}
        <div className="bg-white/60 rounded-xl p-3 border border-purple-200 transition-all duration-200 hover:bg-white/80 hover:border-purple-300">
          <button
            onClick={() => toggleField('resumo')}
            className="w-full flex items-center justify-between text-left hover:bg-purple-50/50 -m-1 p-1 rounded-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            <h4 className="text-sm font-semibold text-purple-700 flex items-center gap-2 transition-colors duration-200 hover:text-purple-800">
              <FileText className="h-4 w-4 text-purple-600 transition-colors duration-200 hover:text-purple-700" />
              Resumo
            </h4>
            {expandedFields.resumo ? 
              <ChevronDown className="h-4 w-4 text-purple-600 transition-all duration-200 hover:text-purple-700" /> : 
              <ChevronRight className="h-4 w-4 text-purple-600 transition-all duration-200 hover:text-purple-700" />
            }
          </button>
          {expandedFields.resumo && (
            <div className="mt-2 pt-2 border-t border-purple-100">
              <p className="text-sm text-purple-800 leading-relaxed">
                {avaliacao.resumo}
              </p>
            </div>
          )}
        </div>

        {/* Campo Critérios de Avaliação - Se disponível */}
        {avaliacao.criteriosAvaliacao && avaliacao.criteriosAvaliacao.length > 0 && (
          <div className="bg-white/60 rounded-xl p-3 border border-purple-200 transition-all duration-200 hover:bg-white/80 hover:border-purple-300">
            <button
              onClick={() => toggleField('criterios')}
              className="w-full flex items-center justify-between text-left hover:bg-purple-50/50 -m-1 p-1 rounded-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              <h4 className="text-sm font-semibold text-purple-700 flex items-center gap-2 transition-colors duration-200 hover:text-purple-800">
                <CheckCircle className="h-4 w-4 text-purple-600 transition-colors duration-200 hover:text-purple-700" />
                Critérios ({avaliacao.criteriosAvaliacao.length})
              </h4>
              {expandedFields.criterios ? 
                <ChevronDown className="h-4 w-4 text-purple-600 transition-all duration-200 hover:text-purple-700" /> : 
                <ChevronRight className="h-4 w-4 text-purple-600 transition-all duration-200 hover:text-purple-700" />
              }
            </button>
            {expandedFields.criterios && (
              <div className="mt-2 pt-2 border-t border-purple-100">
                <div className="flex flex-wrap gap-2">
                  {avaliacao.criteriosAvaliacao.map((criterio, index) => (
                    <Badge key={index} className="bg-purple-100 text-purple-800 border-purple-300 text-xs transition-all duration-200 hover:bg-purple-200 hover:scale-105">
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
          <div className="bg-white/60 rounded-xl p-3 border border-purple-200 transition-all duration-200 hover:bg-white/80 hover:border-purple-300">
            <button
              onClick={() => toggleField('instrumentos')}
              className="w-full flex items-center justify-between text-left hover:bg-purple-50/50 -m-1 p-1 rounded-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              <h4 className="text-sm font-semibold text-purple-700 flex items-center gap-2 transition-colors duration-200 hover:text-purple-800">
                <Calendar className="h-4 w-4 text-purple-600 transition-colors duration-200 hover:text-purple-700" />
                Instrumentos ({avaliacao.instrumentos.length})
              </h4>
              {expandedFields.instrumentos ? 
                <ChevronDown className="h-4 w-4 text-purple-600 transition-all duration-200 hover:text-purple-700" /> : 
                <ChevronRight className="h-4 w-4 text-purple-600 transition-all duration-200 hover:text-purple-700" />
              }
            </button>
            {expandedFields.instrumentos && (
              <div className="mt-2 pt-2 border-t border-purple-100">
                <div className="flex flex-wrap gap-2">
                  {avaliacao.instrumentos.map((instrumento, index) => (
                    <Badge key={index} className="bg-purple-100 text-purple-800 border-purple-300 text-xs transition-all duration-200 hover:bg-purple-200 hover:scale-105">
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