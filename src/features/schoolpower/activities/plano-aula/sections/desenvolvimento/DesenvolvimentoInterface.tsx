import React, { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { motion, Reorder } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Users,
  BookOpen,
  Edit3,
  RefreshCw,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Play,
  GripVertical,
  BarChart3
} from 'lucide-react';
import DebugPanel from './DebugPanel';
import {
  DesenvolvimentoData,
  EtapaDesenvolvimento,
  DesenvolvimentoGeminiService,
  desenvolvimentoDataPadrao
} from './DesenvolvimentoData';

interface DesenvolvimentoInterfaceProps {
  data?: any;
  contextoPlano?: any;
  onDataChange?: (data: DesenvolvimentoData) => void;
}

export default function DesenvolvimentoInterface({
  data,
  contextoPlano,
  onDataChange
}: DesenvolvimentoInterfaceProps) {
  const { theme } = useTheme();
  const [desenvolvimentoData, setDesenvolvimentoData] = useState<DesenvolvimentoData>(desenvolvimentoDataPadrao);
  const [carregandoIA, setCarregandoIA] = useState(false);
  const [etapaExpandida, setEtapaExpandida] = useState<string | null>(null);
  const [observacoesExpanded, setObservacoesExpanded] = useState(false);
  const [planoId, setPlanoId] = useState<string>('');
  const [showDebug, setShowDebug] = useState(false);
  const [expandedEtapas, setExpandedEtapas] = useState<Set<number>>(new Set());


  // Gerar ID único para o plano
  useEffect(() => {
    const id = data?.id || contextoPlano?.id || `plano_${Date.now()}`;
    setPlanoId(id);
  }, [data, contextoPlano]);

  // Carregar dados salvos ou gerar novos
  useEffect(() => {
    const carregarOuGerarDados = async () => {
      if (!planoId) return;

      console.log('🔄 Carregando/Gerando dados de desenvolvimento para:', planoId);

      // Tentar carregar dados salvos primeiro
      const dadosSalvos = DesenvolvimentoGeminiService.carregarEtapasDesenvolvimento(planoId);

      if (dadosSalvos) {
        console.log('📂 Dados encontrados no localStorage:', dadosSalvos);
        setDesenvolvimentoData(dadosSalvos);
        onDataChange?.(dadosSalvos);
        return;
      }

      // Se não há dados salvos e há contexto, gerar via IA
      if (contextoPlano && (contextoPlano.disciplina || contextoPlano.tema)) {
        console.log('🤖 Gerando dados via IA para contexto:', contextoPlano);
        await gerarEtapasViaIA();
      } else {
        console.log('📋 Usando dados padrão');
        setDesenvolvimentoData(desenvolvimentoDataPadrao);
        onDataChange?.(desenvolvimentoDataPadrao);
      }
    };

    carregarOuGerarDados();
  }, [planoId, contextoPlano]);

  const gerarEtapasViaIA = async () => {
    setCarregandoIA(true);

    try {
      console.log('🚀 Iniciando geração de etapas via Gemini...');
      console.log('📝 Contexto enviado:', contextoPlano);

      const etapasGeradas = await DesenvolvimentoGeminiService.gerarEtapasDesenvolvimento(contextoPlano);

      console.log('✅ Etapas geradas com sucesso:', etapasGeradas);

      setDesenvolvimentoData(etapasGeradas);
      onDataChange?.(etapasGeradas);

      // Salvar no localStorage
      DesenvolvimentoGeminiService.salvarEtapasDesenvolvimento(planoId, etapasGeradas);

      toast({
        title: "✨ Etapas Geradas com Sucesso!",
        description: `${etapasGeradas.etapas.length} etapas foram criadas pela IA para seu plano de aula.`,
      });

    } catch (error) {
      console.error('❌ Erro na geração via IA:', error);

      // Usar dados padrão em caso de erro
      const dadosComContexto = DesenvolvimentoGeminiService['aplicarContextoAosDadosPadrao'](contextoPlano);
      setDesenvolvimentoData(dadosComContexto);
      onDataChange?.(dadosComContexto);

      toast({
        title: "⚠️ Falha na Geração IA",
        description: "Usando estrutura padrão. Você pode tentar gerar novamente.",
        variant: "destructive"
      });
    } finally {
      setCarregandoIA(false);
    }
  };

  const regenerarEtapas = async () => {
    if (!contextoPlano) {
      toast({
        title: "❌ Erro",
        description: "Contexto do plano não encontrado para regeneração.",
        variant: "destructive"
      });
      return;
    }

    await gerarEtapasViaIA();
  };

  const toggleEtapaExpandida = (etapaId: string) => {
    setEtapaExpandida(etapaExpandida === etapaId ? null : etapaId);
  };

  const editarEtapa = (etapaId: string) => {
    toast({
      title: "🔧 Edição de Etapas",
      description: "Funcionalidade de edição será implementada em breve.",
    });
  };

  const handleReorder = (newOrder: EtapaDesenvolvimento[]) => {
    const updatedData = {
      ...desenvolvimentoData,
      etapas: newOrder.map((etapa, index) => ({
        ...etapa,
        ordem: index + 1
      }))
    };
    setDesenvolvimentoData(updatedData);
    onDataChange?.(updatedData);

    // Salvar no localStorage
    DesenvolvimentoGeminiService.salvarEtapasDesenvolvimento(planoId, updatedData);
  };

  const getIconeInteracao = (tipo: string) => {
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes('apresentação')) return <Play className="h-4 w-4" />;
    if (tipoLower.includes('prática') || tipoLower.includes('exercício')) return <CheckCircle className="h-4 w-4" />;
    if (tipoLower.includes('grupo') || tipoLower.includes('debate')) return <Users className="h-4 w-4" />;
    return <BookOpen className="h-4 w-4" />;
  };

  const toggleSubEtapaExpandida = (etapaIndex: number) => {
    setExpandedEtapas(prev => {
      const newState = new Set(prev);
      if (newState.has(etapaIndex)) {
        newState.delete(etapaIndex);
      } else {
        newState.add(etapaIndex);
      }
      return newState;
    });
  };

  const isEtapaExpandida = (index: number): boolean => expandedEtapas.has(index);

  const renderEtapaCard = (etapa: EtapaDesenvolvimento, index: number) => {
    const isEtapaMainExpanded = etapaExpandida === etapa.id;

    return (
      <Reorder.Item
        key={etapa.id}
        value={etapa}
        className="mb-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={`transition-all duration-300 hover:shadow-lg border-l-4 border-l-[#FF6B00] rounded-2xl group ${
            theme === 'dark'
              ? 'bg-[#1E293B] border-gray-800 hover:bg-[#1E293B]/80'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <motion.div
                    className="cursor-grab active:cursor-grabbing p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <GripVertical className="h-4 w-4 text-gray-400" />
                  </motion.div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleEtapaExpandida(etapa.id)}
                    className="p-1 h-8 w-8"
                  >
                    <motion.div
                      animate={{ rotate: isEtapaMainExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </motion.div>
                  </Button>

                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-[#FF6B00]/10 text-[#FF6B00]">
                      {getIconeInteracao(etapa.tipoInteracao)}
                    </div>
                    <CardTitle className={`text-lg font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-[#29335C]'
                    }`}>
                      {etapa.titulo}
                    </CardTitle>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20 rounded-full">
                    <Clock className="h-3 w-3 mr-1" />
                    {etapa.tempoEstimado}
                  </Badge>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editarEtapa(etapa.id)}
                    className="text-gray-500 hover:text-[#FF6B00] h-8 w-8 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <motion.div
              initial={false}
              animate={{
                height: isEtapaMainExpanded ? "auto" : 0,
                opacity: isEtapaMainExpanded ? 1 : 0
              }}
              transition={{ duration: 0.3 }}
              style={{ overflow: "hidden" }}
            >
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Tipo de Interação */}
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                      {etapa.tipoInteracao}
                    </Badge>
                  </div>

                  {/* Descrição */}
                  <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <p className="text-sm leading-relaxed">{etapa.descricao}</p>
                  </div>

                  {/* Recursos usados */}
                  {etapa.recursosUsados.length > 0 && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className={`text-xs font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Recursos Utilizados:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {etapa.recursosUsados.map((recurso, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-full"
                          >
                            {recurso}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sub-etapas */}
                  {etapa.subEtapas && etapa.subEtapas.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => toggleSubEtapaExpandida(index)}>
                        <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Sub-etapas ({etapa.subEtapas.length})
                        </h4>
                        <motion.div
                          animate={{ rotate: isEtapaExpandida(index) ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </motion.div>
                      </div>
                      {etapa.subEtapas?.map((subEtapa, subIndex) => {
                          const isSubEtapaExpandida = expandedEtapas.has(index);
                          return (
                          <motion.div
                            key={subIndex}
                            className="ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700"
                            initial={false}
                            animate={isSubEtapaExpandida ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <CardContent className="pt-2 pb-0">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="p-1 bg-[#E0E7FF]/30 rounded-md text-[#605DEC]">
                                    <Play className="h-3 w-3" />
                                  </div>
                                  <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {subEtapa.titulo}
                                  </p>
                                </div>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {subEtapa.descricao}
                                </p>
                              </div>
                            </CardContent>
                          </motion.div>
                        );
                        })}
                      </div>
                    )}
                </div>
              </CardContent>
            </motion.div>

            {/* Preview quando collapsed */}
            {!isEtapaMainExpanded && (
              <CardContent className="pt-0 pb-4">
                <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <p className="text-sm line-clamp-2">{etapa.descricao}</p>
                  {etapa.descricao.length > 120 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleEtapaExpandida(etapa.id)}
                      className="text-[#FF6B00] text-xs mt-2 h-auto p-0 hover:underline transition-all duration-200 hover:text-[#FF8533]"
                    >
                      Ver mais
                    </Button>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        </motion.div>
      </Reorder.Item>
    );
  };

  return (
    <div className={`w-full h-full ${
      theme === 'dark' ? 'text-white' : 'text-[#29335C]'
    } transition-colors duration-300`}>

      {/* Header com título estilizado */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#FF8533] flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-[#29335C]'}`}>
                Desenvolvimento da Aula
              </h2>
              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {carregandoIA ? 'Gerando etapas via IA...' : `${desenvolvimentoData.etapas.length} etapas • ${desenvolvimentoData.tempoTotalEstimado}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {contextoPlano && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  onClick={regenerarEtapas}
                  disabled={carregandoIA}
                  className="bg-gradient-to-r from-[#FF6B00] to-[#FF8533] hover:from-[#FF8533] hover:to-[#FF6B00] text-white border-0 rounded-xl px-6 py-2 shadow-lg transition-all duration-300"
                >
                  {carregandoIA ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Regenerar IA
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Cards informativos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={`border border-[#FF6B00]/30 rounded-xl ${
            theme === 'dark' ? 'bg-[#1E293B]' : 'bg-white'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FF6B00]/10 rounded-lg">
                  <Clock className="h-5 w-5 text-[#FF6B00]" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Tempo Total
                  </p>
                  <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-[#29335C]'}`}>
                    {desenvolvimentoData.tempoTotalEstimado}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`border border-[#FF6B00]/30 rounded-xl ${
            theme === 'dark' ? 'bg-[#1E293B]' : 'bg-white'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FF6B00]/10 rounded-lg">
                  <BookOpen className="h-5 w-5 text-[#FF6B00]" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total de Etapas
                  </p>
                  <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-[#29335C]'}`}>
                    {desenvolvimentoData.etapas.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`border border-[#FF6B00]/30 rounded-xl ${
            theme === 'dark' ? 'bg-[#1E293B]' : 'bg-white'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FF6B00]/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-[#FF6B00]" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Status
                  </p>
                  <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-[#29335C]'}`}>
                    {carregandoIA ? 'Gerando...' : 'Concluído'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Conteúdo */}
      <ScrollArea className="h-[calc(100vh-300px)] p-6">
        {carregandoIA ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 rounded-2xl">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Lista de Etapas com Drag and Drop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Reorder.Group
                axis="y"
                values={desenvolvimentoData.etapas}
                onReorder={handleReorder}
                className="space-y-4"
              >
                {desenvolvimentoData.etapas.map(renderEtapaCard)}
              </Reorder.Group>
            </motion.div>

            {/* Observações Gerais - Colapsável */}
            {desenvolvimentoData.observacoesGerais && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className={`rounded-2xl border-0 shadow-lg ${
                  theme === 'dark' ? 'bg-[#1E293B]' : 'bg-white'
                }`}>
                  <CardHeader
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1E293B]/80 transition-colors rounded-t-2xl"
                    onClick={() => setObservacoesExpanded(!observacoesExpanded)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-[#FF6B00]/10 rounded-lg">
                          <AlertCircle className="h-5 w-5 text-[#FF6B00]" />
                        </div>
                        Observações Gerais
                      </CardTitle>
                      <motion.div
                        animate={{ rotate: observacoesExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </motion.div>
                    </div>
                  </CardHeader>
                  <motion.div
                    initial={false}
                    animate={{
                      height: observacoesExpanded ? "auto" : 0,
                      opacity: observacoesExpanded ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: "hidden" }}
                  >
                    <CardContent>
                      <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {desenvolvimentoData.observacoesGerais}
                      </p>
                    </CardContent>
                  </motion.div>
                </Card>
              </motion.div>
            )}

            {/* Sugestões da IA */}
            {desenvolvimentoData.sugestoesIA.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className={`border-l-4 border-l-[#FF6B00] rounded-2xl shadow-lg ${
                  theme === 'dark' ? 'bg-[#1E293B]' : 'bg-white'
                }`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-[#FF6B00]/10 rounded-lg">
                        <Sparkles className="h-5 w-5 text-[#FF6B00]" />
                      </div>
                      Sugestões da IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {desenvolvimentoData.sugestoesIA.map((sugestao, index) => (
                        <motion.div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div className="w-2 h-2 rounded-full bg-[#FF6B00] mt-2 flex-shrink-0" />
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {sugestao}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Debug Panel */}
      <DebugPanel
        planoId={planoId}
        show={showDebug}
        onClose={() => setShowDebug(false)}
      />
    </div>
  );
}