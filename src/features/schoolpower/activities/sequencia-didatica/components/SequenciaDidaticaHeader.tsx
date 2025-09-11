import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Users, Clock, Target, ChevronDown, ChevronRight } from 'lucide-react';

interface SequenciaDidaticaHeaderProps {
  sequencia: {
    titulo: string;
    disciplina: string;
    anoSerie: string;
    descricaoGeral: string;
    publicoAlvo?: string;
    competenciasBNCC?: string;
  };
  metadados: {
    totalAulas: number;
    totalDiagnosticos: number;
    totalAvaliacoes: number;
    isGeneratedByAI?: boolean;
    duracao?: string;
  };
}

export const SequenciaDidaticaHeader: React.FC<SequenciaDidaticaHeaderProps> = ({
  sequencia,
  metadados
}) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  return (
    <Card className="mb-8 bg-gradient-to-br from-orange-100 via-amber-50 to-orange-100 dark:from-orange-900/40 dark:via-orange-800/30 dark:to-amber-900/40 border-orange-300 dark:border-orange-600 border-2 shadow-xl rounded-2xl overflow-hidden">
      <CardContent className="p-8">
        {/* Cabeçalho Principal */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 dark:from-orange-400 dark:via-amber-400 dark:to-orange-500 bg-clip-text mb-4 leading-tight">
            {sequencia.titulo}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-orange-700 dark:text-orange-300">
            <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-full shadow-sm border border-orange-200 dark:border-orange-600">
              <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <span className="font-semibold text-orange-800 dark:text-orange-300">{sequencia.disciplina}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-full shadow-sm border border-orange-200 dark:border-orange-600">
              <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <span className="font-semibold text-orange-800 dark:text-orange-300">{sequencia.anoSerie}</span>
            </div>
            {metadados.duracao && (
              <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-full shadow-sm border border-orange-200 dark:border-orange-600">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <span className="font-semibold text-orange-800 dark:text-orange-300">{metadados.duracao}</span>
              </div>
            )}
          </div>
        </div>

        {/* Descrição Geral */}
        <div className="mb-8">
          <div className="bg-white/60 dark:bg-gray-800/50 rounded-xl p-6 border border-orange-200 dark:border-orange-600 shadow-sm">
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="w-full flex items-center justify-between text-left hover:bg-orange-50/50 dark:hover:bg-orange-900/20 -m-2 p-2 rounded-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              <h3 className="font-bold text-orange-700 dark:text-orange-300 flex items-center gap-2 transition-colors duration-200 hover:text-orange-800 dark:hover:text-orange-200">
                <div className="p-1.5 bg-orange-600 dark:bg-orange-500 rounded-lg shadow-sm">
                  <Target className="h-5 w-5 text-white" />
                </div>
                Descrição Geral
              </h3>
              {isDescriptionExpanded ?
                <ChevronDown className="h-5 w-5 text-orange-600 dark:text-orange-400 transition-all duration-200 hover:text-orange-700 dark:hover:text-orange-300" /> :
                <ChevronRight className="h-5 w-5 text-orange-600 dark:text-orange-400 transition-all duration-200 hover:text-orange-700 dark:hover:text-orange-300" />
              }
            </button>

            {isDescriptionExpanded && (
              <div className="mt-4 pt-4 border-t border-orange-100 dark:border-orange-700">
                <p className="text-orange-800 dark:text-orange-200 leading-relaxed bg-white/80 dark:bg-gray-800/80 px-4 py-3 rounded-lg border border-orange-100 dark:border-orange-600">
                  {sequencia.descricaoGeral}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Informações Adicionais em Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Público Alvo */}
          {sequencia.publicoAlvo && (
            <div className="bg-white/60 dark:bg-gray-800/50 rounded-xl p-6 border border-orange-200 dark:border-orange-600 shadow-sm">
              <h3 className="font-bold text-orange-700 dark:text-orange-300 mb-3 text-center flex items-center justify-center gap-2">
                <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Público Alvo
              </h3>
              <p className="text-sm text-orange-800 dark:text-orange-200 bg-white/80 dark:bg-gray-800/80 px-4 py-3 rounded-lg border border-orange-100 dark:border-orange-600 leading-relaxed">
                {sequencia.publicoAlvo}
              </p>
            </div>
          )}

          {/* Competências BNCC */}
          {sequencia.competenciasBNCC && (
            <div className="bg-white/60 dark:bg-gray-800/50 rounded-xl p-6 border border-orange-200 dark:border-orange-600 shadow-sm">
              <h3 className="font-bold text-orange-700 dark:text-orange-300 mb-3 text-center flex items-center justify-center gap-2">
                <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Competências BNCC
              </h3>
              <p className="text-sm text-orange-800 dark:text-orange-200 bg-white/80 dark:bg-gray-800/80 px-4 py-3 rounded-lg border border-orange-100 dark:border-orange-600 leading-relaxed">
                {sequencia.competenciasBNCC}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SequenciaDidaticaHeader;