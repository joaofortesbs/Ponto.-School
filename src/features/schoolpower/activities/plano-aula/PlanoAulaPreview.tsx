import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Users,
  Target,
  BookOpen,
  FileText,
  ChevronDown,
  ChevronUp,
  Edit3,
  GripVertical,
  Presentation,
  MessageCircle,
  Activity,
  Play,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PlanoAulaData {
  title?: string;
  description?: string;
  disciplina?: string;
  tema?: string;
  serie?: string;
  tempo?: string;
  metodologia?: string;
  recursos?: string[];
  objetivos?: string;
  materiais?: string;
  observacoes?: string;
  competencias?: string;
  contexto?: string;
  visao_geral?: {
    disciplina: string;
    tema: string;
    serie: string;
    tempo: string;
    metodologia: string;
    recursos: string[];
    sugestoes_ia?: string[];
  };
  etapas_desenvolvimento?: EtapaDesenvolvimento[];
  titulo?: string;
  descricao?: string;
  anoEscolaridade?: string;
  tempoLimite?: string;
  tipoAula?: string;
  difficultyLevel?: string;
  evaluation?: string;
  subject?: string;
  theme?: string;
  schoolYear?: string;
  timeLimit?: string;
  descriptionMetodologia?: string;
  atividades?: any[];
  avaliacao?: any;
}

interface EtapaDesenvolvimento {
  id: string;
  titulo: string;
  descricao: string;
  tipoInteracao: string;
  tempoEstimado: string;
  recursos: string[];
  ordem: number;
}

interface PlanoAulaPreviewProps {
  data: PlanoAulaData;
  activityData?: any;
}

// Dados fictícios para as etapas de desenvolvimento
const etapasDesenvolvimentoFicticias: EtapaDesenvolvimento[] = [
  {
    id: 'etapa-1',
    titulo: '1. Introdução e Contextualização',
    descricao: 'Apresente o contexto histórico da Europa no século XVIII, destacando os principais eventos que levaram à Revolução Francesa. Utilize recursos visuais para captar a atenção dos alunos.',
    tipoInteracao: 'Apresentação + debate',
    tempoEstimado: '15 minutos',
    recursos: ['Slides', 'Vídeo'],
    ordem: 1
  },
  {
    id: 'etapa-2',
    titulo: '2. Desenvolvimento do Conteúdo Principal',
    descricao: 'Explique detalhadamente os conceitos fundamentais do tema, utilizando exemplos práticos e conectando com o cotidiano dos alunos.',
    tipoInteracao: 'Aula expositiva dialogada',
    tempoEstimado: '20 minutos',
    recursos: ['Quadro', 'Material didático'],
    ordem: 2
  },
  {
    id: 'etapa-3',
    titulo: '3. Atividade Prática',
    descricao: 'Aplique uma atividade prática que permita aos alunos consolidarem o conhecimento adquirido através de exercícios dirigidos.',
    tipoInteracao: 'Atividade em grupos',
    tempoEstimado: '10 minutos',
    recursos: ['Apostila', 'Material de apoio'],
    ordem: 3
  },
  {
    id: 'etapa-4',
    titulo: '4. Síntese e Avaliação',
    descricao: 'Realize uma síntese dos principais pontos abordados na aula e aplique uma avaliação formativa para verificar a aprendizagem.',
    tipoInteracao: 'Discussão + avaliação',
    tempoEstimado: '5 minutos',
    recursos: ['Questionário', 'Debate'],
    ordem: 4
  }
];

const getInteractionIcon = (tipo: string) => {
  const tipoLower = tipo.toLowerCase();
  if (tipoLower.includes('apresentação') || tipoLower.includes('expositiva')) {
    return <Presentation className="w-4 h-4" />;
  }
  if (tipoLower.includes('debate') || tipoLower.includes('discussão')) {
    return <MessageCircle className="w-4 h-4" />;
  }
  if (tipoLower.includes('atividade') || tipoLower.includes('prática')) {
    return <Activity className="w-4 h-4" />;
  }
  if (tipoLower.includes('avaliação')) {
    return <Target className="w-4 h-4" />;
  }
  return <Play className="w-4 h-4" />;
};

