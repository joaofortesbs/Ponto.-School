
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Save, Eye } from 'lucide-react';

interface Exercise {
  id: string;
  type: 'multiple-choice' | 'open' | 'true-false';
  question: string;
  options?: string[];
  answer: string;
  points: number;
}

interface EditActivityProps {
  activityData?: any;
  onSave?: (data: any) => void;
  onPreview?: () => void;
}

export default function EditActivity({ activityData, onSave, onPreview }: EditActivityProps) {
  const [formData, setFormData] = useState({
    title: activityData?.title || 'Lista de Exercícios - Funções do 1° Grau',
    description: activityData?.description || 'Lista com exercícios variados sobre funções do primeiro grau',
    subject: 'Matemática',
    grade: '1º Ano do Ensino Médio',
    duration: '50 minutos',
    difficulty: 'Intermediário',
    exercises: [] as Exercise[],
  });

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      type: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      answer: '',
      points: 1,
    };
    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));
  };

  const removeExercise = (id: string) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.id !== id)
    }));
  };

  const updateExercise = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => 
        ex.id === id ? { ...ex, [field]: value } : ex
      )
    }));
  };

  const handleSave = () => {
    console.log('💾 Salvando lista de exercícios:', formData);
    onSave?.(formData);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📝 Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Título da Lista</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Digite o título da lista de exercícios"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o objetivo e conteúdo da lista"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duração Estimada</Label>
              <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30 minutos">30 minutos</SelectItem>
                  <SelectItem value="50 minutos">50 minutos</SelectItem>
                  <SelectItem value="1 hora">1 hora</SelectItem>
                  <SelectItem value="1h30min">1h30min</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="difficulty">Nível de Dificuldade</Label>
              <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Básico">Básico</SelectItem>
                  <SelectItem value="Intermediário">Intermediário</SelectItem>
                  <SelectItem value="Avançado">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercícios */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            🎯 Exercícios ({formData.exercises.length})
          </CardTitle>
          <Button onClick={addExercise} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Exercício
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.exercises.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum exercício adicionado ainda.</p>
              <p className="text-sm">Clique em "Adicionar Exercício" para começar.</p>
            </div>
          ) : (
            formData.exercises.map((exercise, index) => (
              <Card key={exercise.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Exercício {index + 1}</Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeExercise(exercise.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Pergunta</Label>
                    <Textarea
                      value={exercise.question}
                      onChange={(e) => updateExercise(exercise.id, 'question', e.target.value)}
                      placeholder="Digite a pergunta do exercício"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo de Questão</Label>
                      <Select 
                        value={exercise.type} 
                        onValueChange={(value) => updateExercise(exercise.id, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple-choice">Múltipla Escolha</SelectItem>
                          <SelectItem value="open">Questão Aberta</SelectItem>
                          <SelectItem value="true-false">Verdadeiro/Falso</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Pontuação</Label>
                      <Input
                        type="number"
                        value={exercise.points}
                        onChange={(e) => updateExercise(exercise.id, 'points', parseInt(e.target.value) || 1)}
                        min="1"
                        max="10"
                      />
                    </div>
                  </div>

                  {exercise.type === 'multiple-choice' && (
                    <div>
                      <Label>Alternativas</Label>
                      <div className="space-y-2">
                        {exercise.options?.map((option, optIndex) => (
                          <Input
                            key={optIndex}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(exercise.options || [])];
                              newOptions[optIndex] = e.target.value;
                              updateExercise(exercise.id, 'options', newOptions);
                            }}
                            placeholder={`Alternativa ${String.fromCharCode(65 + optIndex)}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Resposta Correta</Label>
                    <Input
                      value={exercise.answer}
                      onChange={(e) => updateExercise(exercise.id, 'answer', e.target.value)}
                      placeholder="Digite a resposta correta"
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex gap-4 justify-end">
        <Button variant="outline" onClick={onPreview}>
          <Eye className="w-4 h-4 mr-2" />
          Visualizar
        </Button>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Salvar Lista
        </Button>
      </div>
    </div>
  );
}
