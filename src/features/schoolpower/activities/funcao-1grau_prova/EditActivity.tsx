
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface EditActivityProps {
  data: any;
  onChange: (data: any) => void;
}

export default function EditActivity({ data = {}, onChange }: EditActivityProps) {
  const handleChange = (field: string, value: any) => {
    onChange({ [field]: value });
  };

  const addQuestion = () => {
    const questions = data.questions || [];
    const newQuestion = {
      id: Date.now(),
      type: 'multipla_escolha',
      enunciado: '',
      alternativas: ['', '', '', ''],
      resposta_correta: 0,
      pontuacao: 1
    };
    handleChange('questions', [...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    const questions = [...(data.questions || [])];
    questions.splice(index, 1);
    handleChange('questions', questions);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const questions = [...(data.questions || [])];
    questions[index] = { ...questions[index], [field]: value };
    handleChange('questions', questions);
  };

  const updateAlternative = (questionIndex: number, altIndex: number, value: string) => {
    const questions = [...(data.questions || [])];
    questions[questionIndex].alternativas[altIndex] = value;
    handleChange('questions', questions);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configurações da Prova</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Título da Prova</Label>
            <Input
              id="title"
              value={data.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Prova de Função do 1º Grau"
            />
          </div>

          <div>
            <Label htmlFor="instructions">Instruções Gerais</Label>
            <Textarea
              id="instructions"
              value={data.instructions || ''}
              onChange={(e) => handleChange('instructions', e.target.value)}
              placeholder="Leia atentamente cada questão e marque a alternativa correta..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="time_limit">Tempo Limite (minutos)</Label>
              <Input
                id="time_limit"
                type="number"
                value={data.time_limit || ''}
                onChange={(e) => handleChange('time_limit', e.target.value)}
                placeholder="60"
              />
            </div>

            <div>
              <Label htmlFor="total_score">Pontuação Total</Label>
              <Input
                id="total_score"
                type="number"
                value={data.total_score || ''}
                onChange={(e) => handleChange('total_score', e.target.value)}
                placeholder="10"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="shuffle_questions"
              checked={data.shuffle_questions || false}
              onCheckedChange={(checked) => handleChange('shuffle_questions', checked)}
            />
            <Label htmlFor="shuffle_questions">Embaralhar questões</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="show_results"
              checked={data.show_results || false}
              onCheckedChange={(checked) => handleChange('show_results', checked)}
            />
            <Label htmlFor="show_results">Mostrar resultados imediatamente</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Questões</CardTitle>
          <Button
            onClick={addQuestion}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar Questão
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {(data.questions || []).map((question: any, index: number) => (
            <Card key={question.id || index} className="border border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Questão {index + 1}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Enunciado</Label>
                  <Textarea
                    value={question.enunciado || ''}
                    onChange={(e) => updateQuestion(index, 'enunciado', e.target.value)}
                    placeholder="Digite o enunciado da questão..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Tipo de Questão</Label>
                  <Select
                    value={question.type || 'multipla_escolha'}
                    onValueChange={(value) => updateQuestion(index, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multipla_escolha">Múltipla Escolha</SelectItem>
                      <SelectItem value="verdadeiro_falso">Verdadeiro/Falso</SelectItem>
                      <SelectItem value="dissertativa">Dissertativa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {question.type === 'multipla_escolha' && (
                  <div className="space-y-2">
                    <Label>Alternativas</Label>
                    {question.alternativas?.map((alt: string, altIndex: number) => (
                      <div key={altIndex} className="flex items-center gap-2">
                        <span className="text-sm font-medium w-6">
                          {String.fromCharCode(65 + altIndex)})
                        </span>
                        <Input
                          value={alt}
                          onChange={(e) => updateAlternative(index, altIndex, e.target.value)}
                          placeholder={`Alternativa ${String.fromCharCode(65 + altIndex)}`}
                        />
                        <input
                          type="radio"
                          name={`correct_${index}`}
                          checked={question.resposta_correta === altIndex}
                          onChange={() => updateQuestion(index, 'resposta_correta', altIndex)}
                          className="text-[#FF6B00]"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <Label>Pontuação</Label>
                  <Input
                    type="number"
                    value={question.pontuacao || 1}
                    onChange={(e) => updateQuestion(index, 'pontuacao', parseInt(e.target.value))}
                    className="w-20"
                    min="1"
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          {(!data.questions || data.questions.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma questão adicionada ainda. Clique em "Adicionar Questão" para começar.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
