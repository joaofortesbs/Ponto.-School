
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { criarLinkAtividade, regenerarLinkAtividade, AtividadeCompartilhavel } from '@/features/schoolpower/services/gerador-link-atividades-schoolpower';
import { useUserInfo } from '@/features/schoolpower/construction/hooks/useUserInfo';

interface ShareActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityTitle: string;
  activityId?: string;
  activityType?: string;
  activityData?: any;
  preGeneratedLink?: AtividadeCompartilhavel | null; // Link já gerado
  isGeneratingLink?: boolean; // Estado de geração do componente pai
  linkError?: string | null; // Erro do componente pai
}

export const ShareActivityModal: React.FC<ShareActivityModalProps> = ({
  isOpen,
  onClose,
  activityTitle,
  activityId,
  activityType = 'atividade',
  activityData = {},
  preGeneratedLink = null,
  isGeneratingLink: externalIsGeneratingLink = false,
  linkError: externalLinkError = null
}) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [atividade, setAtividade] = useState<AtividadeCompartilhavel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const userInfo = useUserInfo();

  // Busca ou cria o link compartilhável quando o modal abre
  useEffect(() => {
    if (isOpen && activityId && activityTitle) {
      // Reset estado anterior
      setAtividade(null);
      setError(null);
      
      // Se já temos um link pré-gerado, usar ele
      if (preGeneratedLink && preGeneratedLink.linkPublico) {
        console.log('✅ ShareActivityModal: Usando link pré-gerado:', preGeneratedLink.linkPublico);
        setAtividade(preGeneratedLink);
        setLoading(false);
        setError(null);
      } else if (externalLinkError) {
        // Se há erro externo, mostrar ele
        console.log('❌ ShareActivityModal: Erro externo detectado:', externalLinkError);
        setError(externalLinkError);
        setLoading(false);
      } else if (externalIsGeneratingLink) {
        // Se está gerando externamente, mostrar loading
        console.log('⏳ ShareActivityModal: Geração externa em andamento');
        setLoading(true);
        setError(null);
      } else {
        // Caso contrário, gerar novo link
        console.log('🔗 ShareActivityModal: Criando novo link');
        criarOuBuscarLink();
      }
    }
    
    // Limpa estado quando modal fecha
    if (!isOpen) {
      setAtividade(null);
      setError(null);
      setLoading(false);
      setCopied(false);
    }
  }, [isOpen, activityId, activityTitle, preGeneratedLink, externalIsGeneratingLink, externalLinkError]);

  // Atualizar estado quando link externo for gerado
  useEffect(() => {
    if (preGeneratedLink && preGeneratedLink.linkPublico && !atividade) {
      console.log('🔄 ShareActivityModal: Atualizando com link gerado externamente:', preGeneratedLink.linkPublico);
      setAtividade(preGeneratedLink);
      setLoading(false);
      setError(null);
    }
  }, [preGeneratedLink, atividade]);

  // Atualizar estado baseado nos props externos
  useEffect(() => {
    if (externalIsGeneratingLink && !loading) {
      setLoading(true);
      setError(null);
    }
    
    if (externalLinkError && !error) {
      setError(externalLinkError);
      setLoading(false);
    }
  }, [externalIsGeneratingLink, externalLinkError, loading, error]);

  const criarOuBuscarLink = async () => {
    if (!activityId || !activityTitle) {
      console.error('❌ Dados obrigatórios não fornecidos:', { activityId, activityTitle });
      setError('Dados da atividade não encontrados');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔗 Iniciando criação de link compartilhável para:', activityTitle);
      console.log('📋 Dados da atividade:', {
        id: activityId,
        titulo: activityTitle,
        tipo: activityType,
        userInfo: userInfo.userId
      });

      const novaAtividade = await criarLinkAtividade({
        id: activityId,
        titulo: activityTitle,
        tipo: activityType,
        dados: activityData,
        criadoPor: userInfo.userId || 'usuario-anonimo'
      });

      console.log('🔍 Resposta completa da API:', novaAtividade);

      if (novaAtividade) {
        if (novaAtividade.linkPublico) {
          setAtividade(novaAtividade);
          console.log('✅ Link criado com sucesso:', novaAtividade.linkPublico);
          console.log('🎯 Código único gerado:', novaAtividade.codigoUnico);
        } else {
          console.error('❌ Link público ausente na resposta:', novaAtividade);
          setError('Link não foi gerado corretamente');
        }
      } else {
        console.error('❌ Resposta nula da API');
        setError('Falha na comunicação com o servidor');
      }
    } catch (error) {
      console.error('❌ Erro completo ao criar link:', error);
      setError(`Erro: ${error.message || 'Falha desconhecida'}`);
    } finally {
      setLoading(false);
    }
  };

  const regenerarLink = async () => {
    if (!activityId) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Regenerando link para:', activityId);

      const atividadeAtualizada = await regenerarLinkAtividade(activityId);

      if (atividadeAtualizada) {
        setAtividade(atividadeAtualizada);
        toast({
          title: "Link regenerado!",
          description: "Um novo link foi gerado para esta atividade.",
        });
      } else {
        setError('Erro ao regenerar link');
      }
    } catch (error) {
      console.error('❌ Erro ao regenerar link:', error);
      setError('Erro ao regenerar link');
    } finally {
      setLoading(false);
    }
  };

  const shareLink = atividade?.linkPublico || '';
  
  // Debug: Log do estado atual
  useEffect(() => {
    console.log('🔍 Estado atual do modal:', {
      atividade,
      shareLink,
      loading: loading || externalIsGeneratingLink,
      error: error || externalLinkError,
      isOpen,
      preGeneratedLink: !!preGeneratedLink,
      externalStates: {
        isGeneratingLink: externalIsGeneratingLink,
        linkError: externalLinkError
      }
    });
  }, [atividade, shareLink, loading, error, isOpen, preGeneratedLink, externalIsGeneratingLink, externalLinkError]);

  const handleCopyLink = async () => {
    if (!shareLink) {
      console.error('❌ Tentativa de copiar link vazio');
      return;
    }

    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      console.log('✅ Link copiado:', shareLink);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('❌ Erro ao copiar link:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-[100] p-4"
        onClick={onClose}
      >
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cabeçalho do Modal */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Compartilhar
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Título da Atividade */}
          <div className="mb-6">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 text-center">
              {activityTitle}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
              Copie o link abaixo para compartilhar esta atividade
            </p>
          </div>

          {/* Campo do Link */}
          <div className="space-y-4">
            {(loading || externalIsGeneratingLink) ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  Gerando link...
                </span>
              </div>
            ) : (error || externalLinkError) ? (
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
                <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error || externalLinkError}</p>
                <Button
                  onClick={criarOuBuscarLink}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar novamente
                </Button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Input
                    value={shareLink}
                    readOnly
                    placeholder={shareLink ? shareLink : "Gerando link..."}
                    className="pr-24 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm"
                  />
                  {/* Status do Link */}
                  {shareLink ? (
                    <div className="absolute -bottom-6 left-0 text-xs text-green-600 dark:text-green-400">
                      ✓ Link pronto para compartilhar ({shareLink.length} caracteres)
                    </div>
                  ) : (
                    <div className="absolute -bottom-6 left-0 text-xs text-blue-600 dark:text-blue-400">
                      ⏳ Gerando link único...
                    </div>
                  )}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <button
                      onClick={regenerarLink}
                      disabled={!shareLink || loading}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Regenerar link"
                    >
                      <RefreshCw className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={handleCopyLink}
                      disabled={!shareLink || loading}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Copiar link"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Informações adicionais */}
                {atividade && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Link criado em {new Date(atividade.criadoEm).toLocaleDateString('pt-BR')} • 
                    Código: {atividade.codigoUnico}
                  </div>
                )}

                {/* Feedback de Cópia */}
                <AnimatePresence>
                  {copied && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center"
                    >
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                        ✓ Link copiado com sucesso!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl"
            >
              Fechar
            </Button>
            <Button
              onClick={handleCopyLink}
              disabled={loading || externalIsGeneratingLink || !!error || !!externalLinkError || !shareLink}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? 'Copiado!' : 'Copiar Link'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShareActivityModal;
