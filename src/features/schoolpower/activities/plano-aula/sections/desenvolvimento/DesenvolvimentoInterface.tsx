
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
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
  Bug
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
  const [planoId, setPlanoId] = useState<string>('');
  const [showDebug, setShowDebug] = useState(false);

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

  const getIconeInteracao = (tipo: string) => {
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes('apresentação')) return <Play className="h-4 w-4" />;
    if (tipoLower.includes('prática') || tipoLower.includes('exercício')) return <CheckCircle className="h-4 w-4" />;
    if (tipoLower.includes('grupo') || tipoLower.includes('debate')) return <Users className="h-4 w-4" />;
    return <BookOpen className="h-4 w-4" />;
  };

  const renderEtapaCard = (etapa: EtapaDesenvolvimento) => {
    const isExpandida = etapaExpandida === etapa.id;
    
    return (
      <Card 
        key={etapa.id} 
        className={`mb-4 transition-all duration-300 hover:shadow-md border-l-4 border-l-[#FF6B00] ${
          theme === 'dark' 
            ? 'bg-[#1E293B] border-gray-800 hover:bg-[#1E293B]/80' 
            : 'bg-white border-gray-200 hover:bg-gray-50'
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleEtapaExpandida(etapa.id)}
                className="p-1 h-8 w-8"
              >
                {isExpandida ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              
              <div className="flex items-center gap-2">
                {getIconeInteracao(etapa.tipoInteracao)}
                <CardTitle className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-[#29335C]'
                }`}>
                  {etapa.titulo}
                </CardTitle>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20">
                <Clock className="h-3 w-3 mr-1" />
                {etapa.tempoEstimado}
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editarEtapa(etapa.id)}
                className="text-gray-500 hover:text-[#FF6B00] h-8 w-8 p-1"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Tipo de Interação */}
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {etapa.tipoInteracao}
              </Badge>
            </div>
            
            {/* Descrição expandida/resumida */}
            <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {isExpandida ? (
                <p className="text-sm leading-relaxed">{etapa.descricao}</p>
              ) : (
                <p className="text-sm line-clamp-2">{etapa.descricao}</p>
              )}
              
              {!isExpandida && etapa.descricao.length > 120 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleEtapaExpandida(etapa.id)}
                  className="text-[#FF6B00] text-xs mt-1 h-auto p-0 hover:underline"
                >
                  Expandir
                </Button>
              )}
            </div>
            
            {/* Recursos usados */}
            {isExpandida && etapa.recursosUsados.length > 0 && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className={`text-xs font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Recursos Utilizados:
                </p>
                <div className="flex flex-wrap gap-1">
                  {etapa.recursosUsados.map((recurso, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    >
                      {recurso}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`w-full h-full ${
      theme === 'dark' ? 'bg-[#001427] text-white' : 'bg-[#f7f9fa] text-[#29335C]'
    } transition-colors duration-300`}>
      
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
              <Play className="h-6 w-6 text-[#FF6B00]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#29335C] dark:text-white">
                Desenvolvimento da Aula
              </h2>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {carregandoIA ? 'Gerando etapas via IA...' : `${desenvolvimentoData.etapas.length} etapas • ${desenvolvimentoData.tempoTotalEstimado}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {contextoPlano && (
              <Button
                onClick={regenerarEtapas}
                disabled={carregandoIA}
                variant="outline"
                className="border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white"
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
            )}
            
            <Button
              onClick={() => setShowDebug(true)}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-orange-500"
              title="Debug Panel"
            >
              <Bug className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Informações gerais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-3 rounded-lg ${
            theme === 'dark' ? 'bg-[#1E293B]' : 'bg-white'
          } border border-gray-200 dark:border-gray-800`}>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-[#FF6B00]" />
              <span className="text-sm font-medium">Tempo Total</span>
            </div>
            <p className="text-lg font-bold">{desenvolvimentoData.tempoTotalEstimado}</p>
          </div>
          
          <div className={`p-3 rounded-lg ${
            theme === 'dark' ? 'bg-[#1E293B]' : 'bg-white'
          } border border-gray-200 dark:border-gray-800`}>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-[#FF6B00]" />
              <span className="text-sm font-medium">Etapas</span>
            </div>
            <p className="text-lg font-bold">{desenvolvimentoData.etapas.length}</p>
          </div>
          
          <div className={`p-3 rounded-lg ${
            theme === 'dark' ? 'bg-[#1E293B]' : 'bg-white'
          } border border-gray-200 dark:border-gray-800`}>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-[#FF6B00]" />
              <span className="text-sm font-medium">Status</span>
            </div>
            <p className="text-sm font-bold text-green-600">
              {carregandoIA ? 'Gerando...' : 'Pronto'}
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <ScrollArea className="h-[calc(100vh-300px)] p-6">
        {carregandoIA ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
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
            {/* Lista de Etapas */}
            <div>
              {desenvolvimentoData.etapas.map(renderEtapaCard)}
            </div>
            
            {/* Observações Gerais */}
            {desenvolvimentoData.observacoesGerais && (
              <Card className={`${
                theme === 'dark' ? 'bg-[#1E293B] border-gray-800' : 'bg-white border-gray-200'
              }`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-[#FF6B00]" />
                    Observações Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {desenvolvimentoData.observacoesGerais}
                  </p>
                </CardContent>
              </Card>
            )}
            
            {/* Sugestões da IA */}
            {desenvolvimentoData.sugestoesIA.length > 0 && (
              <Card className={`border-l-4 border-l-[#FF6B00] ${
                theme === 'dark' ? 'bg-[#1E293B] border-gray-800' : 'bg-white border-gray-200'
              }`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#FF6B00]" />
                    Sugestões da IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {desenvolvimentoData.sugestoesIA.map((sugestao, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#FF6B00] mt-2 flex-shrink-0" />
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {sugestao}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
