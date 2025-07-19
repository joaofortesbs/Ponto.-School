
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle, Sparkles, Brain, Target, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';

export interface ActionPlanItem {
  id: string;
  title: string;
  description: string;
  approved: boolean;
  personalizedTitle?: string;
  personalizedDescription?: string;
}

interface ActionPlanCardProps {
  actionPlan: ActionPlanItem[];
  onApprove: (approvedItems: ActionPlanItem[]) => void;
  isLoading?: boolean;
}

export function ActionPlanCard({ actionPlan, onApprove, isLoading = false }: ActionPlanCardProps) {
  const [selectedItems, setSelectedItems] = useState<ActionPlanItem[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleItemToggle = (item: ActionPlanItem) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(selected => selected.id === item.id);
      
      if (isSelected) {
        return prev.filter(selected => selected.id !== item.id);
      } else {
        return [...prev, { ...item, approved: true }];
      }
    });
  };

  const isItemSelected = (itemId: string) => {
    return selectedItems.some(item => item.id === itemId);
  };

  const handleApprove = () => {
    if (selectedItems.length > 0) {
      console.log('✅ Aprovando plano de ação:', selectedItems);
      onApprove(selectedItems);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl mx-auto"
      >
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="h-8 w-8 text-purple-600" />
              </motion.div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Gerando Seu Plano de Ação
              </CardTitle>
            </div>
            <p className="text-gray-600">
              Nossa IA está analisando suas informações e criando atividades personalizadas...
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"
              />
            ))}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-4xl mx-auto"
        >
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 shadow-xl">
            <CardHeader className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <Target className="h-8 w-8 text-purple-600" />
                </motion.div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Seu Plano de Ação Personalizado
                </CardTitle>
              </div>
              <p className="text-gray-600">
                Selecione as atividades que deseja gerar. Nossa IA criou essas sugestões com base nas suas informações.
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {actionPlan.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    onClick={() => handleItemToggle(item)}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-md
                      ${isItemSelected(item.id)
                        ? 'border-purple-400 bg-purple-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-purple-200'
                      }
                    `}
                  >
                    <div className="flex items-start gap-4">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-shrink-0 mt-1"
                      >
                        {isItemSelected(item.id) ? (
                          <CheckCircle className="h-6 w-6 text-purple-600" />
                        ) : (
                          <Circle className="h-6 w-6 text-gray-400" />
                        )}
                      </motion.div>

                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-gray-900">
                          {item.personalizedTitle || item.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.personalizedDescription || item.description}
                        </p>
                        
                        {(item.personalizedTitle || item.personalizedDescription) && (
                          <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                            <Sparkles className="h-3 w-3" />
                            <span>Personalizado pela IA com base nos seus dados</span>
                          </div>
                        )}
                        
                        {!item.personalizedTitle && !item.personalizedDescription && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>Atividade padrão do sistema</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Contador e botão de aprovação */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Target className="h-4 w-4" />
                  <span>
                    {selectedItems.length} de {actionPlan.length} atividades selecionadas
                  </span>
                </div>

                <Button
                  onClick={handleApprove}
                  disabled={selectedItems.length === 0}
                  className={`
                    flex items-center gap-2 transition-all duration-300
                    ${selectedItems.length > 0
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                      : 'bg-gray-300 cursor-not-allowed'
                    }
                  `}
                >
                  {selectedItems.length > 0 ? (
                    <>
                      <span>Aprovar Plano</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <span>Selecione ao menos 1 atividade</span>
                  )}
                </Button>
              </motion.div>

              {/* Informação sobre o que acontece após aprovação */}
              {selectedItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border border-purple-200"
                >
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <Brain className="h-4 w-4" />
                    <span>
                      Após aprovar, nossa IA gerará automaticamente todos os materiais selecionados!
                    </span>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ActionPlanCard;
