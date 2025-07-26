import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Settings, FileText, Play, Download, Edit3, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ConstructionActivity } from './types';

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ConstructionActivity | null;
  onSave: (activityData: any) => void;
}

interface ActivityFormData {
  title: string;
  description: string;
  subject: string;
  difficulty: string;
  format: string;
  duration: string;
  objectives: string;
  materials: string;
  instructions: string;
  evaluation: string;
}

export const EditActivityModal: React.FC<EditActivityModalProps> = ({
  isOpen,
  onClose,
  activity,
  onSave
}) => {
  const [formData, setFormData] = useState<ActivityFormData>({
    title: '',
    description: '',
    subject: '',
    difficulty: 'Médio',
    format: 'PDF',
    duration: '30 minutos',
    objectives: '',
    materials: '',
    instructions: '',
    evaluation: ''
  });

  const [generatedActivity, setGeneratedActivity] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState<'preview' | 'code'>('preview');

  useEffect(() => {
    if (activity) {
      setFormData({
        title: activity.title || '',
        description: activity.description || '',
        subject: 'Português',
        difficulty: 'Médio',
        format: 'PDF',
        duration: '30 minutos',
        objectives: '',
        materials: '',
        instructions: '',
        evaluation: ''
      });
    }
  }, [activity]);

  const handleInputChange = (field: keyof ActivityFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBuildActivity = async () => {
    setIsGenerating(true);
    try {
      const { generateActivity, validateFormData } = await import('./activityGeneratorService');

      // Validar dados do formulário
      const errors = validateFormData(formData);
      if (errors.length > 0) {
        console.error('Erros de validação:', errors);
        setIsGenerating(false);
        return;
      }

      // Gerar atividade usando o serviço
      const result = await generateActivity(formData);
      setGeneratedActivity(result.content);
      setIsGenerating(false);
    } catch (error) {
      console.error('Erro ao gerar atividade:', error);
      setIsGenerating(false);
    }
  };

  const handleSaveChanges = () => {
    const activityData = {
      ...formData,
      generatedContent: generatedActivity
    };
    onSave(activityData);
    onClose();
  };

  if (!isOpen) return null;

  const selectedActivity = activity?.title || 'Nova Atividade';

  const closeModal = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50"></div>
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
        <div 
          className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
          style={{
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.95)',
            ...(typeof window !== "undefined" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
              ? {
                  background: 'rgba(30, 41, 59, 0.95)',
                }
              : {})
          }}
        >
<div className="p-6">
          
<div className="flex items-center justify-between mb-6">
<h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
<Edit3 className="w-5 h-5 text-[#FF6B00]" />
                Editar Materiais: {selectedActivity}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#FF6B00]/10 to-orange-100/20 dark:to-[#29335C]/10 rounded-lg p-4 border border-[#FF6B00]/20">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  ✨ Configure os materiais e parâmetros específicos para esta atividade
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    📚 Tipo de Material
                  </label>
                  <select className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00]">
                    <option>Exercícios</option>
                    <option>Texto de apoio</option>
                    <option>Slides</option>
                    <option>Prova</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    🎯 Nível de Dificuldade
                  </label>
                  <select className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00]">
                    <option>Básico</option>
                    <option>Intermediário</option>
                    <option>Avançado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📝 Instruções Específicas
                </label>
                <textarea 
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00]"
                  rows={4}
                  placeholder="Descreva instruções específicas para esta atividade..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-[#FF6B00] hover:bg-[#D65A00] text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
</motion.div>
    </AnimatePresence>
  );
};

export default EditActivityModal;