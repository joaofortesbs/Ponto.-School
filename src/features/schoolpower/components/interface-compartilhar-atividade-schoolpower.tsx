
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, Download, Share2, Eye, Calendar, User, 
  Clock, ArrowLeft, ExternalLink, Copy, Check,
  AlertCircle, Loader2, FileText, Play, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { buscarAtividadeCompartilhada, AtividadeCompartilhavel } from '../services/gerador-link-atividades-schoolpower';

// Import dos componentes de preview das atividades
import { PlanoAulaPreview } from '../activities/plano-aula/PlanoAulaPreview';
import { SequenciaDidaticaPreview } from '../activities/sequencia-didatica/SequenciaDidaticaPreview';
import { FlashCardsPreview } from '../activities/flash-cards/FlashCardsPreview';
import { MapaMentalPreview } from '../activities/mapa-mental/MapaMentalPreview';

interface InterfaceCompartilharAtividadeProps {
  activityId?: string;
  uniqueCode?: string;
}

export const InterfaceCompartilharAtividade: React.FC<InterfaceCompartilharAtividadeProps> = ({
  activityId: propActivityId,
  uniqueCode: propUniqueCode
}) => {
  const { activityId, uniqueCode } = useParams();
  const navigate = useNavigate();
  
  // Estados
  const [atividade, setAtividade] = useState<AtividadeCompartilhavel | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [linkCopiado, setLinkCopiado] = useState(false);

  // IDs finais (props ou params)
  const finalActivityId = propActivityId || activityId;
  const finalUniqueCode = propUniqueCode || uniqueCode;

  /**
   * Carrega a atividade compartilhada
   */
  useEffect(() => {
    const carregarAtividade = async () => {
      if (!finalActivityId || !finalUniqueCode) {
        setErro('Link inválido: parâmetros faltando');
        setCarregando(false);
        return;
      }

      try {
        console.log('🔍 Carregando atividade compartilhada:', { finalActivityId, finalUniqueCode });
        
        const atividadeEncontrada = await buscarAtividadeCompartilhada(finalActivityId, finalUniqueCode);
        
        if (!atividadeEncontrada) {
          setErro('Atividade não encontrada ou link expirado');
          setCarregando(false);
          return;
        }

        setAtividade(atividadeEncontrada);
        console.log('✅ Atividade carregada:', atividadeEncontrada.titulo);
        
      } catch (error) {
        console.error('❌ Erro ao carregar atividade:', error);
        setErro('Erro ao carregar atividade compartilhada');
      } finally {
        setCarregando(false);
      }
    };

    carregarAtividade();
  }, [finalActivityId, finalUniqueCode]);

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
        type: atividade.tipo
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
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Preview não disponível</h3>
              <p className="text-gray-600">
                O preview para este tipo de atividade ainda não está disponível.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  /**
   * Renderização condicional baseada no estado
   */
  if (carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-orange-600" />
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
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2 text-red-700">Erro ao carregar</h3>
            <p className="text-red-600 mb-6">{erro}</p>
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao início
            </Button>
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
      <div className="bg-white dark:bg-gray-800 border-b border-orange-200 dark:border-gray-700 shadow-sm">
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
            </div>

            {/* Ações do Header */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={copiarLink}
                className="hidden sm:flex"
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
                <span className="hidden sm:inline">Acessar</span> Plataforma
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho da atividade */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <AtividadeIcon className="w-8 h-8 text-white" />
                  </div>
                  
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {atividade.titulo}
                    </CardTitle>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
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

                {/* Ações mobile */}
                <div className="flex sm:hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copiarLink}
                  >
                    {linkCopiado ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </Button>
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
                    Você pode visualizar e utilizar o conteúdo livremente.
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

        {/* Rodapé da página pública */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
        >
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Gostou desta atividade?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Acesse a plataforma Ponto School e crie suas próprias atividades personalizadas com IA.
              </p>
              <Button 
                onClick={() => window.open('/', '_blank')}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Acessar Ponto School
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default InterfaceCompartilharAtividade;
