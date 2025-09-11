import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, BarChart3, Clock, ChevronDown, ChevronRight, Settings } from 'lucide-react';

interface DiagnosticoCardProps {
  diagnostico: {
    id: string;
    tipo: 'Diagnostico';
    titulo: string;
    objetivo: string;
    resumo: string;
    instrumentos?: string[];
    momentoAplicacao?: string;
  };
}

const DiagnosticoCard: React.FC<DiagnosticoCardProps> = ({ diagnostico }) => {
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
              <BarChart3 className="h-4 w-4" />
              Diagnóstico
            </div>
          </Badge>
          {diagnostico.momentoAplicacao && (
            <div className="flex items-center gap-1 bg-white/70 px-2 py-1 rounded-full">
              <Clock className="h-3 w-3 text-orange-600" />
              <span className="text-xs font-medium text-orange-700">{diagnostico.momentoAplicacao}</span>
            </div>
          )}
        </div>
        <CardTitle className="text-base font-bold text-orange-800 leading-tight">
          {diagnostico.titulo}
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
                {diagnostico.objetivo}
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
              <BarChart3 className="h-4 w-4 text-orange-600" />
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
                {diagnostico.resumo}
              </p>
            </div>
          )}
        </div>

        {/* Campo Instrumentos - Se disponível */}
        {diagnostico.instrumentos && diagnostico.instrumentos.length > 0 && (
          <div className="bg-white/60 rounded-lg p-3 border border-orange-200">
            <button
              onClick={() => toggleField('instrumentos')}
              className="w-full flex items-center justify-between text-left hover:bg-orange-50/50 -m-1 p-1 rounded transition-colors"
            >
              <h4 className="text-sm font-semibold text-orange-700 flex items-center gap-2">
                <Settings className="h-4 w-4 text-orange-600" />
                Instrumentos ({diagnostico.instrumentos.length})
              </h4>
              {expandedFields.instrumentos ? 
                <ChevronDown className="h-4 w-4 text-orange-600" /> : 
                <ChevronRight className="h-4 w-4 text-orange-600" />
              }
            </button>
            {expandedFields.instrumentos && (
              <div className="mt-2 pt-2 border-t border-orange-100">
                <div className="flex flex-wrap gap-2">
                  {diagnostico.instrumentos.map((instrumento, index) => (
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

export default DiagnosticoCard;