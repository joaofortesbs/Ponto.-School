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
  Group,
  PlayCircle, // Added for the new design
  ArrowRight, // Added for the new design
  Download // Added for PDF export functionality
} from 'lucide-react';
import { toast } from "@/components/ui/toast";
import { motion } from 'framer-motion'; // Added for animations

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
  onClose?: () => void; // Added for the new design
}

const PlanoAulaPreview: React.FC<PlanoAulaPreviewProps> = ({ data, activityData, onClose }) => {
  // Estado para armazenar dados específicos de cada seção
  const [secaoAtual, setSecaoAtual] = useState('visao-geral'); // Kept for potential future use, but not used in the new layout
  const [dadosSessao, setDadosSessao] = useState<any>({}); // Kept for potential future use

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

  // As seções de navegação lateral foram removidas, o foco agora é no desenvolvimento da aula.

  // Função para renderizar o conteúdo das seções (agora focado no desenvolvimento)
  const renderSectionContent = () => {
    // A lógica de switch foi simplificada para focar apenas no desenvolvimento da aula,
    // pois o layout foi alterado para exibir isso diretamente.
    return (
      <DesenvolvimentoInterface
        data={data}
        contextoPlano={contextoCompleto}
        onDataChange={handleDesenvolvimentoChange}
      />
    );
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


  // ---- Nova Lógica de Renderização ----

  // Informações gerais do plano
  const disciplina = plano?.visao_geral?.disciplina || plano?.disciplina || 'Disciplina não especificada';
  const tema = plano?.titulo || plano?.theme || plano?.tema || 'Tema não especificado';
  const serie = plano?.serie || plano?.anoEscolaridade || plano?.visao_geral?.serie || 'Série não especificada';
  const tempo = plano?.tempo || plano?.visao_geral?.tempo || '50 minutos';
  const metodologia = plano?.metodologia || plano?.visao_geral?.metodologia || 'Ativa e participativa';

  // Processar dados do desenvolvimento
  const etapas = plano?.desenvolvimento || [];


  // Função para obter ícone da etapa
  const getEtapaIcon = (tipo: string) => {
    const iconMap: { [key: string]: any } = {
      'exposicao': PlayCircle, // Mapeado de 'Exposição' para 'exposicao'
      'interativa': MessageSquare, // Mapeado de 'Interativa' para 'interativa'
      'avaliativa': CheckCircle, // Mapeado de 'Avaliativa' para 'avaliativa'
      'atividade': PenTool, // Novo tipo de atividade
      'discussao': MessageSquare,
      'pratica': PenTool,
      'grupo': Users,
      'individual': Target,
      'default': Lightbulb
    };
    return iconMap[tipo?.toLowerCase()] || iconMap.default;
  };

  // Função para obter cor da etapa
  const getEtapaCor = (tipo: string) => {
    const corMap: { [key: string]: string } = {
      'exposicao': 'bg-blue-500',
      'interativa': 'bg-green-500',
      'avaliativa': 'bg-red-500',
      'atividade': 'bg-orange-500',
      'discussao': 'bg-green-500',
      'pratica': 'bg-orange-500',
      'grupo': 'bg-purple-500',
      'individual': 'bg-indigo-500',
      'default': 'bg-gray-500'
    };
    return corMap[tipo?.toLowerCase()] || corMap.default;
  };


  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden flex flex-col">
      {/* Header Principal */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 shadow-lg sticky top-0 z-50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Plano de Aula: {tema}
              </h1>
              <div className="flex items-center space-x-4 mt-2 text-white/90">
                <span className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{disciplina}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{serie}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{tempo}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Eye className="w-4 h-4 mr-2" />
              Simular Aula
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                ✕
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Informações Gerais Rápidas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 bg-slate-800/50 sticky top-24 z-40" // Adjusted sticky position
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-700/50 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-6 h-6 text-orange-400" />
                <div>
                  <p className="text-sm text-slate-300">Disciplina</p>
                  <p className="font-semibold text-white">{disciplina}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-700/50 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-blue-400" />
                <div>
                  <p className="text-sm text-slate-300">Tempo</p>
                  <p className="font-semibold text-white">{tempo}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-700/50 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-sm text-slate-300">Série/Ano</p>
                  <p className="font-semibold text-white">{serie}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-700/50 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Target className="w-6 h-6 text-purple-400" />
                <div>
                  <p className="text-sm text-slate-300">Metodologia</p>
                  <p className="font-semibold text-white">{metodologia}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Desenvolvimento da Aula - Interface Principal */}
      <div className="flex-1 overflow-y-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-slate-800/50 border-slate-600">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-xl text-white">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <PlayCircle className="w-6 h-6 text-white" />
                </div>
                <span>Desenvolvimento da Aula</span>
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-300">
                  {etapas.length} etapas
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {etapas.length > 0 ? (
                etapas.map((etapa: any, index: number) => {
                  const IconComponent = getEtapaIcon(etapa.tipo_interacao);
                  const corEtapa = getEtapaCor(etapa.tipo_interacao);

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="relative"
                    >
                      {/* Linha conectora */}
                      {index < etapas.length - 1 && (
                        <div className="absolute left-6 top-16 w-0.5 h-12 bg-slate-600 z-0" />
                      )}

                      <Card className="bg-slate-700/30 border-slate-600 hover:bg-slate-700/50 transition-all duration-200 relative z-10">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            {/* Ícone e número da etapa */}
                            <div className="flex-shrink-0 flex flex-col items-center space-y-2">
                              <div className={`p-3 ${corEtapa} rounded-full`}>
                                <IconComponent className="w-6 h-6 text-white" />
                              </div>
                              <Badge variant="outline" className="text-xs border-slate-500 text-slate-300">
                                Etapa {index + 1}
                              </Badge>
                            </div>

                            {/* Conteúdo da etapa */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-white">
                                  {etapa.titulo || `Etapa ${index + 1}`}
                                </h3>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                                    {etapa.tipo_interacao || 'Atividade'}
                                  </Badge>
                                  <Badge variant="outline" className="border-slate-500 text-slate-300">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {etapa.tempo_estimado || '10 min'}
                                  </Badge>
                                </div>
                              </div>

                              <p className="text-slate-300 mb-4 leading-relaxed">
                                {etapa.descricao || 'Descrição da etapa não fornecida.'}
                              </p>

                              {/* Recursos necessários */}
                              {etapa.recursos_necessarios && etapa.recursos_necessarios.length > 0 && (
                                <div className="mt-4">
                                  <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center">
                                    <Target className="w-4 h-4 mr-2" />
                                    Recursos Necessários:
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {etapa.recursos_necessarios.map((recurso: string, recursoIndex: number) => (
                                      <Badge
                                        key={recursoIndex}
                                        variant="outline"
                                        className="border-orange-500/30 text-orange-300 bg-orange-500/10"
                                      >
                                        {recurso}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-300 mb-2">
                    Nenhuma etapa de desenvolvimento encontrada
                  </h3>
                  <p className="text-slate-400">
                    As etapas do desenvolvimento da aula aparecerão aqui quando disponíveis.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PlanoAulaPreview;