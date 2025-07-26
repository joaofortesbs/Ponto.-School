
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileText, Plus, Trash2 } from 'lucide-react';

interface Question {
  id: string;
  type: 'multiple_choice' | 'open' | 'true_false';
  statement: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
}

interface ProvaData {
  title: string;
  description: string;
  subject: string;
  duration: number;
  totalPoints: number;
  instructions: string;
  questions: Question[];
}

interface EditActivityProps {
  data: Partial<ProvaData>;
  onChange: (data: Partial<ProvaData>) => void;
}

export default function EditActivity({ data, onChange }: EditActivityProps) {
  const [formData, setFormData] = useState<ProvaData>({
    title: data.title || 'Prova - Funções do 1° Grau',
    description: data.description || 'Prova abrangendo funções do primeiro grau, Teorema de Pitágoras e números racionais.',
    subject: data.subject || 'Matemática',
    duration: data.duration || 120,
    totalPoints: data.totalPoints || 100,
    instructions: data.instructions || 'Leia atentamente todas as questões antes de responder. Use caneta azul ou preta.',
    questions: data.questions || []
  });

  const updateField = (field: keyof ProvaData, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange(newData);
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      type: 'multiple_choice',
      statement: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 10
    };
    updateField('questions', [...formData.questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    updateField('questions', updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    updateField('questions', updatedQuestions);
  };

  useEffect(() => {
    onChange(formData);
  }, []);

  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Informações da Prova
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Título da Prova</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Digite o título da prova"
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Descreva o conteúdo da prova"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject">Disciplina</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => updateField('subject', e.target.value)}
                placeholder="Ex: Matemática"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => updateField('duration', parseInt(e.target.value) || 0)}
                placeholder="120"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="instructions">Instruções</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => updateField('instructions', e.target.value)}
              placeholder="Instruções para os alunos"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Questões */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Questões ({formData.questions.length})</CardTitle>
            <Button onClick={addQuestion} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Questão
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.questions.map((question, index) => (
            <Card key={question.id} className="border-l-4 border-l-blue-500">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Questão {index + 1}</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeQuestion(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Label>Tipo da Questão</Label>
                      <Select
                        value={question.type}
                        onValueChange={(value) => updateQuestion(index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                          <SelectItem value="open">Dissertativa</SelectItem>
                          <SelectItem value="true_false">Verdadeiro/Falso</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Pontos</Label>
                      <Input
                        type="number"
                        value={question.points}
                        onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value) || 0)}
                        placeholder="10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Enunciado</Label>
                    <Textarea
                      value={question.statement}
                      onChange={(e) => updateQuestion(index, 'statement', e.target.value)}
                      placeholder="Digite o enunciado da questão"
                      rows={3}
                    />
                  </div>

                  {question.type === 'multiple_choice' && (
                    <div>
                      <Label>Alternativas</Label>
                      <div className="space-y-2">
                        {question.options?.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <Input
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...(question.options || [])];
                                newOptions[optIndex] = e.target.value;
                                updateQuestion(index, 'options', newOptions);
                              }}
                              placeholder={`Alternativa ${String.fromCharCode(65 + optIndex)}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {formData.questions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma questão adicionada ainda.</p>
              <p className="text-sm">Clique em "Adicionar Questão" para começar.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
