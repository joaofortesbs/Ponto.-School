
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Target, 
  Users, 
  Clock, 
  Lightbulb, 
  Play, 
  FileText, 
  Download,
  Eye,
  Plus,
  ChevronRight,
  Brain,
  Activity
} from 'lucide-react';

interface PlanoAulaPreviewProps {
  data: any;
  activityData?: any;
}

const PlanoAulaPreview: React.FC<PlanoAulaPreviewProps> = ({ data, activityData }) => {
  const [activeSection, setActiveSection] = useState<string>('visao-geral');

  console.log('🔍 PlanoAulaPreview - Data recebida:', data);
  console.log('🔍 PlanoAulaPreview - ActivityData recebida:', activityData);

  // Tenta usar data primeiro, depois activityData, e por último dados padrão
  const planoData = data || activityData;

  console.log('📚 PlanoAulaPreview - Estrutura dos dados:', {
    hasData: !!planoData,
    hasVisaoGeral: planoData?.visao_geral,
    hasTitle: planoData?.titulo || planoData?.title,
    dataStructure: planoData ? Object.keys(planoData) : [],
    fullData: planoData
  });

  console.log('🎯 PlanoAulaPreview - Análise detalhada dos dados:');
  console.log('  - Título:', planoData?.titulo || planoData?.title);
  console.log('  - Descrição:', planoData?.descricao || planoData?.description);
  console.log('  - Disciplina:', planoData?.disciplina || planoData?.visao_geral?.disciplina);
  console.log('  - Tema:', planoData?.tema || planoData?.visao_geral?.tema);
  console.log('  - Série:', planoData?.serie || planoData?.visao_geral?.serie);
  console.log('  - Tempo:', planoData?.tempo || planoData?.visao_geral?.tempo);
  console.log('  - Metodologia:', planoData?.metodologia || planoData?.visao_geral?.metodologia);
  console.log('  - Recursos:', planoData?.recursos || planoData?.visao_geral?.recursos);
  console.log('  - Objetivos:', planoData?.objetivos);
  console.log('  - Materiais:', planoData?.materiais);
  console.log('  - Observações:', planoData?.observacoes);
  console.log('  - Competências:', planoData?.competencias);
  console.log('  - Contexto:', planoData?.contexto);

  if (!planoData || (typeof planoData === 'object' && Object.keys(planoData).length === 0)) {
    console.log('⚠️ PlanoAulaPreview - Dados vazios ou inválidos, exibindo estado vazio');
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Plano de Aula não gerado
        </h3>
        <p className="text-gray-500 dark:text-gray-500">
          Preencha os campos e clique em "Construir Atividade" para gerar o plano de aula
        </p>
      </div>
    );
  }

  // Se não tem estrutura de plano completo, cria uma estrutura básica
  let plano = planoData;
  if (!plano.visao_geral) {
    console.log('🔨 PlanoAulaPreview - Criando estrutura básica do plano');
    
    plano = {
      titulo: plano.titulo || plano.title || 'Plano de Aula',
      descricao: plano.descricao || plano.description || 'Descrição do plano de aula',
      visao_geral: {
        disciplina: plano.disciplina || plano.subject || 'Disciplina',
        tema: plano.tema || plano.theme || plano.titulo || plano.title || 'Tema',
        serie: plano.serie || plano.anoEscolaridade || plano.schoolYear || 'Série',
        tempo: plano.tempo || plano.tempoLimite || plano.timeLimit || 'Tempo',
        metodologia: plano.metodologia || plano.tipoAula || plano.difficultyLevel || 'Metodologia',
        recursos: plano.recursos || (plano.materiais ? [plano.materiais] : ['Recursos não especificados']),
        sugestoes_ia: ['Plano de aula personalizado']
      },
      objetivos: plano.objetivos ? (Array.isArray(plano.objetivos) ? plano.objetivos.map(obj => ({
        descricao: typeof obj === 'string' ? obj : obj.descricao || obj,
        habilidade_bncc: plano.competencias || 'BNCC não especificada',
        sugestao_reescrita: '',
        atividade_relacionada: ''
      })) : [{
        descricao: plano.objetivos,
        habilidade_bncc: plano.competencias || 'BNCC não especificada',
        sugestao_reescrita: '',
        atividade_relacionada: ''
      }]) : [{
        descricao: plano.objetivos || 'Objetivo não especificado',
        habilidade_bncc: plano.competencias || 'BNCC não especificada',
        sugestao_reescrita: '',
        atividade_relacionada: ''
      }],
      metodologia: {
        nome: plano.metodologia || plano.tipoAula || plano.difficultyLevel || 'Metodologia Ativa',
        descricao: plano.descricaoMetodologia || plano.descricao || plano.description || 'Descrição da metodologia',
        alternativas: ['Aula expositiva', 'Atividades práticas'],
        simulacao_de_aula: 'Simulação disponível',
        explicacao_em_video: 'Video explicativo disponível'
      },
      desenvolvimento: plano.desenvolvimento || [
        {
          etapa: 1,
          titulo: 'Introdução',
          descricao: 'Apresentação do tema',
          tipo_interacao: 'Exposição',
          tempo_estimado: '15 min',
          recurso_gerado: 'Slides',
          nota_privada_professor: 'Contextualizar o tema'
        },
        {
          etapa: 2,
          titulo: 'Desenvolvimento',
          descricao: 'Explicação do conteúdo principal',
          tipo_interacao: 'Interativa',
          tempo_estimado: '25 min',
          recurso_gerado: 'Material didático',
          nota_privada_professor: 'Verificar compreensão'
        },
        {
          etapa: 3,
          titulo: 'Finalização',
          descricao: 'Síntese e avaliação',
          tipo_interacao: 'Avaliativa',
          tempo_estimado: '10 min',
          recurso_gerado: 'Atividade de fixação',
          nota_privada_professor: 'Aplicar avaliação'
        }
      ],
      atividades: plano.atividades || [
        {
          nome: 'Atividade Principal',
          tipo: 'Prática',
          ref_objetivos: [1],
          visualizar_como_aluno: 'Atividade interativa',
          sugestoes_ia: ['Personalize conforme necessário']
        }
      ],
      avaliacao: {
        criterios: plano.avaliacao || plano.observacoes || plano.evaluation || 'Critérios não especificados',
        instrumentos: ['Observação', 'Participação'],
        feedback: 'Feedback personalizado'
      },
      recursos_extras: {
        materiais_complementares: plano.materiais ? [plano.materiais] : ['Material não especificado'],
        tecnologias: ['Quadro', 'Projetor'],
        referencias: ['Bibliografia básica']
      }
    };
    
    console.log('✅ PlanoAulaPreview - Estrutura básica criada:', plano);
  };

  return (
    <div className="h-full overflow-hidden bg-white dark:bg-gray-900">
      {/* Header do Plano */}
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {plano.titulo || plano.title || plano.visao_geral?.tema || 'Plano de Aula'}
            </h1>
            <div className="flex items-center gap-4 text-orange-100">
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {plano.disciplina || plano.visao_geral?.disciplina || 'Disciplina'}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {plano.serie || plano.visao_geral?.serie || 'Série'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {plano.tempo || plano.visao_geral?.tempo || 'Tempo'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Eye className="w-4 h-4 mr-2" />
              Simular Aula
            </Button>
          </div>
        </div>
      </div>

      {/* Navegação por Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeSection} onValueChange={setActiveSection} className="h-full flex flex-col">
          <TabsList className="grid grid-cols-5 w-full bg-gray-100 dark:bg-gray-800">
            <TabsTrigger value="visao-geral" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="objetivos" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Objetivos
            </TabsTrigger>
            <TabsTrigger value="metodologia" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Metodologia
            </TabsTrigger>
            <TabsTrigger value="desenvolvimento" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Desenvolvimento
            </TabsTrigger>
            <TabsTrigger value="atividades" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Atividades
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Visão Geral */}
            <TabsContent value="visao-geral" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#FF6B00]" />
                    Visão Geral do Plano
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Disciplina</label>
                      <p className="text-lg font-semibold">{plano.visao_geral?.disciplina || plano.disciplina}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Série/Ano</label>
                      <p className="text-lg font-semibold">{plano.visao_geral?.serie || plano.serie}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Tempo</label>
                      <p className="text-lg font-semibold">{plano.visao_geral?.tempo || plano.tempo}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Metodologia</label>
                      <p className="text-lg font-semibold">{plano.visao_geral?.metodologia || plano.metodologia}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Recursos Necessários</label>
                    <div className="flex flex-wrap gap-2">
                      {(plano.visao_geral?.recursos || plano.recursos || []).map((recurso: string, index: number) => (
                        <Badge key={index} variant="outline" className="border-[#FF6B00] text-[#FF6B00]">
                          {recurso}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {(plano.visao_geral?.sugestoes_ia || plano.sugestoes_ia) && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Sugestões da IA
                      </h4>
                      <ul className="space-y-1">
                        {(plano.visao_geral?.sugestoes_ia || plano.sugestoes_ia || []).map((sugestao: string, index: number) => (
                          <li key={index} className="text-blue-700 dark:text-blue-300 text-sm">• {sugestao}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Objetivos */}
            <TabsContent value="objetivos" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Objetivos de Aprendizagem</h3>
                <Button size="sm" className="bg-[#FF6B00] hover:bg-[#FF8C40]">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Objetivo
                </Button>
              </div>
              
              {(plano.objetivos || []).map((objetivo: any, index: number) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-[#FF6B00] text-white">Objetivo {index + 1}</Badge>
                          {objetivo.habilidade_bncc && (
                            <Badge variant="outline">{objetivo.habilidade_bncc}</Badge>
                          )}
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 mb-2">{objetivo.descricao}</p>
                        {objetivo.atividade_relacionada && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Atividade relacionada:</strong> {objetivo.atividade_relacionada}
                          </p>
                        )}
                        {objetivo.sugestao_reescrita && (
                          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
                            <strong className="text-yellow-800 dark:text-yellow-200">Sugestão de reescrita:</strong>
                            <p className="text-yellow-700 dark:text-yellow-300">{objetivo.sugestao_reescrita}</p>
                          </div>
                        )}
                      </div>
                      <Button size="sm" variant="outline">
                        Gerar Atividade
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Metodologia */}
            <TabsContent value="metodologia" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#FF6B00]" />
                    {plano.metodologia?.nome || 'Metodologia'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    {plano.metodologia?.descricao || 'Descrição da metodologia não disponível'}
                  </p>

                  <div className="flex gap-2">
                    <Button size="sm" className="bg-[#FF6B00] hover:bg-[#FF8C40]">
                      <Play className="w-4 h-4 mr-2" />
                      Simular Aula
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      Vídeo Explicativo
                    </Button>
                  </div>

                  {plano.metodologia?.alternativas && plano.metodologia.alternativas.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Metodologias Alternativas</h4>
                      <div className="flex flex-wrap gap-2">
                        {plano.metodologia.alternativas.map((alt: string, index: number) => (
                          <Badge key={index} variant="outline" className="cursor-pointer hover:bg-gray-100">
                            {alt}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {plano.metodologia?.simulacao_de_aula && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Simulação da Aula</h4>
                      <p className="text-green-700 dark:text-green-300 text-sm">
                        {plano.metodologia.simulacao_de_aula}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Desenvolvimento */}
            <TabsContent value="desenvolvimento" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Etapas de Desenvolvimento</h3>
                <Button size="sm" className="bg-[#FF6B00] hover:bg-[#FF8C40]">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Etapa
                </Button>
              </div>

              {(plano.desenvolvimento || []).map((etapa: any, index: number) => (
                <Card key={index} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-[#FF6B00] text-white rounded-full flex items-center justify-center font-bold">
                          {etapa.etapa || index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-lg">{etapa.titulo}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{etapa.tipo_interacao}</Badge>
                            <Badge className="bg-blue-100 text-blue-800">{etapa.tempo_estimado}</Badge>
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-3">{etapa.descricao}</p>
                        
                        {etapa.recurso_gerado && (
                          <div className="mb-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Recurso: </span>
                            <span className="text-sm">{etapa.recurso_gerado}</span>
                          </div>
                        )}

                        {etapa.nota_privada_professor && (
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded text-sm">
                            <strong className="text-yellow-800 dark:text-yellow-200">Nota para o professor:</strong>
                            <p className="text-yellow-700 dark:text-yellow-300">{etapa.nota_privada_professor}</p>
                          </div>
                        )}

                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline">
                            <FileText className="w-4 h-4 mr-2" />
                            Gerar Slides
                          </Button>
                          <Button size="sm" variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Gerar Recurso
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Atividades */}
            <TabsContent value="atividades" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Atividades da Aula</h3>
                <Button size="sm" className="bg-[#FF6B00] hover:bg-[#FF8C40]">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Atividade
                </Button>
              </div>

              {(plano.atividades || []).map((atividade: any, index: number) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{atividade.nome}</h4>
                          <Badge className="bg-green-100 text-green-800">{atividade.tipo}</Badge>
                        </div>
                        
                        {atividade.ref_objetivos && atividade.ref_objetivos.length > 0 && (
                          <div className="mb-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Objetivos relacionados: </span>
                            <div className="flex gap-1 mt-1">
                              {atividade.ref_objetivos.map((obj: number) => (
                                <Badge key={obj} variant="outline" size="sm">Objetivo {obj}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {atividade.visualizar_como_aluno && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <strong>Experiência do aluno:</strong> {atividade.visualizar_como_aluno}
                          </p>
                        )}

                        {atividade.sugestoes_ia && atividade.sugestoes_ia.length > 0 && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-sm">
                            <strong className="text-blue-800 dark:text-blue-200">Sugestões da IA:</strong>
                            <ul className="mt-1">
                              {atividade.sugestoes_ia.map((sugestao: string, idx: number) => (
                                <li key={idx} className="text-blue-700 dark:text-blue-300">• {sugestao}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar
                        </Button>
                        <Button size="sm" variant="outline">
                          Substituir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default PlanoAulaPreview;
