
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, BookOpen, Users, Calendar, FileText, BarChart3 } from 'lucide-react';

interface SequenciaDidaticaPreviewProps {
  data: {
    tituloTemaAssunto?: string;
    anoSerie?: string;
    disciplina?: string;
    bnccCompetencias?: string;
    publicoAlvo?: string;
    objetivosAprendizagem?: string;
    quantidadeAulas?: string;
    quantidadeDiagnosticos?: string;
    quantidadeAvaliacoes?: string;
    cronograma?: string;
  };
}

export const SequenciaDidaticaPreview: React.FC<SequenciaDidaticaPreviewProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <BookOpen className="h-5 w-5" />
            {data.tituloTemaAssunto || 'Sequência Didática'}
          </CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.disciplina && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {data.disciplina}
              </Badge>
            )}
            {data.anoSerie && (
              <Badge variant="outline" className="border-blue-300 text-blue-700">
                {data.anoSerie}
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Informações Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.publicoAlvo && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="font-medium text-sm">Público-alvo</span>
              </div>
              <p className="text-sm text-gray-600">{data.publicoAlvo}</p>
            </CardContent>
          </Card>
        )}

        {data.bnccCompetencias && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-sm">BNCC / Competências</span>
              </div>
              <p className="text-sm text-gray-600">{data.bnccCompetencias}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Objetivos de Aprendizagem */}
      {data.objetivosAprendizagem && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-orange-600" />
              Objetivos de Aprendizagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 whitespace-pre-line">
              {data.objetivosAprendizagem}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quantidades */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.quantidadeAulas && (
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="flex flex-col items-center gap-2">
                <Clock className="h-6 w-6 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">{data.quantidadeAulas}</span>
                <span className="text-sm text-gray-600">Aulas</span>
              </div>
            </CardContent>
          </Card>
        )}

        {data.quantidadeDiagnosticos && (
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="flex flex-col items-center gap-2">
                <BarChart3 className="h-6 w-6 text-green-600" />
                <span className="text-2xl font-bold text-green-600">{data.quantidadeDiagnosticos}</span>
                <span className="text-sm text-gray-600">Diagnósticos</span>
              </div>
            </CardContent>
          </Card>
        )}

        {data.quantidadeAvaliacoes && (
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-6 w-6 text-purple-600" />
                <span className="text-2xl font-bold text-purple-600">{data.quantidadeAvaliacoes}</span>
                <span className="text-sm text-gray-600">Avaliações</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cronograma */}
      {data.cronograma && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-indigo-600" />
              Cronograma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 whitespace-pre-line">
              {data.cronograma}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SequenciaDidaticaPreview;
