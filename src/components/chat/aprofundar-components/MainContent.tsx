
import React from 'react';
import { 
  Search,
  Bookmark,
  Lightbulb,
  FileText,
  AlertTriangle
} from "lucide-react";

interface MainContentProps {
  handleOptionClick: (option: 'main' | 'explicacao' | 'topicos' | 'exemplos' | 'erros' | 'fontes') => void;
}

const MainContent: React.FC<MainContentProps> = ({ handleOptionClick }) => {
  return (
    <div className="space-y-3 mt-3">
      <div 
        className="flex items-center p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-gray-800/80 hover:shadow-md dark:hover:bg-gray-700/40 transition-all duration-300 cursor-pointer group"
        onClick={() => handleOptionClick('explicacao')}
      >
        <div className="bg-blue-100 dark:bg-blue-900/40 p-2.5 rounded-full mr-4 group-hover:scale-110 transition-transform">
          <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <span className="font-semibold text-gray-800 dark:text-gray-100 block mb-0.5">Explicação Avançada</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Aprofunde seu conhecimento com detalhes e contexto</span>
        </div>
      </div>

      <div 
        className="flex items-center p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-white to-purple-50 dark:from-gray-800 dark:to-gray-800/80 hover:shadow-md dark:hover:bg-gray-700/40 transition-all duration-300 cursor-pointer group"
        onClick={() => handleOptionClick('topicos')}
      >
        <div className="bg-purple-100 dark:bg-purple-900/40 p-2.5 rounded-full mr-4 group-hover:scale-110 transition-transform">
          <Bookmark className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1">
          <span className="font-semibold text-gray-800 dark:text-gray-100 block mb-0.5">Tópicos Relacionados</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Explore conexões com outros conceitos relevantes</span>
        </div>
      </div>

      <div 
        className="flex items-center p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-white to-green-50 dark:from-gray-800 dark:to-gray-800/80 hover:shadow-md dark:hover:bg-gray-700/40 transition-all duration-300 cursor-pointer group"
        onClick={() => handleOptionClick('exemplos')}
      >
        <div className="bg-green-100 dark:bg-green-900/40 p-2.5 rounded-full mr-4 group-hover:scale-110 transition-transform">
          <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1">
          <span className="font-semibold text-gray-800 dark:text-gray-100 block mb-0.5">Exemplos Práticos</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Veja aplicações reais e situações do dia a dia</span>
        </div>
      </div>

      <div 
        className="flex items-center p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-white to-amber-50 dark:from-gray-800 dark:to-gray-800/80 hover:shadow-md dark:hover:bg-gray-700/40 transition-all duration-300 cursor-pointer group"
        onClick={() => handleOptionClick('erros')}
      >
        <div className="bg-amber-100 dark:bg-amber-900/40 p-2.5 rounded-full mr-4 group-hover:scale-110 transition-transform">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <span className="font-semibold text-gray-800 dark:text-gray-100 block mb-0.5">Erros Comuns e Dicas</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Evite armadilhas e acelere seu aprendizado</span>
        </div>
      </div>

      <div 
        className="flex items-center p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-white to-yellow-50 dark:from-gray-800 dark:to-gray-800/80 hover:shadow-md dark:hover:bg-gray-700/40 transition-all duration-300 cursor-pointer group"
        onClick={() => handleOptionClick('fontes')}
      >
        <div className="bg-yellow-100 dark:bg-yellow-900/40 p-2.5 rounded-full mr-4 group-hover:scale-110 transition-transform">
          <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="flex-1">
          <span className="font-semibold text-gray-800 dark:text-gray-100 block mb-0.5">Explore Mais</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Recursos adicionais e materiais complementares</span>
        </div>
      </div>
    </div>
  );
};

export default MainContent;
