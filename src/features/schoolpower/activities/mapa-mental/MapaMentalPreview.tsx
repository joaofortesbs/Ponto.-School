
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Target, CheckCircle, Book, List, Star } from 'lucide-react';

interface MapaMentalData {
  titulo?: string;
  descricao?: string;
  temaCentral?: string;
  categoriasPrincipais?: string[];
  objetivoGeral?: string;
  criteriosAvaliacao?: string[];
  [key: string]: any;
}

interface MapaMentalPreviewProps {
  data: MapaMentalData;
}

export const MapaMentalPreview: React.FC<MapaMentalPreviewProps> = ({ data }) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-800">
            {data.titulo || 'Mapa Mental'}
          </h2>
        </div>
        {data.descricao && (
          <p className="text-gray-600 text-sm">{data.descricao}</p>
        )}
      </div>

      {/* Tema Central */}
      {data.temaCentral && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="w-5 h-5 text-yellow-500" />
              Tema Central
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-base px-4 py-2 bg-yellow-50 border-yellow-200">
              {data.temaCentral}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Categorias Principais */}
      {data.categoriasPrincipais && data.categoriasPrincipais.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <List className="w-5 h-5 text-blue-500" />
              Categorias Principais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.categoriasPrincipais.map((categoria, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  {categoria}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Objetivo Geral */}
      {data.objetivoGeral && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-green-500" />
              Objetivo Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{data.objetivoGeral}</p>
          </CardContent>
        </Card>
      )}

      {/* Critérios de Avaliação */}
      {data.criteriosAvaliacao && data.criteriosAvaliacao.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="w-5 h-5 text-purple-500" />
              Critérios de Avaliação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.criteriosAvaliacao.map((criterio, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{criterio}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
