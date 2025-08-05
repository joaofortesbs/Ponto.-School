
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConstructionActivity } from './types';

interface ActivityViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ConstructionActivity | null;
}

export function ActivityViewModal({ isOpen, onClose, activity }: ActivityViewModalProps) {
  if (!activity) return null;

  // Recuperar dados da atividade construída do localStorage
  const getBuiltActivityData = () => {
    try {
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      const activityData = constructedActivities[activity.id];
      
      if (activityData && activityData.content) {
        return activityData.content;
      }
      
      // Fallback para dados básicos se não houver conteúdo construído
      return {
        title: activity.title,
        description: activity.description,
        content: activity.customFields || {},
        type: activity.id
      };
    } catch (error) {
      console.error('Erro ao recuperar dados da atividade construída:', error);
      return {
        title: activity.title,
        description: activity.description,
        content: {},
        type: activity.id
      };
    }
  };

  const renderBuiltActivityContent = () => {
    const builtData = getBuiltActivityData();
    
    return (
      <div className="space-y-6">
        {/* Título da Atividade */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {builtData.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {builtData.description}
          </p>
        </div>

        {/* Conteúdo da Atividade Construída */}
        <div className="space-y-6">
          {/* Renderizar cada campo do conteúdo construído */}
          {Object.entries(builtData.content || {}).map(([key, value]) => {
            if (!value || (typeof value === 'string' && value.trim() === '')) return null;
            
            const fieldLabel = getFieldLabel(key);
            
            return (
              <div key={key} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {fieldLabel}
                </h3>
                <div className="prose dark:prose-invert max-w-none">
                  {typeof value === 'string' ? (
                    <div 
                      className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: formatContent(value) }}
                    />
                  ) : (
                    <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            );
          })}

          {/* Se não há conteúdo construído, mostrar mensagem */}
          {Object.keys(builtData.content || {}).length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Eye className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Atividade não construída
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Esta atividade ainda não foi construída. Use o botão "Editar" para construir o conteúdo.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Função para obter rótulos amigáveis dos campos
  const getFieldLabel = (key: string): string => {
    const labels: Record<string, string> = {
      objectives: 'Objetivos',
      content: 'Conteúdo',
      instructions: 'Instruções',
      materials: 'Materiais Necessários',
      evaluation: 'Critérios de Avaliação',
      timeLimit: 'Tempo Limite',
      difficulty: 'Nível de Dificuldade',
      questions: 'Questões',
      answers: 'Respostas',
      exercises: 'Exercícios',
      examples: 'Exemplos',
      activities: 'Atividades',
      context: 'Contexto de Aplicação',
      sources: 'Fontes e Referências'
    };
    
    return labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  // Função para formatar o conteúdo
  const formatContent = (content: string): string => {
    return content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-1 rounded">$1</code>');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-[#FF6B00]/20"
              style={{
                width: '85%',
                height: '85%',
                maxWidth: '1400px',
                maxHeight: '900px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Bordas decorativas nos cantos - mais finas */}
              {/* Canto superior esquerdo */}
              <div className="absolute top-0 left-0 w-8 h-8 z-10">
                <div className="absolute top-0 left-0 w-4 h-0.5 bg-[#FF6B00] rounded-r-sm"></div>
                <div className="absolute top-0 left-0 w-0.5 h-4 bg-[#FF6B00] rounded-b-sm"></div>
              </div>
              
              {/* Canto superior direito */}
              <div className="absolute top-0 right-0 w-8 h-8 z-10">
                <div className="absolute top-0 right-0 w-4 h-0.5 bg-[#FF6B00] rounded-l-sm"></div>
                <div className="absolute top-0 right-0 w-0.5 h-4 bg-[#FF6B00] rounded-b-sm"></div>
              </div>
              
              {/* Canto inferior esquerdo */}
              <div className="absolute bottom-0 left-0 w-8 h-8 z-10">
                <div className="absolute bottom-0 left-0 w-4 h-0.5 bg-[#FF6B00] rounded-r-sm"></div>
                <div className="absolute bottom-0 left-0 w-0.5 h-4 bg-[#FF6B00] rounded-t-sm"></div>
              </div>
              
              {/* Canto inferior direito */}
              <div className="absolute bottom-0 right-0 w-8 h-8 z-10">
                <div className="absolute bottom-0 right-0 w-4 h-0.5 bg-[#FF6B00] rounded-l-sm"></div>
                <div className="absolute bottom-0 right-0 w-0.5 h-4 bg-[#FF6B00] rounded-t-sm"></div>
              </div>

              {/* Header do Modal */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[#FF6B00] to-[#FF9248]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Visualização da Atividade
                    </h2>
                    <p className="text-white/80 text-sm">
                      {activity.title}
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Conteúdo do Modal - Atividade Construída */}
              <div className="flex-1 overflow-auto p-6" style={{ height: 'calc(100% - 88px)' }}>
                <div className="h-full">
                  {renderBuiltActivityContent()}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
