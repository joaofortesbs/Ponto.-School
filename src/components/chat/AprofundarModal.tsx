
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
      <DialogContent className="sm:max-w-md bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-100 dark:border-gray-700 shadow-xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Aprofundar no tema</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-3">
          <div className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-not-allowed opacity-70">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-3">
              <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-medium">Explicação Avançada</span>
          </div>
          
          <div className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-not-allowed opacity-70">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full mr-3">
              <Bookmark className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="font-medium">Tópicos Relacionados</span>
          </div>
          
          <div className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-not-allowed opacity-70">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mr-3">
              <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="font-medium">Exemplos Práticos</span>
          </div>
          
          <div className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-not-allowed opacity-70">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full mr-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="font-medium">Erros Comuns e Dicas</span>
          </div>
          
          <div className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-not-allowed opacity-70">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full mr-3">
              <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <span className="font-medium">Explore Fontes</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AprofundarModal;
