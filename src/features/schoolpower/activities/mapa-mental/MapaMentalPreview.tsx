
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, CheckCircle, BookOpen } from 'lucide-react';

interface MapaMentalPreviewProps {
  data: any;
}

const MapaMentalPreview: React.FC<MapaMentalPreviewProps> = ({ data }) => {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-blue-600" />
          <CardTitle className="text-xl font-bold">
            {data.title || 'Mapa Mental'}
          </CardTitle>
        </div>
        <p className="text-gray-600 mt-2">
          {data.description || 'Criação de um mapa mental para organizar conhecimentos'}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Tema Central */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">Tema Central</h3>
          </div>
          <p className="text-blue-700">
            {data.centralTheme || data.customFields?.['Tema Central'] || 'Tema a ser definido'}
          </p>
        </div>

        {/* Categorias Principais */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-green-800">Categorias Principais</h3>
          </div>
          <p className="text-green-700">
            {data.mainCategories || data.customFields?.['Categorias Principais'] || 'Categorias a serem definidas'}
          </p>
        </div>

        {/* Objetivo Geral */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-purple-800">Objetivo Geral</h3>
          </div>
          <p className="text-purple-700">
            {data.generalObjective || data.customFields?.['Objetivo Geral'] || 'Organizar e visualizar conhecimentos'}
          </p>
        </div>

        {/* Critérios de Avaliação */}
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold text-orange-800">Critérios de Avaliação</h3>
          </div>
          <p className="text-orange-700">
            {data.evaluationCriteria || data.customFields?.['Critérios de Avaliação'] || 'Clareza, organização e completude'}
          </p>
        </div>

        {/* Metadados */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Badge variant="secondary">
            {data.subject || 'Geral'}
          </Badge>
          <Badge variant="outline">
            {data.duration || '50 min'}
          </Badge>
          <Badge variant="outline">
            {data.difficulty || 'Médio'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapaMentalPreview;
