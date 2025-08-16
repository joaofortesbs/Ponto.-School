
import React from 'react';
import { Card } from '@/components/ui/card';

interface QuadroInterativoData {
  titulo: string;
  texto: string;
}

interface QuadroInterativoPreviewProps {
  data: QuadroInterativoData;
}

/**
 * Card de Visualização de Quadro - Interface simples para mostrar o conteúdo gerado
 */
const QuadroInterativoPreview: React.FC<QuadroInterativoPreviewProps> = ({ data }) => {
  return (
    <div className="flex justify-center items-center min-h-[400px] p-4">
      <Card className="w-full max-w-2xl p-6 bg-white shadow-lg rounded-xl border-2 border-gray-200 hover:shadow-xl transition-shadow duration-300">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {data.titulo || 'Quadro Interativo'}
          </h2>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {data.texto || 'Conteúdo será exibido aqui após a geração.'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuadroInterativoPreview;
