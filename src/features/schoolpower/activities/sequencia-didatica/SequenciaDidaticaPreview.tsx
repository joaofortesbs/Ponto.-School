
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Target, 
  CheckCircle, 
  FileText, 
  Calendar,
  PlayCircle,
  Edit,
  Download,
  Copy
} from 'lucide-react';

export interface AulaData {
  numero: number;
  titulo: string;
  objetivo: string;
  conteudo: string;
  metodologia: string;
  recursos: string[];
  atividadePratica: string;
  avaliacao: string;
  tempoEstimado: string;
}

export interface DiagnosticoData {
  numero: number;
  titulo: string;
  objetivo: string;
  questoes: string[];
  criteriosAvaliacao: string;
  tempoEstimado: string;
}

export interface AvaliacaoData {
  numero: number;
  titulo: string;
  objetivo: string;
  formato: string;
  criterios: string[];
  tempoEstimado: string;
}

export interface SequenciaDidaticaCompleta {
  tituloTemaAssunto: string;
  anoSerie: string;
  disciplina: string;
  bnccCompetencias: string;
  publicoAlvo: string;
  objetivosAprendizagem: string;
  quantidadeAulas: string;
  quantidadeDiagnosticos: string;
  quantidadeAvaliacoes: string;
  cronograma: string;
  aulas: AulaData[];
  diagnosticos: DiagnosticoData[];
  avaliacoes: AvaliacaoData[];
  duracaoTotal: string;
  materiaisNecessarios: string[];
  competenciasDesenvolvidas: string[];
  generatedAt?: string;
  isGeneratedByAI?: boolean;
}

interface SequenciaDidaticaPreviewProps {
  data: SequenciaDidaticaCompleta;
  activityData?: any;
  onRegenerate?: () => void;
  onTransformToGrid?: () => void;
  onEditObjectives?: () => void;
}

