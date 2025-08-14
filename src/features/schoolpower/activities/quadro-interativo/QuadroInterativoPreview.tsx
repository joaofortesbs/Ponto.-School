
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface QuadroInterativoPreviewProps {
  data: any;
}

const QuadroInterativoPreview: React.FC<QuadroInterativoPreviewProps> = ({ data }) => {
  return (
    <div className="space-y-6 p-6">
      <Card className="border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-indigo-800 dark:text-indigo-200 flex items-center gap-2">
            🎯 {data?.title || 'Quadro Interativo'}
          </CardTitle>
          <p className="text-gray-700 dark:text-gray-300 mt-2">
            {data?.description || 'Atividade interativa para engajamento dos alunos'}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Informações Básicas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-2">📚 Disciplina</h4>
              <p className="text-gray-700 dark:text-gray-300">
                {data?.subject || 'Não especificado'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-2">🎓 Ano / Série</h4>
              <p className="text-gray-700 dark:text-gray-300">
                {data?.schoolYear || 'Não especificado'}
              </p>
            </div>
          </div>

          {/* Tema */}
          {data?.theme && (
            <div>
              <h4 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-2">💡 Tema da Aula</h4>
              <p className="text-gray-700 dark:text-gray-300 bg-indigo-100 dark:bg-indigo-800 p-3 rounded-lg">
                {data.theme}
              </p>
            </div>
          )}

          {/* Objetivos */}
          {data?.objectives && (
            <div>
              <h4 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-2">🎯 Objetivos de Aprendizagem</h4>
              <p className="text-gray-700 dark:text-gray-300">
                {data.objectives}
              </p>
            </div>
          )}

          {/* Nível e Atividades */}
          <div className="flex flex-wrap gap-2">
            {data?.difficultyLevel && (
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                ⚡ {data.difficultyLevel}
              </Badge>
            )}
          </div>

          {/* Atividades Mostradas */}
          {data?.practicalActivities && (
            <div>
              <h4 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-2">🔧 Atividades Mostradas</h4>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  {data.practicalActivities}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuadroInterativoPreview;
