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
  MessageSquare,
  Video,
  Mic,
  Group
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
  const [expandedSteps, setExpandedSteps] = useState<{ [key: number]: boolean }>({});
  const [draggedStep, setDraggedStep] = useState<number | null>(null);
  const [developmentSteps, setDevelopmentSteps] = useState<any[]>([]);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});


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
  console.log('  - Tema:', planoData?.tema || planoData?.theme || planoData?.titulo || planoData?.title);
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

  // Função para obter ícones baseados no tipo de interação
  const getInteractionIcon = (tipoInteracao: string) => {
    const lowerType = tipoInteracao.toLowerCase();
    if (lowerType.includes('apresentação') || lowerType.includes('exposição')) return Presentation;
    if (lowerType.includes('debate') || lowerType.includes('discussão')) return MessageSquare;
    if (lowerType.includes('vídeo') || lowerType.includes('video')) return Video;
    if (lowerType.includes('dinâmica') || lowerType.includes('grupo')) return Group;
    if (lowerType.includes('prática') || lowerType.includes('atividade')) return Gamepad2;
    if (lowerType.includes('interativo') || lowerType.includes('interativa')) return Activity;
    return Play; // Ícone padrão
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

  // Inicializar etapas de desenvolvimento
  React.useEffect(() => {
    // Verifica se planoData existe e tem a propriedade desenvolvimento
    if (planoData && Array.isArray(planoData.desenvolvimento)) {
      setDevelopmentSteps(planoData.desenvolvimento);
    } else if (planoData && typeof planoData.desenvolvimento === 'undefined' && planoData.developmentSteps) {
       // Caso a propriedade venha com outro nome (ex: developmentSteps)
       setDevelopmentSteps(planoData.developmentSteps);
    }
  }, [planoData]);


  // Funções de drag and drop
  const handleDragStart = (index: number) => {
    setDraggedStep(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedStep === null) return;

    const newSteps = [...developmentSteps];
    const draggedItem = newSteps[draggedStep];
    newSteps.splice(draggedStep, 1);
    newSteps.splice(targetIndex, 0, draggedItem);

    setDevelopmentSteps(newSteps);
    setDraggedStep(null);
  };

  // Funções para mover etapas
  const moveStepUp = (index: number) => {
    if (index > 0) {
      const newSteps = [...developmentSteps];
      [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
      setDevelopmentSteps(newSteps);
    }
  };

  const moveStepDown = (index: number) => {
    if (index < developmentSteps.length - 1) {
      const newSteps = [...developmentSteps];
      [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
      setDevelopmentSteps(newSteps);
    }
  };

  // Toggle de expansão
  const toggleStepExpansion = (index: number) => {
    setExpandedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

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
                Etapas de Desenvolvimento
              </h3>
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Etapa
              </Button>
            </div>

            <div className="space-y-4">
              {developmentSteps.map((etapa: any, index: number) => {
                const InteractionIcon = getInteractionIcon(etapa.tipo_interacao || etapa.tipoInteracao || 'Interativo');
                const isExpanded = expandedSteps[index];
                const truncatedDescription = etapa.descricao?.length > 120
                  ? etapa.descricao.substring(0, 120) + '...'
                  : etapa.descricao;

                return (
                  <Card
                    key={index}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                    className={`relative overflow-hidden transition-all duration-300 border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl cursor-move ${
                      draggedStep === index ? 'opacity-50 scale-95' : ''
                    }`}
                  >
                    <CardContent className="p-0">
                      {/* Header do Card */}
                      <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-4 border-b border-orange-200 dark:border-orange-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-5 h-5 text-gray-400 cursor-grab active:cursor-grabbing" />
                              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                {etapa.titulo}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                                  <InteractionIcon className="w-4 h-4" />
                                  <span className="text-sm font-medium">
                                    {etapa.tipo_interacao || etapa.tipoInteracao}
                                  </span>
                                </div>
                                {etapa.tempo_estimado && (
                                  <Badge variant="outline" className="border-orange-300 text-orange-700 bg-white dark:border-orange-600 dark:text-orange-300 dark:bg-orange-900/20 text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {etapa.tempo_estimado}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Controles de Movimento */}
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveStepUp(index)}
                              disabled={index === 0}
                              className="h-8 w-8 p-0 text-gray-500 hover:text-orange-600 disabled:opacity-30"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveStepDown(index)}
                              disabled={index === developmentSteps.length - 1}
                              className="h-8 w-8 p-0 text-gray-500 hover:text-orange-600 disabled:opacity-30"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Conteúdo do Card */}
                      <div className="p-4">
                        <div className="mb-4">
                          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                            {isExpanded ? etapa.descricao : truncatedDescription}
                          </p>

                          {etapa.descricao?.length > 120 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleStepExpansion(index)}
                              className="mt-2 text-orange-600 hover:text-orange-700 text-xs p-0 h-auto"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-3 h-3 mr-1" />
                                  Recolher
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3 h-3 mr-1" />
                                  Expandir
                                </>
                              )}
                            </Button>
                          )}
                        </div>

                        {/* Recursos e Notas */}
                        {etapa.recurso_gerado && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-3 border border-blue-200 dark:border-blue-700">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">Recurso:</span>
                            </div>
                            <span className="text-sm text-blue-700 dark:text-blue-300">{etapa.recurso_gerado}</span>
                          </div>
                        )}

                        {etapa.nota_privada_professor && (
                          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg mb-3 border border-amber-200 dark:border-amber-700">
                            <div className="flex items-start gap-2">
                              <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="text-sm font-semibold text-amber-800 dark:text-amber-200 block mb-1">
                                  Nota para o professor:
                                </span>
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                  {etapa.nota_privada_professor}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Botões de Ação */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/20"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Editar esta etapa
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Gerar Slides
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Gerar Recurso
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Seção de Avaliação */}
            {plano.avaliacao && (
              <Card className="mt-6 border-l-4 border-l-green-500 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-200">
                    <CheckCircle className="w-5 h-5" />
                    Critérios de Avaliação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                    <p className="text-green-800 dark:text-green-200 text-sm leading-relaxed">
                      {typeof plano.avaliacao === 'string'
                        ? plano.avaliacao
                        : plano.avaliacao.criterios || 'Critérios de avaliação não especificados'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
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

export default PlanoAulaPreview;