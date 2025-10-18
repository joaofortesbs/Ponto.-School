import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ActivityFormData } from '../../types/ActivityTypes';

interface FlashCardsEditActivityProps {
  formData: ActivityFormData;
  onFieldChange: (field: keyof ActivityFormData, value: string) => void;
}

/**
 * Componente específico para edição de Flash Cards
 */
export const FlashCardsEditActivity: React.FC<FlashCardsEditActivityProps> = ({ formData, onFieldChange }) => (
  <div className="space-y-4">
    <div>
      <Label htmlFor="theme" className="text-sm">Tema dos Flash Cards *</Label>
      <Input
        id="theme"
        value={formData.theme || ''}
        onChange={(e) => onFieldChange('theme', e.target.value)}
        placeholder="Ex: Substantivos Próprios e Verbos"
        required
        className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
    </div>

    <div>
      <Label htmlFor="topicos" className="text-sm">Tópicos Principais *</Label>
      <Textarea
        id="topicos"
        value={formData.topicos || ''}
        onChange={(e) => onFieldChange('topicos', e.target.value)}
        placeholder="Liste os principais tópicos que os flash cards devem abordar..."
        rows={3}
        required
        className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
    </div>

    <div>
      <Label htmlFor="numberOfFlashcards" className="text-sm">Número de Flash Cards *</Label>
      <Input
        id="numberOfFlashcards"
        type="number"
        value={formData.numberOfFlashcards || ''}
        onChange={(e) => onFieldChange('numberOfFlashcards', e.target.value)}
        placeholder="Ex: 10"
        required
        className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
    </div>

    <div>
      <Label htmlFor="contextoUso" className="text-sm">Contexto de Uso</Label>
      <Textarea
        id="contextoUso"
        value={formData.contextoUso || ''}
        onChange={(e) => onFieldChange('contextoUso', e.target.value)}
        placeholder="Descreva o contexto ou situação em que estes flash cards serão utilizados..."
        rows={3}
        className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
    </div>
  </div>
);
