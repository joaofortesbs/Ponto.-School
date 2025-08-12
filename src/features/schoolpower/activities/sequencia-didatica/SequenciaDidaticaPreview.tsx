import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Copy,
  GraduationCap,
  RotateCcw,
  Brain,
  Lightbulb,
  Play,
  Eye,
  Award
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
  const [selectedAvaliacao, setSelectedAvaliacao] = useState<AvaliacaoData | null>(null);
  const [activeTab, setActiveTab] = useState('visao-geral');

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

  if (selectedAula) {
    return (
      <div className="h-full overflow-y-auto p-6 bg-white dark:bg-gray-900">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedAula(null)}>
            <Play className="h-4 w-4 mr-2 rotate-180" />
            Voltar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar Aula
            </Button>
            <Button variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Copiar Aula
            </Button>
          </div>
        </div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-3">
              <PlayCircle className="h-6 w-6 text-blue-500" />
              {selectedAula.titulo}
            </CardTitle>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" /> Aula {selectedAula.numero}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {selectedAula.tempoEstimado}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <h4 className="font-semibold mb-1">Objetivo</h4>
              <p className="text-gray-600 dark:text-gray-400">{selectedAula.objetivo}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Conteúdo</h4>
              <p className="text-gray-600 dark:text-gray-400">{selectedAula.conteudo}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Metodologia</h4>
              <p className="text-gray-600 dark:text-gray-400">{selectedAula.metodologia}</p>
            </div>
            {selectedAula.recursos && selectedAula.recursos.length > 0 && (
              <div>
                <h4 className="font-semibold mb-1">Recursos Necessários</h4>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                  {selectedAula.recursos.map((recurso, idx) => (
                    <li key={idx}>{recurso}</li>
                  ))}
                </ul>
              </div>
            )}
            {selectedAula.atividadePratica && (
              <div>
                <h4 className="font-semibold mb-1">Atividade Prática</h4>
                <p className="text-gray-600 dark:text-gray-400">{selectedAula.atividadePratica}</p>
              </div>
            )}
            {selectedAula.avaliacao && (
              <div>
                <h4 className="font-semibold mb-1">Avaliação</h4>
                <p className="text-gray-600 dark:text-gray-400">{selectedAula.avaliacao}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedDiagnostico) {
    return (
      <div className="h-full overflow-y-auto p-6 bg-white dark:bg-gray-900">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedDiagnostico(null)}>
            <Play className="h-4 w-4 mr-2 rotate-180" />
            Voltar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar Diagnóstico
            </Button>
            <Button variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Copiar Diagnóstico
            </Button>
          </div>
        </div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-3">
              <Eye className="h-6 w-6 text-green-500" />
              {selectedDiagnostico.titulo}
            </CardTitle>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" /> Diagnóstico {selectedDiagnostico.numero}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {selectedDiagnostico.tempoEstimado}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <h4 className="font-semibold mb-1">Objetivo</h4>
              <p className="text-gray-600 dark:text-gray-400">{selectedDiagnostico.objetivo}</p>
            </div>
            {selectedDiagnostico.questoes && selectedDiagnostico.questoes.length > 0 && (
              <div>
                <h4 className="font-semibold mb-1">Questões</h4>
                <ul className="list-decimal list-inside text-gray-600 dark:text-gray-400 space-y-1">
                  {selectedDiagnostico.questoes.map((questao, idx) => (
                    <li key={idx}>{questao}</li>
                  ))}
                </ul>
              </div>
            )}
            {selectedDiagnostico.criteriosAvaliacao && (
              <div>
                <h4 className="font-semibold mb-1">Critérios de Avaliação</h4>
                <p className="text-gray-600 dark:text-gray-400">{selectedDiagnostico.criteriosAvaliacao}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedAvaliacao) {
    return (
      <div className="h-full overflow-y-auto p-6 bg-white dark:bg-gray-900">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedAvaliacao(null)}>
            <Play className="h-4 w-4 mr-2 rotate-180" />
            Voltar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar Avaliação
            </Button>
            <Button variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Copiar Avaliação
            </Button>
          </div>
        </div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-3">
              <Award className="h-6 w-6 text-purple-500" />
              {selectedAvaliacao.titulo}
            </CardTitle>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" /> Avaliação {selectedAvaliacao.numero}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {selectedAvaliacao.tempoEstimado}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <h4 className="font-semibold mb-1">Objetivo</h4>
              <p className="text-gray-600 dark:text-gray-400">{selectedAvaliacao.objetivo}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Formato</h4>
              <p className="text-gray-600 dark:text-gray-400">{selectedAvaliacao.formato}</p>
            </div>
            {selectedAvaliacao.criterios && selectedAvaliacao.criterios.length > 0 && (
              <div>
                <h4 className="font-semibold mb-1">Critérios de Avaliação</h4>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                  {selectedAvaliacao.criterios.map((criterio, idx) => (
                    <li key={idx}>{criterio}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-gray-900">
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          {/* Header da Sequência */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {data.tituloTemaAssunto}
                </h1>
                <div className="flex flex-wrap gap-3 mb-4">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    {data.disciplina}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {data.anoSerie}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {data.duracaoTotal}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                {onRegenerate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRegenerate}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Regenerar
                  </Button>
                )}
              </div>
            </div>

            {/* Estatísticas rápidas */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{data.aulas?.length || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Aulas</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{data.diagnosticos?.length || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Diagnósticos</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{data.avaliacoes?.length || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avaliações</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabs de Conteúdo */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
              <TabsTrigger value="aulas">Aulas</TabsTrigger>
              <TabsTrigger value="diagnosticos">Diagnósticos</TabsTrigger>
              <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
              <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
            </TabsList>

            <TabsContent value="visao-geral" className="space-y-6">
              {/* Informações Gerais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Informações Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Público-alvo:</h4>
                    <p className="text-gray-600 dark:text-gray-400">{data.publicoAlvo}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Objetivos de Aprendizagem:</h4>
                    <p className="text-gray-600 dark:text-gray-400">{data.objetivosAprendizagem}</p>
                  </div>
                  {data.bnccCompetencias && (
                    <div>
                      <h4 className="font-semibold mb-2">Competências BNCC:</h4>
                      <p className="text-gray-600 dark:text-gray-400">{data.bnccCompetencias}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Materiais e Competências */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Materiais Necessários
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {data.materiaisNecessarios?.map((material, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-gray-600 dark:text-gray-400">{material}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      Competências Desenvolvidas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {data.competenciasDesenvolvidas?.map((competencia, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-500" />
                          <span className="text-gray-600 dark:text-gray-400">{competencia}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="aulas" className="space-y-4">
              <div className="grid gap-4">
                {data.aulas?.map((aula, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedAula(aula)}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Play className="w-5 h-5" />
                          Aula {aula.numero}: {aula.titulo}
                        </span>
                        <Badge>{aula.tempoEstimado}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{aula.objetivo}</p>
                      <div className="flex flex-wrap gap-2">
                        {aula.recursos?.map((recurso, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {recurso}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="diagnosticos" className="space-y-4">
              <div className="grid gap-4">
                {data.diagnosticos?.map((diagnostico, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedDiagnostico(diagnostico)}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Eye className="w-5 h-5" />
                          {diagnostico.titulo}
                        </span>
                        <Badge variant="secondary">{diagnostico.tempoEstimado}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{diagnostico.objetivo}</p>
                      <div className="space-y-2">
                        <h5 className="font-medium">Questões:</h5>
                        <ul className="space-y-1">
                          {diagnostico.questoes?.map((questao, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                              • {questao}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="avaliacoes" className="space-y-4">
              <div className="grid gap-4">
                {data.avaliacoes?.map((avaliacao, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedAvaliacao(avaliacao)}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Award className="w-5 h-5" />
                          {avaliacao.titulo}
                        </span>
                        <Badge variant="secondary">{avaliacao.tempoEstimado}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{avaliacao.objetivo}</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Formato:</span>
                          <Badge variant="outline">{avaliacao.formato}</Badge>
                        </div>
                        <div>
                          <h5 className="font-medium mb-1">Critérios:</h5>
                          <ul className="space-y-1">
                            {avaliacao.criterios?.map((criterio, idx) => (
                              <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                                • {criterio}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="cronograma" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Cronograma da Sequência Didática
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">{data.cronograma}</p>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-semibold">Cronograma Detalhado:</h4>
                      {data.aulas?.map((aula, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                {aula.numero}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{aula.titulo}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">{aula.metodologia}</div>
                            </div>
                          </div>
                          <Badge variant="outline">{aula.tempoEstimado}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SequenciaDidaticaPreview;