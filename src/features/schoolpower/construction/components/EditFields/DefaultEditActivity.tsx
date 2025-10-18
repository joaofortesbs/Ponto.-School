import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ActivityFormData } from '../../types/ActivityTypes';

interface DefaultEditActivityProps {
  formData: ActivityFormData;
  onFieldChange: (field: keyof ActivityFormData, value: string) => void;
}

/**
 * Componente genérico para edição de campos comuns de atividades
 * Usado para atividades que não possuem formulário específico
 */
export const DefaultEditActivity: React.FC<DefaultEditActivityProps> = ({ formData, onFieldChange }) => (
  <>
    <div>
      <Label htmlFor="objectives" className="text-sm">Objetivos de Aprendizagem</Label>
      <Textarea
        id="objectives"
        value={formData.objectives}
        onChange={(e) => onFieldChange('objectives', e.target.value)}
        placeholder="Descreva os objetivos que os alunos devem alcançar..."
        className="mt-1 min-h-[60px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
    </div>

    <div>
      <Label htmlFor="materials" className="text-sm">Materiais Necessários</Label>
      <Textarea
        id="materials"
        value={formData.materials}
        onChange={(e) => onFieldChange('materials', e.target.value)}
        placeholder="Liste os materiais necessários (um por linha)..."
        className="mt-1 min-h-[60px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
    </div>

    <div>
      <Label htmlFor="instructions" className="text-sm">Instruções da Atividade</Label>
      <Textarea
        id="instructions"
        value={formData.instructions}
        onChange={(e) => onFieldChange('instructions', e.target.value)}
        placeholder="Descreva como a atividade deve ser executada..."
        className="mt-1 min-h-[80px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
    </div>

    <div>
      <Label htmlFor="evaluation" className="text-sm">Critérios de Avaliação</Label>
      <Textarea
        id="evaluation"
        value={formData.evaluation}
        onChange={(e) => onFieldChange('evaluation', e.target.value)}
        placeholder="Como a atividade será avaliada..."
        className="mt-1 min-h-[60px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
    </div>
  </>
);
