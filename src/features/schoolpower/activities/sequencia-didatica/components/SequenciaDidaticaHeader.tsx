
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Target, Calendar, FileText } from 'lucide-react';
import { SequenciaDidaticaResult } from '../SequenciaDidaticaBuilder';

interface SequenciaDidaticaHeaderProps {
  data: SequenciaDidaticaResult;
  formData: any;
}

export const SequenciaDidaticaHeader: React.FC<SequenciaDidaticaHeaderProps> = ({ data, formData }) => {
  const { metadados } = data;
  
  return (
    <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <BookOpen className="h-5 w-5" />
          {formData.tituloTemaAssunto || 'Sequência Didática'}
        </CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            {metadados.disciplina}
          </Badge>
          <Badge variant="outline" className="border-orange-300 text-orange-700">
            {metadados.anoSerie}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Estatísticas */}
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-blue-600">{metadados.totalAulas}</p>
              <p className="text-xs text-gray-600">Aulas</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-green-600">{metadados.totalDiagnosticos}</p>
              <p className="text-xs text-gray-600">Diagnósticos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-sm font-semibold text-purple-600">{metadados.totalAvaliacoes}</p>
              <p className="text-xs text-gray-600">Avaliações</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange-600" />
            <div>
              <p className="text-sm font-semibold text-orange-600">{data.aulas.length}</p>
              <p className="text-xs text-gray-600">Total de Atividades</p>
            </div>
          </div>
        </div>

        {/* Informações adicionais */}
        {formData.publicoAlvo && (
          <div className="mt-4 p-3 bg-white/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Público-alvo</span>
            </div>
            <p className="text-sm text-gray-600">{formData.publicoAlvo}</p>
          </div>
        )}

        {formData.objetivosAprendizagem && (
          <div className="mt-3 p-3 bg-white/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Objetivos de Aprendizagem</span>
            </div>
            <p className="text-sm text-gray-600">{formData.objetivosAprendizagem}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SequenciaDidaticaHeader;
