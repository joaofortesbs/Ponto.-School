
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, ExternalLink } from 'lucide-react';

interface ExploreMaisProps {
  handleBack: () => void;
}

const ExploreMais: React.FC<ExploreMaisProps> = ({ handleBack }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center mb-2">
        <Button 
          onClick={handleBack} 
          variant="ghost" 
          size="sm" 
          className="mr-2 h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Explore Mais</h3>
      </div>

      <ScrollArea className="h-[60vh] pr-4">
        <div className="bg-yellow-50/50 dark:bg-yellow-950/20 rounded-xl p-4 border border-yellow-100 dark:border-yellow-900/30 mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            Recursos adicionais para aprofundar seu conhecimento neste tema, incluindo materiais de referência e exercícios complementares.
          </p>
        </div>

        <div className="mb-6">
          <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">Recursos Recomendados</h4>
          <div className="space-y-3">
            {['Vídeo', 'Livro', 'Artigo', 'Podcast'].map((tipo, index) => (
              <a 
                key={index} 
                href="#" 
                className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center group hover:border-yellow-300 dark:hover:border-yellow-700 transition-colors"
              >
                <div className="bg-yellow-100 dark:bg-yellow-900/30 w-8 h-8 rounded-full flex items-center justify-center mr-3 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800/40 transition-colors">
                  <ExternalLink className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 dark:text-white text-sm">{tipo}: Título do recurso</h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Breve descrição do conteúdo</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">Exercícios Complementares</h4>
          <div className="space-y-3">
            {[1, 2].map((item) => (
              <div key={item} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Questão ou exercício complementar para testar seu conhecimento sobre o tema.
                </p>
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-xs h-8">
                  Responder no Simulador
                </Button>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ExploreMais;
