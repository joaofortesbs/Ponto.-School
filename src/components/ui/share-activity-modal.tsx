
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
}

export const ShareActivityModal: React.FC<ShareActivityModalProps> = ({
  isOpen,
  onClose,
  activityTitle,
  activityId,
  activityType = 'atividade',
  activityData = {}
}) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [atividade, setAtividade] = useState<AtividadeCompartilhavel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const userInfo = useUserInfo();

  // Busca ou cria o link compartilhável quando o modal abre
  useEffect(() => {
    if (isOpen && activityId && activityTitle) {
      criarOuBuscarLink();
    }
  }, [isOpen, activityId, activityTitle]);

  const criarOuBuscarLink = async () => {
    if (!activityId || !activityTitle) return;

    setLoading(true);
    setError(null);
    setAtividade(null); // Limpa atividade anterior

    try {
      console.log('🔗 Criando link compartilhável para:', activityTitle);

      const novaAtividade = await criarLinkAtividade({
        id: activityId,
        titulo: activityTitle,
        tipo: activityType,
        dados: activityData,
        criadoPor: userInfo.userId || 'usuario-anonimo'
      });

      console.log('🔍 Resposta da API:', novaAtividade);

      if (novaAtividade && novaAtividade.linkPublico) {
        setAtividade(novaAtividade);
        console.log('✅ Link criado e configurado:', novaAtividade.linkPublico);
      } else {
        console.error('❌ Link público não encontrado na resposta:', novaAtividade);
        setError('Erro ao gerar link de compartilhamento');
      }
    } catch (error) {
      console.error('❌ Erro ao criar link:', error);
      setError('Erro ao gerar link de compartilhamento');
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
      loading,
      error,
      isOpen
    });
  }, [atividade, shareLink, loading, error, isOpen]);

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
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  Gerando link...
                </span>
              </div>
            ) : error ? (
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
                <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
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
                    placeholder="Gerando link..."
                    className="pr-24 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm"
                  />
                  {/* Debug: Mostrar se tem link */}
                  {shareLink && (
                    <div className="absolute -bottom-6 left-0 text-xs text-green-600 dark:text-green-400">
                      ✓ Link disponível ({shareLink.length} caracteres)
                    </div>
                  )}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <button
                      onClick={regenerarLink}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      title="Regenerar link"
                    >
                      <RefreshCw className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
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
              disabled={loading || !!error}
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
