
import React from 'react';
import { ActivityFormData } from '../../construction/types/ActivityTypes';

interface EditQuadroInterativoProps {
  formData: ActivityFormData;
  onFormDataChange: (data: ActivityFormData) => void;
}

const EditQuadroInterativo: React.FC<EditQuadroInterativoProps> = ({
  formData,
  onFormDataChange
}) => {
  const handleInputChange = (field: keyof ActivityFormData, value: string) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Disciplina / Área de conhecimento *
        </label>
        <input
          type="text"
          value={formData.subject || ''}
          onChange={(e) => handleInputChange('subject', e.target.value)}
          placeholder="Ex: Matemática, Português, História..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Ano / Série *
        </label>
        <input
          type="text"
          value={formData.schoolYear || ''}
          onChange={(e) => handleInputChange('schoolYear', e.target.value)}
          placeholder="Ex: 6º ano, 7º ano, 8º ano..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tema ou Assunto da aula *
        </label>
        <input
          type="text"
          value={formData.theme || ''}
          onChange={(e) => handleInputChange('theme', e.target.value)}
          placeholder="Digite o tema central da aula"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Objetivo de aprendizagem da aula *
        </label>
        <textarea
          value={formData.objectives || ''}
          onChange={(e) => handleInputChange('objectives', e.target.value)}
          placeholder="Descreva o que os alunos devem aprender com esta atividade"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nível de Dificuldade *
        </label>
        <select
          value={formData.difficultyLevel || ''}
          onChange={(e) => handleInputChange('difficultyLevel', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">Selecione o nível</option>
          <option value="Básico">Básico</option>
          <option value="Intermediário">Intermediário</option>
          <option value="Avançado">Avançado</option>
          <option value="Fácil">Fácil</option>
          <option value="Médio">Médio</option>
          <option value="Difícil">Difícil</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Atividade mostrada *
        </label>
        <textarea
          value={formData.practicalActivities || ''}
          onChange={(e) => handleInputChange('practicalActivities', e.target.value)}
          placeholder="Descreva as atividades que serão mostradas no quadro interativo (jogos, exercícios, apresentações, etc.)"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
    </div>
  );
};

export default EditQuadroInterativo;
