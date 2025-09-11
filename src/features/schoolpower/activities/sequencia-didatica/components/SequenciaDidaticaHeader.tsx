import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Target, ChevronDown, ChevronRight } from 'lucide-react';

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
    <Card className="border-orange-300 bg-gradient-to-r from-orange-50 via-orange-100 to-amber-50 border-2 shadow-lg">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Título Principal */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-500 rounded-full shadow-lg">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-orange-800">
                {sequencia.titulo}
              </h1>
            </div>
            
            {/* Descrição Clicável */}
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="w-full flex items-center justify-center gap-2 text-orange-700 hover:text-orange-800 transition-colors"
              >
                <span className="text-lg font-medium">Ver Descrição</span>
                {isDescriptionExpanded ? 
                  <ChevronDown className="h-5 w-5" /> : 
                  <ChevronRight className="h-5 w-5" />
                }
              </button>
              
              {isDescriptionExpanded && (
                <div className="mt-4 p-4 bg-white/70 rounded-xl border border-orange-200">
                  <p className="text-orange-800 text-lg leading-relaxed">
                    {sequencia.descricaoGeral}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Competências BNCC */}
          {sequencia.competenciasBNCC && (
            <div className="bg-white/60 rounded-xl p-6 border border-orange-200 shadow-sm">
              <h3 className="font-bold text-orange-700 mb-3 text-center flex items-center justify-center gap-2">
                <Target className="h-5 w-5" />
                Competências BNCC
              </h3>
              <p className="text-sm text-orange-800 bg-white/80 px-4 py-3 rounded-lg border border-orange-100 leading-relaxed">
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