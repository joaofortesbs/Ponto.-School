import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarrosselQuadrosSalaAulaProps {
  quadros: any[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export const CarrosselQuadrosSalaAula: React.FC<CarrosselQuadrosSalaAulaProps> = ({
  quadros,
  currentIndex,
  onNavigate
}) => {
  return (
    <div className="relative">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => onNavigate(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold">
              Quadro {currentIndex + 1} de {quadros.length}
            </h3>

            <button
              onClick={() => onNavigate(Math.min(quadros.length - 1, currentIndex + 1))}
              disabled={currentIndex === quadros.length - 1}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {quadros[currentIndex] && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">{quadros[currentIndex].title}</h4>
              <p className="text-gray-700">{quadros[currentIndex].content}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CarrosselQuadrosSalaAula;