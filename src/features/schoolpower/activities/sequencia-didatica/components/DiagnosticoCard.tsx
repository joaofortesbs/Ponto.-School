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
    <Card className="border-green-300 bg-gradient-to-br from-green-50 to-emerald-100 h-full hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-2 rounded-xl dark:border-green-600 dark:from-green-900/30 dark:to-green-800/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-3">
          <Badge className="bg-green-600 text-white border-green-700 px-3 py-1 font-medium shadow-sm transition-all duration-200 hover:bg-green-700 dark:bg-green-500 dark:border-green-600">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Diagnóstico
            </div>
          </Badge>
          {diagnostico.momentoAplicacao && (
            <div className="flex items-center gap-1 bg-white/70 px-2 py-1 rounded-full transition-all duration-200 hover:bg-white/90 dark:bg-gray-800/70 dark:hover:bg-gray-700/90">
              <Clock className="h-3 w-3 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-green-700 dark:text-green-300">{diagnostico.momentoAplicacao}</span>
            </div>
          )}
        </div>
        <CardTitle className="text-base font-bold text-green-800 dark:text-green-200 leading-tight">
          {diagnostico.titulo}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Campo Objetivo - Clicável */}
        <div className="bg-white/60 rounded-xl p-3 border border-green-200 transition-all duration-200 hover:bg-white/80 hover:border-green-300 dark:bg-gray-800/50 dark:border-green-700 dark:hover:bg-gray-700/70 dark:hover:border-green-600">
          <button
            onClick={() => toggleField('objetivo')}
            className="w-full flex items-center justify-between text-left hover:bg-green-50/50 dark:hover:bg-green-900/20 -m-1 p-1 rounded-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-2 transition-colors duration-200 hover:text-green-800 dark:hover:text-green-200">
              <Target className="h-4 w-4 text-green-600 dark:text-green-400 transition-colors duration-200 hover:text-green-700 dark:hover:text-green-300" />
              Objetivo
            </h4>
            {expandedFields.objetivo ? 
              <ChevronDown className="h-4 w-4 text-green-600 dark:text-green-400 transition-all duration-200 hover:text-green-700 dark:hover:text-green-300" /> : 
              <ChevronRight className="h-4 w-4 text-green-600 dark:text-green-400 transition-all duration-200 hover:text-green-700 dark:hover:text-green-300" />
            }
          </button>
          {expandedFields.objetivo && (
            <div className="mt-2 pt-2 border-t border-green-100 dark:border-green-700">
              <p className="text-sm text-green-800 dark:text-green-300 leading-relaxed">
                {diagnostico.objetivo}
              </p>
            </div>
          )}
        </div>

        {/* Campo Resumo - Clicável */}
        <div className="bg-white/60 rounded-xl p-3 border border-green-200 transition-all duration-200 hover:bg-white/80 hover:border-green-300 dark:bg-gray-800/50 dark:border-green-700 dark:hover:bg-gray-700/70 dark:hover:border-green-600">
          <button
            onClick={() => toggleField('resumo')}
            className="w-full flex items-center justify-between text-left hover:bg-green-50/50 dark:hover:bg-green-900/20 -m-1 p-1 rounded-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-2 transition-colors duration-200 hover:text-green-800 dark:hover:text-green-200">
              <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400 transition-colors duration-200 hover:text-green-700 dark:hover:text-green-300" />
              Resumo
            </h4>
            {expandedFields.resumo ? 
              <ChevronDown className="h-4 w-4 text-green-600 dark:text-green-400 transition-all duration-200 hover:text-green-700 dark:hover:text-green-300" /> : 
              <ChevronRight className="h-4 w-4 text-green-600 dark:text-green-400 transition-all duration-200 hover:text-green-700 dark:hover:text-green-300" />
            }
          </button>
          {expandedFields.resumo && (
            <div className="mt-2 pt-2 border-t border-green-100 dark:border-green-700">
              <p className="text-sm text-green-800 dark:text-green-300 leading-relaxed">
                {diagnostico.resumo}
              </p>
            </div>
          )}
        </div>

        {/* Campo Instrumentos - Se disponível */}
        {diagnostico.instrumentos && diagnostico.instrumentos.length > 0 && (
          <div className="bg-white/60 rounded-xl p-3 border border-green-200 transition-all duration-200 hover:bg-white/80 hover:border-green-300 dark:bg-gray-800/50 dark:border-green-700 dark:hover:bg-gray-700/70 dark:hover:border-green-600">
            <button
              onClick={() => toggleField('instrumentos')}
              className="w-full flex items-center justify-between text-left hover:bg-green-50/50 dark:hover:bg-green-900/20 -m-1 p-1 rounded-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-2 transition-colors duration-200 hover:text-green-800 dark:hover:text-green-200">
                <Settings className="h-4 w-4 text-green-600 dark:text-green-400 transition-colors duration-200 hover:text-green-700 dark:hover:text-green-300" />
                Instrumentos ({diagnostico.instrumentos.length})
              </h4>
              {expandedFields.instrumentos ? 
                <ChevronDown className="h-4 w-4 text-green-600 dark:text-green-400 transition-all duration-200 hover:text-green-700 dark:hover:text-green-300" /> : 
                <ChevronRight className="h-4 w-4 text-green-600 dark:text-green-400 transition-all duration-200 hover:text-green-700 dark:hover:text-green-300" />
              }
            </button>
            {expandedFields.instrumentos && (
              <div className="mt-2 pt-2 border-t border-green-100 dark:border-green-700">
                <div className="flex flex-wrap gap-2">
                  {diagnostico.instrumentos.map((instrumento, index) => (
                    <Badge key={index} className="bg-green-100 text-green-800 border-green-300 text-xs transition-all duration-200 hover:bg-green-200 hover:scale-105 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700">
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