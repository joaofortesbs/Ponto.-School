
"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';

interface EditActivityContainerProps {
  activityId: string;
  onClose: () => void;
  onSave: (activityId: string, updatedData: ActionPlanItem) => void;
}

export function EditActivityContainer({ 
  activityId, 
  onClose, 
  onSave 
}: EditActivityContainerProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    difficulty: '',
    category: '',
    type: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Aqui você pode carregar os dados da atividade baseado no activityId
    // Por enquanto, vou deixar com dados padrão
    setFormData({
      title: 'Atividade Exemplo',
      description: 'Descrição da atividade',
      duration: '30 minutos',
      difficulty: 'Médio',
      category: 'Educacional',
      type: 'Exercício'
    });
  }, [activityId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updatedActivity: ActionPlanItem = {
        id: activityId,
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        difficulty: formData.difficulty,
        category: formData.category,
        type: formData.type
      };
      
      onSave(activityId, updatedActivity);
    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    // Reset para valores originais
    setFormData({
      title: 'Atividade Exemplo',
      description: 'Descrição da atividade',
      duration: '30 minutos',
      difficulty: 'Médio',
      category: 'Educacional',
      type: 'Exercício'
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Editar Atividade
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div>
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Título da Atividade
              </Label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full"
                placeholder="Digite o título da atividade"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Descrição
              </Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full"
                rows={4}
                placeholder="Descreva a atividade"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Duração
                </Label>
                <Input
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="Ex: 30 minutos"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Dificuldade
                </Label>
                <Input
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  placeholder="Ex: Fácil, Médio, Difícil"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Categoria
                </Label>
                <Input
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="Ex: Matemática, Português"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tipo
                </Label>
                <Input
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  placeholder="Ex: Exercício, Prova, Projeto"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Resetar
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading || !formData.title.trim()}
                className="bg-[#FF6B00] hover:bg-[#D65A00] text-white"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
