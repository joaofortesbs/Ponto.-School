
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Search,
  Bookmark,
  Lightbulb,
  FileText,
  AlertTriangle
} from "lucide-react";

interface AprofundarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AprofundarModal: React.FC<AprofundarModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Aprofundar no tema</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="flex items-center p-3 rounded-lg border cursor-not-allowed opacity-70">
            <Search className="h-5 w-5 mr-3 text-blue-500" />
            <span className="font-medium">🔍 Explicação Avançada</span>
          </div>
          
          <div className="flex items-center p-3 rounded-lg border cursor-not-allowed opacity-70">
            <Bookmark className="h-5 w-5 mr-3 text-purple-500" />
            <span className="font-medium">📌 Tópicos Relacionados</span>
          </div>
          
          <div className="flex items-center p-3 rounded-lg border cursor-not-allowed opacity-70">
            <FileText className="h-5 w-5 mr-3 text-green-500" />
            <span className="font-medium">📖 Exemplos Práticos</span>
          </div>
          
          <div className="flex items-center p-3 rounded-lg border cursor-not-allowed opacity-70">
            <AlertTriangle className="h-5 w-5 mr-3 text-amber-500" />
            <span className="font-medium">⚠️ Erros Comuns e Dicas</span>
          </div>
          
          <div className="flex items-center p-3 rounded-lg border cursor-not-allowed opacity-70">
            <Lightbulb className="h-5 w-5 mr-3 text-yellow-500" />
            <span className="font-medium">📚 Explore Fontes</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AprofundarModal;
