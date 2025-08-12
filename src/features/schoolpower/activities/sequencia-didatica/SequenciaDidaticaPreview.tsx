import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Clock, 
  Target, 
  Users, 
  ChevronRight, 
  FileText, 
  CheckSquare,
  PlayCircle,
  Calendar,
  Award,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react';
import { SequenciaDidaticaCompleta, AulaData, DiagnosticoData, AvaliacaoData } from './SequenciaDidaticaGenerator';

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
        <Button variant="outline" onClick={onRegenerate} className="text-[#FF6B00] border-[#FF6B00]">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  const AulaDetailModal = ({ aula, onClose }: { aula: AulaData; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">{aula.titulo}</h3>
              <p className="text-gray-600 dark:text-gray-400">Aula {aula.numero}</p>
            </div>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h4 className="font-semibold mb-2 flex items-center">
              <Target className="h-4 w-4 mr-2 text-[#FF6B00]" />
              Objetivo
            </h4>
            <p className="text-gray-700 dark:text-gray-300">{aula.objetivo}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2 flex items-center">
              <FileText className="h-4 w-4 mr-2 text-[#FF6B00]" />
              Conteúdo
            </h4>
            <p className="text-gray-700 dark:text-gray-300">{aula.conteudo}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2 flex items-center">
              <PlayCircle className="h-4 w-4 mr-2 text-[#FF6B00]" />
              Metodologia
            </h4>
            <p className="text-gray-700 dark:text-gray-300">{aula.metodologia}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Recursos Necessários</h4>
            <div className="flex flex-wrap gap-2">
              {aula.recursos.map((recurso, index) => (
                <Badge key={index} variant="secondary">{recurso}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Atividade Prática</h4>
            <p className="text-gray-700 dark:text-gray-300">{aula.atividadePratica}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Avaliação</h4>
            <p className="text-gray-700 dark:text-gray-300">{aula.avaliacao}</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Tempo estimado: {aula.tempoEstimado}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {data.tituloTemaAssunto}
            </h1>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline">{data.disciplina}</Badge>
              <Badge variant="outline">{data.anoSerie}</Badge>
              <Badge variant="outline">{data.duracaoTotal}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            {onRegenerate && (
              <Button variant="outline" onClick={onRegenerate} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerar
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Informações Gerais */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-[#FF6B00]" />
              Informações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Público-alvo</h4>
                <p className="text-gray-700 dark:text-gray-300">{data.publicoAlvo}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">BNCC / Competências</h4>
                <p className="text-gray-700 dark:text-gray-300">{data.bnccCompetencias}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Objetivos de Aprendizagem</h4>
              <p className="text-gray-700 dark:text-gray-300">{data.objetivosAprendizagem}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {data.aulas?.length || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Aulas</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {data.diagnosticos?.length || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Diagnósticos</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {data.avaliacoes?.length || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avaliações</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <Tabs defaultValue="aulas" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="aulas">Aulas ({data.aulas?.length || 0})</TabsTrigger>
          <TabsTrigger value="diagnosticos">Diagnósticos ({data.diagnosticos?.length || 0})</TabsTrigger>
          <TabsTrigger value="avaliacoes">Avaliações ({data.avaliacoes?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="aulas" className="space-y-4">
          {data.aulas && data.aulas.length > 0 ? (
            <div className="grid gap-4">
              {data.aulas.map((aula, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{aula.titulo}</CardTitle>
                        <p className="text-gray-600 dark:text-gray-400">Aula {aula.numero}</p>
                      </div>
                      <Badge variant="outline" className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {aula.tempoEstimado}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{aula.objetivo}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-wrap gap-1">
                        {aula.recursos?.slice(0, 3).map((recurso, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {recurso}
                          </Badge>
                        ))}
                        {aula.recursos?.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{aula.recursos.length - 3}
                          </Badge>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedAula(aula)}
                        className="text-[#FF6B00] hover:text-[#FF8C40]"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma aula foi gerada ainda.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="diagnosticos" className="space-y-4">
          {data.diagnosticos && data.diagnosticos.length > 0 ? (
            <div className="grid gap-4">
              {data.diagnosticos.map((diagnostico, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{diagnostico.titulo}</CardTitle>
                        <p className="text-gray-600 dark:text-gray-400">Diagnóstico {diagnostico.numero}</p>
                      </div>
                      <Badge variant="outline" className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {diagnostico.tempoEstimado}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{diagnostico.objetivo}</p>
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Questões:</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        {diagnostico.questoes?.map((questao, i) => (
                          <li key={i}>{questao}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum diagnóstico foi gerado ainda.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="avaliacoes" className="space-y-4">
          {data.avaliacoes && data.avaliacoes.length > 0 ? (
            <div className="grid gap-4">
              {data.avaliacoes.map((avaliacao, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{avaliacao.titulo}</CardTitle>
                        <p className="text-gray-600 dark:text-gray-400">Avaliação {avaliacao.numero}</p>
                      </div>
                      <Badge variant="outline" className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {avaliacao.tempoEstimado}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{avaliacao.objetivo}</p>
                    <div className="space-y-2">
                      <p className="text-sm"><strong>Formato:</strong> {avaliacao.formato}</p>
                      <div>
                        <h5 className="font-medium text-sm mb-1">Critérios de Avaliação:</h5>
                        <div className="flex flex-wrap gap-1">
                          {avaliacao.criterios?.map((criterio, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {criterio}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma avaliação foi gerada ainda.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de detalhes da aula */}
      {selectedAula && (
        <AulaDetailModal 
          aula={selectedAula} 
          onClose={() => setSelectedAula(null)} 
        />
      )}
    </div>
  );
};

export default SequenciaDidaticaPreview;