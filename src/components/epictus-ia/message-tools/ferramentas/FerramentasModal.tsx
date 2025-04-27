
import React from 'react';
import { Wrench, X } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import AprofundarNoTema from './AprofundarNoTema';
import SimuladorQuestoes from './SimuladorQuestoes';
import EscreverNoCaderno from './EscreverNoCaderno';
import SimularApresentacao from './SimularApresentacao';

interface FerramentasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAprofundarClick: () => void;
}

const FerramentasModal: React.FC<FerramentasModalProps> = ({
  open,
  onOpenChange,
  onAprofundarClick
}) => {
  
  const handleSimuladorQuestoes = () => {
    toast({
      title: "Simulador de questões",
      description: "Iniciando simulador de questões para este tema...",
      duration: 3000,
    });
    onOpenChange(false);
  };
  
  const handleEscreverNoCaderno = () => {
    toast({
      title: "Caderno de Anotações",
      description: "Convertendo conteúdo para formato de caderno...",
      duration: 2000,
    });
    onOpenChange(false);
  };
  
  const handleSimularApresentacao = () => {
    toast({
      title: "Modo Apresentação",
      description: "Iniciando simulação de apresentação deste conteúdo...",
      duration: 3000,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-[#1A2634] to-[#253245] border-[#3A4B5C]/50 text-white p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0D23A0] to-[#5B21BD] p-4">
          <h2 className="text-lg font-semibold flex items-center space-x-2">
            <Wrench className="h-5 w-5 mr-2" />
            Ferramentas Epictus IA
          </h2>
          <p className="text-sm text-white/70 mt-1">
            Transforme este conteúdo com nossas ferramentas inteligentes
          </p>
        </div>

        <div className="p-4 grid grid-cols-1 gap-3">
          <AprofundarNoTema onClick={() => {
            onOpenChange(false);
            onAprofundarClick();
          }} />
          
          <SimuladorQuestoes onClick={handleSimuladorQuestoes} />
          
          <EscreverNoCaderno onClick={handleEscreverNoCaderno} />
          
          <SimularApresentacao onClick={handleSimularApresentacao} />
        </div>
        
        <div className="bg-[#1A2634]/70 border-t border-[#3A4B5C]/30 p-3 flex justify-end">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded text-sm bg-[#2A3645] hover:bg-[#3A4B5C] text-white transition-colors"
          >
            Fechar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FerramentasModal;
