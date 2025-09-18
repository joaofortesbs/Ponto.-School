
import React from 'react';
import { MoreHorizontal, Pencil, Route } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UniversalActivityHeaderProps {
  activityTitle: string;
  activityIcon: React.ComponentType<{ className?: string }>;
  userName?: string;
  userAvatar?: string;
  onMoreOptions?: () => void;
  schoolPoints?: number;
}

export const UniversalActivityHeader: React.FC<UniversalActivityHeaderProps> = ({
  activityTitle,
  activityIcon: ActivityIcon,
  userName = 'Usuário',
  userAvatar,
  onMoreOptions,
  schoolPoints = 100
}) => {
  // Função para obter as iniciais do nome do usuário
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="universal-activity-header w-full h-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between h-full">
        {/* Lado Esquerdo - Ícone e Informações da Atividade */}
        <div className="flex items-center gap-4">
          {/* Ícone da Atividade */}
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <ActivityIcon className="w-6 h-6 text-white" />
          </div>

          {/* Título e Professor */}
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
              {activityTitle}
            </h1>
            
            {/* Linha do Professor */}
            <div className="flex items-center gap-2 mt-1">
              <Avatar className="w-5 h-5">
                <AvatarImage src={userAvatar} alt={`Prof. ${userName}`} />
                <AvatarFallback className="text-xs bg-gradient-to-r from-orange-400 to-orange-500 text-white">
                  {getUserInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Prof. {userName}
              </span>
            </div>
          </div>
        </div>

        {/* Lado Direito - Controles */}
        <div className="flex items-center gap-3">
          {/* Card de Trilha */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-full px-3 py-2 border border-blue-200 dark:border-blue-700/50">
            <Route className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>

          {/* Card de School Points */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-lg px-3 py-2 border border-green-200 dark:border-green-700/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                {schoolPoints} SPs
              </span>
              <Pencil className="w-3 h-3 text-green-600 dark:text-green-400" />
            </div>
          </div>

          {/* Botão de Mais Opções */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMoreOptions}
            className="w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UniversalActivityHeader;
