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

// Importar as seções separadas
import VisaoGeralInterface from './sections/visao-geral/VisaoGeralInterface';
import ObjetivosInterface from './sections/objetivos/ObjetivosInterface';
import MetodologiaInterface from './sections/metodologia/MetodologiaInterface';
import DesenvolvimentoInterface from './sections/desenvolvimento/DesenvolvimentoInterface';
import AtividadesInterface from './sections/atividades/AtividadesInterface';
import AvaliacaoInterface from './sections/avaliacao/AvaliacaoInterface';

// Importar o integrador de desenvolvimento
import { DesenvolvimentoIntegrator } from './sections/desenvolvimento/DesenvolvimentoIntegrator';


interface PlanoAulaPreviewProps {
  data: any;
  activityData?: any;
}

const PlanoAulaPreview: React.FC<PlanoAulaPreviewProps> = ({ data, activityData }) => {
  // Estado para armazenar dados específicos de cada seção
  const [secaoAtual, setSecaoAtual] = useState('visao-geral');
  const [dadosSessao, setDadosSessao] = useState<any>({});

  // Integrador para sincronização de dados de desenvolvimento
  const [desenvolvimentoData, setDesenvolvimentoData] = useState<any>(null);
  const [planoId] = useState(() => activityData?.id || `plano-${Date.now()}`);

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
    switch (secaoAtual) {
      case 'visao-geral':
        return <VisaoGeralInterface planoData={plano} />;

      case 'objetivos':
        return <ObjetivosInterface planoData={plano} />;

      case 'metodologia':
        return <MetodologiaInterface planoData={plano} />;

      case 'desenvolvimento':
        return (
          <DesenvolvimentoInterface
            data={data}
            contextoPlano={contextoCompleto}
            onDataChange={handleDesenvolvimentoChange}
          />
        );

      case 'atividades':
        return <AtividadesInterface planoData={plano} />;

      case 'avaliacao':
        return <AvaliacaoInterface planoData={plano} />;

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

  const handleUpdateApproval = (approved: boolean) => {
    console.log('🔄 Atualização de aprovação:', approved);
  };

  // Handler para mudanças nos dados de desenvolvimento
  const handleDesenvolvimentoChange = (data: any) => {
    console.log('🔄 Dados de desenvolvimento alterados:', data);
    setDesenvolvimentoData(data);

    // Sincronizar com outras seções
    DesenvolvimentoIntegrator.sincronizarComOutrasSecoes(data, planoId);
  };

  // Preparar contexto completo para as seções
  const contextoCompleto = useMemo(() => {
    return DesenvolvimentoIntegrator.coletarContextoCompleto(activityData, data);
  }, [activityData, data]);

  // Efeito para inicializar dados da seção
  useEffect(() => {
    if (activityData?.originalData) {
      console.log('📊 PlanoAulaPreview: Inicializando com dados da atividade', activityData.originalData);

      // Processar dados de desenvolvimento se disponível
      if (activityData.originalData.desenvolvimento) {
        const dadosProcessados = DesenvolvimentoIntegrator.processarDados(
          activityData.originalData,
          planoId
        );
        setDesenvolvimentoData(dadosProcessados);
        console.log('🔄 PlanoAulaPreview: Dados de desenvolvimento processados', dadosProcessados);
      }
    }
  }, [activityData, planoId]);

  // Efeito para reprocessar dados quando desenvolvimento mudar
  useEffect(() => {
    if (desenvolvimentoData && activityData?.originalData) {
      console.log('🔄 PlanoAulaPreview: Reprocessando dados após mudança no desenvolvimento');

      // Reprocessar dados para garantir sincronização
      const dadosAtualizados = DesenvolvimentoIntegrator.processarDados(
        {
          ...activityData.originalData,
          desenvolvimento: desenvolvimentoData
        },
        planoId
      );

      console.log('✅ PlanoAulaPreview: Dados sincronizados', dadosAtualizados);
    }
  }, [desenvolvimentoData, activityData, planoId]);


  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Layout Principal */}
      <div className="flex flex-1 h-full">
        {/* Sidebar de Navegação */}
        <div className="w-80 bg-orange-50 dark:bg-orange-900/20 border-r border-orange-200 dark:border-orange-700 overflow-y-auto">
          <div className="p-6 space-y-6">
            {sidebarSections.map((section) => {
              const Icon = section.icon;
              const isActive = secaoAtual === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => setSecaoAtual(section.id)}
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
    </div>
  );
};

export default PlanoAulaPreview;