const getInteractionColor = (tipo: string) => {
  const tipoLower = tipo.toLowerCase();
  if (tipoLower.includes('apresentação') || tipoLower.includes('expositiva')) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  }
  if (tipoLower.includes('debate') || tipoLower.includes('discussão')) {
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  }
  if (tipoLower.includes('atividade') || tipoLower.includes('prática')) {
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
  }
  if (tipoLower.includes('avaliação')) {
    return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
  }
  return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
};

const EtapaCard: React.FC<{
  etapa: EtapaDesenvolvimento;
  expandida: boolean;
  onToggleExpansao: () => void;
  onEdit: () => void;
}> = ({ etapa, expandida, onToggleExpansao, onEdit }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]/30 dark:hover:border-[#FF6B00]/30 transition-all duration-200 cursor-move">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex items-center gap-2 mt-1">
                <GripVertical className="w-4 h-4 text-gray-400 group-hover:text-[#FF6B00] transition-colors" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {etapa.titulo}
                </CardTitle>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge className={`${getInteractionColor(etapa.tipoInteracao)} flex items-center gap-1`}>
                    {getInteractionIcon(etapa.tipoInteracao)}
                    {etapa.tipoInteracao}
                  </Badge>

                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {etapa.tempoEstimado}
                  </Badge>
                </div>

                <p className={`text-sm text-gray-600 dark:text-gray-300 leading-relaxed ${
                  expandida ? '' : 'line-clamp-2'
                }`}>
                  {etapa.descricao}
                </p>

                {expandida && etapa.recursos.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Recursos utilizados:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {etapa.recursos.map((recurso, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {recurso}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpansao}
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {expandida ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="h-8 w-8 p-0 hover:bg-[#FF6B00]/10 dark:hover:bg-[#FF6B00]/10 text-[#FF6B00]"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  );
};

const DesenvolvimentoSection: React.FC<{
  etapas: EtapaDesenvolvimento[];
}> = ({ etapas }) => {
  const [etapasExpandidas, setEtapasExpandidas] = useState<Set<string>>(new Set());
  const [etapasOrdenadas, setEtapasOrdenadas] = useState<EtapaDesenvolvimento[]>(
    [...etapas].sort((a, b) => a.ordem - b.ordem)
  );

  const toggleExpansao = (etapaId: string) => {
    const novasExpandidas = new Set(etapasExpandidas);
    if (novasExpandidas.has(etapaId)) {
      novasExpandidas.delete(etapaId);
    } else {
      novasExpandidas.add(etapaId);
    }
    setEtapasExpandidas(novasExpandidas);
  };

  const handleEdit = (etapaId: string) => {
    console.log('Editando etapa:', etapaId);
    // TODO: Implementar modal de edição
  };

  const handleAddEtapa = () => {
    console.log('Adicionando nova etapa');
    // TODO: Implementar modal de adicionar etapa
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-6 bg-[#FF6B00] rounded-full"></div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Etapas de Desenvolvimento
          </h3>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleAddEtapa}
          className="flex items-center gap-2 border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white"
        >
          <Plus className="w-4 h-4" />
          Adicionar Etapa
        </Button>
      </div>

      <div className="space-y-4">
        {etapasOrdenadas.map((etapa) => (
          <EtapaCard
            key={etapa.id}
            etapa={etapa}
            expandida={etapasExpandidas.has(etapa.id)}
            onToggleExpansao={() => toggleExpansao(etapa.id)}
            onEdit={() => handleEdit(etapa.id)}
          />
        ))}
      </div>

      {etapasOrdenadas.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Nenhuma etapa de desenvolvimento configurada ainda.
          </p>
          <Button
            onClick={handleAddEtapa}
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Primeira Etapa
          </Button>
        </div>
      )}
    </div>
  );
};

export default function PlanoAulaPreview({ data, activityData }: PlanoAulaPreviewProps) {
  const [activeSection, setActiveSection] = useState<string>('visao-geral');

  console.log('🔍 PlanoAulaPreview - Data recebida:', data);
  console.log('🔍 PlanoAulaPreview - ActivityData recebida:', activityData);

  const planoData = data || activityData;

  const dataStructure = Object.keys(planoData || {});
  const hasData = !!planoData;
  const hasTitle = planoData?.title || planoData?.titulo;
  const hasVisaoGeral = planoData?.visao_geral;

  console.log('📚 PlanoAulaPreview - Estrutura dos dados:', {
    hasData,
    hasVisaoGeral,
    hasTitle,
    dataStructure,
    fullData: planoData
  });

  console.log('🎯 PlanoAulaPreview - Análise detalhada dos dados:');
  console.log('  - Título:', planoData?.title || planoData?.titulo);
  console.log('  - Descrição:', planoData?.description || planoData?.descricao);
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

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Nenhum dado disponível para visualização</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'visao-geral', label: 'Visão Geral', icon: BookOpen },
    { id: 'objetivos', label: 'Objetivos', icon: Target },
    { id: 'metodologia', label: 'Metodologia', icon: Users },
    { id: 'desenvolvimento', label: 'Desenvolvimento', icon: Activity },
    { id: 'atividades', label: 'Atividades', icon: Play },
    { id: 'avaliacao', label: 'Avaliação', icon: FileText }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'visao-geral':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Informações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Disciplina</h4>
                    <p className="text-gray-600 dark:text-gray-400">{planoData.disciplina || planoData.visao_geral?.disciplina || 'Não informado'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Série/Ano</h4>
                    <p className="text-gray-600 dark:text-gray-400">{planoData.serie || planoData.anoEscolaridade || planoData.schoolYear || planoData.visao_geral?.serie || 'Não informado'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Tema</h4>
                    <p className="text-gray-600 dark:text-gray-400">{planoData.tema || planoData.theme || planoData.titulo || planoData.title || planoData.visao_geral?.tema || 'Não informado'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Duração</h4>
                    <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {planoData.tempo || planoData.tempoLimite || planoData.timeLimit || planoData.visao_geral?.tempo || 'Não informado'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'objetivos':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Objetivos de Aprendizagem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {Array.isArray(planoData.objetivos)
                    ? planoData.objetivos.map((obj: any) => typeof obj === 'string' ? obj : obj.descricao).join(', ')
                    : planoData.objetivos || 'Objetivos não especificados'}
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'metodologia':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Abordagem Pedagógica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Metodologia</h4>
                  <p className="text-gray-600 dark:text-gray-400">{planoData.metodologia || planoData.tipoAula || planoData.difficultyLevel || planoData.visao_geral?.metodologia || 'Não especificada'}</p>
                </div>
                { (planoData.recursos || planoData.visao_geral?.recursos) && planoData.recursos?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Recursos Necessários</h4>
                    <div className="flex flex-wrap gap-2">
                      {(planoData.recursos || planoData.visao_geral?.recursos || []).map((recurso: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {recurso}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'desenvolvimento':
        return <DesenvolvimentoSection etapas={planoData.etapas_desenvolvimento || etapasDesenvolvimentoFicticias} />;

      case 'atividades':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Atividades Práticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(planoData.atividades) && planoData.atividades.length > 0 ? (
                  <div className="space-y-4">
                    {planoData.atividades.map((atividade: any, index: number) => (
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
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    Nenhuma atividade definida para este plano de aula.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'avaliacao':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Critérios de Avaliação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Critérios</h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {typeof planoData.avaliacao === 'string'
                      ? planoData.avaliacao
                      : planoData.avaliacao?.criterios || 'Critérios de avaliação não especificados'}
                  </p>
                </div>
                {planoData.avaliacao?.instrumentos && planoData.avaliacao.instrumentos.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Instrumentos</h4>
                    <div className="flex flex-wrap gap-2">
                      {(planoData.avaliacao?.instrumentos || []).map((instrumento: string, index: number) => (
                        <Badge key={index} variant="outline" className="border-orange-300 text-orange-700 bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:bg-orange-900/30 px-3 py-1">
                          {instrumento}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {planoData.avaliacao?.feedback && (
                  <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Feedback</h4>
                    <p className="text-gray-600 dark:text-gray-400">{planoData.avaliacao?.feedback || 'Feedback não especificado'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {planoData.title || planoData.titulo || 'Plano de Aula'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {planoData.description || planoData.descricao || 'Visualização do plano de aula gerado'}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeSection === item.id
                  ? 'bg-white dark:bg-gray-700 text-[#FF6B00] shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
              {item.id === 'desenvolvimento' && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {planoData.etapas_desenvolvimento?.length || etapasDesenvolvimentoFicticias.length}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {renderContent()}
      </div>
    </div>
  );
}