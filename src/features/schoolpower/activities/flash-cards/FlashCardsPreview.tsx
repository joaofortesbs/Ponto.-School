
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FlashCardsPreviewProps {
  data: {
    titulo?: string;
    descricao?: string;
    tema?: string;
    topicos?: string;
    numeroFlashcards?: string;
    contexto?: string;
  };
}

export const FlashCardsPreview: React.FC<FlashCardsPreviewProps> = ({ data }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {data.titulo || 'Flash Cards'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.descricao && (
          <div>
            <span className="text-sm font-medium text-gray-600">Descrição:</span>
            <p className="text-sm mt-1">{data.descricao}</p>
          </div>
        )}
        
        {data.tema && (
          <div>
            <span className="text-sm font-medium text-gray-600">Tema:</span>
            <Badge variant="outline" className="ml-2">{data.tema}</Badge>
          </div>
        )}
        
        {data.topicos && (
          <div>
            <span className="text-sm font-medium text-gray-600">Tópicos:</span>
            <p className="text-sm mt-1">{data.topicos}</p>
          </div>
        )}
        
        {data.numeroFlashcards && (
          <div>
            <span className="text-sm font-medium text-gray-600">Número de flashcards:</span>
            <Badge variant="secondary" className="ml-2">{data.numeroFlashcards}</Badge>
          </div>
        )}
        
        {data.contexto && (
          <div>
            <span className="text-sm font-medium text-gray-600">Contexto:</span>
            <p className="text-sm mt-1">{data.contexto}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
