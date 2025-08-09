
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  GripVertical,
  Clock,
  Users,
  Presentation,
  Activity,
  MessageSquare,
  Play,
  BookOpen,
  CheckCircle
} from 'lucide-react';

interface DesenvolvimentoInterfaceProps {
  planoData: any;
}

const DesenvolvimentoInterface: React.FC<DesenvolvimentoInterfaceProps> = ({ planoData }) => {
  const [expandedEtapas, setExpandedEtapas] = useState<{ [key: number]: boolean }>({});
  const [etapas, setEtapas] = useState(planoData?.desenvolvimento || []);

  const toggleEtapa = (index: number) => {
    setExpandedEtapas(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getInteractionIcon = (tipo: string) => {
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes('apresentação') || tipoLower.includes('exposição')) {
      return <Presentation className="w-4 h-4" />;
    } else if (tipoLower.includes('debate') || tipoLower.includes('discussão')) {
      return <MessageSquare className="w-4 h-4" />;
    } else if (tipoLower.includes('atividade') || tipoLower.includes('prática')) {
      return <Activity className="w-4 h-4" />;
    } else if (tipoLower.includes('avaliação') || tipoLower.includes('avaliativa')) {
      return <CheckCircle className="w-4 h-4" />;
    } else if (tipoLower.includes('interativa')) {
      return <Users className="w-4 h-4" />;
    } else if (tipoLower.includes('leitura')) {
      return <BookOpen className="w-4 h-4" />;
    } else {
      return <Play className="w-4 h-4" />;
    }
  };

  const getInteractionColor = (tipo: string) => {
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes('apresentação') || tipoLower.includes('exposição')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    } else if (tipoLower.includes('debate') || tipoLower.includes('discussão')) {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    } else if (tipoLower.includes('atividade') || tipoLower.includes('prática')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    } else if (tipoLower.includes('avaliação') || tipoLower.includes('avaliativa')) {
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    } else if (tipoLower.includes('interativa')) {
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
    } else if (tipoLower.includes('leitura')) {
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
    } else {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Função para reordenar etapas (drag and drop simulation)
  const moveEtapa = (fromIndex: number, toIndex: number) => {
    const newEtapas = [...etapas];
    const [movedEtapa] = newEtapas.splice(fromIndex, 1);
    newEtapas.splice(toIndex, 0, movedEtapa);
    
    // Atualizar números das etapas
    const updatedEtapas = newEtapas.map((etapa, index) => ({
      ...etapa,
      etapa: index + 1
    }));
    
    setEtapas(updatedEtapas);
  };

  return (
    <div className="space-y-6">
      {/* Header da Seção */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
            <Activity className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Desenvolvimento da Aula
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Etapas estruturadas para conduzir a aula de forma efetiva
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Cards das Etapas */}
      <div className="space-y-4">
        {etapas.map((etapa: any, index: number) => (
          <Card key={index} className="relative overflow-hidden border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-900">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                {/* Drag Handle */}
                <div className="flex items-center gap-3">
                  <button 
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing"
                    onMouseDown={(e) => {
                      // Simulação simples de drag and drop
                      const handleMouseMove = (moveEvent: MouseEvent) => {
                        // Lógica de drag seria implementada aqui
                      };
                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };
                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                  >
                    <GripVertical className="w-5 h-5" />
                  </button>
                  
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {etapa.titulo || `${etapa.etapa}. Etapa ${etapa.etapa}`}
                    </CardTitle>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Funcionalidade de editar etapa
                      console.log('Editando etapa:', etapa);
                    }}
                    className="text-orange-600 border-orange-200 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-700 dark:hover:bg-orange-900/20"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar esta etapa
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleEtapa(index)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    {expandedEtapas[index] ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Informações Principais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {/* Tipo de Interação */}
                <div className="flex items-center gap-2">
                  <Badge className={`flex items-center gap-1 ${getInteractionColor(etapa.tipo_interacao || 'Interativa')}`}>
                    {getInteractionIcon(etapa.tipo_interacao || 'Interativa')}
                    {etapa.tipo_interacao || 'Interativa'}
                  </Badge>
                </div>

                {/* Tempo Estimado */}
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {etapa.tempo_estimado || '15 min'}
                  </span>
                </div>

                {/* Recursos */}
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Presentation className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {etapa.recurso_gerado || 'Material didático'}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Descrição Curta */}
              <div className="space-y-3">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {expandedEtapas[index] 
                    ? (etapa.descricao || 'Descrição detalhada da etapa')
                    : `${(etapa.descricao || 'Descrição detalhada da etapa').substring(0, 120)}...`
                  }
                </p>

                {/* Botão Expandir */}
                {!expandedEtapas[index] && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => toggleEtapa(index)}
                    className="p-0 h-auto text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                  >
                    Expandir descrição
                  </Button>
                )}

                {/* Conteúdo Expandido */}
                {expandedEtapas[index] && (
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {etapa.nota_privada_professor && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Nota Privada do Professor
                        </h4>
                        <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                          {etapa.nota_privada_professor}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Objetivos desta etapa:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <li>Engajar os alunos no tema</li>
                          <li>Estabelecer base conceitual</li>
                          <li>Promover participação ativa</li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Recursos necessários:</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {etapa.recurso_gerado || 'Material didático'}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Quadro/Projetor
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumo do Desenvolvimento */}
      <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-orange-800 dark:text-orange-400">
                Resumo do Desenvolvimento
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                {etapas.length} etapas estruturadas • Tempo total estimado: {
                  etapas.reduce((total: number, etapa: any) => {
                    const tempo = etapa.tempo_estimado || '15 min';
                    const minutos = parseInt(tempo.replace(/\D/g, '')) || 15;
                    return total + minutos;
                  }, 0)
                } minutos
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-800 dark:text-orange-400">
                Pronto para execução
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesenvolvimentoInterface;
