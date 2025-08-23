import React from 'react';
import { Badge } from "@/components/ui/badge";

interface QuadroInterativoFieldsProps {
  customFields: Record<string, string>;
}

export const QuadroInterativoFieldsRenderer: React.FC<QuadroInterativoFieldsProps> = ({ customFields }) => {
  const fields = [
    { key: 'Disciplina / Área de conhecimento', icon: '📚', label: 'Disciplina' },
    { key: 'Ano / Série', icon: '🎓', label: 'Ano/Série' },
    { key: 'Tema ou Assunto da aula', icon: '💡', label: 'Tema' },
    { key: 'Objetivo de aprendizagem da aula', icon: '🎯', label: 'Objetivo' },
    { key: 'Nível de Dificuldade', icon: '⚡', label: 'Dificuldade' },
    { key: 'Atividade mostrada', icon: '🔧', label: 'Atividade' }
  ];

  return (
    <div className="space-y-2">
      {fields.map(({ key, icon, label }) => {
        const value = customFields[key];
        if (!value) return null;

        return (
          <div key={key} className="flex items-center gap-2 text-xs">
            <span className="text-sm">{icon}</span>
            <span className="font-medium text-gray-600 dark:text-gray-300 min-w-[80px]">
              {label}:
            </span>
            <Badge variant="secondary" className="text-xs">
              {value}
            </Badge>
          </div>
        );
      })}
    </div>
  );
};