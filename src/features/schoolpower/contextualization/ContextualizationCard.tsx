
"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Loader2, Send, BookOpen } from 'lucide-react';

export interface ContextualizationData {
  subjects: string;
  audience: string;
  restrictions: string;
  dates?: string;
  notes?: string;
}

interface ContextualizationCardProps {
  onSubmit: (data: ContextualizationData) => void;
}

export function ContextualizationCard({ onSubmit }: ContextualizationCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ContextualizationData>({
    subjects: '',
    audience: '',
    restrictions: '',
    dates: '',
    notes: ''
  });

  const handleInputChange = (field: keyof ContextualizationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.subjects.trim() || !formData.audience.trim() || !formData.restrictions.trim()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simula loading para feedback visual
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('📝 Dados de contextualização coletados:', formData);
      onSubmit(formData);
    } catch (error) {
      console.error('❌ Erro ao enviar contextualização:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.subjects.trim() && formData.audience.trim() && formData.restrictions.trim();

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl"
      >
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl">
          <CardHeader className="text-center border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-center mb-3">
              <div className="p-3 bg-[#FF6B00]/10 rounded-full">
                <BookOpen className="h-6 w-6 text-[#FF6B00]" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Contextualização Inteligente
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Forneça algumas informações para personalizar seu plano de ação
            </p>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Matérias e Temas */}
              <div className="space-y-2">
                <Label htmlFor="subjects" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quais matérias e temas serão trabalhados? *
                </Label>
                <Textarea
                  id="subjects"
                  placeholder="Ex: Matemática - Funções quadráticas, Física - Cinemática, etc."
                  value={formData.subjects}
                  onChange={(e) => handleInputChange('subjects', e.target.value)}
                  className="min-h-[80px] resize-none"
                  required
                />
              </div>

              {/* Público-alvo */}
              <div className="space-y-2">
                <Label htmlFor="audience" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Qual o público-alvo? *
                </Label>
                <Input
                  id="audience"
                  placeholder="Ex: 2º ano do Ensino Médio, 15-16 anos"
                  value={formData.audience}
                  onChange={(e) => handleInputChange('audience', e.target.value)}
                  required
                />
              </div>

              {/* Restrições e Preferências */}
              <div className="space-y-2">
                <Label htmlFor="restrictions" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quais restrições ou preferências específicas? *
                </Label>
                <Textarea
                  id="restrictions"
                  placeholder="Ex: Aula de 50 minutos, usar exemplos práticos, evitar muita teoria..."
                  value={formData.restrictions}
                  onChange={(e) => handleInputChange('restrictions', e.target.value)}
                  className="min-h-[80px] resize-none"
                  required
                />
              </div>

              {/* Período de Entrega */}
              <div className="space-y-2">
                <Label htmlFor="dates" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Qual o período de entrega ou datas importantes?
                </Label>
                <Input
                  id="dates"
                  type="date"
                  value={formData.dates}
                  onChange={(e) => handleInputChange('dates', e.target.value)}
                />
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Outras observações importantes?
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Qualquer informação adicional que possa ajudar..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="min-h-[60px] resize-none"
                />
              </div>

              {/* Botão de Envio */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button
                  type="submit"
                  disabled={!isFormValid || isLoading}
                  className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-medium py-3 transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processando contextualização...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Contextualização
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                  * Campos obrigatórios
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default ContextualizationCard;
