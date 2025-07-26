
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Eye, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from '@/components/ui/dialog';

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityId: string;
  activityTitle: string;
  onSave?: (activityId: string, data: any) => void;
}

export function EditActivityModal({
  isOpen,
  onClose,
  activityId,
  activityTitle,
  onSave
}: EditActivityModalProps) {
  const handleSave = (data: any) => {
    if (onSave) {
      onSave(activityId, data);
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleViewFullscreen = () => {
    // TODO: Implementar visualização em tela cheia se necessário
    console.log('Visualizar em tela cheia:', activityId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <DialogContent className="fixed left-[50%] top-[50%] z-50 w-[90vw] max-w-[960px] h-auto max-h-[90vh] translate-x-[-50%] translate-y-[-50%] rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex flex-col h-full"
            >
              {/* Header do Modal */}
              <DialogHeader className="flex flex-row items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Editar: {activityTitle}
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-4 h-4" />
                </Button>
              </DialogHeader>

              {/* Conteúdo do Modal */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  {/* Lado Esquerdo - Formulário de Edição */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Editor de Materiais
                      </h3>
                      
                      {/* Formulário de edição - placeholder para o conteúdo atual */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Título da Atividade
                          </label>
                          <input
                            type="text"
                            defaultValue={activityTitle}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Digite o título da atividade"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Descrição
                          </label>
                          <textarea
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Descreva a atividade"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Materiais de Apoio
                          </label>
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                            <p className="text-gray-500 dark:text-gray-400">
                              Arraste arquivos aqui ou clique para fazer upload
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Configurações da Atividade
                          </label>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="allow-comments"
                                className="rounded border-gray-300 dark:border-gray-600"
                              />
                              <label htmlFor="allow-comments" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                Permitir comentários
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="time-limit"
                                className="rounded border-gray-300 dark:border-gray-600"
                              />
                              <label htmlFor="time-limit" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                Definir limite de tempo
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lado Direito - Preview da Atividade */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 h-full">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Preview da Atividade
                      </h3>
                      
                      {/* Preview em tempo real */}
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-gradient-to-br from-[#FF6B00]/20 to-[#D65A00]/20 flex items-center justify-center">
                            <Eye className="w-8 h-8 text-[#FF6B00]" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {activityTitle}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Preview será atualizado em tempo real conforme você edita
                          </p>
                          
                          {/* Simulação de conteúdo da atividade */}
                          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                            <div className="text-left space-y-2">
                              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-5/6"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rodapé do Modal */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewFullscreen}
                    className="h-9 px-3 text-sm"
                  >
                    <Maximize2 className="w-4 h-4 mr-2" />
                    Tela Cheia
                  </Button>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="h-9 px-4"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => handleSave({})}
                    className="h-9 px-4 bg-[#FF6B00] hover:bg-[#D65A00] text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
