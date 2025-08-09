
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Edit, CheckCircle, X, Zap, Presentation, Gamepad2, Search, PenTool, Users2, UserCheck, Lightbulb } from 'lucide-react';
import { MetodologiaData, MetodologiaDataProcessor } from './MetodologiaData';

interface MetodologiaInterfaceProps {
  planoData: any;
}

const MetodologiaInterface: React.FC<MetodologiaInterfaceProps> = ({ planoData }) => {
  const data = MetodologiaDataProcessor.processData(planoData);
  const [selectedMethodologies, setSelectedMethodologies] = useState<string[]>(data.alternativas);
  const [editingMethodologies, setEditingMethodologies] = useState(false);

  const methodologyIcons: { [key: string]: React.ElementType } = {
    'Aula Expositiva': Presentation,
    'Atividades Práticas': Gamepad2,
    'Estudo de Caso': Search,
    'Aprendizagem Baseada em Projetos': PenTool,
    'Aprendizagem Cooperativa': Users2,
    'Resolução de Problemas': Zap,
    'Simulação': Presentation,
    'Discussão em Grupo': Users2,
    'Metacognição': Brain,
    'Aula Dialogada': UserCheck,
    'Outra Metodologia': Lightbulb,
  };

  const getMethodologyIcon = (methodologyName: string) => {
    return methodologyIcons[methodologyName] || Lightbulb;
  };

  const availableMethodologiesOptions = [
    { name: "Aula Expositiva", icon: Presentation },
    { name: "Atividades Práticas", icon: Gamepad2 },
    { name: "Estudo de Caso", icon: Search },
    { name: "Aprendizagem Baseada em Projetos", icon: PenTool },
    { name: "Aprendizagem Cooperativa", icon: Users2 },
    { name: "Resolução de Problemas", icon: Zap },
    { name: "Simulação", icon: Presentation },
    { name: "Discussão em Grupo", icon: Users2 },
    { name: "Metacognição", icon: Brain },
    { name: "Aula Dialogada", icon: UserCheck },
  ];

  const addMethodology = (methodologyName: string) => {
    if (!selectedMethodologies.includes(methodologyName)) {
      setSelectedMethodologies([...selectedMethodologies, methodologyName]);
    }
  };

  const removeMethodology = (methodologyNameToRemove: string) => {
    setSelectedMethodologies(selectedMethodologies.filter(name => name !== methodologyNameToRemove));
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-orange-500 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            {data.nome}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-5 rounded-xl border border-orange-200 dark:border-orange-700">
            <p className="text-gray-800 dark:text-gray-200 text-base leading-relaxed">
              {data.descricao}
            </p>
          </div>

          {/* Metodologias Alternativas - Gerenciáveis */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Metodologias Alternativas</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingMethodologies(!editingMethodologies)}
                className="text-orange-600 border-orange-300 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-600 dark:hover:bg-orange-900/30"
              >
                {editingMethodologies ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Salvar
                  </>
                ) : (
                  <>
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </>
                )}
              </Button>
            </div>

            {/* Lista de Metodologias Selecionadas */}
            <div className="flex flex-wrap gap-2">
              {selectedMethodologies.map((methodology, index) => {
                const IconComponent = getMethodologyIcon(methodology);
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-700 rounded-full px-3 py-1"
                  >
                    <IconComponent className="h-3 w-3" />
                    <span className="text-sm">{methodology}</span>
                    {selectedMethodologies.length > 1 && (
                      <button
                        onClick={() => removeMethodology(methodology)}
                        className="ml-1 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Dropdown para Adicionar Metodologias */}
            {editingMethodologies && (
              <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Escolha uma metodologia para adicionar:
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  {availableMethodologiesOptions
                    .filter(methodology => !selectedMethodologies.includes(methodology.name))
                    .map((methodology) => (
                      <button
                        key={methodology.name}
                        onClick={() => addMethodology(methodology.name)}
                        className="flex items-center gap-2 p-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <methodology.icon className="h-4 w-4 text-orange-500" />
                        {methodology.name}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Simulação da Aula */}
          <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
              <h4 className="font-medium text-green-900 dark:text-green-100">Simulação da Aula</h4>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              {data.simulacao_de_aula}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetodologiaInterface;
