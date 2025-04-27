import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AprofundarNoTema from './AprofundarNoTema';
import SimuladorQuestoes from './SimuladorQuestoes';
import EscreverNoCaderno from './EscreverNoCaderno';
import SimularApresentacao from './SimularApresentacao';
import { X } from 'lucide-react';

interface FerramentasModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
  messageContent?: string;
}

const FerramentasModal: React.FC<FerramentasModalProps> = ({ 
  isOpen, 
  onClose,
  initialTab = "aprofundar",
  messageContent = "" 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-indigo-900/50">
        <DialogHeader className="bg-indigo-900 -mx-6 -mt-6 px-6 py-4 rounded-t-lg flex justify-between items-center">
          <div>
            <DialogTitle className="text-white">Ferramentas Epictus IA</DialogTitle>
            <DialogDescription className="text-indigo-200">
              Transforme este conteúdo com nossas ferramentas inteligentes
            </DialogDescription>
          </div>
          <button 
            onClick={onClose}
            className="text-indigo-200 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </DialogHeader>

        <Tabs defaultValue={initialTab} className="pt-2">
          <TabsList className="w-full mb-4 bg-slate-800">
            <TabsTrigger value="aprofundar" className="flex-1 data-[state=active]:bg-indigo-700">Aprofundar no tema</TabsTrigger>
            <TabsTrigger value="simulador" className="flex-1 data-[state=active]:bg-indigo-700">Simulador de questões</TabsTrigger>
            <TabsTrigger value="caderno" className="flex-1 data-[state=active]:bg-indigo-700">Escrever no Caderno</TabsTrigger>
            <TabsTrigger value="apresentacao" className="flex-1 data-[state=active]:bg-indigo-700">Simular Apresentação</TabsTrigger>
          </TabsList>

          <TabsContent value="aprofundar">
            <AprofundarNoTema closeModal={onClose} />
          </TabsContent>

          <TabsContent value="simulador">
            <SimuladorQuestoes closeModal={onClose} />
          </TabsContent>

          <TabsContent value="caderno">
            <EscreverNoCaderno messageContent={messageContent} closeModal={onClose} />
          </TabsContent>

          <TabsContent value="apresentacao">
            <SimularApresentacao closeModal={onClose} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FerramentasModal;