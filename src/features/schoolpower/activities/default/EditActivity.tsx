import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Trash2 } from 'lucide-react';

interface EditActivityProps {
  activityData?: any;
  activityId?: string;
  onChange?: (data: any) => void;
}

export default function EditActivity({ activityData, activityId, onChange }: EditActivityProps) {
  const [formData, setFormData] = React.useState({
    title: activityData?.title || '',
    description: activityData?.description || '',
    instructions: activityData?.instructions || '',
    materials: activityData?.materials || [],
    questions: activityData?.questions || [],
    rubric: activityData?.rubric || '',
    timeLimit: activityData?.timeLimit || '',
    difficulty: activityData?.difficulty || 'Médio',
    tags: activityData?.tags || [],
    ...activityData
  });

  const handleChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange?.(newData);
  };

  const addQuestion = () => {
    const newQuestions = [...formData.questions, {
      id: Date.now().toString(),
      text: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    }];
    handleChange('questions', newQuestions);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    handleChange('questions', newQuestions);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    handleChange('questions', newQuestions);
  };

  const addMaterial = () => {
    handleChange('materials', [...formData.materials, '']);
  };

  const updateMaterial = (index: number, value: string) => {
    const newMaterials = [...formData.materials];
    newMaterials[index] = value;
    handleChange('materials', newMaterials);
  };

  const removeMaterial = (index: number) => {
    const newMaterials = formData.materials.filter((_, i) => i !== index);
    handleChange('materials', newMaterials);
  };

  return (
    <div className="space-y-3 overflow-hidden" style={{ height: '450px', maxHeight: '450px', minHeight: '450px' }}>
      {/* Informações Básicas - Compacto */}
      <div className="space-y-2 p-3 border rounded-lg bg-white/50 dark:bg-gray-800/50">
        <h3 className="text-sm font-medium flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Informações da Atividade
        </h3>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="activity-title" className="text-xs">Título</Label>
            <Input
              id="activity-title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Título da atividade"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="difficulty" className="text-xs">Dificuldade</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) => handleChange('difficulty', value)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fácil">Fácil</SelectItem>
                <SelectItem value="Médio">Médio</SelectItem>
                <SelectItem value="Difícil">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="activity-description" className="text-xs">Descrição</Label>
          <Textarea
            id="activity-description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Descrição breve"
            rows={2}
            className="resize-none text-sm"
          />
        </div>
      </div>

      {/* Configurações Rápidas */}
      <div className="space-y-2 p-3 border rounded-lg bg-white/50 dark:bg-gray-800/50">
        <h3 className="text-sm font-medium">Configurações</h3>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="time-limit" className="text-xs">Tempo (min)</Label>
            <Input
              id="time-limit"
              type="number"
              value={formData.timeLimit}
              onChange={(e) => handleChange('timeLimit', e.target.value)}
              placeholder="60"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Materiais</Label>
            <div className="flex">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addMaterial}
                className="h-8 text-xs px-2"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
              <span className="ml-2 text-xs text-gray-500 flex items-center">
                {formData.materials.length} item(s)
              </span>
            </div>
          </div>
        </div>

        {formData.materials.length > 0 && (
          <div className="max-h-20 overflow-y-auto space-y-1">
            {formData.materials.map((material: string, index: number) => (
              <div key={index} className="flex items-center space-x-1">
                <Input
                  value={material}
                  onChange={(e) => updateMaterial(index, e.target.value)}
                  placeholder="Material"
                  className="flex-1 h-7 text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeMaterial(index)}
                  className="h-7 w-7 p-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Questões Compactas */}
      <div className="space-y-2 p-3 border rounded-lg bg-white/50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Questões</h3>
          <Button variant="outline" size="sm" onClick={addQuestion} className="h-7 text-xs px-2">
            <Plus className="w-3 h-3 mr-1" />
            Nova
          </Button>
        </div>

        {formData.questions.length > 0 ? (
          <div className="max-h-32 overflow-y-auto space-y-2">
            {formData.questions.map((question: any, index: number) => (
              <div key={question.id || index} className="border border-dashed rounded p-2">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-xs">Q{index + 1}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(index)}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <Input
                  value={question.text}
                  onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                  placeholder="Enunciado da questão"
                  className="h-7 text-xs mb-1"
                />
                <Select
                  value={question.type}
                  onValueChange={(value) => updateQuestion(index, 'type', value)}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple-choice">Múltipla Escolha</SelectItem>
                    <SelectItem value="true-false">V/F</SelectItem>
                    <SelectItem value="essay">Dissertativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 border-dashed border-2 rounded">
            <p className="text-xs text-gray-500">Nenhuma questão adicionada</p>
          </div>
        )}
      </div>
    </div>
  );
}