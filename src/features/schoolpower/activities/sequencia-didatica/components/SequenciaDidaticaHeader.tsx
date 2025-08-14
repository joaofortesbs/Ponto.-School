
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Calendar, BarChart3 } from 'lucide-react';
import { SequenciaDidaticaResult } from '../SequenciaDidaticaBuilder';

interface SequenciaDidaticaHeaderProps {
  data: SequenciaDidaticaResult;
  formData?: any;
}

export const SequenciaDidaticaHeader: React.FC<SequenciaDidaticaHeaderProps> = ({ data, formData }) => {
  const totalAtividades = data.aulas.length;
  
  return (
    <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <BookOpen className="h-6 w-6" />
          Sequência Didática Gerada
        </CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            {data.metadados.disciplina}
          </Badge>
          <Badge variant="outline" className="border-orange-300 text-orange-700">
            {data.metadados.anoSerie}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex flex-col items-center gap-1">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="text-lg font-bold text-blue-600">{data.metadados.totalAulas}</span>
              <span className="text-sm text-gray-600">Aulas</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex flex-col items-center gap-1">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span className="text-lg font-bold text-green-600">{data.metadados.totalDiagnosticos}</span>
              <span className="text-sm text-gray-600">Diagnósticos</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex flex-col items-center gap-1">
              <Users className="h-5 w-5 text-purple-600" />
              <span className="text-lg font-bold text-purple-600">{data.metadados.totalAvaliacoes}</span>
              <span className="text-sm text-gray-600">Avaliações</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex flex-col items-center gap-1">
              <Calendar className="h-5 w-5 text-orange-600" />
              <span className="text-lg font-bold text-orange-600">{totalAtividades}</span>
              <span className="text-sm text-gray-600">Total</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SequenciaDidaticaHeader;
