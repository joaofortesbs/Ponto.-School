import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, Download, Share2, Eye, Calendar, User, 
  Clock, ArrowLeft, ExternalLink, Copy, Check,
  AlertCircle, Loader2, FileText, Play, Target,
  Menu, X, Home, LogIn, UserPlus, School, Brain, Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/toast';
import { buscarAtividadeCompartilhada, AtividadeCompartilhavel } from '../services/gerador-link-atividades-schoolpower';

// Import dos componentes de preview das atividades
import { PlanoAulaPreview } from '../activities/plano-aula/PlanoAulaPreview';
import { SequenciaDidaticaPreview } from '../activities/sequencia-didatica/SequenciaDidaticaPreview';
import { FlashCardsPreview } from '../activities/flash-cards/FlashCardsPreview';
import { MapaMentalPreview } from '../activities/mapa-mental/MapaMentalPreview';

// Componente de Preview Genérico para atividades não específicas
const GenericActivityPreview: React.FC<{ data: any; activityData: any }> = ({ data, activityData }) => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">{activityData?.title || 'Atividade Educacional'}</CardTitle>
            <p className="text-gray-600 text-sm">{activityData?.type || 'Conteúdo Educacional'}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Informações Básicas */}
        {activityData?.description && (
          <div>
            <h3 className="font-semibold text-lg mb-2">Descrição</h3>
            <p className="text-gray-700 leading-relaxed">{activityData.description}</p>
          </div>
        )}

        {/* Conteúdo da Atividade */}
        {data && Object.keys(data).length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-3">Conteúdo da Atividade</h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              {Object.entries(data).map(([key, value], index) => {
                if (typeof value === 'string' || typeof value === 'number') {
                  return (
                    <div key={index} className="mb-3 last:mb-0">
                      <span className="font-medium text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                      </span>
                      <p className="text-gray-800 dark:text-gray-200 mt-1">{String(value)}</p>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}

        {/* Informação de Uso */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Como usar esta atividade
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Esta atividade foi criada com a plataforma Ponto School e pode ser utilizada 
                livremente para fins educacionais. Você pode adaptar o conteúdo conforme suas necessidades.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface InterfaceCompartilharAtividadeProps {
  activityData?: AtividadeCompartilhavel | null;
  isPublicView?: boolean;
  onLoginRedirect?: () => void;
}

export const InterfaceCompartilharAtividade: React.FC<InterfaceCompartilharAtividadeProps> = ({
  activityData: propActivityData,
  isPublicView = false,
  onLoginRedirect
}) => {
  const { activityId, uniqueCode } = useParams<{ activityId: string; uniqueCode: string }>();
  const navigate = useNavigate();

  // Estados
  const [atividade, setAtividade] = useState<AtividadeCompartilhavel | null>(propActivityData || null);
  const [carregando, setCarregando] = useState(!propActivityData);
  const [erro, setErro] = useState<string | null>(null);
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  // IDs finais (props ou params)  
  const finalActivityId = activityId;
  const finalUniqueCode = uniqueCode;

  /**
   * Carrega a atividade compartilhada</old_str>

  /**
   * Carrega a atividade compartilhada
   */
  useEffect(() => {
    // Se já temos dados via props, não precisa buscar
    if (propActivityData) {
      setAtividade(propActivityData);
      setCarregando(false);
      return;
    }

    // Senão, busca via parâmetros da URL
    const carregarAtividade = async () => {
      if (!finalActivityId || !finalUniqueCode) {
        setErro('Link inválido: parâmetros faltando');
        setCarregando(false);
        return;
      }

      try {
        console.log('🔍 [PÚBLICO] Carregando atividade compartilhada:', { finalActivityId, finalUniqueCode });

        const atividadeEncontrada = await buscarAtividadeCompartilhada(finalActivityId, finalUniqueCode);

        if (!atividadeEncontrada) {
          setErro('Atividade não encontrada ou link expirado');
          setCarregando(false);
          return;
        }

        setAtividade(atividadeEncontrada);
        console.log('✅ [PÚBLICO] Atividade carregada:', atividadeEncontrada.titulo);

        // Configurar título da página
        document.title = `${atividadeEncontrada.titulo} - Ponto School`;

      } catch (error) {
        console.error('❌ [PÚBLICO] Erro ao carregar atividade:', error);
        setErro('Erro ao carregar atividade compartilhada');
      } finally {
        setCarregando(false);
      }
    };

    carregarAtividade();
  }, [finalActivityId, finalUniqueCode, propActivityData]);

  /**
   * Copia o link para a área de transferência
   */
  const copiarLink = async () => {
    if (!atividade) return;

    try {
      await navigator.clipboard.writeText(atividade.linkPublico);
      setLinkCopiado(true);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para sua área de transferência.",
      });

      setTimeout(() => setLinkCopiado(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive"
      });
    }
  };

  /**
   * Obtém o ícone baseado no tipo da atividade
   */
  const getAtividadeIcon = (tipo: string) => {
    const iconMap: { [key: string]: any } = {
      'plano-aula': BookOpen,
      'sequencia-didatica': FileText,
      'flash-cards': Target,
      'mapa-mental': Play,
      'lista-exercicios': FileText,
      'quiz-interativo': Target,
      'quadro-interativo': Play,
      'default': BookOpen
    };

    return iconMap[tipo] || iconMap.default;
  };

  /**
   * Renderiza o preview da atividade baseado no tipo
   */
  const renderPreviewAtividade = () => {
    if (!atividade) return null;

    const previewProps = {
      data: atividade.dados,
      activityData: {
        id: atividade.id,
        title: atividade.titulo,
        type: atividade.tipo,
        description: `Atividade compartilhada via Ponto School`
      }
    };

    switch (atividade.tipo) {
      case 'plano-aula':
        return <PlanoAulaPreview {...previewProps} />;

      case 'sequencia-didatica':
        return <SequenciaDidaticaPreview {...previewProps} />;

      case 'flash-cards':
        return <FlashCardsPreview {...previewProps} />;

      case 'mapa-mental':
        return <MapaMentalPreview {...previewProps} />;

      default:
        return <GenericActivityPreview {...previewProps} />;
    }
  };

  /**
   * Renderização condicional baseada no estado
   */
  if (carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-96 mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Carregando atividade...</h3>
            <p className="text-gray-600">
              Aguarde enquanto buscamos a atividade compartilhada.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-96 mx-4">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2 text-red-700">Erro ao carregar</h3>
            <p className="text-red-600 mb-6">{erro}</p>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.reload()}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Tentar Novamente
              </Button>
              <Button 
                onClick={() => window.open('/', '_blank')}
                variant="outline"
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Ir para Ponto School
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!atividade) {
    return null;
  }

  const AtividadeIcon = getAtividadeIcon(atividade.tipo);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header da página pública */}
      <header className="bg-white dark:bg-gray-800 border-b border-orange-200 dark:border-gray-700 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PS</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Ponto School
              </span>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                Atividade Pública
              </Badge>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={copiarLink}
              >
                {linkCopiado ? (
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {linkCopiado ? 'Copiado!' : 'Copiar Link'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Acessar Plataforma
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMenuMobileAberto(!menuMobileAberto)}
              >
                {menuMobileAberto ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuMobileAberto && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copiarLink}
                  className="w-full justify-start"
                >
                  {linkCopiado ? (
                    <Check className="w-4 h-4 mr-2 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {linkCopiado ? 'Copiado!' : 'Copiar Link'}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('/', '_blank')}
                  className="w-full justify-start"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Acessar Plataforma
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho da atividade */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <AtividadeIcon className="w-8 h-8 text-white" />
                  </div>

                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {atividade.titulo}
                    </CardTitle>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                        {atividade.tipo.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>

                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(atividade.criadoEm).toLocaleDateString('pt-BR')}
                      </div>

                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Criado por School Power
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Aviso sobre acesso público */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Atividade Compartilhada Publicamente
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Esta atividade foi compartilhada publicamente pela plataforma Ponto School. 
                    Você pode visualizar e utilizar o conteúdo livremente para fins educacionais.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preview da atividade */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {renderPreviewAtividade()}
        </motion.div>

        {/* Call-to-Action para Login (apenas em modo público) */}
        {isPublicView && (
          <div className="mt-8">
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                      <School className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Gostou desta atividade?
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                    Acesse a Ponto School e crie suas próprias atividades educacionais com inteligência artificial!
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={onLoginRedirect}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Fazer Login
                    </Button>

                    <Button 
                      onClick={onLoginRedirect}
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Criar Conta Gratuita
                    </Button>
                  </div>

                  <div className="mt-4 flex justify-center items-center text-sm text-gray-500 dark:text-gray-400">
                    <Brain className="h-4 w-4 mr-1" />
                    Crie atividades ilimitadas com IA
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main></old_str>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">PS</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Ponto School
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Plataforma educacional com inteligência artificial para criação de atividades personalizadas.
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
              © 2024 Ponto School. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InterfaceCompartilharAtividade;