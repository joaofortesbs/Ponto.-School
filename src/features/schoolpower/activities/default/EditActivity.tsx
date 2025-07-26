
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EditActivityProps {
  data: any;
  onChange: (data: any) => void;
}

export default function EditActivity({ data = {}, onChange }: EditActivityProps) {
  const handleChange = (field: string, value: any) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Título da Atividade</Label>
            <Input
              id="title"
              value={data.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Digite o título da atividade"
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={data.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descreva a atividade"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="difficulty">Nível de Dificuldade</Label>
            <Select
              value={data.difficulty || 'medio'}
              onValueChange={(value) => handleChange('difficulty', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="facil">Fácil</SelectItem>
                <SelectItem value="medio">Médio</SelectItem>
                <SelectItem value="dificil">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="duration">Duração Estimada (minutos)</Label>
            <Input
              id="duration"
              type="number"
              value={data.duration || ''}
              onChange={(e) => handleChange('duration', e.target.value)}
              placeholder="30"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configurações Específicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="instructions">Instruções para o Aluno</Label>
            <Textarea
              id="instructions"
              value={data.instructions || ''}
              onChange={(e) => handleChange('instructions', e.target.value)}
              placeholder="Digite as instruções específicas para esta atividade"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={data.category || 'exercicio'}
              onValueChange={(value) => handleChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exercicio">Exercício</SelectItem>
                <SelectItem value="prova">Prova</SelectItem>
                <SelectItem value="jogo">Jogo</SelectItem>
                <SelectItem value="projeto">Projeto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
