
import React from 'react';
import { ActivityFormData } from '../../construction/types/ActivityTypes';

interface EditActivityProps {
  formData: ActivityFormData;
  onChange: (field: string, value: any) => void;
}

const EditActivity: React.FC<EditActivityProps> = ({ formData, onChange }) => {
  return (
    <div className="space-y-4">
      {/* Este componente usa o mesmo sistema que outras atividades */}
      {/* Os campos específicos são renderizados no EditActivityModal */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Configuração de Sequência Didática - use os campos específicos acima para personalizar sua atividade.
      </div>
    </div>
  );
};

export default EditActivity;
