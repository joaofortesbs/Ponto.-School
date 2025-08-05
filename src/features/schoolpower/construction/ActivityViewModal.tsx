import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, Share2 } from 'lucide-react';
import { Activity } from './types';

interface ActivityViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
}

const ActivityViewModal: React.FC<ActivityViewModalProps> = ({
  isOpen,
  onClose,
  activity
}) => {
  if (!activity) return null;

  // Função para renderizar o conteúdo baseado no tipo de atividade
  const renderActivityContent = () => {
    if (!activity.generatedContent) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>Conteúdo não disponível para visualização.</p>
        </div>
      );
    }

    // Renderizar conteúdo estruturado baseado no tipo
    switch (activity.type) {
      case 'lista-exercicios':
        return renderListaExercicios();
      case 'prova':
        return renderProva();
      case 'jogo':
        return renderJogo();
      case 'resumo':
        return renderResumo();
      case 'mapa-mental':
        return renderMapaMental();
      default:
        return renderGenericContent();
    }
  };

  const renderListaExercicios = () => {
    const content = activity.generatedContent;

    if (typeof content === 'string') {
      // Parse manual do conteúdo se for string
      const lines = content.split('\n').filter(line => line.trim());
      const exercises = [];
      let currentExercise = null;

      lines.forEach(line => {
        if (line.match(/^\d+\./)) {
          if (currentExercise) exercises.push(currentExercise);
          currentExercise = { question: line, options: [], answer: '' };
        } else if (line.match(/^[a-e]\)/)) {
          if (currentExercise) currentExercise.options.push(line);
        } else if (line.toLowerCase().includes('resposta:')) {
          if (currentExercise) currentExercise.answer = line;
        }
      });
      if (currentExercise) exercises.push(currentExercise);

      return (
        <div className="space-y-6">
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <h3 className="font-bold text-orange-800 dark:text-orange-200 mb-2">
              📝 Lista de Exercícios: {activity.title}
            </h3>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              {activity.description}
            </p>
          </div>

          {exercises.length > 0 ? (
            <div className="space-y-4">
              {exercises.map((exercise, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    {exercise.question}
                  </h4>
                  {exercise.options.length > 0 && (
                    <div className="space-y-2 ml-4">
                      {exercise.options.map((option, optIndex) => (
                        <div key={optIndex} className="text-gray-600 dark:text-gray-400">
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                  {exercise.answer && (
                    <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-500">
                      <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                        {exercise.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }} />
              </div>
            </div>
          )}
        </div>
      );
    }

    // Se o conteúdo já é um objeto estruturado
    if (typeof content === 'object' && content.exercises) {
      return (
        <div className="space-y-6">
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <h3 className="font-bold text-orange-800 dark:text-orange-200 mb-2">
              📝 Lista de Exercícios: {activity.title}
            </h3>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              {activity.description}
            </p>
          </div>

          <div className="space-y-4">
            {content.exercises.map((exercise: any, index: number) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  {index + 1}. {exercise.question || exercise.enunciado}
                </h4>
                {exercise.options && (
                  <div className="space-y-2 ml-4">
                    {exercise.options.map((option: string, optIndex: number) => (
                      <div key={optIndex} className="text-gray-600 dark:text-gray-400">
                        {String.fromCharCode(97 + optIndex)}) {option}
                      </div>
                    ))}
                  </div>
                )}
                {exercise.answer && (
                  <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-500">
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                      Resposta: {exercise.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return renderGenericContent();
  };

  const renderProva = () => {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-2">
            📋 Prova: {activity.title}
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {activity.description}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ 
              __html: String(activity.generatedContent).replace(/\n/g, '<br>') 
            }} />
          </div>
        </div>
      </div>
    );
  };

  const renderJogo = () => {
    return (
      <div className="space-y-6">
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <h3 className="font-bold text-purple-800 dark:text-purple-200 mb-2">
            🎮 Jogo Educativo: {activity.title}
          </h3>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            {activity.description}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ 
              __html: String(activity.generatedContent).replace(/\n/g, '<br>') 
            }} />
          </div>
        </div>
      </div>
    );
  };

  const renderResumo = () => {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h3 className="font-bold text-green-800 dark:text-green-200 mb-2">
            📖 Resumo: {activity.title}
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300">
            {activity.description}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ 
              __html: String(activity.generatedContent).replace(/\n/g, '<br>') 
            }} />
          </div>
        </div>
      </div>
    );
  };

  const renderMapaMental = () => {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">
            🧠 Mapa Mental: {activity.title}
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            {activity.description}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ 
              __html: String(activity.generatedContent).replace(/\n/g, '<br>') 
            }} />
          </div>
        </div>
      </div>
    );
  };

  const renderGenericContent = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
            📚 {activity.title}
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {activity.description}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ 
              __html: String(activity.generatedContent).replace(/\n/g, '<br>') 
            }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 rounded-xl border border-gray-300 dark:border-gray-600">
        {/* Header com bordas arredondadas no topo */}
        <DialogHeader className="flex flex-row items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-xl">
          <DialogTitle className="text-xl font-bold">
            Visualização da Atividade
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {/* Implementar download */}}
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {/* Implementar compartilhamento */}}
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Conteúdo principal com scroll */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          {renderActivityContent()}
        </div>

        {/* Footer com bordas arredondadas no bottom */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-xl">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300 dark:border-gray-600"
          >
            Fechar
          </Button>
          <Button
            onClick={() => {/* Implementar funcionalidade de imprimir/exportar */}}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Exportar PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityViewModal;