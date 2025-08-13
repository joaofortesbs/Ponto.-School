import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Target, BookOpen, Users, Edit2, Check, X } from 'lucide-react';

interface EtapaAula {
  tipo: string;
  tempo: string;
  descricao: string;
  cor: string;
}

interface AulaCardProps {
  aulaIndex: number;
  titulo: string;
  objetivoEspecifico: string;
  resumo: string;
  etapas: EtapaAula[];
  recursos: string[];
  atividadePratica: string;
  duracao?: string;
  onFieldUpdate?: (field: string, value: string | string[]) => void;
}

export const AulaCard: React.FC<AulaCardProps> = ({
  aulaIndex,
  titulo,
  objetivoEspecifico,
  resumo,
  etapas,
  recursos,
  atividadePratica,
  duracao = "50 min",
  onFieldUpdate
}) => {
  const [editingFields, setEditingFields] = useState<{ [key: string]: boolean }>({});
  const [tempValues, setTempValues] = useState<{ [key: string]: any }>({});

  const handleStartEdit = (field: string, currentValue: any) => {
    setEditingFields({ ...editingFields, [field]: true });
    setTempValues({ ...tempValues, [field]: currentValue });
  };

  const handleSaveEdit = (field: string) => {
    if (onFieldUpdate && tempValues[field] !== undefined) {
      onFieldUpdate(field, tempValues[field]);
    }
    setEditingFields({ ...editingFields, [field]: false });
    setTempValues({ ...tempValues, [field]: undefined });
  };

  const handleCancelEdit = (field: string) => {
    setEditingFields({ ...editingFields, [field]: false });
    setTempValues({ ...tempValues, [field]: undefined });
  };

  const renderEditableField = (field: string, currentValue: any, isTextarea = false) => {
    const isEditing = editingFields[field];

    if (isEditing) {
      return (
        <div className="flex flex-col gap-2">
          {isTextarea ? (
            <Textarea
              value={tempValues[field] || ''}
              onChange={(e) => setTempValues({ ...tempValues, [field]: e.target.value })}
              className="min-h-[80px] text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) handleSaveEdit(field);
                if (e.key === 'Escape') handleCancelEdit(field);
              }}
            />
          ) : (
            <Input
              value={tempValues[field] || ''}
              onChange={(e) => setTempValues({ ...tempValues, [field]: e.target.value })}
              className="text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit(field);
                if (e.key === 'Escape') handleCancelEdit(field);
              }}
              autoFocus
            />
          )}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleSaveEdit(field)}>
              <Check className="h-4 w-4 mr-1" />
              Salvar
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleCancelEdit(field)}>
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="group relative">
        <div>{currentValue}</div>
        {onFieldUpdate && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute -top-2 -right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleStartEdit(field, currentValue)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  const getEtapaColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'introdução':
      case 'introducao':
        return { bg: 'bg-green-500', text: 'text-green-700' };
      case 'desenvolvimento':
        return { bg: 'bg-orange-500', text: 'text-orange-700' };
      case 'fechamento':
        return { bg: 'bg-purple-500', text: 'text-purple-700' };
      default:
        return { bg: 'bg-blue-500', text: 'text-blue-700' };
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500 min-w-[320px] flex-shrink-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Calendar size={12} className="mr-1" />
            Aula {aulaIndex}
          </Badge>
          <span className="text-sm text-gray-500">{duracao}</span>
        </div>
        <CardTitle className="text-lg">
          <div className="mb-2">
            <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200">
              {renderEditableField('titulo', titulo)}
            </h3>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mb-4">
          <h4 className="font-medium text-sm text-gray-700 mb-1">Objetivo Específico</h4>
          <p className="text-sm text-gray-600">
            {renderEditableField('objetivoEspecifico', objetivoEspecifico, true)}
          </p>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Resumo da Aula
          </h4>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {renderEditableField('resumo', resumo, true)}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-2">Etapas da Aula</h4>
          <div className="space-y-2">
            {etapas.map((etapa, index) => {
              const cores = getEtapaColor(etapa.tipo);
              return (
                <div key={index} className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full ${cores.bg} mt-1.5 flex-shrink-0`}></div>
                  <div>
                    <span className={`text-xs font-medium ${cores.text}`}>
                      {etapa.tipo} ({etapa.tempo})
                    </span>
                    <p className="text-xs text-gray-600">{etapa.descricao}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-1">Recursos Necessários</h4>
          <div className="flex flex-wrap gap-1">
            {recursos.map((recurso, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {recurso}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Atividade Prática
          </h4>
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            {renderEditableField('atividadePratica', atividadePratica, true)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AulaCard;