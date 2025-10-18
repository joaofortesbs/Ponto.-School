import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
  </div>
);
