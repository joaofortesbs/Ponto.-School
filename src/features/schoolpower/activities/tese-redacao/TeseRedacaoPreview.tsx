
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Target, Award, BookOpen, CheckCircle } from 'lucide-react';

interface TeseRedacaoPreviewProps {
  content: any;
  activityData?: any;
}

const TeseRedacaoPreview: React.FC<TeseRedacaoPreviewProps> = ({ content, activityData }) => {
  console.log('🎯 TeseRedacaoPreview - Conteúdo recebido:', content);

  if (!content) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum conteúdo disponível</h3>
          <p className="text-gray-500">A atividade ainda não foi gerada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-gray-900">
      {/* Cabeçalho */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {content.title || 'Tese da Redação'}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Treino de elaboração de teses para redação do ENEM
        </p>
      </div>

      {/* Informações principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-500" />
              Tema da Redação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">{content.temaRedacao}</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-500" />
              Objetivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">{content.objetivo}</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="h-4 w-4 text-orange-500" />
              Nível de Dificuldade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{content.nivelDificuldade}</Badge>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-orange-500" />
              Competências ENEM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">{content.competenciasENEM}</p>
          </CardContent>
        </Card>
      </div>

      {/* Contexto Adicional */}
      {content.contextoAdicional && (
        <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg">Contexto Adicional</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">{content.contextoAdicional}</p>
          </CardContent>
        </Card>
      )}

      {/* Teses Sugeridas */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Teses Sugeridas
        </h2>
        {content.tesesSugeridas?.map((tese: any, index: number) => (
          <Card key={index} className="mb-4 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Tese {tese.id}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Tese:</h3>
                <p className="text-gray-700 dark:text-gray-300 italic">"{tese.tese}"</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Argumentos:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {tese.argumentos?.map((arg: string, i: number) => (
                    <li key={i} className="text-gray-700 dark:text-gray-300">{arg}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Explicação:</h3>
                <p className="text-gray-700 dark:text-gray-300">{tese.explicacao}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">Pontos Fortes:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {tese.pontosFortres?.map((ponto: string, i: number) => (
                      <li key={i} className="text-gray-700 dark:text-gray-300">{ponto}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-orange-600 dark:text-orange-400 mb-2">Pontos a Melhorar:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {tese.pontosMelhorar?.map((ponto: string, i: number) => (
                      <li key={i} className="text-gray-700 dark:text-gray-300">{ponto}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dicas Gerais */}
      {content.dicasGerais && (
        <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg">Dicas Gerais</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              {content.dicasGerais.map((dica: string, i: number) => (
                <li key={i} className="text-gray-700 dark:text-gray-300">{dica}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Critérios de Avaliação */}
      {content.criteriosAvaliacao && (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg">Critérios de Avaliação ENEM</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Competência II:</h3>
              <p className="text-gray-700 dark:text-gray-300">{content.criteriosAvaliacao.competenciaII}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Competência III:</h3>
              <p className="text-gray-700 dark:text-gray-300">{content.criteriosAvaliacao.competenciaIII}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeseRedacaoPreview;
