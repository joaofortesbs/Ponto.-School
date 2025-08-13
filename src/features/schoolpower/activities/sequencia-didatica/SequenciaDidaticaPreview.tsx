
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BookOpen, 
  Clock, 
  Target, 
  Users, 
  Calendar,
  RefreshCw,
  Grid,
  ChevronRight,
  Play,
  CheckCircle,
  FileText,
  Award
} from 'lucide-react';
import { SequenciaDidaticaCompleta, AulaData, DiagnosticoData } from './SequenciaDidaticaGenerator';

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

  if (!data || !data.aulas || data.aulas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          Sequência Didática não gerada
        </h3>
        <p className="text-gray-500 mb-4">
          Configure os campos necessários e clique em "Construir Atividade" para gerar sua sequência didática.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header Flutuante */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {data.metadados.tituloTemaAssunto}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {data.metadados.disciplina} • {data.metadados.anoSerie}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'cards' ? 'grid' : 'cards')}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <Grid className="h-4 w-4 mr-2" />
              {viewMode === 'cards' ? 'Ver Grade' : 'Ver Cards'}
            </Button>
            
            {onRegenerate && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRegenerate}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerar
              </Button>
            )}
          </div>
        </div>

        {/* Menu Flutuante de Informações */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Objetivos */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onEditObjectives}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Objetivos</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                {data.metadados.objetivosAprendizagem}
              </p>
            </CardContent>
          </Card>

          {/* Contadores */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Estrutura</span>
              </div>
              <div className="flex gap-2 text-xs">
                <Badge variant="secondary">{data.aulas.length} Aulas</Badge>
                <Badge variant="secondary">{data.diagnosticos.length} Diagnósticos</Badge>
                <Badge variant="secondary">{data.avaliacoes.length} Avaliações</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Cronograma */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Cronograma</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {data.cronogramaSugerido.duracao} • {data.cronogramaSugerido.distribuicao}
              </p>
            </CardContent>
          </Card>

          {/* Público-alvo */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Público-alvo</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                {data.metadados.publicoAlvo}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-auto p-4">
        <Tabs defaultValue="sequencia" className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sequencia">Sequência</TabsTrigger>
            <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
            <TabsTrigger value="recursos">Recursos</TabsTrigger>
          </TabsList>

          <TabsContent value="sequencia" className="mt-4 space-y-4">
            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Cards de Aulas */}
                {data.aulas.map((aula, index) => (
                  <Dialog key={aula.id}>
                    <DialogTrigger asChild>
                      <Card className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <Badge className="bg-blue-100 text-blue-800">
                              Aula {aula.ordem}
                            </Badge>
                            <Clock className="h-4 w-4 text-gray-500" />
                          </div>
                          <CardTitle className="text-sm font-medium line-clamp-2">
                            {aula.titulo}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
                            {aula.objetivoEspecifico}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {aula.tempoEstimado}
                            </span>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Play className="h-5 w-5 text-blue-600" />
                          {aula.titulo}
                        </DialogTitle>
                      </DialogHeader>
                      <AulaDetailModal aula={aula} />
                    </DialogContent>
                  </Dialog>
                ))}

                {/* Cards de Diagnósticos */}
                {data.diagnosticos.map((diagnostico) => (
                  <Card key={diagnostico.id} className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Diagnóstico
                        </Badge>
                        <FileText className="h-4 w-4 text-yellow-600" />
                      </div>
                      <CardTitle className="text-sm font-medium">
                        {diagnostico.titulo}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {diagnostico.tempoEstimado}
                      </p>
                      <Button size="sm" variant="outline" className="w-full">
                        Ver Detalhes
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                {/* Cards de Avaliações */}
                {data.avaliacoes.map((avaliacao) => (
                  <Card key={avaliacao.id} className="border-green-200 bg-green-50 dark:bg-green-900/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-green-100 text-green-800">
                          Avaliação
                        </Badge>
                        <Award className="h-4 w-4 text-green-600" />
                      </div>
                      <CardTitle className="text-sm font-medium">
                        {avaliacao.titulo}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {avaliacao.tempoEstimado}
                      </p>
                      <Button size="sm" variant="outline" className="w-full">
                        Ver Detalhes
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              // Visualização em Grade
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold mb-4">Visualização em Grade</h3>
                <div className="space-y-2">
                  {data.aulas.map((aula, index) => (
                    <div key={aula.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {aula.ordem}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{aula.titulo}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{aula.tempoEstimado}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cronograma" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Cronograma Sugerido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Duração Total</h4>
                    <p className="text-gray-600 dark:text-gray-400">{data.cronogramaSugerido.duracao}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Distribuição</h4>
                    <p className="text-gray-600 dark:text-gray-400">{data.cronogramaSugerido.distribuicao}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Observações</h4>
                    <p className="text-gray-600 dark:text-gray-400">{data.cronogramaSugerido.observacoes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recursos" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recursos Necessários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.aulas.map((aula) => (
                    <div key={aula.id}>
                      <h4 className="font-medium mb-2">{aula.titulo}</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {aula.recursos.map((recurso, index) => (
                          <li key={index}>{recurso}</li>
                        ))}
                      </ul>
                      {aula !== data.aulas[data.aulas.length - 1] && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Componente para detalhes da aula
const AulaDetailModal: React.FC<{ aula: AulaData }> = ({ aula }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-2">Objetivo Específico</h3>
        <p className="text-gray-600 dark:text-gray-400">{aula.objetivoEspecifico}</p>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-2">Resumo/Contexto</h3>
        <p className="text-gray-600 dark:text-gray-400">{aula.resumoContexto}</p>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-4">Passo a Passo</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Introdução</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">{aula.passoAPasso.introducao}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 dark:text-green-400 mb-2">Desenvolvimento</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">{aula.passoAPasso.desenvolvimento}</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-orange-800 dark:text-orange-400 mb-2">Fechamento</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">{aula.passoAPasso.fechamento}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-2">Recursos Necessários</h3>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
          {aula.recursos.map((recurso, index) => (
            <li key={index}>{recurso}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-2">Atividade Prática</h3>
        <p className="text-gray-600 dark:text-gray-400">{aula.atividadePratica}</p>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">{aula.tempoEstimado}</span>
        </div>
        <Button size="sm">
          <CheckCircle className="h-4 w-4 mr-2" />
          Marcar como Concluída
        </Button>
      </div>
    </div>
  );
};

export default SequenciaDidaticaPreview;
