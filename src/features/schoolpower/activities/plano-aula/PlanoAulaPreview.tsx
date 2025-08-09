import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Clock,
  Users,
  Target,
  Lightbulb,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Eye,
  Plus,
  X,
  Presentation,
  UserCheck,
  Gamepad2,
  Users2,
  Brain,
  Search,
  PenTool,
  Zap,
  Activity,
  FileText,
  Play,
  Edit,
  Star,
  ChevronUp,
  GripVertical,
  Expand,
  Timer,
  Package
} from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

interface PlanoAulaPreviewProps {
  data: any;
  activityData?: any;
}

const PlanoAulaPreview: React.FC<PlanoAulaPreviewProps> = ({ data, activityData }) => {
  const [activeSection, setActiveSection] = useState<string>('visao-geral');
  const [showAddMethodology, setShowAddMethodology] = useState(false);
  const [selectedMethodologies, setSelectedMethodologies] = useState<string[]>([]);
  const [editingMethodologies, setEditingMethodologies] = useState(false);
  const [methodologies, setMethodologies] = useState([
    { id: 1, name: "Aula expositiva", icon: <FileText className="w-4 h-4" /> },
    { id: 2, name: "Atividades práticas", icon: <PenTool className="w-4 h-4" /> }
  ]);

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

  // Mapeamento de metodologias para ícones
  const methodologyIcons: { [key: string]: React.ElementType } = {
    'Aula Expositiva': Presentation,
    'Atividades Práticas': Gamepad2,
    'Estudo de Caso': Search,
    'Aprendizagem Baseada em Projetos': PenTool,
    'Aprendizagem Cooperativa': Users2,
    'Resolução de Problemas': Zap,
    'Simulação': Presentation, // Ícone genérico se não especificado
    'Discussão em Grupo': Users2,
    'Metacognição': Brain,
    'Aula Dialogada': UserCheck,
    'Outra Metodologia': Lightbulb,
  };

  const getMethodologyIcon = (methodologyName: string) => {
    return methodologyIcons[methodologyName] || Lightbulb; // Ícone padrão se não encontrado
  };

  // Lista de metodologias disponíveis para o dropdown
  const availableMethodologiesOptions = [
    { name: "Aula Expositiva", icon: Presentation },
    { name: "Atividades Práticas", icon: Gamepad2 },
    { name: "Estudo de Caso", icon: Search },
    { name: "Aprendizagem Baseada em Projetos", icon: PenTool },
    { name: "Aprendizagem Cooperativa", icon: Users2 },
    { name: "Resolução de Problemas", icon: Zap },
    { name: "Simulação", icon: Presentation },
    { name: "Discussão em Grupo", icon: Users2 },
    { name: "Metacognição", icon: Brain },
    { name: "Aula Dialogada", icon: UserCheck },
    // Adicione mais metodologias conforme necessário
  ];

  // Adiciona metodologias do plano original à lista de selecionadas se não estiverem vazias
  React.useEffect(() => {
    if (planoData?.metodologia?.alternativas && planoData.metodologia.alternativas.length > 0) {
      setSelectedMethodologies(planoData.metodologia.alternativas);
    } else {
      // Define metodologias padrão se não houver nenhuma no plano
      setSelectedMethodologies(['Aula Expositiva', 'Atividades Práticas']);
    }
  }, [planoData?.metodologia?.alternativas]);

  const addMethodology = (methodologyName: string) => {
    if (!selectedMethodologies.includes(methodologyName)) {
      setSelectedMethodologies([...selectedMethodologies, methodologyName]);
    }
    setShowAddMethodology(false); // Fecha o dropdown após adicionar
  };

  const removeMethodology = (methodologyNameToRemove: string) => {
    setSelectedMethodologies(selectedMethodologies.filter(name => name !== methodologyNameToRemove));
  };

  // Funções para a edição das metodologias no componente de atividade (se aplicável)
  const handleRemoveMethodology = (methodologyId: number) => {
    setMethodologies(prev => prev.filter(m => m.id !== methodologyId));
    toast({
      title: "Metodologia removida",
      description: "A metodologia foi removida com sucesso.",
    });
  };

  const handleAddMethodology = (methodologyName: string, icon: React.ReactNode) => {
    const newId = Math.max(...methodologies.map(m => m.id), 0) + 1;
    setMethodologies(prev => [...prev, { id: newId, name: methodologyName, icon }]);
    setShowAddMethodology(false);
    toast({
      title: "Metodologia adicionada",
      description: `${methodologyName} foi adicionada com sucesso.`,
    });
  };

  const availableMethodologiesForModal = [
    { name: "Aprendizagem baseada em projetos", icon: <Target className="w-4 h-4" /> },
    { name: "Sala de aula invertida", icon: <Brain className="w-4 h-4" /> },
    { name: "Gamificação", icon: <Star className="w-4 h-4" /> },
    { name: "Aprendizagem colaborativa", icon: <Users className="w-4 h-4" /> },
    { name: "Debate e discussão", icon: <Search className="w-4 h-4" /> },
    { name: "Estudo de caso", icon: <BookOpen className="w-4 h-4" /> },
    { name: "Experimentação", icon: <Activity className="w-4 h-4" /> },
    { name: "Demonstração prática", icon: <Play className="w-4 h-4" /> }
  ];


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
    },
    {
      id: 'avaliacao',
      label: 'Avaliação',
      icon: CheckCircle,
      description: 'Critérios de avaliação'
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
                <div className="bg-gradient-to-r from-orange-50 to-indigo-50 dark:from-orange-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700 mt-4">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Sugestões da IA
                  </h4>
                  <ul className="space-y-2">
                    {(plano.visao_geral?.sugestoes_ia || plano.sugestoes_ia || []).map((sugestao: string, index: number) => (
                      <li key={index} className="text-orange-700 dark:text-orange-300 text-sm flex items-start gap-2">
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
            {/* Objetivos de Aprendizagem */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    Objetivos de Aprendizagem
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/50"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Objetivo
                  </Button>
                </div>

                {/* Frase gerada pela IA */}
                <div className="mb-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-orange-800 dark:text-orange-200 leading-relaxed font-medium">
                        Compreender a estrutura e o funcionamento da língua portuguesa: Utilizar a norma padrão da língua em situações comunicativas. Produzir textos coerentes e coesos. Desenvolver a capacidade de análise crítica e reflexiva sobre a língua. Ampliar o vocabulário. Aprimorar a leitura e a escrita.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  {(plano.objetivos || []).map((objetivo: any, index: number) => (
                    <div
                      key={index}
                      className="group relative bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-700 rounded-2xl p-4 hover:shadow-md transition-all duration-200 hover:border-orange-300 dark:hover:border-orange-600"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{objetivo.descricao || objetivo}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          </div>
        );

      case 'metodologia':
        return (
          <div className="space-y-6">
            <Card className="border-l-4 border-l-orange-500 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  {plano.metodologia?.nome || 'Metodologia'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-5 rounded-xl border border-orange-200 dark:border-orange-700">
                  <p className="text-gray-800 dark:text-gray-200 text-base leading-relaxed">
                    {plano.metodologia?.descricao || 'Descrição da metodologia não disponível'}
                  </p>
                </div>

                {/* Metodologias Alternativas - Gerenciáveis */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Metodologias Alternativas</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingMethodologies(!editingMethodologies)}
                      className="text-orange-600 border-orange-300 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-600 dark:hover:bg-orange-900/30"
                    >
                      {editingMethodologies ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Salvar
                        </>
                      ) : (
                        <>
                          <Edit className="w-3 h-3 mr-1" />
                          Editar
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Lista de Metodologias Selecionadas */}
                  <div className="flex flex-wrap gap-2">
                    {selectedMethodologies.map((methodology, index) => {
                      const IconComponent = getMethodologyIcon(methodology);
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-700 rounded-full px-3 py-1"
                        >
                          <IconComponent className="h-3 w-3" />
                          <span className="text-sm">{methodology}</span>
                          {selectedMethodologies.length > 1 && (
                            <button
                              onClick={() => removeMethodology(methodology)}
                              className="ml-1 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Dropdown para Adicionar Metodologias */}
                  {editingMethodologies && (
                    <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Escolha uma metodologia para adicionar:
                      </h5>
                      <div className="grid grid-cols-2 gap-2">
                        {availableMethodologiesOptions
                          .filter(methodology => !selectedMethodologies.includes(methodology.name))
                          .map((methodology) => (
                            <button
                              key={methodology.name}
                              onClick={() => addMethodology(methodology.name)}
                              className="flex items-center gap-2 p-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                            >
                              <methodology.icon className="h-4 w-4 text-orange-500" />
                              {methodology.name}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Simulação da Aula */}
                <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <h4 className="font-medium text-green-900 dark:text-green-100">Simulação da Aula</h4>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {plano.metodologia?.simulacao_de_aula || 'Simulação disponível'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'desenvolvimento':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-600" />
                Etapas da Aula
              </h3>
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Etapa
              </Button>
            </div>

            <div className="space-y-4">
              {(plano.desenvolvimento || []).map((etapa: any, index: number) => (
                <EtapaCard 
                  key={`etapa-${index}`}
                  etapa={etapa} 
                  index={index} 
                  totalEtapas={plano.desenvolvimento?.length || 0}
                  onMoveUp={(idx) => console.log('Mover para cima:', idx)}
                  onMoveDown={(idx) => console.log('Mover para baixo:', idx)}
                  onEdit={(idx) => console.log('Editar etapa:', idx)}
                />
              ))}
            </div>

            {(!plano.desenvolvimento || plano.desenvolvimento.length === 0) && (
              <div className="text-center py-12">
                <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Nenhuma etapa encontrada
                </h4>
                <p className="text-gray-500 dark:text-gray-500">
                  As etapas de desenvolvimento serão exibidas aqui quando geradas pela IA
                </p>
              </div>
            )}
          </div>
        );

      case 'atividades':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-600" />
                Atividades Práticas
              </h3>
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Atividade
              </Button>
            </div>

            <div className="space-y-4">
              {(plano.atividades || []).map((atividade: any, index: number) => (
                <Card key={index} className="border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">{atividade.nome}</h4>
                          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 px-3 py-1">
                            {atividade.tipo}
                          </Badge>
                        </div>

                        {atividade.ref_objetivos && atividade.ref_objetivos.length > 0 && (
                          <div className="mb-3">
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">Objetivos relacionados:</span>
                            <div className="flex flex-wrap gap-2">
                              {atividade.ref_objetivos.map((obj: number) => (
                                <Badge key={obj} variant="outline" size="sm" className="border-orange-300 text-orange-700 bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:bg-orange-900/30">
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
                          <div className="bg-gradient-to-r from-orange-50 to-indigo-50 dark:from-orange-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                            <strong className="text-orange-800 dark:text-orange-200 block mb-2 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4" />
                              Sugestões da IA:
                            </strong>
                            <ul className="space-y-1">
                              {atividade.sugestoes_ia.map((sugestao: string, idx: number) => (
                                <li key={idx} className="text-orange-700 dark:text-orange-300 text-sm flex items-start gap-2">
                                  <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  {sugestao}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button size="sm" variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
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

      case 'avaliacao':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-orange-600" />
                  Avaliação
                </h3>
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Critério
                </Button>
            </div>
            <Card className="border-l-4 border-l-orange-500 shadow-lg">
              <CardContent className="space-y-6 p-6">
                <div className="bg-orange-50 dark:bg-orange-900/20 p-5 rounded-xl border border-orange-200 dark:border-orange-700">
                  <label className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-3 block">Critérios de Avaliação</label>
                  <p className="text-orange-700 dark:text-orange-300 text-base leading-relaxed">
                    {plano.avaliacao?.criterios || 'Critérios de avaliação não especificados'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 block">Instrumentos de Avaliação</label>
                    <div className="flex flex-wrap gap-2">
                      {(plano.avaliacao?.instrumentos || []).map((instrumento: string, index: number) => (
                        <Badge key={index} variant="outline" className="border-orange-300 text-orange-700 bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:bg-orange-900/30 px-3 py-1">
                          {instrumento}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 block">Feedback</label>
                    <p className="text-base text-gray-800 dark:text-gray-200">{plano.avaliacao?.feedback || 'Feedback não especificado'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Layout Principal */}
      <div className="flex flex-1 h-full">
        {/* Sidebar de Navegação */}
        <div className="w-80 bg-orange-50 dark:bg-orange-900/20 border-r border-orange-200 dark:border-orange-700 overflow-y-auto">
            <div className="p-6 space-y-6">
              {sidebarSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:text-orange-800 dark:hover:text-orange-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        isActive
                          ? 'bg-orange-500/20'
                          : 'bg-orange-100 dark:bg-orange-900/30 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/40'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          isActive ? 'text-orange-600' : 'text-orange-500 dark:text-orange-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          isActive ? 'text-orange-800 dark:text-orange-100' : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {section.label}
                        </h3>
                        <p className={`text-sm ${
                          isActive ? 'text-orange-700' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {section.description}
                        </p>
                      </div>
                      {isActive && (
                        <ChevronRight className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                  </button>
                );
              })}
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

      {/* Modal para adicionar metodologia */}
      {showAddMethodology && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddMethodology(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Adicionar Metodologia
              </h3>
              <button
                onClick={() => setShowAddMethodology(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableMethodologiesForModal
                .filter(available => !methodologies.some(current => current.name === available.name))
                .map((methodology, index) => (
                  <button
                    key={index}
                    onClick={() => handleAddMethodology(methodology.name, methodology.icon)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                      {methodology.icon}
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{methodology.name}</span>
                  </button>
                ))}
            </div>

            {availableMethodologiesForModal.filter(available => !methodologies.some(current => current.name === available.name)).length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                Todas as metodologias disponíveis já foram adicionadas.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para cada etapa do desenvolvimento
interface EtapaCardProps {
  etapa: any;
  index: number;
  totalEtapas: number;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onEdit: (index: number) => void;
}

const EtapaCard: React.FC<EtapaCardProps> = ({ 
  etapa, 
  index, 
  totalEtapas, 
  onMoveUp, 
  onMoveDown, 
  onEdit 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Função para obter ícone do tipo de interação
  const getTipoInteracaoIcon = (tipo: string) => {
    const tipoLower = tipo?.toLowerCase() || '';
    
    if (tipoLower.includes('apresentação') || tipoLower.includes('exposição')) {
      return <Presentation className="w-4 h-4" />;
    } else if (tipoLower.includes('prática') || tipoLower.includes('atividade')) {
      return <Gamepad2 className="w-4 h-4" />;
    } else if (tipoLower.includes('discussão') || tipoLower.includes('debate')) {
      return <Users2 className="w-4 h-4" />;
    } else if (tipoLower.includes('interativa') || tipoLower.includes('participativa')) {
      return <UserCheck className="w-4 h-4" />;
    } else if (tipoLower.includes('avaliação') || tipoLower.includes('avaliativa')) {
      return <CheckCircle className="w-4 h-4" />;
    } else {
      return <Activity className="w-4 h-4" />;
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
    console.log(`Reordenar: ${draggedIndex} para ${index}`);
    // Aqui implementaria a lógica de reordenação
  };

  return (
    <Card 
      className={`relative border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-all duration-200 cursor-move ${
        isDragging ? 'opacity-50 scale-105' : ''
      }`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Drag Handle e Número da Etapa */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
              {etapa.etapa || index + 1}
            </div>
            <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-grab" />
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1">
            {/* Header da Etapa */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 mr-4">
                <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">
                  {etapa.titulo}
                </h4>
                
                {/* Tags de Informação */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge 
                    variant="outline" 
                    className="border-blue-300 text-blue-700 bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:bg-blue-900/30 px-3 py-1 flex items-center gap-1"
                  >
                    {getTipoInteracaoIcon(etapa.tipo_interacao)}
                    {etapa.tipo_interacao}
                  </Badge>
                  
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    {etapa.tempo_estimado}
                  </Badge>

                  {etapa.recurso_gerado && (
                    <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:bg-purple-900/30 px-3 py-1 flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {etapa.recurso_gerado}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Controles de Ação */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMoveUp(index)}
                    disabled={index === 0}
                    className="h-8 w-8 p-0"
                    title="Mover para cima"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMoveDown(index)}
                    disabled={index === totalEtapas - 1}
                    className="h-8 w-8 p-0"
                    title="Mover para baixo"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(index)}
                  className="border-orange-300 text-orange-600 hover:bg-orange-50 px-2"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Editar
                </Button>
              </div>
            </div>

            {/* Descrição */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
              <p className={`text-gray-800 dark:text-gray-200 leading-relaxed ${
                !isExpanded && etapa.descricao?.length > 150 ? 'line-clamp-3' : ''
              }`}>
                {etapa.descricao}
              </p>
              
              {etapa.descricao?.length > 150 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-2 p-0 h-auto text-orange-600 hover:text-orange-700"
                >
                  <Expand className="w-4 h-4 mr-1" />
                  {isExpanded ? 'Recolher' : 'Expandir'}
                </Button>
              )}
            </div>

            {/* Nota Privada do Professor */}
            {etapa.nota_privada_professor && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-700 mb-4">
                <div className="flex items-start gap-2">
                  <Eye className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-amber-800 dark:text-amber-200 block mb-1 text-sm">
                      Nota privada do professor:
                    </strong>
                    <p className="text-amber-700 dark:text-amber-300 text-sm">
                      {etapa.nota_privada_professor}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex gap-2 flex-wrap">
              <Button 
                size="sm" 
                variant="outline" 
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <FileText className="w-4 h-4 mr-2" />
                Gerar Slides
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                className="border-green-300 text-green-600 hover:bg-green-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Gerar Recurso
              </Button>

              <Button 
                size="sm" 
                variant="outline" 
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <Play className="w-4 h-4 mr-2" />
                Simular Etapa
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanoAulaPreview;