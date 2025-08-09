
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, Plus, Clock, ChevronDown, ChevronUp, GripVertical, 
  FileText, Lightbulb, Edit, Presentation, MessageSquare, Video, 
  Group, Gamepad2, Play 
} from 'lucide-react';
import { DesenvolvimentoData, DesenvolvimentoDataProcessor } from './DesenvolvimentoData';

interface DesenvolvimentoInterfaceProps {
  planoData: any;
}

const DesenvolvimentoInterface: React.FC<DesenvolvimentoInterfaceProps> = ({ planoData }) => {
  const data = DesenvolvimentoDataProcessor.processData(planoData);
  const [developmentSteps, setDevelopmentSteps] = useState(data.etapas);
  const [expandedSteps, setExpandedSteps] = useState<{ [key: number]: boolean }>({});
  const [draggedStep, setDraggedStep] = useState<number | null>(null);

  const iconMap = {
    'Presentation': Presentation,
    'MessageSquare': MessageSquare,
    'Video': Video,
    'Group': Group,
    'Gamepad2': Gamepad2,
    'Activity': Activity,
    'Play': Play
  };

  const getInteractionIcon = (tipoInteracao: string) => {
    const iconName = DesenvolvimentoDataProcessor.getInteractionIcon(tipoInteracao);
    return iconMap[iconName as keyof typeof iconMap] || Play;
  };

  const handleDragStart = (index: number) => {
    setDraggedStep(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedStep === null) return;

    const newSteps = [...developmentSteps];
    const draggedItem = newSteps[draggedStep];
    newSteps.splice(draggedStep, 1);
    newSteps.splice(targetIndex, 0, draggedItem);

    setDevelopmentSteps(newSteps);
    setDraggedStep(null);
  };

  const moveStepUp = (index: number) => {
    if (index > 0) {
      const newSteps = [...developmentSteps];
      [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
      setDevelopmentSteps(newSteps);
    }
  };

  const moveStepDown = (index: number) => {
    if (index < developmentSteps.length - 1) {
      const newSteps = [...developmentSteps];
      [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
      setDevelopmentSteps(newSteps);
    }
  };

  const toggleStepExpansion = (index: number) => {
    setExpandedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-orange-600" />
          Etapas de Desenvolvimento
        </h3>
        <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Etapa
        </Button>
      </div>

      <div className="space-y-4">
        {developmentSteps.map((etapa, index) => {
          const InteractionIcon = getInteractionIcon(etapa.tipo_interacao || etapa.tipoInteracao || 'Interativo');
          const isExpanded = expandedSteps[index];
          const truncatedDescription = etapa.descricao?.length > 120
            ? etapa.descricao.substring(0, 120) + '...'
            : etapa.descricao;

          return (
            <Card
              key={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              className={`relative overflow-hidden transition-all duration-300 border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl cursor-move ${
                draggedStep === index ? 'opacity-50 scale-95' : ''
              }`}
            >
              <CardContent className="p-0">
                {/* Header do Card */}
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-4 border-b border-orange-200 dark:border-orange-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-5 h-5 text-gray-400 cursor-grab active:cursor-grabbing" />
                        <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                          {etapa.titulo}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                            <InteractionIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {etapa.tipo_interacao || etapa.tipoInteracao}
                            </span>
                          </div>
                          {etapa.tempo_estimado && (
                            <Badge variant="outline" className="border-orange-300 text-orange-700 bg-white dark:border-orange-600 dark:text-orange-300 dark:bg-orange-900/20 text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {etapa.tempo_estimado}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Controles de Movimento */}
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveStepUp(index)}
                        disabled={index === 0}
                        className="h-8 w-8 p-0 text-gray-500 hover:text-orange-600 disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveStepDown(index)}
                        disabled={index === developmentSteps.length - 1}
                        className="h-8 w-8 p-0 text-gray-500 hover:text-orange-600 disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-4">
                  <div className="mb-4">
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {isExpanded ? etapa.descricao : truncatedDescription}
                    </p>

                    {etapa.descricao?.length > 120 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStepExpansion(index)}
                        className="mt-2 text-orange-600 hover:text-orange-700 text-xs p-0 h-auto"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3 mr-1" />
                            Recolher
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3 mr-1" />
                            Expandir
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Recursos e Notas */}
                  {etapa.recurso_gerado && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-3 border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">Recurso:</span>
                      </div>
                      <span className="text-sm text-blue-700 dark:text-blue-300">{etapa.recurso_gerado}</span>
                    </div>
                  )}

                  {etapa.nota_privada_professor && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg mb-3 border border-amber-200 dark:border-amber-700">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-sm font-semibold text-amber-800 dark:text-amber-200 block mb-1">
                            Nota para o professor:
                          </span>
                          <p className="text-sm text-amber-700 dark:text-amber-300">
                            {etapa.nota_privada_professor}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botões de Ação */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/20"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar esta etapa
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      Gerar Slides
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Gerar Recurso
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DesenvolvimentoInterface;
