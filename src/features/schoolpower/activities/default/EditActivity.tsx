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
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Informações Básicas */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Informações da Atividade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 overflow-hidden max-w-full">
          <div className="w-full">
            <Label htmlFor="activity-title">Título</Label>
            <Input
              id="activity-title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Digite o título da atividade"
              className="w-full max-w-full"
            />
          </div>

          <div className="w-full">
            <Label htmlFor="activity-description">Descrição</Label>
            <Textarea
              id="activity-description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descreva brevemente a atividade"
              rows={3}
              className="w-full max-w-full resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="w-full">
              <Label htmlFor="difficulty">Dificuldade</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => handleChange('difficulty', value)}
              >
                <SelectTrigger className="w-full max-w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fácil">Fácil</SelectItem>
                  <SelectItem value="Médio">Médio</SelectItem>
                  <SelectItem value="Difícil">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full">
              <Label htmlFor="time-limit">Tempo Limite (minutos)</Label>
              <Input
                id="time-limit"
                type="number"
                value={formData.timeLimit}
                onChange={(e) => handleChange('timeLimit', e.target.value)}
                placeholder="Ex: 60"
                className="w-full max-w-full"
              />
            </div>
          </div>

          <div className="w-full">
            <Label htmlFor="instructions">Instruções</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => handleChange('instructions', e.target.value)}
              placeholder="Instruções detalhadas para os alunos"
              rows={4}
              className="w-full max-w-full resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Materiais */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Materiais Necessários</span>
            <Button variant="outline" size="sm" onClick={addMaterial}>
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden max-w-full">
          <div className="space-y-2">
            {formData.materials.map((material: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={material}
                  onChange={(e) => updateMaterial(index, e.target.value)}
                  placeholder="Nome do material"
                  className="flex-1 max-w-full"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeMaterial(index)}
                  className="flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {formData.materials.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                Nenhum material adicionado. Clique em "Adicionar" para incluir materiais.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Questões */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Questões da Atividade</span>
            <Button variant="outline" size="sm" onClick={addQuestion}>
              <Plus className="w-4 h-4 mr-1" />
              Nova Questão
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <div className="space-y-4">
            {formData.questions.map((question: any, index: number) => (
              <Card key={question.id || index} className="border-dashed">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Badge variant="outline">Questão {index + 1}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Enunciado</Label>
                    <Textarea
                      value={question.text}
                      onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                      placeholder="Digite o enunciado da questão"
                      rows={2}
                      className="w-full max-w-full resize-none"
                    />
                  </div>

                  <div>
                    <Label>Tipo de Questão</Label>
                    <Select
                      value={question.type}
                      onValueChange={(value) => updateQuestion(index, 'type', value)}
                    >
                      <SelectTrigger className="w-full max-w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple-choice">Múltipla Escolha</SelectItem>
                        <SelectItem value="true-false">Verdadeiro/Falso</SelectItem>
                        <SelectItem value="essay">Dissertativa</SelectItem>
                        <SelectItem value="fill-blank">Completar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {question.type === 'multiple-choice' && (
                    <div>
                      <Label>Alternativas</Label>
                      <div className="space-y-2">
                        {question.options?.map((option: string, optIndex: number) => (
                          <div key={optIndex} className="flex items-center space-x-2">
                            <Input
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...question.options];
                                newOptions[optIndex] = e.target.value;
                                updateQuestion(index, 'options', newOptions);
                              }}
                              placeholder={`Alternativa ${String.fromCharCode(65 + optIndex)}`}
                              className="flex-1 max-w-full"
                            />
                            <Checkbox
                              checked={question.correctAnswer === optIndex}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  updateQuestion(index, 'correctAnswer', optIndex);
                                }
                              }}
                              className="flex-shrink-0"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Explicação/Gabarito</Label>
                    <Textarea
                      value={question.explanation}
                      onChange={(e) => updateQuestion(index, 'explanation', e.target.value)}
                      placeholder="Explicação da resposta correta"
                      rows={2}
                      className="w-full max-w-full resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            {formData.questions.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  Nenhuma questão adicionada
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Clique em "Nova Questão" para começar a criar as questões da atividade
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rubrica de Avaliação */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Critérios de Avaliação</CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden max-w-full">
          <Textarea
            value={formData.rubric}
            onChange={(e) => handleChange('rubric', e.target.value)}
            placeholder="Descreva como a atividade será avaliada..."
            rows={4}
            className="w-full max-w-full resize-none"
          />
        </CardContent>
      </Card>
    </div>
  );
}