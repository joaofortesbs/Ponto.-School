
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Users, Target } from 'lucide-react';

interface SequenciaDidaticaHeaderProps {
  sequencia: {
    titulo: string;
    disciplina: string;
    anoSerie: string;
    cargaHoraria?: string;
    descricaoGeral?: string;
  };
  metadados: {
    totalAulas: number;
    totalDiagnosticos: number;
    totalAvaliacoes: number;
  };
}

const SequenciaDidaticaHeader: React.FC<SequenciaDidaticaHeaderProps> = ({ 
  sequencia, 
  metadados 
}) => {
  return (
    <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-800">
          <BookOpen className="h-5 w-5" />
          {sequencia.titulo}
        </CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
            {sequencia.disciplina}
          </Badge>
          <Badge variant="outline" className="border-indigo-300 text-indigo-700">
            {sequencia.anoSerie}
          </Badge>
          {sequencia.cargaHoraria && (
            <Badge variant="outline" className="border-indigo-300 text-indigo-700">
              <Clock className="h-3 w-3 mr-1" />
              {sequencia.cargaHoraria}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {sequencia.descricaoGeral && (
          <p className="text-sm text-gray-700 mb-4">
            {sequencia.descricaoGeral}
          </p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 p-3 bg-blue-100 rounded-lg">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <div>
              <span className="text-sm font-medium text-blue-800">Aulas</span>
              <div className="text-lg font-bold text-blue-600">{metadados.totalAulas}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-green-100 rounded-lg">
            <Target className="h-5 w-5 text-green-600" />
            <div>
              <span className="text-sm font-medium text-green-800">Diagnósticos</span>
              <div className="text-lg font-bold text-green-600">{metadados.totalDiagnosticos}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-purple-100 rounded-lg">
            <Users className="h-5 w-5 text-purple-600" />
            <div>
              <span className="text-sm font-medium text-purple-800">Avaliações</span>
              <div className="text-lg font-bold text-purple-600">{metadados.totalAvaliacoes}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SequenciaDidaticaHeader;
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
