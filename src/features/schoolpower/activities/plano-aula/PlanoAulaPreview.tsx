import React, { useState, useEffect, useMemo } from 'react';
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
  Edit,
  Star,
  ChevronUp,
  GripVertical,
  Expand,
  Timer,
  Package,
  FileText,
  Eye
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
  useEffect(() => {
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
    { name: "Demonstração prática", icon: <Presentation className="w-4 h-4" /> }
  ];

  // Estado para gerenciar a expansão das etapas e o arrasto
  const [etapasExpandidas, setEtapasExpandidas] = useState<{ [key: string]: boolean }>({});
  const [draggedEtapa, setDraggedEtapa] = useState<string | null>(null);

  // Processar etapas de desenvolvimento - DADOS REAIS DA IA GEMINI
  const etapasDesenvolvimento = useMemo(() => {
    console.log('🔍 PlanoAulaPreview: Processando etapas de desenvolvimento dos dados da IA');

    let etapas = [];

    // PRIORIDADE 1: Dados processados da IA Gemini
    if (data.etapas_desenvolvimento && Array.isArray(data.etapas_desenvolvimento)) {
      etapas = data.etapas_desenvolvimento;
      console.log('✅ Etapas carregadas de etapas_desenvolvimento (IA):', etapas.length);
    }
    // PRIORIDADE 2: Outras estruturas possíveis da IA
    else if (data.desenvolvimento && Array.isArray(data.desenvolvimento)) {
      etapas = data.desenvolvimento;
      console.log('✅ Etapas carregadas de desenvolvimento (IA):', etapas.length);
    }
    else if (data.etapas && Array.isArray(data.etapas)) {
      etapas = data.etapas;
      console.log('✅ Etapas carregadas de etapas (IA):', etapas.length);
    }
    else if (data.steps && Array.isArray(data.steps)) {
      // Converter formato steps para etapas
      etapas = data.steps.map((step, index) => ({
        id: step.id || `etapa-${index + 1}`,
        titulo: step.titulo || step.title || `${index + 1}. Etapa ${index + 1}`,
        descricao: step.descricao || step.description || 'Descrição da etapa',
        tipo_interacao: step.tipo_interacao || step.interaction_type || 'Aula expositiva',
        tempo_estimado: step.tempo_estimado || step.duration || '10 minutos',
        recursos_usados: Array.isArray(step.recursos_usados) ? step.recursos_usados :
                        Array.isArray(step.resources) ? step.resources : ['Quadro'],
        metodologia: step.metodologia || step.methodology || '',
        atividades_praticas: step.atividades_praticas || step.practical_activities || '',
        avaliacao: step.avaliacao || step.evaluation || 'Participação',
        observacoes: step.observacoes || step.notes || ''
      }));
      console.log('✅ Etapas convertidas de steps (IA):', etapas.length);
    }

    // Se ainda não encontramos etapas, procurar em caches específicos
    if (etapas.length === 0 && activityData?.id) {
      console.log('🔄 Tentando carregar etapas dos caches específicos...');

      const cacheKeys = [
        `constructed_plano-aula_${activityData.id}`,
        `activity_${activityData.id}`,
        'schoolpower_plano-aula_content'
      ];

      for (const cacheKey of cacheKeys) {
        try {
          const cachedData = localStorage.getItem(cacheKey);
          if (cachedData) {
            const parsed = JSON.parse(cachedData);
            if (parsed.etapas_desenvolvimento && Array.isArray(parsed.etapas_desenvolvimento)) {
              etapas = parsed.etapas_desenvolvimento;
              console.log(`✅ Etapas carregadas do cache ${cacheKey}:`, etapas.length);
              break;
            }
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao carregar cache ${cacheKey}:`, error);
        }
      }
    }

    // APENAS COMO ÚLTIMO RECURSO: Etapas padrão (se IA falhar completamente)
    if (etapas.length === 0) {
      console.log('⚠️ Nenhuma etapa da IA encontrada, gerando etapas padrão baseadas no contexto');
      const tema = data.tema || data['Tema ou Tópico Central'] || 'Tema da Aula';
      const disciplina = data.disciplina || data['Componente Curricular'] || 'Matemática';

      etapas = [
        {
          id: 'etapa-1',
          titulo: '1. Introdução e Contextualização',
          descricao: `Apresentação do tema "${tema}" de ${disciplina}, conectando com conhecimentos prévios e despertando interesse dos alunos.`,
          tipo_interacao: 'Apresentação dialogada',
          tempo_estimado: '15 minutos',
          recursos_usados: ['Quadro', 'Slides'],
          metodologia: 'Aula expositiva dialogada',
          atividades_praticas: 'Discussão inicial sobre conhecimentos prévios',
          avaliacao: 'Participação nas discussões',
          observacoes: 'Adaptar linguagem conforme necessidade da turma'
        },
        {
          id: 'etapa-2',
          titulo: '2. Desenvolvimento do Conteúdo',
          descricao: `Exposição sistemática dos conceitos fundamentais de ${disciplina} relacionados ao tema "${tema}", com demonstrações práticas.`,
          tipo_interacao: 'Explicação + demonstração',
          tempo_estimado: '20 minutos',
          recursos_usados: ['Livro didático', 'Material manipulativo'],
          metodologia: 'Demonstração prática',
          atividades_praticas: 'Resolução de exemplos no quadro',
          avaliacao: 'Acompanhamento da compreensão',
          observacoes: 'Dar tempo para anotações dos alunos'
        },
        {
          id: 'etapa-3',
          titulo: '3. Atividade Prática',
          descricao: `Aplicação dos conceitos através de exercícios práticos sobre "${tema}", promovendo a fixação do aprendizado.`,
          tipo_interacao: 'Atividade individual/grupo',
          tempo_estimado: '10 minutos',
          recursos_usados: ['Exercícios', 'Material de apoio'],
          metodologia: 'Aprendizagem ativa',
          atividades_praticas: 'Resolução de exercícios propostos',
          avaliacao: 'Correção dos exercícios',
          observacoes: 'Circular pela sala auxiliando os alunos'
        },
        {
          id: 'etapa-4',
          titulo: '4. Síntese e Fechamento',
          descricao: `Consolidação dos principais conceitos de ${disciplina} abordados sobre "${tema}" e esclarecimento de dúvidas finais.`,
          tipo_interacao: 'Discussão + síntese',
          tempo_estimado: '5 minutos',
          recursos_usados: ['Quadro'],
          metodologia: 'Síntese colaborativa',
          atividades_praticas: 'Resumo coletivo dos pontos principais',
          avaliacao: 'Verificação da compreensão geral',
          observacoes: 'Anotar dúvidas para próxima aula'
        }
      ];
    }

    // Validar e normalizar estrutura das etapas
    etapas = etapas.map((etapa, index) => ({
      id: etapa.id || `etapa-${index + 1}`,
      titulo: etapa.titulo || etapa.title || `${index + 1}. Etapa ${index + 1}`,
      descricao: etapa.descricao || etapa.description || 'Descrição da etapa',
      tipo_interacao: etapa.tipo_interacao || etapa.tipoInteracao || etapa.interaction_type || 'Aula expositiva',
      tempo_estimado: etapa.tempo_estimado || etapa.tempoEstimado || etapa.duration || '10 minutos',
      recursos_usados: Array.isArray(etapa.recursos_usados) ? etapa.recursos_usados :
                      Array.isArray(etapa.recursos) ? etapa.recursos :
                      etapa.recursos_usados ? [etapa.recursos_usados] :
                      etapa.recursos ? [etapa.recursos] : ['Quadro'],
      metodologia: etapa.metodologia || etapa.methodology || '',
      atividades_praticas: etapa.atividades_praticas || etapa.practical_activities || '',
      avaliacao: etapa.avaliacao || etapa.evaluation || 'Participação',
      observacoes: etapa.observacoes || etapa.notes || ''
    }));

    console.log('✅ Etapas de desenvolvimento finais processadas:', etapas);
    console.log('🎯 Total de etapas:', etapas.length);
    console.log('📋 Primeira etapa como exemplo:', etapas[0]);

    return etapas;
  }, [data, activityData]);

  // Inicializa o estado de expansão com base nas etapas carregadas
  useEffect(() => {
    const initialExpansionState = {};
    etapasDesenvolvimento.forEach(etapa => {
      initialExpansionState[etapa.id] = false; // Começa todas recolhidas
    });
    setEtapasExpandidas(initialExpansionState);
  }, [etapasDesenvolvimento]);


  const toggleEtapaExpansion = (etapaId: string) => {
    setEtapasExpandidas(prev => ({
      ...prev,
      [etapaId]: !prev[etapaId]
    }));
  };

  const moveEtapaUp = (index: number) => {
    if (index > 0) {
      const newEtapas = [...etapasDesenvolvimento];
      [newEtapas[index - 1], newEtapas[index]] = [newEtapas[index], newEtapas[index - 1]];

      // Salvar mudanças
      const updatedData = { ...data, etapas_desenvolvimento: newEtapas };
      saveDataToCache(updatedData);

      // Recarregar dados para refletir mudanças
      setData(updatedData);
    }
  };

  const moveEtapaDown = (index: number) => {
    if (index < etapasDesenvolvimento.length - 1) {
      const newEtapas = [...etapasDesenvolvimento];
      [newEtapas[index], newEtapas[index + 1]] = [newEtapas[index + 1], newEtapas[index]];

      // Salvar mudanças
      const updatedData = { ...data, etapas_desenvolvimento: newEtapas };
      saveDataToCache(updatedData);

      // Recarregar dados para refletir mudanças
      setData(updatedData);
    }
  };

  const editEtapa = (etapaId: string) => {
    // TODO: Implementar modal de edição de etapa
    console.log('Editando etapa:', etapaId);
    toast({
      title: "Edição de Etapa",
      description: "Funcionalidade de edição será implementada em breve.",
    });
  };

  const handleReorderEtapas = (draggedId: string, targetId: string) => {
    console.log(`Reordenando: ${draggedId} para depois de ${targetId}`);
    const etapas = [...etapasDesenvolvimento];
    const draggedIndex = etapas.findIndex(e => e.id === draggedId);
    const targetIndex = etapas.findIndex(e => e.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const [movedEtapa] = etapas.splice(draggedIndex, 1);
    etapas.splice(targetIndex, 0, movedEtapa);

    // Salvar mudanças
    const updatedData = { ...data, etapas_desenvolvimento: etapas };
    saveDataToCache(updatedData);

    // Recarregar dados para refletir mudanças
    setData(updatedData);
  };

  const saveDataToCache = (updatedData: any) => {
    try {
      if (activityData?.id) {
        localStorage.setItem(`constructed_plano-aula_${activityData.id}`, JSON.stringify(updatedData));
        localStorage.setItem(`activity_${activityData.id}`, JSON.stringify(updatedData));
      }
      localStorage.setItem('schoolpower_plano-aula_content', JSON.stringify(updatedData));
      console.log('✅ Dados atualizados salvos no cache');
    } catch (error) {
      console.error('❌ Erro ao salvar dados atualizados:', error);
    }
  };


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
      icon: Users,
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
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Desenvolvimento</h3>
            </div>

            {/* Cards de Etapas - Renderização Dinâmica das Etapas Geradas pela IA */}
            <div className="space-y-3">
              {etapasDesenvolvimento.map((etapa, index) => {
                const isExpanded = etapasExpandidas[etapa.id] || false;
                return (
                  <Card
                    key={etapa.id}
                    className={`border-l-4 ${
                      draggedEtapa === etapa.id ? 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-900/20' : 'border-l-blue-500'
                    } bg-gradient-to-r from-blue-50/30 to-transparent dark:from-blue-900/20 dark:to-transparent transition-all duration-200 hover:shadow-md cursor-pointer`}
                    draggable={true}
                    onDragStart={(e) => {
                      setDraggedEtapa(etapa.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedEtapa && draggedEtapa !== etapa.id) {
                        handleReorderEtapas(draggedEtapa, etapa.id);
                      }
                      setDraggedEtapa(null);
                    }}
                    onDragEnd={() => setDraggedEtapa(null)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                {etapa.titulo}
                              </h4>
                              <Badge variant="secondary" className="text-xs px-2 py-1">
                                <Timer className="h-3 w-3 mr-1" />
                                {etapa.tempo_estimado || etapa.tempoEstimado}
                              </Badge>
                              <Badge variant="outline" className="text-xs px-2 py-1">
                                <Users className="h-3 w-3 mr-1" />
                                {etapa.tipo_interacao || etapa.tipoInteracao}
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                {isExpanded ? etapa.descricao : `${etapa.descricao.substring(0, 120)}...`}
                              </p>

                              {isExpanded && (
                                <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                  {(etapa.recursos_usados || etapa.recursos) && (
                                    <div>
                                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Recursos:</span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {(Array.isArray(etapa.recursos_usados) ? etapa.recursos_usados :
                                          Array.isArray(etapa.recursos) ? etapa.recursos :
                                          [etapa.recursos_usados || etapa.recursos]).map((recurso, idx) => (
                                          <Badge key={idx} variant="secondary" className="text-xs">
                                            <Package className="h-3 w-3 mr-1" />
                                            {recurso}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {etapa.metodologia && (
                                    <div>
                                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Metodologia:</span>
                                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{etapa.metodologia}</p>
                                    </div>
                                  )}

                                  {etapa.atividades_praticas && (
                                    <div>
                                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Atividades Práticas:</span>
                                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{etapa.atividades_praticas}</p>
                                    </div>
                                  )}

                                  {etapa.avaliacao && (
                                    <div>
                                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Avaliação:</span>
                                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{etapa.avaliacao}</p>
                                    </div>
                                  )}

                                  {etapa.observacoes && (
                                    <div>
                                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Observações:</span>
                                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{etapa.observacoes}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleEtapaExpansion(etapa.id)}
                            className="text-xs px-2 py-1 h-6"
                          >
                            <Expand className="h-3 w-3 mr-1" />
                            {isExpanded ? 'Recolher' : 'Expandir'}
                          </Button>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs px-2 py-1 h-6"
                              onClick={() => editEtapa(etapa.id)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs px-2 py-1 h-6"
                              onClick={() => moveEtapaUp(index)}
                              disabled={index === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs px-2 py-1 h-6"
                              onClick={() => moveEtapaDown(index)}
                              disabled={index === etapasDesenvolvimento.length - 1}
                            >
                              ↓
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>

            {/* Informações sobre as Etapas Geradas pela IA */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300">IA</span>
                </div>
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Etapas geradas pela IA Gemini
                </span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {etapasDesenvolvimento.length} etapas personalizadas foram criadas automaticamente
                baseadas no seu contexto educacional. Você pode reordená-las, editá-las ou adicionar novas etapas.
              </p>
            </div>
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