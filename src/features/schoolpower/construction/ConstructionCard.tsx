import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle2, 
  Eye, 
  Edit3,
  FileText,
  BookOpen,
  Calculator,
  Gamepad2,
  Users,
  PenTool,
  Presentation,
  Brain,
  Target,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressCircle } from './ProgressCircle';
import schoolPowerActivitiesData from '../data/schoolPowerActivities.json';

interface ConstructionActivityProps {
  id: string;
  title: string;
  description: string;
  progress: number;
  type: string;
  status: 'draft' | 'in-progress' | 'completed' | 'pending';
  onEdit: () => void;
  onView: (activityData?: any) => void;
  onShare: (activityId: string) => void;
}

// Mapeamento de ícones por tipo de atividade
const getActivityIcon = (activityId: string) => {
  const iconMap: { [key: string]: any } = {
    'lista-exercicios': Calculator,
    'plano-aula': BookOpen,
    'sequencia-didatica': Presentation,
    'quiz-interativo': Gamepad2,
    'quadro-interativo': Brain,
    'atividade-criterios-avaliacao': Target,
    'atividade-exemplos-contextualizados': FileText,
    'atividade-jogos-educativos': Gamepad2,
    'atividade-mapa-mental': Brain,
    'atividade-proposta-redacao': PenTool,
    'atividade-prova': FileText,
    'atividade-resumo': BookOpen,
    'atividade-texto-apoio': FileText,
    'default': Zap
  };

  return iconMap[activityId] || iconMap['default'];
};

const getActivityNameById = (activityId: string): string => {
  const activity = schoolPowerActivitiesData.find(act => act.id === activityId);
  return activity ? activity.name : activityId;
};

// Função para truncar descrição em até 5 palavras
const truncateDescription = (description: string, maxWords: number = 5): string => {
  const words = description.split(' ');
  if (words.length <= maxWords) return description;
  return words.slice(0, maxWords).join(' ') + '...';
};

export function ConstructionCard({
  id,
  title,
  description,
  progress,
  type,
  status,
  onView,
  onShare,
  onEdit
}: ConstructionActivityProps) {
  const isCompleted = status === 'completed' || progress >= 100;
  const ActivityIcon = getActivityIcon(id);
  const activityName = getActivityNameById(id);

  // Cores baseadas no status
  const cardTheme = isCompleted ? {
    borderColor: 'border-green-200',
    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
    iconBg: 'bg-green-500',
    iconColor: 'text-white',
    titleColor: 'text-green-800',
    descColor: 'text-green-600',
    buttonStyle: 'bg-green-500 hover:bg-green-600 text-white'
  } : {
    borderColor: 'border-orange-200',
    bgColor: 'bg-gradient-to-br from-orange-50 to-amber-50',
    iconBg: 'bg-orange-500',
    iconColor: 'text-white',
    titleColor: 'text-orange-800',
    descColor: 'text-orange-600',
    buttonStyle: 'bg-orange-500 hover:bg-orange-600 text-white'
  };

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative overflow-hidden rounded-2xl border-2 ${cardTheme.borderColor}
        ${cardTheme.bgColor} p-6 transition-all duration-300
        hover:shadow-lg cursor-pointer group
      `}
    >
      {/* Botões de ação - só aparecem quando construído */}
      {isCompleted && (
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            className={`h-8 w-8 p-0 rounded-lg ${cardTheme.buttonStyle} shadow-md hover:shadow-lg transition-all`}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className={`h-8 w-8 p-0 rounded-lg ${cardTheme.buttonStyle} shadow-md hover:shadow-lg transition-all`}
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Conteúdo principal do card */}
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Ícone da atividade */}
        <div className={`
          relative w-16 h-16 rounded-2xl ${cardTheme.iconBg} 
          flex items-center justify-center shadow-lg
          group-hover:scale-110 transition-transform duration-300
        `}>
          <ActivityIcon className={`h-8 w-8 ${cardTheme.iconColor}`} />

          {/* Indicador de progresso no ícone */}
          {!isCompleted && progress > 0 && (
            <div className="absolute -bottom-1 -right-1">
              <ProgressCircle progress={progress} size={20} />
            </div>
          )}

          {/* Indicador de conclusão */}
          {isCompleted && (
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            </div>
          )}
        </div>

        {/* Nome da atividade */}
        <h3 className={`
          text-lg font-bold ${cardTheme.titleColor} 
          leading-tight max-w-full
        `}>
          {activityName}
        </h3>

        {/* Descrição limitada */}
        <p className={`
          text-sm ${cardTheme.descColor} 
          leading-relaxed min-h-[2.5rem] flex items-center
        `}>
          {truncateDescription(description)}
        </p>

        {/* Status badge */}
        <div className="w-full flex justify-center">
          {isCompleted ? (
            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Construída
            </Badge>
          ) : progress > 0 ? (
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
              <Clock className="h-3 w-3 mr-1" />
              Em Progresso
            </Badge>
          ) : (
            <Badge variant="outline" className="border-orange-200 text-orange-700">
              <Clock className="h-3 w-3 mr-1" />
              Pendente
            </Badge>
          )}
        </div>
      </div>

      {/* Efeito de brilho no hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
    </motion.div>
  );
}