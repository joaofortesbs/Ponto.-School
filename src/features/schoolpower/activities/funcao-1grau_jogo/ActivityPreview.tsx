
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Star, Clock, Users, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ActivityPreviewProps {
  data: any;
}

export default function ActivityPreview({ data = {} }: ActivityPreviewProps) {
  const getCharacterEmoji = (character: string = 'matemático') => {
    switch (character) {
      case 'explorador': return '🧭';
      case 'robô': return '🤖';
      case 'mago': return '🧙‍♂️';
      default: return '👨‍🏫';
    }
  };

  const getGameTypeLabel = (type: string = 'quiz') => {
    switch (type) {
      case 'drag_drop': return 'Arrastar e Soltar';
      case 'matching': return 'Associação';
      case 'puzzle': return 'Quebra-cabeça';
      default: return 'Quiz Interativo';
    }
  };

  const getScoringIcon = (system: string = 'stars') => {
    switch (system) {
      case 'points': return '💯';
      case 'medals': return '🏅';
      case 'progress': return '📊';
      default: return '⭐';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header do Jogo */}
      <Card className="border-[#FF6B00]/20 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">
                {getCharacterEmoji(data.character)}
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">
                  {data.game_title || 'Aventura das Funções'}
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {data.game_description || 'Um jogo educativo para aprender funções do 1º grau de forma divertida...'}
                </p>
              </div>
            </div>
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              Jogo Educativo
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Play className="w-4 h-4" />
              <span>{getGameTypeLabel(data.game_type)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Target className="w-4 h-4" />
              <span>{data.phases || 5} fases</span>
            </div>
            {data.enable_timer && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{data.time_per_phase || 60}s por fase</span>
              </div>
            )}
            {data.multiplayer && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>Multiplayer</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
            {data.enable_hints && (
              <Badge variant="outline" className="text-xs">
                💡 Dicas disponíveis
              </Badge>
            )}
            {data.enable_timer && (
              <Badge variant="outline" className="text-xs">
                ⏱️ Cronômetro
              </Badge>
            )}
            {data.multiplayer && (
              <Badge variant="outline" className="text-xs">
                👥 Multiplayer
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview das Mecânicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Progressão de Dificuldade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Nível Inicial</span>
                <span>Nível Final</span>
              </div>
              <Progress value={data.difficulty_progression || 50} className="h-2" />
              <p className="text-xs text-gray-500 text-center">
                {data.difficulty_progression || 50}% de incremento
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-lg">{getScoringIcon(data.scoring_system)}</span>
              Sistema de Pontuação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#FF6B00] mb-1">
                {data.scoring_system === 'stars' ? '⭐⭐⭐' :
                 data.scoring_system === 'points' ? '1000' :
                 data.scoring_system === 'medals' ? '🏅' : '100%'}
              </div>
              <p className="text-xs text-gray-500">
                {data.scoring_system === 'stars' ? 'Sistema de Estrelas' :
                 data.scoring_system === 'points' ? 'Pontos Numéricos' :
                 data.scoring_system === 'medals' ? 'Medalhas' : 'Progresso'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Objetivos de Aprendizagem */}
      {data.learning_objectives && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-green-500" />
              Objetivos de Aprendizagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <pre className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap font-sans">
                {data.learning_objectives}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview de Fase do Jogo */}
      <Card className="border-dashed border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <CardContent className="py-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Área de Jogo Interativo
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Aqui será renderizada a interface do jogo com as mecânicas configuradas
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Play className="w-3 h-3" />
                <span>Fase 1/{data.phases || 5}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                <span>0 pontos</span>
              </div>
              {data.enable_timer && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{data.time_per_phase || 60}s</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão de Ação */}
      <Card className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border-purple-200 dark:border-purple-700">
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              Jogo Pronto para Jogar
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {data.phases || 5} fases • {getGameTypeLabel(data.game_type)} • {getCharacterEmoji(data.character)} {data.character || 'Matemático'}
            </p>
          </div>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
            <Play className="w-4 h-4 mr-2" />
            Jogar Agora
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
