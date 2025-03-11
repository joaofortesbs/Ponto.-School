import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Calendar, Clock, Code, Edit, Globe } from "lucide-react";

interface PlanoCardProps {
  plano: any;
  onSelect: (id: string) => void;
  onEdit: (id: string, e: React.MouseEvent) => void;
}

const PlanoCard = ({ plano, onSelect, onEdit }: PlanoCardProps) => {
  // Componente para o ícone do tipo de plano
  const PlanTypeIcon = ({ tipo }: { tipo: string }) => {
    switch (tipo) {
      case "personalizado":
        return <BookOpen className="h-5 w-5 text-[#FF6B00]" />;
      case "curso":
        return <Code className="h-5 w-5 text-[#FF6B00]" />;
      case "idioma":
        return <Globe className="h-5 w-5 text-[#FF6B00]" />;
      default:
        return <BookOpen className="h-5 w-5 text-[#FF6B00]" />;
    }
  };

  return (
    <div
      className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all duration-300 hover:border-[#FF6B00]/30 cursor-pointer group"
      onClick={() => onSelect(plano.id)}
    >
      <div className="h-2 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40]"></div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
              <PlanTypeIcon tipo={plano.tipo} />
            </div>
            <div>
              <h3 className="font-bold text-[#29335C] dark:text-white text-lg">
                {plano.nome}
              </h3>
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {plano.dataInicio} - {plano.dataFim}
                </span>
              </div>
            </div>
          </div>
          <Badge
            className={`
              ${
                plano.progresso < 30
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                  : plano.progresso < 70
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              }
            `}
          >
            {plano.progresso}% Concluído
          </Badge>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {plano.descricao}
        </p>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Progresso geral
            </span>
            <span className="text-xs font-medium text-[#FF6B00]">
              {plano.progresso}%
            </span>
          </div>
          <Progress value={plano.progresso} className="h-1.5" />
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {plano.materias.slice(0, 3).map((materia: any, index: number) => (
            <Badge
              key={index}
              className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 font-normal"
              style={{ borderLeft: `3px solid ${materia.cor}` }}
            >
              {materia.nome}
            </Badge>
          ))}
          {plano.materias.length > 3 && (
            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 font-normal">
              +{plano.materias.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Atualizado recentemente
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => onEdit(plano.id, e)}
          >
            <Edit className="h-4 w-4 mr-1" /> Editar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlanoCard;
