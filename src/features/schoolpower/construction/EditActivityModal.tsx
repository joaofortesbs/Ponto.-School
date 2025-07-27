import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: {
    id: string;
    title: string;
    description: string;
    type: string;
    status: string;
    progress: number;
  } | null;
  onSave: (updatedActivity: any) => void;
}

interface ActivityFormData {
  disciplina: string;
  tema: string;
  anoEscolaridade: string;
  numeroQuestoes: string;
  nivelDificuldade: string;
  modeloQuestoes: string;
  fontes: string[];
}

export const EditActivityModal: React.FC<EditActivityModalProps> = ({
  isOpen,
  onClose,
  activity,
  onSave,
}) => {
  const [formData, setFormData] = useState<ActivityFormData>({
    disciplina: '',
    tema: '',
    anoEscolaridade: '',
    numeroQuestoes: '',
    nivelDificuldade: '',
    modeloQuestoes: '',
    fontes: [],
  });

  const [newFonte, setNewFonte] = useState('');

  useEffect(() => {
    if (activity) {
      // Carregar dados existentes se houver
      setFormData({
        disciplina: '',
        tema: '',
        anoEscolaridade: '',
        numeroQuestoes: '',
        nivelDificuldade: '',
        modeloQuestoes: '',
        fontes: [],
      });
    }
  }, [activity]);

  const handleInputChange = (field: keyof ActivityFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddFonte = () => {
    if (newFonte.trim()) {
      setFormData(prev => ({
        ...prev,
        fontes: [...prev.fontes, newFonte.trim()],
      }));
      setNewFonte('');
    }
  };

  const handleRemoveFonte = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fontes: prev.fontes.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    if (activity) {
      const updatedActivity = {
        ...activity,
        editData: formData,
      };
      onSave(updatedActivity);
      onClose();
    }
  };

  const anoOptions = [
    '1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano',
    '6º Ano', '7º Ano', '8º Ano', '9º Ano',
    '1º Ensino Médio', '2º Ensino Médio', '3º Ensino Médio'
  ];

  const nivelDificuldadeOptions = [
    'Fácil', 'Médio', 'Difícil', 'Muito Difícil'
  ];

  const modeloQuestoesOptions = [
    'Múltipla Escolha', 'Verdadeiro ou Falso', 'Dissertativa', 
    'Completar Lacunas', 'Associação', 'Mista'
  ];

  if (!activity) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            Editar Materiais - {activity.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4">
          {/* Disciplina */}
          <div className="space-y-2">
            <Label htmlFor="disciplina" className="text-sm font-medium text-gray-700">
              Disciplina
            </Label>
            <Input
              id="disciplina"
              value={formData.disciplina}
              onChange={(e) => handleInputChange('disciplina', e.target.value)}
              placeholder="Ex: Matemática, Português, História..."
              className="w-full"
            />
          </div>

          {/* Tema */}
          <div className="space-y-2">
            <Label htmlFor="tema" className="text-sm font-medium text-gray-700">
              Tema
            </Label>
            <Input
              id="tema"
              value={formData.tema}
              onChange={(e) => handleInputChange('tema', e.target.value)}
              placeholder="Ex: Substantivos e Verbos, Função de 1º Grau..."
              className="w-full"
            />
          </div>

          {/* Ano de Escolaridade */}
          <div className="space-y-2">
            <Label htmlFor="anoEscolaridade" className="text-sm font-medium text-gray-700">
              Ano de Escolaridade
            </Label>
            <Select value={formData.anoEscolaridade} onValueChange={(value) => handleInputChange('anoEscolaridade', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o ano de escolaridade" />
              </SelectTrigger>
              <SelectContent>
                {anoOptions.map((ano) => (
                  <SelectItem key={ano} value={ano}>
                    {ano}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Número de Questões */}
          <div className="space-y-2">
            <Label htmlFor="numeroQuestoes" className="text-sm font-medium text-gray-700">
              Número de Questões
            </Label>
            <Input
              id="numeroQuestoes"
              type="number"
              value={formData.numeroQuestoes}
              onChange={(e) => handleInputChange('numeroQuestoes', e.target.value)}
              placeholder="Ex: 10, 20, 30..."
              className="w-full"
              min="1"
              max="100"
            />
          </div>

          {/* Nível de Dificuldade */}
          <div className="space-y-2">
            <Label htmlFor="nivelDificuldade" className="text-sm font-medium text-gray-700">
              Nível de Dificuldade
            </Label>
            <Select value={formData.nivelDificuldade} onValueChange={(value) => handleInputChange('nivelDificuldade', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o nível de dificuldade" />
              </SelectTrigger>
              <SelectContent>
                {nivelDificuldadeOptions.map((nivel) => (
                  <SelectItem key={nivel} value={nivel}>
                    {nivel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Modelo de Questões */}
          <div className="space-y-2">
            <Label htmlFor="modeloQuestoes" className="text-sm font-medium text-gray-700">
              Modelo de Questões
            </Label>
            <Select value={formData.modeloQuestoes} onValueChange={(value) => handleInputChange('modeloQuestoes', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o modelo de questões" />
              </SelectTrigger>
              <SelectContent>
                {modeloQuestoesOptions.map((modelo) => (
                  <SelectItem key={modelo} value={modelo}>
                    {modelo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fontes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Fontes
            </Label>

            {/* Lista de fontes adicionadas */}
            {formData.fontes.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.fontes.map((fonte, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {fonte}
                    <button
                      onClick={() => handleRemoveFonte(index)}
                      className="ml-1 text-gray-500 hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Campo para adicionar nova fonte */}
            <div className="flex gap-2">
              <Input
                value={newFonte}
                onChange={(e) => setNewFonte(e.target.value)}
                placeholder="Ex: Livro didático, Site educacional, Artigo..."
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFonte();
                  }
                }}
              />
              <Button
                onClick={handleAddFonte}
                variant="outline"
                size="sm"
                className="px-3"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex justify-end gap-3 p-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditActivityModal;