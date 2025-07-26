
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, BookOpen, User } from 'lucide-react';

interface ActivityPreviewProps {
  data: any;
}

export default function ActivityPreview({ data = {} }: ActivityPreviewProps) {
  const getDifficultyColor = (difficulty: string = 'medio') => {
    switch (difficulty) {
      case 'facil': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'dificil': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  const getCategoryIcon = (category: string = 'exercicio') => {
    switch (category) {
      case 'prova': return <Star className="w-4 h-4" />;
      case 'jogo': return <User className="w-4 h-4" />;
      case 'projeto': return <BookOpen className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-[#FF6B00]/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                {data.title || 'Título da Atividade'}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {data.description || 'Descrição da atividade aparecerá aqui...'}
              </p>
            </div>
            <Badge className={getDifficultyColor(data.difficulty)}>
              {data.difficulty === 'facil' ? 'Fácil' : 
               data.difficulty === 'dificil' ? 'Difícil' : 'Médio'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{data.duration || '30'} min</span>
            </div>
            <div className="flex items-center gap-1">
              {getCategoryIcon(data.category)}
              <span className="capitalize">
                {data.category || 'Exercício'}
              </span>
            </div>
          </div>

          {data.instructions && (
            <div className="border-l-4 border-[#FF6B00] pl-4 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-r">
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                Instruções:
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {data.instructions}
              </p>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
              A visualização específica da atividade aparecerá aqui
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
