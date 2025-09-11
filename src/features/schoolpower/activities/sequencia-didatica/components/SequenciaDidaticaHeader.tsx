import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, GraduationCap, Calendar, Users, Target } from 'lucide-react';

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
  return (
    <Card className="border-orange-300 bg-gradient-to-r from-orange-50 via-orange-100 to-amber-50 border-2 shadow-lg">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Título Principal */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-500 rounded-full">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-orange-800">
                {sequencia.titulo}
              </h1>
            </div>
            <p className="text-orange-700 max-w-3xl mx-auto text-lg leading-relaxed">
              {sequencia.descricaoGeral}
            </p>
          </div>

          {/* Informações Principais */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-3 bg-white/80 px-4 py-3 rounded-xl shadow-md border border-orange-200 hover:shadow-lg transition-shadow">
              <BookOpen className="h-6 w-6 text-orange-600" />
              <div>
                <span className="text-xs text-orange-600 font-medium">Disciplina</span>
                <p className="font-bold text-orange-800">{sequencia.disciplina}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/80 px-4 py-3 rounded-xl shadow-md border border-orange-200 hover:shadow-lg transition-shadow">
              <GraduationCap className="h-6 w-6 text-orange-600" />
              <div>
                <span className="text-xs text-orange-600 font-medium">Ano/Série</span>
                <p className="font-bold text-orange-800">{sequencia.anoSerie}</p>
              </div>
            </div>

            {metadados.duracao && (
              <div className="flex items-center gap-3 bg-white/80 px-4 py-3 rounded-xl shadow-md border border-orange-200 hover:shadow-lg transition-shadow">
                <Calendar className="h-6 w-6 text-orange-600" />
                <div>
                  <span className="text-xs text-orange-600 font-medium">Duração</span>
                  <p className="font-bold text-orange-800">{metadados.duracao}</p>
                </div>
              </div>
            )}

            {sequencia.publicoAlvo && (
              <div className="flex items-center gap-3 bg-white/80 px-4 py-3 rounded-xl shadow-md border border-orange-200 hover:shadow-lg transition-shadow">
                <Users className="h-6 w-6 text-orange-600" />
                <div>
                  <span className="text-xs text-orange-600 font-medium">Público</span>
                  <p className="font-bold text-orange-800">{sequencia.publicoAlvo}</p>
                </div>
              </div>
            )}
          </div>

          {/* Badges de Resumo com Novo Design */}
          <div className="flex flex-wrap justify-center gap-3">
            <Badge className="bg-orange-500 text-white border-orange-600 px-4 py-2 text-sm font-semibold shadow-md hover:bg-orange-600 transition-colors">
              📚 {metadados.totalAulas} Aulas
            </Badge>
            <Badge className="bg-orange-400 text-white border-orange-500 px-4 py-2 text-sm font-semibold shadow-md hover:bg-orange-500 transition-colors">
              📊 {metadados.totalDiagnosticos} Diagnósticos
            </Badge>
            <Badge className="bg-orange-600 text-white border-orange-700 px-4 py-2 text-sm font-semibold shadow-md hover:bg-orange-700 transition-colors">
              📝 {metadados.totalAvaliacoes} Avaliações
            </Badge>
            {metadados.isGeneratedByAI && (
              <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-orange-600 px-4 py-2 text-sm font-semibold shadow-md hover:from-orange-600 hover:to-yellow-600 transition-all">
                ✨ Gerado por IA
              </Badge>
            )}
          </div>

          {/* Competências BNCC com Novo Design */}
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