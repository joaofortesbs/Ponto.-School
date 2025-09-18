
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
    <div className="universal-activity-header w-full h-28 bg-gradient-to-r from-orange-50 via-white to-orange-50 dark:from-orange-950/20 dark:via-gray-800 dark:to-orange-950/20 border-b-2 border-orange-200 dark:border-orange-800/50 px-6 py-5 shadow-sm">
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
              <Avatar className="w-5 h-5 rounded-xl">
                <AvatarImage src={userAvatar} alt={`Prof. ${userName}`} />
                <AvatarFallback className="text-xs bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl">
                  {getUserInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                Prof. {userName}
              </span>
            </div>
          </div>
        </div>

        {/* Lado Direito - Controles */}
        <div className="flex items-center gap-3">
          {/* Card de Trilha */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 rounded-xl px-3 py-2 border border-orange-200 dark:border-orange-700/50 shadow-sm">
            <Route className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>

          {/* Card de School Points */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 rounded-xl px-3 py-2 border border-orange-200 dark:border-orange-700/50 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                {schoolPoints} SPs
              </span>
              <Pencil className="w-3 h-3 text-orange-600 dark:text-orange-400" />
            </div>
          </div>

          {/* Botão de Mais Opções */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMoreOptions}
            className="w-10 h-10 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-700/50 shadow-sm"
          >
            <MoreHorizontal className="w-5 h-5 rotate-90" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UniversalActivityHeader;
