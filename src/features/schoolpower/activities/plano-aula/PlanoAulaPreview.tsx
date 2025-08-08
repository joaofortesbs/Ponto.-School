import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Activity,
  CheckCircle,
  GraduationCap
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
    fullData: planoData,
    isFromGemini: planoData?.titulo && planoData?.visao_geral && planoData?.objetivos,
    hasRealContent: planoData && typeof planoData === 'object' && Object.keys(planoData).length > 5
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

  if (!planoData || (typeof planoData === 'object' && Object.keys(planoData).length <= 2)) {
    console.log('⚠️ PlanoAulaPreview - Dados vazios ou inválidos, exibindo estado vazio');
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Plano de Aula não gerado
        </h3>
        <p className="text-gray-500 dark:text-gray-500 mb-4">
          Preencha os campos e clique em "Construir Atividade" para gerar o plano de aula personalizado
        </p>
        <div className="text-sm text-gray-400 dark:text-gray-600">
          O sistema utilizará IA Gemini para criar um plano completo e personalizado
        </div>
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

  // Seções de navegação lateral
  const sidebarSections = [
    {
      id: 'visao-geral',
      label: 'Visão Geral',
      icon: BookOpen,
      description: 'Informações gerais do plano'
    },
    {
      id: 'objetivos',
      label: 'Objetivos',
      icon: Target,
      description: 'Objetivos de aprendizagem'
    },
    {
      id: 'metodologia',
      label: 'Metodologia',
      icon: Brain,
      description: 'Abordagem pedagógica'
    },
    {
      id: 'desenvolvimento',
      label: 'Desenvolvimento',
      icon: Activity,
      description: 'Etapas da aula'
    },
    {
      id: 'atividades',
      label: 'Atividades',
      icon: Play,
      description: 'Atividades práticas'
    }
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'visao-geral':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-xl border border-orange-200 dark:border-orange-700">
              <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100 mb-4 flex items-center gap-3">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                Informações Gerais
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Disciplina</label>
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{plano.visao_geral?.disciplina || plano.disciplina}</p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Série/Ano</label>
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{plano.visao_geral?.serie || plano.serie}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Tempo</label>
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{plano.visao_geral?.tempo || plano.tempo}</p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Metodologia</label>
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{plano.visao_geral?.metodologia || plano.metodologia}</p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 block">Recursos Necessários</label>
                <div className="flex flex-wrap gap-2">
                  {(plano.visao_geral?.recursos || plano.recursos || []).map((recurso: string, index: number) => (
                    <Badge key={index} variant="outline" className="border-orange-300 text-orange-700 bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:bg-orange-900/30 px-3 py-1">
                      {recurso}
                    </Badge>
                  ))}
                </div>
              </div>

              {(plano.visao_geral?.sugestoes_ia || plano.sugestoes_ia) && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700 mt-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Sugestões da IA
                  </h4>
                  <ul className="space-y-2">
                    {(plano.visao_geral?.sugestoes_ia || plano.sugestoes_ia || []).map((sugestao: string, index: number) => (
                      <li key={index} className="text-blue-700 dark:text-blue-300 text-sm flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {sugestao}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );

      case 'objetivos':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                Objetivos de Aprendizagem
              </h3>
              <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Objetivo
              </Button>
            </div>

            <div className="space-y-4">
              {(plano.objetivos || []).map((objetivo: any, index: number) => (
                <Card key={index} className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className="bg-green-500 text-white font-medium px-3 py-1">Objetivo {index + 1}</Badge>
                          {objetivo.habilidade_bncc && (
                            <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50 dark:border-green-600 dark:text-green-300 dark:bg-green-900/30">
                              {objetivo.habilidade_bncc}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 mb-3 text-base leading-relaxed">{objetivo.descricao}</p>

                        {objetivo.atividade_relacionada && (
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <strong className="text-gray-800 dark:text-gray-200">Atividade relacionada:</strong> {objetivo.atividade_relacionada}
                            </p>
                          </div>
                        )}

                        {objetivo.sugestao_reescrita && (
                          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700">
                            <strong className="text-yellow-800 dark:text-yellow-200 block mb-1">Sugestão de reescrita:</strong>
                            <p className="text-yellow-700 dark:text-yellow-300 text-sm">{objetivo.sugestao_reescrita}</p>
                          </div>
                        )}
                      </div>
                      <Button size="sm" variant="outline" className="ml-4 border-green-300 text-green-600 hover:bg-green-50">
                        Gerar Atividade
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'metodologia':
        return (
          <div className="space-y-6">
            <Card className="border-l-4 border-l-purple-500 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  {plano.metodologia?.nome || 'Metodologia'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-5 rounded-xl border border-purple-200 dark:border-purple-700">
                  <p className="text-gray-800 dark:text-gray-200 text-base leading-relaxed">
                    {plano.metodologia?.descricao || 'Descrição da metodologia não disponível'}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white flex-shrink-0">
                    <Play className="w-4 h-4 mr-2" />
                    Simular Aula
                  </Button>
                  <Button size="sm" variant="outline" className="border-purple-300 text-purple-600 hover:bg-purple-50">
                    <Eye className="w-4 h-4 mr-2" />
                    Vídeo Explicativo
                  </Button>
                </div>

                {plano.metodologia?.alternativas && plano.metodologia.alternativas.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Metodologias Alternativas</h4>
                    <div className="flex flex-wrap gap-2">
                      {plano.metodologia.alternativas.map((alt: string, index: number) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="cursor-pointer hover:bg-purple-50 border-purple-300 text-purple-700 transition-colors"
                        >
                          {alt}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {plano.metodologia?.simulacao_de_aula && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Simulação da Aula
                    </h4>
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      {plano.metodologia.simulacao_de_aula}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'desenvolvimento':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                Etapas de Desenvolvimento
              </h3>
              <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Etapa
              </Button>
            </div>

            <div className="space-y-6">
              {(plano.desenvolvimento || []).map((etapa: any, index: number) => (
                <Card key={index} className="relative border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                          {etapa.etapa || index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100">{etapa.titulo}</h4>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:bg-blue-900/30 px-3 py-1">
                              {etapa.tipo_interacao}
                            </Badge>
                            <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 px-3 py-1">
                              {etapa.tempo_estimado}
                            </Badge>
                          </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
                          <p className="text-gray-800 dark:text-gray-200 text-base leading-relaxed">{etapa.descricao}</p>
                        </div>

                        {etapa.recurso_gerado && (
                          <div className="bg-white dark:bg-gray-700 p-3 rounded-lg mb-3 border border-gray-200 dark:border-gray-600">
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Recurso gerado: </span>
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{etapa.recurso_gerado}</span>
                          </div>
                        )}

                        {etapa.nota_privada_professor && (
                          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700 mb-4">
                            <strong className="text-yellow-800 dark:text-yellow-200 block mb-2">Nota para o professor:</strong>
                            <p className="text-yellow-700 dark:text-yellow-300 text-sm">{etapa.nota_privada_professor}</p>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <Button size="sm" variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                            <FileText className="w-4 h-4 mr-2" />
                            Gerar Slides
                          </Button>
                          <Button size="sm" variant="outline" className="border-green-300 text-green-600 hover:bg-green-50">
                            <Plus className="w-4 h-4 mr-2" />
                            Gerar Recurso
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'atividades':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <div className="p-2 bg-indigo-500 rounded-lg">
                  <Play className="w-5 h-5 text-white" />
                </div>
                Atividades da Aula
              </h3>
              <Button size="sm" className="bg-indigo-500 hover:bg-indigo-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Atividade
              </Button>
            </div>

            <div className="space-y-4">
              {(plano.atividades || []).map((atividade: any, index: number) => (
                <Card key={index} className="border-l-4 border-l-indigo-500 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">{atividade.nome}</h4>
                          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 px-3 py-1">
                            {atividade.tipo}
                          </Badge>
                        </div>

                        {atividade.ref_objetivos && atividade.ref_objetivos.length > 0 && (
                          <div className="mb-3">
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">Objetivos relacionados:</span>
                            <div className="flex flex-wrap gap-2">
                              {atividade.ref_objetivos.map((obj: number) => (
                                <Badge key={obj} variant="outline" size="sm" className="border-indigo-300 text-indigo-700 bg-indigo-50 dark:border-indigo-600 dark:text-indigo-300 dark:bg-indigo-900/30">
                                  Objetivo {obj}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {atividade.visualizar_como_aluno && (
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <strong className="text-gray-800 dark:text-gray-200">Experiência do aluno:</strong> {atividade.visualizar_como_aluno}
                            </p>
                          </div>
                        )}

                        {atividade.sugestoes_ia && atividade.sugestoes_ia.length > 0 && (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                            <strong className="text-blue-800 dark:text-blue-200 block mb-2 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4" />
                              Sugestões da IA:
                            </strong>
                            <ul className="space-y-1">
                              {atividade.sugestoes_ia.map((sugestao: string, idx: number) => (
                                <li key={idx} className="text-blue-700 dark:text-blue-300 text-sm flex items-start gap-2">
                                  <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  {sugestao}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button size="sm" variant="outline" className="border-indigo-300 text-indigo-600 hover:bg-indigo-50">
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar
                        </Button>
                        <Button size="sm" variant="outline" className="border-gray-300 text-gray-600 hover:bg-gray-50">
                          Substituir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Layout Principal */}
      <div className="flex flex-1 h-[calc(100vh-140px)]">
        {/* Sidebar de Navegação */}
        <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="p-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Seções do Plano</h2>
            <div className="space-y-3">
              {sidebarSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white shadow-lg transform scale-[1.02]'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        isActive 
                          ? 'bg-white/20' 
                          : 'bg-gray-200 dark:bg-gray-700 group-hover:bg-gray-300 dark:group-hover:bg-gray-600'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          isActive ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {section.label}
                        </h3>
                        <p className={`text-sm ${
                          isActive ? 'text-orange-100' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {section.description}
                        </p>
                      </div>
                      {isActive && (
                        <ChevronRight className="w-5 h-5 text-white" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Área de Conteúdo Principal */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="p-8">
              <Card className="shadow-xl border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                  {renderSectionContent()}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanoAulaPreview;