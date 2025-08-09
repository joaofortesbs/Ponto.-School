
import React from 'react';
import { FileText, Users, BookOpen, Lightbulb, PenTool, Calculator, Microscope, Globe } from 'lucide-react';

interface Activity {
  name: string;
  icon: React.ReactNode;
}

interface AtividadesInterfaceProps {
  data?: {
    etapas?: Array<{
      recursos?: string;
    }>;
  };
}

export const AtividadesInterface: React.FC<AtividadesInterfaceProps> = ({ data }) => {
  // Extrair todas as atividades/recursos das etapas
  const extractActivities = (): Activity[] => {
    if (!data?.etapas) return [];

    const allActivities: Activity[] = [];
    
    data.etapas.forEach(etapa => {
      if (etapa.recursos) {
        // Dividir os recursos por vírgula e processar cada um
        const recursos = etapa.recursos.split(',').map(r => r.trim());
        
        recursos.forEach(recurso => {
          if (recurso && !allActivities.some(a => a.name === recurso)) {
            allActivities.push({
              name: recurso,
              icon: getIconForActivity(recurso)
            });
          }
        });
      }
    });

    return allActivities;
  };

  const getIconForActivity = (activityName: string): React.ReactNode => {
    const name = activityName.toLowerCase();
    
    if (name.includes('lista') || name.includes('exercício') || name.includes('questão')) {
      return <FileText className="w-5 h-5 text-orange-600" />;
    } else if (name.includes('grupo') || name.includes('equipe') || name.includes('colaborativo')) {
      return <Users className="w-5 h-5 text-orange-600" />;
    } else if (name.includes('livro') || name.includes('texto') || name.includes('leitura')) {
      return <BookOpen className="w-5 h-5 text-orange-600" />;
    } else if (name.includes('criativo') || name.includes('ideia') || name.includes('brainstorm')) {
      return <Lightbulb className="w-5 h-5 text-orange-600" />;
    } else if (name.includes('redação') || name.includes('escrita') || name.includes('produção')) {
      return <PenTool className="w-5 h-5 text-orange-600" />;
    } else if (name.includes('matemática') || name.includes('cálculo') || name.includes('número')) {
      return <Calculator className="w-5 h-5 text-orange-600" />;
    } else if (name.includes('ciência') || name.includes('experimento') || name.includes('laboratório')) {
      return <Microscope className="w-5 h-5 text-orange-600" />;
    } else if (name.includes('geografia') || name.includes('história') || name.includes('mundo')) {
      return <Globe className="w-5 h-5 text-orange-600" />;
    } else {
      return <FileText className="w-5 h-5 text-orange-600" />;
    }
  };

  const activities = extractActivities();

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Atividades e Recursos
        </h3>
      </div>

      {/* Grade de Atividades */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                {activity.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm leading-tight">
                  {activity.name}
                </h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mensagem caso não haja atividades */}
      {activities.length === 0 && (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            Nenhuma atividade ou recurso encontrado nas etapas de desenvolvimento.
          </p>
        </div>
      )}
    </div>
  );
};

export default AtividadesInterface;
