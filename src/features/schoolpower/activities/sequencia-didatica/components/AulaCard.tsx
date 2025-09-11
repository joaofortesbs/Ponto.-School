import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Clock, Users, Target } from 'lucide-react';

interface AulaCardProps {
  aula: {
    id?: string;
    titulo: string;
    duracao?: string;
    objetivos?: string;
    metodologia?: string;
    recursos?: string;
    avaliacao?: string;
    descricao?: string;
    conteudo?: string;
  };
}

const AulaCard: React.FC<AulaCardProps> = ({ aula }) => {
  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-xl hover:scale-105 transition-all duration-500 ease-in-out cursor-pointer rounded-2xl border-2 hover:border-orange-300 active:scale-95">
      <CardHeader className="pb-3">
        <CardTitle className="text-orange-700 text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {aula.titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {aula.duracao && (
          <div className="flex items-center gap-2 text-sm text-orange-600">
            <Clock className="h-4 w-4" />
            <span>{aula.duracao}</span>
          </div>
        )}

        {aula.objetivos && (
          <div className="bg-white/60 rounded-xl p-3 border border-orange-200">
            <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Objetivos
            </h4>
            <p className="text-sm text-orange-800">{aula.objetivos}</p>
          </div>
        )}

        {aula.metodologia && (
          <div className="bg-white/60 rounded-xl p-3 border border-orange-200">
            <h4 className="font-semibold text-orange-700 mb-2">Metodologia</h4>
            <p className="text-sm text-orange-800">{aula.metodologia}</p>
          </div>
        )}

        {aula.recursos && (
          <div className="bg-white/60 rounded-xl p-3 border border-orange-200">
            <h4 className="font-semibold text-orange-700 mb-2">Recursos</h4>
            <p className="text-sm text-orange-800">{aula.recursos}</p>
          </div>
        )}

        {aula.descricao && (
          <div className="bg-white/60 rounded-xl p-3 border border-orange-200">
            <h4 className="font-semibold text-orange-700 mb-2">Descrição</h4>
            <p className="text-sm text-orange-800">{aula.descricao}</p>
          </div>
        )}

        {aula.conteudo && (
          <div className="bg-white/60 rounded-xl p-3 border border-orange-200">
            <h4 className="font-semibold text-orange-700 mb-2">Conteúdo</h4>
            <p className="text-sm text-orange-800">{aula.conteudo}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AulaCard;