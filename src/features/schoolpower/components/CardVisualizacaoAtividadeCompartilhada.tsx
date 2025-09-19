
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Download } from 'lucide-react';

interface CardVisualizacaoAtividadeCompartilhadaProps {
  titulo: string;
  onApresentarMaterial?: () => void;
  onUsarMaterial?: () => void;
}

export const CardVisualizacaoAtividadeCompartilhada: React.FC<CardVisualizacaoAtividadeCompartilhadaProps> = ({
  titulo,
  onApresentarMaterial,
  onUsarMaterial
}) => {
  return (
    <Card className="w-full max-w-2xl bg-slate-800/90 border-slate-700 backdrop-blur-sm rounded-2xl shadow-2xl">
      <CardContent className="p-8">
        {/* Título da atividade */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white text-center leading-tight">
            {titulo}
          </h2>
        </div>

        {/* Botões na base do card */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button
            onClick={onApresentarMaterial}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Apresentar Material
          </Button>
          
          <Button
            onClick={onUsarMaterial}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Usar Material
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CardVisualizacaoAtividadeCompartilhada;