const SequenciaDidaticaPreview: React.FC<SequenciaDidaticaPreviewProps> = ({
  data,
  activityData,
  onRegenerate,
  onTransformToGrid,
  onEditObjectives
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'grid'>('cards');
  const [selectedAula, setSelectedAula] = useState<AulaData | null>(null);
  const [selectedDiagnostico, setSelectedDiagnostico] = useState<DiagnosticoData | null>(null);

  console.log('🔍 SequenciaDidaticaPreview - Dados recebidos:', data);
  console.log('🔍 SequenciaDidaticaPreview - Tipo dos dados:', typeof data);
  console.log('🔍 SequenciaDidaticaPreview - Props activityData:', activityData);

  if (!data) {
    console.log('❌ SequenciaDidaticaPreview - Dados não encontrados');
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Sequência Didática não gerada
        </h3>
        <p className="text-gray-500 dark:text-gray-500 mb-4">
          Configure os campos necessários e clique em "Construir Atividade" para gerar sua sequência didática.
        </p>
      </div>
    );
  }

  // Validar se os dados são válidos
  if (typeof data !== 'object') {
    console.error('❌ SequenciaDidaticaPreview - Dados inválidos (não é objeto):', data);
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Erro nos dados da Sequência Didática
        </h3>
        <p className="text-gray-500 dark:text-gray-500 mb-4">
          Os dados da sequência didática estão corrompidos. Tente gerar novamente.
        </p>
      </div>
    );
  }

  // Verificar se tem aulas geradas
  const hasAulas = data.aulas && Array.isArray(data.aulas) && data.aulas.length > 0;
  const hasDiagnosticos = data.diagnosticos && Array.isArray(data.diagnosticos) && data.diagnosticos.length > 0;
  const hasAvaliacoes = data.avaliacoes && Array.isArray(data.avaliacoes) && data.avaliacoes.length > 0;

  console.log('📊 SequenciaDidaticaPreview - Status detalhado:', {
    hasAulas,
    hasDiagnosticos,
    hasAvaliacoes,
    aulasCount: data.aulas?.length || 0,
    diagnosticosCount: data.diagnosticos?.length || 0,
    avaliacoesCount: data.avaliacoes?.length || 0,
    aulasType: typeof data.aulas,
    aulasIsArray: Array.isArray(data.aulas),
    firstAula: data.aulas && data.aulas.length > 0 ? data.aulas[0] : null,
    allKeys: Object.keys(data),
    dataStructure: {
      titulo: !!data.tituloTemaAssunto,
      disciplina: !!data.disciplina,
      anoSerie: !!data.anoSerie,
      objetivos: !!data.objetivosAprendizagem
    }
  });

  return (
    <div className="h-full overflow-y-auto p-6 bg-white dark:bg-gray-900">
      {/* Header da Sequência Didática */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {data.tituloTemaAssunto || 'Sequência Didática'}
              </h1>
              <p className="text-sm text-gray-500">
                {data.disciplina} • {data.anoSerie}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onRegenerate}>
              <Edit className="h-4 w-4 mr-2" />
              Regenerar
            </Button>
            <Button variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copiar
            </Button>
          </div>
        </div>

        {/* Badges de informações */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            {data.duracaoTotal || `${data.quantidadeAulas} aulas`}
          </Badge>
          <Badge variant="secondary">
            <Users className="h-3 w-3 mr-1" />
            {data.publicoAlvo}
          </Badge>
          <Badge variant="secondary">
            <Target className="h-3 w-3 mr-1" />
            {data.quantidadeDiagnosticos} diagnósticos
          </Badge>
          <Badge variant="secondary">
            <CheckCircle className="h-3 w-3 mr-1" />
            {data.quantidadeAvaliacoes} avaliações
          </Badge>
        </div>

        {/* Objetivos de Aprendizagem */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Objetivos de Aprendizagem</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {data.objetivosAprendizagem}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de conteúdo */}
      <Tabs defaultValue="aulas" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="aulas">
            Aulas ({data.aulas?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="diagnosticos">
            Diagnósticos ({data.diagnosticos?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="avaliacoes">
            Avaliações ({data.avaliacoes?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="cronograma">
            Cronograma
          </TabsTrigger>
        </TabsList>

        {/* Tab de Aulas */}
        <TabsContent value="aulas" className="space-y-4">
          {hasAulas ? (
            <div className="grid gap-4">
              {data.aulas.map((aula, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Aula {aula.numero}: {aula.titulo}
                      </CardTitle>
                      <Badge variant="outline">
                        {aula.tempoEstimado}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-1">Objetivo</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {aula.objetivo}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-1">Conteúdo</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {aula.conteudo}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-1">Metodologia</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {aula.metodologia}
                        </p>
                      </div>

                      {aula.recursos && aula.recursos.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-1">Recursos Necessários</h4>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                            {aula.recursos.map((recurso, idx) => (
                              <li key={idx}>{recurso}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {aula.atividadePratica && (
                        <div>
                          <h4 className="font-medium text-sm mb-1">Atividade Prática</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {aula.atividadePratica}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button size="sm" variant="outline">
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma aula gerada ainda</p>
            </div>
          )}
        </TabsContent>

        {/* Tab de Diagnósticos */}
        <TabsContent value="diagnosticos" className="space-y-4">
          {hasDiagnosticos ? (
            <div className="grid gap-4">
              {data.diagnosticos.map((diagnostico, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Diagnóstico {diagnostico.numero}: {diagnostico.titulo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-1">Objetivo</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {diagnostico.objetivo}
                        </p>
                      </div>
                      
                      {diagnostico.questoes && diagnostico.questoes.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-1">Questões</h4>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {diagnostico.questoes.map((questao, idx) => (
                              <li key={idx}>{idx + 1}. {questao}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {diagnostico.tempoEstimado}
                        </Badge>
                        <Button size="sm" variant="outline">
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum diagnóstico gerado ainda</p>
            </div>
          )}
        </TabsContent>

        {/* Tab de Avaliações */}
        <TabsContent value="avaliacoes" className="space-y-4">
          {hasAvaliacoes ? (
            <div className="grid gap-4">
              {data.avaliacoes.map((avaliacao, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Avaliação {avaliacao.numero}: {avaliacao.titulo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-1">Objetivo</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {avaliacao.objetivo}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-1">Formato</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {avaliacao.formato}
                        </p>
                      </div>

                      {avaliacao.criterios && avaliacao.criterios.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-1">Critérios de Avaliação</h4>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                            {avaliacao.criterios.map((criterio, idx) => (
                              <li key={idx}>{criterio}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {avaliacao.tempoEstimado}
                        </Badge>
                        <Button size="sm" variant="outline">
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma avaliação gerada ainda</p>
            </div>
          )}
        </TabsContent>

        {/* Tab de Cronograma */}
        <TabsContent value="cronograma" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Cronograma da Sequência Didática
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.cronograma ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {data.cronograma}
                  </p>
                  
                  {/* Resumo visual do cronograma */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {data.quantidadeAulas}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Aulas</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {data.quantidadeDiagnosticos}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Diagnósticos</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {data.quantidadeAvaliacoes}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Avaliações</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Cronograma não definido</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Informações adicionais */}
      {data.bnccCompetencias && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Competências BNCC</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {data.bnccCompetencias}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Footer com informações de geração */}
      {data.generatedAt && (
        <div className="mt-6 pt-4 border-t text-xs text-gray-500 text-center">
          Sequência Didática gerada em {new Date(data.generatedAt).toLocaleString('pt-BR')}
          {data.isGeneratedByAI && ' • Gerado por IA'}
        </div>
      )}
    </div>
  );
};

export default SequenciaDidaticaPreview;
