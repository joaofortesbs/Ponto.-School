
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Target, Users, Clock, Calendar, CheckCircle, FileText, Lightbulb } from 'lucide-react';

interface SequenciaDidaticaPreviewProps {
  data: any;
  activityData?: any;
  isBuilt?: boolean;
}

const SequenciaDidaticaPreview: React.FC<SequenciaDidaticaPreviewProps> = ({ 
  data, 
  activityData,
  isBuilt = false 
}) => {
  console.log('📚 SequenciaDidaticaPreview - Dados recebidos:', { data, activityData, isBuilt });

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
        <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Sequência Didática não gerada
        </h4>
        <p className="text-gray-500 dark:text-gray-500">
          Configure os campos necessários e clique em "Construir Atividade" para gerar sua sequência didática.
        </p>
      </div>
    );
  }

  // Processar dados baseado na estrutura recebida
  const sequenciaData = data.metadados || data;
  const aulas = data.aulas || [];
  const diagnosticos = data.diagnosticos || [];
  const avaliacoes = data.avaliacoes || [];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 overflow-y-auto h-full">
      {/* Cabeçalho */}
      <div className="text-center border-b pb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <BookOpen className="text-orange-500" size={28} />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Sequência Didática
          </h1>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
          {sequenciaData.tituloTemaAssunto || 'Título do Tema/Assunto'}
        </h2>
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="outline">{sequenciaData.disciplina || 'Disciplina'}</Badge>
          <Badge variant="outline">{sequenciaData.anoSerie || 'Ano/Série'}</Badge>
          {sequenciaData.quantidadeAulas && (
            <Badge variant="secondary">{sequenciaData.quantidadeAulas} aulas</Badge>
          )}
        </div>
      </div>

      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={20} />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sequenciaData.publicoAlvo && (
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Users size={16} />
                Público-alvo
              </h4>
              <p className="text-gray-600 dark:text-gray-300">{sequenciaData.publicoAlvo}</p>
            </div>
          )}

          {sequenciaData.objetivosAprendizagem && (
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Target size={16} />
                Objetivos de Aprendizagem
              </h4>
              <p className="text-gray-600 dark:text-gray-300">{sequenciaData.objetivosAprendizagem}</p>
            </div>
          )}

          {sequenciaData.bnccCompetencias && (
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <CheckCircle size={16} />
                BNCC / Competências
              </h4>
              <p className="text-gray-600 dark:text-gray-300">{sequenciaData.bnccCompetencias}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estrutura da Sequência */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} />
            Estrutura da Sequência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{sequenciaData.quantidadeAulas || '0'}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Aulas</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{sequenciaData.quantidadeDiagnosticos || '0'}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Diagnósticos</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{sequenciaData.quantidadeAvaliacoes || '0'}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avaliações</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aulas */}
      {aulas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb size={20} />
              Aulas Planejadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {aulas.map((aula, index) => (
              <div key={aula.id || index} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">{aula.titulo}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{aula.objetivoEspecifico}</p>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <Clock size={12} />
                  {aula.tempoEstimado}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Cronograma */}
      {sequenciaData.cronograma && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} />
              Cronograma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">{sequenciaData.cronograma}</p>
          </CardContent>
        </Card>
      )}

      {/* Informações de Geração */}
      {data.generatedAt && (
        <div className="text-center text-xs text-gray-500 pt-4 border-t">
          Sequência didática gerada em {new Date(data.generatedAt).toLocaleString('pt-BR')}
        </div>
      )}
    </div>
  );
};

export default SequenciaDidaticaPreview;
