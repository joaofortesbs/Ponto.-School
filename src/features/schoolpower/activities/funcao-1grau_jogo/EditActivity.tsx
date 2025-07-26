
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

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
          <CardTitle className="text-base">Configurações do Jogo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="game_title">Nome do Jogo</Label>
            <Input
              id="game_title"
              value={data.game_title || ''}
              onChange={(e) => handleChange('game_title', e.target.value)}
              placeholder="Aventura das Funções"
            />
          </div>

          <div>
            <Label htmlFor="game_description">Descrição do Jogo</Label>
            <Textarea
              id="game_description"
              value={data.game_description || ''}
              onChange={(e) => handleChange('game_description', e.target.value)}
              placeholder="Um jogo educativo para aprender funções do 1º grau de forma divertida..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="game_type">Tipo de Jogo</Label>
            <Select
              value={data.game_type || 'quiz'}
              onValueChange={(value) => handleChange('game_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quiz">Quiz Interativo</SelectItem>
                <SelectItem value="drag_drop">Arrastar e Soltar</SelectItem>
                <SelectItem value="matching">Associação</SelectItem>
                <SelectItem value="puzzle">Quebra-cabeça</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="character">Personagem Principal</Label>
            <Select
              value={data.character || 'matemático'}
              onValueChange={(value) => handleChange('character', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolha um personagem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="matemático">Professor Matemático</SelectItem>
                <SelectItem value="explorador">Explorador de Funções</SelectItem>
                <SelectItem value="robô">Robô Calculadora</SelectItem>
                <SelectItem value="mago">Mago dos Números</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mecânicas do Jogo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Número de Fases: {data.phases || 5}</Label>
            <Slider
              value={[data.phases || 5]}
              onValueChange={(value) => handleChange('phases', value[0])}
              max={15}
              min={3}
              step={1}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>3 fases</span>
              <span>15 fases</span>
            </div>
          </div>

          <div>
            <Label>Dificuldade Progressiva: {data.difficulty_progression || 50}%</Label>
            <Slider
              value={[data.difficulty_progression || 50]}
              onValueChange={(value) => handleChange('difficulty_progression', value[0])}
              max={100}
              min={0}
              step={10}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Fácil</span>
              <span>Muito Difícil</span>
            </div>
          </div>

          <div>
            <Label htmlFor="scoring_system">Sistema de Pontuação</Label>
            <Select
              value={data.scoring_system || 'stars'}
              onValueChange={(value) => handleChange('scoring_system', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sistema de pontos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stars">Estrelas (1-3)</SelectItem>
                <SelectItem value="points">Pontos Numéricos</SelectItem>
                <SelectItem value="medals">Medalhas</SelectItem>
                <SelectItem value="progress">Barra de Progresso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="enable_hints"
                checked={data.enable_hints || false}
                onCheckedChange={(checked) => handleChange('enable_hints', checked)}
              />
              <Label htmlFor="enable_hints">Ativar Dicas</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="enable_timer"
                checked={data.enable_timer || false}
                onCheckedChange={(checked) => handleChange('enable_timer', checked)}
              />
              <Label htmlFor="enable_timer">Cronômetro por Fase</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="multiplayer"
                checked={data.multiplayer || false}
                onCheckedChange={(checked) => handleChange('multiplayer', checked)}
              />
              <Label htmlFor="multiplayer">Modo Multiplayer</Label>
            </div>
          </div>

          {data.enable_timer && (
            <div>
              <Label htmlFor="time_per_phase">Tempo por Fase (segundos)</Label>
              <Input
                id="time_per_phase"
                type="number"
                value={data.time_per_phase || '60'}
                onChange={(e) => handleChange('time_per_phase', e.target.value)}
                placeholder="60"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conteúdo Educacional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="learning_objectives">Objetivos de Aprendizagem</Label>
            <Textarea
              id="learning_objectives"
              value={data.learning_objectives || ''}
              onChange={(e) => handleChange('learning_objectives', e.target.value)}
              placeholder="• Identificar coeficientes de funções do 1º grau&#10;• Calcular valores de função&#10;• Interpretar gráficos..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="success_message">Mensagem de Sucesso</Label>
            <Textarea
              id="success_message"
              value={data.success_message || ''}
              onChange={(e) => handleChange('success_message', e.target.value)}
              placeholder="Parabéns! Você dominou as funções do 1º grau!"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="failure_message">Mensagem de Incentivo</Label>
            <Textarea
              id="failure_message"
              value={data.failure_message || ''}
              onChange={(e) => handleChange('failure_message', e.target.value)}
              placeholder="Não desista! Tente novamente e você conseguirá!"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
