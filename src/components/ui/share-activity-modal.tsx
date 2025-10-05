
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2, Loader2, RefreshCw, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [isPermissionsExpanded, setIsPermissionsExpanded] = useState(false);
  const [editorTemas, setEditorTemas] = useState(false);
  const [editorMaterial, setEditorMaterial] = useState(false);
  const userInfo = useUserInfo();

  // Busca ou cria o link compartilhável quando o modal abre
  useEffect(() => {
    if (isOpen && activityId && activityTitle) {
      console.log('🚀 Modal aberto - iniciando geração de link imediatamente');
      console.log('📋 Dados disponíveis:', { activityId, activityTitle, activityType, userInfo: userInfo.userId });
      
      // Reset estado anterior
      setAtividade(null);
      setError(null);
      setLoading(true);
      
      // Criar link imediatamente
      criarOuBuscarLink();
    }
    
    // Limpa estado quando modal fecha
    if (!isOpen) {
      console.log('🔒 Modal fechado - limpando estado');
      setAtividade(null);
      setError(null);
      setLoading(false);
      setCopied(false);
    }
  }, [isOpen, activityId, activityTitle]);

  const criarOuBuscarLink = async () => {
    if (!activityId || !activityTitle) {
      console.error('❌ [MODAL] Dados obrigatórios não fornecidos:', { activityId, activityTitle });
      setError('Dados da atividade não encontrados');
      setLoading(false);
      return;
    }

    console.log('🔗 [MODAL] Iniciando busca do código único no banco Neon');
    console.log('📋 [MODAL] Dados da atividade:', {
      id: activityId,
      titulo: activityTitle,
      tipo: activityType || 'atividade'
    });

    try {
      // 1. BUSCAR O CÓDIGO ÚNICO DO BANCO NEON
      const userId = localStorage.getItem('user_id');
      
      if (!userId) {
        console.error('❌ [MODAL] Usuário não autenticado');
        setError('Você precisa estar logado para compartilhar atividades');
        setLoading(false);
        return;
      }

      console.log('🔍 [MODAL] Buscando código único do banco Neon...');
      console.log('👤 [MODAL] User ID:', userId);
      console.log('🎯 [MODAL] Activity ID:', activityId);
      
      // Importar serviço do banco Neon
      const { atividadesNeonService } = await import('@/services/atividadesNeonService');
      
      // Buscar todas as atividades do usuário
      const resultado = await atividadesNeonService.buscarAtividadesUsuario(userId);
      
      if (!resultado.success || !resultado.data) {
        console.error('❌ [MODAL] Erro ao buscar atividades do banco');
        setError('Você precisa salvar a atividade primeiro! Clique no botão verde 💾 "Salvar Atividades"');
        setLoading(false);
        return;
      }

      console.log('✅ [MODAL] Atividades encontradas no banco:', resultado.data.length);
      
      // Procurar a atividade atual pelo tipo
      const atividadeNoBanco = resultado.data.find(ativ => ativ.tipo === activityId);
      
      if (!atividadeNoBanco) {
        console.error('❌ [MODAL] Atividade não encontrada no banco');
        console.log('📋 [MODAL] Atividades disponíveis:', resultado.data.map(a => a.tipo));
        setError('Esta atividade ainda não foi salva! Clique no botão verde 💾 "Salvar Atividades" antes de compartilhar.');
        setLoading(false);
        return;
      }

      // 2. USAR O CÓDIGO ÚNICO DO BANCO (que está na coluna ID)
      const codigoUnico = atividadeNoBanco.id;
      const linkPublico = `${window.location.origin}/atividade/${codigoUnico}`;
      
      console.log('✅ [MODAL] Código único encontrado no banco:', codigoUnico);
      console.log('🔗 [MODAL] Link gerado:', linkPublico);

      // 3. CRIAR OBJETO DE ATIVIDADE PARA O MODAL
      const atividadeCompartilhavel: AtividadeCompartilhavel = {
        id: codigoUnico,
        titulo: activityTitle,
        descricao: atividadeNoBanco.id_json?.description || '',
        tipo: atividadeNoBanco.tipo,
        dados: atividadeNoBanco.id_json,
        customFields: atividadeNoBanco.id_json?.customFields || {},
        professorNome: userInfo.name || 'Professor',
        professorAvatar: userInfo.avatar,
        schoolPoints: atividadeNoBanco.id_json?.schoolPoints || 100,
        criadoPor: userId,
        criadoEm: atividadeNoBanco.created_at || new Date().toISOString(),
        codigoUnico: codigoUnico,
        linkPublico: linkPublico,
        ativo: true,
        disciplina: atividadeNoBanco.id_json?.disciplina,
        nivel: atividadeNoBanco.id_json?.nivel,
        tempo_estimado: atividadeNoBanco.id_json?.tempo_estimado
      };

      setAtividade(atividadeCompartilhavel);
      setError(null);
      
      console.log('✅ [MODAL] Link configurado com código do banco:', linkPublico);
      console.log('🔑 [MODAL] Código único usado:', codigoUnico);
      
    } catch (error) {
      console.error('❌ [MODAL] Erro completo ao buscar link:', error);
      setError('Erro ao gerar link de compartilhamento. Verifique se a atividade foi salva.');
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
  
  // Debug: Log do estado atual e retry automático se necessário
  useEffect(() => {
    console.log('🔍 [DEBUG] Estado atual do modal:', {
      isOpen,
      activityId,
      activityTitle,
      atividade: atividade ? {
        id: atividade.id,
        titulo: atividade.titulo,
        linkPublico: atividade.linkPublico,
        codigoUnico: atividade.codigoUnico
      } : null,
      shareLink,
      loading,
      error
    });

    // Se o modal está aberto, temos IDs válidos, mas não há link nem está carregando nem há erro
    if (isOpen && activityId && activityTitle && !shareLink && !loading && !error) {
      console.log('🔄 [RETRY] Link não gerado, tentando novamente automaticamente');
      criarOuBuscarLink();
    }
  }, [atividade, shareLink, loading, error, isOpen, activityId, activityTitle]);

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
          <div className="space-y-4 relative">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-8 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  Gerando link único...
                </span>
                <div className="text-xs text-gray-500 dark:text-gray-500 text-center">
                  Criando código de compartilhamento para:<br />
                  <span className="font-medium text-orange-600 dark:text-orange-400">{activityTitle}</span>
                </div>
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
                    placeholder={shareLink ? shareLink : "Gerando link..."}
                    className="pr-24 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm"
                  />
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

                {/* Card de Permissões */}
                <div className="relative">
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border-2 border-orange-200 dark:border-orange-700 overflow-hidden">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsPermissionsExpanded(!isPermissionsExpanded);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-orange-100/50 dark:hover:bg-orange-800/30 transition-all duration-200 h-12"
                      type="button"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                          Permissões
                        </span>
                      </div>
                      <motion.div
                        animate={{ rotate: isPermissionsExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence>
                      {isPermissionsExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-4 border-t border-orange-200 dark:border-orange-700 pt-4">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="editor-temas"
                                checked={editorTemas}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  setEditorTemas(e.target.checked);
                                }}
                                className="w-4 h-4 text-orange-600 bg-white border-orange-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-orange-900/30 dark:border-orange-600"
                              />
                              <label 
                                htmlFor="editor-temas" 
                                className="text-sm font-medium text-orange-800 dark:text-orange-200 cursor-pointer select-none"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Editor de temas
                              </label>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="editor-material"
                                checked={editorMaterial}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  setEditorMaterial(e.target.checked);
                                }}
                                className="w-4 h-4 text-orange-600 bg-white border-orange-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-orange-900/30 dark:border-orange-600"
                              />
                              <label 
                                htmlFor="editor-material" 
                                className="text-sm font-medium text-orange-800 dark:text-orange-200 cursor-pointer select-none"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Editar Material
                              </label>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

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
