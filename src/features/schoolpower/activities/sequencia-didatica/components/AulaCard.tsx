import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, BookOpen, ChevronDown, ChevronRight, Users, Settings } from 'lucide-react';

interface AulaCardProps {
  aula: {
    id: string;
    tipo: 'Aula' | 'Diagnostico' | 'Avaliacao';
    titulo: string;
    objetivo: string;
    resumo: string;
    duracaoEstimada?: string;
    metodologia?: string;
    instrumentos?: string[];
    criteriosAvaliacao?: string[];
  };
}

const AulaCard: React.FC<AulaCardProps> = ({ aula }) => {
  const [expandedFields, setExpandedFields] = useState<{ [key: string]: boolean }>({});

  const toggleField = (fieldName: string) => {
    setExpandedFields(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  return (
    <Card className="border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 h-full hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-2 rounded-xl dark:from-orange-900/30 dark:to-orange-800/30 dark:border-orange-600">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-3">
          <Badge className="bg-orange-600 text-white border-orange-700 px-3 py-1 font-medium shadow-sm transition-all duration-200 hover:bg-orange-700 dark:bg-orange-500 dark:border-orange-400 dark:hover:bg-orange-400">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Aula
            </div>
          </Badge>
          {aula.duracaoEstimada && (
            <div className="flex items-center gap-1 bg-white/70 px-2 py-1 rounded-full transition-all duration-200 hover:bg-white/90 dark:bg-orange-800/70 dark:hover:bg-orange-800/90">
              <Clock className="h-3 w-3 text-orange-600 dark:text-orange-400" />
              <span className="text-xs font-medium text-orange-700 dark:text-orange-300">{aula.duracaoEstimada}</span>
            </div>
          )}
        </div>
        <CardTitle className="text-base font-bold text-orange-800 leading-tight dark:text-orange-200">
          {aula.titulo}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Campo Objetivo - Clicável */}
        <div className="bg-white/60 rounded-xl p-3 border border-orange-200 transition-all duration-200 hover:bg-white/80 hover:border-orange-300 dark:bg-orange-800/50 dark:border-orange-600 dark:hover:bg-orange-800/70 dark:hover:border-orange-500">
          <button
            onClick={() => toggleField('objetivo')}
            className="w-full flex items-center justify-between text-left hover:bg-orange-50/50 -m-1 p-1 rounded-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] dark:hover:bg-orange-900/40"
          >
            <h4 className="text-sm font-semibold text-orange-700 flex items-center gap-2 transition-colors duration-200 hover:text-orange-800 dark:text-orange-300 dark:hover:text-orange-200">
              <Target className="h-4 w-4 text-orange-600 transition-colors duration-200 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300" />
              Objetivo
            </h4>
            {expandedFields.objetivo ? 
              <ChevronDown className="h-4 w-4 text-orange-600 transition-all duration-200 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300" /> : 
              <ChevronRight className="h-4 w-4 text-orange-600 transition-all duration-200 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300" />
            }
          </button>
          {expandedFields.objetivo && (
            <div className="mt-2 pt-2 border-t border-orange-100 dark:border-orange-700">
              <p className="text-sm text-orange-800 leading-relaxed dark:text-orange-300">
                {aula.objetivo}
              </p>
            </div>
          )}
        </div>

        {/* Campo Resumo - Clicável */}
        <div className="bg-white/60 rounded-xl p-3 border border-orange-200 transition-all duration-200 hover:bg-white/80 hover:border-orange-300 dark:bg-orange-800/50 dark:border-orange-600 dark:hover:bg-orange-800/70 dark:hover:border-orange-500">
          <button
            onClick={() => toggleField('resumo')}
            className="w-full flex items-center justify-between text-left hover:bg-orange-50/50 -m-1 p-1 rounded-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] dark:hover:bg-orange-900/40"
          >
            <h4 className="text-sm font-semibold text-orange-700 flex items-center gap-2 transition-colors duration-200 hover:text-orange-800 dark:text-orange-300 dark:hover:text-orange-200">
              <BookOpen className="h-4 w-4 text-orange-600 transition-colors duration-200 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300" />
              Resumo
            </h4>
            {expandedFields.resumo ? 
              <ChevronDown className="h-4 w-4 text-orange-600 transition-all duration-200 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300" /> : 
              <ChevronRight className="h-4 w-4 text-orange-600 transition-all duration-200 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300" />
            }
          </button>
          {expandedFields.resumo && (
            <div className="mt-2 pt-2 border-t border-orange-100 dark:border-orange-700">
              <p className="text-sm text-orange-800 leading-relaxed dark:text-orange-300">
                {aula.resumo}
              </p>
            </div>
          )}
        </div>

        {/* Campo Metodologia - Se disponível */}
        {aula.metodologia && (
          <div className="bg-white/60 rounded-xl p-3 border border-orange-200 transition-all duration-200 hover:bg-white/80 hover:border-orange-300 dark:bg-orange-800/50 dark:border-orange-600 dark:hover:bg-orange-800/70 dark:hover:border-orange-500">
            <button
              onClick={() => toggleField('metodologia')}
              className="w-full flex items-center justify-between text-left hover:bg-orange-50/50 -m-1 p-1 rounded-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] dark:hover:bg-orange-900/40"
            >
              <h4 className="text-sm font-semibold text-orange-700 flex items-center gap-2 transition-colors duration-200 hover:text-orange-800 dark:text-orange-300 dark:hover:text-orange-200">
                <Users className="h-4 w-4 text-orange-600 transition-colors duration-200 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300" />
                Metodologia
              </h4>
              {expandedFields.metodologia ? 
                <ChevronDown className="h-4 w-4 text-orange-600 transition-all duration-200 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300" /> : 
                <ChevronRight className="h-4 w-4 text-orange-600 transition-all duration-200 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300" />
              }
            </button>
            {expandedFields.metodologia && (
              <div className="mt-2 pt-2 border-t border-orange-100 dark:border-orange-700">
                <p className="text-sm text-orange-800 leading-relaxed dark:text-orange-300">
                  {aula.metodologia}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Campo Instrumentos - Se disponível */}
        {aula.instrumentos && aula.instrumentos.length > 0 && (
          <div className="bg-white/60 rounded-xl p-3 border border-orange-200 transition-all duration-200 hover:bg-white/80 hover:border-orange-300 dark:bg-orange-800/50 dark:border-orange-600 dark:hover:bg-orange-800/70 dark:hover:border-orange-500">
            <button
              onClick={() => toggleField('instrumentos')}
              className="w-full flex items-center justify-between text-left hover:bg-orange-50/50 -m-1 p-1 rounded-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] dark:hover:bg-orange-900/40"
            >
              <h4 className="text-sm font-semibold text-orange-700 flex items-center gap-2 transition-colors duration-200 hover:text-orange-800 dark:text-orange-300 dark:hover:text-orange-200">
                <Settings className="h-4 w-4 text-orange-600 transition-colors duration-200 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300" />
                Instrumentos ({aula.instrumentos.length})
              </h4>
              {expandedFields.instrumentos ? 
                <ChevronDown className="h-4 w-4 text-orange-600 transition-all duration-200 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300" /> : 
                <ChevronRight className="h-4 w-4 text-orange-600 transition-all duration-200 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300" />
              }
            </button>
            {expandedFields.instrumentos && (
              <div className="mt-2 pt-2 border-t border-orange-100 dark:border-orange-700">
                <div className="flex flex-wrap gap-2">
                  {aula.instrumentos.map((instrumento, index) => (
                    <Badge key={index} className="bg-orange-100 text-orange-800 border-orange-300 text-xs transition-all duration-200 hover:bg-orange-200 hover:scale-105 dark:bg-orange-900/50 dark:text-orange-400 dark:border-orange-700 dark:hover:bg-orange-900/70 dark:hover:scale-105">
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

export default AulaCard;