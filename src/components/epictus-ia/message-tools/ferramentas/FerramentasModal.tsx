import React from 'react';
import { Wrench } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import AprofundarNoTema from './AprofundarNoTema';
import SimuladorQuestoes from './SimuladorQuestoes';
import EscreverNoCaderno from './EscreverNoCaderno';
import SimularApresentacao from './SimularApresentacao';

interface FerramentasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAprofundarClick: () => void;
  content?: string;
  messageId?: number;
}

export const FerramentasModal: React.FC<FerramentasModalProps> = ({
  open,
  onOpenChange,
  onAprofundarClick,
  content,
  messageId
}) => {
  const handleEscreverNoCadernoClick = () => {
    // Disparar evento personalizado para transformação em caderno
    if (content && messageId) {
      const event = new CustomEvent('transform-to-notebook', {
        detail: { content, messageId }
      });
      document.dispatchEvent(event);
    }

    // Feedback visual
    toast({
      title: "Caderno de Anotações",
      description: "Convertendo conteúdo para formato de caderno...",
      duration: 2000,
    });

    // Fechar o modal de ferramentas após iniciar a ação
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#111827] border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Ferramentas Epictus</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          <AprofundarNoTema onClick={() => {
            onOpenChange(false);
            onAprofundarClick();
          }} />

          <SimuladorQuestoes onClick={() => {
            // Implementação futura
            toast({
              title: "Simulador de questões",
              description: "Iniciando simulador de questões para este tema...",
              duration: 3000,
            });
            onOpenChange(false);
          }} />

          <EscreverNoCaderno 
            onClick={handleEscreverNoCadernoClick}
            content={content}
            messageId={messageId}
          />

          <SimularApresentacao onClick={() => {
            // Implementação futura
            toast({
              title: "Modo Apresentação",
              description: "Iniciando simulação de apresentação deste conteúdo...",
              duration: 3000,
            });
            onOpenChange(false);
          }} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FerramentasModal;