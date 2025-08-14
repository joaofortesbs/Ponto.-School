import React from 'react';
import { ActivityFormData } from '../../construction/types/ActivityTypes';

interface EditActivityProps {
  formData: ActivityFormData;
  onFieldChange: (field: string, value: string) => void;
}

export function EditActivity({ formData, onFieldChange }: EditActivityProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Título da Atividade
        </label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => onFieldChange('title', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Descrição
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => onFieldChange('description', e.target.value)}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Objetivos de Aprendizagem
        </label>
        <textarea
          value={formData.objective || ''}
          onChange={(e) => onFieldChange('objective', e.target.value)}
          rows={3}
          placeholder="Descreva os objetivos que os alunos devem alcançar..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Materiais Necessários
        </label>
        <textarea
          value={formData.materials || ''}
          onChange={(e) => onFieldChange('materials', e.target.value)}
          rows={3}
          placeholder="Liste os materiais necessários (um por linha)..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Instruções da Atividade
        </label>
        <textarea
          value={formData.instructions || ''}
          onChange={(e) => onFieldChange('instructions', e.target.value)}
          rows={4}
          placeholder="Descreva como a atividade deve ser executada..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Critérios de Avaliação
        </label>
        <textarea
          value={formData.evaluationCriteria || ''}
          onChange={(e) => onFieldChange('evaluationCriteria', e.target.value)}
          rows={3}
          placeholder="Descreva os critérios de avaliação..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}