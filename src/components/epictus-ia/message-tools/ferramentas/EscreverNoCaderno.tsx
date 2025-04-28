import React, { useState } from 'react';
import { BookOpen, Copy, ChevronRight, FileText, AlignLeft } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface EscreverNoCadernoProps {
  onClick: () => void;
  isProcessing: boolean;
  onApplyTemplate?: (templateType: string) => void;
}

const EscreverNoCaderno: React.FC<EscreverNoCadernoProps> = ({ 
  onClick, 
  isProcessing,
  onApplyTemplate 
}) => {
  const [showTemplates, setShowTemplates] = useState(false);

  const handleTemplateClick = (templateType: string) => {
    if (onApplyTemplate) {
      onApplyTemplate(templateType);
    }
    setShowTemplates(false);
  };

  return (
    <Popover open={showTemplates} onOpenChange={setShowTemplates}>
      <PopoverTrigger asChild>
        <button 
          className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#FF6B00] dark:hover:text-[#FF6B00] flex items-center justify-between"
          disabled={isProcessing}
        >
          <div className="flex items-center">
            <BookOpen className="h-3.5 w-3.5 mr-1.5 text-green-600 dark:text-green-400" />
            {isProcessing ? 'Processando...' : 'Escrever no caderno'}
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0 border border-gray-200 dark:border-gray-700 shadow-md" align="end">
        <div className="py-1">
          <button 
            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            onClick={onClick}
          >
            <Copy className="h-3.5 w-3.5 mr-1.5 text-blue-500 dark:text-blue-400" />
            Caderno padrão
          </button>
          <div className="border-t border-gray-200 dark:border-gray-800 my-1"></div>
          <p className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400">Aplicar modelo:</p>
          <button 
            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            onClick={() => handleTemplateClick('estudoCompleto')}
          >
            <BookOpen className="h-3.5 w-3.5 mr-1.5 text-amber-600 dark:text-amber-400" />
            Estudo Completo
          </button>
          <button 
            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            onClick={() => handleTemplateClick('mapaConceitual')}
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 mr-1.5 text-blue-500 dark:text-blue-400" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12.0004 4C7.58293 4 4.00037 7.58172 4.00037 12C4.00037 16.4183 7.58293 20 12.0004 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 20C14.5264 20 16.7792 18.8289 18.2454 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19.3576 15C19.7715 14.0907 20.0004 13.0736 20.0004 12C20.0004 11.2857 19.906 10.5947 19.7306 9.93872" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.9265 7.99997C17.9385 6.56968 16.5269 5.45453 14.864 4.83203" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12.5 7C12.5 7 12 7.9 12 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Mapa Conceitual
          </button>
          <button 
            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            onClick={() => handleTemplateClick('revisaoRapida')}
          >
            <AlignLeft className="h-3.5 w-3.5 mr-1.5 text-green-500 dark:text-green-400" />
            Revisão Rápida
          </button>
          <button 
            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            onClick={() => handleTemplateClick('fichamento')}
          >
            <FileText className="h-3.5 w-3.5 mr-1.5 text-purple-500 dark:text-purple-400" />
            Fichamento
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EscreverNoCaderno;