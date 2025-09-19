
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Share2, Check, ExternalLink } from 'lucide-react';
import { gerarLinkCompartilhamento, copiarLinkCompartilhamento } from '@/utils/generateShareLink';
import { useToast } from '@/components/ui/toast-notification';

interface ShareActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityId: string;
  activityTitle: string;
  activityDescription?: string;
}

export const ShareActivityModal: React.FC<ShareActivityModalProps> = ({
  isOpen,
  onClose,
  activityId,
  activityTitle,
  activityDescription
}) => {
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      console.log('📤 ShareActivityModal aberto com activityId:', activityId);
      
      if (activityId && activityId.trim() !== '') {
        const link = gerarLinkCompartilhamento(activityId);
        console.log('🔗 Link gerado:', link);
        setShareLink(link);
      } else {
        console.warn('⚠️ activityId não fornecido ou vazio');
        setShareLink('');
      }
    }
  }, [isOpen, activityId]);

  const handleCopyLink = async () => {
    try {
      if (!activityId || activityId.trim() === '') {
        showToast('ID da atividade não encontrado', 'error');
        return;
      }

      const sucesso = await copiarLinkCompartilhamento(activityId);
      if (sucesso) {
        setCopied(true);
        showToast('Link copiado para a área de transferência!', 'success');
        
        // Reset copied state after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      } else {
        showToast('Erro ao copiar o link', 'error');
      }
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      showToast('Erro ao copiar o link', 'error');
    }
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: activityTitle,
          text: activityDescription || 'Confira esta atividade educacional',
          url: shareLink
        });
        showToast('Atividade compartilhada com sucesso!', 'success');
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Erro ao compartilhar:', error);
          handleCopyLink(); // Fallback para copiar
        }
      }
    } else {
      handleCopyLink(); // Fallback para navegadores sem suporte
    }
  };

  const handleOpenInNewTab = () => {
    window.open(shareLink, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-orange-600" />
            Compartilhar Atividade
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Informações da Atividade */}
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {activityTitle}
            </h3>
            {activityDescription && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {activityDescription}
              </p>
            )}
          </div>

          {/* Campo do Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Link Público da Atividade
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={shareLink}
                readOnly
                className="flex-1 bg-gray-50 dark:bg-gray-800 text-xs"
                placeholder="Gerando link único..."
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="icon"
                className={`transition-colors ${
                  copied 
                    ? 'bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400' 
                    : 'hover:bg-orange-50 hover:border-orange-300 dark:hover:bg-orange-900/30'
                }`}
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {/* Informação sobre código único */}
            {shareLink && shareLink.includes('/') && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">🔒 Link Único e Seguro</p>
                    <p>Este link contém um código único gerado especialmente para esta atividade. 
                    Qualquer pessoa pode acessá-la sem precisar de conta na plataforma.</p>
                  </div>
                </div>
              </div>
            )}
            
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Link público com código único - Funciona sem necessidade de login
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleShareNative}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {navigator.share ? 'Compartilhar' : 'Copiar Link'}
            </Button>
            
            <Button
              onClick={handleOpenInNewTab}
              variant="outline"
              className="flex-1 hover:bg-orange-50 hover:border-orange-300 dark:hover:bg-orange-900/30"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visualizar
            </Button>
          </div>

          {/* Informação Adicional */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>💡 Dica:</strong> Este link público é permanente e pode ser compartilhado em redes sociais, e-mail ou qualquer plataforma de comunicação.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareActivityModal;
