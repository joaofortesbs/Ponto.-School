
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ActivityPreview from '@/features/schoolpower/activities/default/ActivityPreview';
import ExerciseListPreview from '@/features/schoolpower/activities/lista-exercicios/ExerciseListPreview';
import { ConstructionActivity } from './types';

interface ActivityViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ConstructionActivity | null;
}

export function ActivityViewModal({ isOpen, onClose, activity }: ActivityViewModalProps) {
  if (!activity) return null;

  const renderActivityPreview = () => {
    // Determinar qual componente de preview usar baseado no tipo de atividade
    switch (activity.id) {
      case 'lista-exercicios':
        return <ExerciseListPreview activity={activity} />;
      default:
        return <ActivityPreview activity={activity} />;
    }
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
              className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
              style={{
                width: '85%',
                height: '85%',
                maxWidth: '1400px',
                maxHeight: '900px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Bordas decorativas nos cantos */}
              {/* Canto superior esquerdo */}
              <div className="absolute top-0 left-0 w-16 h-16 z-10">
                <div className="absolute top-0 left-0 w-8 h-1 bg-[#FF6B00]"></div>
                <div className="absolute top-0 left-0 w-1 h-8 bg-[#FF6B00]"></div>
              </div>
              
              {/* Canto superior direito */}
              <div className="absolute top-0 right-0 w-16 h-16 z-10">
                <div className="absolute top-0 right-0 w-8 h-1 bg-[#FF6B00]"></div>
                <div className="absolute top-0 right-0 w-1 h-8 bg-[#FF6B00]"></div>
              </div>
              
              {/* Canto inferior esquerdo */}
              <div className="absolute bottom-0 left-0 w-16 h-16 z-10">
                <div className="absolute bottom-0 left-0 w-8 h-1 bg-[#FF6B00]"></div>
                <div className="absolute bottom-0 left-0 w-1 h-8 bg-[#FF6B00]"></div>
              </div>
              
              {/* Canto inferior direito */}
              <div className="absolute bottom-0 right-0 w-16 h-16 z-10">
                <div className="absolute bottom-0 right-0 w-8 h-1 bg-[#FF6B00]"></div>
                <div className="absolute bottom-0 right-0 w-1 h-8 bg-[#FF6B00]"></div>
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

              {/* Conteúdo do Modal - Preview da Atividade */}
              <div className="flex-1 overflow-auto p-6" style={{ height: 'calc(100% - 88px)' }}>
                <div className="h-full">
                  {renderActivityPreview()}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
