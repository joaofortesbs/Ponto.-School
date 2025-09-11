import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, GraduationCap, Calendar, Users } from 'lucide-react';

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
    <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Título Principal */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-indigo-800 mb-2">
              {sequencia.titulo}
            </h1>
            <p className="text-indigo-600 max-w-3xl mx-auto">
              {sequencia.descricaoGeral}
            </p>
          </div>

          {/* Informações Principais */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              <span className="font-medium text-indigo-800">{sequencia.disciplina}</span>
            </div>

            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
              <GraduationCap className="h-5 w-5 text-indigo-600" />
              <span className="font-medium text-indigo-800">{sequencia.anoSerie}</span>
            </div>

            {metadados.duracao && (
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <span className="font-medium text-indigo-800">{metadados.duracao}</span>
              </div>
            )}

            {sequencia.publicoAlvo && (
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                <Users className="h-5 w-5 text-indigo-600" />
                <span className="font-medium text-indigo-800">{sequencia.publicoAlvo}</span>
              </div>
            )}
          </div>

          {/* Badges de Resumo */}
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
              {metadados.totalAulas} Aulas
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {metadados.totalDiagnosticos} Diagnósticos
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              {metadados.totalAvaliacoes} Avaliações
            </Badge>
            {metadados.isGeneratedByAI && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                ✨ Gerado por IA
              </Badge>
            )}
          </div>

          {/* Competências BNCC */}
          {sequencia.competenciasBNCC && (
            <div className="text-center">
              <h3 className="font-semibold text-indigo-700 mb-2">Competências BNCC:</h3>
              <p className="text-sm text-indigo-600 bg-white px-4 py-2 rounded-lg inline-block">
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